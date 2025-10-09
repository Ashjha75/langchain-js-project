'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Send, Mic, Paperclip, Search, Video, Image, PenSquare, BookOpen, SlidersHorizontal } from 'lucide-react';
import { toolsOptions } from './data';

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
  const [showTools, setShowTools] = useState(false);
  const toolsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (toolsRef.current && !toolsRef.current.contains(event.target as Node)) {
        setShowTools(false);
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

  return (
    <div className="w-full">
      <div className="relative">
        <div className="flex items-center bg-[#333537] border border-transparent rounded-3xl p-2 transition-colors focus-within:ring-2 focus-within:ring-[#4285f4]">
          <div className="relative" ref={toolsRef}>
            <button
              onClick={() => setShowTools(!showTools)}
              className="flex items-center gap-2 text-sm text-[#9aa0a6] bg-transparent px-3 py-2 rounded-full hover:bg-[#404040] transition-colors"
            >
              <SlidersHorizontal size={20} />
              <span>Tools</span>
            </button>
            {showTools && (
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
          </div>

          <button className="p-2 hover:bg-[#404040] rounded-full transition-colors mx-1">
            <Paperclip size={20} className="text-[#9aa0a6]" />
          </button>

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
