#!/usr/bin/env node

import axios from 'axios';

const API_BASE_URL = 'https://api.movelinker.com/api';

// Test credentials from prompt.txt
const TEST_CREDENTIALS = {
  email: 'korichiaymen27@gmail.com',
  password: 'admin123'
};

async function testNotificationSystem() {
  console.log('🔍 Testing Notification System...\n');
  
  try {
    // Step 1: Login to get token
    console.log('1. Logging in...');
    const loginResponse = await axios.post(`${API_BASE_URL}/auth/login`, TEST_CREDENTIALS);
    
    if (!loginResponse.data.success) {
      throw new Error('Login failed: ' + loginResponse.data.error);
    }
    
    const token = loginResponse.data.data.token;
    console.log('✅ Login successful');
    
    // Create axios instance with auth header
    const apiClient = axios.create({
      baseURL: API_BASE_URL,
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    // Step 2: Test unread count endpoint
    console.log('\n2. Testing unread count endpoint...');
    try {
      const unreadResponse = await apiClient.get('/notifications/unread-count');
      console.log('✅ Unread count endpoint working:', unreadResponse.data);
    } catch (error) {
      console.log('❌ Unread count endpoint failed:', error.response?.data || error.message);
    }
    
    // Step 3: Test get notifications endpoint
    console.log('\n3. Testing get notifications endpoint...');
    try {
      const notificationsResponse = await apiClient.get('/notifications');
      console.log('✅ Get notifications endpoint working:', {
        success: notificationsResponse.data.success,
        count: notificationsResponse.data.data?.notifications?.length || 0
      });
    } catch (error) {
      console.log('❌ Get notifications endpoint failed:', error.response?.data || error.message);
    }
    
    // Step 4: Test notification stats (admin only)
    console.log('\n4. Testing notification stats endpoint...');
    try {
      const statsResponse = await apiClient.get('/notifications/stats');
      console.log('✅ Notification stats endpoint working:', statsResponse.data);
    } catch (error) {
      console.log('❌ Notification stats endpoint failed:', error.response?.data || error.message);
    }
    
    // Step 5: Test creating a test notification
    console.log('\n5. Testing notification creation...');
    try {
      const testNotificationResponse = await apiClient.post('/notifications/system', {
        message: 'Test notification from diagnostic script',
        priority: 'low'
      });
      console.log('✅ Test notification created:', testNotificationResponse.data);
    } catch (error) {
      console.log('❌ Test notification creation failed:', error.response?.data || error.message);
    }
    
    // Step 6: Test health endpoint
    console.log('\n6. Testing API health...');
    try {
      const healthResponse = await axios.get(`${API_BASE_URL}/health`);
      console.log('✅ API health check:', healthResponse.data);
    } catch (error) {
      console.log('❌ API health check failed:', error.response?.data || error.message);
    }
    
    console.log('\n🎉 Notification system test completed!');
    
  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
    process.exit(1);
  }
}

// Run the test
testNotificationSystem().catch(console.error);
