import TruckFixed from './server/src/models/TruckFixed.js';

async function testTruckFixed() {
  try {
    console.log('🔍 Testing TruckFixed model...\n');
    
    // Test customer search
    console.log('1. Testing customer search...');
    const customerResult = await TruckFixed.search({
      onlyAvailable: true,
      page: 1,
      limit: 10
    });
    
    console.log('✅ Customer search works! Found', customerResult.trucks.length, 'trucks');
    customerResult.trucks.forEach(truck => {
      console.log(`  - ${truck.license_plate}: docs_verified=${truck.documents_verified}`);
    });
    
    // Test admin search
    console.log('\n2. Testing admin search...');
    const adminResult = await TruckFixed.search({
      adminView: true,
      page: 1,
      limit: 10
    });
    
    console.log('✅ Admin search works! Found', adminResult.trucks.length, 'trucks');
    adminResult.trucks.forEach(truck => {
      console.log(`  - ${truck.license_plate}: total_docs=${truck.total_documents}, approved=${truck.approved_documents}`);
    });
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Test failed:', error);
    process.exit(1);
  }
}

testTruckFixed();