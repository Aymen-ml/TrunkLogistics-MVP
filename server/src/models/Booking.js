import { query } from '../config/database.js';
import logger from '../utils/logger.js';

class Booking {
  static async update(id, updateData) {
    const allowedFields = [
      'truck_id',
      'pickup_address',
      'pickup_city',
      'destination_address',
      'destination_city',
      'pickup_date',
      'pickup_time',
      'cargo_description',
      'cargo_weight',
      'cargo_volume',
      'estimated_distance',
      'total_price',
      'notes',
      'status',
      // Rental-specific fields
      'service_type',
      'rental_start_datetime',
      'rental_end_datetime',
      'work_address',
      'operator_required',
      'operator_provided',
      'rental_duration_hours',
      'purpose_description'
    ];

    // Filter out fields that are not allowed to be updated
    const validFields = Object.keys(updateData).filter(key => allowedFields.includes(key));
    if (validFields.length === 0) {
      throw new Error('No valid fields to update');
    }

    // Build the SET clause for the SQL query
    const setClause = validFields.map((field, index) => `${field} = $${index + 2}`).join(', ');
    const values = validFields.map(field => updateData[field]);

    // Add the id as the first parameter
    values.unshift(id);

    const result = await query(
      `UPDATE bookings SET ${setClause}, updated_at = NOW() WHERE id = $1 RETURNING *`,
      values
    );

    if (result.rows.length === 0) {
      throw new Error('Booking not found');
    }

    return result.rows[0];
  }

  static async create(bookingData) {
    const {
      customer_id,
      truck_id,
      pickup_address,
      pickup_city,
      destination_address,
      destination_city,
      pickup_date,
      pickup_time,
      cargo_description,
      cargo_weight,
      cargo_volume,
      estimated_distance,
      total_price,
      notes,
      status,
      // Rental-specific fields
      service_type = 'transport',
      rental_start_datetime,
      rental_end_datetime,
      work_address,
      operator_required = false,
      operator_provided = false,
      rental_duration_hours,
      purpose_description
    } = bookingData;

    // Debug logging for booking creation
    logger.info('Creating booking with data:', {
      customer_id,
      truck_id,
      pickup_address,
      pickup_city,
      destination_address,
      destination_city,
      pickup_date,
      pickup_time,
      cargo_description,
      cargo_weight: { value: cargo_weight, type: typeof cargo_weight },
      cargo_volume: { value: cargo_volume, type: typeof cargo_volume },
      estimated_distance: { value: estimated_distance, type: typeof estimated_distance },
      total_price: { value: total_price, type: typeof total_price },
      notes,
      status,
      service_type,
      rental_start_datetime,
      rental_end_datetime,
      work_address,
      operator_required,
      operator_provided,
      rental_duration_hours,
      purpose_description
    });

    try {
      const result = await query(
        `INSERT INTO bookings (
          customer_id, truck_id, pickup_address, pickup_city,
          destination_address, destination_city, pickup_date, pickup_time,
          cargo_description, cargo_weight, cargo_volume, estimated_distance,
          total_price, notes, status,
          service_type, rental_start_datetime, rental_end_datetime, work_address,
          operator_required, operator_provided, rental_duration_hours, purpose_description
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23)
        RETURNING *`,
        [
          customer_id, truck_id, pickup_address, pickup_city,
          destination_address, destination_city, pickup_date, pickup_time,
          cargo_description, cargo_weight, cargo_volume, estimated_distance,
          total_price, notes, status,
          service_type, rental_start_datetime, rental_end_datetime, work_address,
          operator_required, operator_provided, rental_duration_hours, purpose_description
        ]
      );

      logger.info('Booking created successfully:', { bookingId: result.rows[0].id });

      // Log status change
      await this.logStatusChange(result.rows[0].id, status, null, 'Booking created');

      return result.rows[0];
    } catch (error) {
      logger.error('Error creating booking in database:', {
        error: error.message,
        code: error.code,
        detail: error.detail,
        constraint: error.constraint,
        table: error.table,
        column: error.column,
        bookingData: {
          customer_id,
          truck_id,
          total_price: { value: total_price, type: typeof total_price },
          cargo_weight: { value: cargo_weight, type: typeof cargo_weight },
          service_type,
          status
        }
      });
      throw error;
    }
  }

