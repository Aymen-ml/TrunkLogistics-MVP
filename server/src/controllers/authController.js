import User from '../models/User.js';
import CustomerProfile from '../models/CustomerProfile.js';
import ProviderProfile from '../models/ProviderProfile.js';
import { generateToken } from '../config/jwt.js';
import { validationResult } from 'express-validator';
import logger from '../utils/logger.js';
import EmailVerification from '../utils/emailVerification.js';
import notificationService from '../services/notificationService.js';
import PasswordReset from '../utils/passwordReset.js';
import emailService from '../services/emailService.js';
import bcrypt from 'bcryptjs';

export const register = async (req, res) => {
  try {
    logger.info('Registration attempt with data:', { 
      ...req.body,
      password: '[REDACTED]' // Don't log the password
    });

    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      logger.error('Registration validation failed:', errors.array());
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: errors.array()
      });
    }

    const { 
      email, 
      password, 
      role, 
      firstName, 
      lastName, 
      phone,
      businessType,
      companyName,
      industrySector,
      businessPhone,
      contactPersonName,
      contactPersonPosition,
      contactPersonEmail,
      contactPersonPhone,
      streetAddress,
      city,
      stateProvince,
      postalCode,
      country,
      deliveryInstructions,
      preferredPaymentMethods
    } = req.body;

    // Validate email format
    if (!await EmailVerification.isValidEmail(email)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid email format or domain'
      });
    }

    // Check for disposable email
    if (EmailVerification.isDisposableEmail(email)) {
      return res.status(400).json({
        success: false,
        error: 'Disposable or temporary email addresses are not allowed'
      });
    }

    // Check if user already exists
    const existingUser = await User.findByEmail(email);
    if (existingUser) {
      return res.status(400).json({
        success: false,
        error: 'User with this email already exists'
      });
    }

    // Create user
    const user = await User.create({
      email,
      password,
      role,
      firstName,
      lastName,
      phone
    });

    // Handle profile creation based on role
    if (role === 'customer') {
      try {
        await CustomerProfile.create({
          userId: user.id,
          businessType: businessType || 'individual',
          companyName: companyName || (businessType === 'company' ? `${firstName}'s Company` : ''),
          industrySector: industrySector || '',
          businessPhone: businessPhone || phone,
          contactPersonName: contactPersonName || '',
          contactPersonPosition: contactPersonPosition || '',
          contactPersonEmail: contactPersonEmail || '',
          contactPersonPhone: contactPersonPhone || '',
          streetAddress: streetAddress || '',
          city: city || '',
          stateProvince: stateProvince || '',
          postalCode: postalCode || '',
          deliveryInstructions: deliveryInstructions || '',
          preferredPaymentMethods: preferredPaymentMethods || []
        });
        logger.info(`Customer profile created for user: ${user.id}`);
      } catch (profileError) {
        logger.error('Error creating customer profile:', profileError);
        // Don't fail registration if profile creation fails
      }
    } else if (role === 'provider') {
      try {
        // Create complete provider profile
        const providerData = {
          userId: user.id,
          companyName: companyName || `${firstName}'s Transport Services`,
          businessType: businessType || 'individual',
          businessLicense: null,  // Will be uploaded later
          businessPhone: businessPhone || phone,
          industrySector: industrySector || '',
          contactPersonName: contactPersonName || '',
          contactPersonPosition: contactPersonPosition || '',
          contactPersonEmail: contactPersonEmail || '',
          contactPersonPhone: contactPersonPhone || '',
          streetAddress: streetAddress || '',
          city: city || '',
          stateProvince: stateProvince || '',
          postalCode: postalCode || '',
          deliveryInstructions: deliveryInstructions || '',
          preferredPaymentMethods: Array.isArray(preferredPaymentMethods) ? preferredPaymentMethods : []
        };

        // Log the sanitized data
        logger.info('Attempting to create provider profile:', {
          ...providerData,
          businessLicense: providerData.businessLicense ? 'PROVIDED' : 'NULL'
        });
        
        try {
          const profile = await ProviderProfile.create(providerData);
          logger.info(`Provider profile created successfully for user: ${user.id}`, { profileId: profile.id });
        } catch (dbError) {
          logger.error('Database error while creating provider profile:', {
            error: dbError.message,
            code: dbError.code,
            detail: dbError.detail,
            table: dbError.table,
            constraint: dbError.constraint
          });
          
          // Clean up the user since profile creation failed
          await User.delete(user.id);
          
          throw new Error(`Database error: ${dbError.message}`);
        }
      } catch (profileError) {
        logger.error('Provider profile creation failed:', profileError);
        
        return res.status(400).json({
          success: false,
          error: profileError.message
        });
      }
    }

    // Generate verification token and send email
    try {
      const verificationToken = await EmailVerification.createVerificationToken(user.id);
      await EmailVerification.sendVerificationEmail(user, verificationToken);
    } catch (emailError) {
      logger.error('Error sending verification email:', emailError);
      // Continue with registration even if email fails
    }

    // Generate JWT token
    const token = generateToken({
      id: user.id,
      email: user.email,
      role: user.role,
      emailVerified: false
    });

    logger.info(`New user registered: ${email} with role: ${role}`);

    // Send notifications
    try {
      // 1. Send welcome notification to the new user
      await notificationService.notifyWelcome(user.id);
      
      // 2. Notify admins about new user registration
      await notificationService.notifyAdminNewUserRegistration(user);
      
      logger.info(`✅ Registration notifications sent for user: ${email}`);
    } catch (notificationError) {
      logger.error('❌ Failed to send registration notifications:', notificationError);
      // Don't fail the registration if notifications fail
    }

    res.status(201).json({
      success: true,
      data: {
        user: {
          id: user.id,
          email: user.email,
          role: user.role,
          firstName: user.first_name,
          lastName: user.last_name,
          phone: user.phone,
          emailVerified: false
        },
        token
      },
      message: 'User registered successfully. Please check your email to verify your account.',
      emailVerificationRequired: true
    });
  } catch (error) {
    logger.error('Registration error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error during registration'
    });
  }
};

