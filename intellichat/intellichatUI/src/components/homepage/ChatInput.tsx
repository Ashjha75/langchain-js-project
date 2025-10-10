'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Send, Mic, Plus, X, Paperclip, Code, Bot, SlidersHorizontal, Search, Video, Image, PenSquare, BookOpen } from 'lucide-react';
import { toolsOptions } from './data';
import { SimpleTooltip } from '../ui/tooltip';

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
  handleSendMessage: () => void;
}

export function ChatInput({ input, setInput, handleSendMessage }: ChatInputProps) {
  const [showAssetMenu, setShowAssetMenu] = useState(false);
  const [showToolsMenu, setShowToolsMenu] = useState(false);
  const [selectedAssets, setSelectedAssets] = useState<string[]>([]);
  const [pastedImages, setPastedImages] = useState<Array<{ id: string; url: string; file: File }>>([]);
  const [uploadedFiles, setUploadedFiles] = useState<Array<{ id: string; name: string; url: string; file: File; type: string }>>([]);
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
      handleSendMessage();
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

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const newFiles: Array<{ id: string; name: string; url: string; file: File; type: string }> = [];
    
    for (let i = 0; i < Math.min(files.length, 10 - uploadedFiles.length); i++) {
      const file = files[i];
      if (!file) continue;
      
      const id = Date.now().toString() + i;
      const url = URL.createObjectURL(file);
      const type = file.type.startsWith('image/') ? 'image' : 'file';
      
      newFiles.push({ id, name: file.name, url, file, type });
    }

    setUploadedFiles((prev) => [...prev, ...newFiles].slice(0, 10));
    setShowAssetMenu(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleCodeUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const newFiles: Array<{ id: string; name: string; url: string; file: File; type: string }> = [];
    
    for (let i = 0; i < Math.min(files.length, 10 - uploadedFiles.length); i++) {
      const file = files[i];
      if (!file) continue;
      
      const id = Date.now().toString() + i;
      const url = URL.createObjectURL(file);
      
      newFiles.push({ id, name: file.name, url, file, type: 'code' });
    }

    setUploadedFiles((prev) => [...prev, ...newFiles].slice(0, 10));
    setShowAssetMenu(false);
    if (codeInputRef.current) {
      codeInputRef.current.value = '';
    }
  };

  const removeFile = (id: string) => {
    setUploadedFiles((prev) => {
      const file = prev.find((f) => f.id === id);
      if (file) {
        URL.revokeObjectURL(file.url);
      }
      return prev.filter((f) => f.id !== id);
    });
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
          onChange={handleFileUpload}
          className="hidden"
        />
        <input
          ref={codeInputRef}
          type="file"
          accept=".js,.jsx,.ts,.tsx,.py,.java,.cpp,.c,.html,.css,.json,.xml"
          multiple
          onChange={handleCodeUpload}
          className="hidden"
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
          <div className="flex flex-wrap gap-2 p-2 mb-2">
            {uploadedFiles.map((file) => (
              <div key={file.id} className="relative group">
                {file.type === 'image' ? (
                  <>
                    <img
                      src={file.url}
                      alt={file.name}
                      className="w-20 h-20 object-cover rounded-lg border border-[#404040]"
                    />
                    <button
                      onClick={() => removeFile(file.id)}
                      className="absolute -top-2 -right-2 bg-[#282a2c] border border-[#404040] rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X size={14} className="text-[#e8eaed]" />
                    </button>
                  </>
                ) : (
                  <div className="flex items-center gap-2 bg-[#404040] text-[#e8eaed] text-sm px-3 py-1.5 rounded-lg pr-8">
                    <Paperclip size={14} />
                    <span>{truncateFileName(file.name)}</span>
                    <button
                      onClick={() => removeFile(file.id)}
                      className="absolute right-2 top-1/2 -translate-y-1/2"
                    >
                      <X size={14} className="text-[#9aa0a6] hover:text-[#e8eaed]" />
                    </button>
                  </div>
                )}
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
            <SimpleTooltip content="Add files or code" side="top">
              <button
                onClick={() => setShowAssetMenu(!showAssetMenu)}
                className="p-2 hover:bg-[#404040] rounded-full transition-colors mx-1"
              >
                <Plus size={20} className="text-[#9aa0a6]" />
              </button>
            </SimpleTooltip>
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
          />

          <div className="flex items-center gap-1 ml-2">
            <SimpleTooltip content="Voice input" side="top">
              <button className="p-2 hover:bg-[#404040] rounded-full transition-colors">
                <Mic size={20} className="text-[#9aa0a6]" />
              </button>
            </SimpleTooltip>
            {input.trim() && (
              <SimpleTooltip content="Send message" side="top">
                <button
                  onClick={() => handleSendMessage()}
                  className="p-2 bg-[#4285f4] rounded-full transition-all duration-300 ease-in-out hover:bg-[#3367d6] animate-fade-in"
                >
                  <Send size={20} className="text-white" />
                </button>
              </SimpleTooltip>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
