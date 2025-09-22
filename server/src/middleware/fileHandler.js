import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import logger from '../utils/logger.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Middleware to handle file serving with fallback for missing files
export const serveFileWithFallback = (req, res, next) => {
  const requestedPath = req.path;
  const filename = path.basename(requestedPath);
  
  // Determine file type and set appropriate headers
  const fileExtension = path.extname(filename).toLowerCase();
  let contentType = 'application/octet-stream';
  let disposition = 'attachment';
  
  if (['.jpg', '.jpeg'].includes(fileExtension)) {
    contentType = 'image/jpeg';
    disposition = 'inline';
  } else if (fileExtension === '.png') {
    contentType = 'image/png';
    disposition = 'inline';
  } else if (fileExtension === '.gif') {
    contentType = 'image/gif';
    disposition = 'inline';
  } else if (fileExtension === '.pdf') {
    contentType = 'application/pdf';
    disposition = 'inline';
  }
  
  // Try to find the file in various locations
  const possiblePaths = [
    path.join(__dirname, '../../uploads', requestedPath),
    path.join(process.cwd(), 'uploads', requestedPath),
    path.join(__dirname, '../..', requestedPath.startsWith('/') ? requestedPath.substring(1) : requestedPath)
  ];
  
  let filePath = null;
  for (const possiblePath of possiblePaths) {
    if (fs.existsSync(possiblePath)) {
      filePath = possiblePath;
      break;
    }
  }
  
  if (filePath) {
    // File exists, serve it
    res.setHeader('Content-Type', contentType);
    res.setHeader('Content-Disposition', `${disposition}; filename="${filename}"`);
    res.setHeader('Cache-Control', 'public, max-age=3600'); // Cache for 1 hour
    
    const fileStream = fs.createReadStream(filePath);
    fileStream.pipe(res);
    
    fileStream.on('error', (error) => {
      logger.error('File stream error:', error);
      if (!res.headersSent) {
        res.status(500).json({
          success: false,
          error: 'Error reading file'
        });
      }
    });
    
    logger.info(`File served: ${filename}`);
  } else {
    // File not found, return appropriate response
    logger.warn(`File not found: ${filename} (searched paths: ${possiblePaths.join(', ')})`);
    
    if (fileExtension === '.pdf') {
      // For PDFs, return a JSON error response
      res.status(404).json({
        success: false,
        error: 'Document file not found',
        message: 'This document may have been uploaded before the current deployment. Please re-upload the document.',
        filename: filename
      });
    } else if (['.jpg', '.jpeg', '.png', '.gif'].includes(fileExtension)) {
      // For images, return a placeholder image or JSON error
      res.status(404).json({
        success: false,
        error: 'Image file not found',
        message: 'This image may have been uploaded before the current deployment. Please re-upload the image.',
        filename: filename
      });
    } else {
      // For other files
      res.status(404).json({
        success: false,
        error: 'File not found',
        message: 'This file may have been uploaded before the current deployment. Please re-upload the file.',
        filename: filename
      });
    }
  }
};

// Ensure upload directories exist
export const ensureUploadDirectories = () => {
  const baseUploadDir = path.join(process.cwd(), 'uploads');
  const subDirs = ['trucks/images', 'trucks/documents', 'temp'];
  
  [baseUploadDir, ...subDirs.map(dir => path.join(baseUploadDir, dir))].forEach(dir => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
      logger.info(`Created upload directory: ${dir}`);
    }
  });
};

// Check if file exists and return file info
export const getFileInfo = (filePath) => {
  const filename = path.basename(filePath);
  
  const possiblePaths = [
    path.join(__dirname, '../../uploads', filePath.startsWith('/uploads/') ? filePath.substring(9) : filePath),
    path.join(process.cwd(), 'uploads', filePath.startsWith('/uploads/') ? filePath.substring(9) : filePath),
    path.join(process.cwd(), filePath.startsWith('/') ? filePath.substring(1) : filePath)
  ];
  
  for (const possiblePath of possiblePaths) {
    if (fs.existsSync(possiblePath)) {
      const stats = fs.statSync(possiblePath);
      return {
        exists: true,
        path: possiblePath,
        size: stats.size,
        modified: stats.mtime
      };
    }
  }
  
  return {
    exists: false,
    path: null,
    size: null,
    modified: null
  };
};
