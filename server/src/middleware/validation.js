import { body, param, query, validationResult } from 'express-validator';

// User registration validation
export const validateRegister = [
  body('email')
    .isEmail()
    .withMessage('Please provide a valid email')
    .normalizeEmail(),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long'),
  body('role')
    .isIn(['customer', 'provider', 'admin'])
    .withMessage('Role must be customer, provider, or admin'),
  body('firstName')
    .trim()
    .isLength({ min: 1 })
    .withMessage('First name is required'),
  body('lastName')
    .trim()
    .isLength({ min: 1 })
    .withMessage('Last name is required'),
  body('phone')
    .optional({ checkFalsy: true })
    .matches(/^[+]?[\d\s\-\(\)]+$/)
    .withMessage('Please provide a valid phone number'),
  body('companyName')
    .optional()
    .trim()
    .isLength({ min: 2 })
    .withMessage('Company name must be at least 2 characters long'),
  body('businessType')
    .optional()
    .isIn(['individual', 'company'])
    .withMessage('Business type must be either individual or company'),
  body('industrySector')
    .optional()
    .trim(),
  body('businessPhone')
    .optional({ checkFalsy: true })
    .matches(/^[+]?[\d\s\-\(\)]+$/)
    .withMessage('Please provide a valid business phone number'),
  body('contactPersonName')
    .optional()
    .trim(),
  body('contactPersonPosition')
    .optional()
    .trim(),
  body('contactPersonEmail')
    .optional({ checkFalsy: true })
    .isEmail()
    .withMessage('Please provide a valid contact person email'),
  body('contactPersonPhone')
    .optional({ checkFalsy: true })
    .matches(/^[+]?[\d\s\-\(\)]+$/)
    .withMessage('Please provide a valid contact person phone number'),
  body('streetAddress')
    .optional()
    .trim(),
  body('city')
    .optional()
    .trim(),
  body('stateProvince')
    .optional()
    .trim(),
  body('postalCode')
    .optional()
    .trim(),
  body('country')
    .optional()
    .trim(),
  body('deliveryInstructions')
    .optional()
    .trim(),
  body('preferredPaymentMethods')
    .optional()
    .isArray()
    .withMessage('Preferred payment methods must be an array')
];

// Customer profile validation
export const validateCustomerProfile = [
  body('businessType')
    .isIn(['individual', 'company'])
    .withMessage('Business type must be either individual or company'),
  
  body('industrySector')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Industry sector cannot be empty if provided'),
  
  body('businessPhone')
    .optional({ checkFalsy: true })
    .matches(/^[+]?[\d\s\-\(\)]+$/)
    .withMessage('Please provide a valid business phone number'),
  
  body('contactPersonName')
    .optional()
    .trim()
    .isLength({ min: 2 })
    .withMessage('Contact person name must be at least 2 characters'),
  
  body('contactPersonPosition')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Contact person position cannot be empty if provided'),
  
  body('contactPersonEmail')
    .optional({ checkFalsy: true })
    .isEmail()
    .withMessage('Please provide a valid contact person email'),
  
  body('contactPersonPhone')
    .optional({ checkFalsy: true })
    .matches(/^[+]?[\d\s\-\(\)]+$/)
    .withMessage('Please provide a valid contact person phone number'),
  
  body('streetAddress')
    .trim()
    .notEmpty()
    .withMessage('Street address is required'),
  
  body('city')
    .trim()
    .notEmpty()
    .withMessage('City is required'),
  
  body('stateProvince')
    .trim()
    .notEmpty()
    .withMessage('State/Province is required'),
  
  body('postalCode')
    .trim()
    .notEmpty()
    .withMessage('Postal code is required'),
  
  body('country')
    .trim()
    .notEmpty()
    .withMessage('Country is required'),
  
  body('deliveryInstructions')
    .optional()
    .trim(),
  
  body('preferredPaymentMethods')
    .optional()
    .isArray()
    .withMessage('Preferred payment methods must be an array')
];

