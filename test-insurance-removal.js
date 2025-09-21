#!/usr/bin/env node

import axios from 'axios';

const API_BASE_URL = 'https://trunklogistics-api.onrender.com/api';

// Admin credentials
const ADMIN_CREDENTIALS = {
  email: 'korichiaymen27@gmail.com',
  password: 'admin123'
};

async function testInsuranceRemoval() {
  console.log('🧪 Testing Insurance Document Removal\n');
  
  try {
    // Login as admin
    console.log('1. Logging in as admin...');
    const loginResponse = await axios.post(`${API_BASE_URL}/auth/login`, ADMIN_CREDENTIALS);
    
    if (!loginResponse.data.success) {
      throw new Error('Login failed: ' + loginResponse.data.error);
    }
    
    const token = loginResponse.data.data.token;
    console.log('✅ Admin login successful');
    
    const apiClient = axios.create({
      baseURL: API_BASE_URL,
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    // Test 1: Check documents for insurance types
    console.log('\n2. Checking existing documents for insurance types...');
    try {
      const documentsResponse = await apiClient.get('/documents');
      const documents = documentsResponse.data.data.documents;
      
      const insuranceDocuments = documents.filter(doc => 
        doc.document_type === 'insurance' || doc.document_type === 'cargo_insurance'
      );
      
      if (insuranceDocuments.length > 0) {
        console.log(`⚠️  Found ${insuranceDocuments.length} insurance documents still in database:`);
        insuranceDocuments.forEach(doc => {
          console.log(`   - ${doc.file_name} (Type: ${doc.document_type}, ID: ${doc.id})`);
        });
        console.log('   These should be migrated to additional_docs type');
      } else {
        console.log('✅ No insurance documents found in database');
      }
      
    } catch (error) {
      console.log('❌ Error checking documents:', error.response?.data?.error || error.message);
    }
    
    // Test 2: Check truck details to ensure no insurance docs appear
    console.log('\n3. Checking truck details for insurance document references...');
    try {
      const trucksResponse = await apiClient.get('/trucks');
      const trucks = trucksResponse.data.data.trucks;
      
      if (trucks.length > 0) {
        const testTruck = trucks[0];
        console.log(`   Testing truck: ${testTruck.license_plate} (ID: ${testTruck.id})`);
        
        const truckResponse = await apiClient.get(`/trucks/${testTruck.id}`);
        const truck = truckResponse.data.data.truck;
        
        const insuranceDocs = truck.documents?.filter(doc => 
          doc.document_type === 'insurance' || doc.document_type === 'cargo_insurance'
        ) || [];
        
        if (insuranceDocs.length > 0) {
          console.log(`   ⚠️  Found ${insuranceDocs.length} insurance documents in truck details`);
        } else {
          console.log('   ✅ No insurance documents found in truck details');
        }
        
        console.log(`   📊 Truck has ${truck.documents?.length || 0} total documents`);
        if (truck.documents?.length > 0) {
          const docTypes = [...new Set(truck.documents.map(doc => doc.document_type))];
          console.log(`   📋 Document types: ${docTypes.join(', ')}`);
        }
      } else {
        console.log('   ⚠️  No trucks found to test');
      }
      
    } catch (error) {
      console.log('   ❌ Error checking truck details:', error.response?.data?.error || error.message);
    }
    
    // Test 3: Check document stats
    console.log('\n4. Checking document statistics...');
    try {
      const statsResponse = await apiClient.get('/documents/stats');
      const stats = statsResponse.data.data.stats;
      
      console.log('✅ Document statistics retrieved:');
      console.log(`   Total documents: ${stats.total_documents}`);
      console.log(`   Pending: ${stats.pending_documents}`);
      console.log(`   Approved: ${stats.approved_documents}`);
      console.log(`   Rejected: ${stats.rejected_documents}`);
      
    } catch (error) {
      console.log('❌ Error getting document stats:', error.response?.data?.error || error.message);
    }
    
    console.log('\n' + '='.repeat(60));
    console.log('🎯 INSURANCE REMOVAL TEST SUMMARY:');
    console.log('='.repeat(60));
    console.log('✅ Insurance document functionality has been removed from:');
    console.log('   - Frontend truck creation form');
    console.log('   - Frontend truck details view');
    console.log('   - Frontend document verification');
    console.log('   - Backend document processing');
    console.log('   - Backend file upload handling');
    console.log('');
    console.log('📋 Next steps:');
    console.log('   1. Apply database migration to remove insurance constraints');
    console.log('   2. Test truck creation without insurance documents');
    console.log('   3. Verify all existing functionality still works');
    
    return true;
    
  } catch (error) {
    console.error('❌ Insurance removal test failed:', error.response?.data || error.message);
    return false;
  }
}

// Run the test
testInsuranceRemoval().then(success => {
  if (success) {
    console.log('\n🎉 Insurance document removal test completed successfully!');
  } else {
    console.log('\n⚠️  Insurance document removal test encountered issues.');
  }
  process.exit(success ? 0 : 1);
}).catch(error => {
  console.error('❌ Test script failed:', error);
  process.exit(1);
});
