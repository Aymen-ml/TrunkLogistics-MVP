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
        t.truck_type,
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
      GROUP BY t.id, t.license_plate, t.truck_type, t.service_type, t.status
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

/**
 * PHASE 2: Get operational KPIs
 */
export const getOperationalKPIs = async (req, res) => {
  try {
    const providerId = req.user.id;
    const { months = 6 } = req.query;

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

    // Calculate on-time delivery rate
    const onTimeQuery = `
      SELECT 
        COUNT(*) as total_completed,
        COUNT(*) FILTER (
          WHERE b.status = 'completed' 
          AND b.updated_at <= b.pickup_date + INTERVAL '1 day'
        ) as on_time_deliveries,
        COALESCE(
          (COUNT(*) FILTER (
            WHERE b.status = 'completed' 
            AND b.updated_at <= b.pickup_date + INTERVAL '1 day'
          )::FLOAT / NULLIF(COUNT(*) FILTER (WHERE b.status = 'completed'), 0) * 100),
          0
        ) as on_time_percentage
      FROM bookings b
      INNER JOIN trucks t ON b.truck_id = t.id
      WHERE t.provider_id = $1
        AND b.created_at >= NOW() - ($2 || ' months')::interval
        AND b.deleted_by_provider_at IS NULL
    `;

    // Average response time (time from pending to approved)
    const responseTimeQuery = `
      SELECT 
        AVG(
          EXTRACT(EPOCH FROM (
            (SELECT created_at FROM booking_status_history 
             WHERE booking_id = b.id AND status = 'approved' 
             ORDER BY created_at ASC LIMIT 1) - b.created_at
          )) / 3600
        ) as avg_response_hours,
        PERCENTILE_CONT(0.5) WITHIN GROUP (
          ORDER BY EXTRACT(EPOCH FROM (
            (SELECT created_at FROM booking_status_history 
             WHERE booking_id = b.id AND status = 'approved' 
             ORDER BY created_at ASC LIMIT 1) - b.created_at
          )) / 3600
        ) as median_response_hours
      FROM bookings b
      INNER JOIN trucks t ON b.truck_id = t.id
      WHERE t.provider_id = $1
        AND b.status != 'pending_review'
        AND b.created_at >= NOW() - ($2 || ' months')::interval
        AND b.deleted_by_provider_at IS NULL
    `;

    // Customer satisfaction metrics
    const satisfactionQuery = `
      SELECT 
        AVG(CASE 
          WHEN b.status = 'completed' THEN 5.0
          WHEN b.status = 'cancelled' THEN 1.0
          ELSE 3.0
        END) as avg_satisfaction_score,
        COUNT(*) FILTER (WHERE b.status = 'completed') as satisfied_customers,
        COUNT(*) FILTER (WHERE b.status = 'cancelled') as dissatisfied_customers
      FROM bookings b
      INNER JOIN trucks t ON b.truck_id = t.id
      WHERE t.provider_id = $1
        AND b.created_at >= NOW() - ($2 || ' months')::interval
        AND b.deleted_by_provider_at IS NULL
    `;

    const [onTimeResult, responseTimeResult, satisfactionResult] = await Promise.all([
      pool.query(onTimeQuery, [providerProfileId, months]),
      pool.query(responseTimeQuery, [providerProfileId, months]),
      pool.query(satisfactionQuery, [providerProfileId, months])
    ]);

    res.json({
      success: true,
      data: {
        onTimeDelivery: onTimeResult.rows[0],
        responseTime: responseTimeResult.rows[0],
        satisfaction: satisfactionResult.rows[0]
      }
    });

  } catch (error) {
    logger.error('Error fetching operational KPIs:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch operational KPIs',
      details: error.message
    });
  }
};

/**
 * PHASE 2: Get geographic distribution of bookings
 */