// Provider registration completion validation
export const validateProviderRegistration = [
  body('businessRegistrationNumber')
    .trim()
    .notEmpty()
    .withMessage('Business registration number is required'),
  
  body('taxIdentificationNumber')
    .trim()
    .notEmpty()
    .withMessage('Tax identification number is required'),
  
  body('vatNumber')
    .optional()
    .trim(),
  
  body('businessPhone')
    .trim()
    .notEmpty()
    .isMobilePhone()
    .withMessage('Valid business phone is required'),
  
  body('emergencyContactName')
    .trim()
    .notEmpty()
    .withMessage('Emergency contact name is required'),
  
  body('emergencyContactPhone')
    .trim()
    .notEmpty()
    .isMobilePhone()
    .withMessage('Valid emergency contact phone is required'),
  
  body('streetAddress')
    .trim()
    .notEmpty()
    .withMessage('Street address is required'),
  
  body('city')
    .trim()
    .notEmpty()
    .withMessage('City is required'),
  
  body('stateProvince')
    .trim()
    .notEmpty()
    .withMessage('State/Province is required'),
  
  body('postalCode')
    .trim()
    .notEmpty()
    .withMessage('Postal code is required'),
  
  body('country')
    .trim()
    .notEmpty()
    .withMessage('Country is required'),
  
  body('yearsInBusiness')
    .isInt({ min: 0 })
    .withMessage('Years in business must be a positive number'),
  
  body('businessDescription')
    .trim()
    .notEmpty()
    .isLength({ min: 50, max: 1000 })
    .withMessage('Business description must be between 50 and 1000 characters'),
  
  body('serviceAreas')
    .isArray({ min: 1 })
    .withMessage('At least one service area must be specified'),
  
  body('serviceAreas.*')
    .trim()
    .notEmpty()
    .withMessage('Service area cannot be empty')
];

// User login validation
export const validateLogin = [
  body('email')
    .isEmail()
    .withMessage('Please provide a valid email')
    .normalizeEmail(),
  body('password')
    .notEmpty()
    .withMessage('Password is required')
];

// Profile update validation
export const validateProfileUpdate = [
  body('firstName')
    .optional()
    .trim()
    .isLength({ min: 1 })
    .withMessage('First name cannot be empty'),
  body('lastName')
    .optional()
    .trim()
    .isLength({ min: 1 })
    .withMessage('Last name cannot be empty'),
  body('phone')
    .optional()
    .matches(/^[+]?[\d\s\-\(\)]+$/)
    .withMessage('Please provide a valid phone number')
];

