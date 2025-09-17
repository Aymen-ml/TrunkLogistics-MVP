export const BOOKING_STATUSES = {
  PENDING_REVIEW: 'pending_review',
  APPROVED: 'approved',
  IN_TRANSIT: 'in_transit',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled'
};

export const RENTAL_BOOKING_STATUSES = {
  PENDING_REVIEW: 'pending_review',
  APPROVED: 'approved',           // Equipment approved and reserved
  ACTIVE: 'active',              // Equipment picked up and in use
  COMPLETED: 'completed',        // Equipment returned and rental finished
  CANCELLED: 'cancelled'
};

export const TRUCK_STATUSES = {
  ACTIVE: 'active',
  INACTIVE: 'inactive',
  MAINTENANCE: 'maintenance'
};

export const DOCUMENT_VERIFICATION_STATUSES = {
  PENDING: 'pending',
  APPROVED: 'approved',
  REJECTED: 'rejected'
};

export const PROVIDER_VERIFICATION_STATUSES = {
  PENDING: 'pending',
  APPROVED: 'approved',
  REJECTED: 'rejected'
};

export default {
  BOOKING_STATUSES,
  RENTAL_BOOKING_STATUSES,
  TRUCK_STATUSES,
  DOCUMENT_VERIFICATION_STATUSES,
  PROVIDER_VERIFICATION_STATUSES
};
