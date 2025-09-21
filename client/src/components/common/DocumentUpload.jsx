import React, { useCallback } from 'react';
import { X, Shield, Car, FileCheck, Building2, Plus, FileText } from 'lucide-react';

const DocumentUpload = ({
  // Individual document types
  inspectionDoc = null,
  registrationDoc = null,
  licenseDoc = null,
  businessLicenseDoc = null,
  additionalDocs = [],
  // Change handlers for each document type
  onInspectionDocChange,
  onRegistrationDocChange,
  onLicenseDocChange,
  onBusinessLicenseDocChange,
  onAdditionalDocsChange,
  // Deletion handler for existing documents
  onDeleteExistingDocument = null,
  maxAdditionalDocs = 5,
  maxSize = 10 * 1024 * 1024, // 10MB
  className = ''
}) => {
  // Document types configuration
  const documentTypes = [
    {
      id: 'inspection',
      name: 'Technical Inspection',
      icon: Shield,
      required: true,
      value: inspectionDoc,
      onChange: onInspectionDocChange,
      description: 'Upload mandatory truck inspection certificate'
    },
    {
      id: 'registration',
      name: 'Registration',
      icon: Car,
      required: false,
      value: registrationDoc,
      onChange: onRegistrationDocChange,
      description: 'Upload vehicle registration document'
    },
    {
      id: 'license',
      name: 'Driver License',
      icon: FileCheck,
      required: false,
      value: licenseDoc,
      onChange: onLicenseDocChange,
      description: 'Upload driver license document'
    },
    {
      id: 'businessLicense',
      name: 'Business License',
      icon: Building2,
      required: false,
      value: businessLicenseDoc,
      onChange: onBusinessLicenseDocChange,
      description: 'Upload business license document'
    }
  ];

  // Validate document
  const validateDocument = useCallback((file) => {
    const errors = [];
    
    // Check file size
    if (file.size > maxSize) {
      errors.push(`File is too large (max ${Math.round(maxSize / (1024 * 1024))}MB)`);
    }
    
    // Check file type
    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'image/jpeg',
      'image/jpg',
      'image/png'
    ];
    
    if (!allowedTypes.includes(file.type)) {
      errors.push('Only PDF, Word documents, or images are allowed');
    }
    
    return errors;
  }, [maxSize]);

  // Handle file selection
  const handleFileSelect = useCallback((e, onChange) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      const errors = validateDocument(file);
      
      if (errors.length > 0) {
        alert(errors.join('\n'));
        return;
      }

      // Create a file object with preview
      const fileWithPreview = {
        file,
        preview: URL.createObjectURL(file),
        name: file.name,
        size: file.size,
        type: file.type,
        lastModified: file.lastModified,
        isExisting: false
      };

      onChange(fileWithPreview);
    }
    // Reset the input so the same file can be selected again
    e.target.value = '';
  }, [validateDocument]);

  // Handle additional document upload
  const handleAdditionalFileSelect = useCallback((e) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      const errors = validateDocument(file);
      
      if (errors.length > 0) {
        alert(errors.join('\n'));
        return;
      }

      const currentDocs = Array.isArray(additionalDocs) ? additionalDocs : [];
      if (currentDocs.length >= maxAdditionalDocs) {
        alert(`Maximum ${maxAdditionalDocs} additional documents allowed`);
        return;
      }

      // Create a file object with preview
      const fileWithPreview = {
        file,
        preview: URL.createObjectURL(file),
        name: file.name,
        size: file.size,
        type: file.type,
        lastModified: file.lastModified,
        isExisting: false
      };

      onAdditionalDocsChange([...currentDocs, fileWithPreview]);
    }
    // Reset the input so the same file can be selected again
    e.target.value = '';
  }, [validateDocument, additionalDocs, maxAdditionalDocs, onAdditionalDocsChange]);

  // Remove document
  const removeDocument = useCallback(async (value, onChange) => {
    if (value) {
      // If it's an existing document with an ID, delete it from the backend
      if (value.isExisting && value.id && onDeleteExistingDocument) {
        try {
          const success = await onDeleteExistingDocument(value.id);
          if (success) {
            onChange(null);
          } else {
            alert('Failed to delete document. Please try again.');
            return;
          }
        } catch (error) {
          console.error('Error deleting document:', error);
          alert('An error occurred while deleting the document.');
          return;
        }
      } else {
        // For new files, just remove from UI and clean up preview
        if (!value.isExisting && value.preview) {
          URL.revokeObjectURL(value.preview);
        }
        onChange(null);
      }
    }
  }, [onDeleteExistingDocument]);

  // Remove additional document
  const removeAdditionalDocument = useCallback(async (index) => {
    const currentDocs = Array.isArray(additionalDocs) ? additionalDocs : [];
    const docToRemove = currentDocs[index];
    
    if (docToRemove) {
      // If it's an existing document with an ID, delete it from the backend
      if (docToRemove.isExisting && docToRemove.id && onDeleteExistingDocument) {
        try {
          const success = await onDeleteExistingDocument(docToRemove.id);
          if (!success) {
            alert('Failed to delete document. Please try again.');
            return;
          }
        } catch (error) {
          console.error('Error deleting additional document:', error);
          alert('An error occurred while deleting the document.');
          return;
        }
      } else {
        // For new files, clean up preview
        if (!docToRemove.isExisting && docToRemove.preview) {
          URL.revokeObjectURL(docToRemove.preview);
        }
      }
    }
    
    const newDocs = [...currentDocs];
    newDocs.splice(index, 1);
    onAdditionalDocsChange(newDocs);
  }, [additionalDocs, onAdditionalDocsChange, onDeleteExistingDocument]);

  // Get file icon
  const getFileIcon = useCallback((file) => {
    const type = file?.type || (file?.file && file.file.type);
    if (!type) return '📎';
    
    if (type.startsWith('image/')) {
      return '🖼️';
    } else if (type === 'application/pdf') {
      return '📄';
    } else if (type.includes('word')) {
      return '📝';
    }
    return '📎';
  }, []);

  // Format file size
  const formatFileSize = useCallback((bytes) => {
    if (!bytes && bytes !== 0) return '';
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }, []);

  // Single document upload component
  const DocumentUploadField = ({ docType }) => {
    const Icon = docType.icon;
    const hasFile = docType.value !== null;
    
    return (
      <div className="border rounded-lg p-4">
        <div className="flex items-center space-x-2 mb-2">
          <Icon className="h-5 w-5 text-gray-600" />
          <label className="text-sm font-medium text-gray-700">
            {docType.name}
            {docType.required && <span className="text-red-500 ml-1">*</span>}
          </label>
        </div>
        <p className="text-xs text-gray-500 mb-3">{docType.description}</p>
        
        {hasFile ? (
          <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-md">
            <div className="flex items-center space-x-3">
              <span className="text-lg">{getFileIcon(docType.value)}</span>
              <div>
                <p className="text-sm font-medium text-gray-900">{docType.value.name}</p>
                <p className="text-xs text-gray-500">{formatFileSize(docType.value.size)}</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => removeDocument(docType.value, docType.onChange)}
              className="inline-flex items-center p-1 text-red-600 hover:text-red-800"
              title="Remove document"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        ) : (
          <div className={`border-2 border-dashed rounded-md p-4 text-center ${
            docType.required ? 'border-red-300 bg-red-50' : 'border-gray-300'
          }`}>
            <label
              htmlFor={`${docType.id}-upload`}
              className="cursor-pointer text-sm text-blue-600 hover:text-blue-500"
            >
              Choose file
              <input
                id={`${docType.id}-upload`}
                name={`${docType.id}Doc`}
                type="file"
                className="sr-only"
                accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                onChange={(e) => handleFileSelect(e, docType.onChange)}
              />
            </label>
            <p className="text-xs text-gray-500 mt-1">PDF, Word, or image</p>
            {docType.required && (
              <p className="text-xs text-red-500 mt-1">Required</p>
            )}
          </div>
        )}
      </div>
    );
  };

  const normalizedAdditionalDocs = Array.isArray(additionalDocs) ? additionalDocs : [];

  return (
    <div className={`space-y-6 ${className}`}>
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Document Upload</h3>
        
        {/* Specific Document Types */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          {documentTypes.map((docType) => (
            <DocumentUploadField key={docType.id} docType={docType} />
          ))}
        </div>

        {/* Additional Documents Section */}
        <div className="border-t pt-6">
          <div className="flex items-center space-x-2 mb-4">
            <Plus className="h-5 w-5 text-gray-600" />
            <label className="text-sm font-medium text-gray-700">
              Additional Documents (Optional)
            </label>
          </div>
          <p className="text-xs text-gray-500 mb-3">
            Upload any additional documents up to {maxAdditionalDocs} files
          </p>

          {/* Additional Upload Area */}
          <div className={`border-2 border-dashed border-gray-300 rounded-md p-4 text-center mb-4 ${
            normalizedAdditionalDocs.length >= maxAdditionalDocs ? 'opacity-50 pointer-events-none' : ''
          }`}>
            <FileText className="h-8 w-8 text-gray-400 mx-auto mb-2" />
            <label
              htmlFor="additional-upload"
              className={`cursor-pointer text-sm text-blue-600 hover:text-blue-500 ${
                normalizedAdditionalDocs.length >= maxAdditionalDocs ? 'pointer-events-none' : ''
              }`}
            >
              Upload additional documents
              <input
                id="additional-upload"
                name="additionalDocs"
                type="file"
                className="sr-only"
                accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                onChange={handleAdditionalFileSelect}
                disabled={normalizedAdditionalDocs.length >= maxAdditionalDocs}
              />
            </label>
            <p className="text-xs text-gray-500 mt-1">
              {normalizedAdditionalDocs.length}/{maxAdditionalDocs} documents
            </p>
          </div>

          {/* Additional Documents List */}
          {normalizedAdditionalDocs.length > 0 && (
            <div className="space-y-2">
              {normalizedAdditionalDocs.map((doc, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
                  <div className="flex items-center space-x-3">
                    <span className="text-lg">{getFileIcon(doc)}</span>
                    <div>
                      <p className="text-sm font-medium text-gray-900">{doc.name}</p>
                      <p className="text-xs text-gray-500">{formatFileSize(doc.size)}</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeAdditionalDocument(index)}
                    className="inline-flex items-center p-1 text-red-600 hover:text-red-800"
                    title="Remove document"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DocumentUpload;
