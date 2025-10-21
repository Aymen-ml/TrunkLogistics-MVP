#!/usr/bin/env node

import axios from 'axios';
import fs from 'fs';

const API_BASE_URL = 'https://trucklogistics-api.onrender.com/api';

// Admin credentials from prompt.txt
const ADMIN_CREDENTIALS = {
  email: 'korichiaymen27@gmail.com',
  password: 'admin123'
};

async function fixNotificationsViaAPI() {
  console.log('🔧 Fixing notification system via API...\n');
  
  try {
    // Step 1: Login to get admin token
    console.log('1. Logging in as admin...');
    const loginResponse = await axios.post(`${API_BASE_URL}/auth/login`, ADMIN_CREDENTIALS);
    
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
      },
      timeout: 60000 // 1 minute timeout for database operations
    });
    
    // Step 2: Create a database migration endpoint call
    console.log('\n2. Attempting to apply database schema fix...');
    
    // Since there's no direct migration endpoint, let's try to trigger the fix
    // by creating a system notification which should reveal the schema issues
    console.log('2a. Testing current notification system...');
    
    try {
      const testResponse = await apiClient.post('/notifications/system', {
        message: 'Testing notification system before fix',
        priority: 'low'
      });
      console.log('✅ System notification creation works - schema might already be fixed');
      return true;
    } catch (error) {
      console.log('❌ System notification creation failed as expected:', error.response?.data?.error);
      console.log('   This confirms we need to apply the schema fix');
    }
    
    // Step 3: Since we can't directly run migrations via API, let's create a temporary
    // endpoint or use an alternative approach
    console.log('\n3. Checking if there\'s a database debug endpoint...');
    
    try {
      // Try to access any database-related debug endpoints
      const healthResponse = await apiClient.get('/health');
      console.log('✅ API is healthy:', healthResponse.data);
    } catch (error) {
      console.log('⚠️  Health check failed:', error.message);
    }
    
    // Step 4: Let's try to create a notification using the basic endpoint
    // to see what specific error we get
    console.log('\n4. Analyzing notification creation error...');
    
    try {
      const detailedTestResponse = await apiClient.post('/notifications/system', {
        message: 'Detailed test to analyze schema issues',
        priority: 'medium'
      });
      console.log('✅ Notification created successfully - schema is fixed!');
      return true;
    } catch (error) {
      console.log('❌ Detailed error analysis:');
      console.log('   Status:', error.response?.status);
      console.log('   Error:', error.response?.data?.error);
      
      if (error.response?.status === 500) {
        console.log('\n🔍 This is a server error, likely due to missing database columns.');
        console.log('   The server code expects columns that don\'t exist in the database.');
        console.log('   We need to apply the schema migration directly to the database.');
      }
    }
    
    console.log('\n📋 Summary:');
    console.log('   - API is accessible and authentication works');
    console.log('   - Notification system has server errors due to schema issues');
    console.log('   - Database schema needs to be updated with missing columns');
    console.log('   - Required columns: priority, related_entity_type, related_entity_id, read_at');
    
    console.log('\n🎯 Next steps:');
    console.log('   1. Apply the database schema migration directly');
    console.log('   2. The migration file is ready: 030_fix_notifications_schema_final.sql');
    console.log('   3. After schema fix, the notification system should work properly');
    
    return false; // Schema fix still needed
    
  } catch (error) {
    console.error('❌ API test failed:', error.response?.data || error.message);
    return false;
  }
}

// Run the API-based fix attempt
fixNotificationsViaAPI().then(success => {
  if (success) {
    console.log('\n🎉 Notification system is working properly!');
  } else {
    console.log('\n⚠️  Schema fix is still needed. Please apply the migration manually.');
  }
  process.exit(success ? 0 : 1);
}).catch(error => {
  console.error('❌ Script failed:', error);
  process.exit(1);
});
