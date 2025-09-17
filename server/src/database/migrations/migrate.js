import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { query } from '../../config/database.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function runMigration() {
  try {
    // Read and execute the SQL file
    const sql = fs.readFileSync(
      path.join(__dirname, '20230915_update_customer_profiles.sql'),
      'utf-8'
    );

    await query(sql);
    } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

runMigration();