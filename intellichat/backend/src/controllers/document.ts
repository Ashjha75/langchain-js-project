/**
 * Document Controller
 * Handles the business logic for document-related operations.
 */

import { Request, Response } from 'express';
import { s3Service } from '@/services/s3';
import { Document } from '@/models/document';
// import { redisQueue } from '@/services/queue';

class DocumentController {
  public async uploadDocument(req: Request, res: Response): Promise<void> {
    try {
      if (!req.file) {
        res.status(400).json({ message: 'No file uploaded.' });
        return;
      }

      // Upload file to S3
      const s3Url = await s3Service.uploadFile(req.file);

      // Create document record in the database
      const document = await Document.create({
        userId: (req.user as any).id,
        fileName: req.file.originalname,
        s3Url,
        status: 'processing',
      });

      // Add a job to the processing queue
      // await redisQueue.add('process-document', { documentId: document.id });

      res.status(201).json({
        message: 'File uploaded successfully. Processing has started.',
        documentId: document.id,
      });
    } catch (error) {
      res.status(500).json({ message: 'Error uploading file.', error });
    }
  }

  public async getDocumentStatus(req: Request, res: Response): Promise<void> {
    try {
      const { documentId } = req.params;
      const document = await Document.findById(documentId);

      if (!document) {
        res.status(404).json({ message: 'Document not found.' });
        return;
      }

      res.status(200).json({
        documentId: document.id,
        status: document.status,
      });
    } catch (error) {
      res.status(500).json({ message: 'Error fetching document status.', error });
    }
  }
}

export const documentController = new DocumentController();
