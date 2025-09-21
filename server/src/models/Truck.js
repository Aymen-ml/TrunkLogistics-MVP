import { query } from '../config/database.js';
import logger from '../utils/logger.js';
import notificationService from '../services/notificationService.js';

class Truck {
  static async create(truckData) {
    const {
      providerId,
      truckType,
      licensePlate,
      capacityWeight,
      capacityVolume,
      pricePerKm,
      fixedPrice,
      pricingType,
      year,
      make,
      model,
      status = 'active',
      images = [],
      documents = [],
      // Equipment-specific fields
      serviceType = 'transport',
      hourlyRate,
      dailyRate,
      weeklyRate,
      monthlyRate,
      workLocation,
      // Driver information fields
      driverName,
      driverPhone,
      driverLicenseNumber
    } = truckData;

    const queryParams = [
      providerId, truckType, licensePlate, capacityWeight, capacityVolume,
      pricePerKm, fixedPrice, pricingType, year, make, model, status, images,
      serviceType, hourlyRate, dailyRate, weeklyRate, monthlyRate, workLocation,
      driverName, driverPhone, driverLicenseNumber
    ];

    const sqlQuery = `INSERT INTO trucks (
      provider_id, truck_type, license_plate, capacity_weight, capacity_volume,
      price_per_km, fixed_price, pricing_type, year, make, model, status, images,
      service_type, hourly_rate, daily_rate, weekly_rate, monthly_rate, work_location,
      driver_name, driver_phone, driver_license_number
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22)
    RETURNING *`;

    try {
      const result = await query(sqlQuery, queryParams);
      const truck = result.rows[0];
      
      // If documents are provided, save them to the documents table
      if (documents && documents.length > 0) {
        await Truck.saveDocuments(truck.id, documents);
      }
      
      return truck;
    } catch (error) {
      throw error;
    }
  }

  static async findById(id) {
    const result = await query(
      `SELECT t.*, pp.company_name, u.first_name, u.last_name, u.phone
       FROM trucks t
       JOIN provider_profiles pp ON t.provider_id = pp.id
       JOIN users u ON pp.user_id = u.id
       WHERE t.id = $1`,
      [id]
    );

    return result.rows[0];
  }

  static async findByProviderId(providerId) {
    const result = await query(
      'SELECT * FROM trucks WHERE provider_id = $1 ORDER BY created_at DESC',
      [providerId]
    );

    return result.rows;
  }