  static async findById(id) {
    const result = await query(
      `SELECT b.*, 
              CASE 
                WHEN b.truck_id IS NOT NULL THEN
                  -- Truck still exists
                  jsonb_build_object(
                    'truck_type', t.truck_type,
                    'license_plate', t.license_plate,
                    'capacity_weight', t.capacity_weight,
                    'capacity_volume', t.capacity_volume,
                    'make', t.make,
                    'model', t.model,
                    'year', t.year,
                    'price_per_km', t.price_per_km,
                    'fixed_price', t.fixed_price,
                    'pricing_type', t.pricing_type,
                    'is_deleted', false
                  )
                ELSE
                  -- Truck was deleted, use stored info
                  COALESCE(
                    b.deleted_truck_info || jsonb_build_object('is_deleted', true),
                    jsonb_build_object(
                      'license_plate', 'Deleted Truck',
                      'truck_type', 'unknown',
                      'is_deleted', true
                    )
                  )
              END as truck_info,
              CASE 
                WHEN b.truck_id IS NOT NULL THEN pp.id
                ELSE dt.provider_id
              END as provider_id,
              CASE 
                WHEN b.truck_id IS NOT NULL THEN pp.company_name
                ELSE 'Former Provider'
              END as provider_company,
              CASE 
                WHEN b.truck_id IS NOT NULL THEN pu.first_name
                ELSE ''
              END as provider_first_name,
              CASE 
                WHEN b.truck_id IS NOT NULL THEN pu.last_name
                ELSE ''
              END as provider_last_name,
              CASE 
                WHEN b.truck_id IS NOT NULL THEN pu.phone
                ELSE ''
              END as provider_phone,
              CASE 
                WHEN b.truck_id IS NOT NULL THEN pu.email
                ELSE ''
              END as provider_email,
              CASE 
                WHEN b.truck_id IS NOT NULL THEN CONCAT(pu.first_name, ' ', pu.last_name)
                ELSE 'Former Provider'
              END as provider_name,
              cp.company_name as customer_company,
              cu.first_name as customer_first_name, cu.last_name as customer_last_name, 
              cu.phone as customer_phone, cu.email as customer_email,
              CONCAT(cu.first_name, ' ', cu.last_name) as customer_name,
              b.id as booking_number
       FROM bookings b
       LEFT JOIN trucks t ON b.truck_id = t.id
       LEFT JOIN provider_profiles pp ON t.provider_id = pp.id
       LEFT JOIN users pu ON pp.user_id = pu.id
       LEFT JOIN deleted_trucks dt ON b.truck_id IS NULL AND dt.id IS NOT NULL
       JOIN customer_profiles cp ON b.customer_id = cp.id
       JOIN users cu ON cp.user_id = cu.id
       WHERE b.id = $1`,
      [id]
    );

    const booking = result.rows[0];
    if (booking && booking.truck_info) {
      // Parse truck_info and add individual fields for backward compatibility
      const truckInfo = booking.truck_info;
      booking.truck_type = truckInfo.truck_type;
      booking.truck_license_plate = truckInfo.license_plate;
      booking.truck_capacity = truckInfo.capacity_weight;
      booking.capacity_volume = truckInfo.capacity_volume;
      booking.truck_make = truckInfo.make;
      booking.truck_model = truckInfo.model;
      booking.truck_year = truckInfo.year;
      booking.price_per_km = truckInfo.price_per_km;
      booking.fixed_price = truckInfo.fixed_price;
      booking.pricing_type = truckInfo.pricing_type;
      booking.truck_deleted = truckInfo.is_deleted || false;
    }

    return booking;
  }

