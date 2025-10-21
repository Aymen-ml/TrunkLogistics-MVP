import Notification from '../models/Notification.js';
import emailService from './emailService.js';
import User from '../models/User.js';
import logger from '../utils/logger.js';

class NotificationService {
  // Create notification and optionally send email
  async createNotification(notificationData, sendEmail = true) {
    try {
      const notification = await Notification.create(notificationData);

      if (sendEmail) {
        // Get user details for email
        const user = await User.findById(notificationData.userId);
        if (user && user.email) {
          await this.sendNotificationEmail(user, notification);
        }
      }

      return notification;
    } catch (error) {
      logger.error('Error creating notification:', error);
      throw error;
    }
  }

  // Notify a provider about a new booking
  async notifyProvider(providerId, notificationData) {
    try {
      const notification = await this.createNotification({
        userId: providerId,
        type: notificationData.type,
        message: notificationData.message,
        data: {
          bookingId: notificationData.booking_id
        },
        status: 'unread'
      });
      return notification;
    } catch (error) {
      logger.error('Error notifying provider:', error);
      // Don't throw the error as this is not critical for booking creation
      return null;
    }
  }

  // Send notification email based on type
  async sendNotificationEmail(user, notification) {
    try {
      const userName = `${user.first_name} ${user.last_name}`;
      
      switch (notification.type) {
        case 'booking_status':
          await this.handleBookingStatusEmail(user.email, userName, notification);
          break;
        case 'document_verification':
          await this.handleDocumentVerificationEmail(user.email, userName, notification);
          break;
        case 'provider_verification':
          await this.handleProviderVerificationEmail(user.email, userName, notification);
          break;
        case 'welcome':
          await emailService.sendWelcomeEmail(user.email, userName, user.role);
          break;
        default:
          // Generic notification email
          await this.sendGenericNotificationEmail(user.email, userName, notification);
      }
    } catch (error) {
      logger.error('Error sending notification email:', error);
    }
  }

  async handleBookingStatusEmail(userEmail, userName, notification) {
    // Parse booking data from notification message or fetch from database
    const bookingId = notification.related_entity_id;
    if (bookingId) {
      const Booking = (await import('../models/Booking.js')).default;
      const booking = await Booking.findById(bookingId);
      
      if (booking) {
        // Extract old and new status from notification title/message
        const statusMatch = notification.message.match(/from (\w+) to (\w+)/);
        const oldStatus = statusMatch ? statusMatch[1] : 'unknown';
        const newStatus = statusMatch ? statusMatch[2] : booking.status;
        
        await emailService.sendBookingStatusUpdateEmail(
          userEmail, userName, booking, oldStatus, newStatus
        );
      }
    }
  }

  async handleDocumentVerificationEmail(userEmail, userName, notification) {
    const documentId = notification.related_entity_id;
    if (documentId) {
      const Document = (await import('../models/Document.js')).default;
      const document = await Document.findById(documentId);
      
      if (document) {
        const status = notification.message.includes('approved') ? 'approved' : 'rejected';
        await emailService.sendDocumentVerificationEmail(
          userEmail, userName, document, status
        );
      }
    }
  }

  async handleProviderVerificationEmail(userEmail, userName, notification) {
    const status = notification.message.includes('approved') ? 'approved' : 'rejected';
    await emailService.sendProviderVerificationEmail(userEmail, userName, status);
  }

  async sendGenericNotificationEmail(userEmail, userName, notification) {
    const subject = notification.title;
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2563eb;">${notification.title}</h2>
        <p>Dear ${userName},</p>
        <p>${notification.message}</p>
        <p>Best regards,<br>TruckLogistics Team</p>
      </div>
    `;

    await emailService.sendEmail(userEmail, subject, html);
  }

  // Booking-related notifications
  async notifyBookingCreated(customerId, booking) {
    return await this.createNotification({
      userId: customerId,
      type: 'booking_status',
      title: 'Booking Request Created',
      message: `Your booking request for ${booking.pickup_city} → ${booking.destination_city} has been created and is pending review.`,
      relatedEntityType: 'booking',
      relatedEntityId: booking.id,
      priority: 'medium'
    });
  }

  async notifyBookingStatusChange(userId, booking, oldStatus, newStatus, notes = null, userRole = null, changedByName = null, changedByRole = null) {
    const statusMessages = {
      customer: {
        approved: 'Your booking has been approved and is ready for pickup.',
        confirmed: 'Your booking has been confirmed by the provider.',
        in_transit: 'Your cargo is now in transit.',
        completed: 'Your booking has been completed successfully.',
        cancelled: 'Your booking has been cancelled.',
        rejected: 'Your booking has been rejected.'
      },
      provider: {
        approved: 'Booking has been approved and assigned to your truck.',
        confirmed: 'You have confirmed the booking.',
        in_transit: 'Booking is now in transit.',
        completed: 'Booking has been completed.',
        cancelled: 'Booking has been cancelled.',
        rejected: 'Booking has been rejected.'
      }
    };

    const roleMessages = statusMessages[userRole] || statusMessages.customer;
    let message = `Booking #${booking.id?.slice(0, 8)} status changed from "${oldStatus}" to "${newStatus}". ${roleMessages[newStatus] || ''}`;
    
    // Add who made the change based on their role
    if (changedByName && changedByRole) {
      const roleLabels = {
        admin: 'admin',
        provider: 'provider',
        customer: 'customer'
      };
      const roleLabel = roleLabels[changedByRole] || changedByRole;
      message += ` Changed by ${roleLabel}: ${changedByName}.`;
    }
    
    if (notes) {
      message += ` Reason: ${notes}`;
    }

    return await this.createNotification({
      userId,
      type: 'booking_status',
      title: `Booking ${newStatus.charAt(0).toUpperCase() + newStatus.slice(1)}`,
      message,
      relatedEntityType: 'booking',
      relatedEntityId: booking.id,
      priority: ['cancelled', 'rejected'].includes(newStatus) ? 'high' : 'medium'
    });
  }

