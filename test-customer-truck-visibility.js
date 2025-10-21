import fetch from 'node-fetch';

const API_BASE = 'https://trucklogistics-api.onrender.com';

async function testCustomerTruckVisibility() {
  try {
    console.log('🔍 Testing customer truck visibility...\n');
    
    // First, let's try to login as a customer
    console.log('1. Attempting to login as customer...');
    
    // We need to find a customer account or create one
    // Let's first check if we can get trucks without authentication to see the difference
    
    console.log('2. Testing unauthenticated truck access (should fail)...');
    try {
      const unauthResponse = await fetch(`${API_BASE}/api/trucks`);
      const unauthData = await unauthResponse.json();
      console.log('Unauthenticated response:', unauthData);
    } catch (error) {
      console.log('Unauthenticated request failed as expected:', error.message);
    }
    
    // Let's try to register a test customer first
    console.log('\n3. Registering a test customer...');
    const customerData = {
      email: `testcustomer${Date.now()}@example.com`,
      password: 'testpass123',
      firstName: 'Test',
      lastName: 'Customer',
      role: 'customer',
      phone: '+1234567890',
      companyName: 'Test Company',
      businessType: 'logistics',
      streetAddress: '123 Test St',
      city: 'Test City',
      postalCode: '12345'
    };
    
    const registerResponse = await fetch(`${API_BASE}/api/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(customerData)
    });
    
    const registerResult = await registerResponse.json();
    console.log('Registration result:', registerResult);
    
    if (!registerResult.success) {
      console.log('Registration failed, trying to login with existing customer...');
      
      // Try to login with a known customer account
      const loginResponse = await fetch(`${API_BASE}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email: 'customer@example.com', // Try a common test email
          password: 'customer123'
        })
      });
      
      const loginResult = await loginResponse.json();
      console.log('Login result:', loginResult);
      
      if (!loginResult.success) {
        console.log('❌ Could not authenticate as customer. Let\'s check admin view instead...');
        
        // Try admin login
        const adminLoginResponse = await fetch(`${API_BASE}/api/auth/login`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            email: 'korichiaymen27@gmail.com',
            password: 'admin123'
          })
        });
        
        const adminLoginResult = await adminLoginResponse.json();
        console.log('Admin login result:', adminLoginResult);
        
        if (adminLoginResult.success) {
          const adminToken = adminLoginResult.data.token;
          
          // Get trucks as admin
          console.log('\n4. Getting trucks as admin...');
          const adminTrucksResponse = await fetch(`${API_BASE}/api/trucks`, {
            headers: {
              'Authorization': `Bearer ${adminToken}`
            }
          });
          
          const adminTrucksData = await adminTrucksResponse.json();
          console.log('Admin trucks response:', JSON.stringify(adminTrucksData, null, 2));
          
          // Get all trucks for admin dashboard
          console.log('\n5. Getting all trucks for admin dashboard...');
          const allTrucksResponse = await fetch(`${API_BASE}/api/trucks/admin/all`, {
            headers: {
              'Authorization': `Bearer ${adminToken}`
            }
          });
          
          const allTrucksData = await allTrucksResponse.json();
          console.log('All trucks for admin:', JSON.stringify(allTrucksData, null, 2));
        }
        
        return;
      }
      
      const customerToken = loginResult.data.token;
      
      // Now try to get trucks as customer
      console.log('\n4. Getting trucks as authenticated customer...');
      const trucksResponse = await fetch(`${API_BASE}/api/trucks`, {
        headers: {
          'Authorization': `Bearer ${customerToken}`
        }
      });
      
      const trucksData = await trucksResponse.json();
      console.log('Customer trucks response:', JSON.stringify(trucksData, null, 2));
      
    } else {
      // Registration successful, use the token
      const customerToken = registerResult.data.token;
      
      console.log('\n4. Getting trucks as newly registered customer...');
      const trucksResponse = await fetch(`${API_BASE}/api/trucks`, {
        headers: {
          'Authorization': `Bearer ${customerToken}`
        }
      });
      
      const trucksData = await trucksResponse.json();
      console.log('Customer trucks response:', JSON.stringify(trucksData, null, 2));
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

testCustomerTruckVisibility();