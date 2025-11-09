#!/usr/bin/env node

import axios from 'axios';

const API_BASE_URL = 'https://api.movelinker.com/api';

const TEST_CREDENTIALS = {
  email: 'korichiaymen27@gmail.com',
  password: 'admin123'
};

async function testSpecificEndpoints() {
  console.log('🔍 Testing Specific Notification Endpoints...\n');
  
  try {
    // Login
    const loginResponse = await axios.post(`${API_BASE_URL}/auth/login`, TEST_CREDENTIALS);
    const token = loginResponse.data.data.token;
    
    const apiClient = axios.create({
      baseURL: API_BASE_URL,
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    // Test stats endpoint with detailed error logging
    console.log('1. Testing stats endpoint...');
    try {
      const statsResponse = await apiClient.get('/notifications/stats');
      console.log('✅ Stats response:', statsResponse.data);
    } catch (error) {
      console.log('❌ Stats error details:');
      if (error.response) {
        console.log('   Status:', error.response.status);
        console.log('   Data:', JSON.stringify(error.response.data, null, 2));
        console.log('   Headers:', error.response.headers);
      } else {
        console.log('   Error:', error.message);
      }
    }
    
    // Test system notification creation with detailed error logging  
    console.log('\n2. Testing system notification creation...');
    try {
      const notificationData = {
        message: 'Test system notification from diagnostic script',
        priority: 'low'
      };
      console.log('   Sending:', JSON.stringify(notificationData, null, 2));
      
      const createResponse = await apiClient.post('/notifications/system', notificationData);
      console.log('✅ Creation response:', createResponse.data);
    } catch (error) {
      console.log('❌ Creation error details:');
      if (error.response) {
        console.log('   Status:', error.response.status);
        console.log('   Data:', JSON.stringify(error.response.data, null, 2));
        console.log('   Headers:', error.response.headers);
      } else {
        console.log('   Error:', error.message);
      }
    }
    
    // Test email service endpoint
    console.log('\n3. Testing email service endpoint...');
    try {
      const emailTestResponse = await apiClient.get('/notifications/test-email');
      console.log('✅ Email test response:', emailTestResponse.data);
    } catch (error) {
      console.log('❌ Email test error details:');
      if (error.response) {
        console.log('   Status:', error.response.status);
        console.log('   Data:', JSON.stringify(error.response.data, null, 2));
      } else {
        console.log('   Error:', error.message);
      }
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testSpecificEndpoints().catch(console.error);