#!/usr/bin/env node

/**
 * Test Document Stats Fix
 * 
 * This script tests the document statistics to ensure they're showing correct counts
 * after fixing the INNER JOIN issue.
 */

import { query } from './server/src/config/database.js';
import logger from './server/src/utils/logger.js';

const testDocumentStats = async () => {
  try {
    console.log('🔍 Testing document statistics after fix...');
    
    // Test the old query (with LEFT JOIN) vs new query (with INNER JOIN)
    console.log('\n📊 Testing OLD query (with LEFT JOIN - potentially incorrect):');
    const oldQueryResult = await query(`
      SELECT 
        COUNT(*) as total_documents,
        COUNT(CASE WHEN verification_status = 'pending' THEN 1 END) as pending_documents,
        COUNT(CASE WHEN verification_status = 'approved' THEN 1 END) as approved_documents,
        COUNT(CASE WHEN verification_status = 'rejected' THEN 1 END) as rejected_documents,
        COUNT(DISTINCT entity_id) as trucks_with_documents,
        COUNT(DISTINCT t.provider_id) as providers_with_documents
      FROM documents d
      LEFT JOIN trucks t ON d.entity_id = t.id AND d.entity_type = 'truck'
      WHERE d.entity_type = 'truck'
    `);
    
    const oldStats = oldQueryResult.rows[0];
    console.log(`   Total documents: ${oldStats.total_documents}`);
    console.log(`   Pending: ${oldStats.pending_documents}`);
    console.log(`   Approved: ${oldStats.approved_documents}`);
    console.log(`   Rejected: ${oldStats.rejected_documents}`);
    console.log(`   Trucks with documents: ${oldStats.trucks_with_documents}`);
    console.log(`   Providers with documents: ${oldStats.providers_with_documents}`);
    
    console.log('\n📊 Testing NEW query (with INNER JOIN - correct):');
    const newQueryResult = await query(`
      SELECT 
        COUNT(*) as total_documents,
        COUNT(CASE WHEN d.verification_status = 'pending' THEN 1 END) as pending_documents,
        COUNT(CASE WHEN d.verification_status = 'approved' THEN 1 END) as approved_documents,
        COUNT(CASE WHEN d.verification_status = 'rejected' THEN 1 END) as rejected_documents,
        COUNT(DISTINCT d.entity_id) as trucks_with_documents,
        COUNT(DISTINCT t.provider_id) as providers_with_documents
      FROM documents d
      INNER JOIN trucks t ON d.entity_id = t.id AND d.entity_type = 'truck'
      WHERE d.entity_type = 'truck'
    `);
    
    const newStats = newQueryResult.rows[0];
    console.log(`   Total documents: ${newStats.total_documents}`);
    console.log(`   Pending: ${newStats.pending_documents}`);
    console.log(`   Approved: ${newStats.approved_documents}`);
    console.log(`   Rejected: ${newStats.rejected_documents}`);
    console.log(`   Trucks with documents: ${newStats.trucks_with_documents}`);
    console.log(`   Providers with documents: ${newStats.providers_with_documents}`);
    
    // Compare results
    console.log('\n🔍 Comparison:');
    const differences = [];
    
    if (oldStats.total_documents !== newStats.total_documents) {
      differences.push(`Total documents: ${oldStats.total_documents} → ${newStats.total_documents}`);
    }
    if (oldStats.pending_documents !== newStats.pending_documents) {
      differences.push(`Pending: ${oldStats.pending_documents} → ${newStats.pending_documents}`);
    }
    if (oldStats.approved_documents !== newStats.approved_documents) {
      differences.push(`Approved: ${oldStats.approved_documents} → ${newStats.approved_documents}`);
    }
    if (oldStats.rejected_documents !== newStats.rejected_documents) {
      differences.push(`Rejected: ${oldStats.rejected_documents} → ${newStats.rejected_documents}`);
    }
    
    if (differences.length > 0) {
      console.log('   ⚠️  Differences found (this indicates the fix was needed):');
      differences.forEach(diff => console.log(`      ${diff}`));
    } else {
      console.log('   ✅ No differences found (database was already clean)');
    }
    
    // Get detailed document information
    console.log('\n📋 Detailed document information:');
    const detailsResult = await query(`
      SELECT 
        d.id,
        d.file_name,
        d.document_type,
        d.verification_status,
        d.entity_id as truck_id,
        t.license_plate,
        t.truck_type,
        pp.company_name as provider_company,
        d.uploaded_at
      FROM documents d
      INNER JOIN trucks t ON d.entity_id = t.id AND d.entity_type = 'truck'
      LEFT JOIN provider_profiles pp ON t.provider_id = pp.id
      WHERE d.entity_type = 'truck'
      ORDER BY d.uploaded_at DESC
    `);
    
    const documents = detailsResult.rows;
    console.log(`   Found ${documents.length} valid documents:`);
    
    documents.forEach((doc, index) => {
      console.log(`   ${index + 1}. ${doc.file_name || 'Unknown'} (${doc.document_type})`);
      console.log(`      Status: ${doc.verification_status}`);
      console.log(`      Truck: ${doc.license_plate} (${doc.truck_type})`);
      console.log(`      Provider: ${doc.provider_company}`);
      console.log(`      Uploaded: ${new Date(doc.uploaded_at).toLocaleString()}`);
      console.log('');
    });
    
    console.log('✅ Document statistics test completed!');
    console.log('   The admin dashboard should now show the correct count.');
    
  } catch (error) {
    console.error('❌ Error during test:', error);
    logger.error('Test script error:', error);
    throw error;
  }
};

// Run the test
testDocumentStats()
  .then(() => {
    console.log('\n✅ Test completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Test failed:', error.message);
    process.exit(1);
  });