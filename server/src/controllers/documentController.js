import { query } from '../config/database.js';
import logger from '../utils/logger.js';
import notificationService from '../services/notificationService.js';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Get all documents for admin review with advanced filtering
export const getAllDocuments = async (req, res) => {
  try {
    // Only admins can view all documents
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: 'Access denied'
      });
    }

    const {
      status = 'all',
      truckId,
      providerId,
      serviceType = 'all',
      documentType = 'all',
      search = ''
    } = req.query;

    // Build WHERE conditions
    let whereConditions = ["d.entity_type = 'truck'"];
    let values = [];
    let paramCount = 1;

    // Filter by verification status
    if (status !== 'all') {
      whereConditions.push(`d.verification_status = $${paramCount}`);
      values.push(status);
      paramCount++;
    }

    // Filter by specific truck
    if (truckId) {
      whereConditions.push(`d.entity_id = $${paramCount}`);
      values.push(truckId);
      paramCount++;
    }

    // Filter by provider
    if (providerId) {
      whereConditions.push(`t.provider_id = $${paramCount}`);
      values.push(providerId);
      paramCount++;
    }

    // Filter by service type (transport/rental)
    if (serviceType !== 'all') {
      whereConditions.push(`t.service_type = $${paramCount}`);
      values.push(serviceType);
      paramCount++;
    }

    // Filter by document type
    if (documentType !== 'all') {
      whereConditions.push(`d.document_type = $${paramCount}`);
      values.push(documentType);
      paramCount++;
    }

    // Search filter
    if (search) {
      whereConditions.push(`(
        d.file_name ILIKE $${paramCount} OR
        t.license_plate ILIKE $${paramCount} OR
        pp.company_name ILIKE $${paramCount} OR
        u.first_name ILIKE $${paramCount} OR
        u.last_name ILIKE $${paramCount}
      )`);
      values.push(`%${search}%`);
      paramCount++;
    }

    const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';

    const result = await query(`
      SELECT 
        d.*,
        t.license_plate,
        t.truck_type,
        t.service_type,
        t.make,
        t.model,
        t.year,
        pp.company_name as provider_company,
        pp.id as provider_id,
        u.first_name as provider_first_name,
        u.last_name as provider_last_name,
        u.email as provider_email,
        u.phone as provider_phone,
        verifier.first_name as verified_by_first_name,
        verifier.last_name as verified_by_last_name
      FROM documents d
      LEFT JOIN trucks t ON d.entity_id = t.id AND d.entity_type = 'truck'
      LEFT JOIN provider_profiles pp ON t.provider_id = pp.id
      LEFT JOIN users u ON pp.user_id = u.id
      LEFT JOIN users verifier ON d.verified_by = verifier.id
      ${whereClause}
      ORDER BY d.uploaded_at DESC
    `, values);

    // Get filter options for the UI
    const filterOptions = await getFilterOptions();

    res.json({
      success: true,
      data: { 
        documents: result.rows,
        filterOptions
      }
    });

  } catch (error) {
    logger.error('Error fetching documents:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch documents'
    });
  }
};

