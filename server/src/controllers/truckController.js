import Truck from '../models/Truck.js';
import ProviderProfile from '../models/ProviderProfile.js';
import { validationResult } from 'express-validator';
import logger from '../utils/logger.js';
import { processUploadedFiles, deleteUploadedFile, getStorageInfo } from '../utils/hybridUpload.js';
import notificationService from '../services/notificationService.js';
import { query } from '../config/database.js';

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
        // Clean up files using hybrid system
        try {
          const processedFiles = await processUploadedFiles(req);
          // Delete uploaded images
          for (const image of processedFiles.images) {
            await deleteUploadedFile(image);
          }
          // Delete uploaded documents
          for (const doc of processedFiles.documents) {
            await deleteUploadedFile(doc);
          }
        } catch (cleanupError) {
          logger.error('Error cleaning up files:', cleanupError);
        }
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
        try {
          const processedFiles = await processUploadedFiles(req);
          for (const image of processedFiles.images) {
            await deleteUploadedFile(image);
          }
          for (const doc of processedFiles.documents) {
            await deleteUploadedFile(doc);
          }
        } catch (cleanupError) {
          logger.error('Error cleaning up files:', cleanupError);
        }
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
        if (req.files) {
          try {
            const processedFiles = await processUploadedFiles(req);
            for (const image of processedFiles.images) {
              await deleteUploadedFile(image);
            }
            for (const doc of processedFiles.documents) {
              await deleteUploadedFile(doc);
            }
          } catch (cleanupError) {
            logger.error('Error cleaning up files:', cleanupError);
          }
        }
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
      try {
        const processedFiles = await processUploadedFiles(req);
        for (const image of processedFiles.images) {
          await deleteUploadedFile(image);
        }
        for (const doc of processedFiles.documents) {
          await deleteUploadedFile(doc);
        }
      } catch (cleanupError) {
        logger.error('Error cleaning up files:', cleanupError);
      }
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

    // No filtering - return all truck data to everyone
    let filteredTrucks = result.trucks;

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
    logger.info(`Getting truck details for ID: ${id} by user role: ${req.user.role}, email: ${req.user.email}`);
    
    let truck;
    try {
      // First try to get the truck without documents to isolate the issue
      logger.info(`Step 1: Getting truck by ID: ${id}`);
      truck = await Truck.findById(id);
      logger.info(`Step 1 result:`, truck ? `Found truck: ${truck.license_plate}` : 'No truck found');
      
      if (truck) {
        // Then try to get documents
        logger.info(`Step 2: Getting documents for truck: ${id}`);
        truck.documents = await Truck.getDocuments(id);
        logger.info(`Step 2 result: Found ${truck.documents ? truck.documents.length : 0} documents`);
      }
    } catch (truckError) {
      logger.error('Error in truck fetching:', truckError);
      logger.error('Error details:', {
        message: truckError.message,
        code: truckError.code,
        stack: truckError.stack
      });
      throw truckError;
    }

    if (!truck) {
      logger.warn(`Truck not found: ${id}`);
      return res.status(404).json({
        success: false,
        error: 'Truck not found'
      });
    }

    // AUTHORIZATION CHECKS
    if (req.user.role === 'provider') {
      // Providers can only see their own trucks
      const providerProfile = await ProviderProfile.findByUserId(req.user.id);
      if (!providerProfile || truck.provider_id !== providerProfile.id) {
        logger.warn(`Provider ${req.user.email} attempted to access truck ${id} owned by provider ${truck.provider_id}`);
        return res.status(403).json({
          success: false,
          error: 'Access denied. You can only view your own trucks.'
        });
      }
      logger.info(`Provider ${req.user.email} accessing their own truck: ${truck.license_plate}`);
    } else if (req.user.role === 'customer') {
      // Customers can only see trucks with verified documents AND must have verified email
      
      // Check if customer has verified email
      if (!req.user.email_verified) {
        logger.warn(`Customer ${req.user.email} attempted to access truck details without verified email`);
        return res.status(403).json({
          success: false,
          error: 'Email verification required. Please verify your email address to view truck details.',
          requiresEmailVerification: true
        });
      }

      // Check if ALL truck documents are verified (approved)
      const hasDocuments = truck.documents && truck.documents.length > 0;
      const allDocsVerified = hasDocuments && truck.documents.every(doc => doc.verification_status === 'approved');
      
      if (!hasDocuments) {
        logger.warn(`Customer ${req.user.email} attempted to access truck ${id} with no documents`);
        return res.status(403).json({
          success: false,
          error: 'This truck is not available for viewing. Trucks must have documents uploaded and verified to be viewed by customers.'
        });
      }
      
      if (!allDocsVerified) {
        const pendingDocs = truck.documents.filter(doc => doc.verification_status !== 'approved').length;
        logger.warn(`Customer ${req.user.email} attempted to access truck ${id} with ${pendingDocs} unverified documents`);
        return res.status(403).json({
          success: false,
          error: 'This truck is not available for viewing. All truck documents must be verified by admin before customers can view the truck.',
          pendingDocuments: pendingDocs
        });
      }
      logger.info(`Customer ${req.user.email} accessing truck with verified docs: ${truck.license_plate}`);
    } else if (req.user.role === 'admin') {
      // Admins can see all trucks
      logger.info(`Admin ${req.user.email} accessing truck: ${truck.license_plate}`);
    } else {
      // Unknown role
      logger.warn(`Unknown user role ${req.user.role} attempted to access truck ${id}`);
      return res.status(403).json({
        success: false,
        error: 'Access denied. Invalid user role.'
      });
    }

    logger.info(`Truck found: ${truck.license_plate}, getting drivers...`);
    
    // Driver information is stored directly in the truck record
    // Create driver object from truck data if driver info exists
    let drivers = [];
    if (truck.driver_name || truck.driver_phone || truck.driver_license_number) {
      drivers = [{
        name: truck.driver_name,
        phone: truck.driver_phone,
        license_number: truck.driver_license_number,
        is_primary: true
      }];
    }
    logger.info(`Found driver info for truck ${id}: ${drivers.length > 0 ? 'Yes' : 'No'}`);

    // Return complete truck data
    const response = {
      success: true,
      data: {
        truck: {
          ...truck,
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
          try {
            const processedFiles = await processUploadedFiles(req);
            for (const image of processedFiles.images) {
              await deleteUploadedFile(image);
            }
            for (const doc of processedFiles.documents) {
              await deleteUploadedFile(doc);
            }
          } catch (cleanupError) {
            logger.error('Error cleaning up files:', cleanupError);
          }
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
        try {
          const processedFiles = await processUploadedFiles(req);
          for (const image of processedFiles.images) {
            await deleteUploadedFile(image);
          }
          for (const doc of processedFiles.documents) {
            await deleteUploadedFile(doc);
          }
        } catch (cleanupError) {
          logger.error('Error cleaning up files:', cleanupError);
        }
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

// Get storage configuration status
export const getStorageStatus = async (req, res) => {
  try {
    const storageInfo = getStorageInfo();
    
    res.json({
      success: true,
      data: {
        ...storageInfo,
        message: storageInfo.cloudinaryConfigured 
          ? '✅ Cloudinary cloud storage active - files will persist across deployments'
          : '⚠️ Using local storage fallback - files may be lost on deployment restart'
      }
    });
  } catch (error) {
    logger.error('Error getting storage status:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get storage status'
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

// Get all trucks for admin dashboard (bypasses complex filtering)
export const getAllTrucksForAdmin = async (req, res) => {
  try {
    // Only admins can access this endpoint
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: 'Access denied'
      });
    }

    // Get all trucks directly from database without complex filtering
    const result = await query(`
      SELECT t.*, 
             pp.company_name, 
             pp.street_address as address, 
             pp.city, 
             pp.postal_code, 
             pp.business_license,
             u.first_name, 
             u.last_name, 
             u.phone, 
             u.email,
             pp.is_verified as provider_verified,
             u.is_active as user_active,
             COALESCE(doc_stats.total_documents, 0) as total_documents,
             COALESCE(doc_stats.approved_documents, 0) as approved_documents,
             COALESCE(doc_stats.pending_documents, 0) as pending_documents,
             COALESCE(doc_stats.rejected_documents, 0) as rejected_documents
      FROM trucks t
      JOIN provider_profiles pp ON t.provider_id = pp.id
      JOIN users u ON pp.user_id = u.id
      LEFT JOIN (
        SELECT 
          entity_id,
          COUNT(*) as total_documents,
          COUNT(CASE WHEN verification_status = 'approved' THEN 1 END) as approved_documents,
          COUNT(CASE WHEN verification_status = 'pending' THEN 1 END) as pending_documents,
          COUNT(CASE WHEN verification_status = 'rejected' THEN 1 END) as rejected_documents
        FROM documents 
        WHERE entity_type = 'truck'
        GROUP BY entity_id
      ) doc_stats ON doc_stats.entity_id = t.id
      ORDER BY t.created_at DESC
    `);

    res.json({
      success: true,
      data: {
        trucks: result.rows,
        totalCount: result.rows.length
      }
    });
  } catch (error) {
    logger.error('Get all trucks for admin error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error while fetching trucks for admin'
    });
  }
};
