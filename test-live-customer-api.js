#!/usr/bin/env node

import axios from 'axios';

async function testLiveCustomerApi() {
  console.log('🔍 Testing Live Customer API Access\n');
  
  try {
    const API_BASE_URL = 'https://trunklogistics-api.onrender.com/api';
    
    // Test 1: Try to register a new customer
    console.log('1. Testing customer registration...\n');
    
    const registrationData = {
      firstName: 'Test',
      lastName: 'Customer',
      email: 'testcustomer' + Date.now() + '@example.com',
      password: 'TestPassword123!',
      role: 'customer',
      companyName: 'Test Company',
      businessType: 'logistics',
      streetAddress: '123 Test St',
      city: 'Test City',
      postalCode: '12345'
    };
    
    let customerToken;
    
    try {
      const registerResponse = await axios.post(`${API_BASE_URL}/auth/register`, registrationData);
      console.log('✅ Customer registration successful');
      customerToken = registerResponse.data.token;
    } catch (error) {
      console.log(`❌ Customer registration failed: ${error.response?.status} - ${error.response?.data?.error || error.message}`);
      
      // Try to login with existing test credentials
      console.log('\n2. Trying to login with admin credentials (for testing)...\n');
      
      try {
        const loginResponse = await axios.post(`${API_BASE_URL}/auth/login`, {
          email: 'korichiaymen27@gmail.com',
          password: 'admin123'
        });
        console.log('✅ Admin login successful (will test as admin)');
        customerToken = loginResponse.data.token;
      } catch (loginError) {
        console.log(`❌ Admin login failed: ${loginError.response?.status} - ${loginError.response?.data?.error || loginError.message}`);
        return;
      }
    }
    
    // Test 2: Test API access with the token
    console.log('\n3. Testing API access with token...\n');
    
    const apiClient = axios.create({
      baseURL: API_BASE_URL,
      headers: {
        'Authorization': `Bearer ${customerToken}`,
        'Content-Type': 'application/json'
      }
    });
    
    // Test trucks endpoint
    console.log('Testing GET /trucks...');
    try {
      const trucksResponse = await apiClient.get('/trucks');
      console.log(`✅ GET /trucks successful: ${trucksResponse.data.data.trucks.length} trucks returned`);
      
      if (trucksResponse.data.data.trucks.length > 0) {
        console.log('\nSample truck data:');
        const sampleTruck = trucksResponse.data.data.trucks[0];
        console.log(`   - License: ${sampleTruck.license_plate}`);
        console.log(`   - Type: ${sampleTruck.truck_type}`);
        console.log(`   - Status: ${sampleTruck.status}`);
        console.log(`   - Provider: ${sampleTruck.company_name}`);
        console.log(`   - Documents Verified: ${sampleTruck.documents_verified || 'N/A'}`);
        console.log(`   - Provider Verified: ${sampleTruck.provider_verified || 'N/A'}`);
        
        // Test individual truck access
        console.log(`\nTesting GET /trucks/${sampleTruck.id}...`);
        try {
          const truckResponse = await apiClient.get(`/trucks/${sampleTruck.id}`);
          console.log(`✅ GET /trucks/${sampleTruck.id} successful: ${truckResponse.data.data.truck.license_plate}`);
        } catch (error) {
          console.log(`❌ GET /trucks/${sampleTruck.id} failed: ${error.response?.status} - ${error.response?.data?.error || error.message}`);
          if (error.response?.data) {
            console.log('   Response data:', JSON.stringify(error.response.data, null, 2));
          }
        }
      }
    } catch (error) {
      console.log(`❌ GET /trucks failed: ${error.response?.status} - ${error.response?.data?.error || error.message}`);
      if (error.response?.data?.details) {
        console.log('   Details:', error.response.data.details);
      }
    }
    
    // Test 3: Test without authentication
    console.log('\n4. Testing without authentication...\n');
    
    const publicApiClient = axios.create({
      baseURL: API_BASE_URL,
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    try {
      const publicResponse = await publicApiClient.get('/trucks');
      console.log(`✅ Public access to /trucks successful: ${publicResponse.data.data.trucks.length} trucks returned`);
    } catch (error) {
      console.log(`❌ Public access to /trucks failed: ${error.response?.status} - ${error.response?.data?.error || error.message}`);
    }
    
    // Test 4: Test with different query parameters
    console.log('\n5. Testing with different query parameters...\n');
    
    try {
      const filteredResponse = await apiClient.get('/trucks', {
        params: {
          serviceType: 'transport',
          truckType: 'all',
          pricingType: 'all'
        }
      });
      console.log(`✅ GET /trucks with filters successful: ${filteredResponse.data.data.trucks.length} trucks returned`);
    } catch (error) {
      console.log(`❌ GET /trucks with filters failed: ${error.response?.status} - ${error.response?.data?.error || error.message}`);
    }
    
  } catch (error) {
    console.error('❌ Error during testing:', error.message);
  }
}

// Run the test
testLiveCustomerApi().then(() => {
  console.log('\n🎉 Live customer API test completed!');
}).catch(error => {
  console.error('\n💥 Test failed:', error);
});