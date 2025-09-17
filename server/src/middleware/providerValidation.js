import { ProviderProfile } from '../models/ProviderProfile.js';
import { ApiError } from '../utils/ApiError.js';

export const checkProviderValidation = async (req, res, next) => {
  try {
    // Skip validation check for admin users
    if (req.user.role === 'admin') {
      return next();
    }

    // Get provider profile for the current user
    const providerProfile = await ProviderProfile.findByUserId(req.user.id);
    
    if (!providerProfile) {
      throw new ApiError(404, 'Provider profile not found');
    }

    // Check if provider is validated
    if (!providerProfile.is_validated || providerProfile.validation_status !== 'approved') {
      throw new ApiError(403, 'Your provider account is pending validation or has been rejected. Please contact support for more information.');
    }

    // Add provider profile to request for use in subsequent middleware/controllers
    req.providerProfile = providerProfile;
    next();
  } catch (error) {
    next(error);
  }
};