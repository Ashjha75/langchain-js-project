'use client';

import React, { useState, useEffect } from 'react';
import { useSearchParams, useParams } from 'next/navigation';
import { Sidebar } from '@/components/homepage/Sidebar';
import { ChatUI } from '@/components/chat/ChatUI';
import { getConversationById } from '@/lib/conversation';

export default function ChatPage() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const searchParams = useSearchParams();
  const params = useParams();
  const initialMessage = searchParams.get('message');
  const [conversation, setConversation] = useState(null);

  useEffect(() => {
    const fetchConversation = async () => {
      try {
        const data = await getConversationById(params.id as string);
        setConversation(data.conversation);
      } catch (error) {
        console.error('Failed to fetch conversation:', error);
      }
    };

    if (params.id) {
      fetchConversation();
    }
  }, [params.id]);

  const [runSettingsOpen, setRunSettingsOpen] = useState(false);

  return (
    <div className="bg-[#1b1c1d] text-[#e8eaed] h-screen flex font-sans">
      <Sidebar sidebarOpen={sidebarOpen} />
      <ChatUI
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        initialMessage={initialMessage}
        conversation={conversation}
        setRunSettingsOpen={setRunSettingsOpen}
      />
    </div>
  );
}
