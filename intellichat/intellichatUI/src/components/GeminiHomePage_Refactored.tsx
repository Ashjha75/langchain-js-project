'use client';

import React, { useState } from 'react';
import { ConversationSidebar } from './chat/ConversationSidebar';
import { MainContent } from './homepage/MainContent';
import { RunSettingsSidebar } from './RunSettingsSidebar';


export function GeminiHomePage() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [runSettingsOpen, setRunSettingsOpen] = useState(true);

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
