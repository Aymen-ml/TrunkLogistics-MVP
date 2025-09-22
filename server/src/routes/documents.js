import express from 'express';
import { getAllDocuments, verifyDocument, getDocumentStats, downloadDocument, getDocumentInfo, debugFileSystem } from '../controllers/documentController.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

// Admin routes for document management (require authentication)
router.get('/', authenticate, getAllDocuments);
router.get('/stats', authenticate, getDocumentStats);
router.get('/debug/filesystem', authenticate, debugFileSystem);
router.post('/:id/verify', authenticate, verifyDocument);

// Document viewing routes (require authentication but with permissive provider access)
router.get('/:id/info', authenticate, getDocumentInfo);
router.get('/:id/download', authenticate, downloadDocument);

export default router;
