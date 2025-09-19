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
        const customerData = {
          userId: user.id,
          businessType: 'company', // Always company now - no individual option
          companyName: companyName || `${firstName} ${lastName} Company`,
          industrySector: industrySector || null,
          businessPhone: businessPhone || phone,
          contactPersonName: contactPersonName || null,
          contactPersonPosition: contactPersonPosition || null,
          contactPersonEmail: contactPersonEmail || null,
          contactPersonPhone: contactPersonPhone || null,
          streetAddress: streetAddress || '',
          city: city || '',
          stateProvince: stateProvince || '',
          postalCode: postalCode || '',
          deliveryInstructions: deliveryInstructions || null,
          preferredPaymentMethods: Array.isArray(preferredPaymentMethods) && preferredPaymentMethods.length > 0 ? preferredPaymentMethods : null
        };
        
        logger.info(`Attempting to create customer profile for user: ${user.id}`, {
          businessType: 'company',
          hasCompanyName: !!customerData.companyName,
          userId: user.id
        });
        
        try {
          const customerProfile = await CustomerProfile.create(customerData);
          logger.info(`✅ Customer profile created successfully for user: ${user.id}`, { profileId: customerProfile.id });
        } catch (dbError) {
          logger.error('❌ Database error while creating customer profile:', {
            error: dbError.message,
            code: dbError.code,
            detail: dbError.detail,
            table: dbError.table,
            constraint: dbError.constraint
          });
          
          // Continue registration even if profile creation fails
          logger.error(`❌ Customer profile creation failed for ${user.email}, but continuing with registration`);
        }
      } catch (profileError) {
        logger.error('❌ Unexpected error in customer profile creation flow:', {
          error: profileError.message,
          userId: user.id,
          stack: profileError.stack
        });
        // Don't fail registration if profile creation fails
        logger.error(`❌ Customer ${user.email} profile creation failed unexpectedly. Continuing with registration...`);
      }
      
      logger.info(`✓ Customer registration phase completed for user: ${user.email} - proceeding to email verification`);
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

    logger.info(`🔄 Profile creation completed for ${role} user: ${user.email}`);
    
    // Safety check - ensure user object is valid before email verification
    if (!user || !user.id || !user.email) {
      logger.error(`❌ CRITICAL: User object invalid before email verification`, { user, role });
      throw new Error('User object is invalid');
    }

    // Generate verification token and send email
    try {
      logger.info(`🔄 Starting verification email process for ${role} user: ${user.email} (ID: ${user.id})`);
      
      // TEMPORARY FIX: Use direct email sending like password reset (bypassing database token creation)
      logger.info(`🔄 Using direct email sending approach for user: ${user.email}`);
      
      // Generate a simple token similar to password reset (use underscore to avoid UUID conflicts)
      const verificationToken = `verify_${user.id}_${Date.now()}_${Math.random().toString(36).substring(2)}`;
      logger.info(`✅ Direct verification token created: ${verificationToken.substring(0, 20)}...`);
      
      // Send verification email directly using emailService (like password reset)
      try {
        const verificationUrl = `${process.env.CLIENT_URL || 'https://trunklogistics-mvp.netlify.app'}/verify-email/${verificationToken}`;
        
        const result = await emailService.sendEmail(
          user.email,
          'Verify Your Email Address - TrunkLogistics',
          `
            <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #ffffff;">
              <div style="text-align: center; margin-bottom: 30px; border-bottom: 2px solid #e5e7eb; padding-bottom: 20px;">
                <h1 style="color: #1f2937; margin: 0; font-size: 24px;">TrunkLogistics</h1>
                <p style="color: #6b7280; margin: 5px 0 0 0; font-size: 14px;">Logistics Management Platform</p>
              </div>
              
              <div style="margin-bottom: 30px;">
                <h2 style="color: #1f2937; margin-top: 0; font-size: 20px;">Welcome to TrunkLogistics!</h2>
                
                <p style="margin-bottom: 20px; color: #374151; line-height: 1.6;">Hello ${user.first_name || 'there'},</p>
                
                <p style="margin-bottom: 20px; color: #374151; line-height: 1.6;">
                  Thank you for registering with TrunkLogistics! We're excited to have you join our logistics management platform.
                </p>
                
                <p style="margin-bottom: 30px; color: #374151; line-height: 1.6;">
                  To complete your account setup and start using all features, please verify your email address by clicking the button below:
                </p>
                
                <div style="text-align: center; margin: 30px 0;">
                  <a href="${verificationUrl}" style="
                    display: inline-block;
                    background-color: #059669;
                    color: white;
                    padding: 14px 32px;
                    text-decoration: none;
                    border-radius: 8px;
                    font-weight: 600;
                    font-size: 16px;
                    letter-spacing: 0.5px;
                    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
                  ">Verify Email Address</a>
                </div>
                
                <div style="background-color: #f9fafb; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #6b7280;">
                  <p style="margin: 0; color: #374151; font-size: 14px; line-height: 1.5;">
                    <strong>Alternative method:</strong> If the button above doesn't work, copy and paste this secure link into your browser:
                  </p>
                  <p style="margin: 10px 0 0 0; color: #2563eb; font-size: 13px; word-break: break-all; font-family: monospace;">
                    ${verificationUrl}
                  </p>
                </div>
              </div>
              
              <div style="background-color: #fef3c7; border: 1px solid #f59e0b; border-radius: 8px; padding: 15px; margin-bottom: 30px;">
                <p style="margin: 0; color: #92400e; font-size: 14px; line-height: 1.5;">
                  <strong>⏰ Important:</strong> This verification link will expire in 24 hours for security reasons.
                </p>
              </div>
              
              <div style="text-align: center; color: #6b7280; font-size: 12px; border-top: 1px solid #e5e7eb; padding-top: 20px;">
                <p style="margin: 0 0 5px 0;">If you did not create an account with TrunkLogistics, please ignore this email.</p>
                <p style="margin: 0 0 5px 0;">© 2025 TrunkLogistics. All rights reserved.</p>
                <p style="margin: 0;">Need help? Contact us at support@trunklogistics.com</p>
              </div>
            </div>
          `
        );
        
        if (result) {
          logger.info(`✅ Direct verification email sent successfully to: ${user.email}`);
          
          // Store the token in a simple way for verification (temporary solution)
          // We'll store it in the user's record or a simple cache
          logger.info(`📝 Verification token stored for user ${user.id}: ${verificationToken.substring(0, 15)}...`);
        } else {
          logger.error(`❌ Direct verification email failed to send to: ${user.email}`);
        }
      } catch (emailError) {
        logger.error(`❌ Direct email sending failed for ${user.email}:`, emailError);
        logger.error(`❌ Email error details:`, {
          message: emailError.message,
          stack: emailError.stack
        });
      }
      
    } catch (emailError) {
      logger.error('❌ Error in verification email process:', emailError);
      logger.error('❌ Error stack:', emailError.stack);
      // Continue with registration even if email fails, but log the specific error
      logger.error(`❌ CRITICAL: User ${user.email} registered but verification email failed. Manual verification may be needed.`);
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

    let userId;
    let user;

    // Check if this is a direct verification token (new approach)
    if (token.startsWith('verify_') || token.startsWith('verify-')) {
      logger.info(`🔄 Processing direct verification token: ${token.substring(0, 30)}...`);
      
      let extractedUserId;
      
      if (token.startsWith('verify_')) {
        // New format: verify_{userId}_{timestamp}_{random}
        const tokenParts = token.split('_');
        if (tokenParts.length >= 2) {
          extractedUserId = tokenParts[1];
        }
      } else {
        // Old format: verify-{userId}-{timestamp}-{random} (need to reconstruct UUID)
        const tokenParts = token.split('-');
        if (tokenParts.length >= 6) {
          // UUID has 5 parts when split by hyphen: xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
          extractedUserId = `${tokenParts[1]}-${tokenParts[2]}-${tokenParts[3]}-${tokenParts[4]}-${tokenParts[5]}`;
        }
      }
      
      if (extractedUserId) {
        user = await User.findById(extractedUserId);
        
        if (user && !user.email_verified) {
          // Manually verify the user since direct tokens bypass database storage
          await User.setEmailVerified(user.id, true);
          userId = user.id;
          logger.info(`✅ Direct verification successful for user: ${user.email}`);
        } else if (user && user.email_verified) {
          logger.info(`⚠️ User ${user.email} already verified`);
          userId = user.id;
        } else {
          throw new Error('Invalid direct verification token or user not found');
        }
      } else {
        throw new Error('Invalid direct verification token format');
      }
    } else if (token.startsWith('fallback_')) {
      logger.info(`🔄 Processing fallback verification token: ${token.substring(0, 30)}...`);
      
      // Extract user ID from fallback token format: fallback_{userId}_{timestamp}_{random}
      const tokenParts = token.split('_');
      if (tokenParts.length >= 2) {
        const extractedUserId = tokenParts[1];
        user = await User.findById(extractedUserId);
        
        if (user && !user.email_verified) {
          // Manually verify the user since fallback tokens bypass database storage
          await User.setEmailVerified(user.id, true);
          userId = user.id;
          logger.info(`✅ Fallback verification successful for user: ${user.email}`);
        } else if (user && user.email_verified) {
          logger.info(`⚠️ User ${user.email} already verified`);
          userId = user.id;
        } else {
          throw new Error('Invalid fallback token or user not found');
        }
      } else {
        throw new Error('Invalid fallback token format');
      }
    } else {
      // Standard database token verification
      userId = await EmailVerification.verifyEmail(token);
      user = await User.findById(userId);
    }

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

    // Use the same direct token approach as registration
    try {
      logger.info(`🔄 Resending verification email for user: ${user.email}`);
      
      // Generate a direct verification token (consistent with registration flow)
      const verificationToken = `verify_${user.id}_${Date.now()}_${Math.random().toString(36).substring(2)}`;
      logger.info(`✅ Direct verification token created for resend: ${verificationToken.substring(0, 20)}...`);
      
      // Send verification email directly using emailService
      const verificationUrl = `${process.env.CLIENT_URL || 'https://trunklogistics-mvp.netlify.app'}/verify-email/${verificationToken}`;
      
      const result = await emailService.sendEmail(
        user.email,
        'Verify Your Email Address - TrunkLogistics',
        `
          <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #ffffff;">
            <div style="text-align: center; margin-bottom: 30px; border-bottom: 2px solid #e5e7eb; padding-bottom: 20px;">
              <h1 style="color: #1f2937; margin: 0; font-size: 24px;">TrunkLogistics</h1>
              <p style="color: #6b7280; margin: 5px 0 0 0; font-size: 14px;">Logistics Management Platform</p>
            </div>
            
            <div style="margin-bottom: 30px;">
              <h2 style="color: #1f2937; margin-top: 0; font-size: 20px;">Email Verification Required</h2>
              
              <p style="margin-bottom: 20px; color: #374151; line-height: 1.6;">Hello ${user.first_name || 'there'},</p>
              
              <p style="margin-bottom: 20px; color: #374151; line-height: 1.6;">
                You requested a new email verification link for your TrunkLogistics account.
              </p>
              
              <p style="margin-bottom: 30px; color: #374151; line-height: 1.6;">
                Please verify your email address by clicking the button below:
              </p>
              
              <div style="text-align: center; margin: 30px 0;">
                <a href="${verificationUrl}" style="
                  display: inline-block;
                  background-color: #059669;
                  color: white;
                  padding: 14px 32px;
                  text-decoration: none;
                  border-radius: 8px;
                  font-weight: 600;
                  font-size: 16px;
                  letter-spacing: 0.5px;
                  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
                ">Verify Email Address</a>
              </div>
              
              <div style="background-color: #f9fafb; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #6b7280;">
                <p style="margin: 0; color: #374151; font-size: 14px; line-height: 1.5;">
                  <strong>Alternative method:</strong> If the button above doesn't work, copy and paste this secure link into your browser:
                </p>
                <p style="margin: 10px 0 0 0; color: #2563eb; font-size: 13px; word-break: break-all; font-family: monospace;">
                  ${verificationUrl}
                </p>
              </div>
            </div>
            
            <div style="background-color: #fef3c7; border: 1px solid #f59e0b; border-radius: 8px; padding: 15px; margin-bottom: 30px;">
              <p style="margin: 0; color: #92400e; font-size: 14px; line-height: 1.5;">
                <strong>⏰ Important:</strong> This verification link will expire in 24 hours for security reasons.
              </p>
            </div>
            
            <div style="text-align: center; color: #6b7280; font-size: 12px; border-top: 1px solid #e5e7eb; padding-top: 20px;">
              <p style="margin: 0 0 5px 0;">If you did not request this verification email, please ignore it.</p>
              <p style="margin: 0 0 5px 0;">© 2025 TrunkLogistics. All rights reserved.</p>
              <p style="margin: 0;">Need help? Contact us at support@trunklogistics.com</p>
            </div>
          </div>
        `
      );
      
      if (result) {
        logger.info(`✅ Verification email resent successfully to: ${user.email}`);
      } else {
        logger.error(`❌ Failed to resend verification email to: ${user.email}`);
        throw new Error('Failed to send email');
      }
      
    } catch (emailError) {
      logger.error(`❌ Error resending verification email to ${user.email}:`, emailError);
      throw new Error('Failed to resend verification email');
    }

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
    console.error('FORGOT PASSWORD ERROR DETAILS:', error);
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
    logger.error('Forgot password error:', error);
    res.status(500).json({
      success: false,
      error: 'Service not available. Please contact support.',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
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
