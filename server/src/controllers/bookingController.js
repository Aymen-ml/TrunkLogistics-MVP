import Booking from '../models/Booking.js';
import CustomerProfile from '../models/CustomerProfile.js';
import ProviderProfile from '../models/ProviderProfile.js';
import Truck from '../models/Truck.js';
import User from '../models/User.js';
import notificationService from '../services/notificationService.js';
import distanceService from '../services/distanceService.js';
import { validationResult } from 'express-validator';
import logger from '../utils/logger.js';

export const createBooking = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: errors.array()
      });
    }

    // Only customers can create bookings
    if (req.user.role !== 'customer') {
      return res.status(403).json({
        success: false,
        error: 'Only customers can create booking requests'
      });
    }

    // Get customer profile
    logger.info('Finding customer profile for user:', { userId: req.user.id });
    const customerProfile = await CustomerProfile.findByUserId(req.user.id);
    logger.info('Customer profile result:', { 
      found: !!customerProfile,
      profile: customerProfile 
    });

    if (!customerProfile) {
      logger.warn('No customer profile found for user:', { userId: req.user.id });
      return res.status(400).json({
        success: false,
        error: 'Customer profile not found. Please complete your profile first.'
      });
    }

    const {
      truckId,
      pickupAddress,
      pickupCity,
      destinationAddress,
      destinationCity,
      pickupDate,
      pickupTime,
      cargoDescription,
      cargoWeight,
      cargoVolume,
      notes,
      // Rental-specific fields
      service_type,
      rental_start_datetime,
      rental_end_datetime,
      work_address,
      operator_required,
      operator_provided,
      purpose_description
    } = req.body;

    // Get the truck details
    const truck = await Truck.findById(truckId);
    if (!truck) {
      return res.status(404).json({
        success: false,
        error: 'Truck not found'
      });
    }

    // Get provider profile
    const providerProfile = await ProviderProfile.findById(truck.provider_id);
    if (!providerProfile) {
      return res.status(404).json({
        success: false,
        error: 'Provider not found'
      });
    }

    // Check if truck is active
    if (truck.status !== 'active') {
      return res.status(400).json({
        success: false,
        error: `This truck is currently ${truck.status} and is not available for new bookings`
      });
    }

    // Calculate estimated price and distance based on service type
    let distanceInfo;
    let estimatedDistance = null;
    let totalPrice = 200; // Default price when calculation fails
    let rentalDurationHours = null;
    
    if (service_type === 'rental') {
      // For rental equipment, calculate price based on time duration
      if (rental_start_datetime && rental_end_datetime) {
        try {
          const priceInfo = await Booking.calculateRentalPrice(
            truckId,
            rental_start_datetime,
            rental_end_datetime
          );
          totalPrice = priceInfo.total_price;
          rentalDurationHours = priceInfo.duration_hours;
          
          // Check equipment availability
          const isAvailable = await Booking.checkEquipmentAvailability(
            truckId,
            rental_start_datetime,
            rental_end_datetime
          );
          
          if (!isAvailable) {
            return res.status(400).json({
              success: false,
              error: 'Equipment is not available for the selected time period'
            });
          }
        } catch (error) {
          logger.error('Rental price calculation failed:', error);
          return res.status(400).json({
            success: false,
            error: error.message || 'Failed to calculate rental price'
          });
        }
      } else {
        return res.status(400).json({
          success: false,
          error: 'Rental start and end times are required for equipment rental'
        });
      }
    } else {
      // For transport trucks, calculate price based on distance
      try {
        distanceInfo = await distanceService.calculateDistance(pickupCity, destinationCity);
        if (distanceInfo && distanceInfo.distance) {
          estimatedDistance = distanceInfo.distance;
          totalPrice = truck.price_per_km * estimatedDistance;
          
          // Validate price calculation
          if (!totalPrice || isNaN(totalPrice)) {
            logger.warn('Invalid price calculation, using default price', {
              pricePerKm: truck.price_per_km,
              estimatedDistance,
              calculatedPrice: totalPrice
            });
            totalPrice = 200; // Fallback to default
            estimatedDistance = null; // Reset distance since calculation failed
          }
        } else {
          logger.warn('Distance calculation returned invalid data, using default price', {
            pickupCity,
            destinationCity,
            distanceInfo
          });
        }
      } catch (error) {
        logger.warn('Distance calculation failed, using default price of $200', {
          error: error.message,
          pickupCity,
          destinationCity
        });
      }
    }

    // Create the booking
    const booking = await Booking.create({
      customer_id: customerProfile.id,
      truck_id: truckId,
      // For rental equipment, provide placeholder values for transport-specific required fields
      pickup_address: service_type === 'rental' ? (work_address || 'N/A - Rental Equipment') : pickupAddress,
      pickup_city: service_type === 'rental' ? 'N/A' : pickupCity,
      destination_address: service_type === 'rental' ? 'N/A - Rental Equipment' : destinationAddress,
      destination_city: service_type === 'rental' ? 'N/A' : destinationCity,
      pickup_date: service_type === 'rental' ? rental_start_datetime?.split('T')[0] : pickupDate,
      pickup_time: pickupTime,
      cargo_description: service_type === 'rental' ? purpose_description : cargoDescription,
      cargo_weight: cargoWeight,
      cargo_volume: cargoVolume,
      estimated_distance: estimatedDistance,
      total_price: totalPrice,
      notes,
      status: 'pending_review',
      // Rental-specific fields
      service_type: service_type || 'transport',
      rental_start_datetime: rental_start_datetime,
      rental_end_datetime: rental_end_datetime,
      work_address: work_address,
      operator_required: operator_required || false,
      operator_provided: operator_provided || false,
      rental_duration_hours: rentalDurationHours,
      purpose_description: purpose_description
    });

    // Send notifications
    try {
      // Get customer and provider user details
      const customerUser = await User.findById(req.user.id);
      const providerUser = await User.findById(providerProfile.user_id);
      
      const customerName = `${customerUser.first_name} ${customerUser.last_name}`.trim() || customerUser.email;
      
      // 1. Notify customer about booking creation
      await notificationService.notifyBookingCreated(customerProfile.user_id, booking);
      
      // 2. Notify provider about new booking request
      if (providerUser) {
        await notificationService.notifyProviderNewBooking(providerProfile.user_id, booking, customerName);
      }
      
      // 3. Notify admins about new booking request
      await notificationService.notifyAdminNewBooking(booking, customerName);
      
      logger.info('✅ Booking notifications sent successfully');
    } catch (notificationError) {
      logger.error('❌ Failed to send booking notifications:', notificationError);
      // Don't fail the booking creation if notifications fail
    }

    res.status(201).json({
      success: true,
      data: { booking }
    });

  } catch (error) {
    logger.error('Error in createBooking:', {
      error: error.message,
      stack: error.stack,
      requestBody: req.body,
      userId: req.user?.id
    });
    res.status(500).json({
      success: false,
      error: 'Failed to create booking',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

export const getBookings = async (req, res) => {
  try {
    logger.info('Getting bookings for user:', { 
      userId: req.user.id,
      role: req.user.role,
      query: req.query 
    });

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: errors.array()
      });
    }

    let bookings;
    const { status, date_from, date_to, search } = req.query;
    
    logger.info('Parsed query parameters:', { status, date_from, date_to, search });

    logger.info('Fetching bookings', { 
      userId: req.user.id, 
      role: req.user.role,
      filters: { status, date_from, date_to, search }
    });

    if (req.user.role === 'customer') {
      const customerProfile = await CustomerProfile.findByUserId(req.user.id);
      if (!customerProfile) {
        logger.error('Customer profile not found', { userId: req.user.id });
        return res.status(400).json({
          success: false,
          error: 'Customer profile not found'
        });
      }

      logger.info('Found customer profile', { 
        customerId: customerProfile.id,
        userId: req.user.id 
      });

      // Get customer's bookings with filters
      bookings = await Booking.findByCustomerId(customerProfile.id, {
        status: status !== 'all' ? status : undefined,
        search,
        dateFrom: date_from,
        dateTo: date_to
      });

      logger.info('Retrieved bookings for customer', { 
        customerId: customerProfile.id,
        bookingsCount: bookings.length 
      });

    } else if (req.user.role === 'provider') {
      const providerProfile = await ProviderProfile.findByUserId(req.user.id);
      if (!providerProfile) {
        logger.error('Provider profile not found', { userId: req.user.id });
        return res.status(400).json({
          success: false,
          error: 'Provider profile not found'
        });
      }

      bookings = await Booking.findByProviderId(providerProfile.id, {
        status: status !== 'all' ? status : undefined,
        search,
        dateFrom: date_from,
        dateTo: date_to
      });
    } else if (req.user.role === 'admin') {
      // Admin can see all bookings
      bookings = await Booking.findAll({
        status: status !== 'all' ? status : undefined,
        search,
        dateFrom: date_from,
        dateTo: date_to
      });

      logger.info('Retrieved all bookings for admin', { 
        bookingsCount: bookings.length 
      });
    } else {
      logger.error('Unauthorized role for bookings access', { 
        userId: req.user.id, 
        role: req.user.role 
      });
      return res.status(403).json({
        success: false,
        error: 'Unauthorized access to bookings'
      });
    }

    res.status(200).json({
      success: true,
      data: { bookings }
    });

  } catch (error) {
    logger.error('Error in getBookings:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch bookings'
    });
  }
};

