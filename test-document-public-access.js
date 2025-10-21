#!/usr/bin/env node

/**
 * Test Public Document Access
 * 
 * This script tests if the document endpoints are truly public and accessible
 */

import axios from 'axios';
import chalk from 'chalk';

const API_BASE_URL = 'https://trucklogistics-api.onrender.com/api';

async function testPublicDocumentAccess() {
  console.log(chalk.blue('🔍 Testing Public Document Access\n'));

  try {
    // Test 1: Check a known document ID (from your previous error)
    const documentId = '60a21793-4586-413b-9f61-ecbe529552c6';
    
    console.log(chalk.yellow('1. Testing document info endpoint without any headers...'));
    
    try {
      const response = await axios.get(`${API_BASE_URL}/documents/${documentId}/info`, {
        headers: {
          // Explicitly no Authorization header
        },
        timeout: 10000
      });
      
      console.log(chalk.green('✅ Document info endpoint accessible'));
      console.log(chalk.gray('Response status:', response.status));
      console.log(chalk.gray('Document info:', JSON.stringify(response.data, null, 2)));
    } catch (error) {
      console.log(chalk.red('❌ Document info endpoint failed:'));
      console.log(chalk.red('Status:', error.response?.status));
      console.log(chalk.red('Error:', error.response?.data || error.message));
      
      // Check if it's still a 401
      if (error.response?.status === 401) {
        console.log(chalk.red('\n🚨 STILL GETTING 401 - Something is still requiring authentication!'));
      }
    }

    console.log(chalk.yellow('\n2. Testing document download endpoint without any headers...'));
    
    try {
      const response = await axios.get(`${API_BASE_URL}/documents/${documentId}/download`, {
        headers: {
          // Explicitly no Authorization header
        },
        responseType: 'blob',
        timeout: 30000
      });
      
      console.log(chalk.green('✅ Document download endpoint accessible'));
      console.log(chalk.gray('Response status:', response.status));
      console.log(chalk.gray('Content type:', response.headers['content-type']));
      console.log(chalk.gray('Content length:', response.headers['content-length']));
    } catch (error) {
      console.log(chalk.red('❌ Document download endpoint failed:'));
      console.log(chalk.red('Status:', error.response?.status));
      console.log(chalk.red('Error:', error.response?.data || error.message));
      
      // Check if it's still a 401
      if (error.response?.status === 401) {
        console.log(chalk.red('\n🚨 STILL GETTING 401 - Something is still requiring authentication!'));
      }
    }

    console.log(chalk.yellow('\n3. Testing with a different document ID to see if it\'s document-specific...'));
    
    try {
      const response = await axios.get(`${API_BASE_URL}/documents/test-id/info`, {
        headers: {},
        timeout: 10000
      });
      
      console.log(chalk.green('✅ Different document endpoint accessible'));
    } catch (error) {
      console.log(chalk.gray('Expected result - different document:'));
      console.log(chalk.gray('Status:', error.response?.status));
      
      if (error.response?.status === 404) {
        console.log(chalk.green('✅ Got 404 (expected) - means endpoint is accessible but document not found'));
      } else if (error.response?.status === 401) {
        console.log(chalk.red('❌ Still getting 401 - authentication is still being enforced'));
      }
    }

  } catch (error) {
    console.error(chalk.red('❌ Test failed:'), error.message);
  }
}

// Run the test
testPublicDocumentAccess().catch(console.error);
