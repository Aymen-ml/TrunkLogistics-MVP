import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { v4 as uuidv4 } from 'uuid';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ensure upload directories exist
const createUploadDirectories = () => {
  const baseUploadDir = path.join(__dirname, '../../uploads');
  const subDirs = ['trucks/images', 'trucks/documents', 'temp'];
  
  [baseUploadDir, ...subDirs.map(dir => path.join(baseUploadDir, dir))].forEach(dir => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  });
};

// Initialize upload directories
createUploadDirectories();

// Storage configuration
const createStorage = (subDir) => {
  return multer.diskStorage({
    destination: (req, file, cb) => {
      const uploadPath = path.join(__dirname, '../../uploads/trucks', subDir);
      cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
      // Generate unique filename with original extension
      const uniqueName = `${uuidv4()}${path.extname(file.originalname)}`;
      cb(null, uniqueName);
    }
  });
};

// File filter for images
const imageFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|gif|webp/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);
  
  if (mimetype && extname) {
    cb(null, true);
  } else {
    cb(new Error('Only image files (JPEG, PNG, GIF, WebP) are allowed for truck images'), false);
  }
};

// File filter for documents
const documentFilter = (req, file, cb) => {
  const allowedTypes = /pdf|doc|docx|jpg|jpeg|png/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = /application\/pdf|application\/msword|application\/vnd\.openxmlformats-officedocument\.wordprocessingml\.document|image\/(jpeg|jpg|png)/.test(file.mimetype);
  
  if (mimetype && extname) {
    cb(null, true);
  } else {
    cb(new Error('Only PDF, Word documents, or images are allowed for truck documents'), false);
  }
};

// Create upload middleware for truck images
export const uploadTruckImages = multer({
  storage: createStorage('images'),
  fileFilter: imageFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB per image
    files: 10 // Maximum 10 images
  }
}).array('images', 10);

// Create upload middleware for truck documents
export const uploadTruckDocuments = multer({
  storage: createStorage('documents'),
  fileFilter: documentFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB per document
    files: 4 // Maximum 4 documents (1 inspection + 3 additional)
  }
}).array('documents', 4);

// Combined upload middleware for both images and specific document types
export const uploadTruckFiles = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      let subDir = 'temp';
      if (file.fieldname === 'images') {
        subDir = 'images';
      } else if ([
        'inspectionDoc', 'registrationDoc', 
        'licenseDoc', 'businessLicenseDoc', 'additionalDocs',
        'permitDoc', 'maintenanceRecordDoc', 'driverCertificateDoc',
        'customsDocumentsDoc', 'safetyCertificateDoc', 'emissionCertificateDoc',
        'weightCertificateDoc', 'cargoInsuranceDoc', 'transportLicenseDoc',
        'routePermitDoc', 'hazmatPermitDoc', 'oversizePermitDoc',
        'fuelCardDoc', 'tollTransponderDoc', 'gpsCertificateDoc', 'complianceCertificateDoc'
      ].includes(file.fieldname)) {
        subDir = 'documents';
      }
      
      const uploadPath = path.join(__dirname, '../../uploads/trucks', subDir);
      cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
      const uniqueName = `${uuidv4()}${path.extname(file.originalname)}`;
      cb(null, uniqueName);
    }
  }),
  fileFilter: (req, file, cb) => {
    if (file.fieldname === 'images') {
      imageFilter(req, file, cb);
    } else if ([
      'inspectionDoc', 'registrationDoc', 
      'licenseDoc', 'businessLicenseDoc', 'additionalDocs',
      'permitDoc', 'maintenanceRecordDoc', 'driverCertificateDoc',
      'customsDocumentsDoc', 'safetyCertificateDoc', 'emissionCertificateDoc',
      'weightCertificateDoc', 'cargoInsuranceDoc', 'transportLicenseDoc',
      'routePermitDoc', 'hazmatPermitDoc', 'oversizePermitDoc',
      'fuelCardDoc', 'tollTransponderDoc', 'gpsCertificateDoc', 'complianceCertificateDoc'
    ].includes(file.fieldname)) {
      documentFilter(req, file, cb);
    } else {
      cb(new Error('Unexpected field name'), false);
    }
  },
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB per file
    files: 20 // Maximum total files (10 images + 10 documents)
  }
}).fields([
  { name: 'images', maxCount: 10 },
  { name: 'inspectionDoc', maxCount: 1 },
  { name: 'registrationDoc', maxCount: 1 },
  { name: 'licenseDoc', maxCount: 1 },
  { name: 'businessLicenseDoc', maxCount: 1 },
  { name: 'additionalDocs', maxCount: 5 },
  { name: 'permitDoc', maxCount: 3 },
  { name: 'maintenanceRecordDoc', maxCount: 3 },
  { name: 'driverCertificateDoc', maxCount: 3 },
  { name: 'customsDocumentsDoc', maxCount: 3 },
  { name: 'safetyCertificateDoc', maxCount: 1 },
  { name: 'emissionCertificateDoc', maxCount: 1 },
  { name: 'weightCertificateDoc', maxCount: 1 },
  { name: 'cargoInsuranceDoc', maxCount: 1 },
  { name: 'transportLicenseDoc', maxCount: 1 },
  { name: 'routePermitDoc', maxCount: 3 },
  { name: 'hazmatPermitDoc', maxCount: 2 },
  { name: 'oversizePermitDoc', maxCount: 2 },
  { name: 'fuelCardDoc', maxCount: 1 },
  { name: 'tollTransponderDoc', maxCount: 1 },
  { name: 'gpsCertificateDoc', maxCount: 1 },
  { name: 'complianceCertificateDoc', maxCount: 1 }
]);