export const getBooking = async (req, res) => {
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
    const booking = await Booking.findById(id);

    if (!booking) {
      return res.status(404).json({
        success: false,
        error: 'Booking not found'
      });
    }

    // Check access permissions
    if (req.user.role === 'customer') {
      const customerProfile = await CustomerProfile.findByUserId(req.user.id);
      if (!customerProfile || booking.customer_id !== customerProfile.id) {
        return res.status(403).json({
          success: false,
          error: 'Access denied'
        });
      }
    } else if (req.user.role === 'provider') {
      const providerProfile = await ProviderProfile.findByUserId(req.user.id);
      if (!providerProfile || booking.provider_id !== providerProfile.id) {
        return res.status(403).json({
          success: false,
          error: 'Access denied'
        });
      }
    }

    res.status(200).json({
      success: true,
      data: { booking }
    });

  } catch (error) {
    logger.error('Error in getBooking:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch booking'
    });
  }
};

export const updateBookingStatus = async (req, res) => {
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
    const { status, notes } = req.body;

    const booking = await Booking.findById(id);
    if (!booking) {
      return res.status(404).json({
        success: false,
        error: 'Booking not found'
      });
    }

    // Check permissions based on role and booking status
    if (req.user.role === 'provider') {
      const providerProfile = await ProviderProfile.findByUserId(req.user.id);
      if (!providerProfile || booking.provider_id !== providerProfile.id) {
        return res.status(403).json({
          success: false,
          error: 'You can only update status of bookings assigned to you'
        });
      }
      
      // Providers cannot mark bookings as completed - only customers can do that
      if (status === 'completed') {
        return res.status(403).json({
          success: false,
          error: 'Only customers can mark bookings as completed by confirming delivery'
        });
      }
    } else if (req.user.role === 'customer') {
      const customerProfile = await CustomerProfile.findByUserId(req.user.id);
      if (!customerProfile || booking.customer_id !== customerProfile.id) {
        return res.status(403).json({
          success: false,
          error: 'You can only update status of your own bookings'
        });
      }

      // Business rules for customers:
      // 1) They can cancel only when the booking is in 'pending_review'
      if (status === 'cancelled') {
        if (booking.status !== 'pending_review') {
          return res.status(400).json({
            success: false,
            error: 'You can only cancel bookings that are in pending review status'
          });
        }
      }
      // 2) They can confirm delivery (set to 'completed') only when the booking is 'in_transit' or 'active' (for rental)
      else if (status === 'completed') {
        if (booking.status !== 'in_transit' && booking.status !== 'active') {
          return res.status(400).json({
            success: false,
            error: 'You can only confirm delivery when the booking is in transit or return equipment when active'
          });
        }
      }
      // 3) Any other status change is not allowed for customers
      else {
        return res.status(403).json({
          success: false,
          error: 'Customers can only cancel bookings or confirm delivery'
        });
      }
    }

    // Update booking status
    const updatedBooking = await Booking.updateStatus(id, status, req.user.id);

    // Update truck status based on booking status change
    try {
      if (status === 'approved') {
        // Set truck to rented when booking is approved
        await Truck.setStatus(booking.truck_id, 'rented');
        logger.info(`Truck ${booking.truck_id} set to rented due to approved booking ${id}`);
      } else if (status === 'active') {
        // Keep truck rented when rental starts (active status)
        logger.info(`Booking ${id} started (active), truck ${booking.truck_id} remains rented`);
        await Truck.setStatus(booking.truck_id, 'rented');
      } else if (status === 'confirmed') {
        // Transport flow: booking confirmed, reserve/rent the truck
        await Truck.setStatus(booking.truck_id, 'rented');
        logger.info(`Truck ${booking.truck_id} set to rented due to confirmed booking ${id}`);
      } else if (status === 'in_transit') {
        // Transport flow: in transit means truck is in use
        await Truck.setStatus(booking.truck_id, 'rented');
        logger.info(`Truck ${booking.truck_id} remains rented due to in_transit booking ${id}`);
      } else if (status === 'completed') {
        // Set truck back to active when booking is completed
        await Truck.setStatus(booking.truck_id, 'active');
        logger.info(`Truck ${booking.truck_id} set to active due to completed booking ${id}`);
        
        // Update truck revenue when booking is completed
        if (booking.total_price) {
          await Truck.updateRevenue(booking.truck_id, booking.total_price);
          logger.info(`Added $${booking.total_price} revenue to truck ${booking.truck_id}`);
        }
      } else if (status === 'cancelled') {
        // Set truck back to active when booking is cancelled (only if it was previously approved)
        if (booking.status === 'approved' || booking.status === 'in_transit' || booking.status === 'active' || booking.status === 'confirmed') {
          await Truck.setStatus(booking.truck_id, 'active');
          logger.info(`Truck ${booking.truck_id} set to active due to cancelled booking ${id}`);
        }
      }
    } catch (truckStatusError) {
      logger.error('Failed to update truck status:', truckStatusError);
      // Don't fail the booking update if truck status update fails
    }

    // Send comprehensive notifications for booking status changes
    try {
      // Get customer and provider details for notifications
      const customerProfile = await CustomerProfile.findById(booking.customer_id);
      const providerProfile = await ProviderProfile.findById(booking.provider_id);
      
      if (!customerProfile || !providerProfile) {
        logger.warn('Could not find customer or provider profile for notifications');
        return;
      }
      
      const customerUser = await User.findById(customerProfile.user_id);
      const providerUser = await User.findById(providerProfile.user_id);
      
      // Determine who made the change and create appropriate message
      const changedByUser = req.user;
      const changedByName = `${changedByUser.first_name} ${changedByUser.last_name}`.trim() || changedByUser.email;
      const changedByRole = changedByUser.role;
      
      // Always notify both customer and provider about status changes
      const notifications = [];
      
      // Only notify the other parties (not the one who made the change)
      // 1. Notify Customer (unless customer made the change)
      if (changedByRole !== 'customer') {
        notifications.push(
          notificationService.notifyBookingStatusChange(
            customerProfile.user_id,
            updatedBooking,
            booking.status,
            status,
            notes,
            'customer',
            changedByName,
            changedByRole
          )
        );
      }
      
      // 2. Notify Provider (unless provider made the change)
      if (changedByRole !== 'provider') {
        notifications.push(
          notificationService.notifyBookingStatusChange(
            providerProfile.user_id,
            updatedBooking,
            booking.status,
            status,
            notes,
            'provider',
            changedByName,
            changedByRole
          )
        );
      }
      
      // 3. If admin made the change, also notify admin (for record keeping)
      if (req.user.role === 'admin') {
        notifications.push(
          notificationService.notifyAdminBookingStatusChanged(
            updatedBooking,
            booking.status,
            status,
            notes,
            customerUser,
            providerUser
          )
        );
      }
      
      // Send all notifications
      await Promise.all(notifications);
      
      logger.info(`✅ Booking status change notifications sent to customer, provider${req.user.role === 'admin' ? ', and admin' : ''}`);
      
    } catch (notificationError) {
      logger.error('❌ Failed to send booking status change notifications:', notificationError);
      // Don't fail the booking update if notification fails
    }

    res.status(200).json({
      success: true,
      data: { booking: updatedBooking }
    });

  } catch (error) {
    logger.error('Error in updateBookingStatus:', error);
    logger.error('Error stack:', error.stack);
    res.status(500).json({
      success: false,
      error: 'Failed to update booking status',
      details: error.message
    });
  }
};

