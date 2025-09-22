import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { v4 as uuidv4 } from 'uuid';
import { fileURLToPath } from 'url';
import logger from './logger.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Check if Cloudinary is configured
const isCloudinaryConfigured = () => {
  return !!(
    process.env.CLOUDINARY_CLOUD_NAME &&
    process.env.CLOUDINARY_API_KEY &&
    process.env.CLOUDINARY_API_SECRET
  );
};

// Configure Cloudinary if credentials are available
if (isCloudinaryConfigured()) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });
  logger.info('✅ Cloudinary configured successfully');
} else {
  logger.warn('⚠️ Cloudinary not configured - using local storage fallback');
}

// Ensure local upload directories exist (fallback)
const ensureLocalDirectories = () => {
  const baseUploadDir = path.join(__dirname, '../../uploads');
  const subDirs = ['trucks/images', 'trucks/documents', 'temp'];
  
  [baseUploadDir, ...subDirs.map(dir => path.join(baseUploadDir, dir))].forEach(dir => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  });
};

// Initialize local directories
ensureLocalDirectories();

// Cloudinary storage configurations
const cloudinaryImageStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'trunklogistics/trucks/images',
    allowed_formats: ['jpg', 'jpeg', 'png', 'gif', 'webp'],
    transformation: [
      { width: 1200, height: 800, crop: 'limit', quality: 'auto' },
      { fetch_format: 'auto' }
    ],
    public_id: (req, file) => {
      const timestamp = Date.now();
      const random = Math.random().toString(36).substring(2, 15);
      return `truck_image_${timestamp}_${random}`;
    },
  },
});

const cloudinaryDocumentStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'trunklogistics/trucks/documents',
    allowed_formats: ['pdf', 'doc', 'docx', 'jpg', 'jpeg', 'png'],
    resource_type: 'auto',
    public_id: (req, file) => {
      const timestamp = Date.now();
      const random = Math.random().toString(36).substring(2, 15);
      return `truck_doc_${timestamp}_${random}`;
    },
  },
});

// Local storage configurations (fallback)
const localImageStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(__dirname, '../../uploads/trucks/images');
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueName = `${uuidv4()}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  }
});

const localDocumentStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(__dirname, '../../uploads/trucks/documents');
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueName = `${uuidv4()}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  }
});

// File filters
const imageFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|gif|webp/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);
  
  if (mimetype && extname) {
    cb(null, true);
  } else {
    cb(new Error('Only image files (JPEG, PNG, GIF, WebP) are allowed'), false);
  }
};

const documentFilter = (req, file, cb) => {
  const allowedTypes = /pdf|doc|docx|jpg|jpeg|png/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = /application\/pdf|application\/msword|application\/vnd\.openxmlformats-officedocument\.wordprocessingml\.document|image\/(jpeg|jpg|png)/.test(file.mimetype);
  
  if (mimetype && extname) {
    cb(null, true);
  } else {
    cb(new Error('Only PDF, Word documents, or images are allowed'), false);
  }
};

// Smart storage selection (Cloudinary if available, local as fallback)
const getImageStorage = () => {
  return isCloudinaryConfigured() ? cloudinaryImageStorage : localImageStorage;
};

const getDocumentStorage = () => {
  return isCloudinaryConfigured() ? cloudinaryDocumentStorage : localDocumentStorage;
};

// Dynamic upload middleware for truck images
export const uploadTruckImages = (req, res, next) => {
  const upload = multer({
    storage: getImageStorage(),
    fileFilter: imageFilter,
    limits: {
      fileSize: 5 * 1024 * 1024, // 5MB per image
      files: 10 // Maximum 10 images
    }
  }).array('images', 10);
  
  const storageType = isCloudinaryConfigured() ? 'Cloudinary' : 'Local';
  logger.info(`🔧 Using ${storageType} storage for image upload`);
  
  upload(req, res, next);
};

// Dynamic upload middleware for truck documents
export const uploadTruckDocuments = (req, res, next) => {
  const upload = multer({
    storage: getDocumentStorage(),
    fileFilter: documentFilter,
    limits: {
      fileSize: 10 * 1024 * 1024, // 10MB per document
      files: 4 // Maximum 4 documents
    }
  }).array('documents', 4);
  
  const storageType = isCloudinaryConfigured() ? 'Cloudinary' : 'Local';
  logger.info(`🔧 Using ${storageType} storage for document upload`);
  
  upload(req, res, next);
};

