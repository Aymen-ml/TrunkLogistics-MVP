#!/usr/bin/env node

/**
 * Test Admin Document Stats API
 * 
 * This script tests the actual API endpoints that the admin dashboard uses
 * to ensure the document statistics are correct after our fixes.
 */

import fetch from 'node-fetch';
import { query } from './server/src/config/database.js';

const API_BASE_URL = 'https://api.movelinker.com';
const ADMIN_EMAIL = 'korichiaymen27@gmail.com';
const ADMIN_PASSWORD = 'admin123';

let authToken = null;

const loginAsAdmin = async () => {
  try {
    console.log('🔐 Logging in as admin...');
    const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: ADMIN_EMAIL,
        password: ADMIN_PASSWORD
      })
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(`Login failed: ${data.error || response.statusText}`);
    }

    authToken = data.data.token;
    console.log('✅ Admin login successful');
    return authToken;
  } catch (error) {
    console.error('❌ Admin login failed:', error.message);
    throw error;
  }
};

const testDocumentStatsAPI = async () => {
  try {
    console.log('📊 Testing document stats API...');
    const response = await fetch(`${API_BASE_URL}/api/documents/stats`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${authToken}`,
        'Content-Type': 'application/json',
      }
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(`API request failed: ${data.error || response.statusText}`);
    }

    console.log('✅ Document stats API response:');
    console.log('   Total documents:', data.data.stats.total_documents);
    console.log('   Pending documents:', data.data.stats.pending_documents);
    console.log('   Approved documents:', data.data.stats.approved_documents);
    console.log('   Rejected documents:', data.data.stats.rejected_documents);
    console.log('   Trucks with documents:', data.data.stats.trucks_with_documents);
    console.log('   Providers with documents:', data.data.stats.providers_with_documents);
    
    return data.data.stats;
  } catch (error) {
    console.error('❌ Document stats API test failed:', error.message);
    throw error;
  }
};

const testDocumentsListAPI = async () => {
  try {
    console.log('📋 Testing documents list API...');
    const response = await fetch(`${API_BASE_URL}/api/documents`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${authToken}`,
        'Content-Type': 'application/json',
      }
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(`API request failed: ${data.error || response.statusText}`);
    }

    console.log('✅ Documents list API response:');
    console.log(`   Found ${data.data.documents.length} documents:`);
    
    data.data.documents.forEach((doc, index) => {
      console.log(`   ${index + 1}. ${doc.file_name || 'Unknown'} (${doc.document_type})`);
      console.log(`      Status: ${doc.verification_status}`);
      console.log(`      Truck: ${doc.license_plate} (${doc.truck_type})`);
      console.log(`      Provider: ${doc.provider_company}`);
      console.log('');
    });
    
    return data.data.documents;
  } catch (error) {
    console.error('❌ Documents list API test failed:', error.message);
    throw error;
  }
};

const testTrucksForAdminAPI = async () => {
  try {
    console.log('🚛 Testing trucks for admin API...');
    const response = await fetch(`${API_BASE_URL}/api/trucks/admin/all`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${authToken}`,
        'Content-Type': 'application/json',
      }
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(`API request failed: ${data.error || response.statusText}`);
    }

    console.log('✅ Trucks for admin API response:');
    console.log(`   Found ${data.data.trucks.length} trucks:`);
    
    data.data.trucks.forEach((truck, index) => {
      console.log(`   ${index + 1}. ${truck.license_plate} (${truck.truck_type})`);
      console.log(`      Provider: ${truck.company_name}`);
      console.log(`      Documents: ${truck.total_documents} total, ${truck.approved_documents} approved, ${truck.pending_documents} pending`);
      console.log('');
    });
    
    return data.data.trucks;
  } catch (error) {
    console.error('❌ Trucks for admin API test failed:', error.message);
    throw error;
  }
};

const compareWithDirectDatabaseQuery = async () => {
  try {
    console.log('🔍 Comparing with direct database query...');
    
    // Direct database query to verify
    const result = await query(`
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
    
    const dbStats = result.rows[0];
    console.log('✅ Direct database query results:');
    console.log('   Total documents:', dbStats.total_documents);
    console.log('   Pending documents:', dbStats.pending_documents);
    console.log('   Approved documents:', dbStats.approved_documents);
    console.log('   Rejected documents:', dbStats.rejected_documents);
    console.log('   Trucks with documents:', dbStats.trucks_with_documents);
    console.log('   Providers with documents:', dbStats.providers_with_documents);
    
    return dbStats;
  } catch (error) {
    console.error('❌ Direct database query failed:', error.message);
    throw error;
  }
};

const runTests = async () => {
  try {
    console.log('🧪 Starting admin document stats tests...\n');
    
    // Login as admin
    await loginAsAdmin();
    
    // Test the APIs
    const apiStats = await testDocumentStatsAPI();
    console.log('');
    
    const documents = await testDocumentsListAPI();
    console.log('');
    
    const trucks = await testTrucksForAdminAPI();
    console.log('');
    
    // Compare with direct database query
    const dbStats = await compareWithDirectDatabaseQuery();
    console.log('');
    
    // Verify consistency
    console.log('🔍 Consistency check:');
    const isConsistent = (
      parseInt(apiStats.total_documents) === parseInt(dbStats.total_documents) &&
      parseInt(apiStats.pending_documents) === parseInt(dbStats.pending_documents) &&
      parseInt(apiStats.approved_documents) === parseInt(dbStats.approved_documents) &&
      parseInt(apiStats.rejected_documents) === parseInt(dbStats.rejected_documents)
    );
    
    if (isConsistent) {
      console.log('✅ All stats are consistent between API and database!');
    } else {
      console.log('❌ Inconsistency detected:');
      console.log(`   API total: ${apiStats.total_documents}, DB total: ${dbStats.total_documents}`);
      console.log(`   API pending: ${apiStats.pending_documents}, DB pending: ${dbStats.pending_documents}`);
      console.log(`   API approved: ${apiStats.approved_documents}, DB approved: ${dbStats.approved_documents}`);
      console.log(`   API rejected: ${apiStats.rejected_documents}, DB rejected: ${dbStats.rejected_documents}`);
    }
    
    // Verify document count matches actual documents returned
    const documentCountMatches = documents.length === parseInt(apiStats.total_documents);
    console.log(`📋 Document count verification: ${documentCountMatches ? '✅' : '❌'}`);
    console.log(`   API says ${apiStats.total_documents} documents, list returned ${documents.length} documents`);
    
    console.log('\n🎉 Test completed!');
    console.log(`📊 Summary: ${apiStats.total_documents} total documents found`);
    console.log(`   - ${apiStats.approved_documents} approved`);
    console.log(`   - ${apiStats.pending_documents} pending`);
    console.log(`   - ${apiStats.rejected_documents} rejected`);
    console.log(`   - Across ${apiStats.trucks_with_documents} trucks`);
    console.log(`   - From ${apiStats.providers_with_documents} providers`);
    
  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
    throw error;
  }
};

// Run the tests
runTests()
  .then(() => {
    console.log('\n✅ All tests completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Tests failed:', error.message);
    process.exit(1);
  });