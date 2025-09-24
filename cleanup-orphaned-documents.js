#!/usr/bin/env node

/**
 * Cleanup Orphaned Documents Script
 * 
 * This script removes documents from the database that reference trucks that no longer exist.
 * This can happen if trucks were deleted but their documents weren't properly cleaned up.
 */

import { query } from './server/src/config/database.js';
import logger from './server/src/utils/logger.js';

const cleanupOrphanedDocuments = async () => {
  try {
    console.log('🔍 Starting cleanup of orphaned documents...');
    
    // First, let's see what we have
    const statsBeforeResult = await query(`
      SELECT 
        COUNT(*) as total_documents,
        COUNT(CASE WHEN t.id IS NULL THEN 1 END) as orphaned_documents,
        COUNT(CASE WHEN t.id IS NOT NULL THEN 1 END) as valid_documents
      FROM documents d
      LEFT JOIN trucks t ON d.entity_id = t.id AND d.entity_type = 'truck'
      WHERE d.entity_type = 'truck'
    `);
    
    const statsBefore = statsBeforeResult.rows[0];
    console.log('📊 Current document statistics:');
    console.log(`   Total documents: ${statsBefore.total_documents}`);
    console.log(`   Valid documents (with existing trucks): ${statsBefore.valid_documents}`);
    console.log(`   Orphaned documents (no truck): ${statsBefore.orphaned_documents}`);
    
    if (parseInt(statsBefore.orphaned_documents) === 0) {
      console.log('✅ No orphaned documents found. Database is clean!');
      return;
    }
    
    // Get details of orphaned documents before deletion
    const orphanedDocsResult = await query(`
      SELECT d.id, d.file_name, d.document_type, d.entity_id, d.uploaded_at
      FROM documents d
      LEFT JOIN trucks t ON d.entity_id = t.id AND d.entity_type = 'truck'
      WHERE d.entity_type = 'truck' AND t.id IS NULL
      ORDER BY d.uploaded_at DESC
    `);
    
    const orphanedDocs = orphanedDocsResult.rows;
    console.log(`\n🗑️  Found ${orphanedDocs.length} orphaned documents to clean up:`);
    
    orphanedDocs.forEach((doc, index) => {
      console.log(`   ${index + 1}. Document ID: ${doc.id}`);
      console.log(`      File: ${doc.file_name || 'Unknown'}`);
      console.log(`      Type: ${doc.document_type}`);
      console.log(`      Referenced Truck ID: ${doc.entity_id} (MISSING)`);
      console.log(`      Uploaded: ${new Date(doc.uploaded_at).toLocaleString()}`);
      console.log('');
    });
    
    // Ask for confirmation (in a real deployment, you might want to skip this)
    console.log('⚠️  This will permanently delete these orphaned documents from the database.');
    console.log('   (Note: This is safe as these documents reference non-existent trucks)');
    
    // Delete orphaned documents
    const deleteResult = await query(`
      DELETE FROM documents 
      WHERE id IN (
        SELECT d.id
        FROM documents d
        LEFT JOIN trucks t ON d.entity_id = t.id AND d.entity_type = 'truck'
        WHERE d.entity_type = 'truck' AND t.id IS NULL
      )
      RETURNING id, file_name, document_type
    `);
    
    const deletedDocs = deleteResult.rows;
    console.log(`✅ Successfully deleted ${deletedDocs.length} orphaned documents:`);
    
    deletedDocs.forEach((doc, index) => {
      console.log(`   ${index + 1}. ${doc.file_name || 'Unknown'} (${doc.document_type}) - ID: ${doc.id}`);
    });
    
    // Show final statistics
    const statsAfterResult = await query(`
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
    
    const statsAfter = statsAfterResult.rows[0];
    console.log('\n📊 Final document statistics (after cleanup):');
    console.log(`   Total documents: ${statsAfter.total_documents}`);
    console.log(`   Pending documents: ${statsAfter.pending_documents}`);
    console.log(`   Approved documents: ${statsAfter.approved_documents}`);
    console.log(`   Rejected documents: ${statsAfter.rejected_documents}`);
    console.log(`   Trucks with documents: ${statsAfter.trucks_with_documents}`);
    console.log(`   Providers with documents: ${statsAfter.providers_with_documents}`);
    
    console.log('\n🎉 Cleanup completed successfully!');
    console.log('   The admin documents tab should now show the correct document count.');
    
  } catch (error) {
    console.error('❌ Error during cleanup:', error);
    logger.error('Cleanup script error:', error);
    throw error;
  }
};

// Run the cleanup
cleanupOrphanedDocuments()
  .then(() => {
    console.log('\n✅ Script completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Script failed:', error.message);
    process.exit(1);
  });