  static async search(filters = {}) {
    let whereConditions = [];
    let values = [];
    let paramCount = 1;
    
    // Check if this is an admin search (no restrictions)
    const isAdminSearch = filters.adminView === true;

    // For customers, only show available (active) trucks in search
    if (filters.onlyAvailable) {
      whereConditions.push(`t.status = $${paramCount}`);
      values.push('active');
      paramCount++;
    } else {
      // Default visibility for admins/providers
      whereConditions.push(`t.status IN ($${paramCount}, $${paramCount + 1})`);
      values.push('active', 'inactive');
      paramCount += 2;
    }

    // Service type filter (transport/rental)
    if (filters.serviceType) {
      whereConditions.push(`t.service_type = $${paramCount}`);
      values.push(filters.serviceType);
      paramCount++;
    }

    if (filters.search) {
      whereConditions.push(`(
        t.license_plate ILIKE $${paramCount} OR
        t.make ILIKE $${paramCount} OR
        t.model ILIKE $${paramCount} OR
        t.work_location ILIKE $${paramCount}
      )`);
      values.push(`%${filters.search}%`);
      paramCount++;
    }

    if (filters.truckType) {
      whereConditions.push(`t.truck_type = $${paramCount}`);
      values.push(filters.truckType);
      paramCount++;
    }

    if (filters.minCapacity) {
      whereConditions.push(`t.capacity_weight >= $${paramCount}`);
      values.push(filters.minCapacity);
      paramCount++;
    }

    if (filters.pricingType) {
      if (filters.serviceType === 'rental') {
        // For rental equipment, only monthly rates are used
        if (filters.pricingType === 'monthly') {
          whereConditions.push(`t.monthly_rate IS NOT NULL`);
        }
      } else {
        // For transport trucks, use existing pricing_type field
        whereConditions.push(`t.pricing_type = $${paramCount}`);
        values.push(filters.pricingType);
        paramCount++;
      }
    }

    // Handle pricing filters for both transport and rental
    if (filters.maxPrice) {
      if (filters.serviceType === 'rental') {
        // For rental equipment, only check monthly rate
        whereConditions.push(`(
          t.monthly_rate IS NOT NULL AND t.monthly_rate <= $${paramCount}
        )`);
      } else {
        // For transport, use existing logic
        if (filters.pricingType === 'per_km') {
          whereConditions.push(`t.price_per_km <= $${paramCount}`);
        } else if (filters.pricingType === 'fixed') {
          whereConditions.push(`t.fixed_price <= $${paramCount}`);
        } else {
          whereConditions.push(`(t.price_per_km <= $${paramCount} OR t.fixed_price <= $${paramCount})`);
        }
      }
      values.push(filters.maxPrice);
      paramCount++;
    }

    // Location filter for rental equipment
    if (filters.workLocation && filters.serviceType === 'rental') {
      whereConditions.push(`t.work_location ILIKE $${paramCount}`);
      values.push(`%${filters.workLocation}%`);
      paramCount++;
    }

    // Provider filter
    if (filters.provider && filters.provider !== 'all') {
      whereConditions.push(`pp.company_name = $${paramCount}`);
      values.push(filters.provider);
      paramCount++;
    }

    if (filters.pickupCity || filters.destinationCity) {
      // For MVP, we'll show all trucks regardless of location
      // In future versions, this would filter by service areas
    }

    const page = parseInt(filters.page) || 1;
    const limit = parseInt(filters.limit) || 10;
    const offset = (page - 1) * limit;

    const whereClause = whereConditions.join(' AND ');

    let queryText, queryValues;
    
    if (isAdminSearch) {
      // Admin view - show ALL trucks regardless of verification status
      queryText = `
        SELECT t.*, pp.company_name, pp.street_address, pp.city as provider_city, 
                pp.state_province as provider_state, 
                pp.postal_code as provider_postal_code, pp.business_phone as provider_business_phone,
                u.first_name, u.last_name, u.phone, u.email as provider_email,
                COUNT(*) OVER() as total_count,
                pp.is_verified as provider_verified,
                u.is_active as user_active,
                CASE 
                  WHEN COUNT(d.id) = 0 THEN false
                  WHEN COUNT(d.id) = COUNT(CASE WHEN d.verification_status = 'approved' THEN 1 END) THEN true
                  ELSE false
                END as documents_verified,
                COUNT(d.id) as total_documents,
                COUNT(CASE WHEN d.verification_status = 'approved' THEN 1 END) as approved_documents,
                COUNT(CASE WHEN d.verification_status = 'pending' THEN 1 END) as pending_documents,
                COUNT(CASE WHEN d.verification_status = 'rejected' THEN 1 END) as rejected_documents
         FROM trucks t
         JOIN provider_profiles pp ON t.provider_id = pp.id
         JOIN users u ON pp.user_id = u.id
         LEFT JOIN documents d ON d.entity_id = t.id AND d.entity_type = 'truck'
         WHERE ${whereClause}
         GROUP BY t.id, pp.id, u.id
         ORDER BY t.created_at DESC
         LIMIT $${paramCount} OFFSET $${paramCount + 1}`;
      queryValues = [...values, limit, offset];
    } else {
      // Customer/Provider view - only verified trucks with approved documents
      queryText = `
        SELECT t.*, pp.company_name, pp.street_address, pp.city as provider_city, 
                pp.state_province as provider_state, 
                pp.postal_code as provider_postal_code, pp.business_phone as provider_business_phone,
                u.first_name, u.last_name, u.phone, u.email as provider_email,
                COUNT(*) OVER() as total_count,
                pp.is_verified as provider_verified,
                CASE 
                  WHEN COUNT(d.id) = 0 THEN false
                  WHEN COUNT(d.id) = COUNT(CASE WHEN d.verification_status = 'approved' THEN 1 END) THEN true
                  ELSE false
                END as documents_verified
         FROM trucks t
         JOIN provider_profiles pp ON t.provider_id = pp.id
         JOIN users u ON pp.user_id = u.id
         LEFT JOIN documents d ON d.entity_id = t.id AND d.entity_type = 'truck'
         WHERE ${whereClause}
           AND pp.is_verified = true
           AND u.is_active = true
         GROUP BY t.id, pp.id, u.id
         HAVING COUNT(d.id) > 0 
           AND COUNT(d.id) = COUNT(CASE WHEN d.verification_status = 'approved' THEN 1 END)
         ORDER BY t.created_at DESC
         LIMIT $${paramCount} OFFSET $${paramCount + 1}`;
      queryValues = [...values, limit, offset];
    }
    
    const result = await query(queryText, queryValues);

    return {
      trucks: result.rows,
      totalCount: result.rows[0]?.total_count || 0,
      currentPage: page,
      totalPages: Math.ceil((result.rows[0]?.total_count || 0) / limit)
    };
  }

