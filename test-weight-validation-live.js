// Test script to debug weight validation issue in production
// This script can be run in the browser console to test the validation logic

console.log('=== Live Weight Validation Test ===');

// Test function that mimics the validation logic
function testWeightValidation(cargoWeight, truckCapacity) {
  console.log('\n--- Testing Weight Validation ---');
  console.log(`Input cargo weight: "${cargoWeight}" (type: ${typeof cargoWeight})`);
  console.log(`Input truck capacity: "${truckCapacity}" (type: ${typeof truckCapacity})`);
  
  // Original buggy logic (direct comparison)
  const directComparison = cargoWeight > truckCapacity;
  console.log(`Direct comparison: ${cargoWeight} > ${truckCapacity} = ${directComparison}`);
  
  // Fixed logic (with parseFloat)
  const cargoWeightParsed = parseFloat(cargoWeight);
  const truckCapacityParsed = parseFloat(truckCapacity);
  const fixedComparison = cargoWeightParsed > truckCapacityParsed;
  
  console.log(`Parsed cargo weight: ${cargoWeightParsed} (type: ${typeof cargoWeightParsed})`);
  console.log(`Parsed truck capacity: ${truckCapacityParsed} (type: ${typeof truckCapacityParsed})`);
  console.log(`Fixed comparison: ${cargoWeightParsed} > ${truckCapacityParsed} = ${fixedComparison}`);
  
  // Additional checks
  console.log(`isNaN(cargoWeightParsed): ${isNaN(cargoWeightParsed)}`);
  console.log(`isNaN(truckCapacityParsed): ${isNaN(truckCapacityParsed)}`);
  
  const shouldShowError = !isNaN(cargoWeightParsed) && !isNaN(truckCapacityParsed) && cargoWeightParsed > truckCapacityParsed;
  console.log(`Should show error: ${shouldShowError}`);
  
  return {
    directComparison,
    fixedComparison,
    shouldShowError,
    cargoWeightParsed,
    truckCapacityParsed
  };
}

// Test cases
console.log('\n=== Test Cases ===');

// Test case 1: The problematic case (500 vs 1000)
testWeightValidation('500', 1000);
testWeightValidation('500', '1000');
testWeightValidation('500', '1000.00');

// Test case 2: Edge cases
testWeightValidation('1000', 1000);
testWeightValidation('1000.01', 1000);
testWeightValidation('999.99', 1000);

// Test case 3: String comparisons that might be problematic
testWeightValidation('500', '999');  // This should be false but might be true in string comparison
testWeightValidation('500', '1000'); // This should be false

console.log('\n=== Instructions ===');
console.log('1. Open the booking form in your browser');
console.log('2. Open browser developer tools (F12)');
console.log('3. Go to Console tab');
console.log('4. Copy and paste this entire script');
console.log('5. Try creating a booking with 500kg weight');
console.log('6. Check the console for "Weight validation debug" messages');
console.log('7. Compare the actual values with the test results above');

// Function to check current form state (if on booking page)
function checkCurrentFormState() {
  const cargoWeightInput = document.querySelector('input[name="cargo_weight"]');
  const truckSelect = document.querySelector('select[name="truck_id"]');
  
  if (cargoWeightInput && truckSelect) {
    console.log('\n=== Current Form State ===');
    console.log('Cargo weight input value:', cargoWeightInput.value);
    console.log('Selected truck ID:', truckSelect.value);
    
    // Try to get selected truck data from React state (this might not work)
    console.log('Note: To see truck capacity, check the browser console for "Weight validation debug" messages when you change the weight field');
  } else {
    console.log('\n=== Form Not Found ===');
    console.log('Make sure you are on the booking form page');
  }
}

checkCurrentFormState();