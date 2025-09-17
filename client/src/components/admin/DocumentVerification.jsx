import React, { useState, useEffect } from 'react';
import { apiClient } from '../../utils/apiClient';
import { 
  FileText, 
  Check, 
  X, 
  Eye, 
  Clock, 
  AlertCircle, 
  Download, 
  Search, 
  Filter, 
  Truck, 
  Building, 
  Settings,
  RefreshCw,
  FileImage,
  FileType,
  File
} from 'lucide-react';

const DocumentVerification = () => {
  const [documents, setDocuments] = useState([]);
  const [filterOptions, setFilterOptions] = useState({
    documentTypes: [],
    serviceTypes: [],
    providers: [],
    trucks: []
  });
  const [stats, setStats] = useState({
    total_documents: 0,
    pending_documents: 0,
    approved_documents: 0,
    rejected_documents: 0,
    trucks_with_documents: 0,
    providers_with_documents: 0
  });
  const [loading, setLoading] = useState(true);
  const [verifying, setVerifying] = useState({});
  const [selectedDocument, setSelectedDocument] = useState(null);
  const [showFilters, setShowFilters] = useState(false);
  
  // Filter states
  const [filters, setFilters] = useState({
    status: 'all',
    truckId: '',
    providerId: '',
    serviceType: 'all',
    documentType: 'all',
    search: ''
  });

  useEffect(() => {
    fetchDocuments();
    fetchStats();
  }, [filters]);

  const fetchDocuments = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value && value !== 'all') {
          params.append(key, value);
        }
      });
      
      console.log('Fetching documents with filters:', filters);
      const response = await apiClient.get(`/documents?${params.toString()}`);
      const data = response.data.data;
      setDocuments(data.documents || []);
      setFilterOptions(data.filterOptions || filterOptions);
    } catch (error) {
      console.error('Error fetching documents:', error);
      console.error('Error details:', error.response?.data);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await apiClient.get('/documents/stats');
      setStats(response.data.data.stats);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const handleVerification = async (documentId, status, notes = '') => {
    setVerifying(prev => ({ ...prev, [documentId]: true }));
    
    try {
      const response = await apiClient.post(`/documents/${documentId}/verify`, { status, notes });
      // Update local state
      setDocuments(prev => prev.map(doc => 
        doc.id === documentId 
          ? { 
              ...doc, 
              verification_status: status, 
              verified_at: new Date().toISOString(),
              verification_notes: notes
            }
          : doc
      ));
      
      // Refresh stats
      await fetchStats();
      
      alert(`Document ${status} successfully!`);
    } catch (error) {
      console.error('Error verifying document:', error);
      console.error('Error details:', error.response?.data);
      alert(`Error updating document status: ${error.response?.data?.error || error.message}`);
    } finally {
      setVerifying(prev => ({ ...prev, [documentId]: false }));
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const clearFilters = () => {
    setFilters({
      status: 'all',
      truckId: '',
      providerId: '',
      serviceType: 'all',
      documentType: 'all',
      search: ''
    });
  };

  const getFileIcon = (mimeType) => {
    if (mimeType?.includes('pdf')) return <FileType className="h-5 w-5 text-red-500" />;
    if (mimeType?.includes('image')) return <FileImage className="h-5 w-5 text-blue-500" />;
    return <File className="h-5 w-5 text-gray-500" />;
  };

  const getServiceTypeIcon = (serviceType) => {
    return serviceType === 'rental' ? 
      <Settings className="h-4 w-4 text-orange-500" /> : 
      <Truck className="h-4 w-4 text-blue-500" />;
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: { color: 'bg-yellow-100 text-yellow-800', icon: Clock, label: 'Pending' },
      approved: { color: 'bg-green-100 text-green-800', icon: Check, label: 'Approved' },
      rejected: { color: 'bg-red-100 text-red-800', icon: X, label: 'Rejected' }
    };

    const config = statusConfig[status] || statusConfig.pending;
    const Icon = config.icon;

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
        <Icon className="w-3 h-3 mr-1" />
        {config.label}
      </span>
    );
  };

  const getDocumentTypeLabel = (type) => {
    const typeLabels = {
      registration: 'Vehicle Registration',
      technical_inspection: 'Technical Inspection',
      insurance: 'Insurance Certificate',
      license: 'Driver License',
      business_license: 'Business License',
      additional_docs: 'Additional Documents',
      permit: 'Permit',
      maintenance_record: 'Maintenance Record',
      driver_certificate: 'Driver Certificate',
      customs_documents: 'Customs Documents',
      safety_certificate: 'Safety Certificate',
      emission_certificate: 'Emission Certificate',
      weight_certificate: 'Weight Certificate',
      cargo_insurance: 'Cargo Insurance',
      transport_license: 'Transport License',
      route_permit: 'Route Permit',
      hazmat_permit: 'Hazmat Permit',
      oversize_permit: 'Oversize Permit',
      fuel_card: 'Fuel Card',
      toll_transponder: 'Toll Transponder',
      gps_certificate: 'GPS Certificate',
      compliance_certificate: 'Compliance Certificate'
    };
    
    return typeLabels[type] || type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
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
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <FileText className="h-8 w-8 text-blue-600 mr-3" />
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Document Verification</h1>
                <p className="mt-2 text-gray-600">
                  Review and verify uploaded truck documents
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={() => fetchDocuments()}
                className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </button>
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
              >
                <Filter className="h-4 w-4 mr-2" />
                {showFilters ? 'Hide Filters' : 'Show Filters'}
              </button>
            </div>
          </div>
        </div>

        {/* Enhanced Stats */}
        <div className="grid grid-cols-2 md:grid-cols-6 gap-4 mb-8">
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-4">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <FileText className="h-6 w-6 text-gray-400" />
                </div>
                <div className="ml-3 w-0 flex-1">
                  <dl>
                    <dt className="text-xs font-medium text-gray-500 truncate">Total Documents</dt>
                    <dd className="text-lg font-medium text-gray-900">{stats.total_documents}</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-4">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <Clock className="h-6 w-6 text-yellow-400" />
                </div>
                <div className="ml-3 w-0 flex-1">
                  <dl>
                    <dt className="text-xs font-medium text-gray-500 truncate">Pending</dt>
                    <dd className="text-lg font-medium text-gray-900">{stats.pending_documents}</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-4">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <Check className="h-6 w-6 text-green-400" />
                </div>
                <div className="ml-3 w-0 flex-1">
                  <dl>
                    <dt className="text-xs font-medium text-gray-500 truncate">Approved</dt>
                    <dd className="text-lg font-medium text-gray-900">{stats.approved_documents}</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-4">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <X className="h-6 w-6 text-red-400" />
                </div>
                <div className="ml-3 w-0 flex-1">
                  <dl>
                    <dt className="text-xs font-medium text-gray-500 truncate">Rejected</dt>
                    <dd className="text-lg font-medium text-gray-900">{stats.rejected_documents}</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-4">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <Truck className="h-6 w-6 text-blue-400" />
                </div>
                <div className="ml-3 w-0 flex-1">
                  <dl>
                    <dt className="text-xs font-medium text-gray-500 truncate">Trucks</dt>
                    <dd className="text-lg font-medium text-gray-900">{stats.trucks_with_documents}</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-4">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <Building className="h-6 w-6 text-purple-400" />
                </div>
                <div className="ml-3 w-0 flex-1">
                  <dl>
                    <dt className="text-xs font-medium text-gray-500 truncate">Providers</dt>
                    <dd className="text-lg font-medium text-gray-900">{stats.providers_with_documents}</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Advanced Filters */}
        {showFilters && (
          <div className="bg-white shadow rounded-lg mb-6">
            <div className="px-4 py-3 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Advanced Filters</h3>
            </div>
            <div className="p-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {/* Search */}
                <div className="lg:col-span-3">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Search
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Search className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="text"
                      value={filters.search}
                      onChange={(e) => handleFilterChange('search', e.target.value)}
                      placeholder="Search by file name, license plate, provider..."
                      className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>

                {/* Status Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Status
                  </label>
                  <select
                    value={filters.status}
                    onChange={(e) => handleFilterChange('status', e.target.value)}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="all">All Statuses</option>
                    <option value="pending">Pending</option>
                    <option value="approved">Approved</option>
                    <option value="rejected">Rejected</option>
                  </select>
                </div>

                {/* Service Type Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Service Type
                  </label>
                  <select
                    value={filters.serviceType}
                    onChange={(e) => handleFilterChange('serviceType', e.target.value)}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="all">All Services</option>
                    <option value="transport">Transportation</option>
                    <option value="rental">Equipment Rental</option>
                  </select>
                </div>

                {/* Document Type Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Document Type
                  </label>
                  <select
                    value={filters.documentType}
                    onChange={(e) => handleFilterChange('documentType', e.target.value)}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="all">All Types</option>
                    {filterOptions.documentTypes.map(type => (
                      <option key={type} value={type}>
                        {getDocumentTypeLabel(type)}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Provider Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Provider
                  </label>
                  <select
                    value={filters.providerId}
                    onChange={(e) => handleFilterChange('providerId', e.target.value)}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">All Providers</option>
                    {filterOptions.providers.map(provider => (
                      <option key={provider.id} value={provider.id}>
                        {provider.company_name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Truck Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Truck
                  </label>
                  <select
                    value={filters.truckId}
                    onChange={(e) => handleFilterChange('truckId', e.target.value)}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">All Trucks</option>
                    {filterOptions.trucks.map(truck => (
                      <option key={truck.id} value={truck.id}>
                        {truck.license_plate} - {truck.truck_type} ({truck.company_name})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="mt-4 flex justify-end">
                <button
                  onClick={clearFilters}
                  className="px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                >
                  Clear Filters
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Documents Table */}
        <div className="bg-white shadow overflow-hidden sm:rounded-md">
          <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
            <h3 className="text-lg leading-6 font-medium text-gray-900">
              Documents ({documents.length})
            </h3>
            <p className="mt-1 max-w-2xl text-sm text-gray-500">
              Review and verify uploaded truck documents
            </p>
          </div>
          
          {documents.length === 0 ? (
            <div className="text-center py-12">
              <AlertCircle className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No documents found</h3>
              <p className="mt-1 text-sm text-gray-500">
                No documents match the current filters.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Document
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Truck & Provider
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Type & Service
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Uploaded
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {documents.map((document) => (
                    <tr key={document.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0">
                            {getFileIcon(document.mime_type)}
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {document.file_name || 'Unnamed Document'}
                            </div>
                            <div className="text-sm text-gray-500">
                              {document.file_size ? `${(document.file_size / 1024).toFixed(1)} KB` : 'Unknown size'}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {document.license_plate && (
                            <div className="flex items-center">
                              <Truck className="h-4 w-4 text-blue-500 mr-1" />
                              {document.license_plate}
                            </div>
                          )}
                          {document.truck_type && (
                            <div className="text-xs text-gray-500">
                              {document.truck_type} • {document.make} {document.model} {document.year}
                            </div>
                          )}
                        </div>
                        <div className="text-sm text-gray-500">
                          {document.provider_company && (
                            <div className="flex items-center">
                              <Building className="h-4 w-4 text-purple-500 mr-1" />
                              {document.provider_company}
                            </div>
                          )}
                          {document.provider_first_name && document.provider_last_name && (
                            <div className="text-xs text-gray-500">
                              {document.provider_first_name} {document.provider_last_name}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {getDocumentTypeLabel(document.document_type)}
                        </div>
                        <div className="text-sm text-gray-500">
                          <div className="flex items-center">
                            {getServiceTypeIcon(document.service_type)}
                            <span className="ml-1">
                              {document.service_type === 'rental' ? 'Equipment Rental' : 'Transportation'}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(document.verification_status)}
                        {document.verified_at && (
                          <div className="text-xs text-gray-500 mt-1">
                            {new Date(document.verified_at).toLocaleDateString()}
                          </div>
                        )}
                        {document.verified_by_first_name && (
                          <div className="text-xs text-gray-500">
                            by {document.verified_by_first_name} {document.verified_by_last_name}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(document.uploaded_at).toLocaleDateString()}
                        <div className="text-xs text-gray-400">
                          {new Date(document.uploaded_at).toLocaleTimeString()}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center space-x-2">
                          {/* View Document Button */}
                          <a
                            href={`/api${document.file_path}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center px-2 py-1 border border-gray-300 text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50"
                            title="View Document"
                          >
                            <Eye className="h-3 w-3 mr-1" />
                            View
                          </a>

                          {document.verification_status === 'pending' && (
                            <>
                              <button
                                onClick={() => {
                                  const notes = prompt('Add verification notes (optional):');
                                  handleVerification(document.id, 'approved', notes);
                                }}
                                disabled={verifying[document.id]}
                                className="inline-flex items-center px-2 py-1 border border-transparent text-xs font-medium rounded text-white bg-green-600 hover:bg-green-700 disabled:opacity-50"
                                title="Approve Document"
                              >
                                {verifying[document.id] ? (
                                  <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white mr-1"></div>
                                ) : (
                                  <Check className="h-3 w-3 mr-1" />
                                )}
                                Approve
                              </button>
                              <button
                                onClick={() => {
                                  const notes = prompt('Add rejection reason (optional):');
                                  handleVerification(document.id, 'rejected', notes);
                                }}
                                disabled={verifying[document.id]}
                                className="inline-flex items-center px-2 py-1 border border-transparent text-xs font-medium rounded text-white bg-red-600 hover:bg-red-700 disabled:opacity-50"
                                title="Reject Document"
                              >
                                {verifying[document.id] ? (
                                  <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white mr-1"></div>
                                ) : (
                                  <X className="h-3 w-3 mr-1" />
                                )}
                                Reject
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DocumentVerification;
