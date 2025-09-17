import bcrypt from 'bcryptjs';
import { query } from '../config/database.js';
import logger from '../utils/logger.js';

const seedData = async () => {
  try {
    logger.info('Starting database seeding...');

    // Check if data already exists
    const userCount = await query('SELECT COUNT(*) FROM users');
    if (parseInt(userCount.rows[0].count) > 0) {
      logger.info('Database already has data, skipping seeding...');
      return;
    }

    // Hash passwords
    const adminPassword = await bcrypt.hash('admin123', 10);
    const providerPassword = await bcrypt.hash('provider123', 10);
    const customerPassword = await bcrypt.hash('customer123', 10);

    // Create admin user
    const adminResult = await query(`
      INSERT INTO users (email, password_hash, role, first_name, last_name, phone, is_active, email_verified)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING id
    `, ['admin@trunklogistics.com', adminPassword, 'admin', 'Admin', 'User', '+1234567890', true, true]);
    
    const adminId = adminResult.rows[0].id;

    // Create provider user
    const providerResult = await query(`
      INSERT INTO users (email, password_hash, role, first_name, last_name, phone, is_active, email_verified)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING id
    `, ['provider@example.com', providerPassword, 'provider', 'John', 'Transport', '+1234567891', true, true]);
    
    const providerId = providerResult.rows[0].id;

    // Create customer user
    const customerResult = await query(`
      INSERT INTO users (email, password_hash, role, first_name, last_name, phone, is_active, email_verified)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING id
    `, ['customer@example.com', customerPassword, 'customer', 'Jane', 'Shipper', '+1234567892', true, true]);
    
    const customerId = customerResult.rows[0].id;

    // Create provider profile
    const providerProfileResult = await query(`
      INSERT INTO provider_profiles (user_id, company_name, business_license, address, city, country, postal_code, is_verified, verification_status)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING id
    `, [providerId, 'John Transport Co.', 'BL123456', '123 Transport St', 'New York', 'USA', '10001', true, 'approved']);
    
    const providerProfileId = providerProfileResult.rows[0].id;

    // Create customer profile
    await query(`
      INSERT INTO customer_profiles (user_id, company_name, address, city, country, postal_code)
      VALUES ($1, $2, $3, $4, $5, $6)
    `, [customerId, 'Jane Shipping LLC', '456 Business Ave', 'Los Angeles', 'USA', '90001']);

    // Create sample trucks
    const truck1Result = await query(`
      INSERT INTO trucks (provider_id, truck_type, license_plate, capacity_weight, capacity_volume, price_per_km, pricing_type, status, year, make, model)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      RETURNING id
    `, [providerProfileId, 'container', 'ABC-123', 25000.00, 80.00, 2.50, 'per_km', 'active', 2020, 'Volvo', 'FH16']);
    
    const truck1Id = truck1Result.rows[0].id;

    const truck2Result = await query(`
      INSERT INTO trucks (provider_id, truck_type, license_plate, capacity_weight, capacity_volume, fixed_price, pricing_type, status, year, make, model)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      RETURNING id
    `, [providerProfileId, 'flatbed', 'XYZ-789', 30000.00, 100.00, 1500.00, 'fixed', 'active', 2019, 'Mercedes', 'Actros']);
    
    const truck2Id = truck2Result.rows[0].id;

    // Create sample drivers
    const driver1Result = await query(`
      INSERT INTO drivers (provider_id, first_name, last_name, phone, license_number, license_expiry, is_active)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING id
    `, [providerProfileId, 'Mike', 'Driver', '+1234567893', 'DL123456789', '2025-12-31', true]);
    
    const driver1Id = driver1Result.rows[0].id;

    const driver2Result = await query(`
      INSERT INTO drivers (provider_id, first_name, last_name, phone, license_number, license_expiry, is_active)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING id
    `, [providerProfileId, 'Sarah', 'Wheeler', '+1234567894', 'DL987654321', '2026-06-30', true]);
    
    const driver2Id = driver2Result.rows[0].id;

    // Assign drivers to trucks
    await query(`
      INSERT INTO truck_drivers (truck_id, driver_id, is_primary)
      VALUES ($1, $2, $3)
    `, [truck1Id, driver1Id, true]);

    await query(`
      INSERT INTO truck_drivers (truck_id, driver_id, is_primary)
      VALUES ($1, $2, $3)
    `, [truck2Id, driver2Id, true]);

    // Create sample booking
    const customerProfileResult = await query('SELECT id FROM customer_profiles WHERE user_id = $1', [customerId]);
    const customerProfileId = customerProfileResult.rows[0].id;

    await query(`
      INSERT INTO bookings (customer_id, truck_id, pickup_address, pickup_city, destination_address, destination_city, pickup_date, pickup_time, estimated_distance, total_price, cargo_description, cargo_weight, cargo_volume, status)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
    `, [customerProfileId, truck1Id, '100 Warehouse St', 'New York', '200 Factory Ave', 'Philadelphia', '2024-01-15', '09:00:00', 150.5, 375.00, 'Electronics equipment', 5000.00, 20.00, 'confirmed']);

    logger.info('Database seeding completed successfully');
    } catch (error) {
    logger.error('Seeding failed:', error);
    throw error;
  }
};

// Run seeding if called directly
if (process.argv[1] === new URL(import.meta.url).pathname) {
  seedData()
    .then(() => {
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Seeding failed:', error.message);
      process.exit(1);
    });
}

export default seedData;
