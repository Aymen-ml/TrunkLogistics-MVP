#!/usr/bin/env node

/**
 * Cloudinary Setup Script for TruckLogistics
 * 
 * This script helps you set up Cloudinary cloud storage for your TruckLogistics application.
 * It will guide you through the configuration process and test the connection.
 */

import { v2 as cloudinary } from 'cloudinary';
import readline from 'readline';
import chalk from 'chalk';
import dotenv from 'dotenv';

dotenv.config();

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const question = (prompt) => {
  return new Promise((resolve) => {
    rl.question(prompt, resolve);
  });
};

console.log(chalk.blue.bold('\n🚀 TruckLogistics Cloudinary Setup\n'));

const setupCloudinary = async () => {
  try {
    console.log(chalk.yellow('📋 Step 1: Cloudinary Account Setup'));
    console.log('If you don\'t have a Cloudinary account:');
    console.log('1. Go to https://cloudinary.com');
    console.log('2. Sign up for a free account');
    console.log('3. Get your credentials from the dashboard\n');

    // Check if already configured
    if (process.env.CLOUDINARY_CLOUD_NAME && 
        process.env.CLOUDINARY_API_KEY && 
        process.env.CLOUDINARY_API_SECRET) {
      
      console.log(chalk.green('✅ Cloudinary credentials found in environment!'));
      console.log(`Cloud Name: ${process.env.CLOUDINARY_CLOUD_NAME}`);
      console.log(`API Key: ${process.env.CLOUDINARY_API_KEY}`);
      console.log(`API Secret: ${'*'.repeat(process.env.CLOUDINARY_API_SECRET.length)}\n`);
      
      const useExisting = await question('Use existing credentials? (y/n): ');
      if (useExisting.toLowerCase() === 'y') {
        await testCloudinaryConnection();
        return;
      }
    }

    console.log(chalk.yellow('\n📝 Step 2: Enter Your Cloudinary Credentials'));
    
    const cloudName = await question('Enter your Cloud Name: ');
    const apiKey = await question('Enter your API Key: ');
    const apiSecret = await question('Enter your API Secret: ');

    // Configure Cloudinary
    cloudinary.config({
      cloud_name: cloudName,
      api_key: apiKey,
      api_secret: apiSecret
    });

    console.log(chalk.yellow('\n🔧 Step 3: Testing Connection...'));
    
    // Test the connection
    try {
      const result = await cloudinary.api.ping();
      console.log(chalk.green('✅ Cloudinary connection successful!'));
      console.log(`Status: ${result.status}\n`);
    } catch (error) {
      console.log(chalk.red('❌ Cloudinary connection failed!'));
      console.log(`Error: ${error.message}\n`);
      throw error;
    }

    console.log(chalk.yellow('📁 Step 4: Creating Folder Structure...'));
    
    // Create folder structure (folders are created automatically when first file is uploaded)
    console.log('Folders will be created automatically:');
    console.log('- trucklogistics/trucks/images/');
    console.log('- trucklogistics/trucks/documents/\n');

    console.log(chalk.yellow('⚙️ Step 5: Environment Variables'));
    console.log('Add these to your Render environment variables:');
    console.log(chalk.cyan(`CLOUDINARY_CLOUD_NAME=${cloudName}`));
    console.log(chalk.cyan(`CLOUDINARY_API_KEY=${apiKey}`));
    console.log(chalk.cyan(`CLOUDINARY_API_SECRET=${apiSecret}\n`));

    console.log(chalk.green.bold('🎉 Cloudinary setup completed successfully!'));
    console.log('\nNext steps:');
    console.log('1. Add the environment variables to Render');
    console.log('2. Redeploy your application');
    console.log('3. Test file uploads');
    console.log('4. Files will now persist across deployments!\n');

  } catch (error) {
    console.log(chalk.red('❌ Setup failed:', error.message));
    process.exit(1);
  } finally {
    rl.close();
  }
};

const testCloudinaryConnection = async () => {
  try {
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET
    });

    console.log(chalk.yellow('🔧 Testing existing Cloudinary connection...'));
    const result = await cloudinary.api.ping();
    console.log(chalk.green('✅ Cloudinary connection successful!'));
    console.log(`Status: ${result.status}`);
    
    // Get usage info
    try {
      const usage = await cloudinary.api.usage();
      console.log(chalk.blue('\n📊 Account Usage:'));
      console.log(`Credits used: ${usage.credits.used_percent}%`);
      console.log(`Storage: ${(usage.storage.used_bytes / 1024 / 1024).toFixed(2)} MB`);
      console.log(`Bandwidth: ${(usage.bandwidth.used_bytes / 1024 / 1024).toFixed(2)} MB`);
    } catch (usageError) {
      console.log(chalk.yellow('⚠️ Could not fetch usage info (this is normal for some accounts)'));
    }

    console.log(chalk.green.bold('\n🎉 Cloudinary is ready to use!'));
    
  } catch (error) {
    console.log(chalk.red('❌ Connection test failed:', error.message));
    console.log('\nPlease check your credentials and try again.');
  }
};

// Check if this is being run directly
if (import.meta.url === `file://${process.argv[1]}`) {
  setupCloudinary();
}

export { setupCloudinary, testCloudinaryConnection };