export const updateBooking = async (req, res) => {
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
    const updateData = req.body;

    const booking = await Booking.findById(id);
    if (!booking) {
      return res.status(404).json({
        success: false,
        error: 'Booking not found'
      });
    }

    // Only allow updates by the customer who created the booking or admin
    if (req.user.role === 'customer') {
      const customerProfile = await CustomerProfile.findByUserId(req.user.id);
      if (!customerProfile || booking.customer_id !== customerProfile.id) {
        return res.status(403).json({
          success: false,
          error: 'You can only update your own bookings'
        });
      }
    } else if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: 'Only customers can update bookings'
      });
    }

    // Only allow updates for pending bookings
    if (booking.status !== 'pending_review') {
      return res.status(400).json({
        success: false,
        error: 'Can only update pending bookings'
      });
    }

    try {
      // Update the booking
      const updatedBooking = await Booking.update(id, updateData);

      // Try to notify provider, but don't fail if notification fails
      try {
        if (booking.provider_id) {
          await notificationService.notifyProvider(booking.provider_id, {
            type: 'booking_updated',
            booking_id: booking.id,
            message: `Booking has been updated`
          });
        }
      } catch (notifyError) {
        logger.warn('Failed to send notification:', notifyError);
      }

      res.status(200).json({
        success: true,
        data: { booking: updatedBooking }
      });
    } catch (updateError) {
      logger.error('Error updating booking:', updateError);
      res.status(400).json({
        success: false,
        error: updateError.message || 'Failed to update booking'
      });
    }

  } catch (error) {
    logger.error('Error in updateBooking:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update booking'
    });
  }
};

