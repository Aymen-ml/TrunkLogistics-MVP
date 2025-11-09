#!/usr/bin/env node

/**
 * UI Update Testing Script
 * 
 * This script tests the booking status update functionality
 * and verifies that the UI updates correctly after changes.
 * 
 * Tests:
 * 1. Fetch bookings before update
 * 2. Update booking status
 * 3. Verify status changed in response
 * 4. Fetch booking again to verify persistence
 * 5. Check if all fields are present
 */

import axios from 'axios';

const API_URL = 'https://api.movelinker.com/api';

// Test credentials (from prompt.txt)
const ADMIN_CREDENTIALS = {
  email: 'korichiaymen27@gmail.com',
  password: 'admin123'
};

let authToken = null;

// Helper function to log with colors
const log = {
  info: (msg) => console.log(`\x1b[36m[INFO]\x1b[0m ${msg}`),
  success: (msg) => console.log(`\x1b[32m[SUCCESS]\x1b[0m ${msg}`),
  error: (msg) => console.log(`\x1b[31m[ERROR]\x1b[0m ${msg}`),
  warning: (msg) => console.log(`\x1b[33m[WARNING]\x1b[0m ${msg}`),
  test: (msg) => console.log(`\x1b[35m[TEST]\x1b[0m ${msg}`),
};

// Create axios instance with auth
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add auth interceptor
api.interceptors.request.use((config) => {
  if (authToken) {
    config.headers.Authorization = `Bearer ${authToken}`;
  }
  return config;
});

// Login function
async function login() {
  try {
    log.info('Logging in as admin...');
    const response = await api.post('/auth/login', ADMIN_CREDENTIALS);
    
    if (response.data.success && response.data.data.token) {
      authToken = response.data.data.token;
      log.success(`Logged in successfully as ${response.data.data.user.email}`);
      log.info(`User role: ${response.data.data.user.role}`);
      return response.data.data.user;
    } else {
      throw new Error('Login failed - no token received');
    }
  } catch (error) {
    log.error(`Login failed: ${error.response?.data?.error || error.message}`);
    throw error;
  }
}

// Fetch all bookings
async function fetchBookings() {
  try {
    log.info('Fetching all bookings...');
    const response = await api.get('/bookings');
    
    if (response.data.success) {
      const bookings = response.data.data.bookings || [];
      log.success(`Fetched ${bookings.length} bookings`);
      return bookings;
    } else {
      throw new Error('Failed to fetch bookings');
    }
  } catch (error) {
    log.error(`Failed to fetch bookings: ${error.response?.data?.error || error.message}`);
    throw error;
  }
}

// Fetch single booking
async function fetchBooking(bookingId) {
  try {
    log.info(`Fetching booking ${bookingId}...`);
    const response = await api.get(`/bookings/${bookingId}`);
    
    if (response.data.success) {
      const booking = response.data.data.booking;
      log.success(`Fetched booking ${bookingId} - Status: ${booking.status}`);
      return booking;
    } else {
      throw new Error('Failed to fetch booking');
    }
  } catch (error) {
    log.error(`Failed to fetch booking: ${error.response?.data?.error || error.message}`);
    throw error;
  }
}

// Update booking status
async function updateBookingStatus(bookingId, newStatus, notes = '') {
  try {
    log.info(`Updating booking ${bookingId} to status: ${newStatus}`);
    const response = await api.put(`/bookings/${bookingId}/status`, {
      status: newStatus,
      notes: notes || `Status updated to ${newStatus} via test script`
    });
    
    if (response.data.success) {
      log.success(`Status updated successfully`);
      return response.data.data.booking;
    } else {
      throw new Error('Failed to update status');
    }
  } catch (error) {
    log.error(`Failed to update status: ${error.response?.data?.error || error.message}`);
    throw error;
  }
}

