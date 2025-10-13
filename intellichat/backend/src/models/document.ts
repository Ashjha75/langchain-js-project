/**
 * Document Model
 * Defines the schema for storing document metadata in MongoDB.
 */

import { Schema, model, Document as MongooseDocument } from 'mongoose';

interface IDocument extends MongooseDocument {
  userId: Schema.Types.ObjectId;
  fileName: string;
  s3Url: string;
  status: 'processing' | 'completed' | 'failed';
  createdAt: Date;
  updatedAt: Date;
}

const documentSchema = new Schema<IDocument>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    fileName: {
      type: String,
      required: true,
    },
    s3Url: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ['processing', 'completed', 'failed'],
      default: 'processing',
    },
  },
  {
    timestamps: true,
  },
);

export const Document = model<IDocument>('Document', documentSchema);
