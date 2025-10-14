/**
 * Document Routes
 * Defines API endpoints for file uploads, processing, and management.
 */

console.log("🟣 DOCUMENT_ROUTES.TS: Starting to load");
import { Router } from 'express';
import { authenticateJWT } from '@/middleware/auth';
console.log("🟣 DOCUMENT_ROUTES.TS: About to import documentController");
import { documentController } from '@/controllers/document';
console.log("🟣 DOCUMENT_ROUTES.TS: documentController imported");
import { upload } from '@/middleware/upload';
console.log("🟣 DOCUMENT_ROUTES.TS: All imports loaded");

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

console.log("🟣 DOCUMENT_ROUTES.TS: Exporting documentRoutes");
export { router as documentRoutes };
console.log("🟣 DOCUMENT_ROUTES.TS: Module fully loaded");
