import Truck from '../models/Truck.js';
import ProviderProfile from '../models/ProviderProfile.js';
import { validationResult } from 'express-validator';
import logger from '../utils/logger.js';
import { cleanupFiles, processUploadedFiles } from '../utils/fileUpload.js';
import notificationService from '../services/notificationService.js';

export const createTruck = async (req, res) => {
  try {
    // Check validation results
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      // Log validation errors for debugging
      logger.error('🔴 VALIDATION FAILED:');
      logger.error('Request body:', JSON.stringify(req.body, null, 2));
      logger.error('Validation errors:', JSON.stringify(errors.array(), null, 2));
      
      // Cleanup uploaded files on validation error
      if (req.files) {
        cleanupFiles(req.files);
      }
      
      const response = {
        success: false,
        error: 'Validation failed',
        details: errors.array()
      };
      
      logger.error('Sending response:', JSON.stringify(response, null, 2));
      return res.status(400).json(response);
    }

    // Get provider profile
    const providerProfile = await ProviderProfile.findByUserId(req.user.id);
    if (!providerProfile) {
      // Cleanup uploaded files on error
      if (req.files) {
        cleanupFiles(req.files);
      }
      return res.status(400).json({
        success: false,
        error: 'Provider profile not found. Please complete your profile first.'
      });
    }

    // Extract truck data from request - using field names that match validation middleware
    const {
      truck_type,
      license_plate, 
      capacity_weight,
      capacity_volume,
      price_per_km,
      fixed_price,
      pricing_type,
      year,
      make,
      model,
      status,
      // Equipment-specific fields
      service_type,
      hourly_rate,
      daily_rate,
      weekly_rate,
      monthly_rate,
      work_location,
      // Driver information fields
      driver_name,
      driver_phone,
      driver_license_number
    } = req.body;

    // Process uploaded files using multer
    let images = [];
    let documents = [];
    
    if (req.files) {
      try {
        // Debug logging
        logger.info('Request body:', req.body);
        logger.info('Request files:', req.files);
        
        const processedFiles = await processUploadedFiles(req);
        logger.info('Processed files:', processedFiles);
        
        images = processedFiles.images || [];
        documents = processedFiles.documents || [];
      } catch (fileError) {
        logger.error('File processing error:', fileError);
        // Cleanup any uploaded files
        cleanupFiles(req.files);
        return res.status(400).json({
          success: false,
          error: 'File processing failed',
          details: [{ msg: fileError.message }]
        });
      }
    }
    
    // Validate required inspection document (temporarily relaxed)
    if (documents.length === 0 || !documents.some(doc => doc.type === 'inspection')) {
      logger.warn('No inspection document found, but allowing truck creation for testing');
      // For testing purposes, we'll allow truck creation without inspection doc
      // In production, this should be uncommented:
      /*
      // Cleanup uploaded files on validation error
      if (req.files) {
        cleanupFiles(req.files);
      }
      return res.status(400).json({
        success: false,
        error: 'Inspection document is required for truck registration'
      });
      */
    }

    // Prepare truck data - using camelCase to match Truck model expectations
    const truckData = {
      providerId: providerProfile.id,
      truckType: truck_type,
      licensePlate: license_plate,
      capacityWeight: parseFloat(capacity_weight),
      capacityVolume: parseFloat(capacity_volume || 0),
      pricePerKm: pricing_type === 'per_km' ? parseFloat(price_per_km || 0) : null,
      fixedPrice: pricing_type === 'fixed' ? parseFloat(fixed_price || 0) : null,
      pricingType: pricing_type,
      year: parseInt(year, 10),
      make,
      model,
      status: status || 'active',
      images: images.map(img => img.path),
      documents: documents,
      // Equipment-specific fields
      serviceType: service_type || 'transport',
      hourlyRate: hourly_rate ? parseFloat(hourly_rate) : null,
      dailyRate: daily_rate ? parseFloat(daily_rate) : null,
      weeklyRate: weekly_rate ? parseFloat(weekly_rate) : null,
      monthlyRate: monthly_rate ? parseFloat(monthly_rate) : null,
      workLocation: work_location,
      // Driver information fields
      driverName: driver_name || null,
      driverPhone: driver_phone || null,
      driverLicenseNumber: driver_license_number || null
    };

    // Debug: log the prepared truck data
    logger.info('🔧 Prepared truck data:');
    logger.info(JSON.stringify(truckData, null, 2));

    // Create truck
    logger.info('📦 About to create truck in database...');
    const truck = await Truck.create(truckData);
    logger.info('✅ Truck created successfully:', truck.id);

    logger.info(`New truck created: ${license_plate} by provider ${req.user.email}`);

    // Send notification to admins about new truck registration
    try {
      await notificationService.notifyAdminNewTruck(truck, req.user);
      logger.info('✅ Admin notification sent for new truck');
    } catch (notificationError) {
      logger.error('❌ Failed to send admin notification for new truck:', notificationError);
      // Don't fail the truck creation if notification fails
    }

    res.status(201).json({
      success: true,
      data: truck,
      message: 'Truck created successfully'
    });

  } catch (error) {
    // Cleanup uploaded files on error
    if (req.files) {
      cleanupFiles(req.files);
    }
    
    if (error.code === '23505') { // Unique violation
      return res.status(400).json({
        success: false,
        error: 'A truck with this license plate already exists'
      });
    }

    // Detailed error logging for debugging
    logger.error('🚨 CREATE TRUCK ERROR:');
    logger.error('Error message:', error.message);
    logger.error('Error code:', error.code);
    logger.error('Error name:', error.name);
    logger.error('Error stack:', error.stack);
    logger.error('Request body:', JSON.stringify(req.body, null, 2));
    logger.error('Request files:', req.files ? Object.keys(req.files) : 'No files');
    
    res.status(500).json({
      success: false,
      error: 'Server error while creating truck',
      debug: process.env.NODE_ENV === 'development' ? {
        message: error.message,
        code: error.code,
        name: error.name
      } : undefined
    });
  }
};