  static async findByCustomerId(customerId, filters = {}) {
    try {
      const params = [customerId];
      let conditions = ['b.customer_id = $1', 'b.deleted_by_customer_at IS NULL'];
      let paramCount = 1;

      if (filters.status && filters.status !== 'all') {
        paramCount++;
        params.push(filters.status);
        conditions.push(`b.status = $${paramCount}`);
      }

      if (filters.search) {
        paramCount++;
        params.push(`%${filters.search}%`);
        conditions.push(`(
          COALESCE(t.license_plate, b.deleted_truck_info->>'license_plate', 'Deleted Truck') ILIKE $${paramCount} OR
          b.pickup_city ILIKE $${paramCount} OR
          b.destination_city ILIKE $${paramCount} OR
          b.cargo_description ILIKE $${paramCount} OR
          b.work_address ILIKE $${paramCount} OR
          b.purpose_description ILIKE $${paramCount}
        )`);
      }

      if (filters.dateFrom) {
        paramCount++;
        params.push(filters.dateFrom);
        conditions.push(`(
          (b.service_type = 'transport' AND b.pickup_date >= $${paramCount}) OR
          (b.service_type = 'rental' AND DATE(b.rental_start_datetime) >= $${paramCount})
        )`);
      }

      if (filters.dateTo) {
        paramCount++;
        params.push(filters.dateTo);
        conditions.push(`(
          (b.service_type = 'transport' AND b.pickup_date <= $${paramCount}) OR
          (b.service_type = 'rental' AND DATE(b.rental_start_datetime) <= $${paramCount})
        )`);
      }

      if (filters.provider && filters.provider !== 'all') {
        paramCount++;
        params.push(filters.provider);
        conditions.push(`COALESCE(pp.company_name, 'Former Provider') = $${paramCount}`);
      }

      if (filters.service_type && filters.service_type !== 'all') {
        paramCount++;
        params.push(filters.service_type);
        conditions.push(`b.service_type = $${paramCount}`);
      }

      const whereClause = conditions.length > 0 ? 'WHERE ' + conditions.join(' AND ') : '';
      
      const sql = 'SELECT b.*, ' +
        'COALESCE(t.truck_type, b.deleted_truck_info->>\'truck_type\', \'unknown\') as truck_type, ' +
        'COALESCE(t.license_plate, b.deleted_truck_info->>\'license_plate\', \'Deleted Truck\') as license_plate, ' +
        'COALESCE(t.capacity_weight, (b.deleted_truck_info->>\'capacity_weight\')::decimal) as capacity_weight, ' +
        'COALESCE(t.capacity_volume, (b.deleted_truck_info->>\'capacity_volume\')::decimal) as capacity_volume, ' +
        'COALESCE(t.price_per_km, (b.deleted_truck_info->>\'price_per_km\')::decimal) as price_per_km, ' +
        'COALESCE(t.fixed_price, (b.deleted_truck_info->>\'fixed_price\')::decimal) as fixed_price, ' +
        'COALESCE(t.pricing_type, b.deleted_truck_info->>\'pricing_type\') as pricing_type, ' +
        'CASE WHEN b.truck_id IS NULL THEN true ELSE false END as truck_deleted, ' +
        'COALESCE(pp.company_name, \'Former Provider\') as provider_company, ' +
        'COALESCE(u.first_name, \'\') as provider_first_name, ' +
        'COALESCE(u.last_name, \'\') as provider_last_name, ' +
        'COALESCE(u.phone, \'\') as provider_phone ' +
        'FROM bookings b ' +
        'LEFT JOIN trucks t ON b.truck_id = t.id ' +
        'LEFT JOIN provider_profiles pp ON t.provider_id = pp.id ' +
        'LEFT JOIN users u ON pp.user_id = u.id ' +
        whereClause + ' ' +
        'ORDER BY b.created_at DESC';

      const result = await query(sql, params);
      return result.rows;
    } catch (error) {
      console.error('Error in findByCustomerId:', error);
      throw error;
    }
  }

  static async findByTruckId(truckId) {
    const result = await query(
      'SELECT b.*, ' +
      'cp.company_name as customer_company, ' +
      'cu.first_name as customer_first_name, cu.last_name as customer_last_name, cu.phone as customer_phone ' +
      'FROM bookings b ' +
      'JOIN customer_profiles cp ON b.customer_id = cp.id ' +
      'JOIN users cu ON cp.user_id = cu.id ' +
      'WHERE b.truck_id = $1 ' +
      'ORDER BY b.pickup_date DESC',
      [truckId]
    );
    
    return result.rows;
  }

