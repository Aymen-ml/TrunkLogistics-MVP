// Final test to fix the truck visibility issue

import { query } from './server/src/config/database.js';

// Test the exact issue by implementing the search logic correctly
async function testFinalFix() {
  try {
    console.log('🔍 Final test to fix truck visibility...\n');
    
    // Simulate customer search with proper parameters
    const filters = { onlyAvailable: true, page: 1, limit: 10 };
    
    let whereConditions = [];
    let values = [];
    let paramCount = 1;
    
    // For customers, only show available (active) trucks
    whereConditions.push(`t.status = $${paramCount}`);
    values.push('active');
    paramCount++;
    
    const page = parseInt(filters.page) || 1;
    const limit = parseInt(filters.limit) || 10;
    const offset = (page - 1) * limit;
    
    const whereClause = whereConditions.join(' AND ');
    
    // Customer query with proper syntax
    const queryText = `
      SELECT t.*, pp.company_name, pp.street_address as address, pp.city, pp.postal_code, pp.business_license,
              u.first_name, u.last_name, u.phone, u.email,
              COUNT(*) OVER() as total_count,
              pp.is_verified as provider_verified,
              u.is_active as user_active,
              CASE 
                WHEN COUNT(d.id) = 0 THEN false
                WHEN COUNT(d.id) = COUNT(CASE WHEN d.verification_status = 'approved' THEN 1 END) THEN true
                ELSE false
              END as documents_verified
       FROM trucks t
       JOIN provider_profiles pp ON t.provider_id = pp.id
       JOIN users u ON pp.user_id = u.id
       LEFT JOIN documents d ON d.entity_id = t.id AND d.entity_type = 'truck'
       WHERE ${whereClause}
         AND pp.is_verified = true
         AND u.is_active = true
       GROUP BY t.id, pp.id, u.id
       HAVING COUNT(d.id) > 0 
         AND COUNT(d.id) = COUNT(CASE WHEN d.verification_status = 'approved' THEN 1 END)
       ORDER BY t.created_at DESC
       LIMIT $${paramCount} OFFSET $${paramCount + 1}`;
    
    const queryValues = [...values, limit, offset];
    
    console.log('Query:', queryText);
    console.log('Values:', queryValues);
    
    const result = await query(queryText, queryValues);
    
    console.log('✅ SUCCESS! Found', result.rows.length, 'trucks visible to customers:');
    result.rows.forEach(truck => {
      console.log(`  - ${truck.license_plate} (${truck.truck_type}): docs_verified=${truck.documents_verified}`);
    });
    
    // Now test the API endpoint directly
    console.log('\n🌐 Testing API endpoint...');
    
    // Create a simple customer token for testing
    const testCustomerData = {
      id: 'test-customer-id',
      email: 'test@customer.com',
      role: 'customer',
      email_verified: true
    };
    
    // Import the controller and test it
    const { getTrucks } = await import('./server/src/controllers/truckController.js');
    
    // Mock request and response objects
    const mockReq = {
      user: testCustomerData,
      query: {}
    };
    
    const mockRes = {
      json: (data) => {
        console.log('API Response:', JSON.stringify(data, null, 2));
        return mockRes;
      },
      status: (code) => {
        console.log('Status Code:', code);
        return mockRes;
      }
    };
    
    // Test the controller
    await getTrucks(mockReq, mockRes);
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Test failed:', error);
    process.exit(1);
  }
}

testFinalFix();