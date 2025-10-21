import React from 'react';
import { useLocation } from 'react-router-dom';
import usePageTitle from '../../hooks/usePageTitle';

/**
 * Page title mapper - automatically sets page titles based on route
 */
const pageTitles = {
  '/': 'Home',
  '/login': 'Login',
  '/register': 'Sign Up',
  '/forgot-password': 'Forgot Password',
  '/reset-password': 'Reset Password',
  '/verify-email': 'Email Verification',
  
  // Dashboard
  '/dashboard': 'Dashboard',
  '/dashboard/customer': 'Customer Dashboard',
  '/dashboard/provider': 'Provider Dashboard',
  '/dashboard/admin': 'Admin Dashboard',
  
  // Bookings
  '/bookings': 'My Bookings',
  '/bookings/new': 'Create Booking',
  '/bookings/edit': 'Edit Booking',
  
  // Trucks
  '/trucks': 'Browse Trucks',
  '/trucks/search': 'Find Trucks',
  '/trucks/my-trucks': 'My Trucks',
  '/trucks/new': 'Add Truck',
  '/trucks/edit': 'Edit Truck',
  
  // Admin
  '/admin/users': 'User Management',
  '/admin/bookings': 'Booking Management',
  '/admin/providers': 'Provider Verification',
  '/admin/documents': 'Document Verification',
  '/admin/trucks': 'Truck Management',
  '/admin/analytics': 'Analytics',
  
  // Profile & Settings
  '/profile': 'My Profile',
  '/settings': 'Settings',
};

/**
 * Gets page title based on current route
 */
const getPageTitle = (pathname) => {
  // Exact match
  if (pageTitles[pathname]) {
    return pageTitles[pathname];
  }
  
  // Pattern matching for dynamic routes
  if (pathname.startsWith('/bookings/') && pathname.includes('/edit')) {
    return 'Edit Booking';
  }
  if (pathname.startsWith('/bookings/') && !pathname.includes('/new')) {
    return 'Booking Details';
  }
  if (pathname.startsWith('/trucks/') && pathname.includes('/edit')) {
    return 'Edit Truck';
  }
  if (pathname.startsWith('/trucks/') && !pathname.includes('/new') && !pathname.includes('/search')) {
    return 'Truck Details';
  }
  if (pathname.startsWith('/reset-password/')) {
    return 'Reset Password';
  }
  if (pathname.startsWith('/verify-email/')) {
    return 'Email Verification';
  }
  
  // Default
  return null;
};

/**
 * PageTitleManager - Automatically updates page titles based on route
 * Place this component in App.jsx to manage all page titles
 */
const PageTitleManager = () => {
  const location = useLocation();
  const title = getPageTitle(location.pathname);
  
  usePageTitle(title);
  
  return null; // This component doesn't render anything
};

export default PageTitleManager;
