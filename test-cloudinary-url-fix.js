// Test script to verify Cloudinary URL handling fix

const testCloudinaryURLFix = async () => {
  try {
    console.log('🔍 Testing Cloudinary URL Fix...\n');
    
    const apiUrl = 'https://api.movelinker.com';
    
    // Test the problematic URL pattern that was failing before
    const problematicUrl = `${apiUrl}/https://res.cloudinary.com/dgpwqggxb/image/upload/v1758533467/trucklogistics/trucks/images/images_1758533466587_guucvzsc9tc.jpg`;
    
    console.log('1. Testing the problematic URL pattern...');
    console.log(`URL: ${problematicUrl}`);
    
    try {
      const response = await fetch(problematicUrl, { 
        method: 'HEAD', // Use HEAD to avoid downloading the full file
        redirect: 'manual' // Don't follow redirects automatically
      });
      
      console.log(`Status: ${response.status}`);
      console.log(`Status Text: ${response.statusText}`);
      
      if (response.status === 302) {
        const location = response.headers.get('location');
        console.log(`✅ Redirect working! Location: ${location}`);
        
        // Test if the redirected URL is accessible
        if (location) {
          console.log('\n2. Testing redirected Cloudinary URL...');
          const cloudinaryResponse = await fetch(location, { method: 'HEAD' });
          console.log(`Cloudinary Status: ${cloudinaryResponse.status}`);
          
          if (cloudinaryResponse.status === 200) {
            console.log('✅ Cloudinary file is accessible!');
          } else {
            console.log('⚠️ Cloudinary file may not exist (expected for test)');
          }
        }
      } else if (response.status === 404) {
        const errorText = await response.text();
        console.log(`❌ Still getting 404: ${errorText}`);
      }
      
    } catch (error) {
      console.log(`❌ Request failed: ${error.message}`);
    }
    
    console.log('\n3. Testing uploads path...');
    const uploadsUrl = `${apiUrl}/uploads/trucks/images/test.jpg`;
    
    try {
      const uploadsResponse = await fetch(uploadsUrl, { method: 'HEAD' });
      console.log(`Uploads Status: ${uploadsResponse.status}`);
      
      if (uploadsResponse.status === 404) {
        console.log('✅ Local uploads return proper 404 (expected)');
      }
    } catch (error) {
      console.log(`Uploads test failed: ${error.message}`);
    }
    
    console.log('\n📋 Expected Results After Fix:');
    console.log('✅ Cloudinary URLs should redirect (302) to actual Cloudinary');
    console.log('✅ Documents should redirect to Cloudinary for viewing');
    console.log('✅ Images should be accessible directly from Cloudinary');
    console.log('✅ No more "/https://res.cloudinary.com/..." URL issues');
    
    console.log('\n🎯 How to Test:');
    console.log('1. Upload a new truck with images/documents');
    console.log('2. Try viewing the images in truck details');
    console.log('3. Try downloading/viewing documents');
    console.log('4. Check that URLs are direct Cloudinary URLs');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
};

testCloudinaryURLFix();
