'use client';

import React, { useState, useEffect } from 'react';
import { ConversationSidebar } from './chat/ConversationSidebar';
import { MainContent } from './homepage/MainContent';
import { RunSettingsSidebar } from './RunSettingsSidebar';
import { setToastFunction } from '@/lib/chat-api';
import { useToast } from './ui/toast';


export function GeminiHomePage() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [runSettingsOpen, setRunSettingsOpen] = useState(true);
  const { showToast } = useToast();

  // Connect toast to chat-api
  useEffect(() => {
    setToastFunction(showToast);
  }, [showToast]);

  return (
    <div className="bg-[#1b1c1d] text-[#e8eaed] h-screen flex font-sans relative">
      <ConversationSidebar isOpen={sidebarOpen} />
      <MainContent
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        setRunSettingsOpen={setRunSettingsOpen}
      />
      <RunSettingsSidebar isOpen={runSettingsOpen} onClose={() => setRunSettingsOpen(false)} />
    </div>
  );
}
