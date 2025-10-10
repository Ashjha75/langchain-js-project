'use client';

import { FC, ReactNode } from 'react';
import RunSettingsSidebar from '@/components/RunSettingsSidebar';

interface ChatLayoutProps {
  children: ReactNode;
}

export const ChatLayout: FC<ChatLayoutProps> = ({ children }) => {
  return (
    <div className="flex h-screen bg-background">
      {/* Left Sidebar - Conversations */}
      <div className="w-64 bg-sidebar-background border-r border-sidebar-border">
        <div className="p-4">
          <h2 className="text-lg font-semibold text-sidebar-foreground">
            Conversations
          </h2>
        </div>
      </div>

      {/* Main chat area */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b border-gray-200 dark:border-gray-700">
          <h1 className="text-xl font-semibold">IntelliChat Pro</h1>
        </div>

        {/* Chat content */}
        <div className="flex-1 overflow-y-auto">
          {children}
        </div>
      </div>

      {/* Right Sidebar - Run Settings */}
      <RunSettingsSidebar />
    </div>
  );
};

export default ChatLayout;
