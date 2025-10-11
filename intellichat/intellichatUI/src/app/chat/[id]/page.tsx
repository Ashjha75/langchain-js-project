'use client';

import React, { useState, useEffect } from 'react';
import { useSearchParams, useParams } from 'next/navigation';
import { ConversationSidebar } from '@/components/chat/ConversationSidebar';
import { ChatUI } from '@/components/chat/ChatUI';
import { RunSettingsSidebar } from '@/components/RunSettingsSidebar';
import { setToastFunction } from '@/lib/chat-api';
import { useToast } from '@/components/ui/toast';

export default function ChatPage() {
  const [conversationSidebarOpen, setConversationSidebarOpen] = useState(true);
  const [configSidebarOpen, setConfigSidebarOpen] = useState(false);
  const searchParams = useSearchParams();
  const params = useParams();
  const initialMessage = searchParams.get('message');
  const { showToast } = useToast();

  // Connect toast to chat-api
  useEffect(() => {
    setToastFunction(showToast);
  }, [showToast]);

  return (
    <div className="bg-[#1b1c1d] text-[#e8eaed] h-screen flex font-sans">
      <ConversationSidebar 
        isOpen={conversationSidebarOpen}
        currentConversationId={params.id as string}
      />
      <ChatUI
        sidebarOpen={conversationSidebarOpen}
        setSidebarOpen={setConversationSidebarOpen}
        initialMessage={initialMessage}
        conversationId={params.id as string}
        setRunSettingsOpen={setConfigSidebarOpen}
      />
      <RunSettingsSidebar 
        isOpen={configSidebarOpen}
        onClose={() => setConfigSidebarOpen(false)}
      />
    </div>
  );
}
