/**
 * Test Token Validity - Browser Console Script
 * 
 * Run this in the browser console to check if your JWT token is valid
 */

function testTokenValidity() {
  console.log('🔍 Testing JWT Token Validity');
  
  const token = localStorage.getItem('token');
  
  if (!token) {
    console.error('❌ No token found in localStorage');
    return;
  }
  
  console.log('✅ Token found in localStorage');
  console.log('Token length:', token.length);
  console.log('Token start:', token.substring(0, 30) + '...');
  
  try {
    // Decode the JWT payload (without verification)
    const parts = token.split('.');
    if (parts.length !== 3) {
      console.error('❌ Invalid JWT format - should have 3 parts');
      return;
    }
    
    const payload = JSON.parse(atob(parts[1]));
    console.log('✅ Token payload decoded:', payload);
    
    const currentTime = Math.floor(Date.now() / 1000);
    const isExpired = payload.exp < currentTime;
    
    console.log('⏰ Token expiration check:');
    console.log('  Current time:', currentTime, '(' + new Date().toISOString() + ')');
    console.log('  Token expires:', payload.exp, '(' + new Date(payload.exp * 1000).toISOString() + ')');
    console.log('  Is expired:', isExpired ? '❌ YES' : '✅ NO');
    
    if (isExpired) {
      console.error('🚨 TOKEN IS EXPIRED! This is likely the cause of the 401 error.');
      console.log('💡 Solution: Log out and log back in to get a fresh token.');
    } else {
      console.log('✅ Token is still valid');
      console.log('⏳ Time until expiration:', Math.floor((payload.exp - currentTime) / 60), 'minutes');
    }
    
    // Test a simple authenticated request
    console.log('🧪 Testing authenticated request...');
    fetch('/api/auth/profile', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
    .then(response => {
      console.log('📡 Auth test response status:', response.status);
      if (response.status === 200) {
        console.log('✅ Token works for regular authenticated requests');
      } else {
        console.error('❌ Token fails for regular authenticated requests');
      }
      return response.json();
    })
    .then(data => {
      console.log('📡 Auth test response data:', data);
    })
    .catch(error => {
      console.error('❌ Auth test failed:', error);
    });
    
  } catch (error) {
    console.error('❌ Error decoding token:', error);
  }
}

// Auto-run the test
testTokenValidity();
