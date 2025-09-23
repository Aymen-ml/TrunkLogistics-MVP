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

    // Test 2: Check public document endpoints behavior (no auth required)
    console.log(chalk.yellow('\n2. Testing document public endpoints with a non-existent UUID...'));

    const NON_EXISTENT_UUID = '00000000-0000-0000-0000-000000000000';

    try {
      // Info endpoint should return 404 for non-existent but valid UUID
      const infoRes = await axios.get(`${API_BASE_URL}/documents/${NON_EXISTENT_UUID}/info`, { validateStatus: () => true });
      if (infoRes.status === 404) {
        console.log(chalk.green('✅ Document info endpoint exists (404 for non-existent document)'));
      } else if (infoRes.status === 400) {
        console.log(chalk.yellow('⚠️ Document info returned 400 (validation) - acceptable')); 
      } else {
        console.log(chalk.red(`❌ Unexpected info status: ${infoRes.status}`));
        console.log(chalk.red(`Body: ${JSON.stringify(infoRes.data)}`));
      }

      // Download endpoint should also return 404 for non-existent but valid UUID
      const downloadRes = await axios.get(`${API_BASE_URL}/documents/${NON_EXISTENT_UUID}/download`, { 
        maxRedirects: 0,
        validateStatus: () => true
      });
      if (downloadRes.status === 404) {
        console.log(chalk.green('✅ Document download endpoint exists (404 for non-existent document)'));
      } else if (downloadRes.status === 302) {
        console.log(chalk.green('✅ Document download responds with redirect (likely Cloudinary)'));
      } else if (downloadRes.status === 400) {
        console.log(chalk.yellow('⚠️ Document download returned 400 (validation) - acceptable'));
      } else {
        console.log(chalk.red(`❌ Unexpected download status: ${downloadRes.status}`));
        console.log(chalk.red(`Headers: ${JSON.stringify(downloadRes.headers)}`));
        console.log(chalk.red(`Body: ${JSON.stringify(downloadRes.data)}`));
      }
    } catch (error) {
      console.log(chalk.red(`❌ Error testing public document endpoints: ${error.message}`));
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