// Truck creation/update validation
export const validateTruckCreate = [
  body('service_type')
    .optional()
    .isIn(['transport', 'rental'])
    .withMessage('Service type must be transport or rental'),
  body('truck_type')
    .custom((value, { req }) => {
      const serviceType = req.body.service_type || 'transport';
      
      // Transport service truck types
      const transportTypes = ['flatbed', 'container', 'refrigerated', 'tanker', 'box', 'other'];
      
      // Rental service equipment types
      const rentalTypes = ['excavator', 'crane', 'mobile_crane', 'tower_crane', 'bulldozer', 'loader', 'forklift', 'reach_truck', 'pallet_jack', 'dump_truck', 'concrete_mixer', 'other'];
      
      if (serviceType === 'transport') {
        if (!transportTypes.includes(value)) {
          throw new Error(`Invalid truck type for transport service. Must be one of: ${transportTypes.join(', ')}`);
        }
      } else if (serviceType === 'rental') {
        if (!rentalTypes.includes(value)) {
          throw new Error(`Invalid equipment type for rental service. Must be one of: ${rentalTypes.join(', ')}`);
        }
      } else {
        // Fallback for unknown service types - accept all types
        const allTypes = [...transportTypes, ...rentalTypes];
        if (!allTypes.includes(value)) {
          throw new Error('Invalid vehicle/equipment type');
        }
      }
      
      return true;
    })
    .withMessage('Invalid truck/equipment type'),
  body('license_plate')
    .trim()
    .isLength({ min: 1 })
    .withMessage('License plate is required'),
  body('capacity_weight')
    .toFloat()
    .isFloat({ min: 0.1 })
    .withMessage('Capacity weight must be a positive number'),
  body('capacity_volume')
    .optional()
    .toFloat()
    .isFloat({ min: 0 })
    .withMessage('Capacity volume must be a positive number'),
  body('pricing_type')
    .optional({ nullable: true })
    .custom((value, { req }) => {
      // For rental service, pricing_type should not be present/null
      if (req.body.service_type === 'rental') {
        if (value !== null && value !== undefined && value !== '') {
          throw new Error('Pricing type should not be set for rental service');
        }
        return true;
      }
      // For transport service, pricing_type is required
      if (req.body.service_type === 'transport' || !req.body.service_type) {
        if (!value || !['per_km', 'fixed'].includes(value)) {
          throw new Error('Pricing type must be per_km or fixed for transport service');
        }
      }
      return true;
    }),
  body('price_per_km')
    .if(body('pricing_type').equals('per_km'))
    .toFloat()
    .isFloat({ min: 0 })
    .withMessage('Price per km must be a positive number')
    .optional({ nullable: true }),
  body('fixed_price')
    .if(body('pricing_type').equals('fixed'))
    .toFloat()
    .isFloat({ min: 0 })
    .withMessage('Fixed price must be a positive number')
    .optional({ nullable: true }),
  body('year')
    .toInt()
    .isInt({ min: 1900, max: new Date().getFullYear() + 1 })
    .withMessage('Year must be between 1900 and ' + (new Date().getFullYear() + 1)),
  body('make')
    .trim()
    .isLength({ min: 1 })
    .withMessage('Make is required')
    .isLength({ max: 100 })
    .withMessage('Make must be less than 100 characters'),
  body('model')
    .trim()
    .isLength({ min: 1 })
    .withMessage('Model is required')
    .isLength({ max: 100 })
    .withMessage('Model must be less than 100 characters'),
  body('status')
    .optional()
    .isIn(['active', 'inactive', 'maintenance'])
    .withMessage('Status must be active, inactive, or maintenance'),
  // Rental equipment fields - only monthly rate is allowed
  body('hourly_rate')
    .custom((value, { req }) => {
      // For rental service, hourly rate should not be present
      if (req.body.service_type === 'rental' && value) {
        throw new Error('Hourly rate is not allowed for rental equipment. Only monthly rates are supported.');
      }
      return true;
    })
    .optional({ checkFalsy: true }),
  body('daily_rate')
    .custom((value, { req }) => {
      // For rental service, daily rate should not be present
      if (req.body.service_type === 'rental' && value) {
        throw new Error('Daily rate is not allowed for rental equipment. Only monthly rates are supported.');
      }
      return true;
    })
    .optional({ checkFalsy: true }),
  body('weekly_rate')
    .custom((value, { req }) => {
      // For rental service, weekly rate should not be present
      if (req.body.service_type === 'rental' && value) {
        throw new Error('Weekly rate is not allowed for rental equipment. Only monthly rates are supported.');
      }
      return true;
    })
    .optional({ checkFalsy: true }),
  body('monthly_rate')
    .custom((value, { req }) => {
      // For rental service, monthly rate is required
      if (req.body.service_type === 'rental') {
        if (!value || isNaN(value) || parseFloat(value) <= 0) {
          throw new Error('Monthly rate is required for rental equipment and must be a positive number');
        }
      }
      return true;
    })
    .optional({ checkFalsy: true })
    .toFloat()
    .isFloat({ min: 0 })
    .withMessage('Monthly rate must be a positive number'),
  body('work_location')
    .optional({ checkFalsy: true })
    .trim()
    .isLength({ max: 200 })
    .withMessage('Work location must be less than 200 characters'),
  // Driver information fields
  body('driver_name')
    .optional({ checkFalsy: true })
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Driver name must be between 2 and 100 characters'),
  body('driver_phone')
    .optional({ checkFalsy: true })
    .trim()
    .matches(/^[+]?[\d\s\-\(\)]+$/)
    .withMessage('Driver phone must be a valid phone number'),
  body('driver_license_number')
    .optional({ checkFalsy: true })
    .trim()
    .isLength({ max: 50 })
    .withMessage('Driver license number must be less than 50 characters'),
  body('existingImages')
    .optional()
    .custom((value) => {
      if (value) {
        try {
          JSON.parse(value);
          return true;
        } catch (e) {
          throw new Error('Invalid existing images format');
        }
      }
      return true;
    }),
  body('existingDocuments')
    .optional()
    .custom((value) => {
      if (value) {
        try {
          JSON.parse(value);
          return true;
        } catch (e) {
          throw new Error('Invalid existing documents format');
        }
      }
      return true;
    })
];

