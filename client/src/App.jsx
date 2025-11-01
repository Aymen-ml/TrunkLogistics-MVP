import React from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate, Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import { ToastProvider } from './contexts/ToastContext'
import { NotificationProvider } from './contexts/NotificationContext'
import { BookingProvider } from './contexts/BookingContext'
import ErrorBoundary from './components/common/ErrorBoundary'
import Navbar from './components/layout/Navbar'
import ProtectedRoute from './components/common/ProtectedRoute'
import PageTitleManager from './components/common/PageTitleManager'
import Login from './components/auth/Login'
import Register from './components/auth/Register'
import SignupForm from './components/auth/SignupForm'
import EmailVerification from './components/auth/EmailVerification'
import ForgotPassword from './components/auth/ForgotPassword'
import ResetPassword from './components/auth/ResetPassword'
import TruckList from './components/trucks/TruckList'
import TruckForm from './components/trucks/TruckForm'
import TruckDetail from './components/trucks/TruckDetail'
import TruckSearch from './components/trucks/TruckSearch'
import BookingList from './components/bookings/BookingList'
import BookingForm from './components/bookings/BookingForm'
import BookingDetail from './components/bookings/BookingDetail'
import BookingDetailTest from './components/bookings/BookingDetailTest'
import EditBooking from './components/bookings/EditBooking'
import DashboardRouter from './components/dashboard/DashboardRouter'
import ProviderVerification from './components/admin/ProviderVerification'
import UserManagement from './components/admin/UserManagement'
import DocumentVerification from './components/admin/DocumentVerification'
import BookingManagement from './components/admin/BookingManagement'
import AdminAnalytics from './components/admin/AdminAnalytics'
import ProviderAnalytics from './components/analytics/ProviderAnalytics'
import { Truck, ArrowRight, Shield, Clock } from 'lucide-react'
import TrucksAdmin from './components/admin/TrucksAdmin'
import Profile from './components/profile/Profile'
import Settings from './components/settings/Settings'
import EmailTest from './components/admin/EmailTest'
import LandingPage from './components/landing/LandingPage'
import AboutUs from './components/legal/AboutUs'
import PrivacyPolicy from './components/legal/PrivacyPolicy'
import TermsOfUse from './components/legal/TermsOfUse'
import { useState, useEffect } from 'react'

