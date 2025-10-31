import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, 
  DollarSign, 
  Package, 
  Target,
  TrendingDown,
  MapPin,
  Truck,
  BarChart3,
  Activity,
  ArrowRight
} from 'lucide-react';
import { apiClient } from '../../utils/apiClient';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const ProviderAnalytics = () => {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [timeRange, setTimeRange] = useState(6); // months

  useEffect(() => {
    fetchAnalytics();
  }, [timeRange]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get(`/analytics/provider?months=${timeRange}`);
      if (response.data.success) {
        setAnalytics(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const COLORS = {
    transport: '#3B82F6',
    rental: '#10B981',
    pending: '#F59E0B',
    approved: '#8B5CF6',
    completed: '#10B981',
    cancelled: '#EF4444'
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600 dark:text-gray-400">No analytics data available</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Analytics Dashboard</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">Track your performance and insights</p>
        </div>
        
        <select
          value={timeRange}
          onChange={(e) => setTimeRange(Number(e.target.value))}
          className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
        >
          <option value={3}>Last 3 Months</option>
          <option value={6}>Last 6 Months</option>
          <option value={12}>Last 12 Months</option>
        </select>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 dark:border-gray-700">
        <nav className="flex space-x-8">
          {[
            { id: 'overview', label: 'Overview', icon: BarChart3 },
            { id: 'revenue', label: 'Revenue', icon: DollarSign },
            { id: 'bookings', label: 'Bookings', icon: Package },
            { id: 'fleet', label: 'Fleet', icon: Truck },
            { id: 'routes', label: 'Routes', icon: MapPin }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === tab.id
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <MetricCard
              title="Total Revenue"
              value={formatCurrency(analytics.summary.totalRevenue)}
              icon={DollarSign}
              color="bg-gradient-to-br from-green-500 to-emerald-600"
              trend={analytics.revenueTrends.length > 1 ? calculateTrend(analytics.revenueTrends, 'total_revenue') : null}
            />
            <MetricCard
              title="Total Bookings"
              value={analytics.summary.totalBookings}
              icon={Package}
              color="bg-gradient-to-br from-blue-500 to-primary-600"
              subtitle={`${analytics.summary.completedBookings} completed`}
            />
            <MetricCard
              title="Fleet Utilization"
              value={`${analytics.summary.fleetUtilizationRate}%`}
              icon={Activity}
              color="bg-gradient-to-br from-purple-500 to-indigo-600"
              subtitle={`${analytics.summary.activeVehicles} / ${analytics.summary.totalVehicles} active`}
            />
            <MetricCard
              title="Conversion Rate"
              value={`${analytics.bookingConversion.conversionRate}%`}
              icon={Target}
              color="bg-gradient-to-br from-orange-500 to-red-600"
              subtitle={`${analytics.bookingConversion.approvalRate}% approval`}
            />
          </div>

          {/* Revenue Trend Chart */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Revenue Trend</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={analytics.revenueTrends}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="month" stroke="#9CA3AF" />
                <YAxis stroke="#9CA3AF" />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1F2937', border: 'none', borderRadius: '0.5rem' }}
                  labelStyle={{ color: '#F9FAFB' }}
                />
                <Legend />
                <Line type="monotone" dataKey="transport_revenue" stroke={COLORS.transport} name="Transport" strokeWidth={2} />
                <Line type="monotone" dataKey="rental_revenue" stroke={COLORS.rental} name="Rental" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Booking Conversion Funnel */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Booking Conversion Funnel</h3>
            <div className="space-y-4">
              {[
                { label: 'Pending Review', value: analytics.bookingConversion.funnel.pending, color: 'bg-yellow-500' },
                { label: 'Approved', value: analytics.bookingConversion.funnel.approved, color: 'bg-blue-500' },
                { label: 'Confirmed', value: analytics.bookingConversion.funnel.confirmed, color: 'bg-purple-500' },
                { label: 'Active/In Transit', value: analytics.bookingConversion.funnel.active, color: 'bg-indigo-500' },
                { label: 'Completed', value: analytics.bookingConversion.funnel.completed, color: 'bg-green-500' },
              ].map((stage, idx) => {
                const total = analytics.bookingConversion.funnel.total;
                const percentage = total > 0 ? (stage.value / total * 100).toFixed(1) : 0;
                return (
                  <div key={idx}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-700 dark:text-gray-300">{stage.label}</span>
                      <span className="text-gray-900 dark:text-gray-100 font-semibold">{stage.value} ({percentage}%)</span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                      <div
                        className={`${stage.color} h-3 rounded-full transition-all duration-500`}
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Revenue Tab */}
      {activeTab === 'revenue' && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Revenue by Service Type</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={analytics.revenueTrends}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="month" stroke="#9CA3AF" />
                <YAxis stroke="#9CA3AF" />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1F2937', border: 'none', borderRadius: '0.5rem' }}
                  labelStyle={{ color: '#F9FAFB' }}
                  formatter={(value) => formatCurrency(value)}
                />
                <Legend />
                <Bar dataKey="transport_revenue" fill={COLORS.transport} name="Transport" />
                <Bar dataKey="rental_revenue" fill={COLORS.rental} name="Rental" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Monthly Revenue Details */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden">
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Monthly Revenue Details</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Month</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Transport</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Rental</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Total</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Bookings</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {analytics.revenueTrends.map((month, idx) => (
                    <tr key={idx} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                      <td className="px-6 py-4 text-sm text-gray-900 dark:text-gray-100">{month.month} {month.year}</td>
                      <td className="px-6 py-4 text-sm text-right text-gray-900 dark:text-gray-100">{formatCurrency(month.transport_revenue)}</td>
                      <td className="px-6 py-4 text-sm text-right text-gray-900 dark:text-gray-100">{formatCurrency(month.rental_revenue)}</td>
                      <td className="px-6 py-4 text-sm text-right font-semibold text-gray-900 dark:text-gray-100">{formatCurrency(month.total_revenue)}</td>
                      <td className="px-6 py-4 text-sm text-right text-gray-600 dark:text-gray-400">{month.total_bookings}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Fleet Tab */}
      {activeTab === 'fleet' && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden">
          <div className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Vehicle Performance</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Vehicle</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Type</th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Bookings</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Revenue</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Avg Value</th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {analytics.vehicleUtilization.map((vehicle) => (
                  <tr key={vehicle.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="px-6 py-4 text-sm font-medium text-gray-900 dark:text-gray-100">{vehicle.license_plate}</td>
                    <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400 capitalize">{vehicle.service_type || 'transport'}</td>
                    <td className="px-6 py-4 text-sm text-center text-gray-900 dark:text-gray-100">
                      {vehicle.completed_bookings} / {vehicle.total_bookings}
                    </td>
                    <td className="px-6 py-4 text-sm text-right font-semibold text-gray-900 dark:text-gray-100">
                      {formatCurrency(vehicle.total_revenue)}
                    </td>
                    <td className="px-6 py-4 text-sm text-right text-gray-600 dark:text-gray-400">
                      {formatCurrency(vehicle.avg_booking_value)}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        vehicle.currently_active > 0 ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                      }`}>
                        {vehicle.currently_active > 0 ? 'Active' : 'Available'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Routes Tab */}
      {activeTab === 'routes' && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden">
          <div className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Top Routes by Revenue</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Route</th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Bookings</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Total Revenue</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Avg Revenue</th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Completion Rate</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {analytics.topRoutes.map((route, idx) => {
                  const completionRate = route.booking_count > 0 
                    ? ((route.completed_count / route.booking_count) * 100).toFixed(0)
                    : 0;
                  return (
                    <tr key={idx} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2 text-sm text-gray-900 dark:text-gray-100">
                          <MapPin className="w-4 h-4 text-blue-500" />
                          <span>{route.pickup_city}</span>
                          <ArrowRight className="w-4 h-4 text-gray-400" />
                          <span>{route.destination_city}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-center text-gray-900 dark:text-gray-100">{route.booking_count}</td>
                      <td className="px-6 py-4 text-sm text-right font-semibold text-gray-900 dark:text-gray-100">
                        {formatCurrency(route.total_revenue)}
                      </td>
                      <td className="px-6 py-4 text-sm text-right text-gray-600 dark:text-gray-400">
                        {formatCurrency(route.avg_revenue)}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          completionRate >= 80 ? 'bg-green-100 text-green-800' :
                          completionRate >= 60 ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {completionRate}%
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

// Helper component for metric cards
const MetricCard = ({ title, value, icon: Icon, color, subtitle, trend }) => (
  <div className={`${color} text-white rounded-xl p-6 shadow-lg`}>
    <div className="flex justify-between items-start mb-4">
      <div className="p-3 bg-white/20 rounded-lg">
        <Icon className="w-6 h-6" />
      </div>
      {trend !== null && trend !== undefined && (
        <div className={`flex items-center gap-1 text-sm ${trend >= 0 ? 'text-white' : 'text-red-200'}`}>
          {trend >= 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
          <span>{Math.abs(trend).toFixed(1)}%</span>
        </div>
      )}
    </div>
    <div>
      <p className="text-white/80 text-sm font-medium mb-1">{title}</p>
      <p className="text-3xl font-bold mb-1">{value}</p>
      {subtitle && <p className="text-white/80 text-sm">{subtitle}</p>}
    </div>
  </div>
);

// Helper function to calculate trend
const calculateTrend = (data, field) => {
  if (data.length < 2) return 0;
  const latest = parseFloat(data[data.length - 1][field]);
  const previous = parseFloat(data[data.length - 2][field]);
  if (previous === 0) return 0;
  return ((latest - previous) / previous) * 100;
};

export default ProviderAnalytics;
