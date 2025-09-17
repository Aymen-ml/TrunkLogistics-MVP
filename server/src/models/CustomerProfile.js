import { query } from '../config/database.js';

class CustomerProfile {
  static async create(profileData) {
    const {
      userId,
      businessType,
      companyName,
      industrySector,
      businessPhone,
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

    const result = await query(
      `INSERT INTO customer_profiles (
        user_id,
        business_type,
        company_name,
        industry_sector,
        business_phone,
        contact_person_name,
        contact_person_position,
        contact_person_email,
        contact_person_phone,
        street_address,
        city,
        state_province,
        postal_code,
        delivery_instructions,
        preferred_payment_methods
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
      RETURNING *`,
      [
        userId,
        businessType,
        companyName,
        industrySector,
        businessPhone,
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
      ]
    );

    return result.rows[0];
  }

  static async findByUserId(userId) {
    try {
      const result = await query(
        'SELECT * FROM customer_profiles WHERE user_id = $1',
        [userId]
      );

      if (!result.rows[0]) {
        return null;
      }

      return result.rows[0];
    } catch (error) {
      console.error('Error in CustomerProfile.findByUserId:', error);
      throw error;
    }
  }

  static async findById(id) {
    const result = await query(
      `SELECT cp.*, u.email, u.first_name, u.last_name, u.phone
       FROM customer_profiles cp
       JOIN users u ON cp.user_id = u.id
       WHERE cp.id = $1`,
      [id]
    );

    return result.rows[0];
  }

  static async update(id, updates) {
    const fields = [];
    const values = [];
    let paramCount = 1;

    const allowedFields = [
      'company_name', 'address', 'city', 'country', 'postal_code'
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
      `UPDATE customer_profiles SET ${fields.join(', ')}, updated_at = CURRENT_TIMESTAMP 
       WHERE id = $${paramCount} 
       RETURNING *`,
      values
    );

    return result.rows[0];
  }

  static async getAll() {
    const result = await query(
      `SELECT cp.*, u.email, u.first_name, u.last_name, u.phone
       FROM customer_profiles cp
       JOIN users u ON cp.user_id = u.id
       ORDER BY cp.created_at DESC`
    );

    return result.rows;
  }
}

export default CustomerProfile;
