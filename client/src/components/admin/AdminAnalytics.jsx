import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { apiClient } from '../../utils/apiClient';
import { LineChart, BarChart3, TrendingUp, TrendingDown, PieChart, Filter, Calendar, Users, Package, CheckCircle, XCircle, Clock } from 'lucide-react';

const AdminAnalytics = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState({ preset: '30d', from: '', to: '' });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [bookingsResponse] = await Promise.all([
        apiClient.get('/bookings')
      ]);

      const allBookings = bookingsResponse.data.data?.bookings || [];
      setBookings(allBookings);
    } catch (error) {
      console.error('Failed to fetch analytics data', error);
    } finally {
      setLoading(false);
    }
  };

  const filtered = useMemo(() => {
    if (!dateRange.from || !dateRange.to) return bookings;
    const fromTs = new Date(dateRange.from).getTime();
    const toTs = new Date(dateRange.to).getTime();
    return bookings.filter(b => {
      const ts = new Date(b.created_at || b.updated_at || Date.now()).getTime();
      return ts >= fromTs && ts <= toTs;
    });
  }, [bookings, dateRange]);

  const kpis = useMemo(() => {
    const total = filtered.length;
    const byStatus = (s) => filtered.filter(b => b.status === s).length;
    const approved = byStatus('approved');
    const active = byStatus('active');
    const inTransit = byStatus('in_transit');
    const completed = byStatus('completed');
    const cancelled = byStatus('cancelled');

    const completionRate = total ? Math.round((completed / total) * 100) : 0;
    const approvalRate = total ? Math.round((approved / filtered.filter(b => b.status !== 'cancelled').length) * 100) : 0;

    const totalRevenue = filtered
      .filter(b => b.status === 'completed')
      .reduce((sum, b) => sum + (parseFloat(b.total_price) || 0), 0);

    return { total, approved, active, inTransit, completed, cancelled, completionRate, approvalRate, totalRevenue };
  }, [filtered]);

  const byService = useMemo(() => {
    const transport = filtered.filter(b => b.service_type === 'transport');
    const rental = filtered.filter(b => b.service_type === 'rental');
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 dark:bg-gray-900 dark:bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 dark:bg-gray-900 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Analytics</h1>
            <p className="text-gray-600 dark:text-gray-400 dark:text-gray-500 dark:text-gray-400 dark:text-gray-500 dark:text-gray-400 dark:text-gray-500">Trends, funnels, and breakdowns across bookings and revenue.</p>
          </div>
          <Link to="/admin/bookings" className="text-sm text-primary-600 hover:text-accent-600 transition-colors">Back to Bookings</Link>
        </div>

        {/* Filters */}
        <div className="bg-white dark:bg-gray-800 dark:bg-gray-800 dark:bg-gray-800 shadow rounded-lg p-4 mb-6">
          <div className="flex flex-wrap items-end gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 dark:text-gray-500 dark:text-gray-400 dark:text-gray-500 dark:text-gray-400 dark:text-gray-500 mb-1">Preset</label>
              <select
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm"
                value={dateRange.preset}
                onChange={(e) => setDateRange(prev => ({ ...prev, preset: e.target.value }))}
              >
                <option value="7d">Last 7 days</option>
                <option value="30d">Last 30 days</option>
                <option value="90d">Last 90 days</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 dark:text-gray-500 dark:text-gray-400 dark:text-gray-500 dark:text-gray-400 dark:text-gray-500 mb-1">From</label>
              <input type="date" className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm" value={dateRange.from} onChange={(e) => setDateRange(prev => ({ ...prev, from: e.target.value }))} />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 dark:text-gray-500 dark:text-gray-400 dark:text-gray-500 dark:text-gray-400 dark:text-gray-500 mb-1">To</label>
              <input type="date" className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm" value={dateRange.to} onChange={(e) => setDateRange(prev => ({ ...prev, to: e.target.value }))} />
            </div>
            <button className="inline-flex items-center px-3 py-2 rounded-md text-sm bg-accent-500 text-white">
              <Filter className="h-4 w-4 mr-2" /> Apply
            </button>
          </div>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <Kpi title="Total Bookings" value={kpis.total} icon={Package} color="text-blue-500" />
          <Kpi title="Approval Rate" value={`${kpis.approvalRate}%`} icon={CheckCircle} color="text-green-500" />
          <Kpi title="Completion Rate" value={`${kpis.completionRate}%`} icon={TrendingUp} color="text-indigo-500" />
          <Kpi title="Revenue" value={kpis.totalRevenue.toLocaleString('en-US', { style: 'currency', currency: 'USD' })} icon={PieChart} color="text-purple-500" />
        </div>

        {/* Trends */}
        <Section title="Bookings Trend" icon={LineChart}>
          <Placeholder height="200px">Line chart of bookings per day</Placeholder>
        </Section>

        {/* Funnel */}
        <Section title="Funnel" icon={BarChart3}>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <FunnelStep label="Pending Review" value={kpis.total - (kpis.approved + kpis.inTransit + kpis.active + kpis.completed + kpis.cancelled)} icon={Clock} />
            <FunnelStep label="Approved" value={kpis.approved} icon={CheckCircle} />
            <FunnelStep label="In Transit" value={kpis.inTransit} icon={TrendingUp} />
            <FunnelStep label="Active (Rental)" value={kpis.active} icon={Users} />
            <FunnelStep label="Completed" value={kpis.completed} icon={CheckCircle} />
          </div>
        </Section>

        {/* Breakdown */}
        <Section title="Service Breakdown" icon={PieChart}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white dark:bg-gray-800 dark:bg-gray-800 dark:bg-gray-800 rounded-lg border p-4">
              <h4 className="text-sm font-semibold text-gray-800 mb-2">Counts</h4>
              <div className="flex items-center justify-between text-sm">
                <span>Transport</span>
                <span className="font-medium">{byService.transport.count}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span>Rental</span>
                <span className="font-medium">{byService.rental.count}</span>
              </div>
            </div>
            <div className="bg-white dark:bg-gray-800 dark:bg-gray-800 dark:bg-gray-800 rounded-lg border p-4">
              <h4 className="text-sm font-semibold text-gray-800 mb-2">Revenue</h4>
              <div className="flex items-center justify-between text-sm">
                <span>Transport</span>
                <span className="font-medium">{byService.transport.revenue.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span>Rental</span>
                <span className="font-medium">{byService.rental.revenue.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}</span>
              </div>
            </div>
          </div>
        </Section>

      </div>
    </div>
  );
};

const Kpi = ({ title, value, icon: Icon, color }) => (
  <div className="bg-white dark:bg-gray-800 dark:bg-gray-800 dark:bg-gray-800 rounded-lg border p-4">
    <div className="flex items-center">
      <Icon className={`h-6 w-6 ${color}`} />
      <div className="ml-3">
        <div className="text-xs text-gray-500 dark:text-gray-400 dark:text-gray-500 dark:text-gray-400 dark:text-gray-500 dark:text-gray-400 dark:text-gray-500">{title}</div>
        <div className="text-lg font-semibold text-gray-900 dark:text-gray-100">{value}</div>
      </div>
    </div>
  </div>
);

const Section = ({ title, icon: Icon, children }) => (
  <div className="mb-6">
    <div className="flex items-center mb-3">
      <Icon className="h-5 w-5 text-gray-500 dark:text-gray-400 dark:text-gray-500 dark:text-gray-400 dark:text-gray-500 dark:text-gray-400 dark:text-gray-500" />
      <h3 className="ml-2 text-sm font-semibold text-gray-700 dark:text-gray-200">{title}</h3>
    </div>
    {children}
  </div>
);

const Placeholder = ({ children, height = '160px' }) => (
  <div className="bg-white dark:bg-gray-800 dark:bg-gray-800 dark:bg-gray-800 rounded-lg border border-dashed text-gray-400 dark:text-gray-500 dark:text-gray-400 dark:text-gray-500 dark:text-gray-400 dark:text-gray-500 text-sm flex items-center justify-center" style={{ height }}>
    {children}
  </div>
);

const FunnelStep = ({ label, value, icon: Icon }) => (
  <div className="bg-white dark:bg-gray-800 dark:bg-gray-800 dark:bg-gray-800 rounded-lg border p-4 text-center">
    <div className="flex items-center justify-center mb-2">
      <Icon className="h-4 w-4 text-gray-500 dark:text-gray-400 dark:text-gray-500 dark:text-gray-400 dark:text-gray-500 dark:text-gray-400 dark:text-gray-500" />
    </div>
    <div className="text-xs text-gray-500 dark:text-gray-400 dark:text-gray-500 dark:text-gray-400 dark:text-gray-500 dark:text-gray-400 dark:text-gray-500">{label}</div>
    <div className="text-base font-semibold text-gray-900 dark:text-gray-100">{value}</div>
  </div>
);

export default AdminAnalytics;

