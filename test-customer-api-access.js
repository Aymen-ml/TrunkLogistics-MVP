#!/usr/bin/env node

import axios from 'axios';
import { query } from './server/src/config/database.js';
import logger from './server/src/utils/logger.js';

async function testCustomerApiAccess() {
  console.log('🔍 Testing Customer API Access to Trucks\n');
  
  try {
    // 1. First, let's create a test customer if one doesn't exist
    console.log('1. Setting up test customer...\n');
    
    // Check if test customer exists
    const existingCustomer = await query(
      'SELECT u.*, cp.* FROM users u LEFT JOIN customer_profiles cp ON u.id = cp.user_id WHERE u.email = $1',
      ['testcustomer@example.com']
    );
    
    let customerToken;
    
    if (existingCustomer.rows.length === 0) {
      console.log('Creating test customer...');
      
      // Create test customer
      const customerResult = await query(`
        INSERT INTO users (first_name, last_name, email, password_hash, role, email_verified, is_active)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        RETURNING *
      `, ['Test', 'Customer', 'testcustomer@example.com', '$2b$10$hashedpassword', 'customer', true, true]);
      
      const customer = customerResult.rows[0];
      
      // Create customer profile
      await query(`
        INSERT INTO customer_profiles (user_id, company_name, business_type, street_address, city, postal_code)
        VALUES ($1, $2, $3, $4, $5, $6)
      `, [customer.id, 'Test Company', 'logistics', '123 Test St', 'Test City', '12345']);
      
      console.log('✅ Test customer created');
    } else {
      console.log('✅ Test customer already exists');
    }
    
    // 2. Generate a JWT token for the test customer
    console.log('\n2. Generating JWT token for test customer...\n');
    
    const customerData = await query(
      'SELECT u.*, cp.* FROM users u LEFT JOIN customer_profiles cp ON u.id = cp.user_id WHERE u.email = $1',
      ['testcustomer@example.com']
    );
    
    const customer = customerData.rows[0];
    
    // Create a simple JWT token (for testing purposes)
    const jwt = await import('jsonwebtoken');
    const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
    
    customerToken = jwt.default.sign(
      {
        id: customer.id,
        email: customer.email,
        role: customer.role,
        email_verified: customer.email_verified
      },
      JWT_SECRET,
      { expiresIn: '1h' }
    );
    
    console.log('✅ JWT token generated for customer');
    
    // 3. Test API access with the customer token
    console.log('\n3. Testing API access...\n');
    
    const API_BASE_URL = process.env.API_URL || 'https://trucklogistics-api.onrender.com/api';
    
    const apiClient = axios.create({
      baseURL: API_BASE_URL,
      headers: {
        'Authorization': `Bearer ${customerToken}`,
        'Content-Type': 'application/json'
      }
    });
    
    // Test 1: Get all trucks
    console.log('Testing GET /trucks...');
    try {
      const trucksResponse = await apiClient.get('/trucks');
      console.log(`✅ GET /trucks successful: ${trucksResponse.data.data.trucks.length} trucks returned`);
      
      if (trucksResponse.data.data.trucks.length > 0) {
        console.log('Sample truck data:');
        const sampleTruck = trucksResponse.data.data.trucks[0];
        console.log(`   - License: ${sampleTruck.license_plate}`);
        console.log(`   - Type: ${sampleTruck.truck_type}`);
        console.log(`   - Status: ${sampleTruck.status}`);
        console.log(`   - Provider: ${sampleTruck.company_name}`);
        console.log(`   - Documents Verified: ${sampleTruck.documents_verified || 'N/A'}`);
      }
    } catch (error) {
      console.log(`❌ GET /trucks failed: ${error.response?.status} - ${error.response?.data?.error || error.message}`);
      if (error.response?.data?.details) {
        console.log('   Details:', error.response.data.details);
      }
    }
    
    // Test 2: Get specific truck details
    console.log('\nTesting GET /trucks/:id...');
    
    // Get a truck ID from the database
    const truckQuery = await query('SELECT id, license_plate FROM trucks LIMIT 1');
    if (truckQuery.rows.length > 0) {
      const testTruckId = truckQuery.rows[0].id;
      const testTruckLicense = truckQuery.rows[0].license_plate;
      
      try {
        const truckResponse = await apiClient.get(`/trucks/${testTruckId}`);
        console.log(`✅ GET /trucks/${testTruckId} successful: ${truckResponse.data.data.truck.license_plate}`);
      } catch (error) {
        console.log(`❌ GET /trucks/${testTruckId} failed: ${error.response?.status} - ${error.response?.data?.error || error.message}`);
        if (error.response?.data) {
          console.log('   Response data:', JSON.stringify(error.response.data, null, 2));
        }
      }
    } else {
      console.log('❌ No trucks found in database to test individual truck access');
    }
    
    // Test 3: Check customer's email verification status
    console.log('\n4. Checking customer email verification status...\n');
    console.log(`Customer email verified: ${customer.email_verified}`);
    console.log(`Customer active: ${customer.is_active}`);
    console.log(`Customer role: ${customer.role}`);
    
    // Test 4: Test without authentication
    console.log('\n5. Testing without authentication...\n');
    
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
    
  } catch (error) {
    console.error('❌ Error during testing:', error);
  }
}

// Run the test
testCustomerApiAccess().then(() => {
  console.log('\n🎉 Customer API access test completed!');
  process.exit(0);
}).catch(error => {
  console.error('\n💥 Test failed:', error);
  process.exit(1);
});