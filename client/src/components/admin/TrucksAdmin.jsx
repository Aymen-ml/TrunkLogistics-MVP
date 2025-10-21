import React, { useEffect, useState } from 'react';
import { apiClient } from '../../utils/apiClient';
import { Truck, Filter, RefreshCw, Eye } from 'lucide-react';

const TrucksAdmin = () => {
  const [trucks, setTrucks] = useState([]);
  const [providers, setProviders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ serviceType: 'all', status: 'all', search: '' });

  useEffect(() => {
    fetchTrucks();
    fetchProviders();
  }, [filters]);

  const fetchTrucks = async () => {
    setLoading(true);
    try {
      // Use admin-specific endpoint that bypasses complex filtering
      const res = await apiClient.get('/trucks/admin/all');
      let list = res.data.data?.trucks || res.data.trucks || [];
      
      // Apply client-side filtering
      if (filters.serviceType !== 'all') {
        list = list.filter(t => t.service_type === filters.serviceType);
      }
      if (filters.status !== 'all') {
        list = list.filter(t => t.status === filters.status);
      }
      if (filters.provider && filters.provider !== 'all') {
        list = list.filter(t => 
          t.company_name === filters.provider || 
          `${t.first_name} ${t.last_name}` === filters.provider
        );
      }
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        list = list.filter(t => 
          t.license_plate?.toLowerCase().includes(searchLower) ||
          t.company_name?.toLowerCase().includes(searchLower) ||
          t.make?.toLowerCase().includes(searchLower) ||
          t.model?.toLowerCase().includes(searchLower) ||
          `${t.first_name} ${t.last_name}`.toLowerCase().includes(searchLower)
        );
      }
      
      setTrucks(list);
    } catch (e) {
      console.error('Error fetching trucks', e);
    } finally {
      setLoading(false);
    }
  };

  const fetchProviders = async () => {
    try {
      const res = await apiClient.get('/users?role=provider');
      const list = res.data.data?.users || res.data.users || [];
      setProviders(list.filter(p => p.is_verified));
    } catch (e) {
      console.error('Error fetching providers', e);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 dark:bg-gray-900 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8 flex items-center justify-between">
          <div className="flex items-center">
            <Truck className="h-8 w-8 text-blue-600 mr-3" />
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Trucks</h1>
              <p className="mt-2 text-gray-600 dark:text-gray-400 dark:text-gray-500 dark:text-gray-400 dark:text-gray-500 dark:text-gray-400 dark:text-gray-500">View and filter all trucks</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button onClick={fetchTrucks} className="inline-flex items-center px-3 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 dark:bg-gray-800 dark:bg-gray-800 hover:bg-gray-50 dark:bg-gray-900 dark:bg-gray-900 dark:bg-gray-900">
              <RefreshCw className="h-4 w-4 mr-2" /> Refresh
            </button>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 dark:bg-gray-800 dark:bg-gray-800 shadow rounded-lg mb-6">
          <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
            <div className="flex flex-wrap gap-3 items-end">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">Service Type</label>
                <select value={filters.serviceType} onChange={e => setFilters(f => ({ ...f, serviceType: e.target.value }))} className="block w-48 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-blue-500 focus:border-blue-500">
                  <option value="all">All</option>
                  <option value="transport">Transport</option>
                  <option value="rental">Rental</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">Provider</label>
                <select value={filters.provider || 'all'} onChange={e => setFilters(f => ({ ...f, provider: e.target.value }))} className="block w-56 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-blue-500 focus:border-blue-500">
                  <option value="all">All Providers</option>
                  {providers.map(p => (
                    <option key={p.id} value={p.company_name || `${p.first_name} ${p.last_name}`}>
                      {p.company_name || `${p.first_name} ${p.last_name}`}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">Status</label>
                <select value={filters.status} onChange={e => setFilters(f => ({ ...f, status: e.target.value }))} className="block w-48 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-blue-500 focus:border-blue-500">
                  <option value="all">All</option>
                  <option value="active">Active</option>
                  <option value="rented">Rented</option>
                  <option value="maintenance">Maintenance</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
              <div className="flex-1 min-w-[220px]">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">Search</label>
                <input value={filters.search} onChange={e => setFilters(f => ({ ...f, search: e.target.value }))} placeholder="License plate, provider, make/model" className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-blue-500 focus:border-blue-500" />
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 dark:bg-gray-800 dark:bg-gray-800 shadow overflow-hidden sm:rounded-md">
          <div className="px-4 py-5 sm:px-6 border-b border-gray-200 dark:border-gray-700">
            <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-gray-100">Trucks ({trucks.length})</h3>
            <p className="mt-1 max-w-2xl text-sm text-gray-500 dark:text-gray-400 dark:text-gray-500 dark:text-gray-400 dark:text-gray-500 dark:text-gray-400 dark:text-gray-500">Filter by state and view details</p>
          </div>
          <ul className="divide-y divide-gray-200 dark:divide-gray-700">
            {trucks.map(truck => (
              <li key={truck.id} className="px-4 py-6 sm:px-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <Truck className="h-10 w-10 text-gray-400 dark:text-gray-500 dark:text-gray-400 dark:text-gray-500 dark:text-gray-400 dark:text-gray-500" />
                    </div>
                    <div className="ml-4">
                      <div className="flex items-center space-x-2 mb-1">
                        <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{truck.license_plate}</p>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${truck.status === 'active' ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200' : truck.status === 'rented' ? 'bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200' : 'bg-gray-100 dark:bg-gray-700 text-gray-800'}`}>{truck.status || 'unknown'}</span>
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200">{truck.service_type}</span>
                      </div>
                      <p className="text-sm text-gray-500 dark:text-gray-400 dark:text-gray-500 dark:text-gray-400 dark:text-gray-500 dark:text-gray-400 dark:text-gray-500">{truck.make} {truck.model} {truck.year} • {truck.truck_type}</p>
                      {truck.provider_company && (
                        <p className="text-xs text-gray-500 dark:text-gray-400 dark:text-gray-500 dark:text-gray-400 dark:text-gray-500 dark:text-gray-400 dark:text-gray-500">Provider: {truck.provider_company}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <a href={`/trucks/${truck.id}`} className="inline-flex items-center px-3 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 dark:bg-gray-800 dark:bg-gray-800 hover:bg-gray-50 dark:bg-gray-900 dark:bg-gray-900 dark:bg-gray-900">
                      <Eye className="h-4 w-4 mr-2" /> View
                    </a>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default TrucksAdmin;