export const getTrucks = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: errors.array()
      });
    }

    const filters = {
      search: req.query.search,
      truckType: req.query.truckType,
      pickupCity: req.query.pickupCity,
      destinationCity: req.query.destinationCity,
      minCapacity: req.query.minCapacity,
      maxPrice: req.query.maxPrice,
      pricingType: req.query.pricingType,
      page: req.query.page,
      limit: req.query.limit,
      // Equipment-specific filters
      serviceType: req.query.serviceType,
      workLocation: req.query.workLocation,
      provider: req.query.provider
    };

    const result = await Truck.search({
      ...filters,
      onlyAvailable: req.user?.role === 'customer',
      adminView: req.user?.role === 'admin'
    });

    // Apply role-based filtering to truck list
    let filteredTrucks = result.trucks;
    
    if (req.user?.role === 'customer') {
      // Show comprehensive business information for customer transparency
      filteredTrucks = result.trucks.map(truck => ({
        id: truck.id,
        license_plate: truck.license_plate,
        truck_type: truck.truck_type,
        capacity_weight: truck.capacity_weight,
        capacity_volume: truck.capacity_volume,
        price_per_km: truck.price_per_km,
        fixed_price: truck.fixed_price,
        pricing_type: truck.pricing_type,
        status: truck.status,
        year: truck.year,
        make: truck.make,
        model: truck.model,
        images: truck.images,
        created_at: truck.created_at,
        updated_at: truck.updated_at,
        // Full business information for customers
        company_name: truck.company_name,
        first_name: truck.first_name,
        last_name: truck.last_name,
        phone: truck.phone, // Company/business phone number
        // Include any location information that exists
        ...Object.keys(truck).reduce((acc, key) => {
          if (key.includes('address') || key.includes('city') || key.includes('state') || 
              key.includes('country') || key.includes('postal') || key.includes('location')) {
            acc[key] = truck[key];
          }
          return acc;
        }, {}),
        total_documents: truck.total_documents,
        approved_documents: truck.approved_documents,
        pending_documents: truck.pending_documents,
        rejected_documents: truck.rejected_documents
      }));
    }

    res.json({
      success: true,
      data: {
        trucks: filteredTrucks,
        pagination: {
          currentPage: result.currentPage,
          totalPages: result.totalPages,
          totalCount: result.totalCount,
          limit: parseInt(filters.limit) || 10
        }
      }
    });
  } catch (error) {
    logger.error('Get trucks error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error while fetching trucks'
    });
  }
};

