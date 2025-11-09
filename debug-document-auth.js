#!/usr/bin/env node

/**
 * Debug Document Authentication Issue
 * 
 * This script helps debug why document viewing is causing session expiration
 * and automatic logout.
 */

import axios from 'axios';
import chalk from 'chalk';

const API_BASE_URL = 'https://api.movelinker.com/api';

// Test credentials - you'll need to replace these with actual credentials
const TEST_CREDENTIALS = {
  email: 'korichi.aymene.ml@gmail.com', // Admin account from memory
  password: 'admin123'
};

async function debugDocumentAuth() {
  console.log(chalk.blue('🔍 Debug Document Authentication Issue\n'));

  try {
    // Step 1: Login to get a token
    console.log(chalk.yellow('1. Logging in to get authentication token...'));
    const loginResponse = await axios.post(`${API_BASE_URL}/auth/login`, TEST_CREDENTIALS);
    
    if (!loginResponse.data.success) {
      throw new Error('Login failed: ' + loginResponse.data.error);
    }

    const token = loginResponse.data.data.token;
    const user = loginResponse.data.data.user;
    console.log(chalk.green(`✅ Login successful! User: ${user.email} (${user.role})`));
    console.log(chalk.gray(`Token: ${token.substring(0, 20)}...`));

    // Step 2: Test basic authenticated endpoint
    console.log(chalk.yellow('\n2. Testing basic authenticated endpoint...'));
    const authHeaders = { Authorization: `Bearer ${token}` };
    
    try {
      const profileResponse = await axios.get(`${API_BASE_URL}/auth/profile`, { headers: authHeaders });
      console.log(chalk.green('✅ Basic authentication working'));
    } catch (error) {
      console.log(chalk.red('❌ Basic authentication failed:'), error.response?.data || error.message);
      return;
    }

    // Step 3: Get documents list
    console.log(chalk.yellow('\n3. Getting documents list...'));
    try {
      const documentsResponse = await axios.get(`${API_BASE_URL}/documents`, { headers: authHeaders });
      const documents = documentsResponse.data.data.documents;
      console.log(chalk.green(`✅ Documents list retrieved: ${documents.length} documents found`));
      
      if (documents.length === 0) {
        console.log(chalk.yellow('⚠️  No documents found to test with'));
        return;
      }

      // Step 4: Test document info endpoint
      const testDoc = documents[0];
      console.log(chalk.yellow(`\n4. Testing document info for document: ${testDoc.file_name || testDoc.id}`));
      
      try {
        const infoResponse = await axios.get(`${API_BASE_URL}/documents/${testDoc.id}/info`, { headers: authHeaders });
        console.log(chalk.green('✅ Document info endpoint working'));
        console.log(chalk.gray(`Document: ${infoResponse.data.data.document.file_name}`));
        console.log(chalk.gray(`File exists: ${infoResponse.data.data.document.file_exists}`));
      } catch (error) {
        console.log(chalk.red('❌ Document info failed:'), error.response?.status, error.response?.data || error.message);
      }

      // Step 5: Test document download endpoint
      console.log(chalk.yellow(`\n5. Testing document download for document: ${testDoc.file_name || testDoc.id}`));
      
      try {
        const downloadResponse = await axios.get(`${API_BASE_URL}/documents/${testDoc.id}/download`, { 
          headers: authHeaders,
          responseType: 'blob',
          timeout: 30000 // 30 seconds timeout
        });
        console.log(chalk.green('✅ Document download endpoint working'));
        console.log(chalk.gray(`Response type: ${downloadResponse.headers['content-type']}`));
        console.log(chalk.gray(`Response size: ${downloadResponse.data.size || 'unknown'} bytes`));
      } catch (error) {
        console.log(chalk.red('❌ Document download failed:'));
        console.log(chalk.red(`Status: ${error.response?.status}`));
        console.log(chalk.red(`Error: ${error.response?.data || error.message}`));
        
        // If it's a 401, this is the issue causing logout
        if (error.response?.status === 401) {
          console.log(chalk.red('\n🚨 FOUND THE ISSUE: Document download returning 401 (Unauthorized)'));
          console.log(chalk.red('This is what triggers the automatic logout in the frontend!'));
          
          // Try to get more details
          if (error.response.data) {
            console.log(chalk.red('Server response:', error.response.data));
          }
        }
      }

    } catch (error) {
      console.log(chalk.red('❌ Documents list failed:'), error.response?.data || error.message);
    }

  } catch (error) {
    console.error(chalk.red('❌ Debug failed:'), error.message);
    if (error.response) {
      console.error(chalk.red('Response status:'), error.response.status);
      console.error(chalk.red('Response data:'), error.response.data);
    }
  }
}

// Run the debug
debugDocumentAuth().catch(console.error);
