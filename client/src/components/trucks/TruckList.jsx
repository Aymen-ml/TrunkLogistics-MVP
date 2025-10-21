import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { 
  Truck, 
  Plus, 
  Edit, 
  Trash2, 
  Eye,
  Filter,
  Search,
  AlertCircle,
  CheckCircle,
  Clock,
  Settings,
  MapPin,
  Activity,
  Package,
  DollarSign,
  X
} from 'lucide-react';
import { formatCurrency, formatPriceWithUnit } from '../../utils/currency';
import axios from 'axios';

const TruckList = () => {
  const { user } = useAuth();
  const [trucks, setTrucks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [serviceFilter, setServiceFilter] = useState('all'); // all, transport, rental

  useEffect(() => {
    fetchTrucks();
  }, []);

  const fetchTrucks = async () => {
    try {
      const response = await axios.get('/trucks/my');
      setTrucks(response.data.data.trucks);
    } catch (error) {
      console.error('Error fetching trucks:', error);
    } finally {
      setLoading(false);
    }
  };

  const deleteTruck = async (truckId) => {
    if (!window.confirm('Are you sure you want to delete this truck?')) {
      return;
    }

    try {
      await axios.delete(`/trucks/${truckId}`);
      setTrucks(trucks.filter(truck => truck.id !== truckId));
    } catch (error) {
      console.error('Error deleting truck:', error);
      
      // Check if it's an error about active bookings
      if (error.response?.status === 400 && error.response?.data?.activeBookings) {
        const activeBookings = error.response.data.activeBookings;
        let message = `Cannot delete truck: It has ${activeBookings.length} active booking(s):\n\n`;
        
        activeBookings.forEach((booking, index) => {
          message += `${index + 1}. Customer: ${booking.customer_name || 'N/A'}\n`;
          message += `   Route: ${booking.pickup_location} → ${booking.delivery_location}\n`;
          message += `   Status: ${booking.status}\n`;
          message += `   Date: ${new Date(booking.pickup_date).toLocaleDateString()}\n\n`;
        });
        
        message += 'Please wait for these bookings to be completed or cancelled before deleting the truck.';
        alert(message);
      } else {
        // Generic error message for other types of failures
        alert(error.response?.data?.message || 'Failed to delete truck. Please try again.');
      }
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'active':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'inactive':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'rented':
        return <Clock className="h-4 w-4 text-blue-500" />;
      case 'maintenance':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500 dark:text-gray-400 dark:text-gray-500 dark:text-gray-400 dark:text-gray-500 dark:text-gray-400 dark:text-gray-500" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200';
      case 'inactive':
        return 'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200';
      case 'rented':
        return 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200';
      case 'maintenance':
        return 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200';
      default:
        return 'bg-gray-100 dark:bg-gray-700 text-gray-800';
    }
  };

  const getTruckTypeLabel = (type) => {
    const types = {
      flatbed: 'Flatbed',
      container: 'Container',
      refrigerated: 'Refrigerated',
      tanker: 'Tanker',
      box: 'Box Truck',
      other: 'Other'
    };
    return types[type] || type;
  };

  const filteredTrucks = useMemo(() => {
    return trucks.filter(truck => {
      const matchesSearch = truck.license_plate.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           truck.make?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           truck.model?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === 'all' || truck.status === statusFilter;
      const matchesType = typeFilter === 'all' || truck.truck_type === typeFilter;
      const matchesService = serviceFilter === 'all' || 
                            (serviceFilter === 'transport' && (!truck.service_type || truck.service_type === 'transport')) ||
                            (serviceFilter === 'rental' && truck.service_type === 'rental');
      
      return matchesSearch && matchesStatus && matchesType && matchesService;
    });
  }, [trucks, searchTerm, statusFilter, typeFilter, serviceFilter]);

  // Calculate stats from filtered trucks
  const stats = useMemo(() => {
    const total = filteredTrucks.length;
    const active = filteredTrucks.filter(t => t.status === 'active').length;
    const rented = filteredTrucks.filter(t => t.status === 'rented').length;
    const maintenance = filteredTrucks.filter(t => t.status === 'maintenance').length;
    const transport = filteredTrucks.filter(t => !t.service_type || t.service_type === 'transport').length;
    const rental = filteredTrucks.filter(t => t.service_type === 'rental').length;
    
    return { total, active, rented, maintenance, transport, rental };
  }, [filteredTrucks]);

  const activeFiltersCount = [
    searchTerm !== '',
    statusFilter !== 'all',
    typeFilter !== 'all',
    serviceFilter !== 'all'
  ].filter(Boolean).length;

  const clearFilters = () => {
    setSearchTerm('');
    setStatusFilter('all');
    setTypeFilter('all');
    setServiceFilter('all');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
        {/* Header */}
        <div className="mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100">My Fleet</h1>
              <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                Manage your trucks and rental equipment
              </p>
            </div>
            <div className="mt-4 sm:mt-0">
              <Link
                to="/trucks/new"
                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-accent-500 hover:bg-accent-600 transition-colors"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Vehicle
              </Link>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Fleet</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100 mt-1">{stats.total}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  {stats.transport} transport • {stats.rental} rental
                </p>
              </div>
              <div className="p-3 bg-primary-100 dark:bg-primary-900/20 rounded-lg">
                <Package className="h-6 w-6 text-primary-600" />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Active</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100 mt-1">{stats.active}</p>
                <p className="text-xs text-green-600 mt-1">Ready to use</p>
              </div>
              <div className="p-3 bg-green-100 dark:bg-green-900/20 rounded-lg">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">In Use</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100 mt-1">{stats.rented}</p>
                <p className="text-xs text-blue-600 mt-1">Currently rented</p>
              </div>
              <div className="p-3 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
                <Activity className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Maintenance</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100 mt-1">{stats.maintenance}</p>
                <p className="text-xs text-red-600 mt-1">Under repair</p>
              </div>
              <div className="p-3 bg-red-100 dark:bg-red-900/20 rounded-lg">
                <AlertCircle className="h-6 w-6 text-red-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white dark:bg-gray-800 shadow-sm rounded-lg mb-6">
          <div className="px-4 py-4 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Filter className="h-5 w-5 text-gray-400" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">Filters</h3>
                {activeFiltersCount > 0 && (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-100 dark:bg-primary-900/20 text-primary-800 dark:text-primary-400">
                    {activeFiltersCount} active
                  </span>
                )}
              </div>
              {activeFiltersCount > 0 && (
                <button
                  type="button"
                  onClick={clearFilters}
                  className="inline-flex items-center gap-1 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
                >
                  <X className="h-4 w-4" />
                  Clear all
                </button>
              )}
            </div>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Search
                </label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="License plate, make, model..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 w-full border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-gray-100 px-3 py-2 sm:text-sm"
                    autoComplete="off"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Status
                </label>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-gray-100 px-3 py-2 sm:text-sm"
                >
                  <option value="all">All Status</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="rented">Rented</option>
                  <option value="maintenance">Maintenance</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Service Type
                </label>
                <select
                  value={serviceFilter}
                  onChange={(e) => setServiceFilter(e.target.value)}
                  className="w-full border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-gray-100 px-3 py-2 sm:text-sm"
                >
                  <option value="all">All Services</option>
                  <option value="transport">Transportation</option>
                  <option value="rental">Equipment Rental</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Vehicle Type
                </label>
                <select
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value)}
                  className="w-full border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-gray-100 px-3 py-2 sm:text-sm"
                >
                  <option value="all">All Types</option>
                  <option value="flatbed">Flatbed</option>
                  <option value="container">Container</option>
                  <option value="refrigerated">Refrigerated</option>
                  <option value="tanker">Tanker</option>
                  <option value="box">Box Truck</option>
                  <option value="other">Other</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Trucks Grid */}
        {filteredTrucks.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-12 text-center">
            <Truck className="mx-auto h-16 w-16 text-gray-400 dark:text-gray-500" />
            <h3 className="mt-4 text-lg font-semibold text-gray-900 dark:text-gray-100">No vehicles found</h3>
            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
              {trucks.length === 0 
                ? "Get started by adding your first vehicle to the fleet"
                : "Try adjusting your search or filter criteria"
              }
            </p>
            {trucks.length === 0 && (
              <div className="mt-6">
                <Link
                  to="/trucks/new"
                  className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-accent-500 hover:bg-accent-600 transition-colors"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Your First Vehicle
                </Link>
              </div>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTrucks.map((truck) => {
              const isRental = truck.service_type === 'rental';
              return (
                <div key={truck.id} className="bg-white dark:bg-gray-800 dark:bg-gray-800 dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
                  <div className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center">
                        {isRental ? (
                          <Settings className="h-8 w-8 text-orange-600" />
                        ) : (
                          <Truck className="h-8 w-8 text-primary-600" />
                        )}
                        <div className="ml-3">
                          <div className="flex items-center space-x-2">
                            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                              {truck.license_plate}
                            </h3>
                            {isRental ? (
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                                Rental
                              </span>
                            ) : (
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200">
                                Logistics
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-gray-500 dark:text-gray-400 dark:text-gray-500 dark:text-gray-400 dark:text-gray-500 dark:text-gray-400 dark:text-gray-500">
                            {truck.make} {truck.model} {truck.year}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center">
                        {getStatusIcon(truck.status)}
                      </div>
                    </div>

                    <div className="mt-4 space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500 dark:text-gray-400 dark:text-gray-500 dark:text-gray-400 dark:text-gray-500 dark:text-gray-400 dark:text-gray-500">Type:</span>
                        <span className="font-medium">{getTruckTypeLabel(truck.truck_type)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500 dark:text-gray-400 dark:text-gray-500 dark:text-gray-400 dark:text-gray-500 dark:text-gray-400 dark:text-gray-500">{isRental ? 'Weight:' : 'Capacity:'}</span>
                        <span className="font-medium">{truck.capacity_weight?.toLocaleString()} kg</span>
                      </div>
                      
                      {/* Show rental rates or transport pricing */}
                      {isRental ? (
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-500 dark:text-gray-400 dark:text-gray-500 dark:text-gray-400 dark:text-gray-500 dark:text-gray-400 dark:text-gray-500">Rates:</span>
                          <span className="font-medium">
                            {[
                              truck.hourly_rate && `$${truck.hourly_rate}/hr`,
                              truck.daily_rate && `$${truck.daily_rate}/day`,
                              truck.weekly_rate && `$${truck.weekly_rate}/wk`,
                              truck.monthly_rate && `$${truck.monthly_rate}/mo`
                            ].filter(Boolean).slice(0, 2).join(', ') || 'Available'}
                          </span>
                        </div>
                      ) : (
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-500 dark:text-gray-400 dark:text-gray-500 dark:text-gray-400 dark:text-gray-500 dark:text-gray-400 dark:text-gray-500">Pricing:</span>
                          <span className="font-medium">
                            {truck.pricing_type === 'per_km' 
                              ? `$${truck.price_per_km}/km`
                              : `$${truck.fixed_price} fixed`
                            }
                          </span>
                        </div>
                      )}
                      
                      {/* Show work location for rental equipment */}
                      {isRental && truck.work_location && (
                        <div className="flex items-start justify-between text-sm">
                          <span className="text-gray-500 dark:text-gray-400 dark:text-gray-500 dark:text-gray-400 dark:text-gray-500 dark:text-gray-400 dark:text-gray-500 flex items-center">
                            <MapPin className="h-3 w-3 mr-1" />
                            Location:
                          </span>
                          <span className="font-medium text-right max-w-32 truncate" title={truck.work_location}>
                            {truck.work_location}
                          </span>
                        </div>
                      )}
                      
                      <div className="flex items-center justify-between">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(truck.status)}`}>
                          {truck.status}
                        </span>
                        
                        <div className="flex items-center space-x-2">
                          <Link
                            to={`/trucks/${truck.id}`}
                            className="p-2 text-gray-400 dark:text-gray-500 dark:text-gray-400 dark:text-gray-500 dark:text-gray-400 dark:text-gray-500 hover:text-primary-600 rounded-full hover:bg-gray-100 dark:bg-gray-700"
                            title="View details"
                          >
                            <Eye className="h-4 w-4" />
                          </Link>
                          <Link
                            to={`/trucks/${truck.id}/edit`}
                            className="p-2 text-gray-400 dark:text-gray-500 dark:text-gray-400 dark:text-gray-500 dark:text-gray-400 dark:text-gray-500 hover:text-primary-600 rounded-full hover:bg-gray-100 dark:bg-gray-700"
                            title={`Edit ${isRental ? 'equipment' : 'truck'}`}
                          >
                            <Edit className="h-4 w-4" />
                          </Link>
                          <button
                            onClick={() => deleteTruck(truck.id)}
                            className="p-2 text-gray-400 dark:text-gray-500 dark:text-gray-400 dark:text-gray-500 dark:text-gray-400 dark:text-gray-500 hover:text-red-600 rounded-full hover:bg-gray-100 dark:bg-gray-700"
                            title={`Delete ${isRental ? 'equipment' : 'truck'}`}
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default TruckList;
