import { query } from '../config/database.js';

export async function up() {
  // Add email_verified column to users table
  await query(`
    ALTER TABLE users 
    ADD COLUMN email_verified BOOLEAN DEFAULT false,
    ADD COLUMN email_verification_required BOOLEAN DEFAULT true
  `);

  // Create email_verifications table
  await query(`
    CREATE TABLE email_verifications (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      token VARCHAR(255) NOT NULL,
      expires_at TIMESTAMP NOT NULL,
      verified_at TIMESTAMP,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      UNIQUE (token)
    )
  `);
}

export async function down() {
  await query('DROP TABLE IF EXISTS email_verifications');
  await query('ALTER TABLE users DROP COLUMN email_verified, DROP COLUMN email_verification_required');
}