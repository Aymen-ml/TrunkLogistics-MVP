import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useBookings } from '../../contexts/BookingContext';
import { ArrowLeft, Save, Package, MapPin, Calendar, Truck, Settings, Clock } from 'lucide-react';
import axios from 'axios';
import { VEHICLE_TYPE_LABELS } from '../../constants/truckTypes';

const BookingForm = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { createBooking } = useBookings();
  const [searchParams] = useSearchParams();
  const preSelectedTruckId = searchParams.get('truck');

  const [loading, setLoading] = useState(false);
  const [trucks, setTrucks] = useState([]);
  const [selectedTruck, setSelectedTruck] = useState(null);
  const [priceEstimate, setPriceEstimate] = useState(null);
  const [loadingPrice, setLoadingPrice] = useState(false);
  const [errors, setErrors] = useState({});
  const [formData, setFormData] = useState({
    truck_id: preSelectedTruckId || '',
    service_type: 'transport', // Will be set based on selected truck
    pickup_address: '',
    pickup_city: '',
    destination_address: '',
    destination_city: '',
    pickup_date: '',
    pickup_time: '',
    cargo_description: '',
    cargo_weight: '',
    cargo_volume: '',
    notes: '',
    // Rental-specific fields
    rental_start_datetime: '',
    rental_end_datetime: '',
    work_address: '',
    purpose_description: '',
    operator_required: false
  });

  useEffect(() => {
    fetchTrucks();
  }, []);

  useEffect(() => {
    if (preSelectedTruckId && trucks.length > 0) {
      const truck = trucks.find(t => t.id === preSelectedTruckId);
      if (truck) {
        setSelectedTruck(truck);
        setFormData(prev => ({ ...prev, truck_id: preSelectedTruckId }));
      }
    }
  }, [preSelectedTruckId, trucks]);

  const fetchTrucks = async () => {
    try {
      const response = await axios.get('/trucks');
      // Only show active trucks
      const activeTrucks = response.data.data.trucks.filter(truck => truck.status === 'active');
      setTrucks(activeTrucks);
    } catch (error) {
      console.error('Error fetching trucks:', error);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Handle truck selection
    if (name === 'truck_id') {
      const truck = trucks.find(t => t.id === value);
      setSelectedTruck(truck);
      setPriceEstimate(null); // Reset price estimate when truck changes
      // Update service type based on selected truck
      if (truck) {
        setFormData(prev => ({
          ...prev,
          service_type: truck.service_type || 'transport',
          [name]: value
        }));
      }
    }
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }

    // Trigger price calculation when relevant fields change (skip for fixed-price trucks)
    if (name === 'truck_id') {
      const selectedTruckForPrice = trucks.find(t => t.id === value);
      if (selectedTruckForPrice?.service_type === 'rental') {
        // For rental equipment, calculate rental price when dates change
        const updatedFormData = { ...formData, [name]: value };
        if (updatedFormData.rental_start_datetime && updatedFormData.rental_end_datetime) {
          calculateRentalPrice(value, updatedFormData.rental_start_datetime, updatedFormData.rental_end_datetime);
        }
      }
    } else if (['truck_id', 'pickup_city', 'destination_city'].includes(name)) {
      const updatedFormData = { ...formData, [name]: value };
      if (updatedFormData.truck_id && updatedFormData.pickup_city && updatedFormData.destination_city) {
        const truckForPrice = trucks.find(t => t.id === updatedFormData.truck_id);
        // Only calculate price for per-km trucks, skip fixed-price trucks
        if (truckForPrice?.service_type === 'transport' && truckForPrice?.pricing_type === 'per_km') {
          calculatePriceEstimate(updatedFormData.truck_id, updatedFormData.pickup_city, updatedFormData.destination_city);
        }
      }
    }
    
    // Calculate rental price when dates change
    if (['rental_start_datetime', 'rental_end_datetime'].includes(name) && selectedTruck?.service_type === 'rental') {
      const updatedFormData = { ...formData, [name]: value };
      if (updatedFormData.truck_id && updatedFormData.rental_start_datetime && updatedFormData.rental_end_datetime) {
        calculateRentalPrice(updatedFormData.truck_id, updatedFormData.rental_start_datetime, updatedFormData.rental_end_datetime);
      }
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.truck_id) {
      newErrors.truck_id = 'Please select a truck';
    }

    // Skip price estimate validation for fixed-price trucks
    if (selectedTruck?.pricing_type !== 'fixed' && !priceEstimate) {
      newErrors.general = 'Please wait for price calculation to complete';
      return false;
    }

    // Validation based on service type
    if (selectedTruck?.service_type === 'rental') {
      // Rental equipment validation
      if (!formData.rental_start_datetime) {
        newErrors.rental_start_datetime = 'Rental start date and time is required';
      }
      
      if (!formData.rental_end_datetime) {
        newErrors.rental_end_datetime = 'Rental end date and time is required';
      }
      
      if (formData.rental_start_datetime && formData.rental_end_datetime) {
        const startDate = new Date(formData.rental_start_datetime);
        const endDate = new Date(formData.rental_end_datetime);
        
        if (endDate <= startDate) {
          newErrors.rental_end_datetime = 'End date must be after start date';
        }
        
        if (startDate < new Date()) {
          newErrors.rental_start_datetime = 'Start date cannot be in the past';
        }
      }
      
      if (!formData.work_address.trim()) {
        newErrors.work_address = 'Work location is required for equipment rental';
      }
      
      if (!formData.purpose_description.trim()) {
        newErrors.purpose_description = 'Purpose description is required for equipment rental';
      }
    } else {
      // Transportation validation
      if (!formData.pickup_address.trim()) {
        newErrors.pickup_address = 'Pickup address is required';
      }

      if (!formData.pickup_city.trim()) {
        newErrors.pickup_city = 'Pickup city is required';
      }

      if (!formData.destination_address.trim()) {
        newErrors.destination_address = 'Destination address is required';
      }

      if (!formData.destination_city.trim()) {
        newErrors.destination_city = 'Destination city is required';
      }

      if (!formData.pickup_date) {
        newErrors.pickup_date = 'Pickup date is required';
      }

      if (!formData.cargo_description.trim()) {
        newErrors.cargo_description = 'Cargo description is required';
      }

      if (!formData.cargo_weight || formData.cargo_weight <= 0) {
        newErrors.cargo_weight = 'Valid cargo weight is required';
      }
    }

    // Verify truck is active
    if (selectedTruck && selectedTruck.status !== 'active') {
      newErrors.truck_id = `This truck is currently ${selectedTruck.status} and is not available for new bookings`;
    }

    // Check if cargo weight exceeds truck capacity
    if (selectedTruck && formData.cargo_weight && selectedTruck.capacity_weight) {
      const cargoWeight = parseFloat(formData.cargo_weight);
      const truckCapacity = parseFloat(selectedTruck.capacity_weight);
      
      // Debug logging (remove in production)
      console.log('Weight validation debug v2.1:', {
        cargoWeight: formData.cargo_weight,
        cargoWeightType: typeof formData.cargo_weight,
        cargoWeightParsed: cargoWeight,
        truckCapacity: selectedTruck.capacity_weight,
        truckCapacityType: typeof selectedTruck.capacity_weight,
        truckCapacityParsed: truckCapacity,
        comparison: cargoWeight > truckCapacity,
        timestamp: new Date().toISOString()
      });
      
      if (!isNaN(cargoWeight) && !isNaN(truckCapacity) && cargoWeight > truckCapacity) {
        newErrors.cargo_weight = `Weight exceeds truck capacity (${truckCapacity.toFixed(2)} kg)`;
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const calculatePriceEstimate = async (truckId, pickupCity, destinationCity) => {
    if (!truckId || !pickupCity || !destinationCity) {
      setPriceEstimate(null);
      return;
    }

    try {
      setLoadingPrice(true);
      const response = await axios.get('/bookings/price-estimate', {
        params: {
          truckId,
          pickupCity,
          destinationCity
        }
      });
      
      setPriceEstimate(response.data.data);
    } catch (error) {
      console.error('Error calculating price estimate:', error);
      setPriceEstimate(null);
    } finally {
      setLoadingPrice(false);
    }
  };
  
  const calculateRentalPrice = async (truckId, startDatetime, endDatetime) => {
    if (!truckId || !startDatetime || !endDatetime) {
      setPriceEstimate(null);
      return;
    }

    try {
      setLoadingPrice(true);
      const response = await axios.get('/bookings/rental-price-estimate', {
        params: {
          truckId,
          startDatetime,
          endDatetime
        }
      });
      
      setPriceEstimate(response.data.data);
    } catch (error) {
      console.error('Error calculating rental price:', error);
      setPriceEstimate(null);
    } finally {
      setLoadingPrice(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    let submitData = {}; // Declare outside try block for error logging
    
    try {
      setLoading(true);
      
      // Skip price estimate validation for fixed-price trucks
      if (selectedTruck?.pricing_type !== 'fixed' && (!priceEstimate || !priceEstimate.total_price)) {
        throw new Error('Price estimate is required. Please wait for price calculation.');
      }

      // Skip distance validation for rental equipment and fixed-price trucks
      if (selectedTruck?.service_type !== 'rental' && selectedTruck?.pricing_type === 'per_km' && (!priceEstimate || !priceEstimate.distance)) {
        throw new Error('Invalid price estimate. Please recalculate the price.');
      }

      let totalPrice = 0;
      if (selectedTruck?.service_type === 'rental') {
        totalPrice = priceEstimate.total_price;
      } else if (selectedTruck?.pricing_type === 'fixed') {
        // For fixed-price trucks, use the fixed price directly from truck data
        totalPrice = parseFloat(selectedTruck.fixed_price);
      } else {
        // For per-km pricing, calculate based on distance
        totalPrice = parseFloat(priceEstimate.price_per_km) * priceEstimate.distance;
        if (isNaN(totalPrice)) {
          throw new Error('Invalid price calculation. Please try again.');
        }
      }

      submitData = {
        truckId: formData.truck_id,
        service_type: selectedTruck?.service_type || 'transport',
        notes: formData.notes
      };
      
      if (selectedTruck?.service_type === 'rental') {
        // Equipment rental data
        submitData = {
          ...submitData,
          rental_start_datetime: formData.rental_start_datetime,
          rental_end_datetime: formData.rental_end_datetime,
          work_address: formData.work_address,
          purpose_description: formData.purpose_description,
          operator_required: formData.operator_required
        };
      } else {
        // Transportation data
        submitData = {
          ...submitData,
          pickupAddress: formData.pickup_address,
          pickupCity: formData.pickup_city,
          destinationAddress: formData.destination_address,
          destinationCity: formData.destination_city,
          pickupDate: formData.pickup_date,
          pickupTime: formData.pickup_time,
          cargoDescription: formData.cargo_description,
          cargoWeight: parseFloat(formData.cargo_weight),
          cargoVolume: formData.cargo_volume ? parseFloat(formData.cargo_volume) : null
        };
      }

      const booking = await createBooking(submitData);
      if (!booking || !booking.id) {
        throw new Error('Invalid response from server - no booking information received');
      }
      navigate(`/bookings/${booking.id}`);
    } catch (error) {
      console.error('Error creating booking:', error);
      console.error('Error response:', error.response?.data);
      console.error('Submit data:', submitData);
      
      if (error.message === 'Price estimate is required. Please wait for price calculation.') {
        setErrors({ general: error.message });
      } else if (error.response?.data?.error) {
        setErrors({ general: error.response.data.error });
      } else if (error.response?.data?.details) {
        const fieldErrors = {};
        error.response.data.details.forEach(detail => {
          fieldErrors[detail.path] = detail.msg;
        });
        setErrors(fieldErrors);
      } else {
        setErrors({ general: 'Failed to create booking. Please try again.' });
      }
      
      // Log the full error state for debugging
      } finally {
      setLoading(false);
    }
  };

  const getTruckTypeLabel = (type) => {
    return VEHICLE_TYPE_LABELS[type] || type;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <button
            onClick={() => navigate('/find-trucks')}
            className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700 mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back to Truck Search
          </button>
          
          <div className="flex items-center">
            <Package className="h-8 w-8 text-blue-600 mr-3" />
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
                Create Booking
              </h1>
              <p className="mt-2 text-sm sm:text-base text-gray-600">
                Book a truck for your shipment
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Form */}
          <div className="lg:col-span-2">
            <div className="bg-white shadow-sm rounded-lg">
              <form onSubmit={handleSubmit} className="p-6 space-y-6">
                {errors.general && (
                  <div className="bg-red-50 border border-red-200 rounded-md p-4">
                    <p className="text-sm text-red-600">{errors.general}</p>
                  </div>
                )}

                {/* Truck Selection */}
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Select Truck</h3>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Available Trucks *
                    </label>
                    <select
                      name="truck_id"
                      value={formData.truck_id}
                      onChange={handleChange}
                      className={`w-full border rounded-md focus:ring-blue-500 focus:border-blue-500 ${
                        errors.truck_id ? 'border-red-300' : 'border-gray-300'
                      }`}
                    >
                      <option value="">Select a truck...</option>
                      {trucks.map((truck) => (
                        <option key={truck.id} value={truck.id}>
                          {truck.license_plate} - {getTruckTypeLabel(truck.truck_type)} 
                          ({truck.capacity_weight}kg) - {truck.provider_name}
                        </option>
                      ))}
                    </select>
                    {errors.truck_id && (
                      <p className="mt-1 text-sm text-red-600">{errors.truck_id}</p>
                    )}
                  </div>
                </div>

                {/* Transportation Section */}
                {selectedTruck?.service_type === 'transport' && (
                  <>
                    {/* Pickup Information */}
                    <div>
                      <h3 className="text-lg font-medium text-gray-900 mb-4">Pickup Information</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div className="sm:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Pickup Address *
                      </label>
                      <input
                        type="text"
                        name="pickup_address"
                        value={formData.pickup_address}
                        onChange={handleChange}
                        className={`w-full border rounded-md focus:ring-blue-500 focus:border-blue-500 ${
                          errors.pickup_address ? 'border-red-300' : 'border-gray-300'
                        }`}
                        placeholder="123 Warehouse Street"
                      />
                      {errors.pickup_address && (
                        <p className="mt-1 text-sm text-red-600">{errors.pickup_address}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Pickup City *
                      </label>
                      <input
                        type="text"
                        name="pickup_city"
                        value={formData.pickup_city}
                        onChange={handleChange}
                        className={`w-full border rounded-md focus:ring-blue-500 focus:border-blue-500 ${
                          errors.pickup_city ? 'border-red-300' : 'border-gray-300'
                        }`}
                        placeholder="New York"
                      />
                      {errors.pickup_city && (
                        <p className="mt-1 text-sm text-red-600">{errors.pickup_city}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Pickup Date *
                      </label>
                      <input
                        type="date"
                        name="pickup_date"
                        value={formData.pickup_date}
                        onChange={handleChange}
                        min={new Date().toISOString().split('T')[0]}
                        className={`w-full border rounded-md focus:ring-blue-500 focus:border-blue-500 ${
                          errors.pickup_date ? 'border-red-300' : 'border-gray-300'
                        }`}
                      />
                      {errors.pickup_date && (
                        <p className="mt-1 text-sm text-red-600">{errors.pickup_date}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Pickup Time
                      </label>
                      <input
                        type="time"
                        name="pickup_time"
                        value={formData.pickup_time}
                        onChange={handleChange}
                        className="w-full border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                  </div>
                </div>

                {/* Destination Information */}
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Destination Information</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div className="sm:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Destination Address *
                      </label>
                      <input
                        type="text"
                        name="destination_address"
                        value={formData.destination_address}
                        onChange={handleChange}
                        className={`w-full border rounded-md focus:ring-blue-500 focus:border-blue-500 ${
                          errors.destination_address ? 'border-red-300' : 'border-gray-300'
                        }`}
                        placeholder="456 Factory Avenue"
                      />
                      {errors.destination_address && (
                        <p className="mt-1 text-sm text-red-600">{errors.destination_address}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Destination City *
                      </label>
                      <input
                        type="text"
                        name="destination_city"
                        value={formData.destination_city}
                        onChange={handleChange}
                        className={`w-full border rounded-md focus:ring-blue-500 focus:border-blue-500 ${
                          errors.destination_city ? 'border-red-300' : 'border-gray-300'
                        }`}
                        placeholder="Philadelphia"
                      />
                      {errors.destination_city && (
                        <p className="mt-1 text-sm text-red-600">{errors.destination_city}</p>
                      )}
                    </div>
                  </div>
                </div>

                    {/* Cargo Information */}
                    <div>
                      <h3 className="text-lg font-medium text-gray-900 mb-4">Cargo Information</h3>
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Cargo Description *
                          </label>
                          <textarea
                            name="cargo_description"
                            value={formData.cargo_description}
                            onChange={handleChange}
                            rows={3}
                            className={`w-full border rounded-md focus:ring-blue-500 focus:border-blue-500 ${
                              errors.cargo_description ? 'border-red-300' : 'border-gray-300'
                            }`}
                            placeholder="Describe what you're shipping..."
                          />
                          {errors.cargo_description && (
                            <p className="mt-1 text-sm text-red-600">{errors.cargo_description}</p>
                          )}
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Weight (kg) *
                            </label>
                            <input
                              type="number"
                              name="cargo_weight"
                              value={formData.cargo_weight}
                              onChange={handleChange}
                              min="0"
                              step="0.01"
                              className={`w-full border rounded-md focus:ring-blue-500 focus:border-blue-500 ${
                                errors.cargo_weight ? 'border-red-300' : 'border-gray-300'
                              }`}
                              placeholder="1000"
                            />
                            {errors.cargo_weight && (
                              <p className="mt-1 text-sm text-red-600">{errors.cargo_weight}</p>
                            )}
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Volume (m³)
                            </label>
                            <input
                              type="number"
                              name="cargo_volume"
                              value={formData.cargo_volume}
                              onChange={handleChange}
                              min="0"
                              step="0.01"
                              className="w-full border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                              placeholder="10"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </>
                )}
                
                {/* Equipment Rental Section */}
                {selectedTruck?.service_type === 'rental' && (
                  <>
                    {/* Rental Period */}
                    <div>
                      <h3 className="text-lg font-medium text-gray-900 mb-4">Rental Period</h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Start Date & Time *
                          </label>
                          <input
                            type="datetime-local"
                            name="rental_start_datetime"
                            value={formData.rental_start_datetime}
                            onChange={handleChange}
                            min={new Date().toISOString().slice(0, 16)}
                            className={`w-full border rounded-md focus:ring-blue-500 focus:border-blue-500 ${
                              errors.rental_start_datetime ? 'border-red-300' : 'border-gray-300'
                            }`}
                          />
                          {errors.rental_start_datetime && (
                            <p className="mt-1 text-sm text-red-600">{errors.rental_start_datetime}</p>
                          )}
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            End Date & Time *
                          </label>
                          <input
                            type="datetime-local"
                            name="rental_end_datetime"
                            value={formData.rental_end_datetime}
                            onChange={handleChange}
                            min={formData.rental_start_datetime || new Date().toISOString().slice(0, 16)}
                            className={`w-full border rounded-md focus:ring-blue-500 focus:border-blue-500 ${
                              errors.rental_end_datetime ? 'border-red-300' : 'border-gray-300'
                            }`}
                          />
                          {errors.rental_end_datetime && (
                            <p className="mt-1 text-sm text-red-600">{errors.rental_end_datetime}</p>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    {/* Work Location */}
                    <div>
                      <h3 className="text-lg font-medium text-gray-900 mb-4">Work Location</h3>
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Work Address *
                          </label>
                          <textarea
                            name="work_address"
                            value={formData.work_address}
                            onChange={handleChange}
                            rows={2}
                            className={`w-full border rounded-md focus:ring-blue-500 focus:border-blue-500 ${
                              errors.work_address ? 'border-red-300' : 'border-gray-300'
                            }`}
                            placeholder="Complete address where equipment will be used..."
                          />
                          {errors.work_address && (
                            <p className="mt-1 text-sm text-red-600">{errors.work_address}</p>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    {/* Purpose and Details */}
                    <div>
                      <h3 className="text-lg font-medium text-gray-900 mb-4">Rental Details</h3>
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Purpose Description *
                          </label>
                          <textarea
                            name="purpose_description"
                            value={formData.purpose_description}
                            onChange={handleChange}
                            rows={3}
                            className={`w-full border rounded-md focus:ring-blue-500 focus:border-blue-500 ${
                              errors.purpose_description ? 'border-red-300' : 'border-gray-300'
                            }`}
                            placeholder="Describe what the equipment will be used for..."
                          />
                          {errors.purpose_description && (
                            <p className="mt-1 text-sm text-red-600">{errors.purpose_description}</p>
                          )}
                        </div>
                        
                        <div>
                          <label className="flex items-center">
                            <input
                              type="checkbox"
                              name="operator_required"
                              checked={formData.operator_required}
                              onChange={(e) => setFormData(prev => ({...prev, operator_required: e.target.checked}))}
                              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                            />
                            <span className="ml-2 text-sm text-gray-700">
                              I need an operator for this equipment
                            </span>
                          </label>
                        </div>
                      </div>
                    </div>
                  </>
                )}
                
                {/* Common Notes Section */}
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Additional Information</h3>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Additional Notes
                    </label>
                    <textarea
                      name="notes"
                      value={formData.notes}
                      onChange={handleChange}
                      rows={3}
                      className="w-full border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Any special instructions or requirements..."
                    />
                  </div>
                </div>

                {/* Form Actions */}
                <div className="flex flex-col sm:flex-row sm:justify-end space-y-3 sm:space-y-0 sm:space-x-3 pt-6 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={() => navigate('/find-trucks')}
                    className="w-full sm:w-auto px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full sm:w-auto inline-flex justify-center items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    ) : (
                      <Save className="h-4 w-4 mr-2" />
                    )}
                    Create Booking
                  </button>
                </div>
              </form>
            </div>
          </div>

          {/* Sidebar - Booking Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white shadow-sm rounded-lg p-6 sticky top-8">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                {selectedTruck?.service_type === 'rental' ? 'Rental Summary' : 'Booking Summary'}
              </h3>
              
              {selectedTruck ? (
                <div className="space-y-4">
                  <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                    {selectedTruck.service_type === 'rental' ? (
                      <Settings className="h-8 w-8 text-blue-600" />
                    ) : (
                      <Truck className="h-8 w-8 text-blue-600" />
                    )}
                    <div className="ml-3">
                      <p className="font-medium text-gray-900">{selectedTruck.license_plate}</p>
                      <p className="text-sm text-gray-500">{getTruckTypeLabel(selectedTruck.truck_type)}</p>
                      {selectedTruck.service_type === 'rental' && (
                        <span className="inline-block px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full mt-1">
                          Equipment Rental
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-500">Capacity:</span>
                      <span className="font-medium">{selectedTruck.capacity_weight?.toLocaleString()} kg</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Provider:</span>
                      <span className="font-medium">{selectedTruck.provider_name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Pricing:</span>
                      <span className="font-medium">
                        {selectedTruck.service_type === 'rental' ? (
                          <div className="text-right text-xs">
                            {selectedTruck.hourly_rate && <div>${selectedTruck.hourly_rate}/hr</div>}
                            {selectedTruck.daily_rate && <div>${selectedTruck.daily_rate}/day</div>}
                            {selectedTruck.weekly_rate && <div>${selectedTruck.weekly_rate}/wk</div>}
                            {selectedTruck.monthly_rate && <div>${selectedTruck.monthly_rate}/mo</div>}
                          </div>
                        ) : (
                          selectedTruck.pricing_type === 'per_km' 
                            ? `$${selectedTruck.price_per_km}/km`
                            : `$${selectedTruck.fixed_price?.toLocaleString()}`
                        )}
                      </span>
                    </div>
                  </div>

                  {/* Price Estimate Section - Hide for fixed-price trucks */}
                  {selectedTruck?.pricing_type !== 'fixed' && (
                    <div className="pt-4 border-t border-gray-200">
                      <div className="flex justify-between items-center">
                        <span className="font-medium text-gray-900">Price Estimate:</span>
                        {loadingPrice ? (
                          <div className="flex items-center">
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
                            <span className="text-sm text-gray-500">Calculating...</span>
                          </div>
                        ) : priceEstimate ? (
                          <span className="font-bold text-green-600">
                            ${priceEstimate.total_price?.toLocaleString()}
                          </span>
                        ) : selectedTruck?.service_type === 'rental' ? (
                          formData.rental_start_datetime && formData.rental_end_datetime ? (
                            <span className="text-sm text-gray-500">Select equipment to see price</span>
                          ) : (
                            <span className="text-sm text-gray-500">Enter rental dates to calculate</span>
                          )
                        ) : (
                          formData.pickup_city && formData.destination_city ? (
                            <span className="text-sm text-gray-500">Select truck to see price</span>
                          ) : (
                            <span className="text-sm text-gray-500">Enter cities to calculate</span>
                          )
                        )}
                      </div>
                      
                      {priceEstimate && (
                        <div className="mt-3 space-y-2 text-xs text-gray-600">
                          {selectedTruck?.service_type === 'rental' ? (
                            <>
                              <div className="flex justify-between">
                                <span>Duration:</span>
                                <span>{priceEstimate.duration_hours || 0} hours</span>
                              </div>
                              <div className="flex justify-between">
                                <span>Days:</span>
                                <span>{priceEstimate.duration_days || 0} days</span>
                              </div>
                              {priceEstimate.breakdown && (
                                <div className="mt-2 space-y-1">
                                  {priceEstimate.breakdown.hours && (
                                    <div className="flex justify-between text-xs">
                                      <span>{priceEstimate.breakdown.hours}h × ${priceEstimate.breakdown.hourly_rate}/hr</span>
                                    </div>
                                  )}
                                  {priceEstimate.breakdown.days && (
                                    <div className="flex justify-between text-xs">
                                      <span>{priceEstimate.breakdown.days}d × ${priceEstimate.breakdown.daily_rate}/day</span>
                                    </div>
                                  )}
                                  {priceEstimate.breakdown.weeks && (
                                    <div className="flex justify-between text-xs">
                                      <span>{priceEstimate.breakdown.weeks}w × ${priceEstimate.breakdown.weekly_rate}/week</span>
                                    </div>
                                  )}
                                  {priceEstimate.breakdown.months && (
                                    <div className="flex justify-between text-xs">
                                      <span>{priceEstimate.breakdown.months}m × ${priceEstimate.breakdown.monthly_rate}/month</span>
                                    </div>
                                  )}
                                </div>
                              )}
                            </>
                          ) : (
                            <>
                              {selectedTruck?.pricing_type === 'per_km' && priceEstimate.distance && (
                                <>
                                  <div className="flex justify-between">
                                    <span>Distance:</span>
                                    <span>{priceEstimate.distance} km</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span>Duration:</span>
                                    <span>{Math.round(priceEstimate.duration / 60)} hours</span>
                                  </div>
                                </>
                              )}
                              <div className="flex justify-between">
                                <span>Rate:</span>
                                <span>
                                  {selectedTruck?.pricing_type === 'per_km' 
                                    ? `${selectedTruck.price_per_km}/km`
                                    : 'Fixed price'
                                  }
                                </span>
                              </div>
                              {priceEstimate.estimated && selectedTruck?.pricing_type === 'per_km' && (
                                <p className="text-xs text-orange-600 mt-2">
                                  * Estimated distance (Google Maps not configured)
                                </p>
                              )}
                            </>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Truck className="mx-auto h-12 w-12 text-gray-400" />
                  <p className="mt-2 text-sm text-gray-500">
                    Select a truck to see booking details
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingForm;
