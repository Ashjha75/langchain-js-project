/**
 * Document Routes
 * Defines API endpoints for file uploads, processing, and management.
 */

import { Router } from 'express';
import { authenticateJWT } from '@/middleware/auth';
import { documentController } from '@/controllers/document';
import { upload } from '@/middleware/upload';

const router = Router();

// All document routes require authentication
router.use(authenticateJWT as any);

/**
 * @route   POST /api/documents/upload
 * @desc    Upload a new document for processing
 * @access  Private
 * @uses    multer middleware for single file upload
 */
router.post(
  '/upload',
  upload.single('file'),
  documentController.uploadDocument,
);

/**
 * @route   GET /api/documents/:documentId/status
 * @desc    Check the processing status of a document
 * @access  Private
 */
router.get(
  '/:documentId/status',
  documentController.getDocumentStatus,
);

export { router as documentRoutes };
