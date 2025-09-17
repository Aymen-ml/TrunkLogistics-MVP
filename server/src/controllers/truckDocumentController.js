import Truck from '../models/Truck.js';
import Document from '../models/Document.js';
import ProviderProfile from '../models/ProviderProfile.js';
import { validationResult } from 'express-validator';
import logger from '../utils/logger.js';
import { cleanupFiles, processUploadedFiles } from '../utils/fileUpload.js';
import fs from 'fs';
import path from 'path';

export const getTruckDocuments = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: errors.array()
      });
    }

    const { truckId } = req.params;
    
    // Check if truck exists
    const truck = await Truck.findById(truckId);
    if (!truck) {
      return res.status(404).json({
        success: false,
        error: 'Truck not found'
      });
    }

    // Check permissions - owner can view their truck documents
    if (req.user.role === 'provider') {
      const providerProfile = await ProviderProfile.findByUserId(req.user.id);
      if (!providerProfile || truck.provider_id !== providerProfile.id) {
        return res.status(403).json({
          success: false,
          error: 'You can only view documents for your own trucks'
        });
      }
    }

    // Get truck with documents
    const truckWithDocuments = await Truck.getWithDocuments(truckId);
    
    res.json({
      success: true,
      data: {
        truckId: truckWithDocuments.id,
        images: truckWithDocuments.images || [],
        documents: truckWithDocuments.documents || []
      }
    });
  } catch (error) {
    logger.error('Get truck documents error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error while fetching truck documents'
    });
  }
};

export const uploadTruckDocument = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      // Cleanup uploaded files on validation error
      if (req.files) {
        cleanupFiles(req.body.uploadedFiles);
      }
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: errors.array()
      });
    }

    const { truckId } = req.params;
    
    // Check if truck exists and belongs to the provider
    const truck = await Truck.findById(truckId);
    if (!truck) {
      // Cleanup uploaded files on error
      if (req.files) {
        cleanupFiles(req.body.uploadedFiles);
      }
      return res.status(404).json({
        success: false,
        error: 'Truck not found'
      });
    }

    // Check permissions
    const providerProfile = await ProviderProfile.findByUserId(req.user.id);
    if (!providerProfile || truck.provider_id !== providerProfile.id) {
      // Cleanup uploaded files on error
      if (req.files) {
        cleanupFiles(req.body.uploadedFiles);
      }
      return res.status(403).json({
        success: false,
        error: 'You can only upload documents for your own trucks'
      });
    }

    // Process uploaded files using the new processUploadedFiles function
    let uploadResult;
    
    try {
      uploadResult = await processUploadedFiles(req);
    } catch (error) {
      return res.status(400).json({
        success: false,
        error: 'Error processing uploaded files: ' + error.message
      });
    }
    
    const documents = uploadResult.documents || [];

    if (documents.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'No valid documents were uploaded'
      });
    }

    // Save documents to database
    const savedDocuments = await Truck.saveDocuments(truckId, documents);

    logger.info(`Documents uploaded for truck: ${truckId} by provider ${req.user.email}`);

    res.status(201).json({
      success: true,
      data: { documents: savedDocuments },
      message: 'Documents uploaded successfully'
    });

  } catch (error) {
    // Cleanup uploaded files on error
    if (req.files) {
      cleanupFiles(req.body.uploadedFiles);
    }
    
    logger.error('Upload truck document error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error while uploading documents'
    });
  }
};

export const updateTruckDocuments = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      // Cleanup uploaded files on validation error
      if (req.files) {
        cleanupFiles(req.body.uploadedFiles);
      }
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: errors.array()
      });
    }

    const { truckId } = req.params;
    
    // Check if truck exists
    const truck = await Truck.findById(truckId);
    if (!truck) {
      // Cleanup uploaded files on error
      if (req.files) {
        cleanupFiles(req.body.uploadedFiles);
      }
      return res.status(404).json({
        success: false,
        error: 'Truck not found'
      });
    }

    // Check permissions
    if (req.user.role === 'provider') {
      const providerProfile = await ProviderProfile.findByUserId(req.user.id);
      if (!providerProfile || truck.provider_id !== providerProfile.id) {
        // Cleanup uploaded files on error
        if (req.files) {
          cleanupFiles(req.body.uploadedFiles);
        }
        return res.status(403).json({
          success: false,
          error: 'You can only update documents for your own trucks'
        });
      }
    } else if (req.user.role !== 'admin') {
      // Cleanup uploaded files on error
      if (req.files) {
        cleanupFiles(req.body.uploadedFiles);
      }
      return res.status(403).json({
        success: false,
        error: 'Access denied'
      });
    }

    // Get existing documents to clean them up
    const existingDocuments = await Truck.getDocuments(truckId);
    
    // Process uploaded files using the new processUploadedFiles function
    let uploadResult;
    
    try {
      uploadResult = await processUploadedFiles(req);
    } catch (error) {
      // Cleanup uploaded files on error
      if (req.files) {
        cleanupFiles(req.body.uploadedFiles);
      }
      return res.status(400).json({
        success: false,
        error: 'Error processing uploaded files: ' + error.message
      });
    }
    
    const documents = uploadResult.documents || [];

    if (documents.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'No valid documents were provided'
      });
    }

    // Delete existing documents from database
    if (existingDocuments.length > 0) {
      await Promise.all(existingDocuments.map(doc => Document.delete(doc.id)));
      
      // Clean up old files from disk
      existingDocuments.forEach(doc => {
        const filePath = path.join(process.cwd(), 'uploads', doc.file_path.replace('/uploads/', ''));
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      });
    }

    // Save new documents to database
    const savedDocuments = await Truck.saveDocuments(truckId, documents);

    logger.info(`Documents updated for truck: ${truckId} by ${req.user.email}`);

    res.json({
      success: true,
      data: { documents: savedDocuments },
      message: 'Documents updated successfully'
    });

  } catch (error) {
    // Cleanup uploaded files on error
    if (req.files) {
      cleanupFiles(req.body.uploadedFiles);
    }
    
    logger.error('Update truck documents error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error while updating documents'
    });
  }
};

