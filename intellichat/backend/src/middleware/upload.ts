/**
 * Multer Middleware
 * Configures multer for handling file uploads.
 */

console.log("🟤 UPLOAD.TS: Starting to load");
import multer from 'multer';
import { Request } from 'express';
console.log("🟤 UPLOAD.TS: Imports loaded");

// Configure multer to store files in memory
const storage = multer.memoryStorage();

// File filter to validate file types
const fileFilter = (_req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const allowedMimes = [
    // Documents
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.ms-excel',
    'text/csv',
    
    // Images
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp',
    'image/svg+xml',
    
    // Text & Code files
    'text/plain',
    'text/markdown',
    'text/x-markdown',
    'application/json',
    'text/javascript',
    'application/javascript',
    'text/x-javascript',
    'application/x-javascript',
    'text/typescript',
    'application/typescript',
    'text/x-typescript',
    'application/x-typescript',
    'text/html',
    'text/css',
    'text/xml',
    'application/xml',
    'text/x-python',
    'application/x-python-code',
    'text/x-java-source',
    'text/x-c',
    'text/x-c++',
    'text/x-csharp',
    'text/x-go',
    'text/x-rust',
    'text/x-sql',
    'application/sql',
    'text/yaml',
    'application/x-yaml',
  ];

  // Also check file extension for text-based files (some systems don't set correct MIME types)
  const allowedExtensions = [
    '.pdf', '.doc', '.docx', '.xls', '.xlsx', '.csv',
    '.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg',
    '.txt', '.md', '.json', '.js', '.ts', '.jsx', '.tsx',
    '.html', '.css', '.xml', '.py', '.java', '.c', '.cpp',
    '.cs', '.go', '.rs', '.sql', '.yaml', '.yml', '.sh',
    '.bash', '.env', '.config', '.conf', '.ini', '.toml'
  ];

  const fileName = file.originalname.toLowerCase();
  const hasAllowedExtension = allowedExtensions.some(ext => fileName.endsWith(ext));

  if (allowedMimes.includes(file.mimetype) || hasAllowedExtension) {
    cb(null, true);
  } else {
    cb(new Error(`Invalid file type. Allowed: documents (PDF, DOC, DOCX, XLS, XLSX), images (JPEG, PNG, GIF, WEBP, SVG), and code files (JS, TS, JSON, MD, TXT, PY, etc.)`));
  }
};

export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10 MB file size limit
  },
});

console.log("🟤 UPLOAD.TS: Module fully loaded");
