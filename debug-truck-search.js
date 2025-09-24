import { query } from './server/src/config/database.js';

async function debugTruckSearch() {
  try {
    console.log('🔍 Debugging truck search query...\n');
    
    // Test the exact query used in Truck.search for customers
    console.log('1. Testing customer view query (with document restrictions)...');
    
    const customerQuery = `
      SELECT t.*, pp.company_name, pp.street_address as address, pp.city, pp.postal_code, pp.business_license,
              u.first_name, u.last_name, u.phone, u.email,
              COUNT(*) OVER() as total_count,
              pp.is_verified as provider_verified,
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
    console.log('Customer query result:', {
      rowCount: customerResult.rows.length,
      trucks: customerResult.rows.map(truck => ({
        id: truck.id,
        license_plate: truck.license_plate,
        documents_verified: truck.documents_verified,
        provider_verified: truck.provider_verified,
        user_active: truck.user_active
      }))
    });
    
    console.log('\n2. Testing admin view query (no document restrictions)...');
    
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
       WHERE t.status = $1
       GROUP BY t.id, pp.id, u.id
       ORDER BY t.created_at DESC
       LIMIT $2 OFFSET $3`;
    
    const adminResult = await query(adminQuery, ['active', 10, 0]);
    console.log('Admin query result:', {
      rowCount: adminResult.rows.length,
      trucks: adminResult.rows.map(truck => ({
        id: truck.id,
        license_plate: truck.license_plate,
        total_documents: truck.total_documents,
        approved_documents: truck.approved_documents,
        documents_verified: truck.documents_verified,
        provider_verified: truck.provider_verified,
        user_active: truck.user_active
      }))
    });
    
    console.log('\n3. Checking specific truck documents...');
    
    const docsQuery = `
      SELECT d.*, t.license_plate
      FROM documents d
      JOIN trucks t ON d.entity_id = t.id
      WHERE d.entity_type = 'truck'
      ORDER BY d.uploaded_at DESC`;
    
    const docsResult = await query(docsQuery);
    console.log('Documents:', docsResult.rows.map(doc => ({
      truck_license: doc.license_plate,
      document_type: doc.document_type,
      verification_status: doc.verification_status,
      file_name: doc.file_name
    })));
    
    console.log('\n4. Checking provider profiles...');
    
    const providersQuery = `
      SELECT pp.id, pp.company_name, pp.is_verified, u.email, u.is_active
      FROM provider_profiles pp
      JOIN users u ON pp.user_id = u.id`;
    
    const providersResult = await query(providersQuery);
    console.log('Providers:', providersResult.rows);
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Debug failed:', error);
    process.exit(1);
  }
}

debugTruckSearch();