  static async findByProviderId(providerId, filters = {}) {
    const params = [providerId];
    let whereClause = 'WHERE (t.provider_id = $1 OR dt.provider_id = $1) AND b.deleted_by_provider_at IS NULL';
    let paramCount = 1;

    if (filters.status && filters.status !== 'all') {
      paramCount++;
      params.push(filters.status);
      whereClause += ` AND b.status = $${paramCount}`;
    }

    if (filters.search) {
      paramCount++;
      params.push(`%${filters.search}%`);
      whereClause += ` AND (
        COALESCE(t.license_plate, b.deleted_truck_info->>'license_plate', 'Deleted Truck') ILIKE $${paramCount} OR
        b.pickup_city ILIKE $${paramCount} OR
        b.destination_city ILIKE $${paramCount} OR
        b.cargo_description ILIKE $${paramCount}
      )`;
    }

    if (filters.dateFrom) {
      paramCount++;
      params.push(filters.dateFrom);
      whereClause += ` AND b.pickup_date >= $${paramCount}`;
    }

    if (filters.dateTo) {
      paramCount++;
      params.push(filters.dateTo);
      whereClause += ` AND b.pickup_date <= $${paramCount}`;
    }

    const result = await query(
      `SELECT b.*, 
              COALESCE(t.truck_type, b.deleted_truck_info->>'truck_type', 'unknown') as truck_type,
              COALESCE(t.license_plate, b.deleted_truck_info->>'license_plate', 'Deleted Truck') as license_plate,
              CASE WHEN b.truck_id IS NULL THEN true ELSE false END as truck_deleted,
              cp.company_name as customer_company,
              cu.first_name as customer_first_name, cu.last_name as customer_last_name, cu.phone as customer_phone
       FROM bookings b
       LEFT JOIN trucks t ON b.truck_id = t.id
       LEFT JOIN deleted_trucks dt ON b.truck_id IS NULL AND EXISTS (
         SELECT 1 FROM unnest(string_to_array(b.deleted_truck_info->>'id', ',')) AS truck_info_id 
         WHERE truck_info_id = dt.id::text
       )
       JOIN customer_profiles cp ON b.customer_id = cp.id
       JOIN users cu ON cp.user_id = cu.id
       ${whereClause}
       ORDER BY b.pickup_date DESC`,
      params
    );

    return result.rows;
  }

  static async updateStatus(id, status, userId) {
    const result = await query(
      `UPDATE bookings
       SET status = $1, updated_at = CURRENT_TIMESTAMP
       WHERE id = $2
       RETURNING *`,
      [status, id]
    );

    if (result.rows[0]) {
      await this.logStatusChange(id, status, userId);
    }

    return result.rows[0];
  }

  static async logStatusChange(bookingId, status, userId, notes = null) {
    await query(
      `INSERT INTO booking_status_history (booking_id, status, changed_by, notes)
       VALUES ($1, $2, $3, $4)`,
      [bookingId, status, userId, notes]
    );
  }

  static async getStatusHistory(bookingId) {
    const result = await query(
      `SELECT bsh.*, 
              u.first_name, u.last_name
       FROM booking_status_history bsh
       LEFT JOIN users u ON bsh.changed_by = u.id
       WHERE booking_id = $1
       ORDER BY bsh.created_at DESC`,
      [bookingId]
    );

    return result.rows;
  }

  static async delete(id) {
    const result = await query(
      'DELETE FROM bookings WHERE id = $1 RETURNING *',
      [id]
    );

    return result.rows[0];
  }

  static async softDeleteForCustomer(id) {
    const result = await query(
      'UPDATE bookings SET deleted_by_customer_at = CURRENT_TIMESTAMP WHERE id = $1 RETURNING *',
      [id]
    );

    return result.rows[0];
  }

  static async softDeleteForProvider(id) {
    const result = await query(
      'UPDATE bookings SET deleted_by_provider_at = CURRENT_TIMESTAMP WHERE id = $1 RETURNING *',
      [id]
    );

    return result.rows[0];
  }

