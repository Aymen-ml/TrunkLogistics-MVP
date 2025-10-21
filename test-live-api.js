#!/usr/bin/env node

/**
 * Test Live API Health
 */

import fetch from 'node-fetch';

async function testAPI() {
  const baseURL = 'https://trucklogistics-api.onrender.com';
  
  try {
    console.log('🔍 Testing API Health...');
    
    // Test health endpoint
    console.log('1. Testing health endpoint...');
    const healthResponse = await fetch(`${baseURL}/api/health`);
    console.log('Health status:', healthResponse.status);
    
    if (healthResponse.ok) {
      const healthData = await healthResponse.text();
      console.log('Health response:', healthData);
    }
    
    // Test login endpoint with invalid credentials to see the error
    console.log('\n2. Testing login endpoint...');
    const loginResponse = await fetch(`${baseURL}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'test@test.com',
        password: 'testpassword'
      })
    });
    
    console.log('Login status:', loginResponse.status);
    const loginData = await loginResponse.text();
    console.log('Login response:', loginData);
    
    // Test with admin credentials
    console.log('\n3. Testing with admin credentials...');
    const adminLoginResponse = await fetch(`${baseURL}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'korichiaymen27@gmail.com',
        password: 'igeem002'
      })
    });
    
    console.log('Admin login status:', adminLoginResponse.status);
    const adminLoginData = await adminLoginResponse.text();
    console.log('Admin login response:', adminLoginData);
    
  } catch (error) {
    console.error('❌ API test failed:', error.message);
  }
}

testAPI();
