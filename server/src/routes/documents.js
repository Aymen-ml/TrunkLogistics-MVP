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

// Document viewing routes (use lenient authentication that won't block on auth failures)
// This allows providers with expired tokens or auth issues to still access documents
router.get('/:id/info', documentAuth, getDocumentInfo);
router.get('/:id/download', documentAuth, downloadDocument);

export default router;