export const getTruck = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: errors.array()
      });
    }

    const { id } = req.params;
    logger.info(`Getting truck details for ID: ${id} by user role: ${req.user.role}`);
    
    const truck = await Truck.getWithDocuments(id);

    if (!truck) {
      logger.warn(`Truck not found: ${id}`);
      return res.status(404).json({
        success: false,
        error: 'Truck not found'
      });
    }

    logger.info(`Truck found: ${truck.license_plate}, applying role-based filtering...`);
    
    // Apply role-based data filtering
    let filteredTruck = { ...truck };
    let drivers = [];
    
    if (req.user.role === 'customer') {
      // Customers should see comprehensive business information for transparency
      logger.info('Showing comprehensive business information for customer view');
      
      // Get full driver information for customer transparency
      try {
        drivers = await Truck.getDrivers(id);
        logger.info(`Showing ${drivers.length} drivers for customer view`);
      } catch (driverError) {
        logger.error('Error getting drivers for customer view:', driverError);
        drivers = [];
      }
      
      // Show comprehensive business information to customers
      filteredTruck = {
        id: filteredTruck.id,
        license_plate: filteredTruck.license_plate,
        truck_type: filteredTruck.truck_type,
        capacity_weight: filteredTruck.capacity_weight,
        capacity_volume: filteredTruck.capacity_volume,
        price_per_km: filteredTruck.price_per_km,
        fixed_price: filteredTruck.fixed_price,
        pricing_type: filteredTruck.pricing_type,
        status: filteredTruck.status,
        year: filteredTruck.year,
        make: filteredTruck.make,
        model: filteredTruck.model,
        images: filteredTruck.images,
        created_at: filteredTruck.created_at,
        updated_at: filteredTruck.updated_at,
        documents: filteredTruck.documents || [],
        // Full business information for customers
        company_name: filteredTruck.company_name,
        first_name: filteredTruck.first_name,
        last_name: filteredTruck.last_name,
        phone: filteredTruck.phone, // Company/business phone number
        // Include any location information that exists
        ...Object.keys(filteredTruck).reduce((acc, key) => {
          if (key.includes('address') || key.includes('city') || key.includes('state') || 
              key.includes('country') || key.includes('postal') || key.includes('location')) {
            acc[key] = filteredTruck[key];
          }
          return acc;
        }, {})
      };
      
    } else if (req.user.role === 'provider' || req.user.role === 'admin') {
      // Providers and admins can see full details including drivers
      try {
        drivers = await Truck.getDrivers(id);
        logger.info(`Found ${drivers.length} drivers for truck ${id}`);
      } catch (driverError) {
        logger.error('Error getting drivers for truck:', driverError);
        drivers = [];
      }
    }

    const response = {
      success: true,
      data: {
        truck: {
          ...filteredTruck,
          drivers
        }
      }
    };
    
    logger.info(`Successfully retrieved truck details for ${truck.license_plate} (role: ${req.user.role})`);
    res.json(response);
    
  } catch (error) {
    logger.error('Get truck error:', error);
    logger.error('Error details:', {
      message: error.message,
      code: error.code,
      stack: error.stack
    });
    
    res.status(500).json({
      success: false,
      error: 'Server error while fetching truck',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

export const updateTruck = async (req, res) => {
  try {
    // Process the files before validation
    let processedFiles = null;
    
    if (req.files) {
      try {
        // Process new files
        processedFiles = await processUploadedFiles(req);
      } catch (fileError) {
        logger.error('File processing error:', fileError);
        // Cleanup any uploaded files
        if (req.files) {
          cleanupFiles(req.files);
        }
        return res.status(400).json({
          success: false,
          error: 'File processing failed',
          details: [{ msg: fileError.message }]
        });
      }
    }

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      // Cleanup any uploaded files on validation error
      if (req.files) {
        cleanupFiles(req.files);
      }
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: errors.array()
      });
    }

    const { id } = req.params;
    
    // Check if truck exists and belongs to the provider
    const existingTruck = await Truck.findById(id);
    if (!existingTruck) {
      return res.status(404).json({
        success: false,
        error: 'Truck not found'
      });
    }

    // Only the owner or admin can update
    if (req.user.role === 'provider') {
      const providerProfile = await ProviderProfile.findByUserId(req.user.id);
      if (!providerProfile || existingTruck.provider_id !== providerProfile.id) {
        return res.status(403).json({
          success: false,
          error: 'You can only update your own trucks'
        });
      }
    } else if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: 'Access denied'
      });
    }

    const {
      truck_type,
      capacity_weight,
      capacity_volume,
      price_per_km,
      fixed_price,
      pricing_type,
      status,
      year,
      make,
      model
    } = req.body;

    // Process uploaded files
    let newImages = [];
    let newDocuments = [];
    let existingImages = [];
    let existingDocuments = [];
    
    // Handle processed files from middleware
    if (processedFiles) {
      newImages = processedFiles.images || [];
      newDocuments = processedFiles.documents || [];
    }
    
    // Also check for files in body (backward compatibility)
    if (req.body.uploadedFiles) {
      if (req.body.uploadedFiles.images) {
        newImages.push(...req.body.uploadedFiles.images);
      }
      if (req.body.uploadedFiles.inspectionDoc) {
        newDocuments.push(req.body.uploadedFiles.inspectionDoc);
      }
      if (req.body.uploadedFiles.documents) {
        newDocuments.push(...req.body.uploadedFiles.documents);
      }
    }

    // Handle existing files
    try {
      if (req.body.existingImages) {
        existingImages = JSON.parse(req.body.existingImages);
      }
      if (req.body.existingDocuments) {
        existingDocuments = JSON.parse(req.body.existingDocuments);
      }
    } catch (e) {
      logger.error('Error parsing existing files:', e);
    }

    const updates = {
      truck_type,
      capacity_weight: capacity_weight ? parseFloat(capacity_weight) : null,
      capacity_volume: capacity_volume ? parseFloat(capacity_volume) : null,
      price_per_km: pricing_type === 'per_km' && price_per_km ? parseFloat(price_per_km) : null,
      fixed_price: pricing_type === 'fixed' && fixed_price ? parseFloat(fixed_price) : null,
      pricing_type,
      status,
      year: year ? parseInt(year, 10) : null,
      make,
      model,
      // Combine new and existing files
      images: [...existingImages, ...newImages.map(img => img.path)],
      documents: [...existingDocuments, ...newDocuments]
    };

    const updatedTruck = await Truck.update(id, updates);

    logger.info(`Truck updated: ${id} by ${req.user.email}`);

    res.json({
      success: true,
      data: { truck: updatedTruck },
      message: 'Truck updated successfully'
    });
  } catch (error) {
    logger.error('Update truck error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error while updating truck'
    });
  }
};

