#!/usr/bin/env node

import { getNotificationStats, createSystemNotification } from './server/src/controllers/notificationController.js';

async function debugControllerDirect() {
  console.log('🔍 Debugging Notification Controller Directly...\n');
  
  // Mock request and response objects
  const mockUser = {
    id: 'ff7aa261-caaa-4adc-a28a-b25aefdad9bf',
    email: 'korichiaymen27@gmail.com',
    role: 'admin'
  };
  
  // Test getNotificationStats
  console.log('1. Testing getNotificationStats controller directly...');
  try {
    const mockReq = { user: mockUser };
    let responseData = null;
    let responseStatus = 200;
    
    const mockRes = {
      json: (data) => { responseData = data; },
      status: (code) => ({ 
        json: (data) => { 
          responseStatus = code; 
          responseData = data; 
        } 
      })
    };
    
    await getNotificationStats(mockReq, mockRes);
    
    console.log('   Response status:', responseStatus);
    console.log('   Response data:', JSON.stringify(responseData, null, 2));
    
    if (responseStatus === 200) {
      console.log('✅ getNotificationStats works directly');
    } else {
      console.log('❌ getNotificationStats failed directly');
    }
    
  } catch (error) {
    console.log('❌ getNotificationStats threw error:', error.message);
    console.log('   Stack:', error.stack);
  }
  
  // Test createSystemNotification
  console.log('\n2. Testing createSystemNotification controller directly...');
  try {
    const mockReq = { 
      user: mockUser,
      body: {
        message: 'Direct controller test notification',
        priority: 'low'
      }
    };
    let responseData = null;
    let responseStatus = 200;
    
    const mockRes = {
      json: (data) => { responseData = data; },
      status: (code) => ({ 
        json: (data) => { 
          responseStatus = code; 
          responseData = data; 
        } 
      })
    };
    
    await createSystemNotification(mockReq, mockRes);
    
    console.log('   Response status:', responseStatus);
    console.log('   Response data:', JSON.stringify(responseData, null, 2));
    
    if (responseStatus === 200 || responseStatus === 201) {
      console.log('✅ createSystemNotification works directly');
    } else {
      console.log('❌ createSystemNotification failed directly');
    }
    
  } catch (error) {
    console.log('❌ createSystemNotification threw error:', error.message);
    console.log('   Stack:', error.stack);
  }
}

debugControllerDirect().catch(console.error);