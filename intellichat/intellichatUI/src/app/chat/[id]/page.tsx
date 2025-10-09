'use client';

import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { Sidebar } from '@/components/homepage/Sidebar';
import { ChatUI } from '@/components/chat/ChatUI';

export default function ChatPage() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const searchParams = useSearchParams();
  const initialMessage = searchParams.get('message');

  return (
    <div className="bg-[#1b1c1d] text-[#e8eaed] h-screen flex font-sans">
      <Sidebar sidebarOpen={sidebarOpen} />
      <ChatUI
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        initialMessage={initialMessage}
      />
    </div>
  );
}
