import React from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate, Link } from 'react-router-dom'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import { ToastProvider } from './contexts/ToastContext'
import { NotificationProvider } from './contexts/NotificationContext'
import ErrorBoundary from './components/common/ErrorBoundary'
import Navbar from './components/layout/Navbar'
import ProtectedRoute from './components/common/ProtectedRoute'
import Login from './components/auth/Login'
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

function App() {
  return (
    <ErrorBoundary>
      <ToastProvider>
        <AuthProvider>
          <NotificationProvider>
            <Router>
              <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
                <Navbar />
                <Routes>
                {/* Public Routes */}
                <Route path="/" element={<LandingPage />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<SignupForm />} />
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
                
                {/* Utility Routes */}
                <Route path="/unauthorized" element={<UnauthorizedPage />} />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </div>
          </Router>
          </NotificationProvider>
        </AuthProvider>
      </ToastProvider>
    </ErrorBoundary>
  );
}

const LandingPage = () => {
  const { user } = useAuth();
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center">
          <h1 className="text-4xl tracking-tight font-extrabold text-gray-900 sm:text-5xl md:text-6xl">
            <span className="block">Streamline Your</span>
            <span className="block text-blue-600">Logistics Operations</span>
          </h1>
          <p className="mt-3 max-w-md mx-auto text-base text-gray-500 sm:text-lg md:mt-5 md:text-xl md:max-w-3xl">
            Connect shippers with reliable truck providers. Manage bookings, track shipments, and grow your logistics business with our comprehensive platform.
          </p>
          <div className="mt-5 max-w-md mx-auto sm:flex sm:justify-center md:mt-8">
            <div className="rounded-md shadow">
              <Link
                to={user ? "/dashboard" : "/register"}
                className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 md:py-4 md:text-lg md:px-10"
              >
                {user ? 'Go to Dashboard' : 'Get Started'}
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </div>
            {!user && (
              <div className="mt-3 rounded-md shadow sm:mt-0 sm:ml-3">
                <Link
                  to="/login"
                  className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-blue-700 bg-white hover:bg-gray-50 md:py-4 md:text-lg md:px-10"
                >
                  Sign In
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Features */}
        <div className="mt-20">
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            <div className="text-center">
              <div className="flex items-center justify-center h-12 w-12 rounded-md bg-blue-500 text-white mx-auto">
                <Truck className="h-6 w-6" />
              </div>
              <h3 className="mt-6 text-lg font-medium text-gray-900">Fleet Management</h3>
              <p className="mt-2 text-base text-gray-500">
                Manage your truck fleet, drivers, and availability in one centralized platform.
              </p>
            </div>

            <div className="text-center">
              <div className="flex items-center justify-center h-12 w-12 rounded-md bg-blue-500 text-white mx-auto">
                <Shield className="h-6 w-6" />
              </div>
              <h3 className="mt-6 text-lg font-medium text-gray-900">Secure Transactions</h3>
              <p className="mt-2 text-base text-gray-500">
                Safe and secure booking process with document verification and admin oversight.
              </p>
            </div>

            <div className="text-center">
              <div className="flex items-center justify-center h-12 w-12 rounded-md bg-blue-500 text-white mx-auto">
                <Clock className="h-6 w-6" />
              </div>
              <h3 className="mt-6 text-lg font-medium text-gray-900">Real-time Tracking</h3>
              <p className="mt-2 text-base text-gray-500">
                Track your shipments in real-time with status updates and notifications.
              </p>
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
          className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
        >
          Go to Dashboard
        </Link>
      </div>
    </div>
  );
}

export default App;