// Get filter options for the document verification interface
const getFilterOptions = async () => {
  try {
    // Get unique document types
    const docTypesResult = await query(`
      SELECT DISTINCT document_type 
      FROM documents 
      WHERE entity_type = 'truck' 
      ORDER BY document_type
    `);

    // Get unique service types
    const serviceTypesResult = await query(`
      SELECT DISTINCT t.service_type 
      FROM trucks t
      JOIN documents d ON d.entity_id = t.id AND d.entity_type = 'truck'
      ORDER BY t.service_type
    `);

    // Get providers with documents
    const providersResult = await query(`
      SELECT DISTINCT 
        pp.id,
        pp.company_name,
        u.first_name,
        u.last_name
      FROM provider_profiles pp
      JOIN users u ON pp.user_id = u.id
      JOIN trucks t ON t.provider_id = pp.id
      JOIN documents d ON d.entity_id = t.id AND d.entity_type = 'truck'
      ORDER BY pp.company_name
    `);

    // Get trucks with documents
    const trucksResult = await query(`
      SELECT DISTINCT 
        t.id,
        t.license_plate,
        t.truck_type,
        t.service_type,
        pp.company_name
      FROM trucks t
      JOIN provider_profiles pp ON t.provider_id = pp.id
      JOIN documents d ON d.entity_id = t.id AND d.entity_type = 'truck'
      ORDER BY t.license_plate
    `);

    const existingTypes = docTypesResult.rows.map(row => row.document_type);
    const allSupportedTypes = [
      'registration',
      'technical_inspection',
      'insurance',
      'license',
      'business_license',
      'additional_docs',
      'permit',
      'maintenance_record',
      'driver_certificate',
      'customs_documents',
      'safety_certificate',
      'emission_certificate',
      'weight_certificate',
      'cargo_insurance',
      'transport_license',
      'route_permit',
      'hazmat_permit',
      'oversize_permit',
      'fuel_card',
      'toll_transponder',
      'gps_certificate',
      'compliance_certificate'
    ];
    const documentTypes = Array.from(new Set([...allSupportedTypes, ...existingTypes]));

    return {
      documentTypes,
      serviceTypes: serviceTypesResult.rows.map(row => row.service_type),
      providers: providersResult.rows,
      trucks: trucksResult.rows
    };
  } catch (error) {
    logger.error('Error fetching filter options:', error);
    return {
      documentTypes: [],
      serviceTypes: [],
      providers: [],
      trucks: []
    };
  }
};

// Get document verification statistics
export const getDocumentStats = async (req, res) => {
  try {
    // Only admins can view document stats
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: 'Access denied'
      });
    }

    const result = await query(`
      SELECT 
        COUNT(*) as total_documents,
        COUNT(CASE WHEN verification_status = 'pending' THEN 1 END) as pending_documents,
        COUNT(CASE WHEN verification_status = 'approved' THEN 1 END) as approved_documents,
        COUNT(CASE WHEN verification_status = 'rejected' THEN 1 END) as rejected_documents,
        COUNT(DISTINCT entity_id) as trucks_with_documents,
        COUNT(DISTINCT t.provider_id) as providers_with_documents
      FROM documents d
      LEFT JOIN trucks t ON d.entity_id = t.id AND d.entity_type = 'truck'
      WHERE d.entity_type = 'truck'
    `);

    const stats = result.rows[0];

    res.json({
      success: true,
      data: { stats }
    });

  } catch (error) {
    logger.error('Error fetching document stats:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch document statistics'
    });
  }
};

// Verify a document
export const verifyDocument = async (req, res) => {
  try {
    // Only admins can verify documents
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: 'Access denied'
      });
    }

    const { id } = req.params;
    const { status, notes } = req.body;

    if (!['approved', 'rejected'].includes(status)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid verification status'
      });
    }

    // Get document details before updating
    const docResult = await query(`
      SELECT d.*, t.license_plate, pp.company_name
      FROM documents d
      LEFT JOIN trucks t ON d.entity_id = t.id AND d.entity_type = 'truck'
      LEFT JOIN provider_profiles pp ON t.provider_id = pp.id
      WHERE d.id = $1
    `, [id]);

    if (docResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Document not found'
      });
    }

    const document = docResult.rows[0];

    // Update document verification status
    const result = await query(`
      UPDATE documents 
      SET 
        verification_status = $1,
        verified_by = $2,
        verified_at = CURRENT_TIMESTAMP,
        verification_notes = $4
      WHERE id = $3
      RETURNING *
    `, [status, req.user.id, id, notes || null]);

    logger.info(`Document ${status}: ${id} by admin ${req.user.email}`, {
      documentId: id,
      fileName: document.file_name,
      truckLicensePlate: document.license_plate,
      providerCompany: document.provider_company,
      status,
      notes
    });

    // Send notification to provider about document verification
    try {
      // Get provider user ID from the document
      const providerQuery = await query(`
        SELECT u.id as user_id, u.first_name, u.last_name, u.email
        FROM users u
        JOIN provider_profiles pp ON u.id = pp.user_id
        JOIN trucks t ON pp.id = t.provider_id
        WHERE t.id = $1
      `, [document.entity_id]);

      if (providerQuery.rows.length > 0) {
        const provider = providerQuery.rows[0];
        const updatedDocument = result.rows[0];
        
        // Send notification to provider
        await notificationService.notifyDocumentVerified(
          provider.user_id, 
          updatedDocument, 
          status, 
          notes
        );
        
        logger.info(`✅ Document verification notification sent to provider ${provider.email}`);
      } else {
        logger.warn('❌ Could not find provider for document notification');
      }
    } catch (notificationError) {
      logger.error('❌ Failed to send document verification notification:', notificationError);
      // Don't fail the verification if notification fails
    }

    res.json({
      success: true,
      message: `Document ${status} successfully`,
      data: { document: result.rows[0] }
    });

  } catch (error) {
    logger.error('Error verifying document:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to verify document'
    });
  }
};

