import { query } from './src/config/database.js';

async function checkConstraints() {
  try {
    console.log('🔄 Checking email_verifications table constraints...\n');
    
    const result = await query(`
      SELECT
        tc.constraint_name,
        tc.constraint_type,
        tc.table_name,
        kcu.column_name,
        ccu.table_name AS foreign_table_name,
        ccu.column_name AS foreign_column_name
      FROM information_schema.table_constraints tc
      JOIN information_schema.key_column_usage kcu
        ON tc.constraint_name = kcu.constraint_name
      LEFT JOIN information_schema.constraint_column_usage ccu
        ON ccu.constraint_name = tc.constraint_name
      WHERE tc.table_name = 'email_verifications'
      ORDER BY tc.constraint_name;
    `);
    
    console.log('📋 Email verifications table constraints:');
    result.rows.forEach(row => {
      console.log(`  - ${row.constraint_name}: ${row.constraint_type} on ${row.column_name}`);
      if (row.foreign_table_name) {
        console.log(`    → References: ${row.foreign_table_name}.${row.foreign_column_name}`);
      }
    });
    
    console.log('\n🔄 Checking if user_id column allows NULL...\n');
    const columnInfo = await query(`
      SELECT column_name, is_nullable, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'email_verifications' AND column_name = 'user_id'
    `);
    
    console.log('📋 user_id column info:');
    columnInfo.rows.forEach(col => {
      console.log(`  - ${col.column_name}: ${col.data_type} (nullable: ${col.is_nullable})`);
    });
    
  } catch (error) {
    console.error('Error:', error);
  }
  
  process.exit(0);
}

checkConstraints();