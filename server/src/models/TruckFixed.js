import { query } from '../config/database.js';
import logger from '../utils/logger.js';

class TruckFixed {
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
      // Default visibility for admins/providers - fix parameter binding
      whereConditions.push(`t.status = ANY($${paramCount})`);
      values.push(['active', 'inactive']);
      paramCount++;
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
          values.push(filters.maxPrice);
          paramCount++;
        } else {
          whereConditions.push(`(t.price_per_km <= $${paramCount} OR t.fixed_price <= $${paramCount + 1})`);
          values.push(filters.maxPrice); // Add first parameter for price_per_km
          values.push(filters.maxPrice); // Add second parameter for fixed_price
          paramCount += 2; // Two parameters used
        }
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
      const selectColumns = [
        't.*',
        'pp.company_name',
        'pp.street_address as address',
        'pp.city',
        'pp.postal_code',
        'pp.business_license',
        'u.first_name',
        'u.last_name',
        'u.phone',
        'u.email',
        'COUNT(*) OVER() as total_count',
        'pp.is_verified as provider_verified',
        'u.is_active as user_active',
        `CASE 
          WHEN COUNT(d.id) = 0 THEN false
          WHEN COUNT(d.id) = COUNT(CASE WHEN d.verification_status = 'approved' THEN 1 END) THEN true
          ELSE false
        END as documents_verified`,
        'COUNT(d.id) as total_documents',
        'COUNT(CASE WHEN d.verification_status = \'approved\' THEN 1 END) as approved_documents',
        'COUNT(CASE WHEN d.verification_status = \'pending\' THEN 1 END) as pending_documents',
        'COUNT(CASE WHEN d.verification_status = \'rejected\' THEN 1 END) as rejected_documents'
      ];
      
      queryText = `
        SELECT ${selectColumns.join(', ')}
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
      const selectColumns = [
        't.*',
        'pp.company_name',
        'pp.street_address as address',
        'pp.city',
        'pp.postal_code',
        'pp.business_license',
        'u.first_name',
        'u.last_name',
        'u.phone',
        'u.email',
        'COUNT(*) OVER() as total_count',
        'pp.is_verified as provider_verified',
        'u.is_active as user_active',
        `CASE 
          WHEN COUNT(d.id) = 0 THEN false
          WHEN COUNT(d.id) = COUNT(CASE WHEN d.verification_status = 'approved' THEN 1 END) THEN true
          ELSE false
        END as documents_verified`
      ];
      
      queryText = `
        SELECT ${selectColumns.join(', ')}
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
    
    logger.info('Executing truck search query:', { queryText: queryText.substring(0, 200) + '...', paramCount: queryValues.length });
    
    const result = await query(queryText, queryValues);

    return {
      trucks: result.rows,
      totalCount: result.rows[0]?.total_count || 0,
      currentPage: page,
      totalPages: Math.ceil((result.rows[0]?.total_count || 0) / limit)
    };
  }
}

export default TruckFixed;