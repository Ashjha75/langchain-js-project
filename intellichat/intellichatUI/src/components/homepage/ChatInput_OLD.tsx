'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Send, Mic, Plus, X, Paperclip, Code, Bot, Search, Video, Image, PenSquare, BookOpen } from 'lucide-react';
import { toolsOptions } from './data';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../ui/tooltip';

const assetOptions = [
  { id: 'upload', icon: Paperclip, label: 'Upload files' },
  { id: 'drive', icon: Bot, label: 'Add from Drive' },
  { id: 'code', icon: Code, label: 'Import code' },
];

const iconMap = {
  search: Search,
  video: Video,
  image: Image,
  'pen-square': PenSquare,
  'book-open': BookOpen,
};

interface ChatInputProps {
  input: string;
  setInput: (value: string) => void;
  handleSendMessage: (attachments?: any[]) => void;
  disabled?: boolean;
}

export function ChatInput({ input, setInput, handleSendMessage, disabled }: ChatInputProps) {
  const [showAssetMenu, setShowAssetMenu] = useState(false);
  const [showToolsMenu, setShowToolsMenu] = useState(false);
  const [selectedAssets, setSelectedAssets] = useState<string[]>([]);
  const [pastedImages, setPastedImages] = useState<Array<{ id: string; url: string; file: File }>>([]);
  const [uploadedFiles, setUploadedFiles] = useState<Array<{
    file: File;
    preview?: string;
    documentId?: string;
    uploading: boolean;
    error?: string;
  }>>([]);
  const [isUploading, setIsUploading] = useState(false);
  const assetMenuRef = useRef<HTMLDivElement>(null);
  const toolsMenuRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const codeInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (assetMenuRef.current && !assetMenuRef.current.contains(event.target as Node)) {
        setShowAssetMenu(false);
      }
      if (toolsMenuRef.current && !toolsMenuRef.current.contains(event.target as Node)) {
        setShowToolsMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Auto-resize textarea based on content
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = '40px'; // Reset to min height
      const scrollHeight = textareaRef.current.scrollHeight;
      const maxHeight = 200; // max height in pixels
      textareaRef.current.style.height = `${Math.min(scrollHeight, maxHeight)}px`;
    }
  }, [input]);

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
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

  const onSendMessage = async () => {
    if (!input.trim() && uploadedFiles.length === 0 && pastedImages.length === 0) {
      return; // Don't send empty messages
    }

    try {
      let attachments: any[] = [];

      // Upload files to the document API if there are any
      if (uploadedFiles.length > 0) {
        const formData = new FormData();
        uploadedFiles.forEach(file => formData.append('file', file));

        // Get auth token from localStorage
        const token = localStorage.getItem('token');
        
        // Upload each file to the backend
        const uploadPromises = uploadedFiles.map(async (file) => {
          const fileFormData = new FormData();
          fileFormData.append('file', file);

          const response = await fetch('http://localhost:3002/api/documents/upload', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${token}`,
            },
            body: fileFormData,
          });

          if (!response.ok) {
            throw new Error(`Failed to upload ${file.name}`);
          }

          const data = await response.json();
          return {
            type: 'document',
            documentId: data.documentId,
            fileName: file.name,
          };
        });

        attachments = await Promise.all(uploadPromises);
        
        // Clear uploaded files after successful upload
        setUploadedFiles([]);
      }

      // Add pasted images as attachments
      if (pastedImages.length > 0) {
        const imageAttachments = pastedImages.map(img => ({
          type: 'image',
          url: img.url,
        }));
        attachments = [...attachments, ...imageAttachments];
      }

      // Send message with attachments
      handleSendMessage(attachments.length > 0 ? attachments : undefined);
      
      // Clear pasted images
      pastedImages.forEach(img => URL.revokeObjectURL(img.url));
      setPastedImages([]);
      
    } catch (error) {
      console.error('Error uploading files:', error);
      alert('Failed to upload files. Please try again.');
    }
  };

  const truncateFileName = (name: string, maxLength: number = 14) => {
    if (name.length <= maxLength) return name;
    const ext = name.split('.').pop();
    const nameWithoutExt = name.substring(0, name.lastIndexOf('.'));
    const truncated = nameWithoutExt.substring(0, maxLength - (ext ? ext.length + 4 : 3));
    return `${truncated}...${ext ? '.' + ext : ''}`;
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

  return (
    <div className="w-full">
      <div className="relative bg-[#333537] rounded-3xl p-2 transition-colors focus-within:ring-2 focus-within:ring-[#4285f4]">
        {/* Hidden File Inputs */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*,application/pdf,.doc,.docx,.txt"
          multiple
          className="hidden"
          onChange={(e) => {
            const files = Array.from(e.target.files || []);
            setUploadedFiles(prev => [...prev, ...files].slice(0, 10));
            if (e.target) e.target.value = ''; // Reset input
          }}
        />
        <input
          ref={codeInputRef}
          type="file"
          accept=".js,.jsx,.ts,.tsx,.py,.java,.cpp,.c,.html,.css,.json,.xml"
          multiple
          className="hidden"
          onChange={(e) => {
            const files = Array.from(e.target.files || []);
            setUploadedFiles(prev => [...prev, ...files].slice(0, 10));
            if (e.target) e.target.value = ''; // Reset input
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
            {uploadedFiles.map((file, index) => (
              <div
                key={index}
                className="relative group flex items-center gap-2 bg-[#404040] text-[#e8eaed] text-sm px-3 py-2 rounded-lg"
              >
                <Paperclip size={14} />
                <span className="max-w-[150px] truncate">{file.name}</span>
                <button
                  onClick={() => {
                    setUploadedFiles(prev => prev.filter((_, i) => i !== index));
                  }}
                  className="ml-1 hover:text-red-400 transition-colors"
                >
                  <X size={14} />
                </button>
              </div>
            ))}
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

          {/* <div className="relative" ref={toolsMenuRef}>
            <button
              onClick={() => setShowToolsMenu(!showToolsMenu)}
              className="p-2 hover:bg-[#404040] rounded-full transition-colors mx-1"
            >
              <SlidersHorizontal size={20} className="text-[#9aa0a6]" />
            </button>
            {showToolsMenu && (
              <div className="absolute bottom-full left-0 mb-3 w-80 bg-[#282a2c] border border-[#333537] rounded-xl p-2 z-50 shadow-lg animate-fade-in">
                <div className="p-3 border-b border-[#333537] mb-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[#e8eaed] text-base font-medium">Tools</span>
                    <div className="bg-[#333537] text-[#9aa0a6] text-xs px-1.5 py-0.5 rounded">
                      {toolsOptions.length}
                    </div>
                  </div>
                </div>
                <div className="max-h-72 overflow-y-auto">
                  {toolsOptions.map((tool, index) => {
                    const Icon = iconMap[tool.icon as keyof typeof iconMap];
                    return (
                      <button
                        key={index}
                        className="w-full flex items-center gap-3 p-3 hover:bg-[#333537] rounded-lg transition-colors text-left"
                      >
                        <Icon size={20} className="text-[#9aa0a6]" />
                        <div className="flex-1">
                          <div className="text-[#e8eaed] text-sm font-medium mb-0.5">
                            {tool.title}
                          </div>
                          <div className="text-[#9aa0a6] text-xs leading-snug">
                            {tool.description}
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div> */}

          <textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            onPaste={handlePaste}
            placeholder="Ask IntelliChat"
            className="flex-1 bg-transparent text-[#e8eaed] outline-none border-none text-base placeholder:text-[#9aa0a6] resize-none focus:ring-0 focus:border-0 overflow-y-auto py-2"
            rows={1}
            disabled={disabled}
          />

          <div className="flex items-center gap-1 ml-2">
            <Tooltip>
              <TooltipTrigger asChild>
                <button className="p-2 hover:bg-[#404040] rounded-full transition-colors">
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
                    className="p-2 bg-[#4285f4] rounded-full transition-all duration-300 ease-in-out hover:bg-[#3367d6] animate-fade-in"
                    disabled={disabled}
                  >
                    <Send size={20} className="text-white" />
                  </button>
                </TooltipTrigger>
                <TooltipContent side="top">
                  <p>Send message</p>
                </TooltipContent>
              </Tooltip>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
