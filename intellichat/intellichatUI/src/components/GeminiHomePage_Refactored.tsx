'use client';

import React, { useState } from 'react';
import { Sidebar } from './homepage/Sidebar';
import { MainContent } from './homepage/MainContent';

export function GeminiHomePage() {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <div className="bg-[#1b1c1d] text-[#e8eaed] h-screen flex font-sans">
      <Sidebar sidebarOpen={sidebarOpen} />
      <MainContent sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
    </div>
  );
}
