import fetch from 'node-fetch';

const API_BASE = 'https://trucklogistics-api.onrender.com';

async function testCustomerFinal() {
  try {
    console.log('🔍 Final customer test with verified email...\n');
    
    // Register a test customer
    console.log('1. Registering a test customer...');
    const customerData = {
      email: `testcustomer${Date.now()}@example.com`,
      password: 'testpass123',
      firstName: 'Test',
      lastName: 'Customer',
      role: 'customer',
      phone: '+1234567890',
      companyName: 'Test Company',
      businessType: 'company',
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
    console.log('Registration result:', registerResult.success ? '✅ Success' : '❌ Failed');
    
    if (registerResult.success) {
      const customerToken = registerResult.data.token;
      
      // Try to get trucks (should work now with fixed model)
      console.log('\n2. Getting trucks as customer...');
      const trucksResponse = await fetch(`${API_BASE}/api/trucks`, {
        headers: {
          'Authorization': `Bearer ${customerToken}`
        }
      });
      
      const trucksData = await trucksResponse.json();
      console.log('Customer trucks response:', trucksData.success ? '✅ Success' : '❌ Failed');
      
      if (trucksData.success) {
        console.log(`\n🎉 SUCCESS! Customer can see ${trucksData.data.trucks.length} trucks:`);
        trucksData.data.trucks.forEach(truck => {
          console.log(`  - ${truck.license_plate} (${truck.truck_type}) - ${truck.company_name}`);
        });
        
        console.log('\n📊 Pagination info:');
        console.log(`  - Current page: ${trucksData.data.pagination.currentPage}`);
        console.log(`  - Total pages: ${trucksData.data.pagination.totalPages}`);
        console.log(`  - Total count: ${trucksData.data.pagination.totalCount}`);
        
      } else {
        console.log(`\n❌ FAILED: ${trucksData.error}`);
        
        // Check if it's an email verification issue
        if (trucksData.error.includes('email') || trucksData.error.includes('verification')) {
          console.log('💡 This might be due to email verification requirement');
        }
      }
    } else {
      console.log('❌ Registration failed:', registerResult);
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

testCustomerFinal();