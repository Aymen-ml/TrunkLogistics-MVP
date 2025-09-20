#!/usr/bin/env node

import { createSystemNotification, getNotificationStats } from './server/src/controllers/notificationController.js';

async function testControllerDirect() {
  console.log('🔍 Testing Controller Methods Directly...\n');

  try {
    // Mock request and response objects
    const mockReq = {
      user: {
        id: '6e654eaf-3ca9-4b10-847d-1928e48edd3e', // Admin user ID from login
        email: 'korichiaymen27@gmail.com',
        role: 'admin'
      },
      body: {
        message: 'Test system notification from direct controller test',
        priority: 'low'
      }
    };

    const mockRes = {
      status: function(code) {
        this.statusCode = code;
        return this;
      },
      json: function(data) {
        this.responseData = data;
        return this;
      }
    };

    // Test 1: Test getNotificationStats controller directly
    console.log('1. Testing getNotificationStats controller directly...');
    try {
      const statsRes = { ...mockRes };
      await getNotificationStats(mockReq, statsRes);
      
      if (statsRes.responseData && statsRes.responseData.success) {
        console.log('✅ getNotificationStats controller works:', statsRes.responseData);
      } else {
        console.log('❌ getNotificationStats controller failed:', statsRes.responseData);
      }
    } catch (error) {
      console.log('❌ getNotificationStats controller threw error:', error.message);
      console.log('Stack trace:', error.stack);
    }

    // Test 2: Test createSystemNotification controller directly
    console.log('\n2. Testing createSystemNotification controller directly...');
    try {
      const createRes = { ...mockRes };
      
      // Mock validationResult to return no errors
      const originalValidationResult = (await import('express-validator')).validationResult;
      const mockValidationResult = () => ({
        isEmpty: () => true,
        array: () => []
      });
      
      // Temporarily replace validationResult
      const expressValidator = await import('express-validator');
      expressValidator.validationResult = mockValidationResult;
      
      await createSystemNotification(mockReq, createRes);
      
      // Restore original validationResult
      expressValidator.validationResult = originalValidationResult;
      
      if (createRes.responseData && createRes.responseData.success) {
        console.log('✅ createSystemNotification controller works:', createRes.responseData);
      } else {
        console.log('❌ createSystemNotification controller failed:', createRes.responseData);
      }
    } catch (error) {
      console.log('❌ createSystemNotification controller threw error:', error.message);
      console.log('Stack trace:', error.stack);
    }

    console.log('\n🎉 Direct controller testing completed!');

  } catch (error) {
    console.error('❌ Test failed:', error);
    process.exit(1);
  }
}

// Run the test
testControllerDirect().catch(console.error);
