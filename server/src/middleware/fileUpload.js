import multer from 'multer';
import path from 'path';
import fs from 'fs';

// Configure storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = path.join(process.cwd(), 'uploads', 'documents');
    
    // Create directory if it doesn't exist
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    // Generate unique filename: timestamp-originalname
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

// File filter
const fileFilter = (req, file, cb) => {
  // Accept images and PDFs
  const allowedTypes = ['image/jpeg', 'image/png', 'application/pdf'];
  
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only JPEG, PNG and PDF files are allowed.'), false);
  }
};

// Create multer instance
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  }
});

// Middleware to handle multiple file uploads
export const uploadFiles = (fileFields) => {
  return (req, res, next) => {
    const uploadFields = fileFields.map(field => ({ name: field, maxCount: 1 }));
    
    const uploadMiddleware = upload.fields(uploadFields);
    
    uploadMiddleware(req, res, (err) => {
      if (err instanceof multer.MulterError) {
        // Multer error handling
        return res.status(400).json({
          success: false,
          message: err.message || 'File upload error',
          error: err.code
        });
      } else if (err) {
        // Other errors
        return res.status(400).json({
          success: false,
          message: err.message || 'File upload failed',
        });
      }
      
      // Add file paths to request body
      if (req.files) {
        req.body.documents = {};
        Object.keys(req.files).forEach(fieldName => {
          const file = req.files[fieldName][0];
          req.body.documents[fieldName] = file.path;
        });
      }
      
      next();
    });
  };
};