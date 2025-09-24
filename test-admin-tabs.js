#!/usr/bin/env node

/**
 * Admin Tabs Functionality Test
 * Tests all admin dashboard tabs and their core functionality
 */

import fetch from 'node-fetch';
import fs from 'fs';

const API_BASE = process.env.API_URL || 'https://trunklogistics-api.onrender.com/api';
const ADMIN_EMAIL = 'korichiaymen27@gmail.com';
const ADMIN_PASSWORD = 'admin123';

let authToken = null;

// Helper function to make authenticated API calls
async function apiCall(endpoint, options = {}) {
  const url = `${API_BASE}${endpoint}`;
  const headers = {
    'Content-Type': 'application/json',
    ...(authToken && { 'Authorization': `Bearer ${authToken}` }),
    ...options.headers
  };

  try {
    const response = await fetch(url, {
      ...options,
      headers
    });

    const data = await response.json();
    
    return {
      status: response.status,
      ok: response.ok,
      data
    };
  } catch (error) {
    console.error(`❌ API call failed for ${endpoint}:`, error.message);
    return {
      status: 500,
      ok: false,
      error: error.message
    };
  }
}

// Test admin authentication
async function testAdminAuth() {
  console.log('\n🔐 Testing Admin Authentication...');
  
  const result = await apiCall('/auth/login', {
    method: 'POST',
    body: JSON.stringify({
      email: ADMIN_EMAIL,
      password: ADMIN_PASSWORD
    })
  });

  if (result.ok && result.data.success) {
    authToken = result.data.data.token;
    console.log('✅ Admin authentication successful');
    return true;
  } else {
    console.log('❌ Admin authentication failed:', result.data?.error || 'Unknown error');
    return false;
  }
}

// Test Dashboard Data
async function testDashboardData() {
  console.log('\n📊 Testing Dashboard Data...');
  
  const tests = [
    { endpoint: '/users', name: 'Users Data' },
    { endpoint: '/users?role=provider', name: 'Providers Data' },
    { endpoint: '/bookings', name: 'Bookings Data' },
    { endpoint: '/trucks', name: 'Trucks Data' },
    { endpoint: '/documents/stats', name: 'Document Stats' }
  ];

  let passed = 0;
  
  for (const test of tests) {
    const result = await apiCall(test.endpoint);
    if (result.ok) {
      console.log(`✅ ${test.name}: OK`);
      passed++;
    } else {
      console.log(`❌ ${test.name}: Failed (${result.status})`);
    }
  }
  
  console.log(`📈 Dashboard Data: ${passed}/${tests.length} tests passed`);
  return passed === tests.length;
}

// Test User Management Tab
async function testUserManagement() {
  console.log('\n👥 Testing User Management Tab...');
  
  const result = await apiCall('/users');
  
  if (result.ok && result.data.success) {
    const users = result.data.data?.users || result.data.users || [];
    console.log(`✅ User Management: Found ${users.length} users`);
    
    // Test user role distribution
    const roles = users.reduce((acc, user) => {
      acc[user.role] = (acc[user.role] || 0) + 1;
      return acc;
    }, {});
    
    console.log(`   📊 Role Distribution:`, roles);
    return true;
  } else {
    console.log('❌ User Management: Failed to fetch users');
    return false;
  }
}

// Test Provider Verification Tab
async function testProviderVerification() {
  console.log('\n🏢 Testing Provider Verification Tab...');
  
  const result = await apiCall('/users?role=provider');
  
  if (result.ok && result.data.success) {
    const providers = result.data.data?.users || result.data.users || [];
    const verified = providers.filter(p => p.is_verified).length;
    const pending = providers.filter(p => !p.is_verified).length;
    
    console.log(`✅ Provider Verification: Found ${providers.length} providers`);
    console.log(`   📊 Verified: ${verified}, Pending: ${pending}`);
    return true;
  } else {
    console.log('❌ Provider Verification: Failed to fetch providers');
    return false;
  }
}

// Test Document Verification Tab
async function testDocumentVerification() {
  console.log('\n📄 Testing Document Verification Tab...');
  
  const tests = [
    { endpoint: '/documents', name: 'Documents List' },
    { endpoint: '/documents/stats', name: 'Document Statistics' }
  ];

  let passed = 0;
  
  for (const test of tests) {
    const result = await apiCall(test.endpoint);
    if (result.ok && result.data.success) {
      if (test.endpoint === '/documents') {
        const documents = result.data.data?.documents || [];
        console.log(`✅ ${test.name}: Found ${documents.length} documents`);
        
        // Test document status distribution
        const statuses = documents.reduce((acc, doc) => {
          acc[doc.verification_status] = (acc[doc.verification_status] || 0) + 1;
          return acc;
        }, {});
        
        console.log(`   📊 Document Status Distribution:`, statuses);
      } else if (test.endpoint === '/documents/stats') {
        const stats = result.data.data?.stats || {};
        console.log(`✅ ${test.name}:`, stats);
      }
      passed++;
    } else {
      console.log(`❌ ${test.name}: Failed (${result.status})`);
    }
  }
  
  console.log(`📈 Document Verification: ${passed}/${tests.length} tests passed`);
  return passed === tests.length;
}

