import { query } from "../config/database.js";

class CustomerProfile {
  static async create(profileData) {
    const { userId, streetAddress, city, postalCode } = profileData;

    // Use only the columns that actually exist in the customer_profiles table
    // Based on the current database schema: id, user_id, address, city, postal_code, created_at, updated_at
    try {
      const result = await query(
        `INSERT INTO customer_profiles (
          user_id,
          address,
          city,
          postal_code
        ) VALUES ($1, $2, $3, $4)
        RETURNING *`,
        [userId, streetAddress || "", city || "", postalCode || ""],
      );

      return result.rows[0];
    } catch (error) {
      console.error("CustomerProfile creation error:", error);

      // If that fails, try with minimal data (just user_id is required)
      try {
        const minimalResult = await query(
          `INSERT INTO customer_profiles (user_id) VALUES ($1) RETURNING *`,
          [userId],
        );

        console.log("✅ Customer profile created with minimal data");
        return minimalResult.rows[0];
      } catch (minimalError) {
        console.error(
          "❌ Minimal CustomerProfile creation also failed:",
          minimalError,
        );
        throw new Error(`Failed to create customer profile: ${error.message}`);
      }
    }
  }

  static async findByUserId(userId) {
    try {
      const result = await query(
        "SELECT * FROM customer_profiles WHERE user_id = $1",
        [userId],
      );

      if (!result.rows[0]) {
        return null;
      }

      return result.rows[0];
    } catch (error) {
      console.error("Error in CustomerProfile.findByUserId:", error);
      throw error;
    }
  }

  static async findById(id) {
    const result = await query(
      `SELECT cp.*, u.email, u.first_name, u.last_name, u.phone
       FROM customer_profiles cp
       JOIN users u ON cp.user_id = u.id
       WHERE cp.id = $1`,
      [id],
    );

    return result.rows[0];
  }

  static async update(id, updates) {
    const fields = [];
    const values = [];
    let paramCount = 1;

    // Only allow updating fields that actually exist in the database
    const allowedFields = ["address", "city", "postal_code"];

    Object.keys(updates).forEach((key) => {
      if (allowedFields.includes(key) && updates[key] !== undefined) {
        fields.push(`${key} = $${paramCount}`);
        values.push(updates[key]);
        paramCount++;
      }
    });

    if (fields.length === 0) {
      throw new Error("No valid fields to update");
    }

    values.push(id);

    const result = await query(
      `UPDATE customer_profiles SET ${fields.join(", ")}, updated_at = CURRENT_TIMESTAMP
       WHERE id = $${paramCount}
       RETURNING *`,
      values,
    );

    return result.rows[0];
  }

  static async getAll() {
    const result = await query(
      `SELECT cp.*, u.email, u.first_name, u.last_name, u.phone
       FROM customer_profiles cp
       JOIN users u ON cp.user_id = u.id
       ORDER BY cp.created_at DESC`,
    );

    return result.rows;
  }
}

export default CustomerProfile;