// Download/view a document file
export const downloadDocument = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Get document details
    const docResult = await query(`
      SELECT d.*, t.license_plate, pp.company_name, u.id as owner_user_id
      FROM documents d
      LEFT JOIN trucks t ON d.entity_id = t.id AND d.entity_type = 'truck'
      LEFT JOIN provider_profiles pp ON t.provider_id = pp.id
      LEFT JOIN users u ON pp.user_id = u.id
      WHERE d.id = $1
    `, [id]);

    if (docResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Document not found'
      });
    }

    const document = docResult.rows[0];
    
    // Check permissions - admins can view all documents
    const canView = req.user.role === 'admin' || 
                   req.user.id === document.owner_user_id;
    
    if (!canView) {
      return res.status(403).json({
        success: false,
        error: 'Access denied - you can only view your own documents'
      });
    }

    // Resolve file path based on server structure
    const filename = path.basename(document.file_path);
    
    // Primary path: current working directory + uploads structure
    const primaryPath = path.resolve(process.cwd(), 'uploads', 'trucks', 'documents', filename);
    
    // Alternative paths to check
    const pathsToTry = [
      primaryPath,
      path.resolve(__dirname, '../../uploads/trucks/documents', filename),
      path.resolve(process.cwd(), document.file_path.startsWith('/') ? document.file_path.substring(1) : document.file_path)
    ];
    
    let filePath = null;
    
    logger.info(`Looking for document file: ${filename}`);
    logger.info(`Database path: ${document.file_path}`);
    
    // Try each path until we find the file
    for (const pathToTry of pathsToTry) {
      logger.info(`Checking path: ${pathToTry}`);
      if (fs.existsSync(pathToTry)) {
        filePath = pathToTry;
        logger.info(`✅ Found document at: ${filePath}`);
        break;
      }
    }
    
    if (!filePath) {
      logger.error(`❌ Document file not found anywhere`);
      logger.error(`Searched paths:`, pathsToTry);
      
      return res.status(404).json({
        success: false,
        error: 'Document file not found on server',
        debug: process.env.NODE_ENV === 'development' ? {
          searchedPaths: pathsToTry,
          originalPath: document.file_path,
          filename: filename
        } : undefined
      });
    }

    // Get file stats
    const stats = fs.statSync(filePath);
    
    // Set appropriate headers
    const displayFilename = document.file_name || `document-${id}.pdf`;
    const mimeType = getMimeType(displayFilename);
    
    res.setHeader('Content-Type', mimeType);
    res.setHeader('Content-Length', stats.size);
    res.setHeader('Content-Disposition', `inline; filename="${displayFilename}"`);
    res.setHeader('Cache-Control', 'private, no-cache');
    
    // Log document access
    logger.info(`Document accessed: ${id} (${displayFilename}) by ${req.user.email}`, {
      documentId: id,
      fileName: displayFilename,
      userRole: req.user.role,
      truckLicensePlate: document.license_plate,
      providerCompany: document.company_name
    });

    // Stream the file
    const fileStream = fs.createReadStream(filePath);
    fileStream.pipe(res);
    
    fileStream.on('error', (error) => {
      logger.error('File stream error:', error);
      if (!res.headersSent) {
        res.status(500).json({
          success: false,
          error: 'Error reading document file'
        });
      }
    });

  } catch (error) {
    logger.error('Error downloading document:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to download document'
    });
  }
};

