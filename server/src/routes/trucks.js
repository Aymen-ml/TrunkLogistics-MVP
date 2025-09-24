import express from 'express';
import { createTruck, getTrucks, getTruck, updateTruck, deleteTruck, getMyTrucks, getStorageStatus, getAllTrucksForAdmin } from '../controllers/truckController.js';
import { authenticate, requireProvider, requireProviderOrAdmin, requireAdmin } from '../middleware/auth.js';
import { validateTruckCreate, validateTruckSearch, validateUUID } from '../middleware/validation.js';
import { uploadTruckFiles } from '../utils/hybridUpload.js';

const router = express.Router();

// GET /api/trucks - Search trucks (authenticated)
router.get('/', authenticate, getTrucks);

// GET /api/trucks/storage-status - Get storage configuration status  
router.get('/storage-status', authenticate, getStorageStatus);

// GET /api/trucks/my - Get provider's trucks
router.get('/my', authenticate, requireProvider, getMyTrucks);

// GET /api/trucks/admin/all - Get all trucks for admin dashboard
router.get('/admin/all', authenticate, requireAdmin, getAllTrucksForAdmin);

// POST /api/trucks - Create truck listing with file uploads
router.post('/', authenticate, requireProvider, uploadTruckFiles, validateTruckCreate, createTruck);

// GET /api/trucks/:id - Get truck details
router.get('/:id', authenticate, validateUUID, getTruck);

// PUT /api/trucks/:id - Update truck
router.put('/:id', authenticate, requireProviderOrAdmin, validateUUID, uploadTruckFiles, validateTruckCreate, updateTruck);

// DELETE /api/trucks/:id - Delete truck
router.delete('/:id', authenticate, requireProviderOrAdmin, validateUUID, deleteTruck);

export default router;