export const deleteBooking = async (req, res) => {
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
    const booking = await Booking.findById(id);

    if (!booking) {
      return res.status(404).json({
        success: false,
        error: 'Booking not found'
      });
    }

    // Check permissions for deletion
    if (req.user.role === 'customer') {
      // Customers can only delete their own bookings
      const customerProfile = await CustomerProfile.findByUserId(req.user.id);
      if (!customerProfile || booking.customer_id !== customerProfile.id) {
        return res.status(403).json({
          success: false,
          error: 'You can only delete your own bookings'
        });
      }
      
      // Business rule: Customers can only delete bookings in 'pending_review', 'cancelled', or 'completed' status
      if (!['pending_review', 'cancelled', 'completed'].includes(booking.status)) {
        return res.status(403).json({
          success: false,
          error: 'You can only delete bookings that are in pending review, cancelled, or completed status'
        });
      }
    } else if (req.user.role === 'provider') {
      // Providers can only delete their own cancelled bookings
      const providerProfile = await ProviderProfile.findByUserId(req.user.id);
      if (!providerProfile || booking.provider_id !== providerProfile.id) {
        return res.status(403).json({
          success: false,
          error: 'You can only delete bookings assigned to you'
        });
      }
      // Providers can delete cancelled or completed bookings
      if (!['cancelled', 'completed'].includes(booking.status)) {
        return res.status(403).json({
          success: false,
          error: 'You can only delete cancelled or completed bookings'
        });
      }
    } else {
      return res.status(403).json({
        success: false,
        error: 'Access denied'
      });
    }

    // Proceed with soft deletion based on user role
    if (req.user.role === 'customer') {
      await Booking.softDeleteForCustomer(id);
      logger.info(`Booking ${id} soft deleted by customer (ID: ${req.user.id})`);
    } else if (req.user.role === 'provider') {
      await Booking.softDeleteForProvider(id);
      logger.info(`Booking ${id} soft deleted by provider (ID: ${req.user.id})`);
    }

    // Check if both parties have deleted and hard delete if so
    const hardDeleted = await Booking.hardDeleteIfBothDeleted(id);
    if (hardDeleted) {
      logger.info(`Booking ${id} hard deleted as both parties deleted it`);
    }

    // Send success response
    res.status(200).json({
      success: true,
      message: 'Booking deleted successfully'
    });

  } catch (error) {
    logger.error('Error in deleteBooking:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete booking'
    });
  }
};

