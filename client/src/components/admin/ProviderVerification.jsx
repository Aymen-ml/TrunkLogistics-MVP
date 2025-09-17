import React, { useState, useEffect } from 'react';
import { apiClient } from '../../utils/apiClient';
import { Building, Check, X, Clock, AlertCircle, Eye, User, Mail, Phone, Calendar, MapPin, FileText } from 'lucide-react';

const ProviderVerification = () => {
  const [providers, setProviders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [verifying, setVerifying] = useState({});
  const [selectedProvider, setSelectedProvider] = useState(null);
  const [providerDetails, setProviderDetails] = useState(null);
  const [detailsLoading, setDetailsLoading] = useState(false);

  useEffect(() => {
    fetchProviders();
  }, []);

  const fetchProviders = async () => {
    try {
      const response = await apiClient.get('/users?role=provider');
      const allProviders = response.data.data?.users || response.data.users || [];
      // Filter to show unverified providers first, then all providers
      const unverified = allProviders.filter(p => !p.is_verified);
      const verified = allProviders.filter(p => p.is_verified);
      
      setProviders([...unverified, ...verified]);
    } catch (error) {
      console.error('Error fetching providers:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchProviderDetails = async (providerId) => {
    setDetailsLoading(true);
    try {
      // Try to get detailed provider profile
      const response = await apiClient.get(`/users/providers/${providerId}/profile`);
      setProviderDetails(response.data.data);
    } catch (error) {
      console.error('Error fetching provider details:', error);
      
      // Fallback: try the general profile endpoint
      try {
        const fallbackResponse = await apiClient.get(`/users/${providerId}/profile`);
        setProviderDetails(fallbackResponse.data.data);
      } catch (fallbackError) {
        console.error('Fallback also failed:', fallbackError);
        // Final fallback to basic info
        const provider = providers.find(p => p.id === providerId);
        setProviderDetails({ user: provider, profile: null });
      }
    } finally {
      setDetailsLoading(false);
    }
  };

  const handleViewDetails = async (provider) => {
    setSelectedProvider(provider);
    await fetchProviderDetails(provider.id);
  };

  const handleVerification = async (providerId, status) => {
    setVerifying(prev => ({ ...prev, [providerId]: true }));
    
    try {
      await apiClient.put(`/users/providers/${providerId}/verify`, {
        verification_status: status
      });
      
      // Refresh the providers list
      await fetchProviders();
      
      // Close details modal if open
      if (selectedProvider?.id === providerId) {
        setSelectedProvider(null);
        setProviderDetails(null);
      }
      
      alert(`Provider ${status} successfully!`);
    } catch (error) {
      console.error('Error verifying provider:', error);
      alert('Error updating provider status');
    } finally {
      setVerifying(prev => ({ ...prev, [providerId]: false }));
    }
  };

  const getStatusBadge = (provider) => {
    if (provider.is_verified) {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
          <Check className="w-3 h-3 mr-1" />
          Verified
        </span>
      );
    }
    
    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
        <Clock className="w-3 h-3 mr-1" />
        Pending
      </span>
    );
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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center">
            <Building className="h-8 w-8 text-blue-600 mr-3" />
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Provider Verification</h1>
              <p className="mt-2 text-gray-600">
                Review and verify provider applications
              </p>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <Clock className="h-8 w-8 text-yellow-400" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Pending Verification
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {providers.filter(p => !p.is_verified).length}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <Check className="h-8 w-8 text-green-400" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Verified Providers
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {providers.filter(p => p.is_verified).length}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <Building className="h-8 w-8 text-blue-400" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Total Providers
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {providers.length}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Providers Table */}
        <div className="bg-white shadow overflow-hidden sm:rounded-md">
          <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
            <h3 className="text-lg leading-6 font-medium text-gray-900">
              Provider Applications
            </h3>
            <p className="mt-1 max-w-2xl text-sm text-gray-500">
              Review provider details and approve or reject applications
            </p>
          </div>
          
          {providers.length === 0 ? (
            <div className="text-center py-12">
              <AlertCircle className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No providers found</h3>
              <p className="mt-1 text-sm text-gray-500">
                No provider applications to review at this time.
              </p>
            </div>
          ) : (
            <ul className="divide-y divide-gray-200">
              {providers.map((provider) => (
                <li key={provider.id} className="px-4 py-6 sm:px-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <Building className="h-10 w-10 text-gray-400" />
                      </div>
                      <div className="ml-4">
                        <div className="flex items-center">
                          <p className="text-sm font-medium text-gray-900">
                            {provider.first_name} {provider.last_name}
                          </p>
                          <div className="ml-2">
                            {getStatusBadge(provider)}
                          </div>
                        </div>
                        <p className="text-sm text-gray-500">{provider.email}</p>
                        <p className="text-sm text-gray-500">
                          Registered: {new Date(provider.created_at).toLocaleDateString()}
                        </p>
                        {provider.phone && (
                          <p className="text-sm text-gray-500">Phone: {provider.phone}</p>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleViewDetails(provider)}
                        className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        View Details
                      </button>
                      
                      {!provider.is_verified ? (
                        <>
                          <button
                            onClick={() => handleVerification(provider.id, 'approved')}
                            disabled={verifying[provider.id]}
                            className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
                          >
                            {verifying[provider.id] ? (
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                            ) : (
                              <Check className="h-4 w-4 mr-2" />
                            )}
                            Approve
                          </button>
                          <button
                            onClick={() => handleVerification(provider.id, 'rejected')}
                            disabled={verifying[provider.id]}
                            className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50"
                          >
                            {verifying[provider.id] ? (
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                            ) : (
                              <X className="h-4 w-4 mr-2" />
                            )}
                            Reject
                          </button>
                        </>
                      ) : (
                        <span className="text-sm text-gray-500">
                          {provider.updated_at ? `Verified on ${new Date(provider.updated_at).toLocaleDateString()}` : 'Verified'}
                        </span>
                      )}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* Provider Details Modal */}
      {selectedProvider && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 max-w-4xl shadow-lg rounded-md bg-white">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900">
                Provider Details - {selectedProvider.first_name} {selectedProvider.last_name}
              </h3>
              <button
                onClick={() => {
                  setSelectedProvider(null);
                  setProviderDetails(null);
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            {detailsLoading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Basic Information */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="text-md font-medium text-gray-900 mb-3 flex items-center">
                    <User className="h-5 w-5 mr-2" />
                    Basic Information
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm font-medium text-gray-500">Name</p>
                      <p className="text-sm text-gray-900">{selectedProvider.first_name} {selectedProvider.last_name}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">Email</p>
                      <p className="text-sm text-gray-900 flex items-center">
                        <Mail className="h-4 w-4 mr-1" />
                        {selectedProvider.email}
                      </p>
                    </div>
                    {selectedProvider.phone && (
                      <div>
                        <p className="text-sm font-medium text-gray-500">Phone</p>
                        <p className="text-sm text-gray-900 flex items-center">
                          <Phone className="h-4 w-4 mr-1" />
                          {selectedProvider.phone}
                        </p>
                      </div>
                    )}
                    <div>
                      <p className="text-sm font-medium text-gray-500">Registration Date</p>
                      <p className="text-sm text-gray-900 flex items-center">
                        <Calendar className="h-4 w-4 mr-1" />
                        {new Date(selectedProvider.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">Email Verified</p>
                      <p className="text-sm text-gray-900">
                        {selectedProvider.email_verified ? (
                          <span className="text-green-600">✓ Verified</span>
                        ) : (
                          <span className="text-red-600">✗ Not Verified</span>
                        )}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">Account Status</p>
                      <p className="text-sm text-gray-900">
                        {selectedProvider.is_active ? (
                          <span className="text-green-600">Active</span>
                        ) : (
                          <span className="text-red-600">Inactive</span>
                        )}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Provider Profile Information */}
                {providerDetails?.profile && (
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h4 className="text-md font-medium text-gray-900 mb-3 flex items-center">
                      <Building className="h-5 w-5 mr-2" />
                      Company Information
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {providerDetails.profile.company_name && (
                        <div className="md:col-span-2">
                          <p className="text-sm font-medium text-gray-500">Company Name</p>
                          <p className="text-lg font-semibold text-gray-900">{providerDetails.profile.company_name}</p>
                        </div>
                      )}
                      {providerDetails.profile.business_license && (
                        <div>
                          <p className="text-sm font-medium text-gray-500">Business License</p>
                          <p className="text-sm text-gray-900">{providerDetails.profile.business_license}</p>
                        </div>
                      )}
                      {providerDetails.profile.business_type && (
                        <div>
                          <p className="text-sm font-medium text-gray-500">Business Type</p>
                          <p className="text-sm text-gray-900">{providerDetails.profile.business_type}</p>
                        </div>
                      )}
                      {providerDetails.profile.industry_sector && (
                        <div>
                          <p className="text-sm font-medium text-gray-500">Industry Sector</p>
                          <p className="text-sm text-gray-900">{providerDetails.profile.industry_sector}</p>
                        </div>
                      )}
                      {providerDetails.profile.business_phone && (
                        <div>
                          <p className="text-sm font-medium text-gray-500">Business Phone</p>
                          <p className="text-sm text-gray-900 flex items-center">
                            <Phone className="h-4 w-4 mr-1" />
                            {providerDetails.profile.business_phone}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Company Address Information */}
                {providerDetails?.profile && (
                  <div className="bg-green-50 p-4 rounded-lg">
                    <h4 className="text-md font-medium text-gray-900 mb-3 flex items-center">
                      <MapPin className="h-5 w-5 mr-2" />
                      Company Address
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {providerDetails.profile.street_address && (
                        <div className="md:col-span-2">
                          <p className="text-sm font-medium text-gray-500">Street Address</p>
                          <p className="text-sm text-gray-900">{providerDetails.profile.street_address}</p>
                        </div>
                      )}
                      {providerDetails.profile.city && (
                        <div>
                          <p className="text-sm font-medium text-gray-500">City</p>
                          <p className="text-sm text-gray-900">{providerDetails.profile.city}</p>
                        </div>
                      )}
                      {providerDetails.profile.state_province && (
                        <div>
                          <p className="text-sm font-medium text-gray-500">State/Province</p>
                          <p className="text-sm text-gray-900">{providerDetails.profile.state_province}</p>
                        </div>
                      )}
                      {providerDetails.profile.postal_code && (
                        <div>
                          <p className="text-sm font-medium text-gray-500">Postal Code</p>
                          <p className="text-sm text-gray-900 font-mono">{providerDetails.profile.postal_code}</p>
                        </div>
                      )}
                      {(providerDetails.profile.street_address || providerDetails.profile.city || providerDetails.profile.state_province || providerDetails.profile.postal_code) && (
                        <div className="md:col-span-2">
                          <p className="text-sm font-medium text-gray-500">Complete Address</p>
                          <p className="text-sm text-gray-900 bg-white p-2 rounded border">
                            {[
                              providerDetails.profile.street_address,
                              providerDetails.profile.city,
                              providerDetails.profile.state_province,
                              providerDetails.profile.postal_code
                            ].filter(Boolean).join(', ')}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Contact Person Information */}
                {providerDetails?.profile && (providerDetails.profile.contact_person_name || providerDetails.profile.contact_person_email || providerDetails.profile.contact_person_phone) && (
                  <div className="bg-purple-50 p-4 rounded-lg">
                    <h4 className="text-md font-medium text-gray-900 mb-3 flex items-center">
                      <User className="h-5 w-5 mr-2" />
                      Contact Person
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {providerDetails.profile.contact_person_name && (
                        <div>
                          <p className="text-sm font-medium text-gray-500">Name</p>
                          <p className="text-sm text-gray-900">{providerDetails.profile.contact_person_name}</p>
                          {providerDetails.profile.contact_person_position && (
                            <p className="text-xs text-gray-500">{providerDetails.profile.contact_person_position}</p>
                          )}
                        </div>
                      )}
                      {providerDetails.profile.contact_person_email && (
                        <div>
                          <p className="text-sm font-medium text-gray-500">Email</p>
                          <p className="text-sm text-gray-900 flex items-center">
                            <Mail className="h-4 w-4 mr-1" />
                            {providerDetails.profile.contact_person_email}
                          </p>
                        </div>
                      )}
                      {providerDetails.profile.contact_person_phone && (
                        <div>
                          <p className="text-sm font-medium text-gray-500">Phone</p>
                          <p className="text-sm text-gray-900 flex items-center">
                            <Phone className="h-4 w-4 mr-1" />
                            {providerDetails.profile.contact_person_phone}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Verification Status */}
                <div className="bg-yellow-50 p-4 rounded-lg">
                  <h4 className="text-md font-medium text-gray-900 mb-3 flex items-center">
                    <AlertCircle className="h-5 w-5 mr-2" />
                    Verification Status
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm font-medium text-gray-500">Admin Verification</p>
                      <div className="mt-1">
                        {getStatusBadge(selectedProvider)}
                      </div>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">Last Updated</p>
                      <p className="text-sm text-gray-900">
                        {new Date(selectedProvider.updated_at).toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                {!selectedProvider.is_verified && (
                  <div className="flex justify-end space-x-3 pt-4 border-t">
                    <button
                      onClick={() => handleVerification(selectedProvider.id, 'rejected')}
                      disabled={verifying[selectedProvider.id]}
                      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50"
                    >
                      {verifying[selectedProvider.id] ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      ) : (
                        <X className="h-4 w-4 mr-2" />
                      )}
                      Reject Provider
                    </button>
                    <button
                      onClick={() => handleVerification(selectedProvider.id, 'approved')}
                      disabled={verifying[selectedProvider.id]}
                      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
                    >
                      {verifying[selectedProvider.id] ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      ) : (
                        <Check className="h-4 w-4 mr-2" />
                      )}
                      Approve Provider
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ProviderVerification;
