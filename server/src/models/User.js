import { query } from '../config/database.js';
import bcrypt from 'bcryptjs';

class User {
  static async create({ email, password, role, firstName, lastName, phone }) {
    const hashedPassword = await bcrypt.hash(password, 12);
    
    const result = await query(
      `INSERT INTO users (email, password_hash, role, first_name, last_name, phone) 
       VALUES ($1, $2, $3, $4, $5, $6) 
       RETURNING id, email, role, first_name, last_name, phone, is_active, email_verified, created_at`,
      [email, hashedPassword, role, firstName, lastName, phone]
    );
    
    return result.rows[0];
  }

  static async findByEmail(email) {
    const result = await query(
      'SELECT * FROM users WHERE email = $1',
      [email]
    );
    
    return result.rows[0];
  }

  static async findById(id) {
    const result = await query(
      'SELECT id, email, role, first_name, last_name, phone, is_active, email_verified, created_at FROM users WHERE id = $1',
      [id]
    );
    
    return result.rows[0];
  }

  static async updateProfile(id, updates) {
    const fields = [];
    const values = [];
    let paramCount = 1;

    Object.keys(updates).forEach(key => {
      if (['first_name', 'last_name', 'phone'].includes(key)) {
        fields.push(`${key} = $${paramCount}`);
        values.push(updates[key]);
        paramCount++;
      }
    });

    if (fields.length === 0) {
      throw new Error('No valid fields to update');
    }

    values.push(id);
    
    const result = await query(
      `UPDATE users SET ${fields.join(', ')}, updated_at = CURRENT_TIMESTAMP 
       WHERE id = $${paramCount} 
       RETURNING id, email, role, first_name, last_name, phone, is_active, email_verified, created_at`,
      values
    );
    
    return result.rows[0];
  }

  static async verifyPassword(plainPassword, hashedPassword) {
    return await bcrypt.compare(plainPassword, hashedPassword);
  }

  static async updatePassword(id, newPassword) {
    const hashedPassword = await bcrypt.hash(newPassword, 12);
    
    await query(
      'UPDATE users SET password_hash = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
      [hashedPassword, id]
    );
  }

  static async setEmailVerified(id, verified = true) {
    await query(
      'UPDATE users SET email_verified = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
      [verified, id]
    );
  }

  static async setActive(id, active = true) {
    await query(
      'UPDATE users SET is_active = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
      [active, id]
    );
  }

  static async delete(id) {
    await query(
      'DELETE FROM users WHERE id = $1',
      [id]
    );
  }

  static async getAll(filters = {}) {
    let whereClause = '';
    const values = [];
    let paramCount = 1;

    if (filters.role) {
      whereClause = `WHERE role = $${paramCount}`;
      values.push(filters.role);
      paramCount++;
    }

    if (filters.is_active !== undefined) {
      whereClause += whereClause ? ' AND ' : 'WHERE ';
      whereClause += `is_active = $${paramCount}`;
      values.push(filters.is_active);
    }

    const result = await query(
      `SELECT id, email, role, first_name, last_name, phone, is_active, email_verified, created_at 
       FROM users ${whereClause} 
       ORDER BY created_at DESC`,
      values
    );
    
    return result.rows;
  }
}

export default User;
