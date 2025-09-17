import ProviderProfile from '../models/ProviderProfile.js';
import User from '../models/User.js';
import { query } from '../config/database.js';
import logger from '../utils/logger.js';

// Simplified document validation - just check if documents exist
const validateDocuments = async (provider) => {
  // For now, just check if basic required fields are present
  const requiredFields = ['business_license', 'business_phone'];
  const missingFields = requiredFields.filter(field => !provider[field]);
  
  if (missingFields.length > 0) {
    throw new Error(`Missing required fields: ${missingFields.join(', ')}`);
  }

  return true;
};

export const validateProvider = async (req, res) => {
  try {
    const { providerId } = req.params;
    const { verification_status, notes } = req.body;

    // Validate status
    if (!['approved', 'rejected'].includes(verification_status)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid verification status. Must be "approved" or "rejected"'
      });
    }

    // Check if provider exists
    const provider = await ProviderProfile.findById(providerId);
    if (!provider) {
      return res.status(404).json({
        success: false,
        error: 'Provider not found'
      });
    }

    // Update provider verification status using the existing method
    const updatedProvider = await ProviderProfile.setVerificationStatus(
      providerId,
      verification_status
    );

    logger.info(`Provider ${verification_status}: ${providerId} by admin ${req.user.email}`);

    res.json({
      success: true,
      message: `Provider ${verification_status} successfully`,
      data: {
        provider: updatedProvider
      }
    });
  } catch (error) {
    logger.error('Provider validation error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error while validating provider'
    });
  }
};

export const getPendingProviders = async (req, res) => {
  try {
    // Get all providers with their verification status
    const providers = await ProviderProfile.getAll({ verificationStatus: 'pending' });

    res.json({
      success: true,
      data: { providers }
    });
  } catch (error) {
    logger.error('Get pending providers error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error while fetching pending providers'
    });
  }
};