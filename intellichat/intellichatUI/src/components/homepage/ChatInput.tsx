'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Send, Mic, Plus, X, Paperclip, Code, Bot, Loader2, FileText, FileImage, FileCode, FileJson, FileSpreadsheet } from 'lucide-react';
import { toolsOptions } from './data';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../ui/tooltip';
import { ConfirmModal } from '../ui/confirm-modal';

const assetOptions = [
  { id: 'upload', icon: Paperclip, label: 'Upload files' },
  // { id: 'drive', icon: Bot, label: 'Add from Drive' },
  { id: 'code', icon: Code, label: 'Import code' },
];

// Helper function to get file icon and color based on file type
const getFileIcon = (fileName: string, mimeType: string) => {
  const ext = fileName.toLowerCase().split('.').pop() || '';
  
  // Code files
  const codeExtensions = ['js', 'jsx', 'ts', 'tsx', 'py', 'java', 'cpp', 'c', 'cs', 'go', 'rs', 'rb', 'php', 'swift', 'kt'];
  if (codeExtensions.includes(ext)) {
    return { Icon: FileCode, color: 'text-purple-400' };
  }
  
  // JSON files
  if (ext === 'json') {
    return { Icon: FileJson, color: 'text-yellow-400' };
  }
  
  // Spreadsheets
  if (['xlsx', 'xls', 'csv'].includes(ext)) {
    return { Icon: FileSpreadsheet, color: 'text-green-500' };
  }
  
  // Markdown and text
  if (['md', 'txt', 'yaml', 'yml', 'toml', 'ini', 'conf', 'config', 'env'].includes(ext)) {
    return { Icon: FileText, color: 'text-gray-400' };
  }
  
  // Images
  if (mimeType.startsWith('image/')) {
    return { Icon: FileImage, color: 'text-blue-400' };
  }
  
  // Default document icon
  return { Icon: FileText, color: 'text-green-400' };
};

interface UploadedFile {
  file: File;
  preview?: string | undefined;
  documentId?: string | undefined;
  uploading: boolean;
  error?: string | undefined;
}

interface ChatInputProps {
  input: string;
  setInput: (value: string) => void;
  handleSendMessage: (attachments?: any[]) => void;
  disabled?: boolean;
}