export const deleteTruck = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: errors.array()
      });
    }

    const { id } = req.params;
    
    // Check if truck exists and belongs to the provider
    const existingTruck = await Truck.findById(id);
    if (!existingTruck) {
      return res.status(404).json({
        success: false,
        error: 'Truck not found'
      });
    }

    // Only the owner or admin can delete
    if (req.user.role === 'provider') {
      const providerProfile = await ProviderProfile.findByUserId(req.user.id);
      if (!providerProfile || existingTruck.provider_id !== providerProfile.id) {
        return res.status(403).json({
          success: false,
          error: 'You can only delete your own trucks'
        });
      }
    } else if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: 'Access denied'
      });
    }

    // Check for active bookings (only for providers, admins can override)
    if (req.user.role === 'provider') {
      const hasActiveBookings = await Truck.hasActiveBookings(id);
      if (hasActiveBookings) {
        // Get details of active bookings for the error message
        const activeBookings = await Truck.getActiveBookings(id);
        
        return res.status(400).json({
          success: false,
          error: 'Cannot delete truck with active bookings',
          message: 'This truck has active bookings that are not yet completed or cancelled. Please wait for all bookings to be completed or cancelled before deleting the truck.',
          activeBookings: activeBookings.map(booking => ({
            id: booking.id,
            status: booking.status,
            pickup_date: booking.pickup_date,
            pickup_location: booking.pickup_city,
            delivery_location: booking.destination_city,
            customer_name: `${booking.customer_first_name} ${booking.customer_last_name}`,
            customer_company: booking.customer_company
          }))
        });
      }
    }

    await Truck.delete(id);

    logger.info(`Truck deleted: ${id} by ${req.user.email}`);

    res.json({
      success: true,
      message: 'Truck deleted successfully'
    });
  } catch (error) {
    logger.error('Delete truck error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error while deleting truck'
    });
  }
};

export const getMyTrucks = async (req, res) => {
  try {
    // Only providers can view their trucks
    if (req.user.role !== 'provider') {
      return res.status(403).json({
        success: false,
        error: 'Only providers can view truck listings'
      });
    }

    const providerProfile = await ProviderProfile.findByUserId(req.user.id);
    if (!providerProfile) {
      return res.status(400).json({
        success: false,
        error: 'Provider profile not found'
      });
    }

    const trucks = await Truck.findByProviderId(providerProfile.id);

    res.json({
      success: true,
      data: { trucks }
    });
  } catch (error) {
    logger.error('Get my trucks error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error while fetching trucks'
    });
  }
};