// Get document metadata (for preview)
export const getDocumentInfo = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Get document details with extended information
    const docResult = await query(`
      SELECT 
        d.*,
        t.license_plate,
        t.truck_type,
        t.make,
        t.model,
        t.year,
        pp.company_name,
        u.first_name as provider_first_name,
        u.last_name as provider_last_name,
        u.email as provider_email,
        u.id as owner_user_id,
        verifier.first_name as verified_by_first_name,
        verifier.last_name as verified_by_last_name
      FROM documents d
      LEFT JOIN trucks t ON d.entity_id = t.id AND d.entity_type = 'truck'
      LEFT JOIN provider_profiles pp ON t.provider_id = pp.id
      LEFT JOIN users u ON pp.user_id = u.id
      LEFT JOIN users verifier ON d.verified_by = verifier.id
      WHERE d.id = $1
    `, [id]);

    if (docResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Document not found'
      });
    }

    const document = docResult.rows[0];
    
    // Check permissions - admins can view all documents
    const canView = req.user.role === 'admin' || 
                   req.user.id === document.owner_user_id;
    
    if (!canView) {
      return res.status(403).json({
        success: false,
        error: 'Access denied'
      });
    }

    // Check if file exists and get file info
    let fileExists = false;
    let fileSize = null;
    let actualFilePath = null;
    
    if (document.file_path) {
      // Resolve file path based on server structure
      const filename = path.basename(document.file_path);
      
      // Primary path: current working directory + uploads structure
      const primaryPath = path.resolve(process.cwd(), 'uploads', 'trucks', 'documents', filename);
      
      // Alternative paths to check
      const pathsToTry = [
        primaryPath,
        path.resolve(__dirname, '../../uploads/trucks/documents', filename),
        path.resolve(process.cwd(), document.file_path.startsWith('/') ? document.file_path.substring(1) : document.file_path)
      ];
      
      // Try each path until we find the file
      for (const pathToTry of pathsToTry) {
        if (fs.existsSync(pathToTry)) {
          fileExists = true;
          actualFilePath = pathToTry;
          const stats = fs.statSync(pathToTry);
          fileSize = stats.size;
          break;
        }
      }
    }

    res.json({
      success: true,
      data: {
        document: {
          ...document,
          file_exists: fileExists,
          file_size: fileSize,
          file_size_formatted: fileSize ? formatFileSize(fileSize) : null,
          actual_file_path: actualFilePath
        }
      }
    });

  } catch (error) {
    logger.error('Error getting document info:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get document information'
    });
  }
};

// Helper function to get MIME type based on file extension
function getMimeType(filename) {
  const ext = path.extname(filename).toLowerCase();
  const mimeTypes = {
    '.pdf': 'application/pdf',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.png': 'image/png',
    '.gif': 'image/gif',
    '.doc': 'application/msword',
    '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    '.txt': 'text/plain'
  };
  return mimeTypes[ext] || 'application/octet-stream';
}

// Helper function to format file size
function formatFileSize(bytes) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// Debug endpoint to check file system structure
export const debugFileSystem = async (req, res) => {
  try {
    // Only admins can access debug info
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: 'Access denied'
      });
    }

    const debugInfo = {
      currentWorkingDirectory: process.cwd(),
      __dirname: __dirname,
      uploadPaths: [],
      existingFiles: [],
      documentSample: null
    };

    // Check various upload directory paths
    const pathsToCheck = [
      path.resolve(process.cwd(), 'uploads'),
      path.resolve(process.cwd(), 'server', 'uploads'),
      path.resolve(__dirname, '../../uploads'),
      path.resolve(process.cwd(), 'uploads', 'trucks'),
      path.resolve(process.cwd(), 'uploads', 'trucks', 'documents'),
      path.resolve(__dirname, '../../uploads/trucks/documents')
    ];

    for (const pathToCheck of pathsToCheck) {
      const exists = fs.existsSync(pathToCheck);
      debugInfo.uploadPaths.push({
        path: pathToCheck,
        exists,
        files: exists ? (fs.readdirSync(pathToCheck).slice(0, 5)) : []
      });
    }

    // Get a sample document from database
    const docResult = await query(`
      SELECT id, file_name, file_path, file_size 
      FROM documents 
      WHERE entity_type = 'truck' 
      LIMIT 1
    `);

    if (docResult.rows.length > 0) {
      debugInfo.documentSample = docResult.rows[0];
    }

    res.json({
      success: true,
      data: debugInfo
    });

  } catch (error) {
    logger.error('Error in debug file system:', error);
    res.status(500).json({
      success: false,
      error: 'Debug failed',
      details: error.message
    });
  }
};
