// Test the API controller directly
import { getTrucks } from './server/src/controllers/truckController.js';

async function testApiDirect() {
  try {
    console.log('🔍 Testing API controller directly...\n');
    
    // Mock request and response objects for a customer
    const mockReq = {
      user: {
        id: 'test-customer-id',
        email: 'test@customer.com',
        role: 'customer',
        email_verified: true // Set to true to bypass email verification
      },
      query: {}
    };
    
    let responseData = null;
    let statusCode = 200;
    
    const mockRes = {
      json: (data) => {
        responseData = data;
        console.log('API Response:', JSON.stringify(data, null, 2));
        return mockRes;
      },
      status: (code) => {
        statusCode = code;
        console.log('Status Code:', code);
        return mockRes;
      }
    };
    
    // Test the controller
    console.log('Calling getTrucks controller...');
    await getTrucks(mockReq, mockRes);
    
    if (responseData && responseData.success) {
      console.log(`\n✅ SUCCESS! Found ${responseData.data.trucks.length} trucks for customer`);
    } else {
      console.log(`\n❌ FAILED: ${responseData ? responseData.error : 'No response'}`);
    }
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Test failed:', error);
    process.exit(1);
  }
}

testApiDirect();