#!/usr/bin/env node

import { query } from './server/src/config/database.js';
import Notification from './server/src/models/Notification.js';
import User from './server/src/models/User.js';
import notificationService from './server/src/services/notificationService.js';

async function testNotificationMethods() {
  console.log('🔍 Testing Individual Notification Methods...\n');

  try {
    // Test 1: Test Notification.getNotificationStats()
    console.log('1. Testing Notification.getNotificationStats()...');
    try {
      const stats = await Notification.getNotificationStats();
      console.log('✅ Notification stats retrieved:', stats);
    } catch (error) {
      console.log('❌ Notification stats failed:', error.message);
      console.log('Stack trace:', error.stack);
    }

    // Test 2: Test User.getAll() with filters
    console.log('\n2. Testing User.getAll() with filters...');
    try {
      const users = await User.getAll({ is_active: true });
      console.log('✅ Active users retrieved:', users.length, 'users');
    } catch (error) {
      console.log('❌ User.getAll() failed:', error.message);
      console.log('Stack trace:', error.stack);
    }

    // Test 3: Test User.getAll() for admins
    console.log('\n3. Testing User.getAll() for admin role...');
    try {
      const admins = await User.getAll({ role: 'admin' });
      console.log('✅ Admin users retrieved:', admins.length, 'admins');
    } catch (error) {
      console.log('❌ Admin users retrieval failed:', error.message);
      console.log('Stack trace:', error.stack);
    }

    // Test 4: Test notificationService.notifySystemMaintenance()
    console.log('\n4. Testing notificationService.notifySystemMaintenance()...');
    try {
      const notifications = await notificationService.notifySystemMaintenance(
        'Test system maintenance notification from debug script',
        'low'
      );
      console.log('✅ System maintenance notifications created:', notifications.length, 'notifications');
    } catch (error) {
      console.log('❌ System maintenance notification failed:', error.message);
      console.log('Stack trace:', error.stack);
    }

    // Test 5: Test Notification.createBulk() directly
    console.log('\n5. Testing Notification.createBulk() directly...');
    try {
      // Get a test user first
      const testUsers = await User.getAll({ role: 'admin' });
      if (testUsers.length > 0) {
        const testNotifications = [{
          userId: testUsers[0].id,
          type: 'system',
          title: 'Test Bulk Notification',
          message: 'This is a test bulk notification',
          relatedEntityType: 'system',
          relatedEntityId: null,
          priority: 'low'
        }];
        
        const bulkResult = await Notification.createBulk(testNotifications);
        console.log('✅ Bulk notifications created:', bulkResult.length, 'notifications');
      } else {
        console.log('⚠️ No admin users found for bulk test');
      }
    } catch (error) {
      console.log('❌ Bulk notification creation failed:', error.message);
      console.log('Stack trace:', error.stack);
    }

    // Test 6: Test simple notification creation
    console.log('\n6. Testing simple notification creation...');
    try {
      const testUsers = await User.getAll({ role: 'admin' });
      if (testUsers.length > 0) {
        const simpleNotification = await Notification.create({
          userId: testUsers[0].id,
          type: 'system',
          title: 'Simple Test Notification',
          message: 'This is a simple test notification',
          relatedEntityType: 'system',
          relatedEntityId: null,
          priority: 'low'
        });
        console.log('✅ Simple notification created:', simpleNotification.id);
      } else {
        console.log('⚠️ No admin users found for simple test');
      }
    } catch (error) {
      console.log('❌ Simple notification creation failed:', error.message);
      console.log('Stack trace:', error.stack);
    }

    console.log('\n🎉 Individual method testing completed!');

  } catch (error) {
    console.error('❌ Test failed:', error);
    process.exit(1);
  }
}

// Run the test
testNotificationMethods().catch(console.error);