  static async update(id, updates) {
    const fields = [];
    const values = [];
    let paramCount = 1;

    const allowedFields = [
      'truck_type', 'capacity_weight', 'capacity_volume', 
      'price_per_km', 'fixed_price', 'pricing_type', 
      'status', 'year', 'make', 'model', 'images',
      // Equipment-specific fields
      'service_type', 'hourly_rate', 'daily_rate', 
      'weekly_rate', 'monthly_rate', 'work_location',
      // Driver information fields
      'driver_name', 'driver_phone', 'driver_license_number'
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
      `UPDATE trucks SET ${fields.join(', ')}, updated_at = CURRENT_TIMESTAMP 
       WHERE id = $${paramCount} 
       RETURNING *`,
      values
    );

    // Handle documents separately if they exist
    if (updates.documents && updates.documents.length > 0) {
      await this.saveDocuments(id, updates.documents);
    }

    return result.rows[0];
  }

  static async delete(id) {
    // First, get the truck info to store in deleted bookings
    const truck = await this.findById(id);
    
    // Update any existing bookings to preserve truck information
    await query(
      `UPDATE bookings 
       SET deleted_truck_info = $1, truck_id = NULL 
       WHERE truck_id = $2`,
      [JSON.stringify({
        id: truck.id,
        license_plate: truck.license_plate,
        make: truck.make,
        model: truck.model,
        truck_type: truck.truck_type,
        service_type: truck.service_type,
        company_name: truck.company_name
      }), id]
    );
    
    // Now delete the truck
    const result = await query(
      'DELETE FROM trucks WHERE id = $1 RETURNING *',
      [id]
    );

    return result.rows[0];
  }

  static async setStatus(id, status) {
    const result = await query(
      'UPDATE trucks SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING *',
      [status, id]
    );
    return result.rows[0];
  }

  static async updateRevenue(id, amount) {
    const result = await query(
      'UPDATE trucks SET total_revenue = total_revenue + $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING *',
      [amount, id]
    );
    return result.rows[0];
  }

  static async getDrivers(truckId) {
    const result = await query(
      `SELECT d.*, td.is_primary, td.assigned_at
       FROM drivers d
       JOIN truck_drivers td ON d.id = td.driver_id
       WHERE td.truck_id = $1
       ORDER BY td.is_primary DESC, td.assigned_at DESC`,
      [truckId]
    );

    return result.rows;
  }

  static async assignDriver(truckId, driverId, isPrimary = false) {
    const result = await query(
      `INSERT INTO truck_drivers (truck_id, driver_id, is_primary)
       VALUES ($1, $2, $3)
       ON CONFLICT (truck_id, driver_id) 
       DO UPDATE SET is_primary = $3, assigned_at = CURRENT_TIMESTAMP
       RETURNING *`,
      [truckId, driverId, isPrimary]
    );

    return result.rows[0];
  }

