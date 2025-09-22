import express from 'express';
import { getAllDocuments, verifyDocument, getDocumentStats, downloadDocument, getDocumentInfo, debugFileSystem } from '../controllers/documentController.js';
import { authenticate } from '../middleware/auth.js';
import { documentAuth, publicDocumentAccess } from '../middleware/documentAuth.js';

const router = express.Router();

// Admin routes for document management (require strict authentication)
router.get('/', authenticate, getAllDocuments);
router.get('/stats', authenticate, getDocumentStats);
router.get('/debug/filesystem', authenticate, debugFileSystem);
router.post('/:id/verify', authenticate, verifyDocument);

// Document viewing routes (completely public - no authentication required)
// This ensures providers can always access truck documents without any blocking
router.get('/:id/info', getDocumentInfo);
router.get('/:id/download', downloadDocument);

export default router;