// Test 1: Verify booking data completeness
async function testBookingDataCompleteness(booking) {
  log.test('TEST 1: Verifying booking data completeness');
  
  const requiredFields = [
    'id', 'status', 'customer_id', 'provider_id', 'truck_id',
    'pickup_address', 'pickup_city', 'created_at', 'updated_at',
    'customer_name', 'customer_email', 'provider_company', 'truck_model'
  ];
  
  const missingFields = requiredFields.filter(field => !booking[field]);
  
  if (missingFields.length === 0) {
    log.success('✅ All required fields present in booking data');
    return true;
  } else {
    log.error(`❌ Missing fields: ${missingFields.join(', ')}`);
    return false;
  }
}

// Test 2: Verify status update persistence
async function testStatusUpdatePersistence(bookingId, oldStatus, newStatus) {
  log.test('TEST 2: Verifying status update persistence');
  
  try {
    // Update status
    const updatedBooking = await updateBookingStatus(bookingId, newStatus);
    
    if (updatedBooking.status !== newStatus) {
      log.error(`❌ Status not updated in response. Expected: ${newStatus}, Got: ${updatedBooking.status}`);
      return false;
    }
    
    // Wait a bit for database to update
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Fetch again to verify persistence
    const refetchedBooking = await fetchBooking(bookingId);
    
    if (refetchedBooking.status !== newStatus) {
      log.error(`❌ Status not persisted. Expected: ${newStatus}, Got: ${refetchedBooking.status}`);
      return false;
    }
    
    log.success(`✅ Status persisted correctly: ${oldStatus} → ${newStatus}`);
    
    // Revert back to original status
    await new Promise(resolve => setTimeout(resolve, 500));
    await updateBookingStatus(bookingId, oldStatus, 'Reverting to original status');
    
    return true;
  } catch (error) {
    log.error(`❌ Test failed: ${error.message}`);
    return false;
  }
}

// Test 3: Verify updated_at field changes
async function testUpdatedAtChanges(bookingId) {
  log.test('TEST 3: Verifying updated_at timestamp changes');
  
  try {
    // Fetch initial booking
    const initialBooking = await fetchBooking(bookingId);
    const initialUpdatedAt = new Date(initialBooking.updated_at);
    
    log.info(`Initial updated_at: ${initialUpdatedAt.toISOString()}`);
    
    // Wait a bit to ensure timestamp difference
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Update status (toggle between current and same to avoid side effects)
    const currentStatus = initialBooking.status;
    const tempStatus = currentStatus === 'approved' ? 'in_transit' : 'approved';
    
    await updateBookingStatus(bookingId, tempStatus, 'Testing updated_at field');
    
    // Fetch again
    const updatedBooking = await fetchBooking(bookingId);
    const newUpdatedAt = new Date(updatedBooking.updated_at);
    
    log.info(`New updated_at: ${newUpdatedAt.toISOString()}`);
    
    // Revert
    await updateBookingStatus(bookingId, currentStatus, 'Reverting status');
    
    if (newUpdatedAt > initialUpdatedAt) {
      log.success(`✅ updated_at field changes correctly`);
      return true;
    } else {
      log.error(`❌ updated_at field not updated`);
      return false;
    }
  } catch (error) {
    log.error(`❌ Test failed: ${error.message}`);
    return false;
  }
}

// Test 4: Verify all joined fields are present
async function testJoinedFields(booking) {
  log.test('TEST 4: Verifying joined fields from related tables');
  
  const joinedFields = [
    { field: 'customer_name', desc: 'Customer name' },
    { field: 'customer_email', desc: 'Customer email' },
    { field: 'provider_company', desc: 'Provider company' },
    { field: 'truck_model', desc: 'Truck model' },
    { field: 'truck_type', desc: 'Truck type' }
  ];
  
  let allPresent = true;
  
  for (const { field, desc } of joinedFields) {
    if (booking[field]) {
      log.success(`✅ ${desc} present: ${booking[field]}`);
    } else {
      log.warning(`⚠️  ${desc} missing`);
      allPresent = false;
    }
  }
  
  return allPresent;
}

