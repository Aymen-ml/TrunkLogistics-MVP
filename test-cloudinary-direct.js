#!/usr/bin/env node

/**
 * Test Direct Cloudinary Access
 */

import axios from 'axios';
import chalk from 'chalk';

async function testCloudinaryDirect() {
  console.log(chalk.blue('🔍 Testing Direct Cloudinary Access\n'));

  const cloudinaryUrl = 'https://res.cloudinary.com/dgpwqggxb/image/upload/v1758535491/trunklogistics/trucks/documents/inspectionDoc_1758535491181_kiu2z7u00n.pdf';
  
  try {
    console.log(chalk.yellow('Testing direct Cloudinary URL access...'));
    
    const response = await axios.get(cloudinaryUrl, {
      responseType: 'stream',
      timeout: 30000,
      maxRedirects: 5
    });
    
    console.log(chalk.green('✅ Direct Cloudinary access successful'));
    console.log(chalk.gray('Status:', response.status));
    console.log(chalk.gray('Content-Type:', response.headers['content-type']));
    console.log(chalk.gray('Content-Length:', response.headers['content-length']));
    
  } catch (error) {
    console.log(chalk.red('❌ Direct Cloudinary access failed:'));
    console.log(chalk.red('Status:', error.response?.status));
    console.log(chalk.red('Error:', error.response?.data || error.message));
  }
}

testCloudinaryDirect().catch(console.error);
