# Document Types Enhancement

## Overview
This enhancement adds support for 22 different document types while preserving original filenames when uploaded. The system now supports comprehensive truck documentation with intelligent document type mapping.

## Key Features
- ✅ **Original Filename Preservation**: Uploads keep the original filename in the database
- ✅ **UUID-based Storage**: Files are stored with unique identifiers for security
- ✅ **Intelligent Type Mapping**: Automatic document type detection and mapping
- ✅ **22 Document Types**: Comprehensive support for various truck documents
- ✅ **Backward Compatibility**: Existing documents continue to work

## Supported Document Types

### Core Documents
1. `registration` - Vehicle registration documents
2. `technical_inspection` - Technical inspection certificates
3. `insurance` - General insurance certificates
4. `license` - Driver's licenses
5. `business_license` - Business operating licenses
6. `additional_docs` - Additional miscellaneous documents

### New Document Types
7. `permit` - General permits (overweight, special transport, etc.)
8. `maintenance_record` - Maintenance and service records
9. `driver_certificate` - Driver certifications (CDL, endorsements, etc.)
10. `customs_documents` - Customs and border crossing documents
11. `safety_certificate` - Safety inspection certificates
12. `emission_certificate` - Emission test certificates
13. `weight_certificate` - Weight and dimension certificates
14. `cargo_insurance` - Cargo insurance certificates
15. `transport_license` - Transport/carrier licenses
16. `route_permit` - Route-specific permits
17. `hazmat_permit` - Hazardous materials permits
18. `oversize_permit` - Oversize/overweight permits
19. `fuel_card` - Fuel card documentation
20. `toll_transponder` - Toll system documentation
21. `gps_certificate` - GPS/tracking system certificates
22. `compliance_certificate` - DOT compliance certificates

## API Usage

### Upload Endpoints
The truck document upload endpoints now support the following field names:

#### Basic Documents
- `registrationDoc` - Vehicle registration
- `inspectionDoc` - Technical inspection
- `insuranceDoc` - Insurance certificate
- `licenseDoc` - Driver's license
- `businessLicenseDoc` - Business license
- `additionalDocs` - Additional documents (multiple files)

#### New Document Fields
- `permitDoc` - General permits (max 3 files)
- `maintenanceRecordDoc` - Maintenance records (max 3 files)
- `driverCertificateDoc` - Driver certificates (max 3 files)
- `customsDocumentsDoc` - Customs documents (max 3 files)
- `safetyCertificateDoc` - Safety certificate (max 1 file)
- `emissionCertificateDoc` - Emission certificate (max 1 file)
- `weightCertificateDoc` - Weight certificate (max 1 file)
- `cargoInsuranceDoc` - Cargo insurance (max 1 file)
- `transportLicenseDoc` - Transport license (max 1 file)
- `routePermitDoc` - Route permits (max 3 files)
- `hazmatPermitDoc` - Hazmat permits (max 2 files)
- `oversizePermitDoc` - Oversize permits (max 2 files)
- `fuelCardDoc` - Fuel card (max 1 file)
- `tollTransponderDoc` - Toll transponder (max 1 file)
- `gpsCertificateDoc` - GPS certificate (max 1 file)
- `complianceCertificateDoc` - Compliance certificate (max 1 file)

### Frontend Example
```javascript
// Example: Upload multiple document types
const formData = new FormData();

// Add a safety certificate
formData.append('safetyCertificateDoc', safetyFile);

// Add hazmat permits
formData.append('hazmatPermitDoc', hazmatFile1);
formData.append('hazmatPermitDoc', hazmatFile2);

// Add maintenance records
formData.append('maintenanceRecordDoc', maintenanceFile1);
formData.append('maintenanceRecordDoc', maintenanceFile2);

// Upload to the API
fetch(`/api/trucks/${truckId}/documents`, {
  method: 'POST',
  body: formData,
  headers: {
    'Authorization': `Bearer ${token}`
  }
});
```

## Database Structure

### Documents Table
Each document is stored with:
- `file_name` - **Original filename** (preserved from upload)
- `file_path` - Unique UUID-based storage path
- `document_type` - One of the 22 supported types
- `entity_type` - Always 'truck' for truck documents
- `entity_id` - Truck ID reference
- `mime_type` - File MIME type
- `file_size` - File size in bytes

### File Storage
- **Physical Storage**: `/uploads/trucks/documents/{uuid}.{extension}`
- **Database Reference**: Original filename + document type
- **User Display**: Original filename is shown to users

## Intelligent Type Mapping

The system automatically maps document types using:

### Direct Mapping
```javascript
'safety_certificate' → 'safety_certificate'
'hazmat_permit' → 'hazmat_permit'
'maintenance_record' → 'maintenance_record'
```

### Partial String Matching
- Files with "insurance" → `insurance` or `cargo_insurance`
- Files with "permit" → appropriate permit type based on context
- Files with "certificate" → appropriate certificate type
- Files with "maintenance" → `maintenance_record`

### Fallback
Unknown document types default to `additional_docs`

## Migration

The database migration `005_add_more_document_types.sql` has been applied, adding support for all new document types while maintaining backward compatibility.

## Testing

Run the test script to verify functionality:
```bash
node test_document_types.js
```

## Security Notes

- Files are stored with UUID filenames to prevent direct access
- Original filenames are preserved in the database for user convenience
- File type validation ensures only allowed formats are uploaded
- Permission checks ensure users can only manage their own truck documents