export const getBookingStats = async (req, res) => {
  try {
    // Only admin can access stats
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: 'Access denied'
      });
    }

    const stats = await Booking.getStats();

    res.status(200).json({
      success: true,
      data: { stats }
    });

  } catch (error) {
    logger.error('Error in getBookingStats:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch booking stats'
    });
  }
};

export const getPriceEstimate = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: errors.array()
      });
    }

    const { truckId, pickupCity, destinationCity } = req.query;

    // Get the truck details
    const truck = await Truck.findById(truckId);
    if (!truck) {
      return res.status(404).json({
        success: false,
        error: 'Truck not found'
      });
    }

    // Calculate distance and price
    const distanceInfo = await distanceService.calculateDistance(pickupCity, destinationCity);
    const pricePerKm = truck.price_per_km;
    const totalPrice = distanceInfo.distance * pricePerKm;

    res.status(200).json({
      success: true,
      data: {
        distance: distanceInfo.distance,
        duration: distanceInfo.duration,
        route: distanceInfo.route,
        estimated: distanceInfo.estimated,
        price_per_km: pricePerKm,
        total_price: totalPrice
      }
    });

  } catch (error) {
    logger.error('Error in getPriceEstimate:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to calculate price estimate'
    });
  }
};

export const getRentalPriceEstimate = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: errors.array()
      });
    }

    const { truckId, startDatetime, endDatetime } = req.query;

    if (!startDatetime || !endDatetime) {
      return res.status(400).json({
        success: false,
        error: 'Start and end datetime are required'
      });
    }

    try {
      const priceInfo = await Booking.calculateRentalPrice(
        truckId,
        startDatetime,
        endDatetime
      );

      res.status(200).json({
        success: true,
        data: priceInfo
      });
    } catch (calculationError) {
      logger.error('Rental price calculation failed:', calculationError);
      res.status(400).json({
        success: false,
        error: calculationError.message || 'Failed to calculate rental price'
      });
    }

  } catch (error) {
    logger.error('Error in getRentalPriceEstimate:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to calculate rental price estimate'
    });
  }
};