// Booking creation validation
export const validateBookingCreate = [
  body('truckId')
    .isUUID()
    .withMessage('Invalid truck ID'),
  body('service_type')
    .optional()
    .isIn(['transport', 'rental'])
    .withMessage('Service type must be transport or rental'),
  
  // Transport-specific validation (conditional) - using custom validation for better control
  body('pickupAddress')
    .custom((value, { req }) => {
      const serviceType = req.body.service_type || 'transport';
      if (serviceType === 'transport') {
        if (!value || value.trim().length === 0) {
          throw new Error('Pickup address is required for transport');
        }
      }
      return true;
    }),
  body('pickupCity')
    .custom((value, { req }) => {
      const serviceType = req.body.service_type || 'transport';
      if (serviceType === 'transport') {
        if (!value || value.trim().length === 0) {
          throw new Error('Pickup city is required for transport');
        }
      }
      return true;
    }),
  body('destinationAddress')
    .custom((value, { req }) => {
      const serviceType = req.body.service_type || 'transport';
      if (serviceType === 'transport') {
        if (!value || value.trim().length === 0) {
          throw new Error('Destination address is required for transport');
        }
      }
      return true;
    }),
  body('destinationCity')
    .custom((value, { req }) => {
      const serviceType = req.body.service_type || 'transport';
      if (serviceType === 'transport') {
        if (!value || value.trim().length === 0) {
          throw new Error('Destination city is required for transport');
        }
      }
      return true;
    }),
  body('pickupDate')
    .custom((value, { req }) => {
      const serviceType = req.body.service_type || 'transport';
      if (serviceType === 'transport') {
        if (!value) {
          throw new Error('Pickup date is required for transport');
        }
        // Validate date format
        const date = new Date(value);
        if (isNaN(date.getTime())) {
          throw new Error('Valid pickup date is required for transport');
        }
      }
      return true;
    }),
  body('cargoDescription')
    .custom((value, { req }) => {
      const serviceType = req.body.service_type || 'transport';
      if (serviceType === 'transport') {
        if (!value || value.trim().length === 0) {
          throw new Error('Cargo description is required for transport');
        }
      }
      return true;
    }),
  body('cargoWeight')
    .custom((value, { req }) => {
      const serviceType = req.body.service_type || 'transport';
      if (serviceType === 'transport') {
        const weight = parseFloat(value);
        if (!value || isNaN(weight) || weight <= 0) {
          throw new Error('Cargo weight must be a positive number for transport');
        }
      }
      return true;
    }),
  body('cargoVolume')
    .optional()
    .custom((value, { req }) => {
      if (value !== undefined && value !== null && value !== '') {
        const volume = parseFloat(value);
        if (isNaN(volume) || volume < 0) {
          throw new Error('Cargo volume must be a positive number');
        }
      }
      return true;
    }),
    
  // Rental-specific validation (conditional)
  body('rental_start_datetime')
    .custom((value, { req }) => {
      const serviceType = req.body.service_type || 'transport';
      if (serviceType === 'rental') {
        if (!value) {
          throw new Error('Rental start date and time is required for equipment rental');
        }
        // Validate ISO8601 format
        const date = new Date(value);
        if (isNaN(date.getTime())) {
          throw new Error('Valid rental start date and time is required for equipment rental');
        }
      }
      return true;
    }),
  body('rental_end_datetime')
    .custom((value, { req }) => {
      const serviceType = req.body.service_type || 'transport';
      if (serviceType === 'rental') {
        if (!value) {
          throw new Error('Rental end date and time is required for equipment rental');
        }
        // Validate ISO8601 format
        const date = new Date(value);
        if (isNaN(date.getTime())) {
          throw new Error('Valid rental end date and time is required for equipment rental');
        }
      }
      return true;
    }),
  body('work_address')
    .custom((value, { req }) => {
      const serviceType = req.body.service_type || 'transport';
      if (serviceType === 'rental') {
        if (!value || value.trim().length === 0) {
          throw new Error('Work address is required for equipment rental');
        }
      }
      return true;
    }),
  body('purpose_description')
    .custom((value, { req }) => {
      const serviceType = req.body.service_type || 'transport';
      if (serviceType === 'rental') {
        if (!value || value.trim().length === 0) {
          throw new Error('Purpose description is required for equipment rental');
        }
      }
      return true;
    }),
  body('operator_required')
    .optional()
    .isBoolean()
    .withMessage('Operator required must be true or false'),
    
  // Common optional fields
  body('notes')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Notes must be less than 1000 characters')
];

