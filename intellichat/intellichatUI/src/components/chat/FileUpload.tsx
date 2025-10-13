'use client';

import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Paperclip, X, File as FileIcon, ImageIcon, Code } from 'lucide-react';
import { Button } from '../ui/button';
import { useToast } from '../ui/toast';

interface FileUploadProps {
  onFilesChange: (files: File[]) => void;
}

const MAX_FILES = 5;
const MAX_SIZE_MB = 5;
const MAX_SIZE_BYTES = MAX_SIZE_MB * 1024 * 1024;

export function FileUpload({ onFilesChange }: FileUploadProps) {
  const [files, setFiles] = useState<File[]>([]);
  const { showToast } = useToast();

  const onDrop = useCallback((acceptedFiles: File[], rejectedFiles: any[]) => {
    if (rejectedFiles.length > 0) {
      rejectedFiles.forEach(({ file, errors }) => {
        errors.forEach((error: any) => {
          if (error.code === 'file-too-large') {
            showToast(`File is too large: ${file.name}. Max size is ${MAX_SIZE_MB}MB.`, 'error');
          } else if (error.code === 'too-many-files') {
            showToast(`You can only upload a maximum of ${MAX_FILES} files.`, 'error');
          } else {
            showToast(`Error uploading ${file.name}: ${error.message}`, 'error');
          }
        });
      });
    }

    const newFiles = [...files, ...acceptedFiles].slice(0, MAX_FILES);
    setFiles(newFiles);
    onFilesChange(newFiles);
  }, [files, onFilesChange, showToast]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    maxFiles: MAX_FILES,
    maxSize: MAX_SIZE_BYTES,
  });

  const removeFile = (index: number) => {
    const newFiles = files.filter((_, i) => i !== index);
    setFiles(newFiles);
    onFilesChange(newFiles);
  };

  const getFileIcon = (file: File) => {
    if (file.type.startsWith('image/')) {
      return <ImageIcon className="w-5 h-5 text-blue-400" />;
    }
    if (file.type === 'application/pdf' || file.type.includes('word')) {
      return <FileIcon className="w-5 h-5 text-green-400" />;
    }
    return <Code className="w-5 h-5 text-yellow-400" />;
  };

  return (
    <div>
      <div {...getRootProps()} className="relative">
        <input {...getInputProps()} />
        <Button variant="ghost" size="icon" className="absolute left-2 top-1/2 -translate-y-1/2">
          <Paperclip className="w-5 h-5" />
        </Button>
      </div>

      {files.length > 0 && (
        <div className="p-2 border-t border-gray-700">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
            {files.map((file, index) => (
              <div key={index} className="relative group bg-gray-800 p-2 rounded-lg flex items-center gap-2">
                {getFileIcon(file)}
                <span className="text-xs truncate">{file.name}</span>
                <button
                  onClick={() => removeFile(index)}
                  className="absolute top-1 right-1 bg-red-500 rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X className="w-3 h-3 text-white" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