export const verifyEmail = async (req, res) => {
  try {
    const { token } = req.params;
    if (!token) {
      return res.status(400).json({
        success: false,
        error: 'Verification token is required'
      });
    }

    const userId = await EmailVerification.verifyEmail(token);
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    // Get provider profile if user is a provider to include verification status
    let isVerified = true; // Default for non-providers
    if (user.role === 'provider') {
      const ProviderProfile = (await import('../models/ProviderProfile.js')).default;
      const profile = await ProviderProfile.findByUserId(user.id);
      isVerified = profile?.is_verified || false;
    }

    // Generate new token with updated email verification status
    const newToken = generateToken({
      id: user.id,
      email: user.email,
      role: user.role,
      emailVerified: true,
      isVerified: isVerified
    });

    // Send email verification notification
    try {
      await notificationService.notifyEmailVerified(user.id, user.role);
      logger.info(`✅ Email verification notification sent to user: ${user.email}`);
    } catch (notificationError) {
      logger.error('❌ Failed to send email verification notification:', notificationError);
      // Don't fail the verification if notification fails
    }

    res.status(200).json({
      success: true,
      data: {
        user: {
          id: user.id,
          email: user.email,
          role: user.role,
          emailVerified: true,
          isVerified: isVerified
        },
        token: newToken
      },
      message: 'Email verified successfully'
    });
  } catch (error) {
    logger.error('Email verification error:', error);
    res.status(400).json({
      success: false,
      error: error.message || 'Email verification failed'
    });
  }
};

export const resendVerification = async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    if (user.email_verified) {
      return res.status(400).json({
        success: false,
        error: 'Email is already verified'
      });
    }

    const token = await EmailVerification.resendVerificationEmail(userId);
    await EmailVerification.sendVerificationEmail(user, token);

    res.status(200).json({
      success: true,
      message: 'Verification email sent successfully'
    });
  } catch (error) {
    logger.error('Error resending verification:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to resend verification email'
    });
  }
};

