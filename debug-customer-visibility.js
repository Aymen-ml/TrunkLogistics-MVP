#!/usr/bin/env node

import { query } from './server/src/config/database.js';
import logger from './server/src/utils/logger.js';

async function debugCustomerVisibility() {
  console.log('🔍 Debugging Customer Truck Visibility Issue\n');
  
  try {
    // 1. Check all trucks and their document status
    console.log('1. Checking all trucks and their document verification status...\n');
    
    const trucksQuery = `
      SELECT t.id, t.license_plate, t.status, t.truck_type,
             pp.company_name, pp.is_verified as provider_verified,
             u.is_active as user_active,
             COUNT(d.id) as total_documents,
             COUNT(CASE WHEN d.verification_status = 'approved' THEN 1 END) as approved_documents,
             COUNT(CASE WHEN d.verification_status = 'pending' THEN 1 END) as pending_documents,
             COUNT(CASE WHEN d.verification_status = 'rejected' THEN 1 END) as rejected_documents,
             CASE 
               WHEN COUNT(d.id) = 0 THEN 'NO_DOCUMENTS'
               WHEN COUNT(d.id) = COUNT(CASE WHEN d.verification_status = 'approved' THEN 1 END) THEN 'ALL_APPROVED'
               ELSE 'MIXED_STATUS'
             END as document_status
      FROM trucks t
      JOIN provider_profiles pp ON t.provider_id = pp.id
      JOIN users u ON pp.user_id = u.id
      LEFT JOIN documents d ON d.entity_id = t.id AND d.entity_type = 'truck'
      GROUP BY t.id, pp.id, u.id
      ORDER BY t.created_at DESC
    `;
    
    const trucksResult = await query(trucksQuery);
    
    console.log(`Found ${trucksResult.rows.length} trucks:\n`);
    
    trucksResult.rows.forEach((truck, index) => {
      console.log(`${index + 1}. Truck: ${truck.license_plate} (ID: ${truck.id})`);
      console.log(`   Status: ${truck.status}`);
      console.log(`   Provider: ${truck.company_name} (Verified: ${truck.provider_verified})`);
      console.log(`   User Active: ${truck.user_active}`);
      console.log(`   Documents: ${truck.total_documents} total, ${truck.approved_documents} approved, ${truck.pending_documents} pending, ${truck.rejected_documents} rejected`);
      console.log(`   Document Status: ${truck.document_status}`);
      console.log(`   Should be visible to customers: ${
        truck.status === 'active' && 
        truck.provider_verified && 
        truck.user_active && 
        truck.total_documents > 0 && 
        truck.document_status === 'ALL_APPROVED' ? '✅ YES' : '❌ NO'
      }\n`);
    });
    
    // 2. Test the actual customer search query
    console.log('2. Testing the actual customer search query...\n');
    
    const customerSearchQuery = `
      SELECT t.*, pp.company_name, pp.address, pp.city, pp.postal_code, pp.business_license,
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
       WHERE t.status = 'active'
         AND pp.is_verified = true
         AND u.is_active = true
       GROUP BY t.id, pp.id, u.id
       HAVING COUNT(d.id) > 0 
         AND COUNT(d.id) = COUNT(CASE WHEN d.verification_status = 'approved' THEN 1 END)
       ORDER BY t.created_at DESC
    `;
    
    const customerResult = await query(customerSearchQuery);
    
    console.log(`Customer search query returned ${customerResult.rows.length} trucks:\n`);
    
    if (customerResult.rows.length === 0) {
      console.log('❌ No trucks visible to customers!\n');
      
      // Let's check what's failing in the conditions
      console.log('3. Analyzing why trucks are not visible...\n');
      
      const analysisQuery = `
        SELECT t.id, t.license_plate, t.status,
               pp.is_verified as provider_verified,
               u.is_active as user_active,
               COUNT(d.id) as total_documents,
               COUNT(CASE WHEN d.verification_status = 'approved' THEN 1 END) as approved_documents,
               CASE WHEN t.status = 'active' THEN '✅' ELSE '❌' END as status_check,
               CASE WHEN pp.is_verified = true THEN '✅' ELSE '❌' END as provider_check,
               CASE WHEN u.is_active = true THEN '✅' ELSE '❌' END as user_check,
               CASE WHEN COUNT(d.id) > 0 THEN '✅' ELSE '❌' END as has_docs_check,
               CASE WHEN COUNT(d.id) = COUNT(CASE WHEN d.verification_status = 'approved' THEN 1 END) THEN '✅' ELSE '❌' END as all_approved_check
        FROM trucks t
        JOIN provider_profiles pp ON t.provider_id = pp.id
        JOIN users u ON pp.user_id = u.id
        LEFT JOIN documents d ON d.entity_id = t.id AND d.entity_type = 'truck'
        GROUP BY t.id, pp.id, u.id
        ORDER BY t.created_at DESC
      `;
      
      const analysisResult = await query(analysisQuery);
      
      console.log('Condition Analysis:');
      console.log('Status | Provider | User | Has Docs | All Approved | Truck');
      console.log('-------|----------|------|----------|--------------|-------');
      
      analysisResult.rows.forEach(truck => {
        console.log(`  ${truck.status_check}    |    ${truck.provider_check}     |  ${truck.user_check}   |    ${truck.has_docs_check}     |      ${truck.all_approved_check}       | ${truck.license_plate} (${truck.total_documents}/${truck.approved_documents} docs)`);
      });
      
    } else {
      console.log('✅ Found trucks visible to customers:');
      customerResult.rows.forEach((truck, index) => {
        console.log(`${index + 1}. ${truck.license_plate} - ${truck.company_name}`);
      });
    }
    
    // 4. Check specific document statuses
    console.log('\n4. Checking document verification statuses...\n');
    
    const docsQuery = `
      SELECT d.*, t.license_plate
      FROM documents d
      JOIN trucks t ON d.entity_id = t.id
      WHERE d.entity_type = 'truck'
      ORDER BY t.license_plate, d.uploaded_at DESC
    `;
    
    const docsResult = await query(docsQuery);
    
    console.log(`Found ${docsResult.rows.length} truck documents:\n`);
    
    const truckDocs = {};
    docsResult.rows.forEach(doc => {
      if (!truckDocs[doc.license_plate]) {
        truckDocs[doc.license_plate] = [];
      }
      truckDocs[doc.license_plate].push(doc);
    });
    
    Object.keys(truckDocs).forEach(licensePlate => {
      console.log(`📄 ${licensePlate}:`);
      truckDocs[licensePlate].forEach(doc => {
        console.log(`   - ${doc.document_type}: ${doc.verification_status} (${doc.file_name})`);
      });
      console.log('');
    });
    
  } catch (error) {
    console.error('❌ Error during debugging:', error);
  }
}

// Run the debug
debugCustomerVisibility().then(() => {
  console.log('🎉 Debug completed!');
  process.exit(0);
}).catch(error => {
  console.error('💥 Debug failed:', error);
  process.exit(1);
});