#!/usr/bin/env node

/**
 * Test Booking Creation
 * 
 * This script tests the booking creation API endpoint directly
 * to identify the exact cause of the 500 error.
 */

import axios from 'axios';

const API_BASE_URL = 'https://api.movelinker.com';

// Test data from the error log
const testBookingData = {
  cargoDescription: "pipe",
  cargoVolume: 80,
  cargoWeight: 500,
  destinationAddress: "setif",
  destinationCity: "setif",
  notes: "yes",
  pickupAddress: "bejaia",
  pickupCity: "Bejaia",
  pickupDate: "2025-10-01",
  pickupTime: "11:41",
  service_type: "transport",
  truckId: "63860450-237e-4b62-9209-f9d92afde2eb"
};

async function testBookingCreation() {
  try {
    console.log('🧪 Testing booking creation API...');
    console.log('📊 Test data:', JSON.stringify(testBookingData, null, 2));

    // First, let's test if we can reach the API
    console.log('🔍 Testing API connectivity...');
    try {
      const healthCheck = await axios.get(`${API_BASE_URL}/api/test`);
      console.log('✅ API is reachable');
    } catch (error) {
      console.log('⚠️  API health check failed, but continuing...');
    }

    // Test the booking creation endpoint
    console.log('🔍 Testing booking creation endpoint...');
    
    // Note: This will fail without authentication, but we can see the error details
    try {
      const response = await axios.post(`${API_BASE_URL}/api/bookings`, testBookingData, {
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      console.log('✅ Booking creation successful:', response.data);
    } catch (error) {
      if (error.response) {
        console.log('📊 Response Status:', error.response.status);
        console.log('📊 Response Headers:', error.response.headers);
        console.log('📊 Response Data:', JSON.stringify(error.response.data, null, 2));
        
        if (error.response.status === 401) {
          console.log('ℹ️  Expected 401 - Authentication required');
        } else if (error.response.status === 400) {
          console.log('⚠️  Validation error - check the response data above');
        } else if (error.response.status === 500) {
          console.log('❌ Server error - this is the issue we need to fix');
        }
      } else if (error.request) {
        console.log('❌ No response received:', error.request);
      } else {
        console.log('❌ Request setup error:', error.message);
      }
    }

    // Test individual validation
    console.log('\n🔍 Testing individual field validation...');
    
    const requiredFields = [
      'truckId', 'pickupAddress', 'pickupCity', 'destinationAddress', 
      'destinationCity', 'pickupDate', 'cargoDescription', 'cargoWeight'
    ];

    requiredFields.forEach(field => {
      const value = testBookingData[field];
      if (!value) {
        console.log(`❌ Missing required field: ${field}`);
      } else {
        console.log(`✅ ${field}: ${value}`);
      }
    });

    // Validate UUID format for truckId
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    if (uuidRegex.test(testBookingData.truckId)) {
      console.log('✅ truckId has valid UUID format');
    } else {
      console.log('❌ truckId has invalid UUID format');
    }

    // Validate date format
    const date = new Date(testBookingData.pickupDate);
    if (!isNaN(date.getTime())) {
      console.log('✅ pickupDate has valid date format');
    } else {
      console.log('❌ pickupDate has invalid date format');
    }

    // Validate numeric fields
    if (!isNaN(parseFloat(testBookingData.cargoWeight)) && parseFloat(testBookingData.cargoWeight) > 0) {
      console.log('✅ cargoWeight is valid');
    } else {
      console.log('❌ cargoWeight is invalid');
    }

    if (!isNaN(parseFloat(testBookingData.cargoVolume)) && parseFloat(testBookingData.cargoVolume) >= 0) {
      console.log('✅ cargoVolume is valid');
    } else {
      console.log('❌ cargoVolume is invalid');
    }

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

// Run the test
testBookingCreation()
  .then(() => {
    console.log('\n✅ Booking creation test completed');
  })
  .catch((error) => {
    console.error('❌ Test failed:', error);
  });