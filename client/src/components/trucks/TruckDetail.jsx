import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { 
  ArrowLeft, 
  Edit, 
  Trash2, 
  Truck,
  Calendar,
  DollarSign,
  Weight,
  Package,
  CheckCircle,
  Clock,
  AlertCircle,
  Image,
  FileText,
  Download,
  Eye,
  User,
  MapPin,
  Phone,
  Mail,
  CreditCard,
  Settings,
  Building2
} from 'lucide-react';
import { formatCurrency, formatPriceWithUnit } from '../../utils/currency';
import { apiClient } from '../../utils/apiClient';

const TruckDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [truck, setTruck] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [truckStats, setTruckStats] = useState({ completedBookings: 0, totalRevenue: 0 });

  useEffect(() => {
    fetchTruck();
    fetchTruckStats();
  }, [id]);

  const fetchTruck = async () => {
    try {
      console.log(`Fetching truck details for ID: ${id}`);
      const response = await apiClient.get(`/trucks/${id}`);
      console.log('Truck API response:', response.data);
      
      if (response.data.success && response.data.data.truck) {
        setTruck(response.data.data.truck);
        console.log('Truck data loaded successfully:', response.data.data.truck);
      } else {
        console.error('Truck data not found in response:', response.data);
        throw new Error('Truck data not found');
      }
    } catch (error) {
      console.error('Error fetching truck:', error);
      console.error('Error details:', {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        message: error.message
      });
      
      // Set error state with detailed information
      setError({
        message: error.response?.data?.error || error.message || 'Failed to load truck details',
        status: error.response?.status,
        details: error.response?.data
      });
      setTruck(null);
    } finally {
      setLoading(false);
    }
  };

  const fetchTruckStats = async () => {
    try {
      const response = await apiClient.get(`/bookings?truck_id=${id}`);
      const bookings = response.data.data.bookings || [];
      
      const completedBookings = bookings.filter(booking => booking.status === 'completed');
      const totalRevenue = completedBookings.reduce((sum, booking) => {
        return sum + (parseFloat(booking.total_price) || 0);
      }, 0);
      
      setTruckStats({
        completedBookings: completedBookings.length,
        totalRevenue: totalRevenue
      });
    } catch (error) {
      console.error('Error fetching truck stats:', error);
      // Keep default values if stats fetch fails
    }
  };

  const deleteTruck = async () => {
    if (!window.confirm('Are you sure you want to delete this truck?')) {
      return;
    }

    try {
      await apiClient.delete(`/trucks/${id}`);
      // Navigate based on user role
      if (user?.role === 'customer') {
        navigate('/find-trucks');
      } else if (user?.role === 'admin') {
        navigate('/admin/trucks');
      } else {
        navigate('/trucks');
      }
    } catch (error) {
      console.error('Error deleting truck:', error);
      
      let errorMessage = 'An unexpected error occurred while trying to delete the truck.';
      
      if (error.response && error.response.data) {
        const errorData = error.response.data;
        
        // Handle specific error scenarios with clear messages
        switch (error.response.status) {
          case 400:
            if (errorData.error === 'Cannot delete truck with active bookings') {
              // Active bookings error - show detailed information
              const activeBookings = errorData.data?.activeBookings || [];
              
              errorMessage = errorData.message || 'This truck cannot be deleted because it has active bookings.';
              
              if (activeBookings.length > 0) {
                errorMessage += `\n\nActive bookings (${activeBookings.length}):`;
                activeBookings.forEach((booking, index) => {
                  const statusDisplay = booking.status.replace('_', ' ').toUpperCase();
                  const dateDisplay = new Date(booking.pickupDate).toLocaleDateString();
                  errorMessage += `\n\n${index + 1}. ${booking.customerName} (${booking.customerCompany})`;
                  errorMessage += `\n   Route: ${booking.pickupCity} → ${booking.destinationCity}`;
                  errorMessage += `\n   Status: ${statusDisplay}`;
                  errorMessage += `\n   Date: ${dateDisplay}`;
                });
                errorMessage += '\n\nTo delete this truck, please wait for all active bookings to be completed or cancelled.';
              }
            } else {
              // Other 400 errors
              errorMessage = errorData.message || errorData.error || 'The truck cannot be deleted due to a validation error.';
            }
            break;
            
          case 403:
            errorMessage = 'You do not have permission to delete this truck. Only the truck owner or administrators can delete trucks.';
            break;
            
          case 404:
            errorMessage = 'The truck you are trying to delete was not found. It may have already been deleted.';
            break;
            
          case 500:
            errorMessage = 'A server error occurred while trying to delete the truck. Please try again in a few moments.';
            break;
            
          default:
            // Use server-provided message if available, otherwise generic message
            errorMessage = errorData.message || errorData.error || 
                          `Failed to delete truck (Error ${error.response.status}). Please contact support if this continues.`;
        }
      } else if (error.request) {
        // Network error
        errorMessage = 'Unable to connect to the server. Please check your internet connection and try again.';
      }
      
      alert(errorMessage);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'active':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'inactive':
        return <Clock className="h-5 w-5 text-yellow-500" />;
      case 'rented':
        return <Clock className="h-5 w-5 text-blue-500" />;
      case 'maintenance':
        return <AlertCircle className="h-5 w-5 text-red-500" />;
      default:
        return <Clock className="h-5 w-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'inactive':
        return 'bg-yellow-100 text-yellow-800';
      case 'rented':
        return 'bg-blue-100 text-blue-800';
      case 'maintenance':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!truck) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900">
            {error ? 'Error Loading Truck' : 'Truck not found'}
          </h2>
          <p className="mt-2 text-gray-600">
            {error ? error.message : "The truck you're looking for doesn't exist."}
          </p>
          {error && error.status && (
            <p className="mt-1 text-sm text-gray-500">
              Error {error.status}: {error.details?.error || 'Unknown error'}
            </p>
          )}
          {error && (
            <div className="mt-4 p-3 bg-gray-100 rounded-md text-left">
              <p className="text-xs text-gray-600">Debug Info:</p>
              <p className="text-xs text-gray-800">Truck ID: {id}</p>
              <p className="text-xs text-gray-800">User Role: {user?.role}</p>
              <p className="text-xs text-gray-800">Status: {error.status}</p>
            </div>
          )}
          <Link
            to={user?.role === 'customer' ? '/find-trucks' : '/trucks'}
            className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to {user?.role === 'customer' ? 'Search' : 'Trucks'}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <button
            onClick={() => {
              // Navigate back based on user role
              if (user?.role === 'customer') {
                navigate('/find-trucks');
              } else if (user?.role === 'admin') {
                navigate('/admin/trucks');
              } else {
                navigate('/trucks');
              }
            }}
            className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700 mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back to {user?.role === 'customer' ? 'Search' : user?.role === 'admin' ? 'Admin Trucks' : 'Trucks'}
          </button>
          
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center">
              {truck.service_type === 'rental' ? (
                <Settings className="h-8 w-8 text-orange-600 mr-3" />
              ) : (
                <Truck className="h-8 w-8 text-blue-600 mr-3" />
              )}
              <div>
                <div className="flex items-center space-x-3">
                  <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
                    {truck.license_plate}
                  </h1>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(truck.status)}`}>
                    {truck.status.charAt(0).toUpperCase() + truck.status.slice(1)}
                  </span>
                </div>
                <p className="mt-2 text-sm sm:text-base text-gray-600">
                  {truck.make} {truck.model} {truck.year}
                </p>
                {truck.status !== 'active' && user?.role === 'customer' && (
                  <div className="mt-4 bg-yellow-50 border-l-4 border-yellow-400 p-4">
                    <div className="flex">
                      <div className="flex-shrink-0">
                        <AlertCircle className="h-5 w-5 text-yellow-400" />
                      </div>
                      <div className="ml-3">
                        <p className="text-sm text-yellow-700">
                          This truck is currently {truck.status}. It is not available for new bookings.
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
            
            {/* Only show edit/delete buttons to providers who own the truck or admins */}
            {(user?.role === 'provider' || user?.role === 'admin') && (
              <div className="mt-4 sm:mt-0 flex items-center space-x-3">
                <Link
                  to={`/trucks/${truck.id}/edit`}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Edit
                </Link>
                <button
                  onClick={deleteTruck}
                  className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </button>
              </div>
            )}
            
            {/* Show booking button for customers */}
            {user?.role === 'customer' && truck.status === 'active' && (
              <div className="mt-4 sm:mt-0">
                <Link
                  to={`/bookings/new?truck=${truck.id}`}
                  className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
                >
                  <Package className="h-4 w-4 mr-2" />
                  Book This Truck
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Truck Details */}
        <div className="bg-white shadow-sm rounded-lg overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium text-gray-900">Truck Information</h3>
              <div className="flex items-center">
                {getStatusIcon(truck.status)}
                <span className={`ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(truck.status)}`}>
                  {truck.status}
                </span>
              </div>
            </div>
          </div>

          <div className="px-6 py-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Basic Information */}
              <div className="space-y-4">
                <h4 className="text-sm font-medium text-gray-900 uppercase tracking-wide">
                  Basic Information
                </h4>
                
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500">Truck Type:</span>
                    <span className="text-sm font-medium text-gray-900">
                      {getTruckTypeLabel(truck.truck_type)}
                    </span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500">License Plate:</span>
                    <span className="text-sm font-medium text-gray-900">
                      {truck.license_plate}
                    </span>
                  </div>
                  
                  {truck.year && (
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-500">Year:</span>
                      <span className="text-sm font-medium text-gray-900">
                        {truck.year}
                      </span>
                    </div>
                  )}
                  
                  {truck.make && (
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-500">Make:</span>
                      <span className="text-sm font-medium text-gray-900">
                        {truck.make}
                      </span>
                    </div>
                  )}
                  
                  {truck.model && (
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-500">Model:</span>
                      <span className="text-sm font-medium text-gray-900">
                        {truck.model}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Capacity & Pricing */}
              <div className="space-y-4">
                <h4 className="text-sm font-medium text-gray-900 uppercase tracking-wide">
                  {truck.service_type === 'rental' ? 'Capacity & Rental Rates' : 'Capacity & Pricing'}
                </h4>
                
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500">
                      {truck.service_type === 'rental' ? 'Operating Weight:' : 'Weight Capacity:'}
                    </span>
                    <span className="text-sm font-medium text-gray-900">
                      {truck.capacity_weight?.toLocaleString()} kg
                    </span>
                  </div>
                  
                  {truck.capacity_volume && (
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-500">Volume Capacity:</span>
                      <span className="text-sm font-medium text-gray-900">
                        {truck.capacity_volume} m³
                      </span>
                    </div>
                  )}
                  
                  {truck.work_location && truck.service_type === 'rental' && (
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-500">Work Location:</span>
                      <span className="text-sm font-medium text-gray-900">
                        {truck.work_location}
                      </span>
                    </div>
                  )}
                  
                  {truck.service_type === 'rental' ? (
                    /* Rental Equipment Pricing */
                    <>
                      {truck.monthly_rate && (
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-500">Monthly Rate:</span>
                          <span className="text-sm font-medium text-green-600">
                            {formatCurrency(truck.monthly_rate)}/month
                          </span>
                        </div>
                      )}
                    </>
                  ) : (
                    /* Traditional Transport Pricing */
                    <>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-500">Pricing Type:</span>
                        <span className="text-sm font-medium text-gray-900">
                          {truck.pricing_type === 'per_km' ? 'Per Kilometer' : 'Fixed Price'}
                        </span>
                      </div>
                      
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-500">Price:</span>
                        <span className="text-sm font-medium text-gray-900">
                          {truck.pricing_type === 'per_km' 
                            ? formatPriceWithUnit(truck.price_per_km)
                            : formatCurrency(truck.fixed_price)
                          }
                        </span>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Provider Information - Show to customers */}
            {user?.role === 'customer' && (truck.company_name || truck.first_name || truck.last_name || truck.phone) && (
              <div className="mt-8 pt-6 border-t border-gray-200">
                <h4 className="text-sm font-medium text-gray-900 uppercase tracking-wide mb-4">
                  Provider Information
                </h4>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {truck.company_name && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-500 flex items-center">
                        <Building2 className="h-4 w-4 mr-1" />
                        Company:
                      </span>
                      <span className="text-sm font-medium text-gray-900">
                        {truck.company_name}
                      </span>
                    </div>
                  )}
                  
                  {(truck.first_name || truck.last_name) && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-500 flex items-center">
                        <User className="h-4 w-4 mr-1" />
                        Contact:
                      </span>
                      <span className="text-sm font-medium text-gray-900">
                        {[truck.first_name, truck.last_name].filter(Boolean).join(' ')}
                      </span>
                    </div>
                  )}
                  
                  {truck.phone && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-500 flex items-center">
                        <Phone className="h-4 w-4 mr-1" />
                        Phone:
                      </span>
                      <span className="text-sm font-medium text-gray-900">
                        <a href={`tel:${truck.phone}`} className="text-blue-600 hover:text-blue-800">
                          {truck.phone}
                        </a>
                      </span>
                    </div>
                  )}
                  
                  {/* Provider Location Information */}
                  {(truck.provider_city || truck.provider_state || truck.provider_country) && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-500 flex items-center">
                        <MapPin className="h-4 w-4 mr-1" />
                        Location:
                      </span>
                      <span className="text-sm font-medium text-gray-900">
                        {[truck.provider_city, truck.provider_state, truck.provider_country].filter(Boolean).join(', ')}
                      </span>
                    </div>
                  )}
                  
                  {truck.street_address && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-500 flex items-center">
                        <MapPin className="h-4 w-4 mr-1" />
                        Address:
                      </span>
                      <span className="text-sm font-medium text-gray-900">
                        {truck.street_address}
                      </span>
                    </div>
                  )}
                  
                  {truck.provider_business_phone && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-500 flex items-center">
                        <Phone className="h-4 w-4 mr-1" />
                        Business Phone:
                      </span>
                      <span className="text-sm font-medium text-gray-900">
                        <a href={`tel:${truck.provider_business_phone}`} className="text-blue-600 hover:text-blue-800">
                          {truck.provider_business_phone}
                        </a>
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Driver Information */}
            {(truck.driver_name || truck.driver_phone || truck.driver_email || truck.driver_license_number) && (
              <div className="mt-8 pt-6 border-t border-gray-200">
                <h4 className="text-sm font-medium text-gray-900 uppercase tracking-wide mb-4">
                  Driver Information
                </h4>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {truck.driver_name && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-500 flex items-center">
                        <User className="h-4 w-4 mr-1" />
                        Name:
                      </span>
                      <span className="text-sm font-medium text-gray-900">
                        {truck.driver_name}
                      </span>
                    </div>
                  )}
                  
                  {truck.driver_phone && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-500 flex items-center">
                        <Phone className="h-4 w-4 mr-1" />
                        Phone:
                      </span>
                      <span className="text-sm font-medium text-gray-900">
                        <a href={`tel:${truck.driver_phone}`} className="text-blue-600 hover:text-blue-800">
                          {truck.driver_phone}
                        </a>
                      </span>
                    </div>
                  )}
                  
                  {truck.driver_email && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-500 flex items-center">
                        <Mail className="h-4 w-4 mr-1" />
                        Email:
                      </span>
                      <span className="text-sm font-medium text-gray-900">
                        <a href={`mailto:${truck.driver_email}`} className="text-blue-600 hover:text-blue-800">
                          {truck.driver_email}
                        </a>
                      </span>
                    </div>
                  )}
                  
                  {truck.driver_license_number && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-500 flex items-center">
                        <CreditCard className="h-4 w-4 mr-1" />
                        License #:
                      </span>
                      <span className="text-sm font-medium text-gray-900">
                        {truck.driver_license_number}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Timestamps */}
            <div className="mt-8 pt-6 border-t border-gray-200">
              <h4 className="text-sm font-medium text-gray-900 uppercase tracking-wide mb-4">
                Timestamps
              </h4>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">Created:</span>
                  <span className="text-sm font-medium text-gray-900">
                    {new Date(truck.created_at).toLocaleDateString()}
                  </span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">Last Updated:</span>
                  <span className="text-sm font-medium text-gray-900">
                    {new Date(truck.updated_at).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Images Section */}
        {truck.images && truck.images.length > 0 && (
          <div className="mt-8 bg-white shadow-sm rounded-lg overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex items-center">
                <Image className="h-5 w-5 text-blue-500 mr-2" />
                <h3 className="text-lg font-medium text-gray-900">Truck Images</h3>
                <span className="ml-2 inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  {truck.images.length}
                </span>
              </div>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {truck.images.map((imagePath, index) => {
                  // Ensure the URL points to the API server and remove any double slashes
                  // Remove /api from the base URL for file serving
                  const apiBaseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
                  const baseUrl = apiBaseUrl.replace('/api', '');
                  const cleanPath = imagePath.startsWith('/') ? imagePath : `/${imagePath}`;
                  const imageUrl = `${baseUrl}${cleanPath}`;
                  
                  return (
                    <div key={index} className="relative group">
                      <div className="aspect-square rounded-lg overflow-hidden bg-gray-100">
                        <img
                          src={imageUrl}
                          alt={`Truck image ${index + 1}`}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                          onError={(e) => {
                            console.error('Image load error:', {
                              url: imageUrl,
                              originalPath: imagePath,
                              baseUrl,
                              error: e.error
                            });
                            e.target.src = 'https://via.placeholder.com/300';
                            e.target.alt = 'Image not available';
                          }}
                          crossOrigin="anonymous"
                        />
                      </div>
                      <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-200 rounded-lg flex items-center justify-center">
                        <button
                          onClick={() => {
                            window.open(imageUrl, '_blank', 'noopener,noreferrer');
                          }}
                          className="opacity-0 group-hover:opacity-100 bg-white bg-opacity-90 hover:bg-opacity-100 rounded-full p-2 transition-all duration-200"
                          title="View full size"
                        >
                          <Eye className="h-4 w-4 text-gray-700" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Documents Section */}
        {truck.documents && truck.documents.length > 0 && (
          <div className="mt-8 bg-white shadow-sm rounded-lg overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex items-center">
                <FileText className="h-5 w-5 text-green-500 mr-2" />
                <h3 className="text-lg font-medium text-gray-900">Documents</h3>
                <span className="ml-2 inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  {truck.documents.length}
                </span>
              </div>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {truck.documents.map((doc, index) => {
                  // Use actual filename for all document types, with fallback to descriptive name
                  const getDocumentTitle = (fileName, documentType) => {
                    // Always prefer the actual filename if available
                    if (fileName && fileName.trim() !== '') {
                      return fileName;
                    }
                    
                    // Fallback to a descriptive name based on document type
                    const typeDisplayNames = {
                      'registration': 'Registration Document',
                      'technical_inspection': 'Technical Inspection',
                      'license': 'Driver License',
                      'business_license': 'Business License',
                      'additional_docs': 'Additional Document',
                      'permit': 'Permit Document',
                      'maintenance_record': 'Maintenance Record',
                      'driver_certificate': 'Driver Certificate',
                      'customs_documents': 'Customs Documents',
                      'safety_certificate': 'Safety Certificate',
                      'emission_certificate': 'Emission Certificate',
                      'weight_certificate': 'Weight Certificate',
                      'transport_license': 'Transport License',
                      'route_permit': 'Route Permit',
                      'hazmat_permit': 'Hazmat Permit',
                      'oversize_permit': 'Oversize Permit',
                      'fuel_card': 'Fuel Card',
                      'toll_transponder': 'Toll Transponder',
                      'gps_certificate': 'GPS Certificate',
                      'compliance_certificate': 'Compliance Certificate'
                    };
                    
                    return typeDisplayNames[documentType] || 'Document';
                  };
                  
                  const getVerificationStatusColor = (status) => {
                    switch (status) {
                      case 'approved': return 'bg-green-100 text-green-800';
                      case 'rejected': return 'bg-red-100 text-red-800';
                      case 'pending': return 'bg-yellow-100 text-yellow-800';
                      default: return 'bg-gray-100 text-gray-800';
                    }
                  };

                  return (
                    <div key={index} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center flex-1 min-w-0">
                          <div className="flex-shrink-0">
                            <FileText className="h-10 w-10 text-gray-400" />
                          </div>
                          <div className="ml-4 flex-1 min-w-0">
                            <div className="flex items-center space-x-2">
                              <p className="text-sm font-medium text-gray-900 truncate">
                                {getDocumentTitle(doc.file_name, doc.document_type)}
                              </p>
                              <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getVerificationStatusColor(doc.verification_status)}`}>
                                {doc.verification_status}
                              </span>
                            </div>
                            <p className="text-sm text-gray-500">
                              {doc.document_type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                              {doc.file_size && ` • ${(doc.file_size / 1024).toFixed(1)} KB`}
                            </p>
                            <p className="text-xs text-gray-400">
                              Uploaded: {new Date(doc.uploaded_at).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2 ml-4">
                          <button
                            onClick={async () => {
                              try {
                                const response = await apiClient.documents.download(doc.id);
                                
                                // Create blob URL and open in new tab
                                const blob = new Blob([response.data], { 
                                  type: response.headers['content-type'] || 'application/pdf' 
                                });
                                const url = window.URL.createObjectURL(blob);
                                const newWindow = window.open(url, '_blank');
                                
                                // Clean up the URL after a delay
                                setTimeout(() => {
                                  window.URL.revokeObjectURL(url);
                                }, 1000);
                                
                                if (!newWindow) {
                                  alert('Popup blocked. Please allow popups for this site to view documents.');
                                }
                              } catch (error) {
                                console.error('Error viewing document:', error);
                                alert(`Error viewing document: ${error.response?.data?.error || error.message}`);
                              }
                            }}
                            className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            View
                          </button>
                          <button
                            className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                            onClick={async (e) => {
                              e.preventDefault();
                              try {
                                const fileName = doc.file_name || 'document.pdf';
                                
                                // Use the proper API endpoint with authentication
                                const response = await apiClient.documents.download(doc.id);
                                
                                // Create blob from response
                                const blob = new Blob([response.data], { 
                                  type: response.headers['content-type'] || 'application/pdf' 
                                });
                                const downloadUrl = window.URL.createObjectURL(blob);
                                
                                // Create and trigger download
                                const downloadLink = window.document.createElement('a');
                                downloadLink.style.display = 'none';
                                downloadLink.href = downloadUrl;
                                downloadLink.download = fileName;
                                window.document.body.appendChild(downloadLink);
                                downloadLink.click();
                                window.URL.revokeObjectURL(downloadUrl);
                                window.document.body.removeChild(downloadLink);
                              } catch (error) {
                                console.error('Download error:', error);
                                alert(`Failed to download the document: ${error.response?.data?.error || error.message}`);
                              }
                            }}
                          >
                            <Download className="h-4 w-4 mr-1" />
                            Download
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Stats Cards */}
        <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Package className="h-8 w-8 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Completed Bookings</p>
                <p className="text-2xl font-semibold text-gray-900">{truckStats.completedBookings}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <DollarSign className="h-8 w-8 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Total Revenue</p>
                <p className="text-2xl font-semibold text-gray-900">{formatCurrency(truckStats.totalRevenue)}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Calendar className="h-8 w-8 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Days Active</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {Math.floor((new Date() - new Date(truck.created_at)) / (1000 * 60 * 60 * 24))}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TruckDetail;
