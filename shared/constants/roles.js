export const USER_ROLES = {
  CUSTOMER: 'customer',
  PROVIDER: 'provider',
  ADMIN: 'admin'
};

export const ROLE_PERMISSIONS = {
  [USER_ROLES.CUSTOMER]: [
    'view_own_bookings',
    'create_booking',
    'cancel_own_booking',
    'update_own_profile'
  ],
  [USER_ROLES.PROVIDER]: [
    'manage_own_trucks',
    'view_booking_requests',
    'confirm_bookings',
    'update_own_profile'
  ],
  [USER_ROLES.ADMIN]: [
    'manage_all_users',
    'manage_all_trucks',
    'manage_all_bookings',
    'view_analytics'
  ]
};

export default { USER_ROLES, ROLE_PERMISSIONS };
