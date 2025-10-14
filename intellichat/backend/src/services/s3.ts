/**
 * S3 Service
 * Handles all interactions with AWS S3 for file storage.
 */

console.log("🔵 S3.TS: Starting to load");
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { CONFIG } from '@/config';
import { v4 as uuidv4 } from 'uuid';

console.log("🔵 S3.TS: Imports loaded, creating S3Client...");

const s3Client = new S3Client({
  region: CONFIG.s3.region,
  credentials: {
    accessKeyId: CONFIG.s3.accessKeyId,
    secretAccessKey: CONFIG.s3.secretAccessKey,
  },
});

console.log("🔵 S3.TS: S3Client created successfully");

class S3Service {
  public async uploadFile(file: Express.Multer.File): Promise<string> {
    const key = `documents/${uuidv4()}-${file.originalname}`;

    const command = new PutObjectCommand({
      Bucket: CONFIG.s3.bucketName,
      Key: key,
      Body: file.buffer,
      ContentType: file.mimetype,
    });

    await s3Client.send(command);

    return `https://${CONFIG.s3.bucketName}.s3.${CONFIG.s3.region}.amazonaws.com/${key}`;
  }
}

console.log("🔵 S3.TS: Exporting s3Service singleton");
export const s3Service = new S3Service();
console.log("🔵 S3.TS: Module fully loaded");
