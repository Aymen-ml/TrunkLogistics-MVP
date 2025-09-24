import Truck from './server/src/models/Truck.js';

async function testTruckSearchDirect() {
  try {
    console.log('🔍 Testing Truck.search method directly...\n');
    
    // Test customer search (with restrictions)
    console.log('1. Testing customer search (onlyAvailable: true)...');
    try {
      const customerResult = await Truck.search({
        onlyAvailable: true,
        page: 1,
        limit: 10
      });
      
      console.log('Customer search result:', {
        success: true,
        trucksCount: customerResult.trucks.length,
        totalCount: customerResult.totalCount,
        trucks: customerResult.trucks.map(truck => ({
          id: truck.id,
          license_plate: truck.license_plate,
          documents_verified: truck.documents_verified,
          provider_verified: truck.provider_verified,
          user_active: truck.user_active
        }))
      });
    } catch (error) {
      console.error('Customer search failed:', error.message);
      console.error('Error details:', error);
    }
    
    console.log('\n2. Testing admin search (adminView: true)...');
    try {
      const adminResult = await Truck.search({
        adminView: true,
        page: 1,
        limit: 10
      });
      
      console.log('Admin search result:', {
        success: true,
        trucksCount: adminResult.trucks.length,
        totalCount: adminResult.totalCount,
        trucks: adminResult.trucks.map(truck => ({
          id: truck.id,
          license_plate: truck.license_plate,
          total_documents: truck.total_documents,
          approved_documents: truck.approved_documents,
          documents_verified: truck.documents_verified,
          provider_verified: truck.provider_verified,
          user_active: truck.user_active
        }))
      });
    } catch (error) {
      console.error('Admin search failed:', error.message);
      console.error('Error details:', error);
    }
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Test failed:', error);
    process.exit(1);
  }
}

testTruckSearchDirect();