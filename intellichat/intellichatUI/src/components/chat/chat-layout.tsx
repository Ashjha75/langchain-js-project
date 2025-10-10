'use client';

import { FC, ReactNode, useState } from 'react';
import { Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ConfigSidebar } from '@/components/ConfigSidebar';

interface ChatLayoutProps {
  children: ReactNode;
}

export const ChatLayout: FC<ChatLayoutProps> = ({ children }) => {
  const [isConfigOpen, setIsConfigOpen] = useState(false);

  return (
    <div className="flex h-screen bg-background relative">
      {/* Left Sidebar - Conversations */}
      <div className="w-64 bg-sidebar-background border-r border-sidebar-border">
        <div className="p-4">
          <h2 className="text-lg font-semibold text-sidebar-foreground">Conversations</h2>
        </div>
      </div>
      
      {/* Main chat area */}
      <div className="flex-1 flex flex-col">
        {/* Header with settings button */}
        <div className="flex justify-between items-center p-4 border-b border-gray-200 dark:border-gray-700">
          <h1 className="text-xl font-semibold">IntelliChat Pro</h1>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsConfigOpen(true)}
            className="flex items-center gap-2"
          >
            <Settings className="w-4 h-4" />
            Settings
          </Button>
        </div>
        
        {/* Chat content */}
        <div className="flex-1">
          {children}
        </div>
      </div>

      {/* Configuration Sidebar */}
      <ConfigSidebar
        isOpen={isConfigOpen}
        onClose={() => setIsConfigOpen(false)}
      />
    </div>
  );
};

export default ChatLayout;