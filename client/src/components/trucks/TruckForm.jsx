import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { ArrowLeft, Save, Truck } from 'lucide-react';
import { apiClient } from '../../utils/apiClient';
import api from '../../utils/apiClient';
import ImageUpload from '../common/ImageUpload';
import DocumentUpload from '../common/DocumentUpload';

const TruckForm = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditing = Boolean(id);

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [formData, setFormData] = useState({
    serviceType: 'transport', // Default to transport
    truckType: '',
    licensePlate: '',
    capacityWeight: '',
    capacityVolume: '',
    pricingType: '',
    pricePerKm: '',
    fixedPrice: '',
    status: '',
    year: '',
    make: '',
    model: '',
    // Rental-specific fields (exact database field names)
    monthlyRate: '',
    workLocation: '',
    // Driver information (exact database field names)
    driverName: '',
    driverPhone: '',
    driverLicenseNumber: ''
  });
  
  // File upload states
  const [images, setImages] = useState([]);
  const [inspectionDoc, setInspectionDoc] = useState(null);
  const [registrationDoc, setRegistrationDoc] = useState(null);
  const [licenseDoc, setLicenseDoc] = useState(null);
  const [businessLicenseDoc, setBusinessLicenseDoc] = useState(null);
  const [additionalDocs, setAdditionalDocs] = useState([]);

  // Debug: Log inspection document state changes
  React.useEffect(() => {
    console.log('🔍 inspectionDoc state changed:', inspectionDoc);
  }, [inspectionDoc]);

  // Load existing truck data when editing
  React.useEffect(() => {
    const fetchTruckData = async () => {
      if (isEditing) {
        try {
          setLoading(true);
          const response = await apiClient.get(`/trucks/${id}`);
          const truck = response.data.data.truck;
          
          // Update form data with server response
          setFormData({
            serviceType: truck.service_type || 'transport',
            truckType: truck.truck_type || 'flatbed',
            licensePlate: truck.license_plate || '',
            capacityWeight: truck.capacity_weight !== null ? truck.capacity_weight.toString() : '',
            capacityVolume: truck.capacity_volume !== null ? truck.capacity_volume.toString() : '',
            pricingType: truck.pricing_type || 'per_km',
            pricePerKm: truck.price_per_km !== null ? truck.price_per_km.toString() : '',
            fixedPrice: truck.fixed_price !== null ? truck.fixed_price.toString() : '',
            status: truck.status || 'active',
            year: truck.year !== null ? truck.year.toString() : '',
            make: truck.make || '',
            model: truck.model || '',
            // Retail-specific fields
            monthlyRate: truck.monthly_rate !== null ? truck.monthly_rate.toString() : '',
            workLocation: truck.work_location || '',
            // Driver information
            driverName: truck.driver_name || '',
            driverPhone: truck.driver_phone || '',
            driverLicenseNumber: truck.driver_license_number || ''
          });

          // Set existing images
          if (truck.images && Array.isArray(truck.images)) {
            const processedImages = truck.images.map(path => {
              // Check if it's already a complete URL (Cloudinary or other external URLs)
              const isCompleteUrl = path.startsWith('http://') || path.startsWith('https://') || path.includes('res.cloudinary.com');
              
              let fullPath;
              if (isCompleteUrl) {
                // Use the URL directly for Cloudinary and other external URLs
                fullPath = path;
              } else {
                // For local files, construct the URL with API base
                fullPath = `${(import.meta.env.VITE_API_URL || 'http://localhost:5000').replace('/api', '')}${path.startsWith('/') ? path : `/${path}`}`;
              }
              
              return {
                preview: fullPath,
                name: path.split('/').pop(),
                file_path: path,
                type: 'image/jpeg', // Default type for existing images
                size: 0, // Size not available for existing images
                isExisting: true
              };
            });
            setImages(processedImages);
          }
          
          console.log('=== DOCUMENT LOADING DEBUG ===');
          console.log('truck.documents:', truck.documents);
          
          if (truck.documents && Array.isArray(truck.documents)) {
            console.log('All document types found:');
            truck.documents.forEach((doc, index) => {
              console.log(`Document ${index}:`, {
                id: doc.id,
                document_type: doc.document_type,
                file_name: doc.file_name,
                file_path: doc.file_path
              });
            });
            
            const inspectionDocs = truck.documents.filter(doc => 
              doc.document_type === 'inspection' || doc.document_type === 'technical_inspection'
            );
            console.log('Found inspection documents:', inspectionDocs);
            
            // Track which document types we've already set to handle duplicates
            const setDocumentTypes = {
              inspection: false,
              registration: false,
              license: false,
              business_license: false
            };
            
            // Process each document by type (sort by creation date to ensure consistent order)
            const sortedDocuments = [...truck.documents].sort((a, b) => 
              new Date(a.created_at || 0) - new Date(b.created_at || 0)
            );
            
            sortedDocuments.forEach(doc => {
              // Check if it's already a complete URL (Cloudinary or other external URLs)
              const isCompleteUrl = doc.file_path.startsWith('http://') || doc.file_path.startsWith('https://') || doc.file_path.includes('res.cloudinary.com');
              
              let fullPath;
              if (isCompleteUrl) {
                // Use the URL directly for Cloudinary and other external URLs
                fullPath = doc.file_path;
              } else {
                // For local files, construct the URL with API base
                fullPath = `${(import.meta.env.VITE_API_URL || 'http://localhost:5000').replace('/api', '')}${doc.file_path.startsWith('/') ? doc.file_path : `/${doc.file_path}`}`;
              }
              
              const docData = {
                id: doc.id, // Add document ID for deletion
                preview: fullPath,
                file_path: doc.file_path,
                name: doc.file_name || doc.file_path.split('/').pop(),
                type: doc.document_type,
                isExisting: true
              };
              
              // Set document based on type
              switch (doc.document_type) {
                case 'inspection':
                case 'technical_inspection':
                  if (!setDocumentTypes.inspection) {
                    console.log('🔍 INSPECTION DOC - Setting:', docData);
                    setInspectionDoc(docData);
                    setDocumentTypes.inspection = true;
                  } else {
                    console.log('🔍 INSPECTION DOC - Adding to additional (duplicate):', docData);
                    setAdditionalDocs(prev => [...prev, docData]);
                  }
                  break;
                case 'registration':
                  if (!setDocumentTypes.registration) {
                    console.log('📄 REGISTRATION DOC - Setting:', docData);
                    setRegistrationDoc(docData);
                    setDocumentTypes.registration = true;
                  } else {
                    console.log('📄 REGISTRATION DOC - Adding to additional (duplicate):', docData);
                    setAdditionalDocs(prev => [...prev, docData]);
                  }
                  break;
                case 'license':
                  if (!setDocumentTypes.license) {
                    console.log('📋 LICENSE DOC - Setting:', docData);
                    setLicenseDoc(docData);
                    setDocumentTypes.license = true;
                  } else {
                    console.log('📋 LICENSE DOC - Adding to additional (duplicate):', docData);
                    setAdditionalDocs(prev => [...prev, docData]);
                  }
                  break;
                case 'business_license':
                  if (!setDocumentTypes.business_license) {
                    console.log('🏢 BUSINESS LICENSE DOC - Setting:', docData);
                    setBusinessLicenseDoc(docData);
                    setDocumentTypes.business_license = true;
                  } else {
                    console.log('🏢 BUSINESS LICENSE DOC - Adding to additional (duplicate):', docData);
                    setAdditionalDocs(prev => [...prev, docData]);
                  }
                  break;
                default:
                  // Additional documents (any type not specifically handled above)
                  console.log('❓ ADDITIONAL DOC - Setting:', docData);
                  console.log('❓ Unknown document_type:', doc.document_type);
                  setAdditionalDocs(prev => [...prev, docData]);
                  break;
              }
            });
          } else {
            console.log('❌ No documents found or documents is not an array');
          }
          
          console.log('=== END DOCUMENT LOADING ===');
        } catch (error) {
          console.error('Error fetching truck data:', error);
          alert('Failed to load truck data. Please try again.');
          navigate('/trucks');
        } finally {
          setLoading(false);
        }
      }
    };

    fetchTruckData();
  }, [id, isEditing, navigate]);


  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle document deletion for existing documents
  const handleDeleteDocument = async (documentId) => {
    console.log('Attempting to delete document with ID:', documentId);
    console.log('Current user:', user);
    console.log('Auth token in localStorage:', localStorage.getItem('token'));
    
    if (!documentId) {
      alert('Cannot delete document: No document ID found');
      return false;
    }

    // Check if user is authenticated
    if (!user || !localStorage.getItem('token')) {
      alert('You must be logged in to delete documents. Please log in again.');
      navigate('/login');
      return false;
    }

    // Check if this is the inspection document being deleted
    const isInspectionDoc = inspectionDoc && inspectionDoc.id === documentId;
    
    let confirmMessage = 'Are you sure you want to delete this document? This action cannot be undone.';
    if (isInspectionDoc) {
      confirmMessage = 'WARNING: You are about to delete the required inspection document. You must upload a new inspection document before saving the truck. Are you sure you want to continue?';
    }

    if (!window.confirm(confirmMessage)) {
      return false;
    }

    try {
      console.log('Making DELETE request to:', `/truck-documents/${documentId}`);
      const response = await apiClient.delete(`/truck-documents/${documentId}`);
      console.log('Delete response:', response.data);
      alert('Document deleted successfully!');
      return true; // Success
    } catch (error) {
      console.error('Error deleting document:', error);
      console.error('Error response:', error.response);
      
      let errorMessage = 'Failed to delete document. Please try again.';
      
      if (error.response) {
        const status = error.response.status;
        const data = error.response.data;
        
        console.error('Error status:', status);
        console.error('Error data:', data);
        
        switch (status) {
          case 401:
            errorMessage = 'Authentication failed. Please log in again.';
            break;
          case 403:
            errorMessage = 'You do not have permission to delete this document.';
            break;
          case 404:
            errorMessage = 'Document not found. It may have already been deleted.';
            break;
          case 400:
            errorMessage = data?.error || 'Invalid request. Please check the document ID.';
            break;
          case 500:
            errorMessage = 'Server error. Please try again later.';
            break;
          default:
            errorMessage = data?.error || `Error ${status}: ${data?.message || 'Unknown error'}`;
        }
      } else if (error.request) {
        errorMessage = 'Network error. Please check your connection.';
      }
      
      alert(errorMessage);
      return false; // Failure
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.licensePlate?.trim()) {
      newErrors.licensePlate = 'License plate is required';
    }
    
    if (!formData.capacityWeight || isNaN(formData.capacityWeight) || parseFloat(formData.capacityWeight) < 0.1) {
      newErrors.capacityWeight = 'Capacity weight must be at least 0.1';
    }
    
    if (!formData.truckType?.trim()) {
      newErrors.truckType = 'Truck type is required';
    }
    
    if (!formData.make?.trim()) {
      newErrors.make = 'Make is required';
    }
    
    if (!formData.model?.trim()) {
      newErrors.model = 'Model is required';
    }
    
    if (!formData.year || isNaN(formData.year) || parseInt(formData.year, 10) < 1900 || parseInt(formData.year, 10) > new Date().getFullYear() + 1) {
      newErrors.year = 'Year must be between 1900 and ' + (new Date().getFullYear() + 1);
    }
    
    if (!formData.status?.trim()) {
      newErrors.status = 'Status is required';
    }
    
    if (!formData.capacityVolume || isNaN(formData.capacityVolume) || parseFloat(formData.capacityVolume) < 0) {
      newErrors.capacityVolume = 'Capacity volume must be a non-negative number';
    }

    // Validate service-specific required fields
    if (formData.serviceType === 'transport') {
      if (!formData.pricingType) {
        newErrors.pricingType = 'Pricing type is required for transport';
      }

      if (formData.pricingType === 'per_km') {
        if (!formData.pricePerKm || isNaN(formData.pricePerKm) || parseFloat(formData.pricePerKm) <= 0) {
          newErrors.pricePerKm = 'Price per km must be a positive number';
        }
      } else if (formData.pricingType === 'fixed') {
        if (!formData.fixedPrice || isNaN(formData.fixedPrice) || parseFloat(formData.fixedPrice) <= 0) {
          newErrors.fixedPrice = 'Fixed price must be a positive number';
        }
      }
    } else if (formData.serviceType === 'rental') {
      if (!formData.monthlyRate || isNaN(formData.monthlyRate) || parseFloat(formData.monthlyRate) <= 0) {
        newErrors.monthlyRate = 'Monthly rate must be a positive number';
      }
      if (!formData.workLocation?.trim()) {
        newErrors.workLocation = 'Work location is required for rental equipment';
      }
    }

    // Validate required inspection document - always required
    // Accept existing documents (with isExisting flag) or new uploads
    console.log('Validation - inspectionDoc:', inspectionDoc);
    console.log('Validation - inspectionDoc.isExisting:', inspectionDoc?.isExisting);
    console.log('Validation - inspectionDoc.file:', inspectionDoc?.file);
    console.log('Validation - inspectionDoc.file_path:', inspectionDoc?.file_path);
    console.log('Validation - isEditing:', isEditing);
    
    // Check if inspection document is present
    const hasValidInspectionDoc = inspectionDoc && (
      (inspectionDoc.isExisting && inspectionDoc.file_path) || // Existing document with valid path
      (!inspectionDoc.isExisting && inspectionDoc.file) // New uploaded file
    );
    
    if (!hasValidInspectionDoc) {
      console.log('Validation FAILED - inspection document required');
      newErrors.inspectionDoc = 'Inspection document is required';
    } else {
      console.log('Validation PASSED - inspection document found');
    }
    
    // Validate required truck images - at least one image showing license plate
    if (!images || images.length === 0) {
      newErrors.images = 'At least one truck image is required (must show license plate clearly)';
    }
    
    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Client-side validation
    const formErrors = validateForm();
    if (Object.keys(formErrors).length > 0) {
      setErrors(formErrors);
      return;
    }
    
    setLoading(true);
    setErrors({});
    
    try {
      // Prepare FormData for file uploads
      const formDataToSend = new FormData();
      
      // Add truck data
      // Convert form data to snake_case for API
      const truckData = {
        service_type: formData.serviceType,
        truck_type: formData.truckType,
        license_plate: formData.licensePlate,
        capacity_weight: formData.capacityWeight,
        capacity_volume: formData.capacityVolume,
        pricing_type: formData.pricingType,
        price_per_km: formData.pricingType === 'per_km' ? formData.pricePerKm : null,
        fixed_price: formData.pricingType === 'fixed' ? formData.fixedPrice : null,
        year: formData.year,
        make: formData.make,
        model: formData.model,
        status: formData.status,
        // Rental-specific fields (exact database field names)
        monthly_rate: formData.serviceType === 'rental' ? formData.monthlyRate : null,
        work_location: formData.serviceType === 'rental' ? formData.workLocation : null,
        // Driver information
        driver_name: formData.driverName,
        driver_phone: formData.driverPhone,
        driver_license_number: formData.driverLicenseNumber
      };

      // Append truck data to FormData
      Object.entries(truckData).forEach(([key, value]) => {
        if (value !== null && value !== undefined) {
          formDataToSend.append(key, value);
        }
      });
      
      // Handle images
      if (images && images.length > 0) {
        const newImages = images.filter(image => !image.isExisting && image.file);
        const existingImages = images.filter(img => img.isExisting).map(img => img.file_path || img.preview);

        newImages.forEach(image => {
          formDataToSend.append('images', image.file);
        });

        if (existingImages.length > 0) {
          formDataToSend.append('existingImages', JSON.stringify(existingImages));
        }
      }
      
      // Handle inspection document
      if (inspectionDoc) {
        console.log('Processing inspectionDoc:', inspectionDoc);
        console.log('inspectionDoc type:', typeof inspectionDoc);
        console.log('inspectionDoc.isExisting:', inspectionDoc.isExisting);
        console.log('inspectionDoc.file:', inspectionDoc.file);
        console.log('inspectionDoc.file_path:', inspectionDoc.file_path);
        
        if (!inspectionDoc.isExisting && inspectionDoc.file) {
          console.log('Appending new inspection document file');
          formDataToSend.append('inspectionDoc', inspectionDoc.file);
        } else if (inspectionDoc.isExisting && inspectionDoc.file_path) {
          console.log('Appending existing inspection document path:', inspectionDoc.file_path);
          formDataToSend.append('existingInspectionDoc', inspectionDoc.file_path);
        } else {
          console.error('Invalid inspectionDoc structure:', inspectionDoc);
        }
      } else {
        console.log('No inspectionDoc provided');
      }
      
      // Handle registration document
      if (registrationDoc) {
        if (!registrationDoc.isExisting && registrationDoc.file) {
          formDataToSend.append('registrationDoc', registrationDoc.file);
        } else if (registrationDoc.isExisting && registrationDoc.file_path) {
          formDataToSend.append('existingRegistrationDoc', registrationDoc.file_path);
        }
      }
      
      
      // Handle license document
      if (licenseDoc) {
        if (!licenseDoc.isExisting && licenseDoc.file) {
          formDataToSend.append('licenseDoc', licenseDoc.file);
        } else if (licenseDoc.isExisting && licenseDoc.file_path) {
          formDataToSend.append('existingLicenseDoc', licenseDoc.file_path);
        }
      }
      
      // Handle business license document
      if (businessLicenseDoc) {
        if (!businessLicenseDoc.isExisting && businessLicenseDoc.file) {
          formDataToSend.append('businessLicenseDoc', businessLicenseDoc.file);
        } else if (businessLicenseDoc.isExisting && businessLicenseDoc.file_path) {
          formDataToSend.append('existingBusinessLicenseDoc', businessLicenseDoc.file_path);
        }
      }
      
      // Handle additional documents
      if (additionalDocs && additionalDocs.length > 0) {
        const newDocs = additionalDocs.filter(doc => !doc.isExisting && doc.file);
        const existingDocs = additionalDocs.filter(doc => doc.isExisting);

        newDocs.forEach(doc => {
          formDataToSend.append('additionalDocs', doc.file);
        });

        if (existingDocs.length > 0) {
          formDataToSend.append('existingAdditionalDocs', JSON.stringify(
            existingDocs.map(doc => ({
              path: doc.file_path || doc.preview,
              name: doc.name,
              type: doc.type
            }))
          ));
        }
      }

      console.log('Submitting form data:', {
        formData,
        images: images.map(img => img instanceof File ? 'New File' : 'Existing: ' + img.preview),
        inspectionDoc: inspectionDoc instanceof File ? 'New File' : 'Existing: ' + inspectionDoc?.preview,
        additionalDocs: additionalDocs.map(doc => doc instanceof File ? 'New File' : 'Existing: ' + doc.preview)
      });

      // Create or update truck with FormData
      const response = isEditing
        ? await apiClient.put(`/trucks/${id}`, formDataToSend, {
            headers: { 
              'Content-Type': 'multipart/form-data'
            }
          })
        : await apiClient.post('/trucks', formDataToSend, {
            headers: { 
              'Content-Type': 'multipart/form-data'
            }
          });

      // Handle successful submission
      navigate('/trucks');
    } catch (error) {
      console.error('API Error:', error);
      
      // Check if error response exists
      if (error.response?.data) {
        console.error('Error response:', error.response.data);
        
        if (error.response.data.details) {
          // Handle validation errors from express-validator
          console.error('Validation errors:', error.response.data.details);
          const serverErrors = {};
          error.response.data.details.forEach(err => {
            console.error(`Validation error - Field: ${err.path}, Message: ${err.msg}, Value: ${err.value}`);
            serverErrors[err.path] = err.msg;
          });
          setErrors(serverErrors);
        } else {
          // Handle other server errors
          console.error('Server error:', error.response.data.error || error.response.data.message);
          alert(error.response.data.error || error.response.data.message || 'An error occurred while saving the truck');
        }
      } else {
        // Handle network or other errors
        console.error('Network or other error:', error.message);
        alert(error.message || 'Network error occurred while saving the truck');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
        <div className="mb-6 sm:mb-8">
          <button
            onClick={() => navigate('/trucks')}
            className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back to Trucks
          </button>
          <h1 className="mt-2 text-2xl font-bold text-gray-900">
            {isEditing ? 'Edit Truck' : 'Add New Truck'}
          </h1>
        </div>

        <div className="bg-white shadow-sm rounded-lg">
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* Service Type Selection */}
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Service Type *
              </label>
              <div className="flex space-x-4">
                <label className="inline-flex items-center">
                  <input
                    type="radio"
                    name="serviceType"
                    value="transport"
                    checked={formData.serviceType === 'transport'}
                    onChange={handleChange}
                    className="form-radio h-4 w-4 text-blue-600 transition duration-150 ease-in-out"
                  />
                  <span className="ml-2 text-sm text-gray-700">Transport</span>
                </label>
                <label className="inline-flex items-center">
                  <input
                    type="radio"
                    name="serviceType"
                    value="rental"
                    checked={formData.serviceType === 'rental'}
                    onChange={handleChange}
                    className="form-radio h-4 w-4 text-blue-600 transition duration-150 ease-in-out"
                  />
                  <span className="ml-2 text-sm text-gray-700">Rental</span>
                </label>
              </div>
              <p className="mt-1 text-sm text-gray-500">
                Choose whether this vehicle is for logistics or retail services
              </p>
            </div>

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              {/* License Plate */}
              <div className="col-span-2">
                <label htmlFor="licensePlate" className="block text-sm font-medium text-gray-700">
                  License Plate *
                </label>
                <input
                  type="text"
                  name="licensePlate"
                  id="licensePlate"
                  value={formData.licensePlate || ''}
                  onChange={handleChange}
                  className={`mt-1 block w-full rounded-md ${
                    errors.licensePlate ? 'border-red-500 bg-red-50' : 'border-gray-300'
                  } shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm`}
                  required
                />
                {errors.licensePlate && (
                  <p className="mt-1 text-sm text-red-600 font-medium">{errors.licensePlate}</p>
                )}
              </div>

              {/* Truck Type */}
              <div>
                <label htmlFor="truckType" className="block text-sm font-medium text-gray-700">
                  {formData.serviceType === 'retail' ? 'Equipment Type *' : 'Truck Type *'}
                </label>
                  <select
                    id="truckType"
                    name="truckType"
                    value={formData.truckType}
                    onChange={handleChange}
                    className={`mt-1 block w-full rounded-md ${
                      errors.truckType ? 'border-red-500 bg-red-50' : 'border-gray-300'
                    } shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm`}
                    required
                  >
                    {formData.serviceType === 'transport' ? (
                      // Transport truck types
                      <>
                        <option value="flatbed">Flatbed</option>
                        <option value="container">Container</option>
                        <option value="refrigerated">Refrigerated</option>
                        <option value="tanker">Tanker</option>
                        <option value="box">Box Truck</option>
                        <option value="other">Other</option>
                      </>
                    ) : (
                      // Rental equipment types
                      <>
                        <option value="excavator">Excavator</option>
                        <option value="crane">Crane</option>
                        <option value="mobile_crane">Mobile Crane</option>
                        <option value="tower_crane">Tower Crane</option>
                        <option value="bulldozer">Bulldozer</option>
                        <option value="loader">Loader</option>
                        <option value="forklift">Forklift</option>
                        <option value="reach_truck">Reach Truck</option>
                        <option value="pallet_jack">Pallet Jack</option>
                        <option value="dump_truck">Dump Truck</option>
                        <option value="concrete_mixer">Concrete Mixer</option>
                        <option value="other">Other</option>
                      </>
                    )}
                  </select>
                {errors.truckType && (
                  <p className="mt-1 text-sm text-red-600 font-medium">{errors.truckType}</p>
                )}
              </div>

              {/* Make */}
              <div>
                <label htmlFor="make" className="block text-sm font-medium text-gray-700">
                  Make *
                </label>
                <input
                  type="text"
                  id="make"
                  name="make"
                  value={formData.make || ''}
                  onChange={handleChange}
                  className={`mt-1 block w-full rounded-md ${
                    errors.make ? 'border-red-500 bg-red-50' : 'border-gray-300'
                  } shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm`}
                  required
                />
                {errors.make && (
                  <p className="mt-1 text-sm text-red-600 font-medium">{errors.make}</p>
                )}
              </div>

              {/* Model */}
              <div>
                <label htmlFor="model" className="block text-sm font-medium text-gray-700">
                  Model *
                </label>
                <input
                  type="text"
                  id="model"
                  name="model"
                  value={formData.model || ''}
                  onChange={handleChange}
                  className={`mt-1 block w-full rounded-md ${
                    errors.model ? 'border-red-500 bg-red-50' : 'border-gray-300'
                  } shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm`}
                  required
                />
                {errors.model && (
                  <p className="mt-1 text-sm text-red-600 font-medium">{errors.model}</p>
                )}
              </div>

              {/* Year */}
              <div>
                <label htmlFor="year" className="block text-sm font-medium text-gray-700">
                  Year *
                </label>
                <input
                  type="number"
                  id="year"
                  name="year"
                  min="1900"
                  max={new Date().getFullYear() + 1}
                  value={formData.year || ''}
                  onChange={handleChange}
                  className={`mt-1 block w-full rounded-md ${
                    errors.year ? 'border-red-500 bg-red-50' : 'border-gray-300'
                  } shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm`}
                  required
                />
                {errors.year && (
                  <p className="mt-1 text-sm text-red-600 font-medium">{errors.year}</p>
                )}
              </div>

              {/* Status */}
              <div>
                <label htmlFor="status" className="block text-sm font-medium text-gray-700">
                  Status *
                </label>
                <select
                  id="status"
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  className={`mt-1 block w-full rounded-md ${
                    errors.status ? 'border-red-500 bg-red-50' : 'border-gray-300'
                  } shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm`}
                  required
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="maintenance">Maintenance</option>
                </select>
                {errors.status && (
                  <p className="mt-1 text-sm text-red-600 font-medium">{errors.status}</p>
                )}
              </div>

              {/* Capacity Weight */}
              <div>
                <label htmlFor="capacityWeight" className="block text-sm font-medium text-gray-700">
                  Capacity (kg) *
                </label>
                <input
                  type="number"
                  id="capacityWeight"
                  name="capacityWeight"
                  min="0.1"
                  step="0.01"
                  value={formData.capacityWeight || ''}
                  onChange={handleChange}
                  className={`mt-1 block w-full rounded-md ${
                    errors.capacityWeight ? 'border-red-500 bg-red-50' : 'border-gray-300'
                  } shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm`}
                  required
                />
                {errors.capacityWeight && (
                  <p className="mt-1 text-sm text-red-600 font-medium">{errors.capacityWeight}</p>
                )}
              </div>

              {/* Capacity Volume */}
              <div>
                <label htmlFor="capacityVolume" className="block text-sm font-medium text-gray-700">
                  Volume (m³) *
                </label>
                <input
                  type="number"
                  id="capacityVolume"
                  name="capacityVolume"
                  min="0"
                  step="0.01"
                  value={formData.capacityVolume || ''}
                  onChange={handleChange}
                  className={`mt-1 block w-full rounded-md ${
                    errors.capacityVolume ? 'border-red-500 bg-red-50' : 'border-gray-300'
                  } shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm`}
                  required
                />
                {errors.capacityVolume && (
                  <p className="mt-1 text-sm text-red-600 font-medium">{errors.capacityVolume}</p>
                )}
              </div>

              {/* Transport-specific fields */}
              {formData.serviceType === 'transport' && (
                <>
                  {/* Pricing Type */}
                  <div>
                    <label htmlFor="pricingType" className="block text-sm font-medium text-gray-700">
                      Pricing Type *
                    </label>
                    <select
                      id="pricingType"
                      name="pricingType"
                      value={formData.pricingType}
                      onChange={handleChange}
                      className={`mt-1 block w-full rounded-md ${
                        errors.pricingType ? 'border-red-500 bg-red-50' : 'border-gray-300'
                      } shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm`}
                      required
                    >
                      <option value="per_km">Price per km</option>
                      <option value="fixed">Fixed price</option>
                    </select>
                  </div>

                  {/* Price per km */}
                  {formData.pricingType === 'per_km' && (
                    <div>
                      <label
                        htmlFor="pricePerKm"
                        className="block text-sm font-medium text-gray-700"
                      >
                        Price per km *
                      </label>
                      <input
                        type="number"
                        id="pricePerKm"
                        name="pricePerKm"
                        min="0.01"
                        step="0.01"
                        value={formData.pricePerKm || ''}
                        onChange={handleChange}
                        className={`mt-1 block w-full rounded-md ${
                          errors.pricePerKm ? 'border-red-500 bg-red-50' : 'border-gray-300'
                        } shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm`}
                        required
                      />
                      {errors.pricePerKm && (
                        <p className="mt-1 text-sm text-red-600 font-medium">{errors.pricePerKm}</p>
                      )}
                    </div>
                  )}

                  {/* Fixed price */}
                  {formData.pricingType === 'fixed' && (
                    <div>
                      <label
                        htmlFor="fixedPrice"
                        className="block text-sm font-medium text-gray-700"
                      >
                        Fixed price *
                      </label>
                      <input
                        type="number"
                        id="fixedPrice"
                        name="fixedPrice"
                        min="0.01"
                        step="0.01"
                        value={formData.fixedPrice || ''}
                        onChange={handleChange}
                        className={`mt-1 block w-full rounded-md ${
                          errors.fixedPrice ? 'border-red-500 bg-red-50' : 'border-gray-300'
                        } shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm`}
                        required
                      />
                      {errors.fixedPrice && (
                        <p className="mt-1 text-sm text-red-600 font-medium">{errors.fixedPrice}</p>
                      )}
                    </div>
                  )}
                </>
              )}

              {/* Rental-specific fields */}
              {formData.serviceType === 'rental' && (
                <>
                  {/* Monthly Rate */}
                  <div>
                    <label htmlFor="monthlyRate" className="block text-sm font-medium text-gray-700">
                      Monthly Rate ($) *
                    </label>
                    <input
                      type="number"
                      id="monthlyRate"
                      name="monthlyRate"
                      min="0.01"
                      step="0.01"
                      value={formData.monthlyRate || ''}
                      onChange={handleChange}
                      className={`mt-1 block w-full rounded-md ${
                        errors.monthlyRate ? 'border-red-500 bg-red-50' : 'border-gray-300'
                      } shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm`}
                      required
                    />
                    {errors.monthlyRate && (
                      <p className="mt-1 text-sm text-red-600 font-medium">{errors.monthlyRate}</p>
                    )}
                  </div>

                  {/* Work Location */}
                  <div>
                    <label htmlFor="workLocation" className="block text-sm font-medium text-gray-700">
                      Work Location *
                    </label>
                    <input
                      type="text"
                      id="workLocation"
                      name="workLocation"
                      value={formData.workLocation || ''}
                      onChange={handleChange}
                      className={`mt-1 block w-full rounded-md ${
                        errors.workLocation ? 'border-red-500 bg-red-50' : 'border-gray-300'
                      } shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm`}
                      placeholder="e.g., Construction Site, Warehouse, Office"
                      required
                    />
                    {errors.workLocation && (
                      <p className="mt-1 text-sm text-red-600 font-medium">{errors.workLocation}</p>
                    )}
                  </div>
                </>
              )}

            </div>

            {/* Driver Information Section */}
            <div className="space-y-6 pt-6 border-t border-gray-200">
              <h2 className="text-lg font-medium text-gray-900">Driver Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Driver Name */}
                <div>
                  <label htmlFor="driverName" className="block text-sm font-medium text-gray-700">
                    Driver Name
                  </label>
                  <input
                    type="text"
                    id="driverName"
                    name="driverName"
                    value={formData.driverName || ''}
                    onChange={handleChange}
                    className={`mt-1 block w-full rounded-md ${
                      errors.driverName ? 'border-red-500 bg-red-50' : 'border-gray-300'
                    } shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm`}
                    placeholder="Enter driver's full name"
                  />
                  {errors.driverName && (
                    <p className="mt-1 text-sm text-red-600 font-medium">{errors.driverName}</p>
                  )}
                </div>

                {/* Driver Phone */}
                <div>
                  <label htmlFor="driverPhone" className="block text-sm font-medium text-gray-700">
                    Driver Phone
                  </label>
                  <input
                    type="tel"
                    id="driverPhone"
                    name="driverPhone"
                    value={formData.driverPhone || ''}
                    onChange={handleChange}
                    className={`mt-1 block w-full rounded-md ${
                      errors.driverPhone ? 'border-red-500 bg-red-50' : 'border-gray-300'
                    } shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm`}
                    placeholder="Enter driver's phone number"
                  />
                  {errors.driverPhone && (
                    <p className="mt-1 text-sm text-red-600 font-medium">{errors.driverPhone}</p>
                  )}
                </div>

                {/* Driver License Number */}
                <div className="md:col-span-2">
                  <label htmlFor="driverLicenseNumber" className="block text-sm font-medium text-gray-700">
                    Driver License Number
                  </label>
                  <input
                    type="text"
                    id="driverLicenseNumber"
                    name="driverLicenseNumber"
                    value={formData.driverLicenseNumber || ''}
                    onChange={handleChange}
                    className={`mt-1 block w-full rounded-md ${
                      errors.driverLicenseNumber ? 'border-red-500 bg-red-50' : 'border-gray-300'
                    } shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm`}
                    placeholder="Enter driver's license number"
                  />
                  {errors.driverLicenseNumber && (
                    <p className="mt-1 text-sm text-red-600 font-medium">{errors.driverLicenseNumber}</p>
                  )}
                </div>

              </div>
            </div>

            {/* Upload Sections */}
            <div className="space-y-6 pt-6 border-t border-gray-200">
              <h2 className="text-lg font-medium text-gray-900">Truck Images & Documents</h2>
              
              {/* Image Upload */}
              <ImageUpload 
                images={images}
                onImagesChange={setImages}
                maxImages={10}
                label="Truck Images (Required)"
                required={true}
              />
              
              {errors.images && (
                <p className="text-sm text-red-600 font-medium">{errors.images}</p>
              )}
              
              {/* Document Upload */}
              <DocumentUpload 
                inspectionDoc={inspectionDoc}
                registrationDoc={registrationDoc}
                licenseDoc={licenseDoc}
                businessLicenseDoc={businessLicenseDoc}
                additionalDocs={additionalDocs}
                onInspectionDocChange={setInspectionDoc}
                onRegistrationDocChange={setRegistrationDoc}
                onLicenseDocChange={setLicenseDoc}
                onBusinessLicenseDocChange={setBusinessLicenseDoc}
                onAdditionalDocsChange={setAdditionalDocs}
                onDeleteExistingDocument={handleDeleteDocument}
                maxAdditionalDocs={5}
              />
              
              {errors.inspectionDoc && (
                <p className="text-sm text-red-600 font-medium">{errors.inspectionDoc}</p>
              )}
            </div>

            {/* Form Actions */}
            <div className="flex flex-col sm:flex-row sm:justify-end space-y-3 sm:space-y-0 sm:space-x-3 pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={() => navigate('/trucks')}
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
                {isEditing ? 'Update Truck' : 'Add Truck'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default TruckForm;
