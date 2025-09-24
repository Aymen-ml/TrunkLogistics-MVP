import { query } from './server/src/config/database.js';

async function debugColumnNames() {
  try {
    console.log('🔍 Debugging column names...\n');
    
    // Check the actual column names in the users table
    console.log('1. Checking users table structure...');
    const usersStructure = await query(`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns 
      WHERE table_name = 'users' 
      ORDER BY ordinal_position
    `);
    
    console.log('Users table columns:');
    usersStructure.rows.forEach(col => {
      console.log(`  - ${col.column_name}: ${col.data_type} (nullable: ${col.is_nullable})`);
    });
    
    console.log('\n2. Checking actual user data...');
    const userData = await query(`
      SELECT id, email, role, is_active, email_verified
      FROM users 
      WHERE role IN ('provider', 'customer')
      LIMIT 5
    `);
    
    console.log('User data:');
    userData.rows.forEach(user => {
      console.log(`  - ${user.email}: role=${user.role}, is_active=${user.is_active}, email_verified=${user.email_verified}`);
    });
    
    console.log('\n3. Testing the exact customer query with explicit column selection...');
    const testQuery = `
      SELECT t.id, t.license_plate,
             u.is_active,
             u.email,
             pp.is_verified as provider_verified
       FROM trucks t
       JOIN provider_profiles pp ON t.provider_id = pp.id
       JOIN users u ON pp.user_id = u.id
       WHERE t.status = 'active'
       LIMIT 3`;
    
    const testResult = await query(testQuery);
    console.log('Test query result:');
    testResult.rows.forEach(row => {
      console.log(`  - Truck ${row.license_plate}: user_active=${row.is_active}, provider_verified=${row.provider_verified}, email=${row.email}`);
    });
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Debug failed:', error);
    process.exit(1);
  }
}

debugColumnNames();