  static async removeDriver(truckId, driverId) {
    const result = await query(
      'DELETE FROM truck_drivers WHERE truck_id = $1 AND driver_id = $2 RETURNING *',
      [truckId, driverId]
    );

    return result.rows[0];
  }

  // Document management methods
  static async saveDocuments(truckId, documents) {
    const documentPromises = documents.map(doc => {
      // Map document types to match database constraints
      let documentType = 'additional_docs'; // default fallback for additional documents
      
      // Map common document types to database values
      const typeMapping = {
        'inspection': 'technical_inspection',
        'technical_inspection': 'technical_inspection',
        'registration': 'registration',
        'insurance': 'insurance',
        'license': 'license',
        'business_license': 'business_license',
        'additional': 'additional_docs',
        'additional_docs': 'additional_docs',
        'other': 'additional_docs',
        // New document types
        'permit': 'permit',
        'maintenance_record': 'maintenance_record',
        'maintenance': 'maintenance_record',
        'driver_certificate': 'driver_certificate',
        'driver_cert': 'driver_certificate',
        'customs_documents': 'customs_documents',
        'customs': 'customs_documents',
        'safety_certificate': 'safety_certificate',
        'safety_cert': 'safety_certificate',
        'emission_certificate': 'emission_certificate',
        'emission': 'emission_certificate',
        'weight_certificate': 'weight_certificate',
        'weight': 'weight_certificate',
        'cargo_insurance': 'cargo_insurance',
        'transport_license': 'transport_license',
        'transport': 'transport_license',
        'route_permit': 'route_permit',
        'route': 'route_permit',
        'hazmat_permit': 'hazmat_permit',
        'hazmat': 'hazmat_permit',
        'oversize_permit': 'oversize_permit',
        'oversize': 'oversize_permit',
        'fuel_card': 'fuel_card',
        'fuel': 'fuel_card',
        'toll_transponder': 'toll_transponder',
        'toll': 'toll_transponder',
        'gps_certificate': 'gps_certificate',
        'gps': 'gps_certificate',
        'compliance_certificate': 'compliance_certificate',
        'compliance': 'compliance_certificate'
      };
      
      // Better document type detection
      if (doc.type && doc.type.trim()) {
        const normalizedType = doc.type.toLowerCase().trim();
        if (typeMapping[normalizedType]) {
          documentType = typeMapping[normalizedType];
        } else {
          // Try partial matching for common patterns
          if (normalizedType.includes('inspection')) {
            documentType = 'technical_inspection';
          } else if (normalizedType.includes('registration')) {
            documentType = 'registration';
          } else if (normalizedType.includes('insurance')) {
            if (normalizedType.includes('cargo')) {
              documentType = 'cargo_insurance';
            } else {
              documentType = 'insurance';
            }
          } else if (normalizedType.includes('license')) {
            if (normalizedType.includes('business')) {
              documentType = 'business_license';
            } else if (normalizedType.includes('transport')) {
              documentType = 'transport_license';
            } else {
              documentType = 'license';
            }
          } else if (normalizedType.includes('permit')) {
            if (normalizedType.includes('hazmat')) {
              documentType = 'hazmat_permit';
            } else if (normalizedType.includes('oversize') || normalizedType.includes('overweight')) {
              documentType = 'oversize_permit';
            } else if (normalizedType.includes('route')) {
              documentType = 'route_permit';
            } else {
              documentType = 'permit';
            }
          } else if (normalizedType.includes('certificate')) {
            if (normalizedType.includes('safety')) {
              documentType = 'safety_certificate';
            } else if (normalizedType.includes('emission')) {
              documentType = 'emission_certificate';
            } else if (normalizedType.includes('weight')) {
              documentType = 'weight_certificate';
            } else if (normalizedType.includes('gps')) {
              documentType = 'gps_certificate';
            } else if (normalizedType.includes('compliance')) {
              documentType = 'compliance_certificate';
            } else if (normalizedType.includes('driver')) {
              documentType = 'driver_certificate';
            } else {
              documentType = 'additional_docs';
            }
          } else if (normalizedType.includes('maintenance')) {
            documentType = 'maintenance_record';
          } else if (normalizedType.includes('customs')) {
            documentType = 'customs_documents';
          } else if (normalizedType.includes('fuel')) {
            documentType = 'fuel_card';
          } else if (normalizedType.includes('toll')) {
            documentType = 'toll_transponder';
          } else if (normalizedType.includes('gps')) {
            documentType = 'gps_certificate';
          } else {
            documentType = 'additional_docs'; // fallback for unknown types
          }
        }
      }
      
      return query(
        `INSERT INTO documents (entity_type, entity_id, document_type, file_name, file_path, file_size, mime_type, verification_status)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
        ['truck', truckId, documentType, doc.originalName || doc.filename, doc.path, doc.size, doc.mimetype, 'pending']
      );
    });
    
    const results = await Promise.all(documentPromises);
    const savedDocuments = results.map(result => result.rows[0]);
    
    // Send notification to admins about new documents uploaded
    if (savedDocuments.length > 0) {
      try {
        // Get truck info for notification
        const truck = await Truck.findById(truckId);
        if (truck) {
          // Get provider info
          const providerQuery = await query(
            `SELECT u.first_name, u.last_name, u.email 
             FROM users u 
             JOIN provider_profiles pp ON u.id = pp.user_id 
             WHERE pp.id = $1`,
            [truck.provider_id]
          );
          
          if (providerQuery.rows.length > 0) {
            const provider = providerQuery.rows[0];
            const providerName = `${provider.first_name} ${provider.last_name}`.trim() || provider.email;
            
            // Send notification for each document type uploaded
            for (const doc of savedDocuments) {
              await notificationService.notifyAdminDocumentUploaded(doc, providerName);
            }
            
            logger.info(`✅ Admin notifications sent for ${savedDocuments.length} documents uploaded by ${providerName}`);
          }
        }
      } catch (notificationError) {
        logger.error('❌ Failed to send admin notification for document upload:', notificationError);
        // Don't fail the document save if notification fails
      }
    }
    
    return savedDocuments;
  }

  static async getDocuments(truckId) {
    const result = await query(
      `SELECT * FROM documents 
       WHERE entity_type = 'truck' AND entity_id = $1 
       ORDER BY uploaded_at DESC`,
      [truckId]
    );
    
    return result.rows;
  }

  static async updateImages(truckId, images) {
    const result = await query(
      'UPDATE trucks SET images = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING *',
      [images, truckId]
    );
    
    return result.rows[0];
  }

  static async getWithDocuments(id) {
    const truck = await Truck.findById(id);
    if (truck) {
      truck.documents = await Truck.getDocuments(id);
    }
    return truck;
  }

  static async hasActiveBookings(truckId) {
    const result = await query(
      `SELECT COUNT(*) as active_count 
       FROM bookings 
       WHERE (truck_id = $1 OR (truck_id IS NULL AND deleted_truck_info->>'id' = $1::text))
         AND status NOT IN ('completed', 'cancelled')
         AND deleted_by_provider_at IS NULL
         AND deleted_by_customer_at IS NULL`,
      [truckId]
    );
    
    return parseInt(result.rows[0].active_count) > 0;
  }

  static async getActiveBookings(truckId) {
    const result = await query(
      `SELECT b.*, 
              cp.company_name as customer_company,
              cu.first_name as customer_first_name, 
              cu.last_name as customer_last_name, 
              cu.phone as customer_phone,
              CASE 
                WHEN b.truck_id IS NULL THEN b.deleted_truck_info->>'license_plate'
                ELSE NULL
              END as deleted_truck_license_plate
       FROM bookings b
       JOIN customer_profiles cp ON b.customer_id = cp.id
       JOIN users cu ON cp.user_id = cu.id
       WHERE (b.truck_id = $1 OR (b.truck_id IS NULL AND b.deleted_truck_info->>'id' = $1::text))
         AND b.status NOT IN ('completed', 'cancelled')
         AND b.deleted_by_provider_at IS NULL
         AND b.deleted_by_customer_at IS NULL
       ORDER BY b.pickup_date ASC`,
      [truckId]
    );
    
    return result.rows;
  }
}

export default Truck;
