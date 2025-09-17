// Utility functions for equipment rental calculations

/**
 * Calculate rental duration in hours and days
 * @param {string} startDatetime - ISO datetime string
 * @param {string} endDatetime - ISO datetime string
 * @returns {Object} Duration breakdown
 */
export const calculateRentalDuration = (startDatetime, endDatetime) => {
  if (!startDatetime || !endDatetime) {
    return { hours: 0, days: 0, weeks: 0, months: 0 };
  }

  const start = new Date(startDatetime);
  const end = new Date(endDatetime);
  
  if (end <= start) {
    return { hours: 0, days: 0, weeks: 0, months: 0 };
  }

  const durationMs = end.getTime() - start.getTime();
  const hours = Math.ceil(durationMs / (1000 * 60 * 60));
  const days = Math.ceil(durationMs / (1000 * 60 * 60 * 24));
  const weeks = Math.ceil(days / 7);
  const months = Math.ceil(days / 30);

  return { hours, days, weeks, months };
};

/**
 * Calculate rental price based on equipment rates and duration
 * @param {Object} equipment - Equipment with rental rates
 * @param {string} startDatetime - ISO datetime string
 * @param {string} endDatetime - ISO datetime string
 * @returns {Object} Price calculation result
 */
export const calculateRentalPrice = (equipment, startDatetime, endDatetime) => {
  const duration = calculateRentalDuration(startDatetime, endDatetime);
  
  if (duration.hours === 0) {
    return { 
      total_price: 0, 
      duration_hours: 0, 
      duration_days: 0,
      breakdown: null,
      rate_used: null
    };
  }

  const { monthly_rate } = equipment;
  
  let price = 0;
  let breakdown = {};
  let rateUsed = null;

  // Only monthly rates are available for rental equipment
  if (monthly_rate) {
    price = monthly_rate * duration.months;
    breakdown = {
      months: duration.months,
      monthly_rate: monthly_rate
    };
    rateUsed = 'monthly';
  } else {
    return {
      total_price: 0,
      duration_hours: duration.hours,
      duration_days: duration.days,
      breakdown: null,
      rate_used: null,
      error: 'No monthly rate available for this equipment'
    };
  }

  return {
    total_price: Math.round(price * 100) / 100, // Round to 2 decimal places
    duration_hours: duration.hours,
    duration_days: duration.days,
    breakdown,
    rate_used: rateUsed
  };
};

/**
 * Format duration for display
 * @param {number} hours - Duration in hours
 * @returns {string} Formatted duration string
 */
export const formatRentalDuration = (hours) => {
  if (hours < 24) {
    return `${hours} hour${hours !== 1 ? 's' : ''}`;
  } else if (hours < 168) { // Less than 1 week
    const days = Math.ceil(hours / 24);
    return `${days} day${days !== 1 ? 's' : ''}`;
  } else if (hours < 720) { // Less than 1 month (30 days)
    const weeks = Math.ceil(hours / 168);
    return `${weeks} week${weeks !== 1 ? 's' : ''}`;
  } else {
    const months = Math.ceil(hours / 720);
    return `${months} month${months !== 1 ? 's' : ''}`;
  }
};

/**
 * Get the minimum rental duration message based on available rates
 * @param {Object} equipment - Equipment with rental rates
 * @returns {string} Minimum duration message
 */
export const getMinimumRentalDuration = (equipment) => {
  const { monthly_rate } = equipment;
  
  if (monthly_rate) {
    return 'Minimum rental: 1 month';
  }
  
  return 'Contact provider for rental terms';
};

/**
 * Validate rental dates
 * @param {string} startDatetime - ISO datetime string
 * @param {string} endDatetime - ISO datetime string
 * @returns {Object} Validation result
 */
export const validateRentalDates = (startDatetime, endDatetime) => {
  const errors = {};
  
  if (!startDatetime) {
    errors.start = 'Start date and time is required';
  } else {
    const start = new Date(startDatetime);
    const now = new Date();
    
    if (start < now) {
      errors.start = 'Start date cannot be in the past';
    }
  }
  
  if (!endDatetime) {
    errors.end = 'End date and time is required';
  } else if (startDatetime) {
    const start = new Date(startDatetime);
    const end = new Date(endDatetime);
    
    if (end <= start) {
      errors.end = 'End date must be after start date';
    }
    
    // Check for minimum duration (1 month)
    const durationMs = end.getTime() - start.getTime();
    const days = durationMs / (1000 * 60 * 60 * 24);
    
    if (days < 30) {
      errors.end = 'Minimum rental duration is 1 month (30 days)';
    }
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

export default {
  calculateRentalDuration,
  calculateRentalPrice,
  formatRentalDuration,
  getMinimumRentalDuration,
  validateRentalDates
};
