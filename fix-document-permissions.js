#!/usr/bin/env node

/**
 * Fix Document Permissions - Alternative Permission Logic
 * 
 * This script provides an alternative permission check that might be more robust
 */

import { query } from './server/src/config/database.js';
import chalk from 'chalk';

async function testDocumentPermissions() {
  console.log(chalk.blue('🔍 Testing Document Permission Logic\n'));

  try {
    // Test query to see the actual data structure
    console.log(chalk.yellow('1. Testing document-user relationship query...'));
    
    const testQuery = `
      SELECT 
        d.id as document_id,
        d.file_name,
        d.entity_id as truck_id,
        t.license_plate,
        t.provider_id,
        pp.id as provider_profile_id,
        pp.user_id as provider_user_id,
        u.id as user_id,
        u.email as user_email,
        u.role as user_role
      FROM documents d
      LEFT JOIN trucks t ON d.entity_id = t.id AND d.entity_type = 'truck'
      LEFT JOIN provider_profiles pp ON t.provider_id = pp.id
      LEFT JOIN users u ON pp.user_id = u.id
      WHERE d.entity_type = 'truck'
      LIMIT 5
    `;

    const result = await query(testQuery);
    
    console.log(chalk.green(`✅ Found ${result.rows.length} documents`));
    
    result.rows.forEach((row, index) => {
      console.log(chalk.gray(`\nDocument ${index + 1}:`));
      console.log(chalk.gray(`  Document ID: ${row.document_id}`));
      console.log(chalk.gray(`  File Name: ${row.file_name}`));
      console.log(chalk.gray(`  Truck ID: ${row.truck_id}`));
      console.log(chalk.gray(`  License Plate: ${row.license_plate}`));
      console.log(chalk.gray(`  Provider Profile ID: ${row.provider_profile_id}`));
      console.log(chalk.gray(`  Provider User ID: ${row.provider_user_id}`));
      console.log(chalk.gray(`  User Email: ${row.user_email}`));
      console.log(chalk.gray(`  User Role: ${row.user_role}`));
    });

    // Test alternative permission logic
    console.log(chalk.yellow('\n2. Testing alternative permission logic...'));
    
    const alternativeQuery = `
      SELECT 
        d.id as document_id,
        d.file_name,
        t.license_plate,
        -- Multiple ways to get the owner user ID
        u.id as owner_user_id_method1,
        pp.user_id as owner_user_id_method2,
        -- Check if they match
        (u.id = pp.user_id) as ids_match
      FROM documents d
      LEFT JOIN trucks t ON d.entity_id = t.id AND d.entity_type = 'truck'
      LEFT JOIN provider_profiles pp ON t.provider_id = pp.id
      LEFT JOIN users u ON pp.user_id = u.id
      WHERE d.entity_type = 'truck'
      LIMIT 3
    `;

    const altResult = await query(alternativeQuery);
    
    console.log(chalk.green(`✅ Alternative query results:`));
    
    altResult.rows.forEach((row, index) => {
      console.log(chalk.gray(`\nDocument ${index + 1}:`));
      console.log(chalk.gray(`  Document ID: ${row.document_id}`));
      console.log(chalk.gray(`  Owner ID Method 1: ${row.owner_user_id_method1}`));
      console.log(chalk.gray(`  Owner ID Method 2: ${row.owner_user_id_method2}`));
      console.log(chalk.gray(`  IDs Match: ${row.ids_match}`));
    });

    console.log(chalk.blue('\n📋 Analysis:'));
    console.log(chalk.gray('- Check if owner_user_id values are null'));
    console.log(chalk.gray('- Verify provider_profiles are properly linked to users'));
    console.log(chalk.gray('- Ensure trucks are properly linked to provider_profiles'));

  } catch (error) {
    console.error(chalk.red('❌ Test failed:'), error.message);
  }
}

// Only run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  testDocumentPermissions().catch(console.error);
}

export { testDocumentPermissions };
