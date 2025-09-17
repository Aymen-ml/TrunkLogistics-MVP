import express from 'express';
import { getAllDocuments, verifyDocument, getDocumentStats } from '../controllers/documentController.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

// Admin routes for document management
router.get('/', authenticate, getAllDocuments);
router.get('/stats', authenticate, getDocumentStats);
router.post('/:id/verify', authenticate, verifyDocument);

export default router;
