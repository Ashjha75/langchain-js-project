/**
 * Document Controller
 * Handles the business logic for document-related operations.
 */

console.log("🟠 DOCUMENT_CONTROLLER.TS: Starting to load");
import { Request, Response } from 'express';
import { s3Service } from '@/services/s3';
import { Document } from '@/models/document';
import { createLogger } from '@/utils/logger';
// import { redisQueue } from '@/services/queue';

console.log("🟠 DOCUMENT_CONTROLLER.TS: All imports loaded");

const logger = createLogger('DocumentController');
console.log("🟠 DOCUMENT_CONTROLLER.TS: Logger created");

class DocumentController {
  public async uploadDocument(req: Request, res: Response): Promise<void> {
    try {
      logger.info('Document upload request received', {
        userId: (req.user as any)?.id,
        hasFile: !!req.file,
      });

      if (!req.file) {
        logger.warn('No file in upload request');
        res.status(400).json({ 
          status: 'error',
          message: 'No file uploaded.' 
        });
        return;
      }

      logger.info('File received', {
        fileName: req.file.originalname,
        fileSize: req.file.size,
        mimeType: req.file.mimetype,
      });

      // Upload file to S3
      const s3Url = await s3Service.uploadFile(req.file);
      logger.info('File uploaded to S3', { s3Url });

      // Create document record in the database
      const document = await Document.create({
        userId: (req.user as any).id,
        fileName: req.file.originalname,
        s3Url,
        status: 'processing',
      });

      logger.info('Document record created', {
        documentId: document.id,
        fileName: document.fileName,
      });

      // Add a job to the processing queue (currently commented out)
      // await redisQueue.add('process-document', { documentId: document.id });

      res.status(201).json({
        status: 'success',
        message: 'File uploaded successfully. Processing has started.',
        documentId: document.id,
        fileName: document.fileName,
      });
    } catch (error: any) {
      logger.error('Error uploading document', {
        error: error.message,
        stack: error.stack,
      });
      
      res.status(500).json({ 
        status: 'error',
        message: 'Error uploading file.',
        error: error.message,
      });
    }
  }

  public async getDocumentStatus(req: Request, res: Response): Promise<void> {
    try {
      const { documentId } = req.params;
      
      logger.info('Document status request', { documentId });

      const document = await Document.findById(documentId);

      if (!document) {
        logger.warn('Document not found', { documentId });
        res.status(404).json({ 
          status: 'error',
          message: 'Document not found.' 
        });
        return;
      }

      res.status(200).json({
        status: 'success',
        documentId: document.id,
        fileName: document.fileName,
        documentStatus: document.status,
        createdAt: document.createdAt,
        updatedAt: document.updatedAt,
      });
    } catch (error: any) {
      logger.error('Error fetching document status', {
        error: error.message,
        documentId: req.params.documentId,
      });
      
      res.status(500).json({ 
        status: 'error',
        message: 'Error fetching document status.',
        error: error.message,
      });
    }
  }
}

console.log("🟠 DOCUMENT_CONTROLLER.TS: Creating documentController singleton");
export const documentController = new DocumentController();
console.log("🟠 DOCUMENT_CONTROLLER.TS: Module fully loaded");
