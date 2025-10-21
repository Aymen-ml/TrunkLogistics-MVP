import User from '../models/User.js';
import CustomerProfile from '../models/CustomerProfile.js';
import ProviderProfile from '../models/ProviderProfile.js';
import notificationService from '../services/notificationService.js';
import { validationResult } from 'express-validator';
import logger from '../utils/logger.js';

export const createProfile = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: errors.array()
      });
    }

    const userId = req.user.id;
    const userRole = req.user.role;

    // Check if profile already exists
    let existingProfile;
    if (userRole === 'customer') {
      existingProfile = await CustomerProfile.findByUserId(userId);
    } else if (userRole === 'provider') {
      existingProfile = await ProviderProfile.findByUserId(userId);
    }

    if (existingProfile) {
      return res.status(400).json({
        success: false,
        error: 'Profile already exists'
      });
    }

    const {
      companyName,
      businessLicense,
      address,
      city,
      country,
      postalCode
    } = req.body;

    let profile;
    if (userRole === 'customer') {
      profile = await CustomerProfile.create({
        userId,
        streetAddress: address,
        city,
        postalCode
      });
    } else if (userRole === 'provider') {
      if (!companyName || !address || !city) {
        return res.status(400).json({
          success: false,
          error: 'Company name, address, and city are required for providers'
        });
      }

      profile = await ProviderProfile.create({
        userId,
        companyName,
        businessLicense,
        address,
        city,
        country,
        postalCode
      });
    } else {
      return res.status(400).json({
        success: false,
        error: 'Admins do not need to create profiles'
      });
    }

    logger.info(`${userRole} profile created for user: ${req.user.email}`);

    res.status(201).json({
      success: true,
      data: { profile },
      message: 'Profile created successfully'
    });
  } catch (error) {
    logger.error('Create profile error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error while creating profile'
    });
  }
};

export const getProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const userRole = req.user.role;

    let profile;
    if (userRole === 'customer') {
      profile = await CustomerProfile.findByUserId(userId);
    } else if (userRole === 'provider') {
      profile = await ProviderProfile.findByUserId(userId);
    }

    res.json({
      success: true,
      data: {
        user: {
          id: req.user.id,
          email: req.user.email,
          role: req.user.role,
          firstName: req.user.first_name,
          lastName: req.user.last_name,
          phone: req.user.phone,
          isActive: req.user.is_active,
          emailVerified: req.user.email_verified,
          isVerified: req.user.role === 'provider' ? (profile?.is_verified || false) : true
        },
        profile
      }
    });
  } catch (error) {
    logger.error('Get profile error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error while fetching profile'
    });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: errors.array()
      });
    }

    const userId = req.user.id;
    const userRole = req.user.role;

    const {
      companyName,
      businessLicense,
      address,
      city,
      country,
      postalCode
    } = req.body;

    let profile;
    if (userRole === 'customer') {
      const existingProfile = await CustomerProfile.findByUserId(userId);
      if (!existingProfile) {
        return res.status(404).json({
          success: false,
          error: 'Customer profile not found'
        });
      }

      profile = await CustomerProfile.update(existingProfile.id, {
        address,
        city,
        postal_code: postalCode
      });
    } else if (userRole === 'provider') {
      const existingProfile = await ProviderProfile.findByUserId(userId);
      if (!existingProfile) {
        return res.status(404).json({
          success: false,
          error: 'Provider profile not found'
        });
      }

      profile = await ProviderProfile.update(existingProfile.id, {
        company_name: companyName,
        business_license: businessLicense,
        address,
        city,
        postal_code: postalCode
      });
    } else {
      return res.status(400).json({
        success: false,
        error: 'Admins do not have profiles to update'
      });
    }

    logger.info(`${userRole} profile updated for user: ${req.user.email}`);

    res.json({
      success: true,
      data: { profile },
      message: 'Profile updated successfully'
    });
  } catch (error) {
    logger.error('Update profile error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error while updating profile'
    });
  }
};

