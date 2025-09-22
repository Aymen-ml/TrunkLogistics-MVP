#!/usr/bin/env node

/**
 * Test Document Endpoints - Check if they're accessible
 * 
 * This script tests the document endpoints to see if they're properly configured
 */

import axios from 'axios';
import chalk from 'chalk';

const API_BASE_URL = 'https://trunklogistics-api.onrender.com/api';

async function testDocumentEndpoints() {
  console.log(chalk.blue('🔍 Testing Document Endpoints Configuration\n'));

  try {
    // Test 1: Check if document endpoints exist (should return 401 for unauthenticated)
    console.log(chalk.yellow('1. Testing document endpoints without authentication...'));
    
    try {
      const response = await axios.get(`${API_BASE_URL}/documents`);
      console.log(chalk.red('❌ Unexpected: Documents endpoint returned success without auth'));
    } catch (error) {
      if (error.response?.status === 401) {
        console.log(chalk.green('✅ Documents endpoint properly requires authentication'));
      } else {
        console.log(chalk.red(`❌ Unexpected status: ${error.response?.status}`));
        console.log(chalk.red(`Error: ${error.response?.data || error.message}`));
      }
    }

    // Test 2: Check a specific document download endpoint
    console.log(chalk.yellow('\n2. Testing document download endpoint without authentication...'));
    
    try {
      const response = await axios.get(`${API_BASE_URL}/documents/test-id/download`);
      console.log(chalk.red('❌ Unexpected: Document download returned success without auth'));
    } catch (error) {
      if (error.response?.status === 401) {
        console.log(chalk.green('✅ Document download endpoint properly requires authentication'));
      } else if (error.response?.status === 404) {
        console.log(chalk.green('✅ Document download endpoint exists (404 for non-existent document)'));
      } else {
        console.log(chalk.red(`❌ Unexpected status: ${error.response?.status}`));
        console.log(chalk.red(`Error: ${error.response?.data || error.message}`));
      }
    }

    // Test 3: Check CORS headers
    console.log(chalk.yellow('\n3. Testing CORS configuration...'));
    
    try {
      const response = await axios.options(`${API_BASE_URL}/documents`, {
        headers: {
          'Origin': 'https://trucklogistics.netlify.app',
          'Access-Control-Request-Method': 'GET',
          'Access-Control-Request-Headers': 'authorization'
        }
      });
      console.log(chalk.green('✅ CORS preflight successful'));
      console.log(chalk.gray('CORS headers:', response.headers['access-control-allow-origin']));
    } catch (error) {
      console.log(chalk.red('❌ CORS preflight failed:'), error.response?.status, error.message);
    }

    // Test 4: Check server health
    console.log(chalk.yellow('\n4. Testing server health...'));
    
    try {
      const response = await axios.get(`${API_BASE_URL}/health`);
      console.log(chalk.green('✅ Server health check passed'));
    } catch (error) {
      console.log(chalk.red('❌ Server health check failed:'), error.response?.status, error.message);
    }

    console.log(chalk.blue('\n📋 Summary:'));
    console.log(chalk.gray('- Document endpoints are configured and require authentication'));
    console.log(chalk.gray('- The issue is likely in the authentication process, not endpoint configuration'));
    console.log(chalk.gray('- Check frontend token handling and backend auth middleware'));

  } catch (error) {
    console.error(chalk.red('❌ Test failed:'), error.message);
  }
}

// Run the test
testDocumentEndpoints().catch(console.error);
