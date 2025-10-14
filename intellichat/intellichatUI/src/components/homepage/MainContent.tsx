'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Menu, X, Settings } from 'lucide-react';
import { Logo } from '@/components/ui/Logo';
import { suggestionCards } from './data';
import { SuggestionCard } from './SuggestionCard';
import { ChatInput } from './ChatInput';

import { Button } from '../ui/button';

interface MainContentProps {
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  setRunSettingsOpen: (open: boolean) => void;
}

export function MainContent({ sidebarOpen, setSidebarOpen, setRunSettingsOpen }: MainContentProps) {
  const [input, setInput] = useState('');
  const router = useRouter();

  const handleSuggestionClick = (suggestion: { title: string; subtitle: string }) => {
    const query = `${suggestion.title} ${suggestion.subtitle}`;
    setInput(query);
    handleSendMessage([]);
  };

  const handleSendMessage = (attachments?: any[]) => {
    // If attachments is provided (could be empty array or array with items), use input text
    // Otherwise, for backwards compatibility, treat first param as message string
    const messageToSend = input;
    
    if (messageToSend.trim() || (attachments && attachments.length > 0)) {
      const chatId = Date.now().toString();
      const params = new URLSearchParams();
      
      if (messageToSend.trim()) {
        params.set('message', messageToSend);
      }
      
      if (attachments && attachments.length > 0) {
        params.set('attachments', JSON.stringify(attachments));
      }
      
      router.push(`/chat/${chatId}?${params.toString()}`);
    }
  };

  return (
    <div className="flex-1 flex flex-col bg-[#212121]">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-[#333537]">
        <div className="flex items-center gap-4">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 rounded-lg hover:bg-[#333537] transition-colors"
          >
            {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
          <Logo size="sm" showText={true} />
        </div>

        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => setRunSettingsOpen(true)} className="flex items-center gap-2">
            <Settings size={16} />
            Settings
          </Button>
          {/* <ModelSelector /> */}
          {/* <button className="p-2 rounded-lg hover:bg-[#333537] transition-colors">
            <div className="w-8 h-8 rounded-full bg-[#4285f4] flex items-center justify-center text-white font-semibold text-sm">
              A
            </div>
          </button> */}
        </div>
      </div>

      {/* Welcome Content */}
      <div className="flex-1 flex flex-col items-center p-8 max-w-4xl mx-auto w-full overflow-y-auto">
        <div className="flex-1 flex flex-col items-center justify-center w-full">
          <div className="text-center mb-12">
            <div className="mb-8 flex justify-center">
              <Logo size="xl" variant="icon" className="opacity-80" />
            </div>
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
        </div>

        {/* Chat Input - Anchored at bottom */}
        <div className="w-full max-w-3xl pb-4">
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