export function ChatInput({ input, setInput, handleSendMessage, disabled }: ChatInputProps) {
  const [showAssetMenu, setShowAssetMenu] = useState(false);
  const [selectedAssets, setSelectedAssets] = useState<string[]>([]);
  const [pastedImages, setPastedImages] = useState<Array<{ id: string; url: string; file: File }>>([]);
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [errorModal, setErrorModal] = useState<{ isOpen: boolean; message: string }>({ isOpen: false, message: '' });
  const assetMenuRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const codeInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (assetMenuRef.current && !assetMenuRef.current.contains(event.target as Node)) {
        setShowAssetMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = '40px';
      const scrollHeight = textareaRef.current.scrollHeight;
      const maxHeight = 200;
      textareaRef.current.style.height = `${Math.min(scrollHeight, maxHeight)}px`;
    }
  }, [input]);

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey && !isUploading) {
      e.preventDefault();
      onSendMessage();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    const items = e.clipboardData?.items;
    if (!items) return;

    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      if (item && item.type.indexOf('image') !== -1) {
        e.preventDefault();
        const file = item.getAsFile();
        if (file) {
          const id = Date.now().toString() + i;
          const url = URL.createObjectURL(file);
          setPastedImages((prev) => [...prev, { id, url, file }]);
        }
      }
    }
  };

  const removeImage = (id: string) => {
    setPastedImages((prev) => {
      const image = prev.find((img) => img.id === id);
      if (image) {
        URL.revokeObjectURL(image.url);
      }
      return prev.filter((img) => img.id !== id);
    });
  };

  const removeUploadedFile = (index: number) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index));
  };

  // Upload file immediately when selected
  const uploadFileToBackend = async (file: File): Promise<string> => {
    // Get auth token from user object (same pattern as api.ts and chat-api.ts)
    let token = '';
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        token = user?.tokens?.accessToken || '';
      } catch (e) {
        console.error('Error parsing user from localStorage:', e);
        throw new Error('Authentication error. Please log in again.');
      }
    }

    if (!token) {
      throw new Error('Please log in to upload files.');
    }

    const formData = new FormData();
    formData.append('file', file);

    // Use base URL without /api suffix, as we'll add the full path
    const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3002';
    // Remove trailing /api if present to avoid double /api/api/
    const baseUrl = apiBaseUrl.replace(/\/api\/?$/, '');
    
    const response = await fetch(`${baseUrl}/api/documents/upload`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'Upload failed' }));
      
      // Handle authentication errors specifically
      if (response.status === 401) {
        throw new Error('Session expired. Please log in again.');
      }
      
      throw new Error(errorData.message || `Failed to upload ${file.name}`);
    }

    const data = await response.json();
    return data.documentId;
  };

  const handleFileSelect = async (files: File[]) => {
    if (files.length === 0) return;

    // Add files to state with uploading status
    const newFiles: UploadedFile[] = files.map(file => ({
      file,
      preview: file.type.startsWith('image/') ? URL.createObjectURL(file) : undefined,
      uploading: true,
      documentId: undefined,
      error: undefined,
    }));

    setUploadedFiles(prev => [...prev, ...newFiles]);
    setIsUploading(true);

    // Upload each file
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (!file) continue;
      
      const fileIndex = uploadedFiles.length + i;

      try {
        const documentId = await uploadFileToBackend(file);
        
        // Update file with documentId and mark as uploaded
        setUploadedFiles(prev => prev.map((f, idx) => 
          idx === fileIndex 
            ? { ...f, documentId, uploading: false }
            : f
        ));
      } catch (error: any) {
        console.error(`Error uploading ${file.name}:`, error);
        
        // Mark file with error
        setUploadedFiles(prev => prev.map((f, idx) => 
          idx === fileIndex 
            ? { ...f, uploading: false, error: error.message }
            : f
        ));
        
        // Show error modal immediately
        setErrorModal({
          isOpen: true,
          message: `Failed to upload "${file.name}". ${error.message || 'Please try again.'}`
        });
      }
    }

    setIsUploading(false);
  };

  const onSendMessage = async () => {
    if (!input.trim() && uploadedFiles.length === 0 && pastedImages.length === 0) {
      return;
    }

    if (isUploading) {
      setErrorModal({ 
        isOpen: true, 
        message: 'Please wait for files to finish uploading before sending the message.' 
      });
      return;
    }

    // Check if any files have errors
    const filesWithErrors = uploadedFiles.filter(f => f.error);
    if (filesWithErrors.length > 0) {
      setErrorModal({ 
        isOpen: true, 
        message: 'Some files failed to upload. Please remove them and try again.' 
      });
      return;
    }

    try {
      let attachments: any[] = [];

      // Add uploaded documents
      if (uploadedFiles.length > 0) {
        const documentAttachments = uploadedFiles.map(f => ({
          type: 'document',
          documentId: f.documentId,
          fileName: f.file.name,
        }));
        attachments = [...attachments, ...documentAttachments];
      }

      // Add pasted images
      if (pastedImages.length > 0) {
        const imageAttachments = pastedImages.map(img => ({
          type: 'image',
          url: img.url,
        }));
        attachments = [...attachments, ...imageAttachments];
      }

      // Send message
      handleSendMessage(attachments.length > 0 ? attachments : undefined);
      
      // Clear all files
      uploadedFiles.forEach(f => {
        if (f.preview) URL.revokeObjectURL(f.preview);
      });
      setUploadedFiles([]);
      
      pastedImages.forEach(img => URL.revokeObjectURL(img.url));
      setPastedImages([]);
      
    } catch (error) {
      console.error('Error sending message:', error);
      setErrorModal({ 
        isOpen: true, 
        message: 'Failed to send message. Please try again.' 
      });
    }
  };

  const toggleAsset = (assetId: string) => {
    if (assetId === 'upload' && fileInputRef.current) {
      fileInputRef.current.click();
    } else if (assetId === 'code' && codeInputRef.current) {
      codeInputRef.current.click();
    } else {
      setSelectedAssets((prev) =>
        prev.includes(assetId) ? prev.filter((id) => id !== assetId) : [...prev, assetId]
      );
    }
    setShowAssetMenu(false);
  };

  const isDisabled = disabled || isUploading;

  return (
    <div className="w-full">
      <div className="relative bg-[#333537] rounded-3xl p-2 transition-colors focus-within:ring-2 focus-within:ring-[#4285f4]">
        {/* Hidden File Inputs */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*,application/pdf,.doc,.docx,.txt,.md,.csv,.xls,.xlsx"
          multiple
          className="hidden"
          onChange={(e) => {
            const files = Array.from(e.target.files || []);
            handleFileSelect(files);
            if (e.target) e.target.value = '';
          }}
        />
        <input
          ref={codeInputRef}
          type="file"
          accept=".js,.jsx,.ts,.tsx,.py,.java,.cpp,.c,.cs,.go,.rs,.html,.css,.json,.xml,.md,.txt,.sql,.yaml,.yml,.sh,.bash,.env,.config,.conf,.ini,.toml"
          multiple
          className="hidden"
          onChange={(e) => {
            const files = Array.from(e.target.files || []);
            handleFileSelect(files);
            if (e.target) e.target.value = '';
          }}
        />

        {/* Pasted Images Preview */}
        {pastedImages.length > 0 && (
          <div className="flex flex-wrap gap-2 p-2 mb-2">
            {pastedImages.map((image) => (
              <div key={image.id} className="relative group">
                <img
                  src={image.url}
                  alt="Pasted"
                  className="w-20 h-20 object-cover rounded-lg border border-[#404040]"
                />
                <button
                  onClick={() => removeImage(image.id)}
                  className="absolute -top-2 -right-2 bg-[#282a2c] border border-[#404040] rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X size={14} className="text-[#e8eaed]" />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Uploaded Files Preview */}
        {uploadedFiles.length > 0 && (
          <div className="flex flex-wrap gap-2 p-2 mb-2 border-t border-[#404040]">
            {uploadedFiles.map((fileObj, index) => {
              const isImage = fileObj.file.type.startsWith('image/');
              
              // For images, show larger preview
              if (isImage && fileObj.preview && !fileObj.uploading) {
                return (
                  <div key={index} className="relative group">
                    <img
                      src={fileObj.preview}
                      alt={fileObj.file.name}
                      className="w-20 h-20 object-cover rounded-lg border border-[#404040]"
                    />
                    {fileObj.error && (
                      <div className="absolute inset-0 bg-black/60 flex items-center justify-center rounded-lg">
                        <X size={24} className="text-red-400" />
                      </div>
                    )}
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <button
                          onClick={() => removeUploadedFile(index)}
                          className="absolute -top-2 -right-2 bg-[#282a2c] border border-[#404040] rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X size={14} className="text-[#e8eaed]" />
                        </button>
                      </TooltipTrigger>
                      <TooltipContent side="top">
                        <p>Remove file</p>
                      </TooltipContent>
                    </Tooltip>
                    {fileObj.error && (
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div className="absolute bottom-1 right-1 bg-red-500 rounded-full w-5 h-5 flex items-center justify-center text-xs text-white font-bold cursor-help">
                            !
                          </div>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>{fileObj.error}</p>
                        </TooltipContent>
                      </Tooltip>
                    )}
                  </div>
                );
              }
              
              // For documents or uploading images, show compact view
              const { Icon: FileIcon, color: iconColor } = getFileIcon(fileObj.file.name, fileObj.file.type);
              
              return (
                <div
                  key={index}
                  className="relative group flex items-center gap-2 bg-[#404040] text-[#e8eaed] text-sm px-3 py-2 rounded-lg max-w-[200px]"
                >
                  {/* Loading Spinner or File Icon */}
                  {fileObj.uploading ? (
                    <Loader2 size={16} className="animate-spin text-blue-400" />
                  ) : fileObj.error ? (
                    <X size={16} className="text-red-400" />
                  ) : (
                    <FileIcon size={16} className={iconColor} />
                  )}
                  
                  <span className="truncate flex-1" title={fileObj.file.name}>
                    {fileObj.file.name.length > 20 
                      ? `${fileObj.file.name.substring(0, 20)}...` 
                      : fileObj.file.name}
                  </span>
                  
                  {!fileObj.uploading && (
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <button
                          onClick={() => removeUploadedFile(index)}
                          className="ml-1 hover:text-red-400 transition-colors"
                        >
                          <X size={14} />
                        </button>
                      </TooltipTrigger>
                      <TooltipContent side="top">
                        <p>Remove file</p>
                      </TooltipContent>
                    </Tooltip>
                  )}
                  
                  {fileObj.error && (
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <span className="text-xs text-red-400 cursor-help">!</span>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>{fileObj.error}</p>
                      </TooltipContent>
                    </Tooltip>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {selectedAssets.length > 0 && (
          <div className="flex flex-wrap gap-2 p-2">
            {selectedAssets.map((assetId) => {
              const asset = assetOptions.find((opt) => opt.id === assetId);
              if (!asset) return null;
              const Icon = asset.icon;
              return (
                <div
                  key={assetId}
                  className="flex items-center gap-2 bg-[#404040] text-[#e8eaed] text-sm px-3 py-1.5 rounded-lg"
                >
                  <Icon size={16} />
                  <span>{asset.label}</span>
                  <button onClick={() => toggleAsset(assetId)} className="ml-1">
                    <X size={16} />
                  </button>
                </div>
              );
            })}
          </div>
        )}
        
        <div className="flex items-end">
          <div className="relative" ref={assetMenuRef}>
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  onClick={() => setShowAssetMenu(!showAssetMenu)}
                  className="p-2 hover:bg-[#404040] rounded-full transition-colors mx-1"
                  disabled={isDisabled}
                >
                  <Plus size={20} className="text-[#9aa0a6]" />
                </button>
              </TooltipTrigger>
              <TooltipContent side="top">
                <p>Add files or code</p>
              </TooltipContent>
            </Tooltip>
            {showAssetMenu && (
              <div className="absolute bottom-full left-0 mb-3 w-64 bg-[#282a2c] border border-[#333537] rounded-xl p-2 z-50 shadow-lg animate-fade-in">
                {assetOptions.map((asset) => {
                  const Icon = asset.icon;
                  const isDisabled = uploadedFiles.length >= 10;
                  return (
                    <button
                      key={asset.id}
                      onClick={() => toggleAsset(asset.id)}
                      disabled={isDisabled}
                      className="w-full flex items-center gap-3 p-3 hover:bg-[#333537] rounded-lg transition-colors text-left disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Icon size={20} className="text-[#9aa0a6]" />
                      <span className="text-[#e8eaed] text-sm">{asset.label}</span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          <textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            onPaste={handlePaste}
            placeholder={isUploading ? "Uploading files..." : "Ask IntelliChat"}
            className="flex-1 bg-transparent text-[#e8eaed] outline-none border-none text-base placeholder:text-[#9aa0a6] resize-none focus:ring-0 focus:border-0 overflow-y-auto py-2"
            rows={1}
            disabled={isDisabled}
          />

          <div className="flex items-center gap-1 ml-2">
            <Tooltip>
              <TooltipTrigger asChild>
                <button 
                  className="p-2 hover:bg-[#404040] rounded-full transition-colors"
                  disabled={isDisabled}
                >
                  <Mic size={20} className="text-[#9aa0a6]" />
                </button>
              </TooltipTrigger>
              <TooltipContent side="top">
                <p>Voice input</p>
              </TooltipContent>
            </Tooltip>
            {input.trim() && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    onClick={onSendMessage}
                    className="p-2 bg-[#4285f4] rounded-full transition-all duration-300 ease-in-out hover:bg-[#3367d6] animate-fade-in disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={isDisabled}
                  >
                    {isUploading ? (
                      <Loader2 size={20} className="text-white animate-spin" />
                    ) : (
                      <Send size={20} className="text-white" />
                    )}
                  </button>
                </TooltipTrigger>
                <TooltipContent side="top">
                  <p>{isUploading ? 'Uploading...' : 'Send message'}</p>
                </TooltipContent>
              </Tooltip>
            )}
          </div>
        </div>
      </div>

      {/* Error Modal */}
      <ConfirmModal
        isOpen={errorModal.isOpen}
        onClose={() => setErrorModal({ isOpen: false, message: '' })}
        onConfirm={() => setErrorModal({ isOpen: false, message: '' })}
        title="Upload Error"
        message={errorModal.message}
        confirmText="OK"
        cancelText=""
        variant="warning"
      />
    </div>
  );
}
