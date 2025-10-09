'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Send, Mic, Paperclip } from 'lucide-react';
import { toolsOptions } from './data';

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
        <div className="flex items-center bg-[#333537] border border-[#333537] rounded-3xl p-4 transition-colors">
          <button className="p-2 hover:bg-[#404040] rounded-lg transition-colors mr-2">
            <Paperclip size={20} className="text-[#9aa0a6]" />
          </button>

          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ask IntelliChat"
            className="flex-1 bg-transparent text-[#e8eaed] outline-none border-none text-base"
          />

          <div className="flex items-center gap-2 ml-2">
            <button className="p-2 hover:bg-[#404040] rounded-lg transition-colors">
              <Mic size={20} className="text-[#9aa0a6]" />
            </button>
            <button
              onClick={() => handleSendMessage()}
              disabled={!input.trim()}
              className="p-2 bg-[#4285f4] rounded-lg transition-colors disabled:bg-gray-500 disabled:cursor-not-allowed hover:bg-[#3367d6]"
            >
              <Send size={20} className="text-white" />
            </button>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-center mt-4 gap-4">
        <div className="relative" ref={toolsRef}>
          <button
            onClick={() => setShowTools(!showTools)}
            className="flex items-center gap-2 text-sm text-[#9aa0a6] bg-transparent px-3 py-2 rounded-lg hover:bg-[#333537] transition-colors"
          >
            <div className="w-4 h-4 rounded bg-gradient-to-r from-red-500 to-yellow-500"></div>
            <span>Tools</span>
          </button>

          {showTools && (
            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 min-w-[320px] bg-[#282a2c] border border-[#333537] rounded-xl p-2 z-50 shadow-lg animate-fade-in">
              <div className="p-3 border-b border-[#333537] mb-2">
                <div className="flex items-center justify-between">
                  <span className="text-[#e8eaed] text-base font-medium">Tools</span>
                  <div className="bg-[#333537] text-[#9aa0a6] text-xs px-1.5 py-0.5 rounded">
                    {toolsOptions.length}
                  </div>
                </div>
              </div>

              <div className="max-h-72 overflow-y-auto">
                {toolsOptions.map((tool, index) => (
                  <button
                    key={index}
                    className="w-full flex items-center gap-3 p-3 hover:bg-[#333537] rounded-lg transition-colors text-left"
                  >
                    <span className="text-xl">{tool.icon}</span>
                    <div className="flex-1">
                      <div className="text-[#e8eaed] text-sm font-medium mb-0.5">
                        {tool.title}
                      </div>
                      <div className="text-[#9aa0a6] text-xs leading-snug">
                        {tool.description}
                      </div>
                    </div>
                  </button>
                ))}
              </div>

              <div className="absolute bottom-[-5px] left-1/2 w-3 h-3 bg-[#282a2c] border border-[#333537] border-t-0 border-l-0 transform -translate-x-1/2 rotate-45"></div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
