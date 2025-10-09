'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Menu, X } from 'lucide-react';
import { ModelSelector } from '../ModelSelector_Fixed';
import { suggestionCards } from './data';
import { SuggestionCard } from './SuggestionCard';
import { ChatInput } from './ChatInput';

interface MainContentProps {
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
}

export function MainContent({ sidebarOpen, setSidebarOpen }: MainContentProps) {
  const [input, setInput] = useState('');
  const router = useRouter();

  const handleSuggestionClick = (suggestion: { title: string; subtitle: string }) => {
    const query = `${suggestion.title} ${suggestion.subtitle}`;
    setInput(query);
    handleSendMessage(query);
  };

  const handleSendMessage = (message?: string) => {
    const messageToSend = message || input;
    if (messageToSend.trim()) {
      const chatId = Date.now().toString();
      router.push(`/chat/${chatId}?message=${encodeURIComponent(messageToSend)}`);
    }
  };

  return (
    <div className="flex-1 flex flex-col bg-[#1b1c1d]">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-[#333537]">
        <div className="flex items-center gap-4">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 rounded-lg hover:bg-[#333537] transition-colors"
          >
            {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
          <div className="flex items-center gap-2">
            <h1 className="text-[#e8eaed] text-xl font-semibold">IntelliChat</h1>
            <span className="text-xs px-2 py-0.5 bg-[#4285f4] text-white rounded-full">
              PRO
            </span>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <ModelSelector />
          <button className="p-2 rounded-lg hover:bg-[#333537] transition-colors">
            <div className="w-8 h-8 rounded-full bg-[#4285f4] flex items-center justify-center text-white font-semibold text-sm">
              A
            </div>
          </button>
        </div>
      </div>

      {/* Welcome Content */}
      <div className="flex-1 flex flex-col items-center justify-center p-8 max-w-4xl mx-auto w-full">
        <div className="text-center mb-12">
          <h2 className="text-5xl font-light mb-4">
            <span className="text-[#e8eaed]">Hello, </span>
            <span className="text-[#4285f4]">Ashish</span>
          </h2>
          <p className="text-[#9aa0a6] text-xl">How can I help you today?</p>
        </div>

        {/* Suggestion Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-3xl mb-12">
          {suggestionCards.map((card, index) => (
            <SuggestionCard key={index} card={card} onClick={handleSuggestionClick} />
          ))}
        </div>

        {/* Chat Input */}
        <div className="w-full max-w-3xl">
          <ChatInput
            input={input}
            setInput={setInput}
            handleSendMessage={handleSendMessage}
          />
        </div>
      </div>
    </div>
  );
}
