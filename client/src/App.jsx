import React from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate, Link } from 'react-router-dom'
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
import { Truck, ArrowRight, Shield, Clock } from 'lucide-react'
import TrucksAdmin from './components/admin/TrucksAdmin'
import Profile from './components/profile/Profile'
import Settings from './components/settings/Settings'
import EmailTest from './components/admin/EmailTest'

function App() {
  return (
    <ErrorBoundary>
      <ToastProvider>
        <AuthProvider>
          <NotificationProvider>
            <BookingProvider>
              <Router>
              <PageTitleManager />
              <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
                <Navbar />
                <Routes>
                {/* Public Routes */}
                <Route path="/" element={<LandingPage />} />
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
            </Router>
          </BookingProvider>
        </NotificationProvider>
        </AuthProvider>
      </ToastProvider>
    </ErrorBoundary>
  );
}

const LandingPage = () => {
  const { user } = useAuth();
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-accent-50">
      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center">
          <div className="inline-flex items-center px-4 py-2 rounded-full bg-accent-100 text-accent-700 text-sm font-medium mb-4">
            <Shield className="h-4 w-4 mr-2" />
            Trusted Logistics Platform
          </div>
          <h1 className="text-4xl tracking-tight font-extrabold text-gray-900 sm:text-5xl md:text-6xl">
            <span className="block">Connect, Transport,</span>
            <span className="block text-primary-600">Grow Your Business</span>
          </h1>
          <p className="mt-3 max-w-md mx-auto text-base text-gray-600 sm:text-lg md:mt-5 md:text-xl md:max-w-3xl">
            TruckLogistics connects businesses with verified truck providers. Streamline bookings, track shipments in real-time, and scale your logistics operations with confidence.
          </p>
          <div className="mt-5 max-w-md mx-auto sm:flex sm:justify-center md:mt-8">
            <div className="rounded-md shadow">
              <Link
                to={user ? "/dashboard" : "/register"}
                className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-accent-500 hover:bg-accent-600 transition-colors md:py-4 md:text-lg md:px-10"
              >
                {user ? 'Go to Dashboard' : 'Get Started'}
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </div>
            {!user && (
              <div className="mt-3 rounded-md shadow sm:mt-0 sm:ml-3">
                <Link
                  to="/login"
                  className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-primary-600 bg-white hover:bg-gray-50 transition-colors md:py-4 md:text-lg md:px-10"
                >
                  Sign In
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Features */}
        <div className="mt-20">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
              Everything You Need for Logistics Success
            </h2>
            <p className="mt-4 text-lg text-gray-600">
              Powerful features designed for modern businesses
            </p>
          </div>
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            <div className="text-center bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow border border-gray-100">
              <div className="flex items-center justify-center h-14 w-14 rounded-lg bg-primary-600 text-white mx-auto">
                <Truck className="h-7 w-7" />
              </div>
              <h3 className="mt-6 text-lg font-semibold text-gray-900">Smart Fleet Management</h3>
              <p className="mt-3 text-base text-gray-600">
                Monitor availability, manage drivers, and optimize your fleet utilization with intelligent scheduling.
              </p>
            </div>

            <div className="text-center bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow border border-gray-100">
              <div className="flex items-center justify-center h-14 w-14 rounded-lg bg-primary-600 text-white mx-auto">
                <Shield className="h-7 w-7" />
              </div>
              <h3 className="mt-6 text-lg font-semibold text-gray-900">Verified & Secure</h3>
              <p className="mt-3 text-base text-gray-600">
                All providers undergo background checks and document verification for your peace of mind.
              </p>
            </div>

            <div className="text-center bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow border border-gray-100">
              <div className="flex items-center justify-center h-14 w-14 rounded-lg bg-accent-500 text-white mx-auto">
                <Clock className="h-7 w-7" />
              </div>
              <h3 className="mt-6 text-lg font-semibold text-gray-900">Real-Time Tracking</h3>
              <p className="mt-3 text-base text-gray-600">
                Track every shipment with live updates, instant notifications, and complete transparency.
              </p>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="mt-24 bg-gradient-to-r from-primary-600 to-primary-700 rounded-2xl shadow-xl overflow-hidden">
          <div className="px-6 py-12 sm:px-12 sm:py-16 text-center">
            <h2 className="text-3xl font-extrabold text-white sm:text-4xl">
              Ready to Transform Your Logistics?
            </h2>
            <p className="mt-4 text-lg text-primary-100">
              Start managing your logistics operations today
            </p>
            <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/register"
                className="inline-flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-primary-700 bg-white hover:bg-gray-50 transition-colors"
              >
                Get Started
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
              <Link
                to="/login"
                className="inline-flex items-center justify-center px-8 py-3 border-2 border-white text-base font-medium rounded-md text-white hover:bg-primary-500 transition-colors"
              >
                Sign In
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
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
