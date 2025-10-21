import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import multer from 'multer';
import dotenv from 'dotenv';

dotenv.config();

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Storage configuration for truck images
const imageStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'trucklogistics/trucks/images',
    allowed_formats: ['jpg', 'jpeg', 'png', 'gif', 'webp'],
    transformation: [
      { width: 1200, height: 800, crop: 'limit', quality: 'auto' },
      { fetch_format: 'auto' }
    ],
    public_id: (req, file) => {
      // Generate unique filename
      const timestamp = Date.now();
      const random = Math.random().toString(36).substring(2, 15);
      return `truck_image_${timestamp}_${random}`;
    },
  },
});

// Storage configuration for documents
const documentStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'trucklogistics/trucks/documents',
    allowed_formats: ['pdf', 'doc', 'docx', 'jpg', 'jpeg', 'png'],
    resource_type: 'auto', // Handles both images and raw files
    public_id: (req, file) => {
      const timestamp = Date.now();
      const random = Math.random().toString(36).substring(2, 15);
      return `truck_doc_${timestamp}_${random}`;
    },
  },
});

// File filter for images
const imageFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|gif|webp/;
  const extname = allowedTypes.test(file.originalname.toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);
  
  if (mimetype && extname) {
    cb(null, true);
  } else {
    cb(new Error('Only image files (JPEG, PNG, GIF, WebP) are allowed'), false);
  }
};

// File filter for documents
const documentFilter = (req, file, cb) => {
  const allowedTypes = /pdf|doc|docx|jpg|jpeg|png/;
  const extname = allowedTypes.test(file.originalname.toLowerCase());
  const mimetype = /application\/pdf|application\/msword|application\/vnd\.openxmlformats-officedocument\.wordprocessingml\.document|image\/(jpeg|jpg|png)/.test(file.mimetype);
  
  if (mimetype && extname) {
    cb(null, true);
  } else {
    cb(new Error('Only PDF, Word documents, or images are allowed'), false);
  }
};

// Upload middleware for truck images
export const uploadTruckImagesCloud = multer({
  storage: imageStorage,
  fileFilter: imageFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB per image
    files: 10 // Maximum 10 images
  }
}).array('images', 10);

// Upload middleware for truck documents
export const uploadTruckDocumentsCloud = multer({
  storage: documentStorage,
  fileFilter: documentFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB per document
    files: 4 // Maximum 4 documents
  }
}).array('documents', 4);

// Combined upload middleware for both images and documents
export const uploadTruckFilesCloud = multer({
  storage: new CloudinaryStorage({
    cloudinary: cloudinary,
    params: (req, file) => {
      // Determine folder based on field name
      let folder = 'trucklogistics/trucks/temp';
      let transformation = [];
      
      if (file.fieldname === 'images') {
        folder = 'trucklogistics/trucks/images';
        transformation = [
          { width: 1200, height: 800, crop: 'limit', quality: 'auto' },
          { fetch_format: 'auto' }
        ];
      } else if ([
        'inspectionDoc', 'registrationDoc', 'licenseDoc', 
        'businessLicenseDoc', 'additionalDocs'
      ].includes(file.fieldname)) {
        folder = 'trucklogistics/trucks/documents';
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
  }),
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

// Helper function to process uploaded files from Cloudinary
export const processCloudinaryFiles = async (req) => {
  const result = {
    images: [],
    documents: []
  };
  
  if (req.files) {
    // Process images
    if (req.files.images) {
      result.images = req.files.images.map(file => ({
        filename: file.filename,
        originalName: file.originalname,
        path: file.path, // Cloudinary URL
        cloudinaryId: file.public_id,
        size: file.bytes,
        mimetype: file.mimetype,
        url: file.secure_url // HTTPS URL
      }));
    }
    
    // Process documents
    const documentTypes = [
      'inspectionDoc', 'registrationDoc', 'licenseDoc', 
      'businessLicenseDoc', 'additionalDocs'
    ];
    
    documentTypes.forEach(docType => {
      if (req.files[docType]) {
        const docs = req.files[docType].map(file => ({
          filename: file.filename,
          originalName: file.originalname,
          path: file.path, // Cloudinary URL
          cloudinaryId: file.public_id,
          size: file.bytes,
          mimetype: file.mimetype,
          url: file.secure_url,
          type: docType.replace('Doc', '').toLowerCase()
        }));
        result.documents.push(...docs);
      }
    });
  }
  
  return result;
};

// Helper function to delete files from Cloudinary
export const deleteCloudinaryFile = async (publicId) => {
  try {
    const result = await cloudinary.uploader.destroy(publicId);
    return result;
  } catch (error) {
    console.error('Error deleting file from Cloudinary:', error);
    throw error;
  }
};

// Helper function to get optimized image URL
export const getOptimizedImageUrl = (publicId, options = {}) => {
  const defaultOptions = {
    width: 800,
    height: 600,
    crop: 'fill',
    quality: 'auto',
    fetch_format: 'auto'
  };
  
  return cloudinary.url(publicId, { ...defaultOptions, ...options });
};

export { cloudinary };