export const getGeographicAnalytics = async (req, res) => {
  try {
    const providerId = req.user.id;
    const { months = 6 } = req.query;

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

    // Get bookings by city
    const cityDistributionQuery = `
      SELECT 
        pickup_city as city,
        COUNT(*) as booking_count,
        SUM(b.total_price) as total_revenue,
        AVG(b.total_price) as avg_revenue,
        'pickup' as type
      FROM bookings b
      INNER JOIN trucks t ON b.truck_id = t.id
      WHERE t.provider_id = $1
        AND b.pickup_date >= NOW() - ($2 || ' months')::interval
        AND b.deleted_by_provider_at IS NULL
        AND pickup_city IS NOT NULL
      GROUP BY pickup_city
      
      UNION ALL
      
      SELECT 
        destination_city as city,
        COUNT(*) as booking_count,
        SUM(b.total_price) as total_revenue,
        AVG(b.total_price) as avg_revenue,
        'destination' as type
      FROM bookings b
      INNER JOIN trucks t ON b.truck_id = t.id
      WHERE t.provider_id = $1
        AND b.pickup_date >= NOW() - ($2 || ' months')::interval
        AND b.deleted_by_provider_at IS NULL
        AND destination_city IS NOT NULL
      GROUP BY destination_city
      ORDER BY total_revenue DESC
      LIMIT 20
    `;

    const result = await pool.query(cityDistributionQuery, [providerProfileId, months]);

    // Aggregate by city (combine pickup and destination)
    const cityMap = {};
    result.rows.forEach(row => {
      if (!cityMap[row.city]) {
        cityMap[row.city] = {
          city: row.city,
          booking_count: 0,
          total_revenue: 0,
          avg_revenue: 0
        };
      }
      cityMap[row.city].booking_count += parseInt(row.booking_count);
      cityMap[row.city].total_revenue += parseFloat(row.total_revenue || 0);
    });

    const cities = Object.values(cityMap).map(city => ({
      ...city,
      avg_revenue: city.booking_count > 0 ? city.total_revenue / city.booking_count : 0
    })).sort((a, b) => b.total_revenue - a.total_revenue);

    res.json({
      success: true,
      data: {
        cities: cities.slice(0, 10)
      }
    });

  } catch (error) {
    logger.error('Error fetching geographic analytics:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch geographic analytics',
      details: error.message
    });
  }
};

/**
 * PHASE 2: Get pricing analytics and market comparison
 */
export const getPricingAnalytics = async (req, res) => {
  try {
    const providerId = req.user.id;
    const { months = 6 } = req.query;

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

    // Your pricing statistics
    const yourPricingQuery = `
      SELECT 
        t.truck_type,
        AVG(b.total_price) as avg_price,
        MIN(b.total_price) as min_price,
        MAX(b.total_price) as max_price,
        COUNT(*) as booking_count,
        STDDEV(b.total_price) as price_stddev
      FROM bookings b
      INNER JOIN trucks t ON b.truck_id = t.id
      WHERE t.provider_id = $1
        AND b.created_at >= NOW() - ($2 || ' months')::interval
        AND b.deleted_by_provider_at IS NULL
        AND b.total_price > 0
      GROUP BY t.truck_type
    `;

    // Market average (all providers)
    const marketPricingQuery = `
      SELECT 
        t.truck_type,
        AVG(b.total_price) as market_avg_price,
        PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY b.total_price) as market_median_price,
        COUNT(DISTINCT t.provider_id) as competitor_count
      FROM bookings b
      INNER JOIN trucks t ON b.truck_id = t.id
      WHERE b.created_at >= NOW() - ($1 || ' months')::interval
        AND b.deleted_by_provider_at IS NULL
        AND b.total_price > 0
      GROUP BY t.truck_type
    `;

    const [yourPricing, marketPricing] = await Promise.all([
      pool.query(yourPricingQuery, [providerProfileId, months]),
      pool.query(marketPricingQuery, [months])
    ]);

    // Combine the data
    const pricingComparison = yourPricing.rows.map(yourData => {
      const marketData = marketPricing.rows.find(m => m.truck_type === yourData.truck_type) || {};
      const priceDifference = marketData.market_avg_price 
        ? ((yourData.avg_price - marketData.market_avg_price) / marketData.market_avg_price * 100)
        : 0;

      return {
        truck_type: yourData.truck_type,
        your_avg_price: parseFloat(yourData.avg_price),
        your_min_price: parseFloat(yourData.min_price),
        your_max_price: parseFloat(yourData.max_price),
        market_avg_price: parseFloat(marketData.market_avg_price || 0),
        market_median_price: parseFloat(marketData.market_median_price || 0),
        price_difference_percentage: priceDifference,
        competitive_position: priceDifference < -10 ? 'Below Market' : priceDifference > 10 ? 'Above Market' : 'Competitive',
        booking_count: parseInt(yourData.booking_count),
        competitor_count: parseInt(marketData.competitor_count || 0)
      };
    });

    res.json({
      success: true,
      data: {
        pricing_comparison: pricingComparison
      }
    });

  } catch (error) {
    logger.error('Error fetching pricing analytics:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch pricing analytics',
      details: error.message
    });
  }
};

/**
 * PHASE 3: Get predictive analytics and forecasting
 */