// Booking update validation (truckId is optional for updates)
export const validateBookingUpdate = [
  body('truckId')
    .optional()
    .isUUID()
    .withMessage('Invalid truck ID'),
  body('pickupAddress')
    .optional()
    .trim()
    .isLength({ min: 1 })
    .withMessage('Pickup address cannot be empty'),
  body('pickupCity')
    .optional()
    .trim()
    .isLength({ min: 1 })
    .withMessage('Pickup city cannot be empty'),
  body('destinationAddress')
    .optional()
    .trim()
    .isLength({ min: 1 })
    .withMessage('Destination address cannot be empty'),
  body('destinationCity')
    .optional()
    .trim()
    .isLength({ min: 1 })
    .withMessage('Destination city cannot be empty'),
  body('pickupDate')
    .optional()
    .isISO8601()
    .withMessage('Invalid pickup date format'),
  body('pickupTime')
    .optional()
    .matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
    .withMessage('Invalid time format (HH:MM)'),
  body('cargoDescription')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Cargo description must be less than 1000 characters'),
  body('cargoWeight')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Cargo weight must be a positive number'),
  body('cargoVolume')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Cargo volume must be a positive number')
];

// UUID parameter validation
export const validateUUID = [
  param('id')
    .isUUID()
    .withMessage('Invalid ID format')
];

// Document ID parameter validation
export const validateDocumentId = [
  param('documentId')
    .isUUID()
    .withMessage('Invalid document ID format')
];

// Truck ID parameter validation
export const validateTruckId = [
  param('truckId')
    .isUUID()
    .withMessage('Invalid truck ID format')
];

