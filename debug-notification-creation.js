#!/usr/bin/env node

import axios from 'axios';

const API_BASE_URL = 'https://trucklogistics-api.onrender.com/api';

// Test credentials from prompt.txt
const TEST_CREDENTIALS = {
  email: 'korichiaymen27@gmail.com',
  password: 'admin123'
};

async function debugNotificationCreation() {
  console.log('🔍 Debugging Notification Creation...\n');
  
  try {
    // Step 1: Login to get token
    console.log('1. Logging in...');
    const loginResponse = await axios.post(`${API_BASE_URL}/auth/login`, TEST_CREDENTIALS);
    
    if (!loginResponse.data.success) {
      throw new Error('Login failed: ' + loginResponse.data.error);
    }
    
    const token = loginResponse.data.data.token;
    const user = loginResponse.data.data.user;
    console.log('✅ Login successful, user role:', user.role);
    
    // Create axios instance with auth header
    const apiClient = axios.create({
      baseURL: API_BASE_URL,
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    // Step 2: Test system notification creation with detailed error logging
    console.log('\n2. Testing system notification creation...');
    try {
      const testNotificationData = {
        message: 'Test notification from debug script - checking notification system functionality',
        priority: 'low'
      };
      
      console.log('Sending notification data:', testNotificationData);
      
      const response = await apiClient.post('/notifications/system', testNotificationData);
      console.log('✅ System notification created successfully:', response.data);
      
    } catch (error) {
      console.log('❌ System notification creation failed');
      console.log('Status:', error.response?.status);
      console.log('Status Text:', error.response?.statusText);
      console.log('Response Data:', JSON.stringify(error.response?.data, null, 2));
      console.log('Request Headers:', error.config?.headers);
      console.log('Request Data:', error.config?.data);
      
      if (error.response?.status === 500) {
        console.log('\n🔍 This is a server error. Let\'s check the notification stats endpoint too...');
      }
    }
    
    // Step 3: Test notification stats with detailed error logging
    console.log('\n3. Testing notification stats...');
    try {
      const statsResponse = await apiClient.get('/notifications/stats');
      console.log('✅ Notification stats retrieved:', statsResponse.data);
      
    } catch (error) {
      console.log('❌ Notification stats failed');
      console.log('Status:', error.response?.status);
      console.log('Status Text:', error.response?.statusText);
      console.log('Response Data:', JSON.stringify(error.response?.data, null, 2));
      
      if (error.response?.status === 500) {
        console.log('\n🔍 This suggests there might be an issue with the Notification model or database queries.');
      }
    }
    
    // Step 4: Test basic notification retrieval
    console.log('\n4. Testing basic notification retrieval...');
    try {
      const notificationsResponse = await apiClient.get('/notifications');
      console.log('✅ Basic notifications retrieved:', {
        success: notificationsResponse.data.success,
        count: notificationsResponse.data.data?.notifications?.length || 0
      });
      
    } catch (error) {
      console.log('❌ Basic notification retrieval failed');
      console.log('Response Data:', JSON.stringify(error.response?.data, null, 2));
    }
    
    console.log('\n🎉 Debug session completed!');
    
  } catch (error) {
    console.error('❌ Debug failed:', error.response?.data || error.message);
    process.exit(1);
  }
}

// Run the debug
debugNotificationCreation().catch(console.error);
