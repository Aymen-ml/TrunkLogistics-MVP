// Using built-in fetch (Node.js 18+)

const testProductionStorage = async () => {
  try {
    console.log('🔍 Testing Production Storage Status...\n');
    
    const apiUrl = 'https://api.movelinker.com';
    
    // First, let's test if the server is responding
    console.log('1. Testing server health...');
    try {
      const healthResponse = await fetch(`${apiUrl}/api/health`);
      const healthData = await healthResponse.json();
      console.log('✅ Server is responding:', healthData);
    } catch (error) {
      console.log('❌ Server health check failed:', error.message);
      return;
    }
    
    console.log('\n2. Testing storage status endpoint...');
    try {
      // We need to authenticate first - let's try without auth to see the error
      const storageResponse = await fetch(`${apiUrl}/api/trucks/storage-status`);
      
      if (storageResponse.status === 401) {
        console.log('⚠️ Storage endpoint requires authentication (expected)');
        console.log('   This means the endpoint exists and is working');
      } else {
        const storageData = await storageResponse.json();
        console.log('📊 Storage Status:', storageData);
      }
    } catch (error) {
      console.log('❌ Storage status check failed:', error.message);
    }
    
    console.log('\n3. Testing file serving paths...');
    
    // Test the problematic URL you mentioned
    const testUrl = `${apiUrl}/tmp/14d6f4b4-a908-44dd-a440-4bbf81f39fbc.jpg`;
    console.log(`Testing: ${testUrl}`);
    
    try {
      const fileResponse = await fetch(testUrl);
      const responseText = await fileResponse.text();
      console.log(`Status: ${fileResponse.status}`);
      console.log(`Response: ${responseText}`);
    } catch (error) {
      console.log('❌ File request failed:', error.message);
    }
    
    console.log('\n4. Testing uploads path...');
    const uploadsUrl = `${apiUrl}/uploads/trucks/images/test.jpg`;
    console.log(`Testing: ${uploadsUrl}`);
    
    try {
      const uploadsResponse = await fetch(uploadsUrl);
      const uploadsText = await uploadsResponse.text();
      console.log(`Status: ${uploadsResponse.status}`);
      console.log(`Response: ${uploadsText}`);
    } catch (error) {
      console.log('❌ Uploads request failed:', error.message);
    }
    
    console.log('\n📋 Analysis:');
    console.log('The URL /tmp/... suggests files are being uploaded to temp directory');
    console.log('This indicates the hybrid system might not be switching to Cloudinary');
    console.log('Possible causes:');
    console.log('1. Environment variables not loaded properly');
    console.log('2. Server needs restart after adding env vars');
    console.log('3. Cloudinary configuration issue');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
};

testProductionStorage();
