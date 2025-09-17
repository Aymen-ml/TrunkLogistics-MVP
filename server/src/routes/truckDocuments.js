import express from 'express';
import { 
  uploadTruckDocument,
  updateTruckDocuments, 
  getTruckDocuments, 
  deleteTruckDocument,
  updateTruckImages 
} from '../controllers/truckDocumentController.js';
import { authenticate, requireProvider, requireProviderOrAdmin } from '../middleware/auth.js';
import { validateUUID, validateDocumentId, validateTruckId } from '../middleware/validation.js';
import { uploadTruckFiles, processUploadedFiles } from '../utils/fileUpload.js';

const router = express.Router();

// GET /api/truck-documents/:truckId - Get documents for a truck
router.get('/:truckId', authenticate, validateTruckId, getTruckDocuments);

// POST /api/truck-documents/:truckId - Upload a new document for a truck
router.post('/:truckId/upload', authenticate, requireProvider, validateTruckId, uploadTruckFiles, processUploadedFiles, uploadTruckDocument);

// PUT /api/truck-documents/:truckId - Update truck documents (replace existing ones)
router.put('/:truckId', authenticate, requireProviderOrAdmin, validateTruckId, uploadTruckFiles, processUploadedFiles, updateTruckDocuments);

// PUT /api/truck-documents/:truckId/images - Update truck images
router.put('/:truckId/images', authenticate, requireProviderOrAdmin, validateTruckId, uploadTruckFiles, processUploadedFiles, updateTruckImages);

// DELETE /api/truck-documents/:documentId - Delete a specific document
router.delete('/:documentId', authenticate, requireProviderOrAdmin, validateDocumentId, deleteTruckDocument);

export default router;
