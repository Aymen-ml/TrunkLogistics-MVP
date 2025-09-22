import { getStorageInfo } from './server/src/utils/hybridUpload.js';
import logger from './server/src/utils/logger.js';

const testHybridStorage = async () => {
  try {
    console.log('🔍 Testing Hybrid Storage System...\n');
    
    // Get storage configuration
    const storageInfo = getStorageInfo();
    
    console.log('📊 Storage Configuration:');
    console.log(`├── Cloudinary Configured: ${storageInfo.cloudinaryConfigured ? '✅ Yes' : '❌ No'}`);
    console.log(`├── Storage Type: ${storageInfo.storageType}`);
    console.log(`└── Cloud Name: ${storageInfo.cloudName}\n`);
    
    if (storageInfo.cloudinaryConfigured) {
      console.log('✅ Cloudinary Integration Active');
      console.log('   • Files will be stored in Cloudinary cloud storage');
      console.log('   • Files will persist across deployments');
      console.log('   • Global CDN delivery enabled');
      console.log('   • Automatic image optimization active\n');
    } else {
      console.log('⚠️ Local Storage Fallback Active');
      console.log('   • Files stored locally (ephemeral on Render)');
      console.log('   • Files may be lost on deployment restart');
      console.log('   • Consider setting up Cloudinary for production\n');
    }
    
    // Environment variables check
    console.log('🔧 Environment Variables:');
    const requiredVars = [
      'CLOUDINARY_CLOUD_NAME',
      'CLOUDINARY_API_KEY', 
      'CLOUDINARY_API_SECRET'
    ];
    
    requiredVars.forEach(varName => {
      const value = process.env[varName];
      const status = value ? '✅ Set' : '❌ Missing';
      const display = value ? `${value.substring(0, 8)}...` : 'Not set';
      console.log(`├── ${varName}: ${status} (${display})`);
    });
    
    console.log('\n📋 Next Steps:');
    if (!storageInfo.cloudinaryConfigured) {
      console.log('1. Run: node setup-cloudinary.js');
      console.log('2. Add Cloudinary credentials to Render environment variables');
      console.log('3. Redeploy application');
      console.log('4. Test file uploads');
    } else {
      console.log('1. ✅ Cloudinary is configured and ready');
      console.log('2. Test file uploads in your application');
      console.log('3. Files will now persist across deployments');
    }
    
    console.log('\n🎯 Benefits After Cloudinary Setup:');
    console.log('• ✅ Persistent file storage (survives deployments)');
    console.log('• ✅ Global CDN for fast file delivery');
    console.log('• ✅ Automatic image optimization');
    console.log('• ✅ Professional file management');
    console.log('• ✅ Free tier: 25GB storage + 25GB bandwidth/month\n');
    
  } catch (error) {
    console.error('❌ Error testing storage system:', error);
  }
};

testHybridStorage();
