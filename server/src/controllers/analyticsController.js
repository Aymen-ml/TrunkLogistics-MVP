import pool from '../config/database.js';
import logger from '../utils/logger.js';

/**
 * Get provider analytics data
 * Provides comprehensive analytics for providers including revenue trends,
 * booking conversion, fleet utilization, and top routes
 */
export const getProviderAnalytics = async (req, res) => {
  try {
    // Log user info for debugging
    logger.info('Provider analytics request:', {
      userId: req.user?.id,
      userRole: req.user?.role,
      userEmail: req.user?.email
    });

    const providerId = req.user.id;
    const { months = 6 } = req.query;

    // Validate months parameter
    const validMonths = parseInt(months, 10);
    if (isNaN(validMonths) || validMonths < 1 || validMonths > 24) {
      return res.status(400).json({
        success: false,
        error: 'Invalid months parameter. Must be between 1 and 24.'
      });
    }

    // Get provider's profile ID
    logger.info('Looking up provider profile for user:', providerId);
    const providerProfileResult = await pool.query(
      'SELECT id FROM provider_profiles WHERE user_id = $1',
      [providerId]
    );

    if (providerProfileResult.rows.length === 0) {
      logger.warn('Provider profile not found for user:', providerId);
      return res.status(404).json({
        success: false,
        error: 'Provider profile not found'
      });
    }

    const providerProfileId = providerProfileResult.rows[0].id;
    logger.info('Found provider profile:', providerProfileId);

    // 1. Revenue Trends (last N months)
    logger.info('Fetching revenue trends for last', validMonths, 'months');
    const revenueTrendsQuery = `
      SELECT 
        TO_CHAR(DATE_TRUNC('month', b.pickup_date), 'Mon') as month,
        EXTRACT(YEAR FROM b.pickup_date) as year,
        EXTRACT(MONTH FROM b.pickup_date) as month_num,
        COUNT(*) as total_bookings,
        COUNT(*) FILTER (WHERE b.service_type = 'transport') as transport_bookings,
        COUNT(*) FILTER (WHERE b.service_type = 'rental') as rental_bookings,
        COALESCE(SUM(b.total_price) FILTER (WHERE b.status = 'completed'), 0) as total_revenue,
        COALESCE(SUM(b.total_price) FILTER (WHERE b.status = 'completed' AND b.service_type = 'transport'), 0) as transport_revenue,
        COALESCE(SUM(b.total_price) FILTER (WHERE b.status = 'completed' AND b.service_type = 'rental'), 0) as rental_revenue,
        COUNT(*) FILTER (WHERE b.status = 'completed') as completed_count,
        COUNT(*) FILTER (WHERE b.status = 'cancelled') as cancelled_count
      FROM bookings b
      INNER JOIN trucks t ON b.truck_id = t.id
      WHERE t.provider_id = $1 
        AND b.pickup_date >= NOW() - ($2 || ' months')::interval
        AND b.deleted_by_provider_at IS NULL
      GROUP BY DATE_TRUNC('month', b.pickup_date), EXTRACT(YEAR FROM b.pickup_date), EXTRACT(MONTH FROM b.pickup_date)
      ORDER BY year DESC, month_num DESC
      LIMIT $2
    `;

    const revenueData = await pool.query(revenueTrendsQuery, [providerProfileId, validMonths]);
    logger.info('Revenue trends fetched:', revenueData.rows.length, 'months');

    // 2. Booking Conversion Funnel
    logger.info('Fetching booking conversion funnel');
    const conversionQuery = `
      SELECT 
        COUNT(*) FILTER (WHERE b.status = 'pending_review') as pending,
        COUNT(*) FILTER (WHERE b.status = 'approved') as approved,
        COUNT(*) FILTER (WHERE b.status = 'confirmed') as confirmed,
        COUNT(*) FILTER (WHERE b.status = 'in_transit' OR b.status = 'active') as active,
        COUNT(*) FILTER (WHERE b.status = 'completed') as completed,
        COUNT(*) FILTER (WHERE b.status = 'cancelled') as cancelled,
        COUNT(*) as total
      FROM bookings b
      INNER JOIN trucks t ON b.truck_id = t.id
      WHERE t.provider_id = $1
        AND b.deleted_by_provider_at IS NULL
        AND b.created_at >= NOW() - ($2 || ' months')::interval
    `;

    const conversionData = await pool.query(conversionQuery, [providerProfileId, validMonths]);
    logger.info('Conversion data fetched');

    // 3. Vehicle Utilization per Truck
    logger.info('Fetching vehicle utilization');
    const vehicleUtilizationQuery = `
      SELECT 
        t.id,
        t.license_plate,
        t.vehicle_type,
        t.service_type,
        t.status as current_status,
        COUNT(b.id) as total_bookings,
        COUNT(b.id) FILTER (WHERE b.status = 'completed') as completed_bookings,
        COALESCE(SUM(b.total_price) FILTER (WHERE b.status = 'completed'), 0) as total_revenue,
        COALESCE(AVG(b.total_price) FILTER (WHERE b.status = 'completed'), 0) as avg_booking_value,
        COUNT(b.id) FILTER (WHERE b.status IN ('in_transit', 'active')) as currently_active,
        MAX(b.pickup_date) as last_booking_date
      FROM trucks t
      LEFT JOIN bookings b ON b.truck_id = t.id AND b.deleted_by_provider_at IS NULL
      WHERE t.provider_id = $1
      GROUP BY t.id, t.license_plate, t.vehicle_type, t.service_type, t.status
      ORDER BY total_revenue DESC
    `;

    const vehicleUtilization = await pool.query(vehicleUtilizationQuery, [providerProfileId]);
    logger.info('Vehicle utilization fetched:', vehicleUtilization.rows.length, 'vehicles');

    // 4. Top Routes by Revenue
    logger.info('Fetching top routes');
    const topRoutesQuery = `
      SELECT 
        b.pickup_city,
        b.destination_city,
        COUNT(*) as booking_count,
        COALESCE(SUM(b.total_price) FILTER (WHERE b.status = 'completed'), 0) as total_revenue,
        COALESCE(AVG(b.total_price) FILTER (WHERE b.status = 'completed'), 0) as avg_revenue,
        COUNT(*) FILTER (WHERE b.status = 'completed') as completed_count,
        COUNT(*) FILTER (WHERE b.status = 'cancelled') as cancelled_count
      FROM bookings b
      INNER JOIN trucks t ON b.truck_id = t.id
      WHERE t.provider_id = $1
        AND b.service_type = 'transport'
        AND b.deleted_by_provider_at IS NULL
        AND b.pickup_date >= NOW() - ($2 || ' months')::interval
      GROUP BY b.pickup_city, b.destination_city
      HAVING COUNT(*) > 0
      ORDER BY total_revenue DESC
      LIMIT 10
    `;

    const topRoutes = await pool.query(topRoutesQuery, [providerProfileId, validMonths]);
    logger.info('Top routes fetched:', topRoutes.rows.length, 'routes');

    // 5. Customer Ratings & Reviews (placeholder - to be implemented)
    const ratingsQuery = `
      SELECT 
        COUNT(*) as total_reviews,
        COALESCE(AVG(r.rating), 0) as average_rating,
        COUNT(*) FILTER (WHERE r.rating >= 4) as positive_reviews,
        COUNT(*) FILTER (WHERE r.rating <= 2) as negative_reviews
      FROM booking_reviews r
      INNER JOIN bookings b ON r.booking_id = b.id
      INNER JOIN trucks t ON b.truck_id = t.id
      WHERE t.provider_id = $1
    `;

    let ratingsData = { rows: [{ total_reviews: 0, average_rating: 0, positive_reviews: 0, negative_reviews: 0 }] };
    try {
      ratingsData = await pool.query(ratingsQuery, [providerProfileId]);
    } catch (err) {
      // Table might not exist yet, use default values
      logger.warn('Reviews table not found, using default values');
    }

    // 6. Calculate conversion rate
    const conversionStats = conversionData.rows[0];
    const conversionRate = conversionStats.total > 0
      ? ((conversionStats.completed / conversionStats.total) * 100).toFixed(1)
      : 0;

    const approvalRate = conversionStats.total > 0
      ? (((conversionStats.approved + conversionStats.confirmed + conversionStats.active + conversionStats.completed) / conversionStats.total) * 100).toFixed(1)
      : 0;

    // 7. Calculate fleet utilization
    const totalVehicles = vehicleUtilization.rows.length;
    const activeVehicles = vehicleUtilization.rows.filter(v => v.currently_active > 0).length;
    const fleetUtilizationRate = totalVehicles > 0
      ? ((activeVehicles / totalVehicles) * 100).toFixed(1)
      : 0;

    res.json({
      success: true,
      data: {
        revenueTrends: revenueData.rows.reverse(), // Oldest to newest
        bookingConversion: {
          funnel: conversionStats,
          conversionRate: parseFloat(conversionRate),
          approvalRate: parseFloat(approvalRate)
        },
        vehicleUtilization: vehicleUtilization.rows,
        topRoutes: topRoutes.rows,
        customerRatings: ratingsData.rows[0],
        summary: {
          totalVehicles,
          activeVehicles,
          fleetUtilizationRate: parseFloat(fleetUtilizationRate),
          totalBookings: conversionStats.total,
          completedBookings: conversionStats.completed,
          totalRevenue: revenueData.rows.reduce((sum, row) => sum + parseFloat(row.total_revenue), 0)
        }
      }
    });

  } catch (error) {
    logger.error('Error fetching provider analytics:', {
      message: error.message,
      stack: error.stack,
      userId: req.user?.id
    });
    res.status(500).json({
      success: false,
      error: 'Failed to fetch analytics data',
      details: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

/**
 * Get detailed booking analytics for a specific period
 */
export const getBookingAnalytics = async (req, res) => {
  try {
    const providerId = req.user.id;
    const { startDate, endDate } = req.query;

    // Get provider's profile ID
    const providerProfileResult = await pool.query(
      'SELECT id FROM provider_profiles WHERE user_id = $1',
      [providerId]
    );

    if (providerProfileResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Provider profile not found'
      });
    }

    const providerProfileId = providerProfileResult.rows[0].id;

    // Build date filter
    let dateFilter = '';
    const params = [providerProfileId];
    
    if (startDate && endDate) {
      dateFilter = 'AND pickup_date BETWEEN $2 AND $3';
      params.push(startDate, endDate);
    } else if (startDate) {
      dateFilter = 'AND pickup_date >= $2';
      params.push(startDate);
    } else if (endDate) {
      dateFilter = 'AND pickup_date <= $2';
      params.push(endDate);
    }

    // Get detailed booking stats
    const query = `
      SELECT 
        COUNT(*) as total,
        COUNT(*) FILTER (WHERE b.service_type = 'transport') as transport_count,
        COUNT(*) FILTER (WHERE b.service_type = 'rental') as rental_count,
        AVG(b.total_price) FILTER (WHERE b.status = 'completed') as avg_booking_value,
        SUM(b.total_price) FILTER (WHERE b.status = 'completed') as total_revenue,
        COUNT(*) FILTER (WHERE b.status = 'completed') as completed,
        COUNT(*) FILTER (WHERE b.status = 'cancelled') as cancelled,
        COUNT(*) FILTER (WHERE b.status IN ('pending_review', 'approved')) as pending,
        (COUNT(*) FILTER (WHERE b.status = 'cancelled')::FLOAT / NULLIF(COUNT(*), 0) * 100) as cancellation_rate
      FROM bookings b
      INNER JOIN trucks t ON b.truck_id = t.id
      WHERE t.provider_id = $1
        AND b.deleted_by_provider_at IS NULL
        ${dateFilter}
    `;

    const result = await pool.query(query, params);

    res.json({
      success: true,
      data: result.rows[0]
    });

  } catch (error) {
    logger.error('Error fetching booking analytics:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch booking analytics',
      details: error.message
    });
  }
};

export default {
  getProviderAnalytics,
  getBookingAnalytics
};
