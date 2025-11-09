#!/usr/bin/env node

import axios from 'axios';

const API_BASE_URL = 'https://api.movelinker.com/api';

// Admin credentials
const ADMIN_CREDENTIALS = {
  email: 'korichiaymen27@gmail.com',
  password: 'admin123'
};

async function testWorkingDocument() {
  console.log('🧪 Testing Document System with Working File\n');
  
  try {
    // Login as admin
    console.log('1. Logging in as admin...');
    const loginResponse = await axios.post(`${API_BASE_URL}/auth/login`, ADMIN_CREDENTIALS);
    
    const token = loginResponse.data.data.token;
    console.log('✅ Admin login successful');
    
    const apiClient = axios.create({
      baseURL: API_BASE_URL,
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    // Get debug info to find the working document
    console.log('\n2. Getting file system debug info...');
    const debugResponse = await apiClient.get('/documents/debug/filesystem');
    const debugInfo = debugResponse.data.data;
    
    if (!debugInfo.documentSample) {
      console.log('❌ No sample document found in database');
      return false;
    }
    
    const workingDocId = debugInfo.documentSample.id;
    const workingDocPath = debugInfo.documentSample.file_path;
    const workingDocName = debugInfo.documentSample.file_name;
    
    console.log(`✅ Found working document: ${workingDocName} (ID: ${workingDocId})`);
    console.log(`   Database path: ${workingDocPath}`);
    
    // Test 3: Test document info with working document
    console.log('\n3. Testing document info with working document...');
    try {
      const docInfoResponse = await apiClient.get(`/documents/${workingDocId}/info`);
      const docInfo = docInfoResponse.data.data.document;
      
      console.log('✅ Document info endpoint working');
      console.log(`   File Name: ${docInfo.file_name}`);
      console.log(`   Type: ${docInfo.document_type}`);
      console.log(`   Status: ${docInfo.verification_status}`);
      console.log(`   File Exists: ${docInfo.file_exists ? '✅' : '❌'}`);
      console.log(`   File Size: ${docInfo.file_size_formatted || 'Unknown'}`);
      console.log(`   Database Path: ${docInfo.file_path}`);
      console.log(`   Actual Path: ${docInfo.actual_file_path || 'Not found'}`);
      
      // Test 4: Test document download if file exists
      if (docInfo.file_exists) {
        console.log('\n4. Testing document download...');
        try {
          const downloadResponse = await apiClient.get(`/documents/${workingDocId}/download`, {
            responseType: 'arraybuffer',
            timeout: 10000 // 10 second timeout
          });
          
          console.log('🎉 Document download WORKING!');
          console.log(`   Content-Type: ${downloadResponse.headers['content-type']}`);
          console.log(`   Content-Length: ${downloadResponse.headers['content-length']} bytes`);
          console.log(`   Status: ${downloadResponse.status}`);
          console.log(`   File successfully streamed from server!`);
          
          return true;
          
        } catch (downloadError) {
          console.log('❌ Document download failed:', downloadError.response?.status, downloadError.message);
          if (downloadError.response?.data) {
            console.log('   Error details:', downloadError.response.data);
          }
        }
      } else {
        console.log('\n4. ❌ Document file still not found');
        console.log('   The file path resolution still needs work');
      }
      
    } catch (error) {
      console.log('❌ Document info test failed:', error.response?.data?.error || error.message);
    }
    
    console.log('\n' + '='.repeat(60));
    console.log('🎯 WORKING DOCUMENT TEST SUMMARY:');
    console.log('='.repeat(60));
    
    return false;
    
  } catch (error) {
    console.error('❌ Working document test failed:', error.response?.data || error.message);
    return false;
  }
}

// Run the test
testWorkingDocument().then(success => {
  if (success) {
    console.log('\n🎉 Document system is WORKING! Admin can view and download documents!');
  } else {
    console.log('\n⚠️  Document system still needs fixes.');
  }
  process.exit(success ? 0 : 1);
}).catch(error => {
  console.error('❌ Test script failed:', error);
  process.exit(1);
});