// Helper function to process uploaded files with specific document types
export const processUploadedFiles = async (req) => {
  const result = {
    images: [],
    documents: []
  };
  
  if (req.files) {
    try {
      // Process images
      if (req.files.images) {
        result.images = req.files.images.map(file => ({
          filename: file.filename,
          originalName: file.originalname,
          path: `/uploads/trucks/images/${file.filename}`,
          size: file.size,
          mimetype: file.mimetype
        }));
      }
      
      // Helper function to process a specific document type
      const processDocumentType = (files, documentType) => {
        return files.map(file => ({
          filename: file.filename,
          originalName: file.originalname,
          path: `/uploads/trucks/documents/${file.filename}`,
          size: file.size,
          mimetype: file.mimetype,
          type: documentType
        }));
      };
      
      // Process each specific document type
      if (req.files.inspectionDoc) {
        result.documents.push(...processDocumentType(req.files.inspectionDoc, 'inspection'));
      }
      
      if (req.files.registrationDoc) {
        result.documents.push(...processDocumentType(req.files.registrationDoc, 'registration'));
      }
      
      
      if (req.files.licenseDoc) {
        result.documents.push(...processDocumentType(req.files.licenseDoc, 'license'));
      }
      
      if (req.files.businessLicenseDoc) {
        result.documents.push(...processDocumentType(req.files.businessLicenseDoc, 'business_license'));
      }
      
      if (req.files.additionalDocs) {
        result.documents.push(...processDocumentType(req.files.additionalDocs, 'additional'));
      }
      
      // Process new document types
      if (req.files.permitDoc) {
        result.documents.push(...processDocumentType(req.files.permitDoc, 'permit'));
      }
      
      if (req.files.maintenanceRecordDoc) {
        result.documents.push(...processDocumentType(req.files.maintenanceRecordDoc, 'maintenance_record'));
      }
      
      if (req.files.driverCertificateDoc) {
        result.documents.push(...processDocumentType(req.files.driverCertificateDoc, 'driver_certificate'));
      }
      
      if (req.files.customsDocumentsDoc) {
        result.documents.push(...processDocumentType(req.files.customsDocumentsDoc, 'customs_documents'));
      }
      
      if (req.files.safetyCertificateDoc) {
        result.documents.push(...processDocumentType(req.files.safetyCertificateDoc, 'safety_certificate'));
      }
      
      if (req.files.emissionCertificateDoc) {
        result.documents.push(...processDocumentType(req.files.emissionCertificateDoc, 'emission_certificate'));
      }
      
      if (req.files.weightCertificateDoc) {
        result.documents.push(...processDocumentType(req.files.weightCertificateDoc, 'weight_certificate'));
      }
      
      if (req.files.cargoInsuranceDoc) {
        result.documents.push(...processDocumentType(req.files.cargoInsuranceDoc, 'cargo_insurance'));
      }
      
      if (req.files.transportLicenseDoc) {
        result.documents.push(...processDocumentType(req.files.transportLicenseDoc, 'transport_license'));
      }
      
      if (req.files.routePermitDoc) {
        result.documents.push(...processDocumentType(req.files.routePermitDoc, 'route_permit'));
      }
      
      if (req.files.hazmatPermitDoc) {
        result.documents.push(...processDocumentType(req.files.hazmatPermitDoc, 'hazmat_permit'));
      }
      
      if (req.files.oversizePermitDoc) {
        result.documents.push(...processDocumentType(req.files.oversizePermitDoc, 'oversize_permit'));
      }
      
      if (req.files.fuelCardDoc) {
        result.documents.push(...processDocumentType(req.files.fuelCardDoc, 'fuel_card'));
      }
      
      if (req.files.tollTransponderDoc) {
        result.documents.push(...processDocumentType(req.files.tollTransponderDoc, 'toll_transponder'));
      }
      
      if (req.files.gpsCertificateDoc) {
        result.documents.push(...processDocumentType(req.files.gpsCertificateDoc, 'gps_certificate'));
      }
      
      if (req.files.complianceCertificateDoc) {
        result.documents.push(...processDocumentType(req.files.complianceCertificateDoc, 'compliance_certificate'));
      }
      
      return result;
    } catch (error) {
      // Clean up any uploaded files if processing fails
      cleanupFiles(req.files);
      throw new Error('Error processing uploaded files: ' + error.message);
    }
  }
  
  return result;
};

// Helper function to clean up files on error
export const cleanupFiles = (files) => {
  if (!files) return;
  
  const cleanupFile = (filePath) => {
    try {
      if (filePath && fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
        }
    } catch (error) {
      console.error(`Error cleaning up file ${filePath}:`, error);
    }
  };
  
  if (Array.isArray(files)) {
    files.forEach(file => {
      if (file.path) cleanupFile(file.path);
    });
  } else if (files.images) {
    files.images.forEach(file => {
      if (file.filename) {
        cleanupFile(path.join(__dirname, '../../uploads/trucks/images', file.filename));
      }
    });
  }
  
  if (files.documents) {
    files.documents.forEach(file => {
      if (file.filename) {
        cleanupFile(path.join(__dirname, '../../uploads/trucks/documents', file.filename));
      }
    });
  }
  
  if (files.inspectionDoc && files.inspectionDoc.filename) {
    cleanupFile(path.join(__dirname, '../../uploads/trucks/documents', files.inspectionDoc.filename));
  }
};

// Helper function to get file URL
export const getFileUrl = (req, relativePath) => {
  return `${req.protocol}://${req.get('host')}${relativePath}`;
};