export const login = async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: errors.array()
      });
    }

    const { email, password } = req.body;

    // Find user by email
    const user = await User.findByEmail(email);
    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'Invalid credentials'
      });
    }

    // Check if user is active
    if (!user.is_active) {
      return res.status(401).json({
        success: false,
        error: 'Account is deactivated'
      });
    }

    // Verify password
    const isValidPassword = await User.verifyPassword(password, user.password_hash);
    if (!isValidPassword) {
      return res.status(401).json({
        success: false,
        error: 'Invalid credentials'
      });
    }

    // Get provider profile if user is a provider to include verification status
    let isVerified = true; // Default for non-providers
    if (user.role === 'provider') {
      const ProviderProfile = (await import('../models/ProviderProfile.js')).default;
      const profile = await ProviderProfile.findByUserId(user.id);
      isVerified = profile?.is_verified || false;
    }

    // Generate token for the authenticated user
    const token = generateToken({
      id: user.id,
      email: user.email,
      role: user.role,
      emailVerified: user.email_verified,
      isVerified: isVerified
    });

    logger.info(`User logged in: ${email}`);

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
          emailVerified: user.email_verified,
          isVerified: isVerified
        },
        token
      },
      message: 'Login successful'
    });
  } catch (error) {
    console.error('LOGIN ERROR DETAILS:', error);
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
    logger.error('Login error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error during login',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

export const getProfile = async (req, res) => {
  try {
    const user = req.user; // Set by authenticate middleware

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
          createdAt: user.created_at
        }
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
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: errors.array()
      });
    }

    const { firstName, lastName, phone } = req.body;
    const userId = req.user.id;

    const updatedUser = await User.updateProfile(userId, {
      first_name: firstName,
      last_name: lastName,
      phone
    });

    logger.info(`User profile updated: ${req.user.email}`);

    res.json({
      success: true,
      data: {
        user: {
          id: updatedUser.id,
          email: updatedUser.email,
          role: updatedUser.role,
          firstName: updatedUser.first_name,
          lastName: updatedUser.last_name,
          phone: updatedUser.phone
        }
      },
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

export const logout = async (req, res) => {
  try {
    // In a stateless JWT system, logout is handled client-side
    // But we can log the event for security purposes
    logger.info(`User logged out: ${req.user?.email || 'unknown'}`);

    res.json({
      success: true,
      message: 'Logged out successfully'
    });
  } catch (error) {
    logger.error('Logout error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error during logout'
    });
  }
};

export const updatePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ success: false, error: 'Current and new password are required' });
    }

    // Fetch full user to get password hash
    const userRecord = await (await import('../models/User.js')).default.findByEmail(req.user.email);
    if (!userRecord) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    const isValid = await User.verifyPassword(currentPassword, userRecord.password_hash);
    if (!isValid) {
      return res.status(400).json({ success: false, error: 'Current password is incorrect' });
    }

    if (newPassword.length < 8) {
      return res.status(400).json({ success: false, error: 'New password must be at least 8 characters' });
    }

    await User.updatePassword(req.user.id, newPassword);

    return res.json({ success: true, message: 'Password updated successfully' });
  } catch (error) {
    logger.error('Update password error:', error);
    return res.status(500).json({ success: false, error: 'Server error while updating password' });
  }
};

export const forgotPassword = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: errors.array()
      });
    }

    const { email } = req.body;

    // Find user by email
    const user = await User.findByEmail(email);
    if (!user) {
      // Don't reveal if email exists or not for security
      return res.json({
        success: true,
        message: 'If an account with that email exists, we have sent a password reset link.'
      });
    }

    // Check if user has recent reset request (prevent spam)
    const hasRecentRequest = await PasswordReset.hasRecentResetRequest(user.id, 5);
    if (hasRecentRequest) {
      return res.status(429).json({
        success: false,
        error: 'Password reset already requested recently. Please wait 5 minutes before requesting again.'
      });
    }

    // Create reset token
    const resetToken = await PasswordReset.createResetToken(user.id);

    // Send reset email
    const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
    const resetUrl = `${clientUrl}/reset-password/${resetToken.token}`;
    await emailService.sendPasswordResetEmail(user.email, user.first_name || 'User', resetUrl);

    logger.info(`Password reset email sent to: ${email}`);

    res.json({
      success: true,
      message: 'If an account with that email exists, we have sent a password reset link.'
    });

  } catch (error) {
    logger.error('Forgot password error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error while processing password reset request'
    });
  }
};

export const resetPassword = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: errors.array()
      });
    }

    const { token } = req.params;
    const { password } = req.body;

    // Verify token
    const tokenData = await PasswordReset.verifyToken(token);

    // Validate password strength
    if (password.length < 8) {
      return res.status(400).json({
        success: false,
        error: 'Password must be at least 8 characters long'
      });
    }

    // Update user password
    await User.updatePassword(tokenData.user_id, password);

    // Mark token as used
    await PasswordReset.markTokenAsUsed(token);

    // Send notification to user
    try {
      await notificationService.notifyPasswordReset(tokenData.user_id);
    } catch (notificationError) {
      logger.warn('Failed to send password reset notification:', notificationError);
    }

    logger.info(`Password reset completed for user: ${tokenData.email}`);

    res.json({
      success: true,
      message: 'Password has been reset successfully. You can now login with your new password.'
    });

  } catch (error) {
    logger.error('Reset password error:', error);
    
    if (error.message.includes('Invalid or expired')) {
      return res.status(400).json({
        success: false,
        error: 'Invalid or expired reset token. Please request a new password reset.'
      });
    }

    res.status(500).json({
      success: false,
      error: 'Server error while resetting password'
    });
  }
};