// Main test execution
async function runTests() {
  console.log('\n' + '='.repeat(60));
  console.log('  UI UPDATE TESTING SCRIPT');
  console.log('  Testing Booking Status Update Functionality');
  console.log('='.repeat(60) + '\n');
  
  try {
    // Step 1: Login
    const user = await login();
    console.log('');
    
    // Step 2: Fetch bookings
    const bookings = await fetchBookings();
    console.log('');
    
    if (bookings.length === 0) {
      log.warning('No bookings found. Cannot run tests.');
      log.info('Please create at least one booking in the application first.');
      return;
    }
    
    // Find a suitable test booking (prefer one with status that can be changed)
    const testBooking = bookings.find(b => 
      ['approved', 'in_transit', 'pending_review'].includes(b.status)
    ) || bookings[0];
    
    log.info(`Selected test booking: ${testBooking.id} (Status: ${testBooking.status})`);
    console.log('');
    
    // Run tests
    const results = {
      test1: false,
      test2: false,
      test3: false,
      test4: false
    };
    
    // Test 1: Data completeness
    results.test1 = await testBookingDataCompleteness(testBooking);
    console.log('');
    
    // Test 2: Status update persistence (only if status allows)
    if (['approved', 'in_transit'].includes(testBooking.status)) {
      results.test2 = await testStatusUpdatePersistence(
        testBooking.id,
        testBooking.status,
        testBooking.status === 'approved' ? 'in_transit' : 'approved'
      );
    } else {
      log.warning('⚠️  Skipping Test 2 - booking status not suitable for testing');
      results.test2 = null;
    }
    console.log('');
    
    // Test 3: updated_at changes
    if (['approved', 'in_transit'].includes(testBooking.status)) {
      results.test3 = await testUpdatedAtChanges(testBooking.id);
    } else {
      log.warning('⚠️  Skipping Test 3 - booking status not suitable for testing');
      results.test3 = null;
    }
    console.log('');
    
    // Test 4: Joined fields
    results.test4 = await testJoinedFields(testBooking);
    console.log('');
    
    // Print summary
    console.log('='.repeat(60));
    console.log('  TEST SUMMARY');
    console.log('='.repeat(60));
    
    const passedTests = Object.values(results).filter(r => r === true).length;
    const totalTests = Object.values(results).filter(r => r !== null).length;
    const skippedTests = Object.values(results).filter(r => r === null).length;
    
    console.log(`\nTests Passed: ${passedTests}/${totalTests}`);
    if (skippedTests > 0) {
      console.log(`Tests Skipped: ${skippedTests}`);
    }
    
    console.log('\nDetailed Results:');
    console.log(`  Test 1 (Data Completeness): ${results.test1 ? '✅ PASS' : '❌ FAIL'}`);
    console.log(`  Test 2 (Status Persistence): ${results.test2 === null ? '⚠️  SKIPPED' : results.test2 ? '✅ PASS' : '❌ FAIL'}`);
    console.log(`  Test 3 (Timestamp Updates): ${results.test3 === null ? '⚠️  SKIPPED' : results.test3 ? '✅ PASS' : '❌ FAIL'}`);
    console.log(`  Test 4 (Joined Fields): ${results.test4 ? '✅ PASS' : '⚠️  INCOMPLETE'}`);
    
    console.log('\n' + '='.repeat(60));
    
    if (passedTests === totalTests) {
      log.success('\n🎉 ALL TESTS PASSED! UI updates should work correctly.');
    } else {
      log.warning('\n⚠️  Some tests failed. Review the issues above.');
    }
    
  } catch (error) {
    log.error(`\nTest execution failed: ${error.message}`);
    console.error(error);
    process.exit(1);
  }
}

// Run tests
runTests().then(() => {
  console.log('\n✅ Test script completed.\n');
  process.exit(0);
}).catch((error) => {
  console.error('\n❌ Test script failed:', error);
  process.exit(1);
});
