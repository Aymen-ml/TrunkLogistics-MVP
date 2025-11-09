#!/usr/bin/env node

import axios from 'axios';

const API_BASE_URL = 'https://api.movelinker.com/api';

// Admin credentials to get truck IDs
const ADMIN_CREDENTIALS = {
  email: 'korichiaymen27@gmail.com',
  password: 'admin123'
};

// Test customer credentials (you may need to create this)
const CUSTOMER_CREDENTIALS = {
  email: 'customer@test.com',
  password: 'customer123'
};

async function testCustomerTruckAccess() {
  console.log('🔍 Testing Customer Truck Details Access\n');
  
  try {
    // Step 1: Login as admin to get available trucks
    console.log('1. Getting available trucks as admin...');
    const adminLoginResponse = await axios.post(`${API_BASE_URL}/auth/login`, ADMIN_CREDENTIALS);
    
    if (!adminLoginResponse.data.success) {
      throw new Error('Admin login failed: ' + adminLoginResponse.data.error);
    }
    
    const adminToken = adminLoginResponse.data.data.token;
    console.log('✅ Admin login successful');
    
    const adminApiClient = axios.create({
      baseURL: API_BASE_URL,
      headers: {
        'Authorization': `Bearer ${adminToken}`,
        'Content-Type': 'application/json'
      }
    });
    
    // Get trucks list
    const trucksResponse = await adminApiClient.get('/trucks');
    const trucks = trucksResponse.data.data.trucks;
    
    if (trucks.length === 0) {
      console.log('❌ No trucks found to test with');
      return false;
    }
    
    const testTruck = trucks[0];
    console.log(`   Found truck to test: ${testTruck.license_plate} (ID: ${testTruck.id})`);
    
    // Step 2: Test truck details access as admin (should work)
    console.log('\n2. Testing truck details access as admin...');
    try {
      const adminTruckResponse = await adminApiClient.get(`/trucks/${testTruck.id}`);
      console.log('✅ Admin can access truck details');
      console.log(`   Truck data includes: ${Object.keys(adminTruckResponse.data.data.truck).join(', ')}`);
    } catch (error) {
      console.log('❌ Admin cannot access truck details:', error.response?.data || error.message);
    }
    
    // Step 3: Test truck details access as customer
    console.log('\n3. Testing truck details access as customer...');
    
    // Try to login as customer (this might fail if customer doesn't exist)
    try {
      const customerLoginResponse = await axios.post(`${API_BASE_URL}/auth/login`, CUSTOMER_CREDENTIALS);
      
      if (customerLoginResponse.data.success) {
        const customerToken = customerLoginResponse.data.data.token;
        console.log('✅ Customer login successful');
        
        const customerApiClient = axios.create({
          baseURL: API_BASE_URL,
          headers: {
            'Authorization': `Bearer ${customerToken}`,
            'Content-Type': 'application/json'
          }
        });
        
        // Test truck details access
        try {
          const customerTruckResponse = await customerApiClient.get(`/trucks/${testTruck.id}`);
          console.log('✅ Customer can access truck details');
          console.log(`   Truck data includes: ${Object.keys(customerTruckResponse.data.data.truck).join(', ')}`);
          
          // Check if location and driver info is present
          const truckData = customerTruckResponse.data.data.truck;
          console.log('\n   📋 Customer view includes:');
          console.log(`      - Company name: ${truckData.company_name || 'MISSING'}`);
          console.log(`      - Provider name: ${truckData.first_name} ${truckData.last_name || 'MISSING'}`);
          console.log(`      - Phone: ${truckData.phone || 'MISSING'}`);
          console.log(`      - Address: ${truckData.street_address || 'MISSING'}`);
          console.log(`      - City: ${truckData.provider_city || 'MISSING'}`);
          console.log(`      - State: ${truckData.provider_state || 'MISSING'}`);
          console.log(`      - Postal: ${truckData.provider_postal_code || 'MISSING'}`);
          console.log(`      - Business Phone: ${truckData.provider_business_phone || 'MISSING'}`);
          console.log(`      - Drivers: ${truckData.drivers ? truckData.drivers.length + ' drivers' : 'MISSING'}`);
          
        } catch (error) {
          console.log('❌ Customer cannot access truck details');
          console.log(`   Status: ${error.response?.status}`);
          console.log(`   Error: ${error.response?.data?.error || error.message}`);
          console.log(`   Details:`, error.response?.data);
        }
        
      } else {
        console.log('❌ Customer login failed:', customerLoginResponse.data.error);
        console.log('   Testing with admin token as customer simulation...');
        
        // Simulate customer access by checking the API response structure
        const adminTruckResponse = await adminApiClient.get(`/trucks/${testTruck.id}`);
        const truckData = adminTruckResponse.data.data.truck;
        
        console.log('\n   📋 Data that would be available to customers:');
        console.log(`      - Company name: ${truckData.company_name || 'MISSING'}`);
        console.log(`      - Provider name: ${truckData.first_name} ${truckData.last_name || 'MISSING'}`);
        console.log(`      - Phone: ${truckData.phone || 'MISSING'}`);
        console.log(`      - Address: ${truckData.street_address || 'MISSING'}`);
        console.log(`      - City: ${truckData.provider_city || 'MISSING'}`);
        console.log(`      - State: ${truckData.provider_state || 'MISSING'}`);
        console.log(`      - Postal: ${truckData.provider_postal_code || 'MISSING'}`);
        console.log(`      - Business Phone: ${truckData.provider_business_phone || 'MISSING'}`);
        console.log(`      - Drivers: ${truckData.drivers ? truckData.drivers.length + ' drivers' : 'MISSING'}`);
      }
      
    } catch (error) {
      console.log('❌ Customer login failed:', error.response?.data || error.message);
    }
    
    // Step 4: Test truck search endpoint for customers
    console.log('\n4. Testing truck search endpoint...');
    try {
      const searchResponse = await adminApiClient.get('/trucks?search=');
      const searchTrucks = searchResponse.data.data.trucks;
      console.log(`✅ Truck search returns ${searchTrucks.length} trucks`);
      
      if (searchTrucks.length > 0) {
        const searchTruck = searchTrucks[0];
        console.log(`   Sample truck in search: ${searchTruck.license_plate}`);
        console.log(`   Has company_name: ${searchTruck.company_name ? 'YES' : 'NO'}`);
        console.log(`   Has location info: ${searchTruck.provider_city ? 'YES' : 'NO'}`);
      }
    } catch (error) {
      console.log('❌ Truck search failed:', error.response?.data || error.message);
    }
    
    console.log('\n' + '='.repeat(60));
    console.log('🔍 CUSTOMER TRUCK ACCESS TEST SUMMARY:');
    console.log('='.repeat(60));
    console.log('This test helps identify why customers cannot access truck details.');
    console.log('Check the console output above for specific error messages.');
    console.log('');
    console.log('Common issues to check:');
    console.log('1. Authentication token issues');
    console.log('2. Role-based access control problems');
    console.log('3. API endpoint errors');
    console.log('4. Database field mapping issues');
    
    return true;
    
  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
    return false;
  }
}

// Run the test
testCustomerTruckAccess().then(success => {
  if (success) {
    console.log('\n🎉 Customer truck access test completed!');
  } else {
    console.log('\n⚠️  Customer truck access test encountered issues.');
  }
  process.exit(success ? 0 : 1);
}).catch(error => {
  console.error('❌ Test script failed:', error);
  process.exit(1);
});
