'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Send, Mic, Plus, X, Paperclip, Code, Bot } from 'lucide-react';

const assetOptions = [
  { id: 'upload', icon: Paperclip, label: 'Upload files' },
  { id: 'drive', icon: Bot, label: 'Add from Drive' },
  { id: 'code', icon: Code, label: 'Import code' },
];

interface ChatInputProps {
  input: string;
  setInput: (value: string) => void;
  handleSendMessage: () => void;
}

export function ChatInput({ input, setInput, handleSendMessage }: ChatInputProps) {
  const [showAssetMenu, setShowAssetMenu] = useState(false);
  const [selectedAssets, setSelectedAssets] = useState<string[]>([]);
  const assetMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (assetMenuRef.current && !assetMenuRef.current.contains(event.target as Node)) {
        setShowAssetMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const toggleAsset = (assetId: string) => {
    setSelectedAssets((prev) =>
      prev.includes(assetId) ? prev.filter((id) => id !== assetId) : [...prev, assetId]
    );
    setShowAssetMenu(false);
  };

  return (
    <div className="w-full">
      <div className="relative bg-[#333537] rounded-3xl p-2 transition-colors focus-within:ring-2 focus-within:ring-[#4285f4]">
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
        <div className="flex items-center">
          <div className="relative" ref={assetMenuRef}>
            <button
              onClick={() => setShowAssetMenu(!showAssetMenu)}
              className="p-2 hover:bg-[#404040] rounded-full transition-colors mx-1"
            >
              <Plus size={20} className="text-[#9aa0a6]" />
            </button>
            {showAssetMenu && (
              <div className="absolute bottom-full left-0 mb-3 w-64 bg-[#282a2c] border border-[#333537] rounded-xl p-2 z-50 shadow-lg animate-fade-in">
                {assetOptions.map((asset) => {
                  const Icon = asset.icon;
                  const isSelected = selectedAssets.includes(asset.id);
                  return (
                    <button
                      key={asset.id}
                      onClick={() => toggleAsset(asset.id)}
                      disabled={isSelected}
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

          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ask IntelliChat"
            className="flex-1 bg-transparent text-[#e8eaed] outline-none border-none text-base placeholder:text-[#9aa0a6]"
          />

          <div className="flex items-center gap-1 ml-2">
            <button className="p-2 hover:bg-[#404040] rounded-full transition-colors">
              <Mic size={20} className="text-[#9aa0a6]" />
            </button>
            <button
              onClick={() => handleSendMessage()}
              disabled={!input.trim()}
              className="p-2 bg-[#4285f4] rounded-full transition-colors disabled:bg-gray-500 disabled:cursor-not-allowed hover:bg-[#3367d6]"
            >
              <Send size={20} className="text-white" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
