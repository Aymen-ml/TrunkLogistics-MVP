#!/usr/bin/env node

import notificationService from './server/src/services/notificationService.js';
import Notification from './server/src/models/Notification.js';
import User from './server/src/models/User.js';

async function testNotificationCreationDirect() {
  console.log('🔍 Testing Notification Creation Directly...\n');
  
  try {
    // Test 1: Get all users to see if that works
    console.log('1. Testing User.getAll()...');
    try {
      const allUsers = await User.getAll();
      console.log('✅ User.getAll() works, found', allUsers.length, 'users');
    } catch (error) {
      console.log('❌ User.getAll() failed:', error.message);
      console.log('   Stack:', error.stack);
    }
    
    // Test 2: Get active users specifically
    console.log('\n2. Testing User.getAll({ is_active: true })...');
    try {
      const activeUsers = await User.getAll({ is_active: true });
      console.log('✅ Active users query works, found', activeUsers.length, 'active users');
    } catch (error) {
      console.log('❌ Active users query failed:', error.message);
      console.log('   Stack:', error.stack);
    }
    
    // Test 3: Get notification stats directly
    console.log('\n3. Testing Notification.getNotificationStats()...');
    try {
      const stats = await Notification.getNotificationStats();
      console.log('✅ Notification stats works:', stats);
    } catch (error) {
      console.log('❌ Notification stats failed:', error.message);
      console.log('   Stack:', error.stack);
    }
    
    // Test 4: Create single notification
    console.log('\n4. Testing Notification.create()...');
    try {
      // Get first user
      const users = await User.getAll();
      if (users.length > 0) {
        const testNotification = await Notification.create({
          userId: users[0].id,
          type: 'system',
          title: 'Test Notification',
          message: 'This is a test notification created directly',
          relatedEntityType: 'system',
          relatedEntityId: null,
          priority: 'low'
        });
        console.log('✅ Single notification creation works:', testNotification.id);
      } else {
        console.log('❌ No users found to create notification for');
      }
    } catch (error) {
      console.log('❌ Single notification creation failed:', error.message);
      console.log('   Stack:', error.stack);
    }
    
    // Test 5: Test bulk notification creation
    console.log('\n5. Testing Notification.createBulk()...');
    try {
      const users = await User.getAll({ is_active: true });
      if (users.length > 0) {
        const notifications = users.slice(0, 2).map(user => ({
          userId: user.id,
          type: 'system',
          title: 'Bulk Test Notification',
          message: 'This is a bulk test notification',
          relatedEntityType: 'system',
          relatedEntityId: null,
          priority: 'low'
        }));
        
        const results = await Notification.createBulk(notifications);
        console.log('✅ Bulk notification creation works, created', results.length, 'notifications');
      } else {
        console.log('❌ No active users found for bulk creation');
      }
    } catch (error) {
      console.log('❌ Bulk notification creation failed:', error.message);
      console.log('   Stack:', error.stack);
    }
    
    // Test 6: Test notifySystemMaintenance
    console.log('\n6. Testing notificationService.notifySystemMaintenance()...');
    try {
      const notifications = await notificationService.notifySystemMaintenance(
        'Test system maintenance notification', 
        'low'
      );
      console.log('✅ System maintenance notification works, created', notifications.length, 'notifications');
    } catch (error) {
      console.log('❌ System maintenance notification failed:', error.message);
      console.log('   Stack:', error.stack);
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testNotificationCreationDirect().catch(console.error);