export const updateTruckImages = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      // Cleanup uploaded files on validation error
      if (req.files) {
        cleanupFiles(req.body.uploadedFiles);
      }
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: errors.array()
      });
    }

    const { truckId } = req.params;
    
    // Check if truck exists
    const truck = await Truck.findById(truckId);
    if (!truck) {
      // Cleanup uploaded files on error
      if (req.files) {
        cleanupFiles(req.body.uploadedFiles);
      }
      return res.status(404).json({
        success: false,
        error: 'Truck not found'
      });
    }

    // Check permissions
    if (req.user.role === 'provider') {
      const providerProfile = await ProviderProfile.findByUserId(req.user.id);
      if (!providerProfile || truck.provider_id !== providerProfile.id) {
        // Cleanup uploaded files on error
        if (req.files) {
          cleanupFiles(req.body.uploadedFiles);
        }
        return res.status(403).json({
          success: false,
          error: 'You can only update images for your own trucks'
        });
      }
    } else if (req.user.role !== 'admin') {
      // Cleanup uploaded files on error
      if (req.files) {
        cleanupFiles(req.body.uploadedFiles);
      }
      return res.status(403).json({
        success: false,
        error: 'Access denied'
      });
    }

    // Process uploaded images
    let images = [];
    
    if (req.body.uploadedFiles && req.body.uploadedFiles.images) {
      images = req.body.uploadedFiles.images.map(img => img.path);
    }

    if (images.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'No valid images were uploaded'
      });
    }

    // Clean up old images from disk
    if (truck.images && Array.isArray(truck.images)) {
      truck.images.forEach(imagePath => {
        const filePath = path.join(process.cwd(), 'uploads', imagePath.replace('/uploads/', ''));
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      });
    }

    // Update truck images in database
    const updatedTruck = await Truck.updateImages(truckId, images);

    logger.info(`Images updated for truck: ${truckId} by ${req.user.email}`);

    res.json({
      success: true,
      data: { 
        truckId: updatedTruck.id, 
        images: updatedTruck.images 
      },
      message: 'Truck images updated successfully'
    });

  } catch (error) {
    // Cleanup uploaded files on error
    if (req.files) {
      cleanupFiles(req.body.uploadedFiles);
    }
    
    logger.error('Update truck images error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error while updating images'
    });
  }
};

export const deleteTruckDocument = async (req, res) => {
  try {
    console.log('=== DELETE DOCUMENT REQUEST ===');
    console.log('Request params:', req.params);
    console.log('User:', req.user);
    
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log('Validation errors:', errors.array());
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: errors.array()
      });
    }

    const { documentId } = req.params;
    console.log('Document ID to delete:', documentId);
    
    // Check if document exists
    const document = await Document.findById(documentId);
    console.log('Found document:', document);
    
    if (!document) {
      console.log('Document not found in database');
      return res.status(404).json({
        success: false,
        error: 'Document not found'
      });
    }

    // Check if it's a truck document
    if (document.entity_type !== 'truck') {
      return res.status(400).json({
        success: false,
        error: 'This document is not associated with a truck'
      });
    }

    // Check permissions - get truck and verify ownership
    const truck = await Truck.findById(document.entity_id);
    if (!truck) {
      return res.status(404).json({
        success: false,
        error: 'Associated truck not found'
      });
    }

    if (req.user.role === 'provider') {
      const providerProfile = await ProviderProfile.findByUserId(req.user.id);
      if (!providerProfile || truck.provider_id !== providerProfile.id) {
        return res.status(403).json({
          success: false,
          error: 'You can only delete documents for your own trucks'
        });
      }
    } else if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: 'Access denied'
      });
    }

    // Delete document from database
    await Document.delete(documentId);

    // Clean up file from disk
    const filePath = path.join(process.cwd(), 'uploads', document.file_path.replace('/uploads/', ''));
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    logger.info(`Document deleted: ${documentId} by ${req.user.email}`);

    res.json({
      success: true,
      message: 'Document deleted successfully'
    });

  } catch (error) {
    logger.error('Delete truck document error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error while deleting document'
    });
  }
};
