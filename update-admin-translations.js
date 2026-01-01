// Script to update admin components with translations
// Run with: node update-admin-translations.js

const fs = require('fs');
const path = require('path');

const adminDir = path.join(__dirname, 'client/src/components/admin');

// BookingManagement.jsx translations
const bookingReplacements = [
  // Header
  {
    from: '<h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Booking Management</h1>',
    to: '<h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">{t(\'admin.bookingManagement.title\')}</h1>'
  },
  {
    from: 'Monitor and manage all platform bookings',
    to: '{t(\'admin.bookingManagement.subtitle\')}'
  },
  // Stats labels
  { from: '>Total</', to: '>{t(\'admin.bookingManagement.total\')}</' },
  { from: '>Approved</', to: '>{t(\'admin.bookingManagement.approved\')}</' },
  { from: '>In Transit</', to: '>{t(\'admin.bookingManagement.inTransit\')}</' },
  { from: '>Active</', to: '>{t(\'admin.bookingManagement.active\')}</' },
  { from: '>Completed</', to: '>{t(\'admin.bookingManagement.completed\')}</' },
  { from: '>Cancelled</', to: '>{t(\'admin.bookingManagement.cancelled\')}</' },
  { from: '>Pending Review</', to: '>{t(\'admin.bookingManagement.pendingReview\')}</' },
  // Service type badges
  { from: '\'Rental\'', to: 't(\'admin.bookingManagement.rental\')' },
  { from: '\'Transport\'', to: 't(\'admin.bookingManagement.transport\')' },
  // Messages
  { from: '`Booking status updated to ${newStatus.replace(\'_\', \' \').replace(/\\b\\w/g, l => l.toUpperCase())} successfully!`', to: 't(\'admin.bookingManagement.statusUpdated\')' },
  { from: '`Failed to update booking status: ${errorMessage}`', to: `t('admin.bookingManagement.errorUpdating') + ': ' + errorMessage` },
  { from: '`Please provide a reason for changing this booking to ${newStatus.replace(\'_\', \' \')}:`', to: `t('admin.bookingManagement.confirmReason') + ' ' + newStatus.replace('_', ' ') + ':'` }
];

console.log('✅ Admin translation replacements script created');
console.log('Note: Manual updates recommended for complex components');