// Wrapper component to force re-render on language change
function AppContent() {
  const { i18n } = useTranslation();
  const [currentLang, setCurrentLang] = useState(i18n.language);
  
  // Listen to language changes for state update (reload handled by Settings component)
  useEffect(() => {
    const handleLanguageChange = (lng) => {
      console.log('Language changed event detected in App:', lng);
      setCurrentLang(lng);
    };
    
    i18n.on('languageChanged', handleLanguageChange);
    
    return () => {
      i18n.off('languageChanged', handleLanguageChange);
    };
  }, [i18n]);
  
  return (
    <div>
      <PageTitleManager />
      <Routes>
                {/* Public Routes */}
                <Route path="/" element={<LandingPage />} />
                <Route path="/about" element={<AboutUs />} />
                <Route path="/privacy" element={<PrivacyPolicy />} />
                <Route path="/terms" element={<TermsOfUse />} />
                
                {/* All other routes with Navbar */}
                <Route path="/*" element={
                  <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
                    <Navbar />
                    <Routes>
                      <Route path="/login" element={<Login />} />
                      <Route path="/register" element={<Register />} />
                      <Route path="/verify-email/:token" element={<EmailVerification />} />
                      <Route path="/forgot-password" element={<ForgotPassword />} />
                      <Route path="/reset-password/:token" element={<ResetPassword />} />
                
                {/* Dashboard Routes */}
                <Route path="/dashboard/*" element={
                  <ProtectedRoute>
                    <DashboardRouter />
                  </ProtectedRoute>
                } />
                
                {/* Truck Routes */}
                <Route path="/trucks" element={
                  <ProtectedRoute allowedRoles={['provider']}>
                    <TruckList />
                  </ProtectedRoute>
                } />
                <Route path="/trucks/new" element={
                  <ProtectedRoute allowedRoles={['provider']}>
                    <TruckForm />
                  </ProtectedRoute>
                } />
                <Route path="/trucks/:id" element={
                  <ProtectedRoute>
                    <TruckDetail />
                  </ProtectedRoute>
                } />
                <Route path="/trucks/:id/edit" element={
                  <ProtectedRoute allowedRoles={['provider']}>
                    <TruckForm />
                  </ProtectedRoute>
                } />
                
                {/* Booking Routes */}
                <Route path="/bookings" element={
                  <ProtectedRoute>
                    <BookingList />
                  </ProtectedRoute>
                } />
                <Route path="/bookings/new" element={
                  <ProtectedRoute allowedRoles={['customer']}>
                    <BookingForm />
                  </ProtectedRoute>
                } />
                <Route path="/bookings/:id" element={
                  <ProtectedRoute>
                    <BookingDetail />
                  </ProtectedRoute>
                } />
                <Route path="/bookings/:id/test" element={<BookingDetailTest />} />
                <Route path="/bookings/:id/edit" element={
                  <ProtectedRoute allowedRoles={['customer']}>
                    <EditBooking />
                  </ProtectedRoute>
                } />
                
                {/* Search Route */}
                <Route path="/find-trucks" element={
                  <ProtectedRoute allowedRoles={['customer']}>
                    <TruckSearch />
                  </ProtectedRoute>
                } />
                
                {/* Analytics Route */}
                <Route path="/analytics" element={
                  <ProtectedRoute allowedRoles={['provider']}>
                    <ProviderAnalytics />
                  </ProtectedRoute>
                } />
                
                {/* Admin Routes */}
                {/* Profile & Settings */}
                <Route path="/profile" element={
                  <ProtectedRoute>
                    <Profile />
                  </ProtectedRoute>
                } />
                <Route path="/settings" element={
                  <ProtectedRoute>
                    <Settings />
                  </ProtectedRoute>
                } />
                <Route path="/admin/providers" element={
                  <ProtectedRoute allowedRoles={['admin']}>
                    <ProviderVerification />
                  </ProtectedRoute>
                } />
                <Route path="/admin/users" element={
                  <ProtectedRoute allowedRoles={['admin']}>
                    <UserManagement />
                  </ProtectedRoute>
                } />
                <Route path="/admin/documents" element={
                  <ProtectedRoute allowedRoles={['admin']}>
                    <DocumentVerification />
                  </ProtectedRoute>
                } />
                <Route path="/admin/bookings" element={
                  <ProtectedRoute allowedRoles={['admin']}>
                    <BookingManagement />
                  </ProtectedRoute>
                } />
                <Route path="/admin/analytics" element={
                  <ProtectedRoute allowedRoles={['admin']}>
                    <AdminAnalytics />
                  </ProtectedRoute>
                } />
                <Route path="/admin/trucks" element={
                  <ProtectedRoute allowedRoles={['admin']}>
                    <TrucksAdmin />
                  </ProtectedRoute>
                } />
                <Route path="/admin/email-test" element={
                  <ProtectedRoute allowedRoles={['admin']}>
                    <EmailTest />
                  </ProtectedRoute>
                } />
                
                {/* 404 Route */}
                <Route path="/unauthorized" element={<UnauthorizedPage />} />
                {/* <Route path="*" element={<Navigate to="/" replace />} /> */}
                    </Routes>
                  </div>
                } />
              </Routes>
            </div>
          );
        }

function App() {
  return (
    <ErrorBoundary>
      <ToastProvider>
        <AuthProvider>
          <NotificationProvider>
            <BookingProvider>
              <Router>
                <AppContent />
              </Router>
            </BookingProvider>
          </NotificationProvider>
        </AuthProvider>
      </ToastProvider>
    </ErrorBoundary>
  );
}

const UnauthorizedPage = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900">Access Denied</h2>
        <p className="mt-2 text-gray-600">You don't have permission to access this page.</p>
        <Link
          to="/dashboard"
          className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-accent-500 hover:bg-accent-600 transition-colors"
        >
          Go to Dashboard
        </Link>
      </div>
    </div>
  );
}

export default App;