  static async hardDeleteIfBothDeleted(id) {
    // Check if both customer and provider have deleted the booking
    const booking = await query(
      'SELECT deleted_by_customer_at, deleted_by_provider_at FROM bookings WHERE id = $1',
      [id]
    );

    if (booking.rows.length === 0) {
      return null;
    }

    const { deleted_by_customer_at, deleted_by_provider_at } = booking.rows[0];
    
    // If both parties have deleted it, perform hard delete
    if (deleted_by_customer_at && deleted_by_provider_at) {
      const result = await query(
        'DELETE FROM bookings WHERE id = $1 RETURNING *',
        [id]
      );
      return result.rows[0];
    }

    return null;
  }

  static async getStats() {
    const result = await query(
      `SELECT 
        COUNT(*) as total_bookings,
        COUNT(CASE WHEN status = 'pending_review' THEN 1 END) as pending_bookings,
        COUNT(CASE WHEN status = 'approved' THEN 1 END) as approved_bookings,
        COUNT(CASE WHEN status = 'in_transit' THEN 1 END) as in_transit_bookings,
        COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed_bookings,
        COUNT(CASE WHEN status = 'cancelled' THEN 1 END) as cancelled_bookings,
        AVG(total_price) as average_price,
        SUM(total_price) as total_revenue
       FROM bookings`
    );

    return result.rows[0];
  }

  // Rental-specific utility methods
  static async calculateRentalPrice(truckId, startDatetime, endDatetime) {
    // Get truck rental rates (only monthly rate is supported)
    const truck = await query(
      'SELECT monthly_rate, service_type FROM trucks WHERE id = $1',
      [truckId]
    );

    if (!truck.rows[0]) {
      throw new Error('Truck not found');
    }

    const { monthly_rate, service_type } = truck.rows[0];
    
    // Verify this is rental equipment
    if (service_type !== 'rental') {
      throw new Error('Price calculation is only available for rental equipment');
    }

    if (!monthly_rate || monthly_rate <= 0) {
      throw new Error('No monthly rate available for this rental equipment');
    }

    const start = new Date(startDatetime);
    const end = new Date(endDatetime);
    
    // Validate dates
    if (start >= end) {
      throw new Error('End date must be after start date');
    }
    
    if (start < new Date()) {
      throw new Error('Start date cannot be in the past');
    }

    const durationMs = end.getTime() - start.getTime();
    const durationHours = Math.ceil(durationMs / (1000 * 60 * 60));
    const durationDays = Math.ceil(durationMs / (1000 * 60 * 60 * 24));
    
    // Minimum rental period is 1 day
    if (durationDays < 1) {
      throw new Error('Minimum rental period is 1 day');
    }

    let price = 0;
    let priceBreakdown = {};

    if (durationDays >= 30) {
      // For periods of 30 days or more, charge by full months
      const months = Math.ceil(durationDays / 30);
      price = monthly_rate * months;
      priceBreakdown = {
        months: months,
        monthly_rate: monthly_rate,
        total_days: durationDays,
        calculation: `${monthly_rate} × ${months} month${months > 1 ? 's' : ''} = ${price}`
      };
    } else {
      // For periods less than 30 days, prorate the monthly rate
      const dailyRate = monthly_rate / 30;
      price = Math.round(dailyRate * durationDays * 100) / 100; // Round to 2 decimal places
      priceBreakdown = {
        daily_rate: Math.round(dailyRate * 100) / 100,
        monthly_rate: monthly_rate,
        total_days: durationDays,
        calculation: `${Math.round(dailyRate * 100) / 100}/day × ${durationDays} day${durationDays > 1 ? 's' : ''} = ${price} (prorated from monthly rate)`
      };
    }

    return {
      total_price: price,
      duration_hours: durationHours,
      duration_days: durationDays,
      duration_months: durationDays >= 30 ? Math.ceil(durationDays / 30) : 0,
      breakdown: priceBreakdown
    };
  }

