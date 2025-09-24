// Debug script to test weight validation logic
console.log('=== Weight Validation Debug ===');

// Simulate the validation scenarios
const testCases = [
  {
    name: 'String 500 vs Number 1000',
    cargoWeight: '500',
    truckCapacity: 1000,
    expected: false // should NOT trigger error
  },
  {
    name: 'String 500 vs String 1000',
    cargoWeight: '500',
    truckCapacity: '1000',
    expected: false // should NOT trigger error
  },
  {
    name: 'String 1500 vs Number 1000',
    cargoWeight: '1500',
    truckCapacity: 1000,
    expected: true // should trigger error
  },
  {
    name: 'Number 500 vs Number 1000',
    cargoWeight: 500,
    truckCapacity: 1000,
    expected: false // should NOT trigger error
  }
];

console.log('\n--- Original (buggy) validation logic ---');
testCases.forEach(test => {
  const result = test.cargoWeight > test.truckCapacity;
  const status = result === test.expected ? '✅ CORRECT' : '❌ WRONG';
  console.log(`${test.name}: ${result} (expected: ${test.expected}) ${status}`);
});

console.log('\n--- Fixed validation logic ---');
testCases.forEach(test => {
  const result = parseFloat(test.cargoWeight) > parseFloat(test.truckCapacity);
  const status = result === test.expected ? '✅ CORRECT' : '❌ WRONG';
  console.log(`${test.name}: ${result} (expected: ${test.expected}) ${status}`);
});

console.log('\n--- Detailed comparison for 500 vs 1000 case ---');
const cargoWeight = '500';
const truckCapacity = 1000;

console.log(`cargoWeight: "${cargoWeight}" (type: ${typeof cargoWeight})`);
console.log(`truckCapacity: ${truckCapacity} (type: ${typeof truckCapacity})`);
console.log(`Direct comparison: "${cargoWeight}" > ${truckCapacity} = ${cargoWeight > truckCapacity}`);
console.log(`With parseFloat: ${parseFloat(cargoWeight)} > ${parseFloat(truckCapacity)} = ${parseFloat(cargoWeight) > parseFloat(truckCapacity)}`);

// Test string comparison behavior
console.log('\n--- String comparison behavior ---');
console.log(`"500" > 1000 = ${"500" > 1000}`); // This is the bug!
console.log(`"500" > "1000" = ${"500" > "1000"}`); // String comparison
console.log(`"500" > "999" = ${"500" > "999"}`); // String comparison