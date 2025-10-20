import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { 
  Search, 
  Filter, 
  MapPin, 
  Truck,
  DollarSign,
  Weight,
  Package,
  Calendar,
  Star,
  Settings,
  Clock
} from 'lucide-react';
import { apiClient } from '../../utils/apiClient';
import {
  SERVICE_TYPES,
  SERVICE_TYPE_LABELS,
  VEHICLE_TYPE_LABELS,
  getVehicleTypesByService,
  getLabelsByService
} from '../../constants/truckTypes';

const TruckSearch = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [trucks, setTrucks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    search: '',
    // Default to rental to prioritize equipment visibility; overridden by URL param if present
    serviceType: 'rental',
    truckType: 'all',
    minCapacity: '',
    maxPrice: '',
    pricingType: 'all',
    workLocation: '',
    provider: 'all',
    availability: 'all' // all, available, rented
  });

  // Initialize filters from URL query params (e.g., ?serviceType=rental)
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const serviceTypeParam = params.get('serviceType');
    const nextFilters = {};
    if (serviceTypeParam && ['transport', 'rental'].includes(serviceTypeParam)) {
      nextFilters.serviceType = serviceTypeParam;
    }
    const truckTypeParam = params.get('truckType');
    if (truckTypeParam) nextFilters.truckType = truckTypeParam;
    const maxPriceParam = params.get('maxPrice');
    if (maxPriceParam) nextFilters.maxPrice = maxPriceParam;
    const pricingTypeParam = params.get('pricingType');
    if (pricingTypeParam) nextFilters.pricingType = pricingTypeParam;
    const workLocationParam = params.get('workLocation');
    if (workLocationParam) nextFilters.workLocation = workLocationParam;

    if (Object.keys(nextFilters).length > 0) {
      setFilters(prev => ({ ...prev, ...nextFilters }));
    }
    // Always fetch on mount and whenever the query string changes
    setLoading(true);
    fetchTrucks({ ...filters, ...nextFilters });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.search]);

  const fetchTrucks = async (overrideFilters = null) => {
    const activeFilters = overrideFilters || filters;
    try {
      const response = await apiClient.get('/trucks', {
        params: {
          ...activeFilters,
          ...(activeFilters.truckType === 'all' && { truckType: undefined }),
          ...(activeFilters.pricingType === 'all' && { pricingType: undefined }),
          // Don't send availability filter to backend - we'll filter client-side
          availability: undefined
        }
      });
      setTrucks(response.data.data.trucks || []);
    } catch (error) {
      console.error('Error fetching trucks:', error);
      setTrucks([]);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    const newFilters = {
      ...filters,
      [name]: value
    };
    setFilters(newFilters);
    
    // Auto-search when key filters change to immediately show relevant results
    if (name === 'serviceType' || name === 'truckType') {
      setLoading(true);
      fetchTrucks(newFilters);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setLoading(true);
    fetchTrucks();
  };

  const clearFilters = () => {
    setFilters({
      search: '',
      serviceType: 'transport',
      truckType: 'all',
      minCapacity: '',
      maxPrice: '',
      pricingType: 'all',
      workLocation: '',
      provider: 'all',
      availability: 'all'
    });
    setLoading(true);
    fetchTrucks();
  };

  // Filter trucks by availability (client-side)
  const filteredTrucks = trucks.filter(truck => {
    if (filters.availability === 'available') {
      return truck.active_bookings_count === 0;
    } else if (filters.availability === 'rented') {
      return truck.active_bookings_count > 0;
    }
    return true; // 'all' - show everything
  });

  const getTruckTypeLabel = (type) => {
    if (!type) return 'Unknown';
    // Use the shared labels map so equipment types are labeled correctly
    return VEHICLE_TYPE_LABELS[type] || type;
  };

  const requestBooking = (truckId) => {
    // Navigate to booking form with pre-selected truck
    navigate(`/bookings/new?truck=${truckId}`);
  };

  const viewTruckDetails = (truckId) => {
    // Navigate to truck details page
    navigate(`/trucks/${truckId}`);
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
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
            {filters.serviceType === 'rental' ? 'Find Equipment' : 'Find Trucks'}
          </h1>
          <p className="mt-2 text-sm sm:text-base text-gray-600">
            {filters.serviceType === 'rental' 
              ? 'Search for available equipment for rental.'
              : 'Search for available trucks for your shipment needs.'
            }
          </p>
        </div>

        {/* Search Filters */}
        <div className="bg-white p-4 sm:p-6 rounded-lg shadow-sm border border-gray-200 mb-6">
          <form onSubmit={handleSearch} className="space-y-4">
            {/* Service Type Toggle */}
            <div className="w-full mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Service Type
              </label>
              <div className="flex space-x-4">
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="serviceType"
                    value="transport"
                    checked={filters.serviceType === 'transport'}
                    onChange={handleFilterChange}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                  />
                  <span className="ml-2 text-sm text-gray-700">Transportation</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="serviceType"
                    value="rental"
                    checked={filters.serviceType === 'rental'}
                    onChange={handleFilterChange}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                  />
                  <span className="ml-2 text-sm text-gray-700">Equipment Rental</span>
                </label>
              </div>
            </div>

            {/* Search Bar */}
            <div className="w-full">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Search {filters.serviceType === 'rental' ? 'Equipment' : 'Trucks'}
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  name="search"
                  value={filters.search}
                  onChange={handleFilterChange}
                  placeholder={`Search by license plate, make, model${filters.serviceType === 'rental' ? ', or work location' : ''}...`}
                  className="focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md"
                  autoComplete="off"
                />
              </div>
            </div>

            {/* Filter Options */}
            <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-${filters.serviceType === 'rental' ? '6' : '6'} gap-4`}>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {filters.serviceType === 'rental' ? 'Equipment Type' : 'Truck Type'}
                </label>
                <select
                  name="truckType"
                  value={filters.truckType}
                  onChange={handleFilterChange}
                  className="w-full border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="all">All Types</option>
                  {Object.keys(getVehicleTypesByService(filters.serviceType)).map(type => {
                    const labels = getLabelsByService(filters.serviceType);
                    return (
                      <option key={type} value={type}>
                        {labels[type] || type}
                      </option>
                    );
                  })}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Min Capacity (kg)
                </label>
                <input
                  type="number"
                  name="minCapacity"
                  value={filters.minCapacity}
                  onChange={handleFilterChange}
                  placeholder="Minimum weight capacity"
                  className="w-full border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  autoComplete="off"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Max Price ($)
                </label>
                <input
                  type="number"
                  name="maxPrice"
                  value={filters.maxPrice}
                  onChange={handleFilterChange}
                  placeholder="Maximum price"
                  className="w-full border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  autoComplete="off"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Pricing Type
                </label>
                <select
                  name="pricingType"
                  value={filters.pricingType}
                  onChange={handleFilterChange}
                  className="w-full border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="all">All Pricing</option>
                  {filters.serviceType === 'rental' ? (
                    <>
                      <option value="monthly">Monthly Rates</option>
                    </>
                  ) : (
                    <>
                      <option value="per_km">Per Kilometer</option>
                      <option value="fixed">Fixed Price</option>
                    </>
                  )}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Provider
                </label>
                <select
                  name="provider"
                  value={filters.provider}
                  onChange={handleFilterChange}
                  className="w-full border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="all">All Providers</option>
                  {trucks && [...new Set(trucks.map(t => t.company_name).filter(Boolean))].map(company => (
                    <option key={company} value={company}>{company}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Availability
                </label>
                <select
                  name="availability"
                  value={filters.availability}
                  onChange={handleFilterChange}
                  className="w-full border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="all">All {filters.serviceType === 'rental' ? 'Equipment' : 'Trucks'}</option>
                  <option value="available">Available Only</option>
                  <option value="rented">Rented Only</option>
                </select>
              </div>

              {/* Work Location Filter for Equipment Rental */}
              {filters.serviceType === 'rental' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Work Location
                  </label>
                  <input
                    type="text"
                    name="workLocation"
                    value={filters.workLocation}
                    onChange={handleFilterChange}
                    placeholder="Location or area"
                    className="w-full border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    autoComplete="off"
                  />
                </div>
              )}
            </div>

            <div className="flex flex-col sm:flex-row sm:justify-end space-y-3 sm:space-y-0 sm:space-x-3">
              <button
                type="button"
                onClick={clearFilters}
                className="w-full sm:w-auto px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              >
                Clear Filters
              </button>
              <button
                type="submit"
                className="w-full sm:w-auto inline-flex justify-center items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
              >
                <Search className="h-4 w-4 mr-2" />
                Search {filters.serviceType === 'rental' ? 'Equipment' : 'Trucks'}
              </button>
            </div>
          </form>
        </div>

        {/* Results Summary */}
        {trucks.length > 0 && (
          <div className="mb-4 flex items-center justify-between">
            <p className="text-sm text-gray-600">
              Showing <span className="font-semibold">{filteredTrucks.length}</span> of <span className="font-semibold">{trucks.length}</span> {filters.serviceType === 'rental' ? 'equipment' : 'trucks'}
              {filters.availability !== 'all' && (
                <span className="ml-1">
                  ({filters.availability === 'available' ? 'available only' : 'rented only'})
                </span>
              )}
            </p>
            {filters.availability === 'all' && (
              <p className="text-sm text-gray-600">
                <span className="font-semibold text-green-600">{trucks.filter(t => t.active_bookings_count === 0).length} available</span>
                {' • '}
                <span className="font-semibold text-red-600">{trucks.filter(t => t.active_bookings_count > 0).length} rented</span>
              </p>
            )}
          </div>
        )}

        {/* Results */}
        {filteredTrucks.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
            {filters.serviceType === 'rental' ? (
              <Settings className="mx-auto h-12 w-12 text-gray-400" />
            ) : (
              <Truck className="mx-auto h-12 w-12 text-gray-400" />
            )}
            <h3 className="mt-4 text-lg font-medium text-gray-900">
              No {filters.serviceType === 'rental' ? 'equipment' : 'trucks'} found
            </h3>
            <p className="mt-2 text-gray-500">
              {trucks.length === 0 
                ? `Try adjusting your search criteria to find available ${filters.serviceType === 'rental' ? 'equipment' : 'trucks'}.`
                : `No ${filters.availability === 'available' ? 'available' : filters.availability === 'rented' ? 'rented' : ''} ${filters.serviceType === 'rental' ? 'equipment' : 'trucks'} match your criteria. Try changing the availability filter.`
              }
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTrucks.map((truck) => {
              const isRented = truck.active_bookings_count > 0;
              return (
              <div key={truck.id} className={`bg-white rounded-lg shadow-sm border overflow-hidden hover:shadow-md transition-shadow ${isRented ? 'border-gray-300 opacity-75' : 'border-gray-200'}`}>
                {isRented && (
                  <div className="bg-red-50 border-b border-red-200 px-4 py-2">
                    <p className="text-xs font-medium text-red-800 text-center">Currently Rented - Not Available</p>
                  </div>
                )}
                <div className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center">
                      {truck.service_type === 'rental' ? (
                        <Settings className="h-8 w-8 text-orange-600" />
                      ) : (
                        <Truck className="h-8 w-8 text-blue-600" />
                      )}
                      <div className="ml-3">
                        <div className="flex items-center space-x-2">
                          <h3 className="text-lg font-medium text-gray-900">
                            {truck.license_plate}
                          </h3>
                          {truck.service_type === 'rental' ? (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                              Rental
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                              Logistics
                            </span>
                          )}
                          {/* Availability Badge */}
                          {truck.active_bookings_count !== undefined && (
                            truck.active_bookings_count === 0 ? (
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                Available
                              </span>
                            ) : (
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                Rented
                              </span>
                            )
                          )}
                        </div>
                        <div className="flex items-center space-x-2">
                          <p className="text-sm text-blue-600 font-medium">
                            {truck.company_name || truck.provider_name}
                          </p>
                          {truck.provider_verified && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                              ✓ Verified
                            </span>
                          )}
                          {truck.documents_verified && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                              ✓ Docs
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center">
                      <Star className="h-4 w-4 text-yellow-400" />
                      <span className="ml-1 text-sm text-gray-600">4.8</span>
                    </div>
                  </div>

                  <div className="mt-4 space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Type:</span>
                      <span className="font-medium">{getTruckTypeLabel(truck.truck_type)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Capacity:</span>
                      <span className="font-medium">{truck.capacity_weight?.toLocaleString()} kg</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Vehicle:</span>
                      <span className="font-medium">{truck.make} {truck.model}</span>
                    </div>
                    {truck.service_type === 'rental' && truck.work_location && (
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Location:</span>
                        <span className="font-medium">{truck.work_location}</span>
                      </div>
                    )}
                    {(truck.provider_city || truck.provider_state || truck.provider_country) && (
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Provider Location:</span>
                        <span className="font-medium">
                          {[truck.provider_city, truck.provider_state, truck.provider_country].filter(Boolean).join(', ')}
                        </span>
                      </div>
                    )}
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Price:</span>
                      <span className="font-medium text-green-600">
                        {truck.service_type === 'rental' ? (
                          <div className="text-right">
                            {truck.monthly_rate && <div>${truck.monthly_rate}/month</div>}
                          </div>
                        ) : (
                          truck.pricing_type === 'per_km' 
                            ? `$${truck.price_per_km}/km`
                            : `$${truck.fixed_price?.toLocaleString()}`
                        )}
                      </span>
                    </div>
                  </div>

                  <div className="mt-6 flex space-x-3">
                    <button
                      onClick={() => !isRented && requestBooking(truck.id)}
                      disabled={isRented}
                      className={`flex-1 text-sm font-medium py-2 px-4 rounded-md transition-colors flex items-center justify-center ${
                        isRented 
                          ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
                          : 'bg-blue-600 hover:bg-blue-700 text-white'
                      }`}
                    >
                      {truck.service_type === 'rental' ? (
                        <>
                          <Clock className="h-4 w-4 mr-2" />
                          {isRented ? 'Currently Rented' : 'Rent Equipment'}
                        </>
                      ) : (
                        isRented ? 'Currently Booked' : 'Request Booking'
                      )}
                    </button>
                    <button 
                      onClick={() => viewTruckDetails(truck.id)}
                      className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                    >
                      View Details
                    </button>
                  </div>
                </div>
              </div>
            );
            })}
          </div>
        )}

        {/* Pagination would go here */}
        {trucks.length > 0 && (
          <div className="mt-8 flex justify-center">
            <p className="text-sm text-gray-500">
              Showing {trucks.length} available {filters.serviceType === 'rental' ? 'equipment' : 'trucks'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default TruckSearch;
