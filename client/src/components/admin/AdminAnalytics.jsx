import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { apiClient } from '../../utils/apiClient';
import { 
  LineChart as LineChartIcon, BarChart3, TrendingUp, TrendingDown, PieChart as PieChartIcon, Filter, Calendar, 
  Users, Package, CheckCircle, XCircle, Clock, DollarSign, Truck, 
  ArrowUpRight, ArrowDownRight, Activity, Target, Zap
} from 'lucide-react';
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, AreaChart, Area,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell
} from 'recharts';

const AdminAnalytics = () => {
  const { t } = useTranslation();
  const [bookings, setBookings] = useState([]);
  const [trucks, setTrucks] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState({ preset: '30d', from: '', to: '' });
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [bookingsResponse, trucksResponse, usersResponse] = await Promise.all([
        apiClient.get('/bookings'),
        apiClient.get('/trucks').catch(() => ({ data: { data: [] } })),
        apiClient.get('/admin/users').catch(() => ({ data: { users: [] } }))
      ]);

      const allBookings = Array.isArray(bookingsResponse.data.data?.bookings) 
        ? bookingsResponse.data.data.bookings 
        : [];
      const allTrucks = Array.isArray(trucksResponse.data.data) 
        ? trucksResponse.data.data 
        : [];
      const allUsers = Array.isArray(usersResponse.data.users) 
        ? usersResponse.data.users 
        : [];
      
      setBookings(allBookings);
      setTrucks(allTrucks);
      setUsers(allUsers);
    } catch (error) {
      console.error('Failed to fetch analytics data', error);
      // Set empty arrays on error
      setBookings([]);
      setTrucks([]);
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  const filtered = useMemo(() => {
    // Ensure bookings is always an array
    const safeBookings = Array.isArray(bookings) ? bookings : [];
    
    if (!dateRange.from || !dateRange.to) return safeBookings;
    const fromTs = new Date(dateRange.from).getTime();
    const toTs = new Date(dateRange.to).getTime();
    return safeBookings.filter(b => {
      const ts = new Date(b.created_at || b.updated_at || Date.now()).getTime();
      return ts >= fromTs && ts <= toTs;
    });
  }, [bookings, dateRange]);

  const kpis = useMemo(() => {
    // Ensure we always have arrays
    const safeFiltered = Array.isArray(filtered) ? filtered : [];
    const safeBookings = Array.isArray(bookings) ? bookings : [];
    
    const total = safeFiltered.length;
    const byStatus = (s) => safeFiltered.filter(b => b.status === s).length;
    const pending = byStatus('pending');
    const approved = byStatus('approved');
    const active = byStatus('active');
    const inTransit = byStatus('in_transit');
    const completed = byStatus('completed');
    const cancelled = byStatus('cancelled');

    const completionRate = total ? Math.round((completed / total) * 100) : 0;
    const approvalRate = total ? Math.round((approved / safeFiltered.filter(b => b.status !== 'cancelled').length) * 100) : 0;
    const cancellationRate = total ? Math.round((cancelled / total) * 100) : 0;

    const totalRevenue = safeFiltered
      .filter(b => b.status === 'completed')
      .reduce((sum, b) => sum + (parseFloat(b.total_price) || 0), 0);
    
    const avgBookingValue = completed > 0 ? totalRevenue / completed : 0;
    
    // Calculate growth (comparing to previous period)
    const today = new Date();
    const thirtyDaysAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
    const sixtyDaysAgo = new Date(today.getTime() - 60 * 24 * 60 * 60 * 1000);
    
    const currentPeriod = safeBookings.filter(b => {
      const date = new Date(b.created_at);
      return date >= thirtyDaysAgo && date <= today;
    }).length;
    
    const previousPeriod = safeBookings.filter(b => {
      const date = new Date(b.created_at);
      return date >= sixtyDaysAgo && date < thirtyDaysAgo;
    }).length;
    
    const growthRate = previousPeriod > 0 
      ? Math.round(((currentPeriod - previousPeriod) / previousPeriod) * 100) 
      : 0;

    return { 
      total, pending, approved, active, inTransit, completed, cancelled, 
      completionRate, approvalRate, cancellationRate, totalRevenue, 
      avgBookingValue, growthRate, currentPeriod, previousPeriod
    };
  }, [filtered, bookings]);

  const platformStats = useMemo(() => {
    // Ensure we always have arrays
    const safeUsers = Array.isArray(users) ? users : [];
    const safeTrucks = Array.isArray(trucks) ? trucks : [];
    
    const providers = safeUsers.filter(u => u.role === 'provider').length;
    const customers = safeUsers.filter(u => u.role === 'customer').length;
    const totalUsers = safeUsers.length;
    const activeTrucks = safeTrucks.filter(t => t.availability_status === 'available').length;
    const totalTrucks = safeTrucks.length;
    const utilizationRate = totalTrucks > 0 ? Math.round(((totalTrucks - activeTrucks) / totalTrucks) * 100) : 0;

    return { providers, customers, totalUsers, activeTrucks, totalTrucks, utilizationRate };
  }, [users, trucks]);

  const byService = useMemo(() => {
    // Ensure we always have arrays
    const safeFiltered = Array.isArray(filtered) ? filtered : [];
    
    const transport = safeFiltered.filter(b => b.service_type === 'transport');
    const rental = safeFiltered.filter(b => b.service_type === 'rental');
    return {
      transport: {
        count: transport.length,
        revenue: transport.filter(b => b.status === 'completed').reduce((s, b) => s + (parseFloat(b.total_price) || 0), 0)
      },
      rental: {
        count: rental.length,
        revenue: rental.filter(b => b.status === 'completed').reduce((s, b) => s + (parseFloat(b.total_price) || 0), 0)
      }
    };
  }, [filtered]);

  // Chart Data
  const bookingsTrendData = useMemo(() => {
    const safeFiltered = Array.isArray(filtered) ? filtered : [];
    const last30Days = [];
    const today = new Date();
    
    for (let i = 29; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      
      const count = safeFiltered.filter(b => {
        const bookingDate = new Date(b.created_at).toISOString().split('T')[0];
        return bookingDate === dateStr;
      }).length;
      
      last30Days.push({
        date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        bookings: count
      });
    }
    
    return last30Days;
  }, [filtered]);

  const statusPieData = useMemo(() => {
    return [
      { name: 'Completed', value: kpis.completed, color: '#10B981' },
      { name: 'In Transit', value: kpis.inTransit, color: '#6366F1' },
      { name: 'Active', value: kpis.active, color: '#8B5CF6' },
      { name: 'Approved', value: kpis.approved, color: '#3B82F6' },
      { name: 'Pending', value: kpis.pending, color: '#F59E0B' },
      { name: 'Cancelled', value: kpis.cancelled, color: '#EF4444' }
    ].filter(item => item.value > 0);
  }, [kpis]);

  const revenueByServiceData = useMemo(() => {
    return [
      { name: 'Transportation', revenue: byService.transport.revenue, bookings: byService.transport.count },
      { name: 'Rental', revenue: byService.rental.revenue, bookings: byService.rental.count }
    ];
  }, [byService]);

  const dailyRevenueData = useMemo(() => {
    const safeFiltered = Array.isArray(filtered) ? filtered : [];
    const last30Days = [];
    const today = new Date();
    
    for (let i = 29; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      
      const dayRevenue = safeFiltered
        .filter(b => {
          const bookingDate = new Date(b.created_at).toISOString().split('T')[0];
          return bookingDate === dateStr && b.status === 'completed';
        })
        .reduce((sum, b) => sum + (parseFloat(b.total_price) || 0), 0);
      
      last30Days.push({
        date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        revenue: Math.round(dayRevenue)
      });
    }
    
    return last30Days;
  }, [filtered]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading analytics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 sm:mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
              <Activity className="h-8 w-8 text-primary-600" />
              Analytics Dashboard
            </h1>
            <p className="mt-1 text-sm sm:text-base text-gray-600 dark:text-gray-400">
              Real-time insights into your business performance
            </p>
          </div>
          <Link 
            to="/admin/bookings" 
            className="mt-3 sm:mt-0 text-sm text-primary-600 hover:text-accent-600 transition-colors font-medium"
          >
            ← Back to Bookings
          </Link>
        </div>

        {/* Tabs */}
        <div className="mb-6 border-b border-gray-200 dark:border-gray-700">
          <nav className="-mb-px flex space-x-4 sm:space-x-8 overflow-x-auto">
            {['overview', 'bookings', 'revenue'].map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`whitespace-nowrap pb-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === tab
                    ? 'border-primary-600 text-primary-600 dark:border-primary-400 dark:text-primary-400'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                }`}
              >
                {t(`admin.analytics.tabs.${tab}`)}
              </button>
            ))}
          </nav>
        </div>

        {/* Filters */}
        <div className="bg-white dark:bg-gray-800 shadow-sm rounded-lg p-4 mb-6">
          <div className="flex flex-wrap items-end gap-3">
            <div className="flex-1 min-w-[120px]">
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                <Calendar className="h-3 w-3 inline mr-1" />
                Time Period
              </label>
              <select
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 rounded-md text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                value={dateRange.preset}
                onChange={(e) => setDateRange(prev => ({ ...prev, preset: e.target.value }))}
              >
                <option value="7d">Last 7 days</option>
                <option value="30d">Last 30 days</option>
                <option value="90d">Last 90 days</option>
                <option value="custom">Custom Range</option>
              </select>
            </div>
            {dateRange.preset === 'custom' && (
              <>
                <div className="flex-1 min-w-[120px]">
                  <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">From</label>
                  <input 
                    type="date" 
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 rounded-md text-sm focus:ring-2 focus:ring-primary-500"
                    value={dateRange.from} 
                    onChange={(e) => setDateRange(prev => ({ ...prev, from: e.target.value }))} 
                  />
                </div>
                <div className="flex-1 min-w-[120px]">
                  <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">To</label>
                  <input 
                    type="date" 
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 rounded-md text-sm focus:ring-2 focus:ring-primary-500"
                    value={dateRange.to} 
                    onChange={(e) => setDateRange(prev => ({ ...prev, to: e.target.value }))} 
                  />
                </div>
              </>
            )}
          </div>
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <>
            {/* Top KPIs */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6">
              <MetricCard 
                title={t('admin.analytics.metrics.totalRevenue')}
                value={kpis.totalRevenue.toLocaleString('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0 })} 
                icon={DollarSign} 
                trend={kpis.growthRate}
                color="bg-gradient-to-br from-green-500 to-emerald-600"
              />
              <MetricCard 
                title={t('admin.analytics.metrics.totalBookings')}
                value={kpis.total} 
                icon={Package} 
                subtitle={`${kpis.currentPeriod} ${t('admin.analytics.metrics.thisMonth')}`}
                color="bg-gradient-to-br from-blue-500 to-primary-600"
              />
              <MetricCard 
                title={t('admin.analytics.metrics.completionRate')}
                value={`${kpis.completionRate}%`} 
                icon={Target} 
                subtitle={`${kpis.completed} ${t('admin.analytics.metrics.completed')}`}
                color="bg-gradient-to-br from-purple-500 to-indigo-600"
              />
              <MetricCard 
                title={t('admin.analytics.metrics.activeUsers')}
                value={platformStats.totalUsers} 
                icon={Users} 
                subtitle={`${platformStats.providers} ${t('admin.analytics.metrics.providers')}`}
                color="bg-gradient-to-br from-orange-500 to-accent-600"
              />
            </div>

            {/* Platform Overview */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              {/* Platform Stats */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
                  <Zap className="h-5 w-5 text-accent-500" />
                  Platform Statistics
                </h3>
                <div className="space-y-4">
                  <StatRow label="Total Providers" value={platformStats.providers} icon={Truck} color="text-blue-600" />
                  <StatRow label="Total Customers" value={platformStats.customers} icon={Users} color="text-green-600" />
                  <StatRow label="Active Trucks" value={`${platformStats.activeTrucks} / ${platformStats.totalTrucks}`} icon={Truck} color="text-orange-600" />
                  <StatRow label="Fleet Utilization" value={`${platformStats.utilizationRate}%`} icon={Activity} color="text-purple-600" />
                </div>
              </div>

              {/* Quick Stats */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-primary-600" />
                  Performance Metrics
                </h3>
                <div className="space-y-4">
                  <StatRow 
                    label="Avg. Booking Value" 
                    value={kpis.avgBookingValue.toLocaleString('en-US', { style: 'currency', currency: 'USD' })} 
                    icon={DollarSign} 
                    color="text-green-600" 
                  />
                  <StatRow label="Approval Rate" value={`${kpis.approvalRate}%`} icon={CheckCircle} color="text-blue-600" />
                  <StatRow label="Cancellation Rate" value={`${kpis.cancellationRate}%`} icon={XCircle} color="text-red-600" />
                  <StatRow 
                    label="Growth (30d)" 
                    value={`${kpis.growthRate > 0 ? '+' : ''}${kpis.growthRate}%`} 
                    icon={kpis.growthRate >= 0 ? TrendingUp : TrendingDown} 
                    color={kpis.growthRate >= 0 ? 'text-green-600' : 'text-red-600'} 
                  />
                </div>
              </div>
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              {/* Bookings Trend Chart */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
                  <LineChartIcon className="h-5 w-5 text-primary-600" />
                  Bookings Trend (Last 30 Days)
                </h3>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={bookingsTrendData}>
                    <defs>
                      <linearGradient id="colorBookings" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#1E3A8A" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="#1E3A8A" stopOpacity={0.1}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis 
                      dataKey="date" 
                      tick={{ fontSize: 12 }} 
                      stroke="#6b7280"
                    />
                    <YAxis tick={{ fontSize: 12 }} stroke="#6b7280" />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: '#fff', 
                        border: '1px solid #e5e7eb',
                        borderRadius: '8px'
                      }}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="bookings" 
                      stroke="#1E3A8A" 
                      fillOpacity={1} 
                      fill="url(#colorBookings)" 
                      strokeWidth={2}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              {/* Status Distribution Pie Chart */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
                  <PieChartIcon className="h-5 w-5 text-accent-500" />
                  Bookings by Status
                </h3>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={statusPieData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {statusPieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </>
        )}

        {/* Bookings Tab */}
        {activeTab === 'bookings' && (
          <>
            {/* Status Breakdown */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4 mb-6">
              <StatusCard label="Pending" value={kpis.pending} icon={Clock} color="bg-yellow-500" />
              <StatusCard label="Approved" value={kpis.approved} icon={CheckCircle} color="bg-blue-500" />
              <StatusCard label="In Transit" value={kpis.inTransit} icon={TrendingUp} color="bg-indigo-500" />
              <StatusCard label="Active" value={kpis.active} icon={Activity} color="bg-purple-500" />
              <StatusCard label="Completed" value={kpis.completed} icon={CheckCircle} color="bg-green-500" />
              <StatusCard label="Cancelled" value={kpis.cancelled} icon={XCircle} color="bg-red-500" />
            </div>

            {/* Service Type Breakdown */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <ServiceCard 
                title="Transportation" 
                count={byService.transport.count} 
                revenue={byService.transport.revenue} 
                percentage={kpis.total > 0 ? Math.round((byService.transport.count / kpis.total) * 100) : 0}
                color="from-blue-500 to-primary-600"
              />
              <ServiceCard 
                title="Rental" 
                count={byService.rental.count} 
                revenue={byService.rental.revenue} 
                percentage={kpis.total > 0 ? Math.round((byService.rental.count / kpis.total) * 100) : 0}
                color="from-orange-500 to-accent-600"
              />
            </div>

            {/* Service Comparison Bar Chart */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 mb-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-6 flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-primary-600" />
                Service Type Comparison
              </h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={revenueByServiceData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="name" tick={{ fontSize: 12 }} stroke="#6b7280" />
                  <YAxis yAxisId="left" tick={{ fontSize: 12 }} stroke="#6b7280" />
                  <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 12 }} stroke="#6b7280" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#fff', 
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px'
                    }}
                  />
                  <Legend />
                  <Bar yAxisId="left" dataKey="bookings" fill="#3B82F6" name="Bookings" radius={[8, 8, 0, 0]} />
                  <Bar yAxisId="right" dataKey="revenue" fill="#F97316" name="Revenue ($)" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Conversion Funnel */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-6 flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-primary-600" />
                Booking Conversion Funnel
              </h3>
              <div className="space-y-3">
                <FunnelBar label="Total Requests" value={kpis.total} max={kpis.total} percentage={100} />
                <FunnelBar label="Approved" value={kpis.approved} max={kpis.total} percentage={kpis.total > 0 ? Math.round((kpis.approved / kpis.total) * 100) : 0} />
                <FunnelBar label="In Progress" value={kpis.inTransit + kpis.active} max={kpis.total} percentage={kpis.total > 0 ? Math.round(((kpis.inTransit + kpis.active) / kpis.total) * 100) : 0} />
                <FunnelBar label="Completed" value={kpis.completed} max={kpis.total} percentage={kpis.completionRate} />
              </div>
            </div>
          </>
        )}

        {/* Revenue Tab */}
        {activeTab === 'revenue' && (
          <>
            {/* Revenue KPIs */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-6">
              <RevenueCard 
                title="Total Revenue" 
                value={kpis.totalRevenue} 
                icon={DollarSign} 
                color="text-green-600"
              />
              <RevenueCard 
                title="Transport Revenue" 
                value={byService.transport.revenue} 
                icon={Truck} 
                color="text-blue-600"
                percentage={kpis.totalRevenue > 0 ? Math.round((byService.transport.revenue / kpis.totalRevenue) * 100) : 0}
              />
              <RevenueCard 
                title="Rental Revenue" 
                value={byService.rental.revenue} 
                icon={Package} 
                color="text-orange-600"
                percentage={kpis.totalRevenue > 0 ? Math.round((byService.rental.revenue / kpis.totalRevenue) * 100) : 0}
              />
            </div>

            {/* Revenue Trend Chart */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 mb-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-6 flex items-center gap-2">
                <LineChartIcon className="h-5 w-5 text-green-600" />
                Revenue Trend (Last 30 Days)
              </h3>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={dailyRevenueData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis 
                    dataKey="date" 
                    tick={{ fontSize: 12 }} 
                    stroke="#6b7280"
                  />
                  <YAxis 
                    tick={{ fontSize: 12 }} 
                    stroke="#6b7280"
                    tickFormatter={(value) => `$${value}`}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#fff', 
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px'
                    }}
                    formatter={(value) => [`$${value}`, 'Revenue']}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="revenue" 
                    stroke="#10B981" 
                    strokeWidth={3}
                    dot={{ fill: '#10B981', r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Revenue Breakdown */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-6">Revenue Analysis</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">By Service Type</h4>
                  <div className="space-y-3">
                    <RevenueBar 
                      label="Transportation" 
                      value={byService.transport.revenue} 
                      max={kpis.totalRevenue} 
                      color="bg-blue-500"
                    />
                    <RevenueBar 
                      label="Rental" 
                      value={byService.rental.revenue} 
                      max={kpis.totalRevenue} 
                      color="bg-orange-500"
                    />
                  </div>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Key Metrics</h4>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Average Booking Value</span>
                      <span className="font-semibold text-gray-900 dark:text-gray-100">
                        {kpis.avgBookingValue.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}
                      </span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Completed Bookings</span>
                      <span className="font-semibold text-gray-900 dark:text-gray-100">{kpis.completed}</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Revenue per Booking</span>
                      <span className="font-semibold text-gray-900 dark:text-gray-100">
                        {kpis.avgBookingValue.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}

      </div>
    </div>
  );
};

// Improved Component Definitions
const MetricCard = ({ title, value, icon: Icon, trend, subtitle, color }) => (
  <div className={`${color} text-white rounded-lg shadow-lg p-6 transform transition-all hover:scale-105`}>
    <div className="flex items-center justify-between mb-2">
      <Icon className="h-8 w-8 opacity-80" />
      {trend !== undefined && (
        <div className="flex items-center text-sm font-medium">
          {trend >= 0 ? <ArrowUpRight className="h-4 w-4" /> : <ArrowDownRight className="h-4 w-4" />}
          <span>{Math.abs(trend)}%</span>
        </div>
      )}
    </div>
    <div className="text-3xl font-bold mb-1">{value}</div>
    <div className="text-sm opacity-90">{subtitle || title}</div>
  </div>
);

const StatRow = ({ label, value, icon: Icon, color }) => (
  <div className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-gray-700 last:border-0">
    <div className="flex items-center gap-2">
      <Icon className={`h-4 w-4 ${color}`} />
      <span className="text-sm text-gray-600 dark:text-gray-400">{label}</span>
    </div>
    <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">{value}</span>
  </div>
);

const StatusCard = ({ label, value, icon: Icon, color }) => (
  <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 border-l-4" style={{ borderColor: color }}>
    <div className="flex items-center gap-2 mb-2">
      <Icon className={`h-4 w-4 ${color.replace('bg-', 'text-')}`} />
      <span className="text-xs text-gray-600 dark:text-gray-400">{label}</span>
    </div>
    <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">{value}</div>
  </div>
);

const ServiceCard = ({ title, count, revenue, percentage, color }) => (
  <div className={`bg-gradient-to-br ${color} text-white rounded-lg shadow-lg p-6`}>
    <h3 className="text-lg font-semibold mb-4">{title}</h3>
    <div className="space-y-3">
      <div>
        <div className="text-sm opacity-90">Bookings</div>
        <div className="text-3xl font-bold">{count}</div>
      </div>
      <div>
        <div className="text-sm opacity-90">Revenue</div>
        <div className="text-2xl font-bold">
          {revenue.toLocaleString('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0 })}
        </div>
      </div>
      <div className="pt-2 border-t border-white border-opacity-20">
        <div className="text-sm opacity-90">{percentage}% of total bookings</div>
      </div>
    </div>
  </div>
);

const FunnelBar = ({ label, value, max, percentage }) => (
  <div>
    <div className="flex items-center justify-between text-sm mb-1">
      <span className="text-gray-700 dark:text-gray-300">{label}</span>
      <span className="font-semibold text-gray-900 dark:text-gray-100">{value} ({percentage}%)</span>
    </div>
    <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
      <div 
        className="h-full bg-gradient-to-r from-primary-500 to-accent-500 flex items-center justify-end px-3 text-white text-xs font-medium transition-all duration-500"
        style={{ width: `${percentage}%` }}
      >
        {percentage > 10 && `${percentage}%`}
      </div>
    </div>
  </div>
);

const RevenueCard = ({ title, value, icon: Icon, color, percentage }) => (
  <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
    <div className="flex items-center justify-between mb-3">
      <Icon className={`h-6 w-6 ${color}`} />
      {percentage !== undefined && (
        <span className="text-xs font-medium text-gray-500 dark:text-gray-400">{percentage}%</span>
      )}
    </div>
    <div className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-1">
      {value.toLocaleString('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0 })}
    </div>
    <div className="text-sm text-gray-600 dark:text-gray-400">{title}</div>
  </div>
);

const RevenueBar = ({ label, value, max, color }) => {
  const percentage = max > 0 ? Math.round((value / max) * 100) : 0;
  return (
    <div>
      <div className="flex items-center justify-between text-sm mb-1">
        <span className="text-gray-700 dark:text-gray-300">{label}</span>
        <span className="font-semibold text-gray-900 dark:text-gray-100">
          {value.toLocaleString('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0 })}
        </span>
      </div>
      <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
        <div 
          className={`h-full ${color} transition-all duration-500`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
};

export default AdminAnalytics;

