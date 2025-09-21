import express from 'express';
import { getAllDocuments, verifyDocument, getDocumentStats, downloadDocument, getDocumentInfo } from '../controllers/documentController.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

// Admin routes for document management
router.get('/', authenticate, getAllDocuments);
router.get('/stats', authenticate, getDocumentStats);
router.get('/:id/info', authenticate, getDocumentInfo);
router.get('/:id/download', authenticate, downloadDocument);
router.post('/:id/verify', authenticate, verifyDocument);

export default router;
