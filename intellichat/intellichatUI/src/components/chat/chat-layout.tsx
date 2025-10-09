'use client';

import { FC, ReactNode } from 'react';

interface ChatLayoutProps {
  children: ReactNode;
}

export const ChatLayout: FC<ChatLayoutProps> = ({ children }) => {
  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar - you can expand this later */}
      <div className="w-64 bg-sidebar-background border-r border-sidebar-border">
        <div className="p-4">
          <h2 className="text-lg font-semibold text-sidebar-foreground">Conversations</h2>
        </div>
      </div>
      
      {/* Main chat area */}
      <div className="flex-1 flex flex-col">
        {children}
      </div>
    </div>
  );
};

export default ChatLayout;