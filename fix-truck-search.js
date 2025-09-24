// This script will fix the truck search issue by testing the exact SQL queries

import { query } from './server/src/config/database.js';

async function testFixedQueries() {
  try {
    console.log('🔍 Testing fixed truck search queries...\n');
    
    // Test customer query with proper syntax
    console.log('1. Testing customer query...');
    const customerQuery = `
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
       WHERE t.status = $1
         AND pp.is_verified = true
         AND u.is_active = true
       GROUP BY t.id, pp.id, u.id
       HAVING COUNT(d.id) > 0 
         AND COUNT(d.id) = COUNT(CASE WHEN d.verification_status = 'approved' THEN 1 END)
       ORDER BY t.created_at DESC
       LIMIT $2 OFFSET $3`;
    
    const customerResult = await query(customerQuery, ['active', 10, 0]);
    console.log('✅ Customer query works! Found', customerResult.rows.length, 'trucks');
    
    customerResult.rows.forEach(truck => {
      console.log(`  - ${truck.license_plate}: docs_verified=${truck.documents_verified}, provider_verified=${truck.provider_verified}`);
    });
    
    // Test admin query with proper syntax
    console.log('\n2. Testing admin query...');
    const adminQuery = `
      SELECT t.*, pp.company_name, pp.street_address as address, pp.city, pp.postal_code, pp.business_license,
              u.first_name, u.last_name, u.phone, u.email,
              COUNT(*) OVER() as total_count,
              pp.is_verified as provider_verified,
              u.is_active as user_active,
              CASE 
                WHEN COUNT(d.id) = 0 THEN false
                WHEN COUNT(d.id) = COUNT(CASE WHEN d.verification_status = 'approved' THEN 1 END) THEN true
                ELSE false
              END as documents_verified,
              COUNT(d.id) as total_documents,
              COUNT(CASE WHEN d.verification_status = 'approved' THEN 1 END) as approved_documents,
              COUNT(CASE WHEN d.verification_status = 'pending' THEN 1 END) as pending_documents,
              COUNT(CASE WHEN d.verification_status = 'rejected' THEN 1 END) as rejected_documents
       FROM trucks t
       JOIN provider_profiles pp ON t.provider_id = pp.id
       JOIN users u ON pp.user_id = u.id
       LEFT JOIN documents d ON d.entity_id = t.id AND d.entity_type = 'truck'
       WHERE t.status IN ($1, $2)
       GROUP BY t.id, pp.id, u.id
       ORDER BY t.created_at DESC
       LIMIT $3 OFFSET $4`;
    
    const adminResult = await query(adminQuery, ['active', 'inactive', 10, 0]);
    console.log('✅ Admin query works! Found', adminResult.rows.length, 'trucks');
    
    adminResult.rows.forEach(truck => {
      console.log(`  - ${truck.license_plate}: total_docs=${truck.total_documents}, approved_docs=${truck.approved_documents}`);
    });
    
    console.log('\n✅ Both queries work correctly! The issue is in the Truck model template.');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Test failed:', error);
    process.exit(1);
  }
}

testFixedQueries();