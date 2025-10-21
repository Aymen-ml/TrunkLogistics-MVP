import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { ArrowLeft, Save, Package, MapPin, Calendar, Truck } from 'lucide-react';
import axios from 'axios';

const EditBooking = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [truck, setTruck] = useState(null);
  const [errors, setErrors] = useState({});
  const [formData, setFormData] = useState({
    pickup_address: '',
    pickup_city: '',
    destination_address: '',
    destination_city: '',
    pickup_date: '',
    pickup_time: '',
    cargo_description: '',
    cargo_weight: '',
    cargo_volume: '',
    notes: ''
  });

  useEffect(() => {
    fetchBooking();
  }, [id]);

  const fetchBooking = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`/bookings/${id}`);
      const booking = response.data.data.booking;
      
      // Format date for date input
      const pickupDate = booking.pickup_date ? new Date(booking.pickup_date).toISOString().split('T')[0] : '';
      
      setFormData({
        pickup_address: booking.pickup_address || '',
        pickup_city: booking.pickup_city || '',
        destination_address: booking.destination_address || '',
        destination_city: booking.destination_city || '',
        pickup_date: pickupDate,
        pickup_time: booking.pickup_time || '',
        cargo_description: booking.cargo_description || '',
        cargo_weight: booking.cargo_weight || '',
        cargo_volume: booking.cargo_volume || '',
        notes: booking.notes || ''
      });
      
      // Fetch truck details
      if (booking.truck_id) {
        const truckResponse = await axios.get(`/trucks/${booking.truck_id}`);
        setTruck(truckResponse.data.data.truck);
      }
      
    } catch (error) {
      console.error('Error fetching booking:', error);
      navigate('/bookings');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when field is edited
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: null
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.pickup_address) newErrors.pickup_address = 'Pickup address is required';
    if (!formData.pickup_city) newErrors.pickup_city = 'Pickup city is required';
    if (!formData.destination_address) newErrors.destination_address = 'Destination address is required';
    if (!formData.destination_city) newErrors.destination_city = 'Destination city is required';
    if (!formData.pickup_date) newErrors.pickup_date = 'Pickup date is required';
    if (!formData.cargo_description) newErrors.cargo_description = 'Cargo description is required';
    
    // Cargo weight validation
    const weight = parseFloat(formData.cargo_weight);
    if (!formData.cargo_weight) {
      newErrors.cargo_weight = 'Cargo weight is required';
    } else if (isNaN(weight) || weight <= 0) {
      newErrors.cargo_weight = 'Cargo weight must be a positive number';
    } else if (truck && truck.capacity_weight) {
      const truckCapacity = parseFloat(truck.capacity_weight);
      
      // Debug logging (remove in production)
      console.log('EditBooking weight validation debug:', {
        cargoWeight: formData.cargo_weight,
        cargoWeightType: typeof formData.cargo_weight,
        cargoWeightParsed: weight,
        truckCapacity: truck.capacity_weight,
        truckCapacityType: typeof truck.capacity_weight,
        truckCapacityParsed: truckCapacity,
        comparison: weight > truckCapacity
      });
      
      if (!isNaN(weight) && !isNaN(truckCapacity) && weight > truckCapacity) {
        newErrors.cargo_weight = `Cargo weight (${weight} kg) exceeds truck capacity (${truckCapacity.toFixed(2)} kg)`;
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    try {
      setSaving(true);
      
      // Get the current booking data to ensure we have the truckId
      const bookingResponse = await axios.get(`/bookings/${id}`);
      const currentBooking = bookingResponse.data.data.booking;
      
      // Format the date to ISO string without timezone
      const formatDateForServer = (dateString) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        return date.toISOString().split('T')[0];
      };
      
      // Format the data for the API (using camelCase for server)
      const payload = {
        truckId: currentBooking.truck_id, // Include the truckId from the current booking
        pickupAddress: formData.pickup_address,
        pickupCity: formData.pickup_city,
        destinationAddress: formData.destination_address,
        destinationCity: formData.destination_city,
        pickupDate: formatDateForServer(formData.pickup_date),
        pickupTime: formData.pickup_time,
        cargoDescription: formData.cargo_description,
        cargoWeight: parseFloat(formData.cargo_weight),
        cargoVolume: formData.cargo_volume ? parseFloat(formData.cargo_volume) : null,
        notes: formData.notes,
        status: currentBooking.status // Include current status
      };
      
      console.log('Updating booking with payload:', payload);
      
      const response = await axios.put(`/bookings/${id}`, payload, {
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      // Redirect to booking detail page with success message
      navigate(`/bookings/${id}`, { 
        state: { message: 'Booking updated successfully' } 
      });
      
    } catch (error) {
      console.error('Error updating booking:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        statusText: error.response?.statusText,
        request: {
          url: error.config?.url,
          method: error.config?.method,
          data: error.config?.data,
          headers: error.config?.headers
        }
      });
      
      let errorMessage = 'Failed to update booking. Please try again.';
      
      // Handle validation errors from the server
      if (error.response?.data?.errors?.length > 0) {
        // Format the errors into a readable message
        errorMessage = error.response.data.errors
          .map(err => {
            // Handle case where param might be undefined
            if (!err.param) {
              return `• ${err.msg || 'Validation error'}`;
            }
            // Convert camelCase to space-separated words and capitalize first letter
            const fieldName = err.param.replace(/([A-Z])/g, ' $1')
              .replace(/^./, str => str.toUpperCase())
              .trim();
            return `• ${fieldName}: ${err.msg || 'Validation error'}`;
          })
          .join('\n');
      } 
      // Handle other types of errors
      else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      // Set the error message in state
      setErrors({
        form: errorMessage
      });
      
      // Enhanced debug logging
      console.group('Booking Update Error');
      console.log('Error response:', error.response?.data);
      console.log('Error status:', error.response?.status);
      if (error.response?.data?.errors) {
        error.response.data.errors.forEach((err, index) => {
          console.log(`Validation error ${index + 1}:`, err);
        });
      }
      console.groupEnd();
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 dark:bg-gray-900 dark:bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 dark:bg-gray-900 dark:bg-gray-900 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center text-sm text-gray-500 dark:text-gray-400 dark:text-gray-500 dark:text-gray-400 dark:text-gray-500 dark:text-gray-400 dark:text-gray-500 hover:text-gray-700 dark:text-gray-200 mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back to Booking
          </button>
          
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">Edit Booking</h1>
          <p className="text-gray-600 dark:text-gray-400 dark:text-gray-500 dark:text-gray-400 dark:text-gray-500 dark:text-gray-400 dark:text-gray-500">Update your booking details below.</p>
        </div>
        
        {errors.form && (
          <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-6">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-700">{errors.form}</p>
              </div>
            </div>
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Truck Information */}
          {truck && (
            <div className="bg-white dark:bg-gray-800 dark:bg-gray-800 dark:bg-gray-800 shadow-sm rounded-lg overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">Truck Information</h3>
              </div>
              <div className="px-6 py-4">
                <div className="flex items-center">
                  <Truck className="h-5 w-5 text-blue-500 mr-3" />
                  <div>
                    <h4 className="font-medium">{truck.truck_type}</h4>
                    <p className="text-sm text-gray-500 dark:text-gray-400 dark:text-gray-500 dark:text-gray-400 dark:text-gray-500 dark:text-gray-400 dark:text-gray-500">License: {truck.license_plate}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400 dark:text-gray-500 dark:text-gray-400 dark:text-gray-500 dark:text-gray-400 dark:text-gray-500">
                      Capacity: {truck.capacity_weight} kg, {truck.capacity_volume} m³
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {/* Route Information */}
          <div className="bg-white dark:bg-gray-800 dark:bg-gray-800 dark:bg-gray-800 shadow-sm rounded-lg overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">Route Information</h3>
            </div>
            <div className="px-6 py-6 space-y-6">
              <div>
                <label htmlFor="pickup_address" className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                  Pickup Address <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="pickup_address"
                  name="pickup_address"
                  value={formData.pickup_address}
                  onChange={handleChange}
                  className={`block w-full rounded-md shadow-sm ${errors.pickup_address ? 'border-red-300' : 'border-gray-300 dark:border-gray-600'} focus:border-blue-500 focus:ring-blue-500`}
                  placeholder="123 Main St"
                />
                {errors.pickup_address && (
                  <p className="mt-1 text-sm text-red-600">{errors.pickup_address}</p>
                )}
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="pickup_city" className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                    Pickup City <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="pickup_city"
                    name="pickup_city"
                    value={formData.pickup_city}
                    onChange={handleChange}
                    className={`block w-full rounded-md shadow-sm ${errors.pickup_city ? 'border-red-300' : 'border-gray-300 dark:border-gray-600'} focus:border-blue-500 focus:ring-blue-500`}
                    placeholder="New York"
                  />
                  {errors.pickup_city && (
                    <p className="mt-1 text-sm text-red-600">{errors.pickup_city}</p>
                  )}
                </div>
                
                <div>
                  <label htmlFor="destination_city" className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                    Destination City <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="destination_city"
                    name="destination_city"
                    value={formData.destination_city}
                    onChange={handleChange}
                    className={`block w-full rounded-md shadow-sm ${errors.destination_city ? 'border-red-300' : 'border-gray-300 dark:border-gray-600'} focus:border-blue-500 focus:ring-blue-500`}
                    placeholder="Los Angeles"
                  />
                  {errors.destination_city && (
                    <p className="mt-1 text-sm text-red-600">{errors.destination_city}</p>
                  )}
                </div>
              </div>
              
              <div>
                <label htmlFor="destination_address" className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                  Destination Address <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="destination_address"
                  name="destination_address"
                  value={formData.destination_address}
                  onChange={handleChange}
                  className={`block w-full rounded-md shadow-sm ${errors.destination_address ? 'border-red-300' : 'border-gray-300 dark:border-gray-600'} focus:border-blue-500 focus:ring-blue-500`}
                  placeholder="456 Destination St"
                />
                {errors.destination_address && (
                  <p className="mt-1 text-sm text-red-600">{errors.destination_address}</p>
                )}
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="pickup_date" className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                    Pickup Date <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    id="pickup_date"
                    name="pickup_date"
                    value={formData.pickup_date}
                    onChange={handleChange}
                    min={new Date().toISOString().split('T')[0]}
                    className={`block w-full rounded-md shadow-sm ${errors.pickup_date ? 'border-red-300' : 'border-gray-300 dark:border-gray-600'} focus:border-blue-500 focus:ring-blue-500`}
                  />
                  {errors.pickup_date && (
                    <p className="mt-1 text-sm text-red-600">{errors.pickup_date}</p>
                  )}
                </div>
                
                <div>
                  <label htmlFor="pickup_time" className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                    Pickup Time
                  </label>
                  <input
                    type="time"
                    id="pickup_time"
                    name="pickup_time"
                    value={formData.pickup_time}
                    onChange={handleChange}
                    className="block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>
          </div>
          
          {/* Cargo Information */}
          <div className="bg-white dark:bg-gray-800 dark:bg-gray-800 dark:bg-gray-800 shadow-sm rounded-lg overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">Cargo Information</h3>
            </div>
            <div className="px-6 py-6 space-y-6">
              <div>
                <label htmlFor="cargo_description" className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                  Cargo Description <span className="text-red-500">*</span>
                </label>
                <textarea
                  id="cargo_description"
                  name="cargo_description"
                  rows={3}
                  value={formData.cargo_description}
                  onChange={handleChange}
                  className={`block w-full rounded-md shadow-sm ${errors.cargo_description ? 'border-red-300' : 'border-gray-300 dark:border-gray-600'} focus:border-blue-500 focus:ring-blue-500`}
                  placeholder="Describe the cargo (e.g., Furniture, Electronics, etc.)"
                />
                {errors.cargo_description && (
                  <p className="mt-1 text-sm text-red-600">{errors.cargo_description}</p>
                )}
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="cargo_weight" className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                    Cargo Weight (kg) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    id="cargo_weight"
                    name="cargo_weight"
                    min="0.1"
                    step="0.1"
                    value={formData.cargo_weight}
                    onChange={handleChange}
                    className={`block w-full rounded-md shadow-sm ${errors.cargo_weight ? 'border-red-300' : 'border-gray-300 dark:border-gray-600'} focus:border-blue-500 focus:ring-blue-500`}
                    placeholder="e.g., 100"
                  />
                  {errors.cargo_weight && (
                    <p className="mt-1 text-sm text-red-600">{errors.cargo_weight}</p>
                  )}
                </div>
                
                <div>
                  <label htmlFor="cargo_volume" className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                    Cargo Volume (m³)
                  </label>
                  <input
                    type="number"
                    id="cargo_volume"
                    name="cargo_volume"
                    min="0.1"
                    step="0.1"
                    value={formData.cargo_volume}
                    onChange={handleChange}
                    className="block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    placeholder="e.g., 1.5"
                  />
                </div>
              </div>
              
              <div>
                <label htmlFor="notes" className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                  Additional Notes
                </label>
                <textarea
                  id="notes"
                  name="notes"
                  rows={2}
                  value={formData.notes}
                  onChange={handleChange}
                  className="block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  placeholder="Any special instructions or requirements..."
                />
              </div>
            </div>
          </div>
          
          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 shadow-sm text-sm font-medium rounded-md text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 dark:bg-gray-800 dark:bg-gray-800 hover:bg-gray-50 dark:bg-gray-900 dark:bg-gray-900 dark:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              disabled={saving}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
              disabled={saving}
            >
              {saving ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Save Changes
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditBooking;