  async notifyAdminBookingStatusChanged(booking, oldStatus, newStatus, notes, customerUser, providerUser, changedByName = '', changedByRole = '') {
    const customerName = `${customerUser.first_name} ${customerUser.last_name}`.trim() || customerUser.email;
    const providerName = `${providerUser.first_name} ${providerUser.last_name}`.trim() || providerUser.email;
    
    let message = `Booking #${booking.id?.slice(0, 8)} status changed from "${oldStatus.replace('_', ' ')}" to "${newStatus.replace('_', ' ')}"`;
    
    // Add who made the change
    if (changedByName && changedByRole) {
      const roleLabel = changedByRole === 'admin' ? 'Admin' : changedByRole === 'provider' ? 'Provider' : 'Customer';
      message += ` by ${roleLabel} ${changedByName}`;
    }
    
    message += `. Customer: ${customerName}, Provider: ${providerName}`;
    
    if (notes) {
      message += `. Reason: ${notes}`;
    }

    // Get all admin users
    const admins = await User.getAll({ role: 'admin' });
    
    const notifications = admins.map(admin => ({
      userId: admin.id,
      type: 'admin_alert',
      title: 'Booking Status Updated',
      message,
      relatedEntityType: 'booking',
      relatedEntityId: booking.id,
      priority: 'low'
    }));

    if (notifications.length > 0) {
      return await Notification.createBulk(notifications);
    }
    return [];
  }

  // Document-related notifications
  async notifyDocumentUploaded(userId, document) {
    return await this.createNotification({
      userId,
      type: 'document_upload',
      title: 'Document Uploaded',
      message: `Your document "${document.original_name}" has been uploaded and is pending verification.`,
      relatedEntityType: 'document',
      relatedEntityId: document.id,
      priority: 'low'
    }, false); // Don't send email for uploads
  }

  async notifyDocumentVerified(userId, document, status, notes = null) {
    let message = `Your document "${document.original_name}" has been ${status}.`;
    if (notes) {
      message += ` Notes: ${notes}`;
    }

    return await this.createNotification({
      userId,
      type: 'document_verification',
      title: `Document ${status.charAt(0).toUpperCase() + status.slice(1)}`,
      message,
      relatedEntityType: 'document',
      relatedEntityId: document.id,
      priority: status === 'rejected' ? 'high' : 'medium'
    });
  }

  // Provider-related notifications
  async notifyProviderVerified(userId, status) {
    const message = status === 'approved' 
      ? 'Congratulations! Your provider account has been approved. You can now add trucks and receive bookings.'
      : 'Your provider account verification was not approved. Please contact support for more information.';

    return await this.createNotification({
      userId,
      type: 'provider_verification',
      title: `Provider Account ${status.charAt(0).toUpperCase() + status.slice(1)}`,
      message,
      relatedEntityType: 'provider',
      relatedEntityId: userId,
      priority: 'high'
    });
  }

  // Admin notifications
  async notifyAdminNewBooking(booking, customerName) {
    // Get all admin users
    const admins = await User.getAll({ role: 'admin' });
    
    const notifications = admins.map(admin => ({
      userId: admin.id,
      type: 'admin_alert',
      title: 'New Booking Request',
      message: `New booking request from ${customerName} for ${booking.pickup_city} → ${booking.destination_city} requires review.`,
      relatedEntityType: 'booking',
      relatedEntityId: booking.id,
      priority: 'medium'
    }));

    if (notifications.length > 0) {
      return await Notification.createBulk(notifications);
    }
    return [];
  }

