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
  ArrowRight,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Zap,
  Globe,
  Tag,
  Brain,
  Users,
  Star,
  Award
} from 'lucide-react';
import { apiClient } from '../../utils/apiClient';
import { 
  LineChart, 
  Line, 
  BarChart, 
  Bar, 
  PieChart, 
  Pie, 
  Cell, 
  AreaChart,
  Area,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  RadialBarChart,
  RadialBar
} from 'recharts';

const ProviderAnalytics = () => {
  const [analytics, setAnalytics] = useState(null);
  const [kpis, setKpis] = useState(null);
  const [geographic, setGeographic] = useState(null);
  const [pricing, setPricing] = useState(null);
  const [predictive, setPredictive] = useState(null);
  const [customers, setCustomers] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [timeRange, setTimeRange] = useState(6); // months

  useEffect(() => {
    fetchAnalytics();
    fetchPhase2Analytics();
    fetchPhase3Analytics();
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

  const fetchPhase2Analytics = async () => {
    try {
      const [kpisRes, geoRes, pricingRes] = await Promise.all([
        apiClient.get(`/analytics/provider/kpis?months=${timeRange}`),
        apiClient.get(`/analytics/provider/geographic?months=${timeRange}`),
        apiClient.get(`/analytics/provider/pricing?months=${timeRange}`)
      ]);
      
      if (kpisRes.data.success) setKpis(kpisRes.data.data);
      if (geoRes.data.success) setGeographic(geoRes.data.data);
      if (pricingRes.data.success) setPricing(pricingRes.data.data);
    } catch (error) {
      console.error('Error fetching Phase 2 analytics:', error);
    }
  };

  const fetchPhase3Analytics = async () => {
    try {
      const [predictiveRes, customersRes] = await Promise.all([
        apiClient.get('/analytics/provider/predictive'),
        apiClient.get('/analytics/provider/customers')
      ]);
      
      if (predictiveRes.data.success) setPredictive(predictiveRes.data.data);
      if (customersRes.data.success) setCustomers(customersRes.data.data);
    } catch (error) {
      console.error('Error fetching Phase 3 analytics:', error);
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
    confirmed: '#06B6D4',
    active: '#8B5CF6',
    completed: '#10B981',
    cancelled: '#EF4444',
    gradient: {
      transport: ['#3B82F6', '#1D4ED8'],
      rental: ['#10B981', '#059669'],
      revenue: ['#8B5CF6', '#6D28D9']
    }
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
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
        <div className="space-y-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100">Analytics Dashboard</h1>
              <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mt-1 sm:mt-2">Track your performance and insights</p>
            </div>
            
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(Number(e.target.value))}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value={3}>Last 3 Months</option>
              <option value={6}>Last 6 Months</option>
              <option value={12}>Last 12 Months</option>
            </select>
          </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 dark:border-gray-700 overflow-x-auto">
        <nav className="flex space-x-6 min-w-max">
          {[
            { id: 'overview', label: 'Overview', icon: BarChart3 },
            { id: 'revenue', label: 'Revenue', icon: DollarSign },
            { id: 'bookings', label: 'Bookings', icon: Package },
            { id: 'fleet', label: 'Fleet', icon: Truck },
            { id: 'routes', label: 'Routes', icon: MapPin },
            { id: 'performance', label: 'Performance', icon: Zap },
            { id: 'geographic', label: 'Geographic', icon: Globe },
            { id: 'pricing', label: 'Pricing', icon: Tag },
            { id: 'insights', label: 'AI Insights', icon: Brain },
            { id: 'customers', label: 'Customers', icon: Users }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 py-4 px-2 border-b-2 font-medium text-sm transition-colors whitespace-nowrap ${
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
              color="bg-gradient-to-br from-blue-500 to-blue-700"
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

          {/* Main Charts Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Revenue Trend Chart - Takes 2 columns */}
            <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Revenue Trend</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Monthly revenue breakdown</p>
                </div>
                <div className="flex gap-4 text-xs">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                    <span className="text-gray-600 dark:text-gray-400">Transport</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    <span className="text-gray-600 dark:text-gray-400">Rental</span>
                  </div>
                </div>
              </div>
              <ResponsiveContainer width="100%" height={320}>
                <AreaChart data={analytics.revenueTrends}>
                  <defs>
                    <linearGradient id="colorTransport" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorRental" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10B981" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
                  <XAxis 
                    dataKey="month" 
                    stroke="#9CA3AF" 
                    style={{ fontSize: '12px' }}
                  />
                  <YAxis 
                    stroke="#9CA3AF" 
                    style={{ fontSize: '12px' }}
                    tickFormatter={(value) => `$${(value/1000).toFixed(0)}k`}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#1F2937', 
                      border: 'none', 
                      borderRadius: '0.75rem',
                      boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.3)'
                    }}
                    labelStyle={{ color: '#F9FAFB', fontWeight: '600' }}
                    formatter={(value) => formatCurrency(value)}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="transport_revenue" 
                    stroke="#3B82F6" 
                    fillOpacity={1}
                    fill="url(#colorTransport)"
                    strokeWidth={3}
                    name="Transport"
                  />
                  <Area 
                    type="monotone" 
                    dataKey="rental_revenue" 
                    stroke="#10B981" 
                    fillOpacity={1}
                    fill="url(#colorRental)"
                    strokeWidth={3}
                    name="Rental"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            {/* Booking Status Pie Chart */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">Booking Status</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">Current distribution</p>
              <ResponsiveContainer width="100%" height={240}>
                <PieChart>
                  <Pie
                    data={[
                      { name: 'Completed', value: analytics.bookingConversion.funnel.completed, color: COLORS.completed },
                      { name: 'Active', value: analytics.bookingConversion.funnel.active, color: COLORS.active },
                      { name: 'Confirmed', value: analytics.bookingConversion.funnel.confirmed, color: COLORS.confirmed },
                      { name: 'Approved', value: analytics.bookingConversion.funnel.approved, color: COLORS.approved },
                      { name: 'Pending', value: analytics.bookingConversion.funnel.pending, color: COLORS.pending },
                      { name: 'Cancelled', value: analytics.bookingConversion.funnel.cancelled, color: COLORS.cancelled },
                    ].filter(item => item.value > 0)}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={2}
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    labelLine={false}
                  >
                    {[
                      { name: 'Completed', value: analytics.bookingConversion.funnel.completed, color: COLORS.completed },
                      { name: 'Active', value: analytics.bookingConversion.funnel.active, color: COLORS.active },
                      { name: 'Confirmed', value: analytics.bookingConversion.funnel.confirmed, color: COLORS.confirmed },
                      { name: 'Approved', value: analytics.bookingConversion.funnel.approved, color: COLORS.approved },
                      { name: 'Pending', value: analytics.bookingConversion.funnel.pending, color: COLORS.pending },
                      { name: 'Cancelled', value: analytics.bookingConversion.funnel.cancelled, color: COLORS.cancelled },
                    ].filter(item => item.value > 0).map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#1F2937', 
                      border: 'none', 
                      borderRadius: '0.5rem' 
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Booking Conversion Funnel */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Booking Conversion Funnel</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Track your booking pipeline</p>
            </div>
            <div className="space-y-5">
              {[
                { label: 'Pending Review', value: analytics.bookingConversion.funnel.pending, color: 'bg-yellow-500', icon: Clock },
                { label: 'Approved', value: analytics.bookingConversion.funnel.approved, color: 'bg-blue-500', icon: CheckCircle },
                { label: 'Confirmed', value: analytics.bookingConversion.funnel.confirmed, color: 'bg-cyan-500', icon: CheckCircle },
                { label: 'Active/In Transit', value: analytics.bookingConversion.funnel.active, color: 'bg-purple-500', icon: Truck },
                { label: 'Completed', value: analytics.bookingConversion.funnel.completed, color: 'bg-green-500', icon: CheckCircle },
              ].map((stage, idx) => {
                const total = analytics.bookingConversion.funnel.total;
                const percentage = total > 0 ? (stage.value / total * 100).toFixed(1) : 0;
                const Icon = stage.icon;
                return (
                  <div key={idx} className="relative">
                    <div className="flex justify-between items-center text-sm mb-2">
                      <div className="flex items-center gap-2">
                        <Icon className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                        <span className="text-gray-700 dark:text-gray-300 font-medium">{stage.label}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-gray-900 dark:text-gray-100 font-bold">{stage.value}</span>
                        <span className="text-gray-500 dark:text-gray-400 text-xs">({percentage}%)</span>
                      </div>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-4 overflow-hidden shadow-inner">
                      <div
                        className={`${stage.color} h-4 rounded-full transition-all duration-700 ease-out flex items-center justify-end pr-2`}
                        style={{ width: `${Math.max(percentage, 2)}%` }}
                      >
                        {percentage > 10 && (
                          <span className="text-white text-xs font-bold">{percentage}%</span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
            
            {/* Conversion Stats */}
            <div className="grid grid-cols-2 gap-4 mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
              <div className="text-center">
                <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                  {analytics.bookingConversion.conversionRate}%
                </p>
                <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">Conversion Rate</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                  {analytics.bookingConversion.approvalRate}%
                </p>
                <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">Approval Rate</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Revenue Tab */}
      {activeTab === 'revenue' && (
        <div className="space-y-6">
          {/* Revenue Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-gradient-to-br from-blue-500 to-blue-700 text-white rounded-xl p-6 shadow-lg">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-white/20 rounded-lg">
                  <Truck className="w-6 h-6" />
                </div>
              </div>
              <p className="text-white/80 text-sm font-medium mb-1">Transport Revenue</p>
              <p className="text-3xl font-bold">
                {formatCurrency(analytics.revenueTrends.reduce((sum, m) => sum + parseFloat(m.transport_revenue || 0), 0))}
              </p>
              <p className="text-white/70 text-xs mt-2">
                {analytics.revenueTrends.reduce((sum, m) => sum + parseInt(m.transport_bookings || 0), 0)} bookings
              </p>
            </div>

            <div className="bg-gradient-to-br from-green-500 to-emerald-600 text-white rounded-xl p-6 shadow-lg">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-white/20 rounded-lg">
                  <Activity className="w-6 h-6" />
                </div>
              </div>
              <p className="text-white/80 text-sm font-medium mb-1">Rental Revenue</p>
              <p className="text-3xl font-bold">
                {formatCurrency(analytics.revenueTrends.reduce((sum, m) => sum + parseFloat(m.rental_revenue || 0), 0))}
              </p>
              <p className="text-white/70 text-xs mt-2">
                {analytics.revenueTrends.reduce((sum, m) => sum + parseInt(m.rental_bookings || 0), 0)} bookings
              </p>
            </div>

            <div className="bg-gradient-to-br from-purple-500 to-indigo-600 text-white rounded-xl p-6 shadow-lg">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-white/20 rounded-lg">
                  <DollarSign className="w-6 h-6" />
                </div>
              </div>
              <p className="text-white/80 text-sm font-medium mb-1">Average per Booking</p>
              <p className="text-3xl font-bold">
                {formatCurrency(
                  analytics.summary.totalBookings > 0 
                    ? analytics.summary.totalRevenue / analytics.summary.totalBookings 
                    : 0
                )}
              </p>
              <p className="text-white/70 text-xs mt-2">
                {analytics.summary.totalBookings} total bookings
              </p>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Revenue by Service Type</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Compare transport vs rental performance</p>
            </div>
            <ResponsiveContainer width="100%" height={350}>
              <BarChart data={analytics.revenueTrends} barGap={8}>
                <defs>
                  <linearGradient id="barTransport" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#3B82F6" stopOpacity={0.9}/>
                    <stop offset="100%" stopColor="#1D4ED8" stopOpacity={0.9}/>
                  </linearGradient>
                  <linearGradient id="barRental" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#10B981" stopOpacity={0.9}/>
                    <stop offset="100%" stopColor="#059669" stopOpacity={0.9}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
                <XAxis 
                  dataKey="month" 
                  stroke="#9CA3AF" 
                  style={{ fontSize: '12px' }}
                />
                <YAxis 
                  stroke="#9CA3AF" 
                  style={{ fontSize: '12px' }}
                  tickFormatter={(value) => `$${(value/1000).toFixed(0)}k`}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#1F2937', 
                    border: 'none', 
                    borderRadius: '0.75rem',
                    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.3)'
                  }}
                  labelStyle={{ color: '#F9FAFB', fontWeight: '600' }}
                  formatter={(value) => formatCurrency(value)}
                />
                <Legend 
                  wrapperStyle={{ paddingTop: '20px' }}
                  iconType="circle"
                />
                <Bar 
                  dataKey="transport_revenue" 
                  fill="url(#barTransport)" 
                  name="Transport Revenue"
                  radius={[8, 8, 0, 0]}
                />
                <Bar 
                  dataKey="rental_revenue" 
                  fill="url(#barRental)" 
                  name="Rental Revenue"
                  radius={[8, 8, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Monthly Revenue Details */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden border border-gray-200 dark:border-gray-700">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Monthly Revenue Details</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Detailed breakdown by month</p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-800">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">Month</th>
                    <th className="px-6 py-4 text-right text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">Transport</th>
                    <th className="px-6 py-4 text-right text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">Rental</th>
                    <th className="px-6 py-4 text-right text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">Total Revenue</th>
                    <th className="px-6 py-4 text-right text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">Bookings</th>
                    <th className="px-6 py-4 text-right text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">Avg/Booking</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {analytics.revenueTrends.map((month, idx) => {
                    const avgBookingValue = month.total_bookings > 0 
                      ? parseFloat(month.total_revenue) / parseInt(month.total_bookings)
                      : 0;
                    return (
                      <tr key={idx} className="hover:bg-blue-50 dark:hover:bg-gray-700/50 transition-colors">
                        <td className="px-6 py-4 text-sm font-medium text-gray-900 dark:text-gray-100">{month.month} {month.year}</td>
                        <td className="px-6 py-4 text-sm text-right text-blue-600 dark:text-blue-400 font-medium">{formatCurrency(month.transport_revenue)}</td>
                        <td className="px-6 py-4 text-sm text-right text-green-600 dark:text-green-400 font-medium">{formatCurrency(month.rental_revenue)}</td>
                        <td className="px-6 py-4 text-sm text-right font-bold text-gray-900 dark:text-gray-100">{formatCurrency(month.total_revenue)}</td>
                        <td className="px-6 py-4 text-sm text-right text-gray-600 dark:text-gray-400">{month.total_bookings}</td>
                        <td className="px-6 py-4 text-sm text-right text-purple-600 dark:text-purple-400 font-medium">{formatCurrency(avgBookingValue)}</td>
                      </tr>
                    );
                  })}
                </tbody>
                <tfoot className="bg-gray-50 dark:bg-gray-800 border-t-2 border-gray-300 dark:border-gray-600">
                  <tr>
                    <td className="px-6 py-4 text-sm font-bold text-gray-900 dark:text-gray-100">TOTAL</td>
                    <td className="px-6 py-4 text-sm text-right font-bold text-blue-600 dark:text-blue-400">
                      {formatCurrency(analytics.revenueTrends.reduce((sum, m) => sum + parseFloat(m.transport_revenue || 0), 0))}
                    </td>
                    <td className="px-6 py-4 text-sm text-right font-bold text-green-600 dark:text-green-400">
                      {formatCurrency(analytics.revenueTrends.reduce((sum, m) => sum + parseFloat(m.rental_revenue || 0), 0))}
                    </td>
                    <td className="px-6 py-4 text-sm text-right font-bold text-gray-900 dark:text-gray-100">
                      {formatCurrency(analytics.summary.totalRevenue)}
                    </td>
                    <td className="px-6 py-4 text-sm text-right font-bold text-gray-900 dark:text-gray-100">
                      {analytics.revenueTrends.reduce((sum, m) => sum + parseInt(m.total_bookings || 0), 0)}
                    </td>
                    <td className="px-6 py-4 text-sm text-right font-bold text-purple-600 dark:text-purple-400">
                      {formatCurrency(
                        analytics.summary.totalBookings > 0 
                          ? analytics.summary.totalRevenue / analytics.summary.totalBookings 
                          : 0
                      )}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Bookings Tab */}
      {activeTab === 'bookings' && (
        <div className="space-y-6">
          {/* Booking Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border-l-4 border-yellow-500 shadow">
              <div className="flex items-center justify-between mb-2">
                <Clock className="w-5 h-5 text-yellow-500" />
                <span className="text-xs text-gray-500 dark:text-gray-400">Pending</span>
              </div>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                {analytics.bookingConversion.funnel.pending}
              </p>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border-l-4 border-blue-500 shadow">
              <div className="flex items-center justify-between mb-2">
                <CheckCircle className="w-5 h-5 text-blue-500" />
                <span className="text-xs text-gray-500 dark:text-gray-400">Approved</span>
              </div>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                {analytics.bookingConversion.funnel.approved}
              </p>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border-l-4 border-cyan-500 shadow">
              <div className="flex items-center justify-between mb-2">
                <CheckCircle className="w-5 h-5 text-cyan-500" />
                <span className="text-xs text-gray-500 dark:text-gray-400">Confirmed</span>
              </div>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                {analytics.bookingConversion.funnel.confirmed}
              </p>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border-l-4 border-purple-500 shadow">
              <div className="flex items-center justify-between mb-2">
                <Activity className="w-5 h-5 text-purple-500" />
                <span className="text-xs text-gray-500 dark:text-gray-400">Active</span>
              </div>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                {analytics.bookingConversion.funnel.active}
              </p>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border-l-4 border-green-500 shadow">
              <div className="flex items-center justify-between mb-2">
                <CheckCircle className="w-5 h-5 text-green-500" />
                <span className="text-xs text-gray-500 dark:text-gray-400">Completed</span>
              </div>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                {analytics.bookingConversion.funnel.completed}
              </p>
            </div>
          </div>

          {/* Booking Trends Chart */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Booking Volume Trend</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Monthly booking counts by service type</p>
            </div>
            <ResponsiveContainer width="100%" height={320}>
              <BarChart data={analytics.revenueTrends}>
                <defs>
                  <linearGradient id="barTransportBookings" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#3B82F6" stopOpacity={0.9}/>
                    <stop offset="100%" stopColor="#1D4ED8" stopOpacity={0.9}/>
                  </linearGradient>
                  <linearGradient id="barRentalBookings" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#10B981" stopOpacity={0.9}/>
                    <stop offset="100%" stopColor="#059669" stopOpacity={0.9}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
                <XAxis 
                  dataKey="month" 
                  stroke="#9CA3AF" 
                  style={{ fontSize: '12px' }}
                />
                <YAxis 
                  stroke="#9CA3AF" 
                  style={{ fontSize: '12px' }}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#1F2937', 
                    border: 'none', 
                    borderRadius: '0.75rem',
                    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.3)'
                  }}
                  labelStyle={{ color: '#F9FAFB', fontWeight: '600' }}
                />
                <Legend 
                  wrapperStyle={{ paddingTop: '20px' }}
                  iconType="circle"
                />
                <Bar 
                  dataKey="transport_bookings" 
                  fill="url(#barTransportBookings)" 
                  name="Transport Bookings"
                  radius={[8, 8, 0, 0]}
                />
                <Bar 
                  dataKey="rental_bookings" 
                  fill="url(#barRentalBookings)" 
                  name="Rental Bookings"
                  radius={[8, 8, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Performance Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Completion Stats */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Performance Metrics</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center">
                      <CheckCircle className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Completed</p>
                      <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                        {analytics.bookingConversion.funnel.completed}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                      {analytics.bookingConversion.conversionRate}%
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Success Rate</p>
                  </div>
                </div>

                <div className="flex items-center justify-between p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-red-500 rounded-lg flex items-center justify-center">
                      <XCircle className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Cancelled</p>
                      <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                        {analytics.bookingConversion.funnel.cancelled}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-red-600 dark:text-red-400">
                      {analytics.bookingConversion.funnel.total > 0 
                        ? ((analytics.bookingConversion.funnel.cancelled / analytics.bookingConversion.funnel.total) * 100).toFixed(1)
                        : 0}%
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Cancel Rate</p>
                  </div>
                </div>

                <div className="flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
                      <Package className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Total Bookings</p>
                      <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                        {analytics.bookingConversion.funnel.total}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                      {analytics.bookingConversion.approvalRate}%
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Approval Rate</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Service Type Distribution */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Service Type Distribution</h3>
              <ResponsiveContainer width="100%" height={260}>
                <PieChart>
                  <Pie
                    data={[
                      { 
                        name: 'Transport', 
                        value: analytics.revenueTrends.reduce((sum, m) => sum + parseInt(m.transport_bookings || 0), 0),
                        color: COLORS.transport 
                      },
                      { 
                        name: 'Rental', 
                        value: analytics.revenueTrends.reduce((sum, m) => sum + parseInt(m.rental_bookings || 0), 0),
                        color: COLORS.rental 
                      },
                    ].filter(item => item.value > 0)}
                    cx="50%"
                    cy="50%"
                    labelLine={true}
                    label={({ name, value, percent }) => `${name}: ${value} (${(percent * 100).toFixed(0)}%)`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {[
                      { 
                        name: 'Transport', 
                        value: analytics.revenueTrends.reduce((sum, m) => sum + parseInt(m.transport_bookings || 0), 0),
                        color: COLORS.transport 
                      },
                      { 
                        name: 'Rental', 
                        value: analytics.revenueTrends.reduce((sum, m) => sum + parseInt(m.rental_bookings || 0), 0),
                        color: COLORS.rental 
                      },
                    ].filter(item => item.value > 0).map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#1F2937', 
                      border: 'none', 
                      borderRadius: '0.5rem' 
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {/* Fleet Tab */}
      {activeTab === 'fleet' && (
        <div className="space-y-6">
          {/* Fleet Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border-l-4 border-blue-500 shadow">
              <p className="text-sm text-gray-600 dark:text-gray-400">Total Vehicles</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{analytics.summary.totalVehicles}</p>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border-l-4 border-green-500 shadow">
              <p className="text-sm text-gray-600 dark:text-gray-400">Currently Active</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{analytics.summary.activeVehicles}</p>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border-l-4 border-purple-500 shadow">
              <p className="text-sm text-gray-600 dark:text-gray-400">Fleet Utilization</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{analytics.summary.fleetUtilizationRate}%</p>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border-l-4 border-orange-500 shadow">
              <p className="text-sm text-gray-600 dark:text-gray-400">Avg Revenue/Vehicle</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                {formatCurrency(
                  analytics.summary.totalVehicles > 0 
                    ? analytics.summary.totalRevenue / analytics.summary.totalVehicles 
                    : 0
                )}
              </p>
            </div>
          </div>

          {/* Vehicle Performance Table */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden border border-gray-200 dark:border-gray-700">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Vehicle Performance</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Individual vehicle metrics and utilization</p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-800">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">Vehicle</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">Type</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">Service</th>
                    <th className="px-6 py-4 text-center text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">Completed</th>
                    <th className="px-6 py-4 text-right text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">Revenue</th>
                    <th className="px-6 py-4 text-right text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">Avg Value</th>
                    <th className="px-6 py-4 text-center text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {analytics.vehicleUtilization.map((vehicle, idx) => {
                    const completionRate = vehicle.total_bookings > 0 
                      ? (vehicle.completed_bookings / vehicle.total_bookings * 100).toFixed(0)
                      : 0;
                    return (
                      <tr key={vehicle.id} className="hover:bg-blue-50 dark:hover:bg-gray-700/50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className={`w-10 h-10 rounded-lg flex items-center justify-center font-bold text-white ${
                              idx % 4 === 0 ? 'bg-blue-500' :
                              idx % 4 === 1 ? 'bg-green-500' :
                              idx % 4 === 2 ? 'bg-purple-500' :
                              'bg-orange-500'
                            }`}>
                              {vehicle.license_plate.substring(0, 2)}
                            </div>
                            <div>
                              <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{vehicle.license_plate}</p>
                              <p className="text-xs text-gray-500 dark:text-gray-400">{completionRate}% completion</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400 capitalize">
                          <span className="inline-flex items-center px-2.5 py-1 rounded-md bg-gray-100 dark:bg-gray-700 text-xs font-medium">
                            {vehicle.truck_type}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm capitalize">
                          <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium ${
                            vehicle.service_type === 'rental' 
                              ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                              : 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400'
                          }`}>
                            {vehicle.service_type || 'transport'}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-center">
                          <div className="flex flex-col items-center gap-1">
                            <span className="font-semibold text-gray-900 dark:text-gray-100">
                              {vehicle.completed_bookings} / {vehicle.total_bookings}
                            </span>
                            <div className="w-20 h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                              <div 
                                className="h-full bg-green-500 rounded-full transition-all"
                                style={{ width: `${completionRate}%` }}
                              />
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-right font-bold text-gray-900 dark:text-gray-100">
                          {formatCurrency(vehicle.total_revenue)}
                        </td>
                        <td className="px-6 py-4 text-sm text-right text-purple-600 dark:text-purple-400 font-medium">
                          {formatCurrency(vehicle.avg_booking_value)}
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-semibold ${
                            vehicle.currently_active > 0 
                              ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' 
                              : vehicle.current_status === 'active'
                              ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400'
                              : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-400'
                          }`}>
                            <div className={`w-2 h-2 rounded-full ${
                              vehicle.currently_active > 0 ? 'bg-green-500 animate-pulse' : 'bg-gray-400'
                            }`} />
                            {vehicle.currently_active > 0 ? 'In Use' : 'Available'}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Routes Tab */}
      {activeTab === 'routes' && (
        <div className="space-y-6">
          {/* Routes Summary */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-gradient-to-br from-blue-500 to-blue-700 text-white rounded-xl p-6 shadow-lg">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-white/20 rounded-lg">
                  <MapPin className="w-6 h-6" />
                </div>
              </div>
              <p className="text-white/80 text-sm font-medium mb-1">Total Routes</p>
              <p className="text-3xl font-bold">{analytics.topRoutes.length}</p>
              <p className="text-white/70 text-xs mt-2">Unique city pairs</p>
            </div>

            <div className="bg-gradient-to-br from-green-500 to-emerald-600 text-white rounded-xl p-6 shadow-lg">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-white/20 rounded-lg">
                  <Target className="w-6 h-6" />
                </div>
              </div>
              <p className="text-white/80 text-sm font-medium mb-1">Top Route Revenue</p>
              <p className="text-3xl font-bold">
                {analytics.topRoutes.length > 0 ? formatCurrency(analytics.topRoutes[0].total_revenue) : '$0'}
              </p>
              <p className="text-white/70 text-xs mt-2">
                {analytics.topRoutes.length > 0 && `${analytics.topRoutes[0].pickup_city} → ${analytics.topRoutes[0].destination_city}`}
              </p>
            </div>

            <div className="bg-gradient-to-br from-purple-500 to-indigo-600 text-white rounded-xl p-6 shadow-lg">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-white/20 rounded-lg">
                  <BarChart3 className="w-6 h-6" />
                </div>
              </div>
              <p className="text-white/80 text-sm font-medium mb-1">Avg Route Revenue</p>
              <p className="text-3xl font-bold">
                {formatCurrency(
                  analytics.topRoutes.length > 0 
                    ? analytics.topRoutes.reduce((sum, r) => sum + parseFloat(r.total_revenue), 0) / analytics.topRoutes.length
                    : 0
                )}
              </p>
              <p className="text-white/70 text-xs mt-2">Per route average</p>
            </div>
          </div>

          {/* Top Routes Table */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden border border-gray-200 dark:border-gray-700">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Top Routes by Revenue</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Most profitable transportation routes</p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-800">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">Rank</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">Route</th>
                    <th className="px-6 py-4 text-center text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">Bookings</th>
                    <th className="px-6 py-4 text-right text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">Total Revenue</th>
                    <th className="px-6 py-4 text-right text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">Avg Revenue</th>
                    <th className="px-6 py-4 text-center text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">Success Rate</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {analytics.topRoutes.map((route, idx) => {
                    const completionRate = route.booking_count > 0 
                      ? ((route.completed_count / route.booking_count) * 100).toFixed(0)
                      : 0;
                    return (
                      <tr key={idx} className="hover:bg-blue-50 dark:hover:bg-gray-700/50 transition-colors">
                        <td className="px-6 py-4">
                          <div className={`w-10 h-10 rounded-lg flex items-center justify-center font-bold text-white ${
                            idx === 0 ? 'bg-gradient-to-br from-yellow-400 to-yellow-600' :
                            idx === 1 ? 'bg-gradient-to-br from-gray-300 to-gray-500' :
                            idx === 2 ? 'bg-gradient-to-br from-orange-400 to-orange-600' :
                            'bg-gradient-to-br from-blue-400 to-blue-600'
                          }`}>
                            #{idx + 1}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="flex items-center gap-2 text-sm">
                              <div className="flex items-center gap-2 font-medium text-gray-900 dark:text-gray-100">
                                <MapPin className="w-4 h-4 text-blue-500" />
                                <span>{route.pickup_city}</span>
                              </div>
                              <ArrowRight className="w-5 h-5 text-gray-400" />
                              <div className="flex items-center gap-2 font-medium text-gray-900 dark:text-gray-100">
                                <MapPin className="w-4 h-4 text-green-500" />
                                <span>{route.destination_city}</span>
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400">
                            {route.booking_count}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-right font-bold text-gray-900 dark:text-gray-100">
                          {formatCurrency(route.total_revenue)}
                        </td>
                        <td className="px-6 py-4 text-sm text-right text-purple-600 dark:text-purple-400 font-medium">
                          {formatCurrency(route.avg_revenue)}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex flex-col items-center gap-1">
                            <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
                              completionRate >= 80 
                                ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' :
                              completionRate >= 60 
                                ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400' :
                                'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                            }`}>
                              {completionRate}%
                            </span>
                            <div className="w-20 h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                              <div 
                                className={`h-full rounded-full transition-all ${
                                  completionRate >= 80 ? 'bg-green-500' :
                                  completionRate >= 60 ? 'bg-yellow-500' :
                                  'bg-red-500'
                                }`}
                                style={{ width: `${completionRate}%` }}
                              />
                            </div>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* PHASE 2: Performance Tab */}
      {activeTab === 'performance' && kpis && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* On-Time Delivery */}
            <div className="bg-gradient-to-br from-green-500 to-emerald-600 text-white rounded-xl p-6 shadow-lg">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-white/20 rounded-lg">
                  <Clock className="w-6 h-6" />
                </div>
              </div>
              <p className="text-white/80 text-sm font-medium mb-1">On-Time Delivery</p>
              <p className="text-3xl font-bold">
                {parseFloat(kpis.onTimeDelivery.on_time_percentage || 0).toFixed(1)}%
              </p>
              <p className="text-white/70 text-xs mt-2">
                {kpis.onTimeDelivery.on_time_deliveries} of {kpis.onTimeDelivery.total_completed} deliveries
              </p>
            </div>

            {/* Response Time */}
            <div className="bg-gradient-to-br from-blue-500 to-blue-700 text-white rounded-xl p-6 shadow-lg">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-white/20 rounded-lg">
                  <Zap className="w-6 h-6" />
                </div>
              </div>
              <p className="text-white/80 text-sm font-medium mb-1">Avg Response Time</p>
              <p className="text-3xl font-bold">
                {parseFloat(kpis.responseTime.avg_response_hours || 0).toFixed(1)}h
              </p>
              <p className="text-white/70 text-xs mt-2">
                Median: {parseFloat(kpis.responseTime.median_response_hours || 0).toFixed(1)}h
              </p>
            </div>

            {/* Customer Satisfaction */}
            <div className="bg-gradient-to-br from-purple-500 to-indigo-600 text-white rounded-xl p-6 shadow-lg">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-white/20 rounded-lg">
                  <Star className="w-6 h-6" />
                </div>
              </div>
              <p className="text-white/80 text-sm font-medium mb-1">Satisfaction Score</p>
              <p className="text-3xl font-bold">
                {parseFloat(kpis.satisfaction.avg_satisfaction_score || 0).toFixed(1)}/5.0
              </p>
              <p className="text-white/70 text-xs mt-2">
                {kpis.satisfaction.satisfied_customers} satisfied customers
              </p>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Performance Insights</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h4 className="font-medium text-gray-900 dark:text-gray-100">Delivery Performance</h4>
                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-600 dark:text-gray-400">On-Time Rate</span>
                      <span className="font-semibold">{parseFloat(kpis.onTimeDelivery.on_time_percentage || 0).toFixed(1)}%</span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                      <div
                        className="bg-green-500 h-3 rounded-full transition-all"
                        style={{ width: `${kpis.onTimeDelivery.on_time_percentage}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="font-medium text-gray-900 dark:text-gray-100">Response Metrics</h4>
                <div className="flex items-center justify-between p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Average</p>
                    <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                      {parseFloat(kpis.responseTime.avg_response_hours || 0).toFixed(1)}h
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-600 dark:text-gray-400">Median</p>
                    <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                      {parseFloat(kpis.responseTime.median_response_hours || 0).toFixed(1)}h
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* PHASE 2: Geographic Tab */}
      {activeTab === 'geographic' && geographic && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Top Cities by Revenue</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Geographic distribution of your business</p>
            </div>
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={geographic.cities} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
                <XAxis type="number" stroke="#9CA3AF" tickFormatter={(value) => `$${(value/1000).toFixed(0)}k`} />
                <YAxis dataKey="city" type="category" stroke="#9CA3AF" width={100} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1F2937', border: 'none', borderRadius: '0.75rem' }}
                  formatter={(value) => formatCurrency(value)}
                />
                <Bar dataKey="total_revenue" fill="#3B82F6" radius={[0, 8, 8, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {geographic.cities.slice(0, 6).map((city, idx) => (
              <div key={idx} className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Globe className="w-5 h-5 text-blue-500" />
                    <h4 className="font-semibold text-gray-900 dark:text-gray-100">{city.city}</h4>
                  </div>
                </div>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-1">
                  {formatCurrency(city.total_revenue)}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {city.booking_count} bookings • Avg: {formatCurrency(city.avg_revenue)}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* PHASE 2: Pricing Tab */}
      {activeTab === 'pricing' && pricing && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 gap-6">
            {pricing.pricing_comparison.map((item, idx) => (
              <div key={idx} className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 capitalize">
                      {item.truck_type}
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{item.booking_count} bookings</p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                    item.competitive_position === 'Competitive' 
                      ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                      : item.competitive_position === 'Below Market'
                      ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400'
                      : 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400'
                  }`}>
                    {item.competitive_position}
                  </span>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Your Average</p>
                    <p className="text-xl font-bold text-gray-900 dark:text-gray-100">
                      {formatCurrency(item.your_avg_price)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Market Average</p>
                    <p className="text-xl font-bold text-gray-900 dark:text-gray-100">
                      {formatCurrency(item.market_avg_price)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Your Range</p>
                    <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                      {formatCurrency(item.your_min_price)} - {formatCurrency(item.your_max_price)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Difference</p>
                    <p className={`text-xl font-bold ${
                      item.price_difference_percentage > 0 ? 'text-orange-600' : 'text-green-600'
                    }`}>
                      {item.price_difference_percentage > 0 ? '+' : ''}{item.price_difference_percentage.toFixed(1)}%
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                  <Tag className="w-4 h-4" />
                  <span>Competing with {item.competitor_count} other providers</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* PHASE 3: AI Insights Tab */}
      {activeTab === 'insights' && predictive && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-gradient-to-br from-purple-500 to-indigo-600 text-white rounded-xl p-6 shadow-lg">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-white/20 rounded-lg">
                  <Brain className="w-6 h-6" />
                </div>
              </div>
              <p className="text-white/80 text-sm font-medium mb-1">Growth Trend</p>
              <p className="text-3xl font-bold capitalize">
                {predictive.trend_direction || 'Building...'}
              </p>
              <p className="text-white/70 text-xs mt-2">
                {predictive.growth_rate 
                  ? `Growth rate: ${predictive.growth_rate.toFixed(2)} bookings/month`
                  : `${predictive.historical_trend?.length || 0} months of data collected`}
              </p>
            </div>

            {predictive.forecast && predictive.forecast.length > 0 ? (
              predictive.forecast.map((month, idx) => (
                <div key={idx} className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
                  <div className="flex items-center gap-2 mb-4">
                    <TrendingUp className="w-5 h-5 text-blue-500" />
                    <h4 className="font-semibold text-gray-900 dark:text-gray-100">
                      Next {month.month} Month{month.month > 1 ? 's' : ''}
                    </h4>
                  </div>
                  <p className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-1">
                    {month.predicted_bookings} bookings
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Predicted revenue: {formatCurrency(month.predicted_revenue)}
                  </p>
                  <div className="mt-2">
                    <span className="text-xs px-2 py-1 rounded bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400">
                      {month.confidence} confidence
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="md:col-span-2 bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 rounded-xl p-6 border-2 border-dashed border-amber-300 dark:border-amber-700">
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-amber-100 dark:bg-amber-800/50 rounded-lg">
                    <TrendingUp className="w-6 h-6 text-amber-600 dark:text-amber-400" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-amber-900 dark:text-amber-100 mb-2">
                      Building Your Forecast Model
                    </h4>
                    <p className="text-sm text-amber-800 dark:text-amber-300 mb-3">
                      {predictive.message || 'Need at least 1 month of booking history to generate accurate predictions.'}
                    </p>
                    <div className="flex items-center gap-2 text-xs text-amber-700 dark:text-amber-400">
                      <div className="flex items-center gap-1">
                        <Package className="w-4 h-4" />
                        <span>{predictive.historical_trend?.length || 0} months collected</span>
                      </div>
                      <span>•</span>
                      <span>{Math.max(0, 1 - (predictive.historical_trend?.length || 0))} more needed</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {predictive.historical_trend && predictive.historical_trend.length > 0 && (
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
              <div className="flex justify-between items-center mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Historical Trend & Forecast</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    Past performance and predicted future bookings
                  </p>
                </div>
                <div className="flex gap-4 text-xs">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                    <span className="text-gray-600 dark:text-gray-400">Actual</span>
                  </div>
                  {predictive.forecast && predictive.forecast.length > 0 && (
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                      <span className="text-gray-600 dark:text-gray-400">Forecast</span>
                    </div>
                  )}
                </div>
              </div>
              <ResponsiveContainer width="100%" height={350}>
                <LineChart data={(() => {
                  // Combine historical and forecast data
                  const historical = predictive.historical_trend.map(item => ({
                    month: item.month,
                    actual_bookings: parseInt(item.booking_count),
                    forecast_bookings: null
                  }));
                  
                  if (predictive.forecast && predictive.forecast.length > 0) {
                    // Get last historical date
                    const lastDate = new Date(predictive.historical_trend[predictive.historical_trend.length - 1].month);
                    
                    // Add forecast months
                    predictive.forecast.forEach((forecast, idx) => {
                      const forecastDate = new Date(lastDate);
                      forecastDate.setMonth(lastDate.getMonth() + idx + 1);
                      
                      historical.push({
                        month: forecastDate.toISOString(),
                        actual_bookings: null,
                        forecast_bookings: forecast.predicted_bookings
                      });
                    });
                    
                    // Add connecting point (last actual = first forecast)
                    if (historical.length > predictive.historical_trend.length) {
                      historical[predictive.historical_trend.length - 1].forecast_bookings = 
                        historical[predictive.historical_trend.length - 1].actual_bookings;
                    }
                  }
                  
                  return historical;
                })()}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
                  <XAxis 
                    dataKey="month" 
                    stroke="#9CA3AF"
                    style={{ fontSize: '12px' }}
                    tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', year: '2-digit' })}
                  />
                  <YAxis 
                    stroke="#9CA3AF" 
                    style={{ fontSize: '12px' }}
                    label={{ value: 'Bookings', angle: -90, position: 'insideLeft', style: { fill: '#9CA3AF' } }}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#1F2937', 
                      border: 'none', 
                      borderRadius: '0.75rem',
                      boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.3)'
                    }}
                    labelStyle={{ color: '#F9FAFB', fontWeight: '600' }}
                    labelFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                  />
                  <Legend wrapperStyle={{ paddingTop: '20px' }} />
                  <Line 
                    type="monotone" 
                    dataKey="actual_bookings" 
                    stroke="#8B5CF6" 
                    strokeWidth={3} 
                    name="Actual Bookings"
                    dot={{ fill: '#8B5CF6', r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                  {predictive.forecast && predictive.forecast.length > 0 && (
                    <Line 
                      type="monotone" 
                      dataKey="forecast_bookings" 
                      stroke="#10B981" 
                      strokeWidth={3} 
                      strokeDasharray="5 5"
                      name="Predicted Bookings"
                      dot={{ fill: '#10B981', r: 4 }}
                      activeDot={{ r: 6 }}
                    />
                  )}
                </LineChart>
              </ResponsiveContainer>
              
              <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                <div className="flex items-start gap-3">
                  <Brain className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-1">AI Forecast Insight</h4>
                    <p className="text-sm text-blue-800 dark:text-blue-300">
                      {predictive.forecast && predictive.forecast.length > 0 ? (
                        <>
                          Based on your {predictive.historical_trend.length} months of data, your business is <strong className="capitalize">{predictive.trend_direction.toLowerCase()}</strong>.
                          {predictive.trend_direction === 'Growing' && " Keep up the great work! Consider expanding your fleet to meet increasing demand."}
                          {predictive.trend_direction === 'Declining' && " Consider marketing campaigns or competitive pricing to boost bookings."}
                          {predictive.trend_direction === 'Stable' && " Your business is consistent. Focus on customer retention and service quality."}
                        </>
                      ) : (
                        <>
                          You currently have <strong>{predictive.historical_trend.length} month{predictive.historical_trend.length !== 1 ? 's' : ''}</strong> of booking data. 
                          Continue accepting bookings to unlock AI-powered forecasting! With <strong>{Math.max(0, 1 - predictive.historical_trend.length)} more month{Math.max(0, 1 - predictive.historical_trend.length) !== 1 ? 's' : ''}</strong> of data, 
                          we'll predict your future bookings and revenue with machine learning algorithms.
                        </>
                      )}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* PHASE 3: Customers Tab */}
      {activeTab === 'customers' && customers && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-gradient-to-br from-blue-500 to-blue-700 text-white rounded-xl p-6 shadow-lg">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-white/20 rounded-lg">
                  <Users className="w-6 h-6" />
                </div>
              </div>
              <p className="text-white/80 text-sm font-medium mb-1">Total Customers</p>
              <p className="text-3xl font-bold">{customers.overview.total_customers}</p>
            </div>

            <div className="bg-gradient-to-br from-green-500 to-emerald-600 text-white rounded-xl p-6 shadow-lg">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-white/20 rounded-lg">
                  <Award className="w-6 h-6" />
                </div>
              </div>
              <p className="text-white/80 text-sm font-medium mb-1">Repeat Rate</p>
              <p className="text-3xl font-bold">
                {parseFloat(customers.overview.repeat_rate || 0).toFixed(1)}%
              </p>
              <p className="text-white/70 text-xs mt-2">
                {customers.overview.repeat_customers} repeat customers
              </p>
            </div>

            <div className="bg-gradient-to-br from-purple-500 to-indigo-600 text-white rounded-xl p-6 shadow-lg">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-white/20 rounded-lg">
                  <DollarSign className="w-6 h-6" />
                </div>
              </div>
              <p className="text-white/80 text-sm font-medium mb-1">Avg Lifetime Value</p>
              <p className="text-3xl font-bold">
                {formatCurrency(customers.overview.avg_customer_lifetime_value)}
              </p>
            </div>

            <div className="bg-gradient-to-br from-orange-500 to-red-600 text-white rounded-xl p-6 shadow-lg">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-white/20 rounded-lg">
                  <Star className="w-6 h-6" />
                </div>
              </div>
              <p className="text-white/80 text-sm font-medium mb-1">Top Customer Value</p>
              <p className="text-3xl font-bold">
                {formatCurrency(customers.overview.highest_customer_value)}
              </p>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden border border-gray-200 dark:border-gray-700">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Top Customers by Lifetime Value</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Your most valuable customers</p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-800">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase">Customer</th>
                    <th className="px-6 py-4 text-center text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase">Bookings</th>
                    <th className="px-6 py-4 text-right text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase">Lifetime Value</th>
                    <th className="px-6 py-4 text-right text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase">Last Booking</th>
                    <th className="px-6 py-4 text-center text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {customers.top_customers.map((customer, idx) => {
                    const daysSince = parseInt(customer.days_since_last_booking);
                    const status = daysSince < 30 ? 'Active' : daysSince < 90 ? 'Recent' : 'Inactive';
                    return (
                      <tr key={idx} className="hover:bg-blue-50 dark:hover:bg-gray-700/50">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold">
                              {(customer.customer_name || 'Unknown')[0]}
                            </div>
                            <div>
                              <p className="font-medium text-gray-900 dark:text-gray-100">
                                {customer.customer_name || 'Unknown Customer'}
                              </p>
                              <p className="text-sm text-gray-500 dark:text-gray-400">
                                {daysSince} days since last booking
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400">
                            {customer.total_bookings}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right font-bold text-gray-900 dark:text-gray-100">
                          {formatCurrency(customer.lifetime_value)}
                        </td>
                        <td className="px-6 py-4 text-right text-sm text-gray-600 dark:text-gray-400">
                          {new Date(customer.last_booking_date).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
                            status === 'Active' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' :
                            status === 'Recent' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400' :
                            'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-400'
                          }`}>
                            {status}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
        </div>
      </div>
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