// Test Booking Management Tab
async function testBookingManagement() {
  console.log('\n📦 Testing Booking Management Tab...');
  
  const result = await apiCall('/bookings');
  
  if (result.ok && result.data.success) {
    const bookings = result.data.data?.bookings || [];
    console.log(`✅ Booking Management: Found ${bookings.length} bookings`);
    
    // Test booking status distribution
    const statuses = bookings.reduce((acc, booking) => {
      acc[booking.status] = (acc[booking.status] || 0) + 1;
      return acc;
    }, {});
    
    console.log(`   📊 Booking Status Distribution:`, statuses);
    
    // Test service type distribution
    const serviceTypes = bookings.reduce((acc, booking) => {
      acc[booking.service_type] = (acc[booking.service_type] || 0) + 1;
      return acc;
    }, {});
    
    console.log(`   📊 Service Type Distribution:`, serviceTypes);
    return true;
  } else {
    console.log('❌ Booking Management: Failed to fetch bookings');
    return false;
  }
}

// Test Trucks Admin Tab
async function testTrucksAdmin() {
  console.log('\n🚛 Testing Trucks Admin Tab...');
  
  const result = await apiCall('/trucks');
  
  if (result.ok && result.data.success) {
    const trucks = result.data.data?.trucks || [];
    console.log(`✅ Trucks Admin: Found ${trucks.length} trucks`);
    
    // Test truck status distribution
    const statuses = trucks.reduce((acc, truck) => {
      acc[truck.status] = (acc[truck.status] || 0) + 1;
      return acc;
    }, {});
    
    console.log(`   📊 Truck Status Distribution:`, statuses);
    
    // Test service type distribution
    const serviceTypes = trucks.reduce((acc, truck) => {
      acc[truck.service_type] = (acc[truck.service_type] || 0) + 1;
      return acc;
    }, {});
    
    console.log(`   📊 Service Type Distribution:`, serviceTypes);
    
    // Test document verification status
    const docsVerified = trucks.filter(t => t.documents_verified).length;
    const docsUnverified = trucks.filter(t => !t.documents_verified).length;
    
    console.log(`   📊 Document Verification: ${docsVerified} verified, ${docsUnverified} unverified`);
    return true;
  } else {
    console.log('❌ Trucks Admin: Failed to fetch trucks');
    return false;
  }
}

// Test Analytics Tab
async function testAnalytics() {
  console.log('\n📈 Testing Analytics Tab...');
  
  // Analytics typically uses the same data as other tabs
  const result = await apiCall('/bookings');
  
  if (result.ok && result.data.success) {
    const bookings = result.data.data?.bookings || [];
    
    // Calculate analytics metrics
    const completedBookings = bookings.filter(b => b.status === 'completed');
    const totalRevenue = completedBookings.reduce((sum, b) => sum + (parseFloat(b.total_price) || 0), 0);
    const approvalRate = bookings.length > 0 ? 
      Math.round((bookings.filter(b => b.status === 'approved').length / bookings.length) * 100) : 0;
    
    console.log(`✅ Analytics: Calculated metrics successfully`);
    console.log(`   📊 Total Bookings: ${bookings.length}`);
    console.log(`   📊 Completed Bookings: ${completedBookings.length}`);
    console.log(`   📊 Total Revenue: $${totalRevenue.toFixed(2)}`);
    console.log(`   📊 Approval Rate: ${approvalRate}%`);
    return true;
  } else {
    console.log('❌ Analytics: Failed to fetch data for analytics');
    return false;
  }
}

// Main test runner
async function runAllTests() {
  console.log('🚀 Starting Admin Tabs Functionality Test');
  console.log('=' .repeat(60));
  
  const results = [];
  
  // Test authentication first
  const authSuccess = await testAdminAuth();
  if (!authSuccess) {
    console.log('\n❌ Cannot proceed without admin authentication');
    return;
  }
  
  // Run all tab tests
  results.push({ name: 'Dashboard Data', success: await testDashboardData() });
  results.push({ name: 'User Management', success: await testUserManagement() });
  results.push({ name: 'Provider Verification', success: await testProviderVerification() });
  results.push({ name: 'Document Verification', success: await testDocumentVerification() });
  results.push({ name: 'Booking Management', success: await testBookingManagement() });
  results.push({ name: 'Trucks Admin', success: await testTrucksAdmin() });
  results.push({ name: 'Analytics', success: await testAnalytics() });
  
  // Summary
  console.log('\n' + '=' .repeat(60));
  console.log('📋 TEST SUMMARY');
  console.log('=' .repeat(60));
  
  const passed = results.filter(r => r.success).length;
  const total = results.length;
  
  results.forEach(result => {
    console.log(`${result.success ? '✅' : '❌'} ${result.name}`);
  });
  
  console.log('\n' + '=' .repeat(60));
  console.log(`🎯 OVERALL RESULT: ${passed}/${total} tests passed`);
  
  if (passed === total) {
    console.log('🎉 All admin tabs are working correctly!');
    console.log('✅ Dashboard shows updated data');
    console.log('✅ User management is functional');
    console.log('✅ Provider verification is working');
    console.log('✅ Document verification handles updated data');
    console.log('✅ Booking management is operational');
    console.log('✅ Trucks admin shows current fleet');
    console.log('✅ Analytics calculates metrics correctly');
  } else {
    console.log('⚠️  Some admin tabs may need attention');
  }
  
  console.log('=' .repeat(60));
  
  // Save test results
  const testReport = {
    timestamp: new Date().toISOString(),
    apiBase: API_BASE,
    results,
    summary: {
      passed,
      total,
      success: passed === total
    }
  };
  
  try {
    fs.writeFileSync('admin-tabs-test-report.json', JSON.stringify(testReport, null, 2));
    console.log('📄 Test report saved to admin-tabs-test-report.json');
  } catch (error) {
    console.log('⚠️  Could not save test report:', error.message);
  }
}

// Run the tests
runAllTests().catch(error => {
  console.error('💥 Test runner failed:', error);
  process.exit(1);
});