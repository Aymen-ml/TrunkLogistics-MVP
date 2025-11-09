#!/usr/bin/env node

import axios from 'axios';

const API_BASE_URL = 'https://api.movelinker.com/api';

// Admin credentials
const ADMIN_CREDENTIALS = {
  email: 'korichiaymen27@gmail.com',
  password: 'admin123'
};

async function testNotificationSystemComplete() {
  console.log('🧪 Testing Complete Notification System After Schema Fix\n');
  
  try {
    // Login
    console.log('1. Logging in...');
    const loginResponse = await axios.post(`${API_BASE_URL}/auth/login`, ADMIN_CREDENTIALS);
    
    if (!loginResponse.data.success) {
      throw new Error('Login failed: ' + loginResponse.data.error);
    }
    
    const token = loginResponse.data.data.token;
    console.log('✅ Login successful');
    
    const apiClient = axios.create({
      baseURL: API_BASE_URL,
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    // Test all endpoints
    const tests = [
      {
        name: 'Unread Count',
        test: () => apiClient.get('/notifications/unread-count')
      },
      {
        name: 'Get Notifications',
        test: () => apiClient.get('/notifications')
      },
      {
        name: 'Notification Stats',
        test: () => apiClient.get('/notifications/stats')
      },
      {
        name: 'Create System Notification',
        test: () => apiClient.post('/notifications/system', {
          message: 'Test notification after schema fix - all features should work!',
          priority: 'low'
        })
      }
    ];
    
    let allPassed = true;
    
    for (let i = 0; i < tests.length; i++) {
      const test = tests[i];
      console.log(`\n${i + 2}. Testing ${test.name}...`);
      
      try {
        const response = await test.test();
        console.log(`✅ ${test.name} - SUCCESS`);
        
        if (test.name === 'Create System Notification') {
          console.log(`   📊 Created ${response.data.data.count} notifications`);
        } else if (test.name === 'Notification Stats') {
          const stats = response.data.data.stats;
          console.log(`   📊 Total: ${stats.total_notifications}, Unread: ${stats.unread_notifications}`);
          console.log(`   📊 Priority breakdown - High: ${stats.high_priority}, Medium: ${stats.medium_priority}, Low: ${stats.low_priority}`);
        }
        
      } catch (error) {
        console.log(`❌ ${test.name} - FAILED`);
        console.log(`   Error: ${error.response?.data?.error || error.message}`);
        if (error.response?.data?.details) {
          console.log(`   Details: ${error.response.data.details}`);
        }
        allPassed = false;
      }
    }
    
    console.log('\n' + '='.repeat(50));
    if (allPassed) {
      console.log('🎉 ALL TESTS PASSED! Notification system is fully functional!');
      console.log('✅ Schema fix was successful');
      console.log('✅ All notification features are working');
      console.log('✅ Priority system is operational');
      console.log('✅ System notifications can be created');
    } else {
      console.log('⚠️  Some tests failed. Please check the errors above.');
    }
    console.log('='.repeat(50));
    
    return allPassed;
    
  } catch (error) {
    console.error('❌ Test suite failed:', error.response?.data || error.message);
    return false;
  }
}

// Run the complete test
testNotificationSystemComplete().then(success => {
  process.exit(success ? 0 : 1);
}).catch(error => {
  console.error('❌ Test script failed:', error);
  process.exit(1);
});
