// Test fixed-price booking functionality
import fetch from 'node-fetch';

const API_BASE = 'https://trunklogistics-api.onrender.com';

async function testFixedPriceBooking() {
  try {
    console.log('🚛 Testing Fixed-Price Booking System...\n');
    
    // First, let's check what trucks are available and their pricing types
    console.log('1. Getting available trucks to check pricing types...');
    
    // Register a test customer first
    const customerData = {
      email: `testcustomer${Date.now()}@example.com`,
      password: 'testpass123',
      firstName: 'Test',
      lastName: 'Customer',
      role: 'customer',
      phone: '+1234567890',
      companyName: 'Test Company',
      businessType: 'company',
      streetAddress: '123 Test St',
      city: 'Test City',
      postalCode: '12345'
    };
    
    const registerResponse = await fetch(`${API_BASE}/api/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(customerData)
    });
    
    const registerResult = await registerResponse.json();
    if (!registerResult.success) {
      console.log('❌ Registration failed:', registerResult);
      return;
    }
    
    const customerToken = registerResult.data.token;
    console.log('✅ Customer registered successfully');
    
    // Get available trucks
    const trucksResponse = await fetch(`${API_BASE}/api/trucks`, {
      headers: {
        'Authorization': `Bearer ${customerToken}`
      }
    });
    
    const trucksData = await trucksResponse.json();
    if (!trucksData.success) {
      console.log('❌ Failed to get trucks:', trucksData.error);
      return;
    }
    
    console.log(`\n📋 Found ${trucksData.data.trucks.length} available trucks:`);
    
    let fixedPriceTruck = null;
    let perKmTruck = null;
    
    trucksData.data.trucks.forEach(truck => {
      console.log(`  - ${truck.license_plate} (${truck.truck_type})`);
      console.log(`    Pricing: ${truck.pricing_type || 'not set'}`);
      console.log(`    Fixed Price: ${truck.fixed_price || 'N/A'}`);
      console.log(`    Per KM Price: ${truck.price_per_km || 'N/A'}`);
      console.log('');
      
      if (truck.pricing_type === 'fixed' && truck.fixed_price) {
        fixedPriceTruck = truck;
      } else if (truck.pricing_type === 'per_km' && truck.price_per_km) {
        perKmTruck = truck;
      }
    });
    
    // Test fixed-price truck booking
    if (fixedPriceTruck) {
      console.log(`\n2. Testing FIXED PRICE booking with truck: ${fixedPriceTruck.license_plate}`);
      console.log(`   Fixed Price: $${fixedPriceTruck.fixed_price}`);
      
      // Test price estimate for fixed-price truck
      console.log('\n   2a. Getting price estimate (should return fixed price)...');
      const estimateResponse = await fetch(
        `${API_BASE}/api/bookings/price-estimate?truckId=${fixedPriceTruck.id}&pickupCity=Casablanca&destinationCity=Rabat`,
        {
          headers: {
            'Authorization': `Bearer ${customerToken}`
          }
        }
      );
      
      const estimateData = await estimateResponse.json();
      if (estimateData.success) {
        console.log('   ✅ Price estimate successful:');
        console.log(`      Pricing Type: ${estimateData.data.pricing_type}`);
        console.log(`      Total Price: $${estimateData.data.total_price}`);
        console.log(`      Distance: ${estimateData.data.distance || 'N/A (not needed for fixed pricing)'}`);
        console.log(`      Calculation: ${estimateData.data.price_breakdown?.calculation}`);
        
        // Verify it's using fixed pricing
        if (estimateData.data.pricing_type === 'fixed' && 
            estimateData.data.total_price == fixedPriceTruck.fixed_price) {
          console.log('   ✅ Fixed pricing working correctly!');
        } else {
          console.log('   ❌ Fixed pricing not working as expected');
        }
      } else {
        console.log('   ❌ Price estimate failed:', estimateData.error);
      }
      
      // Test actual booking creation
      console.log('\n   2b. Creating booking with fixed-price truck...');
      const bookingData = {
        truckId: fixedPriceTruck.id,
        pickupAddress: '123 Pickup Street',
        pickupCity: 'Casablanca',
        destinationAddress: '456 Destination Ave',
        destinationCity: 'Rabat',
        pickupDate: '2025-01-15',
        pickupTime: '10:00',
        cargoDescription: 'Test cargo for fixed price',
        cargoWeight: 100,
        cargoVolume: 50,
        notes: 'Test booking for fixed-price truck'
      };
      
      const bookingResponse = await fetch(`${API_BASE}/api/bookings`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${customerToken}`
        },
        body: JSON.stringify(bookingData)
      });
      
      const bookingResult = await bookingResponse.json();
      if (bookingResult.success) {
        const booking = bookingResult.data.booking;
        console.log('   ✅ Fixed-price booking created successfully!');
        console.log(`      Booking ID: ${booking.id}`);
        console.log(`      Total Price: $${booking.total_price}`);
        console.log(`      Estimated Distance: ${booking.estimated_distance || 'N/A (not calculated for fixed pricing)'}`);
        console.log(`      Status: ${booking.status}`);
        
        // Verify the price matches the fixed price
        if (parseFloat(booking.total_price) === parseFloat(fixedPriceTruck.fixed_price)) {
          console.log('   ✅ Booking price matches truck\'s fixed price!');
        } else {
          console.log(`   ❌ Price mismatch: booking=$${booking.total_price}, truck=$${fixedPriceTruck.fixed_price}`);
        }
      } else {
        console.log('   ❌ Fixed-price booking failed:', bookingResult.error);
      }
    } else {
      console.log('\n2. ⚠️ No fixed-price trucks found for testing');
    }
    
    // Test per-km truck booking for comparison
    if (perKmTruck) {
      console.log(`\n3. Testing PER-KM pricing booking with truck: ${perKmTruck.license_plate} (for comparison)`);
      console.log(`   Per KM Price: $${perKmTruck.price_per_km}`);
      
      // Test price estimate for per-km truck
      console.log('\n   3a. Getting price estimate (should calculate based on distance)...');
      const estimateResponse = await fetch(
        `${API_BASE}/api/bookings/price-estimate?truckId=${perKmTruck.id}&pickupCity=Casablanca&destinationCity=Rabat`,
        {
          headers: {
            'Authorization': `Bearer ${customerToken}`
          }
        }
      );
      
      const estimateData = await estimateResponse.json();
      if (estimateData.success) {
        console.log('   ✅ Price estimate successful:');
        console.log(`      Pricing Type: ${estimateData.data.pricing_type}`);
        console.log(`      Distance: ${estimateData.data.distance}km`);
        console.log(`      Price per KM: $${estimateData.data.price_per_km}`);
        console.log(`      Total Price: $${estimateData.data.total_price}`);
        console.log(`      Calculation: ${estimateData.data.price_breakdown?.calculation}`);
      } else {
        console.log('   ❌ Price estimate failed:', estimateData.error);
      }
    } else {
      console.log('\n3. ⚠️ No per-km trucks found for comparison');
    }
    
    console.log('\n🎉 Fixed-price booking test completed!');
    console.log('\n📝 Summary:');
    console.log('   - Fixed-price trucks should use their fixed price directly');
    console.log('   - No distance calculation needed for fixed pricing');
    console.log('   - Per-km trucks calculate price based on distance');
    console.log('   - Both pricing types should work correctly in the booking system');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

testFixedPriceBooking();