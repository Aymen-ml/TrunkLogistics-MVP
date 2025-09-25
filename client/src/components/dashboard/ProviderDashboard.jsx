import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import EmailVerificationBanner from '../common/EmailVerificationBanner';
import AdminApprovalBanner from '../common/AdminApprovalBanner';
import { useNavigate } from 'react-router-dom';
import { 
  Truck, 
  Package, 
  DollarSign, 
  Users, 
  Plus,
  AlertCircle,
  CheckCircle,
  Clock,
  TrendingUp,
  MapPin,
  Calendar,
  Settings,
  Activity,
  Wrench,
  Star,
  Target,
  BarChart3,
  PieChart,
  TrendingDown,
  Award,
  FileText,
  Bell
} from 'lucide-react';
import { apiClient } from '../../utils/apiClient';
import { VEHICLE_TYPE_LABELS } from '../../constants/truckTypes';

const ProviderDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalTrucks: 0,
    activeTrucks: 0,
    totalEquipment: 0,
    activeEquipment: 0,
    totalBookings: 0,
    activeBookings: 0,
    completedBookings: 0,
    totalRevenue: 0,
    // Enhanced metrics
    monthlyRevenue: 0,
    avgBookingValue: 0,
    fleetUtilization: 0,
    pendingBookings: 0,
    maintenanceAlerts: 0,
    customerRating: 0,
    transportRevenue: 0,
    rentalRevenue: 0,
    topPerformingVehicles: []
  });
  const [alerts, setAlerts] = useState([]);
  const [revenueData, setRevenueData] = useState([]);
  const [utilizationData, setUtilizationData] = useState([]);
  const [serviceFilter, setServiceFilter] = useState('all'); // all, transport, rental
  const [recentBookings, setRecentBookings] = useState([]);
  const [trucks, setTrucks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      // Fetch recent bookings, all bookings for stats, recent trucks, all trucks for stats  
      const [recentBookingsResponse, allBookingsResponse, recentTrucksResponse] = await Promise.all([
        apiClient.get('/bookings?limit=5'),
        apiClient.get('/bookings?limit=1000'), // Get all bookings for accurate stats
        apiClient.get('/trucks/my') // Get provider's own trucks
      ]);

      const recentBookings = recentBookingsResponse.data.data?.bookings || [];
      const allBookings = allBookingsResponse.data.data?.bookings || [];
      const allTrucks = recentTrucksResponse.data.data?.trucks || []; // This endpoint returns all provider trucks

      setRecentBookings(recentBookings);
      setTrucks(allTrucks); // Show all provider trucks, not limited to 5

      // Calculate stats from all data
      const transportTrucks = allTrucks.filter(t => t.service_type === 'transport' || !t.service_type);
      const equipmentTrucks = allTrucks.filter(t => t.service_type === 'rental');
      
      // Current date calculations
      const currentMonth = new Date().getMonth();
      const currentYear = new Date().getFullYear();
      const monthlyBookings = allBookings.filter(b => {
        const bookingDate = new Date(b.pickup_date);
        return bookingDate.getMonth() === currentMonth && bookingDate.getFullYear() === currentYear;
      });
      
      // Revenue calculations
      const completedBookings = allBookings.filter(b => b.status === 'completed');
      const totalRevenue = completedBookings.reduce((sum, b) => sum + (parseFloat(b.total_price) || 0), 0);
      const monthlyRevenue = monthlyBookings
        .filter(b => b.status === 'completed')
        .reduce((sum, b) => sum + (parseFloat(b.total_price) || 0), 0);
      
      // Transport vs Rental revenue
      const transportBookings = completedBookings.filter(b => !b.service_type || b.service_type === 'transport');
      const rentalBookings = completedBookings.filter(b => b.service_type === 'rental');
      const transportRevenue = transportBookings.reduce((sum, b) => sum + (parseFloat(b.total_price) || 0), 0);
      const rentalRevenue = rentalBookings.reduce((sum, b) => sum + (parseFloat(b.total_price) || 0), 0);
      
      // Fleet utilization (vehicles with active bookings)
      const vehiclesWithActiveBookings = allBookings
        .filter(b => {
          // For logistics: only 'in_transit' is truly active
          // For rental: 'active' status means equipment is being used
          if (b.service_type === 'rental') {
            return b.status === 'active';
          } else {
            // Transport/logistics bookings
            return b.status === 'in_transit';
          }
        })
        .map(b => b.truck_id)
        .filter((id, index, arr) => arr.indexOf(id) === index);
      const fleetUtilization = allTrucks.length > 0 
        ? Math.round((vehiclesWithActiveBookings.length / allTrucks.length) * 100)
        : 0;
      
      // Vehicle performance analysis
      const vehicleBookingCounts = {};
      const vehicleRevenue = {};
      completedBookings.forEach(booking => {
        if (booking.truck_id) {
          vehicleBookingCounts[booking.truck_id] = (vehicleBookingCounts[booking.truck_id] || 0) + 1;
          vehicleRevenue[booking.truck_id] = (vehicleRevenue[booking.truck_id] || 0) + (booking.total_price || 0);
        }
      });
      
      const topPerformingVehicles = Object.entries(vehicleBookingCounts)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 3)
        .map(([truckId, count]) => {
          const truck = allTrucks.find(t => t.id.toString() === truckId);
          return truck ? { 
            ...truck, 
            bookingCount: count,
            totalRevenue: vehicleRevenue[truckId] || 0
          } : null;
        })
        .filter(Boolean);
      
      // Alerts calculation
      const maintenanceAlerts = allTrucks.filter(t => t.status === 'maintenance').length;
      const upcomingAlerts = [];
      
      // Add maintenance alerts
      allTrucks.forEach(truck => {
        if (truck.status === 'maintenance') {
          upcomingAlerts.push({
            type: 'maintenance',
            message: `${truck.license_plate} is in maintenance`,
            priority: 'high',
            truck_id: truck.id
          });
        }
        if (truck.status === 'inactive') {
          upcomingAlerts.push({
            type: 'inactive',
            message: `${truck.license_plate} is inactive`,
            priority: 'medium',
            truck_id: truck.id
          });
        }
        if (truck.status === 'rented') {
          upcomingAlerts.push({
            type: 'rented',
            message: `${truck.license_plate} is currently rented`,
            priority: 'low',
            truck_id: truck.id
          });
        }
      });
      
      const stats = {
        totalTrucks: transportTrucks.length,
        activeTrucks: transportTrucks.filter(t => t.status === 'active').length,
        totalEquipment: equipmentTrucks.length,
        activeEquipment: equipmentTrucks.filter(t => t.status === 'active').length,
        totalBookings: allBookings.length,
        activeBookings: allBookings.filter(b => {
          if (b.service_type === 'rental') {
            return b.status === 'active';
          } else {
            return b.status === 'in_transit';
          }
        }).length,
        completedBookings: completedBookings.length,
        pendingBookings: allBookings.filter(b => b.status === 'pending_review').length,
        totalRevenue,
        monthlyRevenue,
        transportRevenue,
        rentalRevenue,
        avgBookingValue: completedBookings.length > 0 ? Math.round(totalRevenue / completedBookings.length) : 0,
        fleetUtilization,
        maintenanceAlerts,
        customerRating: 4.2, // This would come from a reviews API
        topPerformingVehicles
      };
      
      // Mock revenue trend data (in a real app, this would come from API)
      const revenueData = [
        { month: 'Jan', transport: 15000, rental: 8000 },
        { month: 'Feb', transport: 18000, rental: 9500 },
        { month: 'Mar', transport: 22000, rental: 11000 },
        { month: 'Apr', transport: 19000, rental: 12500 },
        { month: 'May', transport: 25000, rental: 14000 },
        { month: 'Jun', transport: 28000, rental: 15500 }
      ];
      
      setAlerts(upcomingAlerts);
      setRevenueData(revenueData);
      setUtilizationData([
        { name: 'Active', value: stats.activeBookings, color: '#10B981' },
        { name: 'Available', value: allTrucks.length - vehiclesWithActiveBookings.length, color: '#6B7280' }
      ]);
      setStats(stats);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      // Set empty data on error to prevent crashes
      setRecentBookings([]);
      setTrucks([]);
      setStats({
        totalTrucks: 0,
        activeTrucks: 0,
        totalEquipment: 0,
        activeEquipment: 0,
        totalBookings: 0,
        activeBookings: 0,
        completedBookings: 0,
        totalRevenue: 0
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending_review': return 'bg-yellow-100 text-yellow-800';
      case 'approved': return 'bg-blue-100 text-blue-800';
      case 'confirmed': return 'bg-green-100 text-green-800';
      case 'in_transit': return 'bg-purple-100 text-purple-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      case 'active': return 'bg-green-100 text-green-800';
      case 'inactive': return 'bg-gray-100 text-gray-800';
      case 'rented': return 'bg-blue-100 text-blue-800';
      case 'maintenance': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  // Add currency formatting function
  const formatCurrency = (amount) => {
    const numAmount = Number(amount);
    if (!amount || amount === 0 || isNaN(numAmount)) return '$0';
    
    // Show 2 decimal places only if there are cents
    if (numAmount % 1 === 0) {
      return `$${numAmount.toLocaleString()}`;
    } else {
      return `$${numAmount.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}`;
    }
  };

  // Add status formatting function
  const formatStatus = (status) => {
    if (!status) return 'Unknown';
    return status.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  const handleBookingAction = async (bookingId, action) => {
    try {
      const status = action === 'accept' ? 'approved' : 'cancelled';
      const notes = action === 'accept' ? 'Booking approved by provider' : 'Booking rejected by provider';
      
      const response = await apiClient.put(`/bookings/${bookingId}/status`, {
        status,
        notes
      });
      
      if (response.data.success) {
        // Update the specific booking in the local state immediately
        setDashboardData(prev => ({
          ...prev,
          recentBookings: prev.recentBookings.map(booking =>
            booking.id === bookingId ? { ...booking, status } : booking
          )
        }));
        
        // Also refresh full dashboard data for consistency
        fetchDashboardData();
      } else {
        throw new Error(response.data.error || 'Failed to update booking');
      }
    } catch (error) {
      console.error(`Error ${action}ing booking:`, error);
      const errorMessage = error.response?.data?.error || error.message || 'Unknown error';
      alert(`Failed to ${action} booking: ${errorMessage}`);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
        {/* Email Verification Banner */}
        <EmailVerificationBanner />
        
        {/* Admin Approval Banner */}
        <AdminApprovalBanner />
        
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
            Provider Dashboard
          </h1>
          <p className="mt-2 text-sm sm:text-base text-gray-600">
            Manage your fleet, bookings, and grow your logistics business.
          </p>
        </div>

        {/* Quick Actions */}
        <div className="mb-6 sm:mb-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Link
              to="/trucks"
              className="bg-white p-4 sm:p-6 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow group"
            >
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <Truck className="h-6 w-6 sm:h-8 sm:w-8 text-blue-600 group-hover:text-blue-700" />
                </div>
                <div className="ml-3 sm:ml-4">
                  <h3 className="text-base sm:text-lg font-medium text-gray-900">Manage Fleet</h3>
                  <p className="text-xs sm:text-sm text-gray-500">Add and manage trucks</p>
                </div>
              </div>
            </Link>

            <Link
              to="/bookings"
              className="bg-white p-4 sm:p-6 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow group"
            >
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <Package className="h-6 w-6 sm:h-8 sm:w-8 text-green-600 group-hover:text-green-700" />
                </div>
                <div className="ml-3 sm:ml-4">
                  <h3 className="text-base sm:text-lg font-medium text-gray-900">View Bookings</h3>
                  <p className="text-xs sm:text-sm text-gray-500">Manage your bookings</p>
                </div>
              </div>
            </Link>
          </div>
        </div>

        {/* Enhanced Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
          {/* Total Fleet */}
          <div className="bg-white overflow-hidden shadow-sm rounded-lg">
            <div className="p-4 lg:p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <Package className="h-6 w-6 lg:h-8 lg:w-8 text-gray-600" />
                </div>
                <div className="ml-3 lg:ml-4 w-0 flex-1">
                  <dl>
                    <dt className="text-xs lg:text-sm font-medium text-gray-500 truncate">
                      Total Fleet
                    </dt>
                    <dd className="text-xl lg:text-2xl font-semibold text-gray-900">
                      {stats.totalTrucks + stats.totalEquipment}
                    </dd>
                    <dd className="text-xs text-gray-500">
                      {stats.activeTrucks + stats.activeEquipment} active
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          {/* Logistics Fleet */}
          <div className="bg-white overflow-hidden shadow-sm rounded-lg">
            <div className="p-4 lg:p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <Truck className="h-6 w-6 lg:h-8 lg:w-8 text-blue-600" />
                </div>
                <div className="ml-3 lg:ml-4 w-0 flex-1">
                  <dl>
                    <dt className="text-xs lg:text-sm font-medium text-gray-500 truncate">
                      Logistics
                    </dt>
                    <dd className="text-xl lg:text-2xl font-semibold text-gray-900">
                      {stats.totalTrucks}
                    </dd>
                    <dd className="text-xs text-green-600">
                      {stats.activeTrucks} active
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          {/* Rental Equipment */}
          <div className="bg-white overflow-hidden shadow-sm rounded-lg">
            <div className="p-4 lg:p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <Settings className="h-6 w-6 lg:h-8 lg:w-8 text-orange-600" />
                </div>
                <div className="ml-3 lg:ml-4 w-0 flex-1">
                  <dl>
                    <dt className="text-xs lg:text-sm font-medium text-gray-500 truncate">
                      Rental
                    </dt>
                    <dd className="text-xl lg:text-2xl font-semibold text-gray-900">
                      {stats.totalEquipment}
                    </dd>
                    <dd className="text-xs text-green-600">
                      {stats.activeEquipment} active
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          {/* Fleet Utilization */}
          <div className="bg-white overflow-hidden shadow-sm rounded-lg">
            <div className="p-4 lg:p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <Activity className="h-6 w-6 lg:h-8 lg:w-8 text-purple-600" />
                </div>
                <div className="ml-3 lg:ml-4 w-0 flex-1">
                  <dl>
                    <dt className="text-xs lg:text-sm font-medium text-gray-500 truncate">
                      Utilization
                    </dt>
                    <dd className="text-xl lg:text-2xl font-semibold text-gray-900">
                      {stats.fleetUtilization}%
                    </dd>
                    <dd className="text-xs text-gray-500">
                      {stats.activeBookings}/{stats.totalTrucks + stats.totalEquipment} vehicles
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          {/* Total Revenue */}
          <div className="bg-white overflow-hidden shadow-sm rounded-lg">
            <div className="p-4 lg:p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <DollarSign className="h-6 w-6 lg:h-8 lg:w-8 text-green-600" />
                </div>
                <div className="ml-3 lg:ml-4 w-0 flex-1">
                  <dl>
                    <dt className="text-xs lg:text-sm font-medium text-gray-500 truncate">
                      Total Revenue
                    </dt>
                    <dd className="text-xl lg:text-2xl font-semibold text-gray-900">
                      {formatCurrency(stats.totalRevenue)}
                    </dd>
                    <dd className="text-xs text-blue-600">
                      {formatCurrency(stats.monthlyRevenue)} this month
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          {/* Average Booking Value */}
          <div className="bg-white overflow-hidden shadow-sm rounded-lg">
            <div className="p-4 lg:p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <Target className="h-6 w-6 lg:h-8 lg:w-8 text-indigo-600" />
                </div>
                <div className="ml-3 lg:ml-4 w-0 flex-1">
                  <dl>
                    <dt className="text-xs lg:text-sm font-medium text-gray-500 truncate">
                      Avg Booking
                    </dt>
                    <dd className="text-xl lg:text-2xl font-semibold text-gray-900">
                      {formatCurrency(stats.avgBookingValue)}
                    </dd>
                    <dd className="text-xs text-gray-500">
                      {stats.completedBookings} completed
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          {/* Pending Bookings */}
          <div className="bg-white overflow-hidden shadow-sm rounded-lg">
            <div className="p-4 lg:p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <Clock className="h-6 w-6 lg:h-8 lg:w-8 text-yellow-600" />
                </div>
                <div className="ml-3 lg:ml-4 w-0 flex-1">
                  <dl>
                    <dt className="text-xs lg:text-sm font-medium text-gray-500 truncate">
                      Pending
                    </dt>
                    <dd className="text-xl lg:text-2xl font-semibold text-gray-900">
                      {stats.pendingBookings}
                    </dd>
                    <dd className="text-xs text-yellow-600">
                      Need review
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          {/* Customer Rating */}
          <div className="bg-white overflow-hidden shadow-sm rounded-lg">
            <div className="p-4 lg:p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <Star className="h-6 w-6 lg:h-8 lg:w-8 text-yellow-500" />
                </div>
                <div className="ml-3 lg:ml-4 w-0 flex-1">
                  <dl>
                    <dt className="text-xs lg:text-sm font-medium text-gray-500 truncate">
                      Rating
                    </dt>
                    <dd className="text-xl lg:text-2xl font-semibold text-gray-900">
                      {stats.customerRating}
                    </dd>
                    <dd className="text-xs text-yellow-500">
                      ★★★★☆
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Analytics Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Revenue Breakdown */}
          <div className="bg-white shadow-sm rounded-lg">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex items-center">
                <PieChart className="h-5 w-5 text-green-500 mr-2" />
                <h3 className="text-lg font-medium text-gray-900">Revenue Breakdown</h3>
              </div>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-blue-500 rounded-full mr-3"></div>
                    <span className="text-sm font-medium text-gray-900">Transportation</span>
                  </div>
                  <span className="text-sm font-semibold text-gray-900">
                    {formatCurrency(stats.transportRevenue)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-orange-500 rounded-full mr-3"></div>
                    <span className="text-sm font-medium text-gray-900">Equipment Rental</span>
                  </div>
                  <span className="text-sm font-semibold text-gray-900">
                    {formatCurrency(stats.rentalRevenue)}
                  </span>
                </div>
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Total Revenue</span>
                    <span className="font-semibold text-gray-900">
                      {formatCurrency(stats.totalRevenue)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Top Performing Vehicles */}
          <div className="bg-white shadow-sm rounded-lg">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex items-center">
                <Award className="h-5 w-5 text-yellow-500 mr-2" />
                <h3 className="text-lg font-medium text-gray-900">Top Performers</h3>
              </div>
            </div>
            <div className="p-6">
              {stats.topPerformingVehicles.length > 0 ? (
                <div className="space-y-4">
                  {stats.topPerformingVehicles.map((vehicle, index) => (
                    <div key={vehicle.id} className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold mr-3 ${
                          index === 0 ? 'bg-yellow-500' : 
                          index === 1 ? 'bg-gray-400' : 'bg-amber-600'
                        }`}>
                          {index + 1}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">{vehicle.license_plate}</p>
                          <p className="text-xs text-gray-500">
                            {vehicle.service_type === 'rental' ? 'Equipment' : 'Transport'}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-semibold text-gray-900">{vehicle.bookingCount}</p>
                        <p className="text-xs text-gray-500">bookings</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-4">
                  <Award className="mx-auto h-8 w-8 text-gray-400" />
                  <p className="mt-2 text-sm text-gray-500">No performance data yet</p>
                </div>
              )}
            </div>
          </div>

          {/* Quick Stats */}
          <div className="bg-white shadow-sm rounded-lg">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex items-center">
                <BarChart3 className="h-5 w-5 text-purple-500 mr-2" />
                <h3 className="text-lg font-medium text-gray-900">Quick Stats</h3>
              </div>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">Fleet Size</span>
                  <span className="text-sm font-semibold text-gray-900">
                    {stats.totalTrucks + stats.totalEquipment} vehicles
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">Active Rate</span>
                  <span className="text-sm font-semibold text-gray-900">
                    {Math.round(((stats.activeTrucks + stats.activeEquipment) / (stats.totalTrucks + stats.totalEquipment || 1)) * 100)}%
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">Maintenance</span>
                  <span className="text-sm font-semibold text-red-600">
                    {stats.maintenanceAlerts} vehicles
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">Success Rate</span>
                  <span className="text-sm font-semibold text-green-600">
                    {stats.totalBookings > 0 ? Math.round((stats.completedBookings / stats.totalBookings) * 100) : 0}%
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Recent Bookings */}
          <div className="bg-white shadow-sm rounded-lg">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium text-gray-900">Recent Bookings</h3>
                <Link
                  to="/bookings"
                  className="text-sm text-blue-600 hover:text-blue-500 font-medium"
                >
                  View all
                </Link>
              </div>
            </div>
            <div className="divide-y divide-gray-200">
              {recentBookings.length === 0 ? (
                <div className="px-6 py-8 text-center">
                  <Package className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">No bookings yet</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    Bookings will appear here once customers request your trucks.
                  </p>
                </div>
              ) : (
                recentBookings.map((booking) => (
                  <div key={booking.id} className="px-6 py-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="flex-shrink-0">
                          <div className="h-10 w-10 rounded-full bg-purple-100 flex items-center justify-center">
                            <Package className="h-5 w-5 text-purple-600" />
                          </div>
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center space-x-2">
                            <p className="text-sm font-medium text-gray-900 truncate">
                              {booking.service_type === 'rental' 
                                ? (booking.work_address || 'Rental Service')
                                : `${booking.pickup_city || 'N/A'} → ${booking.destination_city || 'N/A'}`
                              }
                            </p>
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(booking.status)}`}>
                              {booking.status.replace('_', ' ')}
                            </span>
                          </div>
                          <div className="flex items-center mt-1 text-sm text-gray-500">
                            <Calendar className="h-4 w-4 mr-1" />
                            <span>{formatDate(booking.pickup_date)}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        {booking.status === 'pending_review' ? (
                          <>
                            <button
                              onClick={() => handleBookingAction(booking.id, 'accept')}
                              className="inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded-md text-white bg-green-600 hover:bg-green-700"
                            >
                              Accept
                            </button>
                            <button
                              onClick={() => handleBookingAction(booking.id, 'reject')}
                              className="inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded-md text-white bg-red-600 hover:bg-red-700"
                            >
                              Reject
                            </button>
                          </>
                        ) : (
                          <Link
                            to={`/bookings/${booking.id}`}
                            className="text-blue-600 hover:text-blue-500 text-sm font-medium"
                          >
                            View
                          </Link>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* My Fleet */}
          <div className="bg-white shadow-sm rounded-lg">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <h3 className="text-lg font-medium text-gray-900">My Fleet</h3>
                  <div className="flex items-center space-x-1">
                    <button
                      onClick={() => setServiceFilter('all')}
                      className={`px-3 py-1 text-xs font-medium rounded-md ${
                        serviceFilter === 'all' 
                          ? 'bg-blue-100 text-blue-800' 
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      All
                    </button>
                    <button
                      onClick={() => setServiceFilter('transport')}
                      className={`px-3 py-1 text-xs font-medium rounded-md ${
                        serviceFilter === 'transport' 
                          ? 'bg-blue-100 text-blue-800' 
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      Trucks
                    </button>
                    <button
                      onClick={() => setServiceFilter('rental')}
                      className={`px-3 py-1 text-xs font-medium rounded-md ${
                        serviceFilter === 'rental' 
                          ? 'bg-blue-100 text-blue-800' 
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      Equipment
                    </button>
                  </div>
                </div>
                <Link
                  to="/trucks"
                  className="text-sm text-blue-600 hover:text-blue-500 font-medium"
                >
                  View all
                </Link>
              </div>
            </div>
            <div className="divide-y divide-gray-200">
              {(() => {
                const filteredTrucks = trucks.filter(truck => {
                  if (serviceFilter === 'all') return true;
                  if (serviceFilter === 'transport') return truck.service_type === 'transport' || !truck.service_type;
                  if (serviceFilter === 'rental') return truck.service_type === 'rental';
                  return true;
                });

                return filteredTrucks.length === 0 ? (
                  <div className="px-6 py-8 text-center">
                    {serviceFilter === 'rental' ? (
                      <Settings className="mx-auto h-12 w-12 text-gray-400" />
                    ) : (
                      <Truck className="mx-auto h-12 w-12 text-gray-400" />
                    )}
                    <h3 className="mt-2 text-sm font-medium text-gray-900">
                      No {serviceFilter === 'rental' ? 'equipment' : serviceFilter === 'transport' ? 'trucks' : 'vehicles'} yet
                    </h3>
                    <p className="mt-1 text-sm text-gray-500">
                      Add {serviceFilter === 'rental' ? 'equipment' : 'trucks'} to your fleet to start receiving bookings.
                    </p>
                    <div className="mt-6">
                      <Link
                        to="/trucks/new"
                        className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Add {serviceFilter === 'rental' ? 'Equipment' : 'Truck'}
                      </Link>
                    </div>
                  </div>
                ) : (
                  filteredTrucks.map((truck) => {
                    const isRental = truck.service_type === 'rental';
                    return (
                      <div key={truck.id} className="px-6 py-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-4">
                            <div className="flex-shrink-0">
                              <div className={`h-10 w-10 rounded-full flex items-center justify-center ${
                                isRental ? 'bg-orange-100' : 'bg-blue-100'
                              }`}>
                                {isRental ? (
                                  <Settings className="h-5 w-5 text-orange-600" />
                                ) : (
                                  <Truck className="h-5 w-5 text-blue-600" />
                                )}
                              </div>
                            </div>
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center space-x-2">
                                <p className="text-sm font-medium text-gray-900 truncate">
                                  {truck.license_plate} - {VEHICLE_TYPE_LABELS[truck.truck_type] || truck.truck_type}
                                </p>
                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(truck.status)}`}>
                                  {truck.status}
                                </span>
                                {isRental ? (
                                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                                    Rental
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                    Logistics
                                  </span>
                                )}
                              </div>
                              <div className="flex items-center mt-1 text-sm text-gray-500">
                                <span>Total Revenue: ${truck.total_revenue || 0}</span>
                              </div>
                              <div className="flex items-center mt-1 text-sm text-gray-500">
                                <span>{truck.capacity_weight}kg {isRental ? 'operating weight' : 'capacity'}</span>
                                <span className="mx-2">•</span>
                                {isRental ? (
                                  <span>
                                    {/* Show multiple rates if available */}
                                    {[
                                      truck.hourly_rate && `$${truck.hourly_rate}/hr`,
                                      truck.daily_rate && `$${truck.daily_rate}/day`,
                                      truck.weekly_rate && `$${truck.weekly_rate}/wk`,
                                      truck.monthly_rate && `$${truck.monthly_rate}/mo`
                                    ].filter(Boolean).slice(0, 2).join(', ') || 'Rates available'}
                                  </span>
                                ) : (
                                  <span>
                                    {truck.pricing_type === 'per_km' 
                                      ? `$${truck.price_per_km}/km`
                                      : `$${truck.fixed_price}`
                                    }
                                  </span>
                                )}
                              </div>
                              {isRental && truck.work_location && (
                                <div className="flex items-center mt-1 text-sm text-gray-500">
                                  <MapPin className="h-3 w-3 mr-1" />
                                  <span>{truck.work_location}</span>
                                </div>
                              )}
                            </div>
                          </div>
                          <Link
                            to={`/trucks/${truck.id}`}
                            className="text-blue-600 hover:text-blue-500 text-sm font-medium"
                          >
                            View
                          </Link>
                        </div>
                      </div>
                    );
                  })
                );
              })()}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProviderDashboard;
