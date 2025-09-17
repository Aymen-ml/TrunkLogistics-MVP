import { query } from '../config/database.js';

class ProviderProfile {
  static async create(profileData) {
    const {
      userId,
      companyName,
      businessType,
      businessLicense,
      businessPhone,
      industrySector,
      contactPersonName,
      contactPersonPosition,
      contactPersonEmail,
      contactPersonPhone,
      streetAddress,
      city,
      stateProvince,
      postalCode,
      deliveryInstructions,
      preferredPaymentMethods
    } = profileData;

    try {
      // Validate required fields
      if (!userId) throw new Error('User ID is required');
      if (!companyName) throw new Error('Company name is required');
      
      const result = await query(
        `INSERT INTO provider_profiles (
          user_id, company_name, business_type, business_license, business_phone,
          industry_sector, contact_person_name, contact_person_position,
          contact_person_email, contact_person_phone, street_address, city,
          state_province, postal_code, delivery_instructions,
          preferred_payment_methods
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)
        RETURNING *`,
        [
          userId,
          companyName,
          businessType || 'individual',
          businessLicense || null,
          businessPhone || null,
          industrySector || '',
          contactPersonName || '',
          contactPersonPosition || '',
          contactPersonEmail || '',
          contactPersonPhone || '',
          streetAddress || '',
          city || '',
          stateProvince || '',
          postalCode || '',
          deliveryInstructions || '',
          Array.isArray(preferredPaymentMethods) ? preferredPaymentMethods : []
        ]
      );
      
      return result.rows[0];
    } catch (error) {
      if (error.code === '23505') { // unique constraint violation
        throw new Error('A provider profile already exists for this user');
      } else if (error.code === '23502') { // not null violation
        throw new Error(`Required field missing: ${error.column}`);
      } else {
        throw new Error(`Failed to create provider profile: ${error.message}`);
      }
    }

    return result.rows[0];
  }

  static async findByUserId(userId) {
    const result = await query(
      'SELECT * FROM provider_profiles WHERE user_id = $1',
      [userId]
    );

    return result.rows[0];
  }

  static async findById(id) {
    const result = await query(
      `SELECT pp.*, u.email, u.first_name, u.last_name, u.phone
       FROM provider_profiles pp
       JOIN users u ON pp.user_id = u.id
       WHERE pp.id = $1`,
      [id]
    );

    return result.rows[0];
  }

  static async validateProvider(id, adminId, status, notes = null) {
    const result = await query(
      `UPDATE provider_profiles 
       SET is_validated = $1,
           validation_status = $2,
           validation_notes = $3,
           validated_at = CURRENT_TIMESTAMP,
           validated_by = $4
       WHERE id = $5
       RETURNING *`,
      [status === 'approved', status, notes, adminId, id]
    );
    return result.rows[0];
  }

  static async getValidatedProviders() {
    const result = await query(
      `SELECT pp.*, u.email, u.first_name, u.last_name, u.phone
       FROM provider_profiles pp
       JOIN users u ON pp.user_id = u.id
       WHERE pp.is_validated = true
       AND pp.validation_status = 'approved'`
    );
    return result.rows;
  }

  static async update(id, updates) {
    const fields = [];
    const values = [];
    let paramCount = 1;

    const allowedFields = [
      'company_name', 'business_license', 'address', 
      'city', 'country', 'postal_code'
    ];

    Object.keys(updates).forEach(key => {
      if (allowedFields.includes(key) && updates[key] !== undefined) {
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
      `UPDATE provider_profiles SET ${fields.join(', ')}, updated_at = CURRENT_TIMESTAMP 
       WHERE id = $${paramCount} 
       RETURNING *`,
      values
    );

    return result.rows[0];
  }

  static async setVerificationStatus(id, status, verifiedBy = null) {
    const result = await query(
      `UPDATE provider_profiles 
       SET verification_status = $1, is_verified = $2, updated_at = CURRENT_TIMESTAMP 
       WHERE id = $3 
       RETURNING *`,
      [status, status === 'approved', id]
    );

    return result.rows[0];
  }

  static async getAll(filters = {}) {
    let whereConditions = [];
    let values = [];
    let paramCount = 1;

    if (filters.verificationStatus) {
      whereConditions.push(`pp.verification_status = $${paramCount}`);
      values.push(filters.verificationStatus);
      paramCount++;
    }

    if (filters.isVerified !== undefined) {
      whereConditions.push(`pp.is_verified = $${paramCount}`);
      values.push(filters.isVerified);
      paramCount++;
    }

    const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';

    const result = await query(
      `SELECT pp.*, u.email, u.first_name, u.last_name, u.phone
       FROM provider_profiles pp
       JOIN users u ON pp.user_id = u.id
       ${whereClause}
       ORDER BY pp.created_at DESC`,
      values
    );

    return result.rows;
  }
}

export default ProviderProfile;