// Truck search validation
export const validateTruckSearch = [
  query('truckType')
    .optional()
    .custom((value, { req }) => {
      const serviceType = req.query.serviceType || 'transport';
      
      // Transport service truck types
      const transportTypes = ['flatbed', 'container', 'refrigerated', 'tanker', 'box', 'other'];
      
      // Rental service equipment types
      const rentalTypes = ['excavator', 'crane', 'mobile_crane', 'tower_crane', 'bulldozer', 'loader', 'forklift', 'reach_truck', 'pallet_jack', 'dump_truck', 'concrete_mixer', 'other'];
      
      if (serviceType === 'transport') {
        if (!transportTypes.includes(value)) {
          throw new Error('Invalid truck type for transport service');
        }
      } else if (serviceType === 'rental') {
        if (!rentalTypes.includes(value)) {
          throw new Error('Invalid equipment type for rental service');
        }
      } else {
        // Fallback for unknown service types - accept all types
        const allTypes = [...transportTypes, ...rentalTypes];
        if (!allTypes.includes(value)) {
          throw new Error('Invalid vehicle/equipment type');
        }
      }
      
      return true;
    })
    .withMessage('Invalid truck/equipment type'),
  query('pickupCity')
    .optional()
    .trim()
    .isLength({ min: 1 })
    .withMessage('Pickup city cannot be empty'),
  query('destinationCity')
    .optional()
    .trim()
    .isLength({ min: 1 })
    .withMessage('Destination city cannot be empty'),
  query('minCapacity')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Minimum capacity must be a positive number'),
  query('maxPrice')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Maximum price must be a positive number'),
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100')
];

// Booking status update validation
export const validateBookingStatusUpdate = [
  body('status')
    .isIn(['pending_review', 'approved', 'confirmed', 'in_transit', 'active', 'completed', 'cancelled'])
    .withMessage('Invalid booking status'),
  body('notes')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Notes must be less than 500 characters')
];

// Profile creation/update validation
export const validateProfileCreate = [
  body('companyName')
    .optional()
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Company name must be between 1 and 100 characters'),
  body('businessLicense')
    .optional()
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('Business license must be between 1 and 50 characters'),
  body('address')
    .optional()
    .trim()
    .isLength({ min: 1, max: 200 })
    .withMessage('Address must be between 1 and 200 characters'),
  body('city')
    .optional()
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('City must be between 1 and 50 characters'),
  body('country')
    .optional()
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('Country must be between 1 and 50 characters'),
  body('postalCode')
    .optional()
    .trim()
    .isLength({ min: 1, max: 20 })
    .withMessage('Postal code must be between 1 and 20 characters')
];

// User status toggle validation
export const validateUserStatusToggle = [
  body('is_active')
    .isBoolean()
    .withMessage('is_active must be a boolean value')
];

// Provider verification validation
export const validateProviderVerification = [
  body('verification_status')
    .isIn(['approved', 'rejected'])
    .withMessage('Verification status must be either approved or rejected')
];

// Document upload validation
export const validateDocumentUpload = [
  body('entityType')
    .isIn(['provider', 'customer', 'booking', 'truck'])
    .withMessage('Invalid entity type'),
  body('entityId')
    .isUUID()
    .withMessage('Entity ID must be a valid UUID'),
  body('documentType')
    .isIn(['registration', 'technical_inspection', 'insurance', 'license', 'business_license', 'additional_docs'])
    .withMessage('Invalid document type')
];

// Document verification validation
export const validateDocumentVerification = [
  body('status')
    .isIn(['approved', 'rejected'])
    .withMessage('Status must be either approved or rejected'),
  body('notes')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Notes must be less than 500 characters')
];

// System notification validation
export const validateSystemNotification = [
  body('message')
    .trim()
    .isLength({ min: 1, max: 1000 })
    .withMessage('Message must be between 1 and 1000 characters'),
  body('priority')
    .optional()
    .isIn(['low', 'medium', 'high'])
    .withMessage('Priority must be low, medium, or high')
];

// General validation middleware to handle validation errors
export const validateRequest = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array()
    });
  }
  next();
};

// Forgot password validation
export const validateForgotPassword = [
  body('email')
    .isEmail()
    .withMessage('Please provide a valid email')
    .normalizeEmail()
];

// Reset password validation
export const validateResetPassword = [
  body('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters long'),
  param('token')
    .isLength({ min: 32 })
    .withMessage('Invalid reset token')
];