export const getPredictiveAnalytics = async (req, res) => {
  try {
    const providerId = req.user.id;

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

    // Monthly booking trends for forecasting
    const trendQuery = `
      SELECT 
        DATE_TRUNC('month', b.pickup_date) as month,
        COUNT(*) as booking_count,
        SUM(b.total_price) as revenue,
        AVG(b.total_price) as avg_booking_value
      FROM bookings b
      INNER JOIN trucks t ON b.truck_id = t.id
      WHERE t.provider_id = $1
        AND b.pickup_date >= NOW() - INTERVAL '12 months'
        AND b.deleted_by_provider_at IS NULL
      GROUP BY DATE_TRUNC('month', b.pickup_date)
      ORDER BY month ASC
    `;

    const trendResult = await pool.query(trendQuery, [providerProfileId]);

    // Simple linear regression for next 3 months forecast
    const data = trendResult.rows;
    if (data.length >= 1) { // TEMPORARY: Changed from 3 to 1 for testing
      const n = data.length;
      let sumX = 0, sumY = 0, sumXY = 0, sumX2 = 0;

      data.forEach((row, index) => {
        const x = index;
        const y = parseInt(row.booking_count);
        sumX += x;
        sumY += y;
        sumXY += x * y;
        sumX2 += x * x;
      });

      const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
      const intercept = (sumY - slope * sumX) / n;

      // Forecast next 3 months
      const forecast = [];
      for (let i = 1; i <= 3; i++) {
        const forecastValue = Math.max(0, Math.round(slope * (n + i - 1) + intercept));
        const avgRevenue = data.length > 0 
          ? data.reduce((sum, row) => sum + parseFloat(row.avg_booking_value), 0) / data.length
          : 0;
        
        forecast.push({
          month: i,
          predicted_bookings: forecastValue,
          predicted_revenue: forecastValue * avgRevenue,
          confidence: data.length >= 3 ? 'Medium' : 'Low' // Lower confidence with less data
        });
      }

      res.json({
        success: true,
        data: {
          historical_trend: data,
          forecast: forecast,
          growth_rate: slope,
          trend_direction: slope > 0 ? 'Growing' : slope < 0 ? 'Declining' : 'Stable'
        }
      });
    } else {
      res.json({
        success: true,
        data: {
          historical_trend: data,
          forecast: [],
          message: 'Insufficient data for forecasting. Need at least 1 month of history.'
        }
      });
    }

  } catch (error) {
    logger.error('Error fetching predictive analytics:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch predictive analytics',
      details: error.message
    });
  }
};

/**
 * PHASE 3: Get customer lifetime value analysis
 */
export const getCustomerAnalytics = async (req, res) => {
  try {
    const providerId = req.user.id;

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

    // Customer lifetime value and repeat customer analysis
    const customerAnalyticsQuery = `
      WITH customer_stats AS (
        SELECT 
          b.customer_id,
          COUNT(*) as total_bookings,
          SUM(b.total_price) as lifetime_value,
          AVG(b.total_price) as avg_booking_value,
          MIN(b.created_at) as first_booking_date,
          MAX(b.created_at) as last_booking_date,
          COUNT(DISTINCT DATE_TRUNC('month', b.created_at)) as active_months
        FROM bookings b
        INNER JOIN trucks t ON b.truck_id = t.id
        WHERE t.provider_id = $1
          AND b.deleted_by_provider_at IS NULL
        GROUP BY b.customer_id
      )
      SELECT 
        COUNT(*) as total_customers,
        COUNT(*) FILTER (WHERE total_bookings > 1) as repeat_customers,
        COALESCE(
          (COUNT(*) FILTER (WHERE total_bookings > 1)::FLOAT / NULLIF(COUNT(*), 0) * 100),
          0
        ) as repeat_rate,
        AVG(lifetime_value) as avg_customer_lifetime_value,
        AVG(total_bookings) as avg_bookings_per_customer,
        MAX(lifetime_value) as highest_customer_value,
        PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY lifetime_value) as median_customer_value
      FROM customer_stats
    `;

    // Top customers
    const topCustomersQuery = `
      SELECT 
        b.customer_id,
        cp.company_name as customer_name,
        COUNT(*) as total_bookings,
        SUM(b.total_price) as lifetime_value,
        MAX(b.created_at) as last_booking_date,
        EXTRACT(EPOCH FROM (NOW() - MAX(b.created_at))) / 86400 as days_since_last_booking
      FROM bookings b
      INNER JOIN trucks t ON b.truck_id = t.id
      LEFT JOIN customer_profiles cp ON b.customer_id = cp.id
      WHERE t.provider_id = $1
        AND b.deleted_by_provider_at IS NULL
      GROUP BY b.customer_id, cp.company_name
      ORDER BY lifetime_value DESC
      LIMIT 10
    `;

    const [analyticsResult, topCustomersResult] = await Promise.all([
      pool.query(customerAnalyticsQuery, [providerProfileId]),
      pool.query(topCustomersQuery, [providerProfileId])
    ]);

    res.json({
      success: true,
      data: {
        overview: analyticsResult.rows[0],
        top_customers: topCustomersResult.rows
      }
    });

  } catch (error) {
    logger.error('Error fetching customer analytics:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch customer analytics',
      details: error.message
    });
  }
};

export default {
  getProviderAnalytics,
  getBookingAnalytics,
  getOperationalKPIs,
  getGeographicAnalytics,
  getPricingAnalytics,
  getPredictiveAnalytics,
  getCustomerAnalytics
};