export const getAllUsers = async (req, res) => {
  try {
    // Only admins can view all users
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: 'Access denied'
      });
    }

    const { role, is_active } = req.query;
    const filters = {};

    if (role) filters.role = role;
    if (is_active !== undefined) filters.is_active = is_active === 'true';

    const users = await User.getAll(filters);

    // If filtering by provider role, add provider verification status
    if (role === 'provider') {
      const usersWithVerification = await Promise.all(
        users.map(async (user) => {
          const profile = await ProviderProfile.findByUserId(user.id);
          return {
            ...user,
            is_verified: profile?.is_verified || false,
            verification_status: profile?.verification_status || 'pending'
          };
        })
      );
      
      return res.json({
        success: true,
        data: { users: usersWithVerification }
      });
    }

    res.json({
      success: true,
      data: { users }
    });
  } catch (error) {
    logger.error('Get all users error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error while fetching users'
    });
  }
};

export const toggleUserStatus = async (req, res) => {
  try {
    // Only admins can activate/deactivate users
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: 'Access denied'
      });
    }

    const { id } = req.params;
    const { is_active } = req.body;

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    await User.setActive(id, is_active);

    logger.info(`User ${is_active ? 'activated' : 'deactivated'}: ${user.email} by admin ${req.user.email}`);

    res.json({
      success: true,
      message: `User ${is_active ? 'activated' : 'deactivated'} successfully`
    });
  } catch (error) {
    logger.error('Toggle user status error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error while updating user status'
    });
  }
};

export const deleteUser = async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ success: false, error: 'Access denied' });
    }
    const { id } = req.params;
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }
    await User.delete(id);
    res.json({ success: true, message: 'User deleted successfully' });
  } catch (error) {
    logger.error('Delete user error:', error);
    res.status(500).json({ success: false, error: 'Server error while deleting user' });
  }
};

export const getProviderDetails = async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: 'Access denied'
      });
    }

    const { id } = req.params;

    // Get user information
    const user = await User.findById(id);
    if (!user || user.role !== 'provider') {
      return res.status(404).json({
        success: false,
        error: 'Provider not found'
      });
    }

    // Get provider profile
    const profile = await ProviderProfile.findByUserId(id);

    res.json({
      success: true,
      data: {
        user: {
          id: user.id,
          email: user.email,
          role: user.role,
          firstName: user.first_name,
          lastName: user.last_name,
          phone: user.phone,
          isActive: user.is_active,
          emailVerified: user.email_verified,
          createdAt: user.created_at,
          updatedAt: user.updated_at,
          isVerified: profile?.is_verified || false
        },
        profile
      }
    });
  } catch (error) {
    logger.error('Get provider details error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error while fetching provider details'
    });
  }
};

export const verifyProvider = async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: 'Access denied'
      });
    }

    const { id } = req.params;
    const { verification_status } = req.body;

    if (!['approved', 'rejected'].includes(verification_status)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid verification status'
      });
    }

    const provider = await ProviderProfile.findByUserId(id);
    if (!provider) {
      return res.status(404).json({
        success: false,
        error: 'Provider not found'
      });
    }

    await ProviderProfile.setVerificationStatus(provider.id, verification_status, req.user.id);

    // Notify provider about verification result
    const providerUser = await User.findById(provider.user_id);
    if (providerUser) {
      try {
        await notificationService.notifyProviderVerified(providerUser.id, verification_status);
      } catch (notificationError) {
        logger.warn('Failed to send notification:', notificationError);
        // Continue with the verification even if notification fails
      }
    }

    logger.info(`Provider ${verification_status}: ${provider.company_name} by admin ${req.user.email}`);

    res.json({
      success: true,
      message: `Provider ${verification_status} successfully`
    });
  } catch (error) {
    logger.error('Verify provider error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error while verifying provider'
    });
  }
};

// Update user theme preference
export const updateThemePreference = async (req, res) => {
  try {
    const userId = req.user.id;
    const { theme } = req.body;

    // Validate theme value
    if (!theme || !['light', 'dark'].includes(theme)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid theme. Must be "light" or "dark"'
      });
    }

    // Update theme preference
    const updated = await User.updateThemePreference(userId, theme);
    
    if (!updated) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    logger.info(`Theme preference updated for user ${req.user.email}: ${theme}`);

    res.json({
      success: true,
      data: { theme },
      message: 'Theme preference updated successfully'
    });
  } catch (error) {
    logger.error('Update theme preference error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error while updating theme preference'
    });
  }
};

// Get user preferences (including theme)
export const getUserPreferences = async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    res.json({
      success: true,
      data: {
        theme: user.theme_preference || 'light',
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    logger.error('Get user preferences error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error while fetching preferences'
    });
  }
};
