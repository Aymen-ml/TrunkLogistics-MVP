#!/usr/bin/env node

import axios from 'axios';

const API_BASE_URL = 'https://trunklogistics-api.onrender.com/api';

// Admin credentials
const ADMIN_CREDENTIALS = {
  email: 'korichiaymen27@gmail.com',
  password: 'admin123'
};

async function testDirectAPI() {
  console.log('🔍 Testing Direct API Endpoints\n');
  
  try {
    // Login as admin
    console.log('1. Admin login...');
    const loginResponse = await axios.post(`${API_BASE_URL}/auth/login`, ADMIN_CREDENTIALS);
    
    if (!loginResponse.data.success) {
      throw new Error('Admin login failed: ' + loginResponse.data.error);
    }
    
    const token = loginResponse.data.data.token;
    console.log('✅ Admin login successful');
    
    const apiClient = axios.create({
      baseURL: API_BASE_URL,
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    // Test truck search first (we know this works)
    console.log('\n2. Testing truck search...');
    try {
      const searchResponse = await apiClient.get('/trucks');
      const trucks = searchResponse.data.data.trucks;
      console.log(`✅ Truck search successful: ${trucks.length} trucks found`);
      
      if (trucks.length > 0) {
        const testTruck = trucks[0];
        console.log(`   Test truck: ${testTruck.license_plate} (ID: ${testTruck.id})`);
        
        // Test truck details endpoint
        console.log('\n3. Testing truck details endpoint...');
        try {
          const detailsResponse = await apiClient.get(`/trucks/${testTruck.id}`);
          console.log('✅ Truck details successful!');
          console.log('   Response structure:', Object.keys(detailsResponse.data));
          
          if (detailsResponse.data.data && detailsResponse.data.data.truck) {
            const truck = detailsResponse.data.data.truck;
            console.log('   Truck data keys:', Object.keys(truck));
            console.log('   Company name:', truck.company_name);
            console.log('   Provider name:', truck.first_name, truck.last_name);
            console.log('   Address:', truck.address);
            console.log('   City:', truck.city);
            console.log('   Drivers:', truck.drivers ? truck.drivers.length : 'none');
          }
          
        } catch (detailsError) {
          console.log('❌ Truck details failed');
          console.log('   Status:', detailsError.response?.status);
          console.log('   Error:', detailsError.response?.data);
          console.log('   Message:', detailsError.message);
          
          // Try to get more details from the response
          if (detailsError.response?.data) {
            console.log('   Full error response:', JSON.stringify(detailsError.response.data, null, 2));
          }
        }
        
      } else {
        console.log('❌ No trucks found to test with');
      }
      
    } catch (searchError) {
      console.log('❌ Truck search failed:', searchError.response?.data || searchError.message);
    }
    
    // Test a simple endpoint to verify API is working
    console.log('\n4. Testing simple API endpoint...');
    try {
      const healthResponse = await apiClient.get('/auth/me');
      console.log('✅ Auth/me endpoint working');
    } catch (healthError) {
      console.log('❌ Auth/me failed:', healthError.response?.data || healthError.message);
    }
    
    return true;
    
  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
    return false;
  }
}

// Run the test
testDirectAPI().then(success => {
  if (success) {
    console.log('\n🎉 Direct API test completed!');
  } else {
    console.log('\n⚠️  Direct API test failed.');
  }
  process.exit(success ? 0 : 1);
}).catch(error => {
  console.error('❌ Test script failed:', error);
  process.exit(1);
});
