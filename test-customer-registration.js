import fetch from 'node-fetch';

const API_BASE = 'https://api.movelinker.com';

async function testCustomerRegistration() {
  try {
    console.log('🔍 Testing customer registration and truck access...\n');
    
    // Register a test customer with correct business type
    console.log('1. Registering a test customer...');
    const customerData = {
      email: `testcustomer${Date.now()}@example.com`,
      password: 'testpass123',
      firstName: 'Test',
      lastName: 'Customer',
      role: 'customer',
      phone: '+1234567890',
      companyName: 'Test Company',
      businessType: 'company', // Fixed: use 'company' instead of 'logistics'
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
    
    if (registerResult.success) {
      const customerToken = registerResult.data.token;
      
      console.log('\n2. Getting trucks as newly registered customer...');
      const trucksResponse = await fetch(`${API_BASE}/api/trucks`, {
        headers: {
          'Authorization': `Bearer ${customerToken}`
        }
      });
      
      const trucksData = await trucksResponse.json();
      console.log('Customer trucks response:', JSON.stringify(trucksData, null, 2));
      
      if (trucksData.success) {
        console.log(`\n✅ SUCCESS: Customer can see ${trucksData.data.trucks.length} trucks`);
        trucksData.data.trucks.forEach(truck => {
          console.log(`  - Truck: ${truck.license_plate} (${truck.truck_type})`);
        });
      } else {
        console.log(`\n❌ FAILED: Customer cannot see trucks - ${trucksData.error}`);
      }
    } else {
      console.log('❌ Registration failed:', registerResult);
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

testCustomerRegistration();