  async notifyAdminNewTruck(truck, providerUser) {
    // Get all admin users
    const admins = await User.getAll({ role: 'admin' });
    
    const providerName = `${providerUser.first_name} ${providerUser.last_name}`.trim() || providerUser.email;
    
    const notifications = admins.map(admin => ({
      userId: admin.id,
      type: 'admin_alert',
      title: 'New Truck Registration',
      message: `New ${truck.truck_type || 'truck'} (${truck.license_plate}) registered by ${providerName} requires review and verification.`,
      relatedEntityType: 'truck',
      relatedEntityId: truck.id,
      priority: 'medium'
    }));

    if (notifications.length > 0) {
      return await Notification.createBulk(notifications);
    }
    return [];
  }

  async notifyAdminDocumentUploaded(document, uploaderName) {
    // Get all admin users
    const admins = await User.getAll({ role: 'admin' });
    
    const notifications = admins.map(admin => ({
      userId: admin.id,
      type: 'admin_alert',
      title: 'Document Pending Verification',
      message: `New ${document.document_type} document uploaded by ${uploaderName} requires verification.`,
      relatedEntityType: 'document',
      relatedEntityId: document.id,
      priority: 'low'
    }));

    if (notifications.length > 0) {
      return await Notification.createBulk(notifications);
    }
    return [];
  }

  // Provider notifications
  async notifyProviderNewBooking(providerId, booking, customerName) {
    return await this.createNotification({
      userId: providerId,
      type: 'booking_request',
      title: 'New Booking Request',
      message: `New booking request from ${customerName} for your truck. Route: ${booking.pickup_city} → ${booking.destination_city}`,
      relatedEntityType: 'booking',
      relatedEntityId: booking.id,
      priority: 'medium'
    });
  }

  // System notifications
  async notifyWelcome(userId) {
    return await this.createNotification({
      userId,
      type: 'welcome',
      title: 'Welcome to TruckLogistics!',
      message: 'Welcome to TruckLogistics! Complete your profile to get started with our logistics platform.',
      relatedEntityType: 'user',
      relatedEntityId: userId,
      priority: 'medium'
    });
  }

  async notifySystemMaintenance(message, priority = 'medium') {
    // Get all active users
    const users = await User.getAll({ is_active: true });
    
    const notifications = users.map(user => ({
      userId: user.id,
      type: 'system',
      title: 'System Maintenance Notice',
      message,
      relatedEntityType: 'system',
      relatedEntityId: null,
      priority
    }));

    if (notifications.length > 0) {
      return await Notification.createBulk(notifications);
    }
    return [];
  }

  // Account lifecycle notifications
  async notifyAdminNewUserRegistration(user) {
    // Get all admin users
    const admins = await User.getAll({ role: 'admin' });
    
    const userName = `${user.first_name} ${user.last_name}`.trim() || user.email;
    const roleLabel = user.role === 'provider' ? 'Provider' : 'Customer';
    
    const notifications = admins.map(admin => ({
      userId: admin.id,
      type: 'admin_alert',
      title: `New ${roleLabel} Registration`,
      message: `New ${user.role} account registered: ${userName} (${user.email}). ${user.role === 'provider' ? 'Account requires verification.' : 'Account is active.'}`,
      relatedEntityType: 'user',
      relatedEntityId: user.id,
      priority: user.role === 'provider' ? 'medium' : 'low'
    }));

    if (notifications.length > 0) {
      return await Notification.createBulk(notifications);
    }
    return [];
  }

  async notifyEmailVerified(userId, userRole) {
    const roleMessages = {
      customer: 'Your email has been verified successfully! You can now create booking requests and access all customer features.',
      provider: 'Your email has been verified successfully! Next, please wait for admin approval to start adding trucks and receiving bookings.',
      admin: 'Your email has been verified successfully! You now have full access to the admin panel.'
    };

    const message = roleMessages[userRole] || 'Your email has been verified successfully!';

    return await this.createNotification({
      userId,
      type: 'system',
      title: 'Email Verified',
      message,
      relatedEntityType: 'user',
      relatedEntityId: userId,
      priority: 'medium'
    });
  }

  async notifyPasswordReset(userId) {
    return await this.createNotification({
      userId,
      type: 'system',
      title: 'Password Reset Successful',
      message: 'Your password has been successfully reset. If you did not request this change, please contact support immediately.',
      relatedEntityType: 'user',
      relatedEntityId: userId,
      priority: 'high'
    });
  }

  // Bulk operations
  async markAllAsReadForUser(userId) {
    return await Notification.markAllAsRead(userId);
  }

  async getUnreadCountForUser(userId) {
    return await Notification.getUnreadCount(userId);
  }

  async getUserNotifications(userId, options = {}) {
    return await Notification.findByUserId(userId, options);
  }

  // Cleanup old notifications
  async cleanupOldNotifications(daysOld = 90) {
    return await Notification.cleanupOldNotifications(daysOld);
  }
}

// Create singleton instance
const notificationService = new NotificationService();
export default notificationService;
