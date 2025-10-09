'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Search, Clock, Settings } from 'lucide-react';
import { Logo } from '@/components/ui/Logo';
import { recentChats } from './data';

interface SidebarProps {
  sidebarOpen: boolean;
}

export function Sidebar({ sidebarOpen }: SidebarProps) {
  const router = useRouter();

  return (
    <div
      className={`bg-[#282a2c] transition-all duration-300 ease-in-out border-r border-[#333537] ${
        sidebarOpen ? 'w-64' : 'w-0'
      } overflow-hidden`}
    >
      <div className="flex flex-col h-full p-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <Logo size="sm" showText={true} />
          <span className="text-xs px-2 py-0.5 bg-[#4285f4] text-white rounded-full">
            Pro
          </span>
                PRO
              </span>
            </div>
          </div>
        </div>

        {/* New Chat Button */}
        <button
          onClick={() => router.push('/chat/new')}
          className="flex items-center gap-3 w-full px-3 py-3 rounded-lg border border-[#333537] text-[#e8eaed] hover:bg-[#333537] transition-colors mb-4"
        >
          <Plus size={20} />
          <span>New chat</span>
        </button>

        {/* Search */}
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9aa0a6]" />
          <input
            type="text"
            placeholder="Search"
            className="w-full pl-10 pr-4 py-2 rounded-lg bg-[#333537] border border-[#333537] text-[#e8eaed] focus:outline-none focus:ring-2 focus:ring-[#4285f4]"
          />
        </div>

        {/* Recent Chats */}
        <div className="flex-1 overflow-y-auto">
          <div className="mb-4">
            <h3 className="text-[#9aa0a6] text-sm font-medium mb-2">Recent</h3>
            <div className="flex flex-col gap-1">
              {recentChats.map((chat, index) => (
                <button
                  key={index}
                  className="w-full text-left px-2 py-2 rounded-lg text-[#e8eaed] text-sm hover:bg-[#333537] transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <Clock size={16} className="text-[#9aa0a6]" />
                    <span className="truncate">{chat}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Settings */}
        <div className="pt-4 border-t border-[#333537]">
          <button className="flex items-center gap-3 w-full px-2 py-2 rounded-lg text-[#e8eaed] hover:bg-[#333537] transition-colors">
            <Settings size={20} />
            <span>Settings & help</span>
          </button>
        </div>
      </div>
    </div>
  );
}