  static async checkEquipmentAvailability(truckId, startDatetime, endDatetime, excludeBookingId = null) {
    const params = [truckId, startDatetime, endDatetime];
    let whereClause = `
      WHERE truck_id = $1
        AND service_type = 'rental'
        AND status NOT IN ('cancelled', 'completed')
        AND (
          (rental_start_datetime <= $2 AND rental_end_datetime > $2) OR
          (rental_start_datetime < $3 AND rental_end_datetime >= $3) OR
          (rental_start_datetime >= $2 AND rental_end_datetime <= $3)
        )
    `;

    if (excludeBookingId) {
      whereClause += ' AND id != $4';
      params.push(excludeBookingId);
    }

    const result = await query(
      `SELECT COUNT(*) as conflicting_bookings
       FROM bookings ${whereClause}`,
      params
    );

    return parseInt(result.rows[0].conflicting_bookings) === 0;
  }

  static async findAll(filters = {}) {
    try {
      const params = [];
      let whereClause = 'WHERE b.deleted_by_customer_at IS NULL AND b.deleted_by_provider_at IS NULL';
      let paramCount = 0;

      // Add status filter
      if (filters.status) {
        paramCount++;
        whereClause += ` AND b.status = $${paramCount}`;
        params.push(filters.status);
      }

      // Add date range filters
      if (filters.dateFrom) {
        paramCount++;
        whereClause += ` AND b.pickup_date >= $${paramCount}`;
        params.push(filters.dateFrom);
      }

      if (filters.dateTo) {
        paramCount++;
        whereClause += ` AND b.pickup_date <= $${paramCount}`;
        params.push(filters.dateTo);
      }

      // Add search filter
      if (filters.search) {
        paramCount++;
        whereClause += ` AND (b.booking_reference ILIKE $${paramCount} OR b.cargo_description ILIKE $${paramCount} OR b.pickup_address ILIKE $${paramCount} OR b.destination_address ILIKE $${paramCount})`;
        params.push(`%${filters.search}%`);
      }

      const result = await query(
        `SELECT b.*, 
                CASE 
                  WHEN b.truck_id IS NOT NULL THEN t.license_plate
                  ELSE b.deleted_truck_info->>'license_plate'
                END as truck_license_plate,
                CASE 
                  WHEN b.truck_id IS NOT NULL THEN t.truck_type
                  ELSE b.deleted_truck_info->>'truck_type'
                END as truck_type,
                cp.company_name as customer_company,
                cu.first_name as customer_first_name, cu.last_name as customer_last_name,
                pp.company_name as provider_company,
                pu.first_name as provider_first_name, pu.last_name as provider_last_name
         FROM bookings b
         LEFT JOIN trucks t ON b.truck_id = t.id
         LEFT JOIN deleted_trucks dt ON b.truck_id IS NULL AND dt.id::text = b.deleted_truck_info->>'id'
         LEFT JOIN customer_profiles cp ON b.customer_id = cp.id
         LEFT JOIN users cu ON cp.user_id = cu.id
         LEFT JOIN provider_profiles pp ON (t.provider_id = pp.id OR dt.provider_id = pp.id)
         LEFT JOIN users pu ON pp.user_id = pu.id
         ${whereClause}
         ORDER BY b.created_at DESC`,
        params
      );

      logger.info('Found bookings with findAll', { 
        count: result.rows.length,
        filters 
      });

      return result.rows;
    } catch (error) {
      logger.error('Error in Booking.findAll:', error);
      throw error;
    }
  }

  static async findRentalsByDateRange(startDate, endDate) {
    const result = await query(
      `SELECT b.*, t.license_plate, t.truck_type,
              cp.company_name as customer_company,
              cu.first_name as customer_first_name, cu.last_name as customer_last_name
       FROM bookings b
       JOIN trucks t ON b.truck_id = t.id
       JOIN customer_profiles cp ON b.customer_id = cp.id
       JOIN users cu ON cp.user_id = cu.id
       WHERE b.service_type = 'rental'
         AND b.rental_start_datetime <= $2
         AND b.rental_end_datetime >= $1
         AND b.status NOT IN ('cancelled')
       ORDER BY b.rental_start_datetime ASC`,
      [startDate, endDate]
    );

    return result.rows;
  }
}

export default Booking;