// Get the appropriate storage for combined uploads
const getCombinedStorage = () => {
  if (isCloudinaryConfigured()) {
    return new CloudinaryStorage({
      cloudinary: cloudinary,
      params: (req, file) => {
        // Determine folder based on field name
        let folder = 'trunklogistics/trucks/temp';
        let transformation = [];
        
        if (file.fieldname === 'images') {
          folder = 'trunklogistics/trucks/images';
          transformation = [
            { width: 1200, height: 800, crop: 'limit', quality: 'auto' },
            { fetch_format: 'auto' }
          ];
        } else if ([
          'inspectionDoc', 'registrationDoc', 'licenseDoc', 
          'businessLicenseDoc', 'additionalDocs'
        ].includes(file.fieldname)) {
          folder = 'trunklogistics/trucks/documents';
        }
        
        return {
          folder: folder,
          allowed_formats: file.fieldname === 'images' 
            ? ['jpg', 'jpeg', 'png', 'gif', 'webp']
            : ['pdf', 'doc', 'docx', 'jpg', 'jpeg', 'png'],
          resource_type: 'auto',
          transformation: transformation,
          public_id: `${file.fieldname}_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`,
        };
      },
    });
  } else {
    return multer.diskStorage({
      destination: (req, file, cb) => {
        let subDir = 'temp';
        if (file.fieldname === 'images') {
          subDir = 'images';
        } else if ([
          'inspectionDoc', 'registrationDoc', 'licenseDoc', 
          'businessLicenseDoc', 'additionalDocs'
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
    });
  }
};

// Dynamic upload middleware that selects storage at request time
export const uploadTruckFiles = (req, res, next) => {
  // Create multer instance with current storage configuration
  const upload = multer({
    storage: getCombinedStorage(),
    fileFilter: (req, file, cb) => {
      if (file.fieldname === 'images') {
        imageFilter(req, file, cb);
      } else {
        documentFilter(req, file, cb);
      }
    },
    limits: {
      fileSize: 10 * 1024 * 1024, // 10MB per file
      files: 20 // Maximum total files
    }
  }).fields([
    { name: 'images', maxCount: 10 },
    { name: 'inspectionDoc', maxCount: 1 },
    { name: 'registrationDoc', maxCount: 1 },
    { name: 'licenseDoc', maxCount: 1 },
    { name: 'businessLicenseDoc', maxCount: 1 },
    { name: 'additionalDocs', maxCount: 5 }
  ]);
  
  // Log storage type being used
  const storageType = isCloudinaryConfigured() ? 'Cloudinary' : 'Local';
  logger.info(`🔧 Using ${storageType} storage for file upload`);
  
  upload(req, res, next);
};

// Process uploaded files (works with both Cloudinary and local)
export const processUploadedFiles = async (req) => {
  const result = {
    images: [],
    documents: []
  };
  
  if (req.files) {
    try {
      // Process images
      if (req.files.images) {
        result.images = req.files.images.map(file => {
          if (isCloudinaryConfigured()) {
            // Cloudinary file
            return {
              filename: file.filename || file.public_id,
              originalName: file.originalname,
              path: file.path || file.secure_url,
              cloudinaryId: file.public_id,
              size: file.bytes || file.size,
              mimetype: file.mimetype,
              url: file.secure_url || file.path,
              storage: 'cloudinary'
            };
          } else {
            // Local file
            return {
              filename: file.filename,
              originalName: file.originalname,
              path: `/uploads/trucks/images/${file.filename}`,
              size: file.size,
              mimetype: file.mimetype,
              storage: 'local'
            };
          }
        });
      }
      
      // Process documents
      const documentTypes = [
        'inspectionDoc', 'registrationDoc', 'licenseDoc', 
        'businessLicenseDoc', 'additionalDocs'
      ];
      
      documentTypes.forEach(docType => {
        if (req.files[docType]) {
          const docs = req.files[docType].map(file => {
            const baseDoc = {
              filename: file.filename || file.public_id,
              originalName: file.originalname,
              size: file.bytes || file.size,
              mimetype: file.mimetype,
              type: docType.replace('Doc', '').toLowerCase()
            };
            
            if (isCloudinaryConfigured()) {
              return {
                ...baseDoc,
                path: file.path || file.secure_url,
                cloudinaryId: file.public_id,
                url: file.secure_url || file.path,
                storage: 'cloudinary'
              };
            } else {
              return {
                ...baseDoc,
                path: `/uploads/trucks/documents/${file.filename}`,
                storage: 'local'
              };
            }
          });
          result.documents.push(...docs);
        }
      });
      
      // Log storage method used
      const storageMethod = isCloudinaryConfigured() ? 'Cloudinary' : 'Local (fallback)';
      logger.info(`Files processed using ${storageMethod} storage`, {
        images: result.images.length,
        documents: result.documents.length
      });
      
      return result;
    } catch (error) {
      logger.error('Error processing uploaded files:', error);
      throw new Error('Error processing uploaded files: ' + error.message);
    }
  }
  
  return result;
};

// Helper function to delete files (works with both storage types)
export const deleteUploadedFile = async (fileInfo) => {
  try {
    if (fileInfo.storage === 'cloudinary' && fileInfo.cloudinaryId) {
      // Delete from Cloudinary
      const result = await cloudinary.uploader.destroy(fileInfo.cloudinaryId);
      logger.info(`File deleted from Cloudinary: ${fileInfo.cloudinaryId}`, result);
      return result;
    } else if (fileInfo.storage === 'local' && fileInfo.path) {
      // Delete from local storage
      const localPath = path.join(__dirname, '../..', fileInfo.path);
      if (fs.existsSync(localPath)) {
        fs.unlinkSync(localPath);
        logger.info(`File deleted from local storage: ${localPath}`);
        return { result: 'ok' };
      }
    }
  } catch (error) {
    logger.error('Error deleting file:', error);
    throw error;
  }
};

// Helper function to get optimized image URL (Cloudinary only)
export const getOptimizedImageUrl = (fileInfo, options = {}) => {
  if (fileInfo.storage === 'cloudinary' && fileInfo.cloudinaryId) {
    const defaultOptions = {
      width: 800,
      height: 600,
      crop: 'fill',
      quality: 'auto',
      fetch_format: 'auto'
    };
    
    return cloudinary.url(fileInfo.cloudinaryId, { ...defaultOptions, ...options });
  }
  
  // Return original URL for local files
  return fileInfo.url || fileInfo.path;
};

// Export configuration status
export const getStorageInfo = () => {
  return {
    cloudinaryConfigured: isCloudinaryConfigured(),
    storageType: isCloudinaryConfigured() ? 'cloudinary' : 'local',
    cloudName: process.env.CLOUDINARY_CLOUD_NAME || 'not-configured'
  };
};

export { cloudinary };
