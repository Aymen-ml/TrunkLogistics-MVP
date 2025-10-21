import React, { useState, useEffect } from 'react';
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
  MapPin
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

  const filteredTrucks = trucks.filter(truck => {
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 dark:bg-gray-900 dark:bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 dark:bg-gray-900 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100">My Fleet</h1>
              <p className="mt-2 text-sm sm:text-base text-gray-600 dark:text-gray-400 dark:text-gray-500 dark:text-gray-400 dark:text-gray-500 dark:text-gray-400 dark:text-gray-500">
                Manage your trucks and rental equipment.
              </p>
            </div>
            <div className="mt-4 sm:mt-0">
              <Link
                to="/trucks/new"
                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Vehicle
              </Link>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white dark:bg-gray-800 dark:bg-gray-800 dark:bg-gray-800 p-4 sm:p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 mb-6">
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                Search
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-gray-500 dark:text-gray-400 dark:text-gray-500 dark:text-gray-400 dark:text-gray-500" />
                <input
                  type="text"
                  placeholder="License plate, make, model..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-full border-gray-300 dark:border-gray-600 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  autoComplete="off"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                Status
              </label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full border-gray-300 dark:border-gray-600 rounded-md focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="rented">Rented</option>
                <option value="maintenance">Maintenance</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                Service
              </label>
              <select
                value={serviceFilter}
                onChange={(e) => setServiceFilter(e.target.value)}
                className="w-full border-gray-300 dark:border-gray-600 rounded-md focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">All Services</option>
                <option value="transport">Transportation</option>
                <option value="rental">Equipment Rental</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                Type
              </label>
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="w-full border-gray-300 dark:border-gray-600 rounded-md focus:ring-blue-500 focus:border-blue-500"
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

        {/* Trucks Grid */}
        {filteredTrucks.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 dark:bg-gray-800 dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-8 text-center">
            <Truck className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500 dark:text-gray-400 dark:text-gray-500 dark:text-gray-400 dark:text-gray-500" />
            <h3 className="mt-4 text-lg font-medium text-gray-900 dark:text-gray-100">No trucks found</h3>
            <p className="mt-2 text-gray-500 dark:text-gray-400 dark:text-gray-500 dark:text-gray-400 dark:text-gray-500 dark:text-gray-400 dark:text-gray-500">
              {trucks.length === 0 
                ? "Get started by adding your first truck to the fleet."
                : "Try adjusting your search or filter criteria."
              }
            </p>
            {trucks.length === 0 && (
              <div className="mt-6">
                <Link
                  to="/trucks/new"
                  className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Your First Truck
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
                          <Truck className="h-8 w-8 text-blue-600" />
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
                            className="p-2 text-gray-400 dark:text-gray-500 dark:text-gray-400 dark:text-gray-500 dark:text-gray-400 dark:text-gray-500 hover:text-blue-600 rounded-full hover:bg-gray-100 dark:bg-gray-700"
                            title="View details"
                          >
                            <Eye className="h-4 w-4" />
                          </Link>
                          <Link
                            to={`/trucks/${truck.id}/edit`}
                            className="p-2 text-gray-400 dark:text-gray-500 dark:text-gray-400 dark:text-gray-500 dark:text-gray-400 dark:text-gray-500 hover:text-blue-600 rounded-full hover:bg-gray-100 dark:bg-gray-700"
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
