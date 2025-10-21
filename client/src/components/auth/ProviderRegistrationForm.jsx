import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import { useApi } from '../../hooks/useApi';
import FileUpload from '../common/FileUpload';

const ProviderRegistrationForm = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { showToast } = useToast();
  const api = useApi();

  const [formData, setFormData] = useState({
    // Business Information
    companyName: '',
    businessRegistrationNumber: '',
    taxIdentificationNumber: '',
    vatNumber: '',
    yearsInBusiness: '',
    businessDescription: '',
    serviceAreas: [],

    // Contact Information
    businessPhone: '',
    emergencyContactName: '',
    emergencyContactPhone: '',

    // Address Information
    streetAddress: '',
    city: '',
    stateProvince: '',
    postalCode: '',
  // country field removed
  });

  const [documents, setDocuments] = useState({
    businessLicense: null,
    taxDocument: null,
    ownerId: null
  });

  const [loading, setLoading] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleServiceAreasChange = (e) => {
    const areas = e.target.value.split(',').map(area => area.trim());
    setFormData(prev => ({
      ...prev,
      serviceAreas: areas
    }));
  };

  const handleFileChange = (name, file) => {
    setDocuments(prev => ({
      ...prev,
      [name]: file
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // First, upload all documents
      const uploadPromises = Object.entries(documents).map(async ([key, file]) => {
        if (!file) throw new Error(`${key} document is required`);
        
        const formData = new FormData();
        formData.append('file', file);
        const response = await api.post('/upload', formData);
        return { [key]: response.data.url };
      });

      const uploadedDocs = await Promise.all(uploadPromises);
      const documentUrls = Object.assign({}, ...uploadedDocs);

      // Then submit the provider registration
      const response = await api.post('/provider/register', {
        ...formData,
        businessLicenseDocUrl: documentUrls.businessLicense,
        taxDocumentUrl: documentUrls.taxDocument,
        ownerIdUrl: documentUrls.ownerId
      });

      showToast({
        type: 'success',
        message: 'Registration submitted successfully. Awaiting admin approval.'
      });

      navigate('/dashboard');
    } catch (error) {
      showToast({
        type: 'error',
        message: error.message || 'Failed to submit registration'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Provider Registration</h1>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Business Information */}
        <section className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Business Information</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block mb-1">Company Name *</label>
              <input
                type="text"
                name="companyName"
                value={formData.companyName}
                onChange={handleInputChange}
                required
                className="w-full p-2 border rounded"
              />
            </div>

            <div>
              <label className="block mb-1">Business Registration Number *</label>
              <input
                type="text"
                name="businessRegistrationNumber"
                value={formData.businessRegistrationNumber}
                onChange={handleInputChange}
                required
                className="w-full p-2 border rounded"
              />
            </div>

            <div>
              <label className="block mb-1">Tax Identification Number *</label>
              <input
                type="text"
                name="taxIdentificationNumber"
                value={formData.taxIdentificationNumber}
                onChange={handleInputChange}
                required
                className="w-full p-2 border rounded"
              />
            </div>

            <div>
              <label className="block mb-1">VAT Number (if applicable)</label>
              <input
                type="text"
                name="vatNumber"
                value={formData.vatNumber}
                onChange={handleInputChange}
                className="w-full p-2 border rounded"
              />
            </div>

            <div>
              <label className="block mb-1">Years in Business *</label>
              <input
                type="number"
                name="yearsInBusiness"
                value={formData.yearsInBusiness}
                onChange={handleInputChange}
                required
                min="0"
                className="w-full p-2 border rounded"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block mb-1">Business Description *</label>
              <textarea
                name="businessDescription"
                value={formData.businessDescription}
                onChange={handleInputChange}
                required
                rows="3"
                className="w-full p-2 border rounded"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block mb-1">Service Areas *</label>
              <input
                type="text"
                name="serviceAreas"
                value={formData.serviceAreas.join(', ')}
                onChange={handleServiceAreasChange}
                required
                placeholder="Enter areas separated by commas"
                className="w-full p-2 border rounded"
              />
            </div>
          </div>
        </section>

        {/* Contact Information */}
        <section className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Contact Information</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block mb-1">Business Phone *</label>
              <input
                type="tel"
                name="businessPhone"
                value={formData.businessPhone}
                onChange={handleInputChange}
                required
                className="w-full p-2 border rounded"
              />
            </div>

            <div>
              <label className="block mb-1">Emergency Contact Name *</label>
              <input
                type="text"
                name="emergencyContactName"
                value={formData.emergencyContactName}
                onChange={handleInputChange}
                required
                className="w-full p-2 border rounded"
              />
            </div>

            <div>
              <label className="block mb-1">Emergency Contact Phone *</label>
              <input
                type="tel"
                name="emergencyContactPhone"
                value={formData.emergencyContactPhone}
                onChange={handleInputChange}
                required
                className="w-full p-2 border rounded"
              />
            </div>
          </div>
        </section>

        {/* Address Information */}
        <section className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Address Information</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block mb-1">Street Address *</label>
              <input
                type="text"
                name="streetAddress"
                value={formData.streetAddress}
                onChange={handleInputChange}
                required
                className="w-full p-2 border rounded"
              />
            </div>

            <div>
              <label className="block mb-1">City *</label>
              <input
                type="text"
                name="city"
                value={formData.city}
                onChange={handleInputChange}
                required
                className="w-full p-2 border rounded"
              />
            </div>

            <div>
              <label className="block mb-1">State/Province *</label>
              <input
                type="text"
                name="stateProvince"
                value={formData.stateProvince}
                onChange={handleInputChange}
                required
                className="w-full p-2 border rounded"
              />
            </div>

            <div>
              <label className="block mb-1">Postal Code *</label>
              <input
                type="text"
                name="postalCode"
                value={formData.postalCode}
                onChange={handleInputChange}
                required
                className="w-full p-2 border rounded"
              />
            </div>

            {/* Country field removed */}
          </div>
        </section>

        {/* Document Upload */}
        <section className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Required Documents</h2>
          
          <div className="space-y-4">
            <div>
              <label className="block mb-1">Business License *</label>
              <FileUpload
                accept=".pdf,.jpg,.jpeg,.png"
                onChange={(file) => handleFileChange('businessLicense', file)}
                maxSize={5242880} // 5MB
              />
            </div>

            <div>
              <label className="block mb-1">Tax Document *</label>
              <FileUpload
                accept=".pdf"
                onChange={(file) => handleFileChange('taxDocument', file)}
                maxSize={5242880}
              />
            </div>

            <div>
              <label className="block mb-1">Owner ID *</label>
              <FileUpload
                accept=".jpg,.jpeg,.png"
                onChange={(file) => handleFileChange('ownerId', file)}
                maxSize={5242880}
              />
            </div>
          </div>
        </section>

        <div className="flex justify-end space-x-4">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="px-6 py-2 text-gray-600 dark:text-gray-400 dark:text-gray-500 border rounded hover:bg-gray-100 dark:bg-gray-700"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-blue-300"
          >
            {loading ? 'Submitting...' : 'Submit Registration'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ProviderRegistrationForm;