#!/usr/bin/env node

import axios from 'axios';

const API_BASE_URL = 'https://api.movelinker.com/api';

// Admin credentials
const ADMIN_CREDENTIALS = {
  email: 'korichiaymen27@gmail.com',
  password: 'admin123'
};

async function testDocumentFix() {
  console.log('🧪 Testing Document File System Fix\n');
  
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
    
    // Test 1: Debug file system
    console.log('\n2. Checking file system structure...');
    try {
      const debugResponse = await apiClient.get('/documents/debug/filesystem');
      const debugInfo = debugResponse.data.data;
      
      console.log('✅ File system debug info retrieved');
      console.log(`   Current Working Directory: ${debugInfo.currentWorkingDirectory}`);
      console.log(`   __dirname: ${debugInfo.__dirname}`);
      
      console.log('\n📁 Upload Paths:');
      debugInfo.uploadPaths.forEach((pathInfo, index) => {
        console.log(`   ${index + 1}. ${pathInfo.path}`);
        console.log(`      Exists: ${pathInfo.exists ? '✅' : '❌'}`);
        if (pathInfo.exists && pathInfo.files.length > 0) {
          console.log(`      Files: ${pathInfo.files.join(', ')}`);
        }
      });
      
      if (debugInfo.documentSample) {
        console.log('\n📄 Sample Document:');
        console.log(`   ID: ${debugInfo.documentSample.id}`);
        console.log(`   File Name: ${debugInfo.documentSample.file_name}`);
        console.log(`   File Path: ${debugInfo.documentSample.file_path}`);
        console.log(`   File Size: ${debugInfo.documentSample.file_size}`);
      }
      
    } catch (error) {
      console.log('❌ File system debug failed:', error.response?.data?.error || error.message);
    }
    
    // Test 2: Get document list
    console.log('\n3. Getting document list...');
    const documentsResponse = await apiClient.get('/documents');
    const documents = documentsResponse.data.data.documents;
    
    if (documents.length === 0) {
      console.log('❌ No documents found to test');
      return false;
    }
    
    const testDoc = documents[0];
    console.log(`✅ Found document to test: ${testDoc.file_name} (ID: ${testDoc.id})`);
    
    // Test 3: Test enhanced document info
    console.log('\n4. Testing enhanced document info...');
    try {
      const docInfoResponse = await apiClient.get(`/documents/${testDoc.id}/info`);
      const docInfo = docInfoResponse.data.data.document;
      
      console.log('✅ Enhanced document info endpoint working');
      console.log(`   File Name: ${docInfo.file_name}`);
      console.log(`   Type: ${docInfo.document_type}`);
      console.log(`   Status: ${docInfo.verification_status}`);
      console.log(`   File Exists: ${docInfo.file_exists ? '✅' : '❌'}`);
      console.log(`   File Size: ${docInfo.file_size_formatted || 'Unknown'}`);
      console.log(`   Database Path: ${docInfo.file_path}`);
      console.log(`   Actual Path: ${docInfo.actual_file_path || 'Not found'}`);
      
      // Test 4: Test document download if file exists
      if (docInfo.file_exists) {
        console.log('\n5. Testing document download...');
        try {
          const downloadResponse = await apiClient.get(`/documents/${testDoc.id}/download`, {
            responseType: 'arraybuffer'
          });
          
          console.log('✅ Document download working!');
          console.log(`   Content-Type: ${downloadResponse.headers['content-type']}`);
          console.log(`   Content-Length: ${downloadResponse.headers['content-length']} bytes`);
          console.log(`   Status: ${downloadResponse.status}`);
          
        } catch (downloadError) {
          console.log('❌ Document download failed:', downloadError.response?.status, downloadError.message);
          if (downloadError.response?.data) {
            console.log('   Error details:', downloadError.response.data);
          }
        }
      } else {
        console.log('\n5. ⚠️  Document file not found, cannot test download');
        console.log('   This indicates the file upload/storage system needs investigation');
      }
      
    } catch (error) {
      console.log('❌ Document info test failed:', error.response?.data?.error || error.message);
      if (error.response?.data?.debug) {
        console.log('   Debug info:', error.response.data.debug);
      }
    }
    
    console.log('\n' + '='.repeat(60));
    console.log('🎯 DOCUMENT FIX TEST SUMMARY:');
    console.log('='.repeat(60));
    
    return true;
    
  } catch (error) {
    console.error('❌ Document fix test failed:', error.response?.data || error.message);
    return false;
  }
}

// Run the test
testDocumentFix().then(success => {
  if (success) {
    console.log('\n🎉 Document fix test completed!');
  } else {
    console.log('\n⚠️  Document fix test encountered issues.');
  }
  process.exit(success ? 0 : 1);
}).catch(error => {
  console.error('❌ Test script failed:', error);
  process.exit(1);
});
