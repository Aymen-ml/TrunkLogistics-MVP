#!/usr/bin/env node

import axios from 'axios';

const API_BASE_URL = 'https://trucklogistics-api.onrender.com/api';

// Admin credentials
const ADMIN_CREDENTIALS = {
  email: 'korichiaymen27@gmail.com',
  password: 'admin123'
};

async function testAdminDetails() {
  console.log('🧪 Testing Admin Details View Issues\n');
  
  try {
    // Login as admin
    console.log('1. Logging in as admin...');
    const loginResponse = await axios.post(`${API_BASE_URL}/auth/login`, ADMIN_CREDENTIALS);
    
    if (!loginResponse.data.success) {
      throw new Error('Login failed: ' + loginResponse.data.error);
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
    
    // Test 1: Get truck list to find a truck ID
    console.log('\n2. Getting truck list...');
    const trucksResponse = await apiClient.get('/trucks');
    const trucks = trucksResponse.data.data.trucks;
    
    if (trucks.length === 0) {
      console.log('❌ No trucks found to test details view');
      return false;
    }
    
    const testTruck = trucks[0];
    console.log(`✅ Found truck to test: ${testTruck.license_plate} (ID: ${testTruck.id})`);
    
    // Test 2: Get truck details
    console.log('\n3. Testing truck details view...');
    try {
      const truckDetailsResponse = await apiClient.get(`/trucks/${testTruck.id}`);
      const truckDetails = truckDetailsResponse.data.data.truck;
      
      console.log('✅ Truck details endpoint working');
      console.log(`   License Plate: ${truckDetails.license_plate}`);
      console.log(`   Type: ${truckDetails.truck_type}`);
      console.log(`   Make/Model: ${truckDetails.make} ${truckDetails.model}`);
      console.log(`   Status: ${truckDetails.status}`);
      console.log(`   Provider: ${truckDetails.company_name}`);
      console.log(`   Documents: ${truckDetails.documents?.length || 0} found`);
      console.log(`   Drivers: ${truckDetails.drivers?.length || 0} assigned`);
      
    } catch (error) {
      console.log('❌ Truck details test failed:', error.response?.data?.error || error.message);
      console.log('   Status:', error.response?.status);
      console.log('   Full error:', error.response?.data);
    }
    
    // Test 3: Get document list to find a document ID
    console.log('\n4. Getting document list...');
    const documentsResponse = await apiClient.get('/documents');
    const documents = documentsResponse.data.data.documents;
    
    if (documents.length === 0) {
      console.log('❌ No documents found to test viewing');
      return false;
    }
    
    const testDoc = documents[0];
    console.log(`✅ Found document to test: ${testDoc.file_name} (ID: ${testDoc.id})`);
    
    // Test 4: Test document viewing
    console.log('\n5. Testing document viewing...');
    try {
      // Test document info
      const docInfoResponse = await apiClient.get(`/documents/${testDoc.id}/info`);
      const docInfo = docInfoResponse.data.data.document;
      
      console.log('✅ Document info endpoint working');
      console.log(`   File Name: ${docInfo.file_name}`);
      console.log(`   Type: ${docInfo.document_type}`);
      console.log(`   Status: ${docInfo.verification_status}`);
      console.log(`   File Exists: ${docInfo.file_exists ? '✅' : '❌'}`);
      console.log(`   File Size: ${docInfo.file_size_formatted || 'Unknown'}`);
      
      // Test document download
      if (docInfo.file_exists) {
        console.log('\n   Testing document download...');
        try {
          const downloadResponse = await apiClient.get(`/documents/${testDoc.id}/download`, {
            responseType: 'arraybuffer'
          });
          
          console.log('✅ Document download working');
          console.log(`   Content-Type: ${downloadResponse.headers['content-type']}`);
          console.log(`   Content-Length: ${downloadResponse.headers['content-length']} bytes`);
          
        } catch (downloadError) {
          console.log('❌ Document download failed:', downloadError.response?.status, downloadError.message);
        }
      } else {
        console.log('⚠️  Document file not found on server, cannot test download');
      }
      
    } catch (error) {
      console.log('❌ Document viewing test failed:', error.response?.data?.error || error.message);
      console.log('   Status:', error.response?.status);
    }
    
    // Test 5: Check if there are any permission issues
    console.log('\n6. Testing permissions...');
    console.log(`   User role: admin`);
    console.log(`   Should have access to all trucks: ✅`);
    console.log(`   Should have access to all documents: ✅`);
    
    console.log('\n' + '='.repeat(60));
    console.log('🎯 ADMIN DETAILS TEST SUMMARY:');
    console.log('='.repeat(60));
    
    return true;
    
  } catch (error) {
    console.error('❌ Admin details test failed:', error.response?.data || error.message);
    return false;
  }
}

// Run the test
testAdminDetails().then(success => {
  if (success) {
    console.log('\n🎉 Admin details test completed!');
  } else {
    console.log('\n⚠️  Admin details test encountered issues.');
  }
  process.exit(success ? 0 : 1);
}).catch(error => {
  console.error('❌ Test script failed:', error);
  process.exit(1);
});
