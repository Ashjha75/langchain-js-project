'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { MessageSquarePlus, Search, MoreVertical, Trash2, Edit } from 'lucide-react';
import { getConversations, deleteConversation, Conversation as ApiConversation } from '@/lib/chat-api';
import { Button } from '../ui/button';
import { ConfirmModal } from '../ui/confirm-modal';
import { useToast } from '../ui/toast';

interface Conversation {
  _id: string;
  title: string;
  model: string;
  lastMessageAt: string;
  messageCount: number;
}

interface ConversationSidebarProps {
  isOpen: boolean;
  currentConversationId?: string;
}

export function ConversationSidebar({ isOpen, currentConversationId }: ConversationSidebarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { showToast } = useToast();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [conversationToDelete, setConversationToDelete] = useState<string | null>(null);

  useEffect(() => {
    loadConversations();
  }, [pathname]);

  const loadConversations = async () => {
    try {
      setIsLoading(true);
      const data = await getConversations(1, 50);
      // Map API conversations to component format and filter out empty conversations
      const mappedConversations: Conversation[] = data.conversations
        .filter(conv => conv.messageCount > 0) // Only show conversations with messages
        .map(conv => ({
          _id: conv._id,
          title: conv.title,
          model: conv.model,
          lastMessageAt: conv.lastMessageAt || conv.createdAt,
          messageCount: conv.messageCount || 0,
        }));
      setConversations(mappedConversations);
    } catch (error) {
      console.error('Failed to load conversations:', error);
      showToast('Failed to load conversations', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleNewChat = () => {
    router.push('/chat/new');
  };

  const handleSelectConversation = (id: string) => {
    router.push(`/chat/${id}`);
  };

  const handleDeleteConversation = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setConversationToDelete(id);
    setDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!conversationToDelete) return;

    try {
      await deleteConversation(conversationToDelete);
      setConversations(prev => prev.filter(c => c._id !== conversationToDelete));
      showToast('Conversation deleted successfully', 'success');
      
      // If deleting current conversation, redirect to new chat
      if (conversationToDelete === currentConversationId) {
        router.push('/chat/new');
      }
    } catch (error) {
      console.error('Failed to delete conversation:', error);
      showToast('Failed to delete conversation', 'error');
    } finally {
      setDeleteModalOpen(false);
      setConversationToDelete(null);
    }
  };

  const filteredConversations = conversations.filter(conv =>
    conv.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  if (!isOpen) return null;

  return (
    <div className="w-72 bg-[#1b1c1d] border-r border-[#333537] flex flex-col h-screen">
      {/* Header */}
      <div className="p-3 border-b border-[#333537]">
        <Button
          onClick={handleNewChat}
          className="w-full bg-gradient-to-r from-[#4285f4] to-[#357ae8] hover:from-[#357ae8] hover:to-[#2b66d9] text-white rounded-lg py-2.5 px-4 flex items-center justify-center gap-2 transition-all shadow-lg hover:shadow-xl font-medium"
        >
          <MessageSquarePlus size={18} />
          <span>New Chat</span>
        </Button>
      </div>

      {/* Search */}
      <div className="p-3 border-b border-[#333537]">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#9aa0a6]" size={16} />
          <input
            type="text"
            placeholder="Search conversations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#2d2e30] text-[#e8eaed] rounded-lg pl-9 pr-3 py-2 text-sm placeholder:text-[#5f6368] focus:outline-none focus:ring-2 focus:ring-[#4285f4] focus:bg-[#333537] transition-all"
          />
        </div>
      </div>

      {/* Conversation List */}
      <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-[#333537] scrollbar-track-transparent">
        {isLoading ? (
          <div className="p-4 text-center text-[#9aa0a6] text-sm animate-pulse">
            Loading conversations...
          </div>
        ) : filteredConversations.length === 0 ? (
          <div className="p-6 text-center">
            <div className="text-[#9aa0a6] text-sm mb-2">
              {searchQuery ? 'No conversations found' : 'No conversations yet'}
            </div>
            {!searchQuery && (
              <div className="text-xs text-[#5f6368]">
                Start a new chat to begin
              </div>
            )}
          </div>
        ) : (
          <div className="py-2 px-2">
            {filteredConversations.map((conv) => (
              <div
                key={conv._id}
                onClick={() => handleSelectConversation(conv._id)}
                onMouseEnter={() => setHoveredId(conv._id)}
                onMouseLeave={() => setHoveredId(null)}
                className={`
                  px-3 py-2.5 mb-1.5 rounded-lg cursor-pointer transition-all group
                  ${conv._id === currentConversationId 
                    ? 'bg-[#2d2e30] border-l-2 border-[#4285f4] shadow-sm' 
                    : 'hover:bg-[#2d2e30] border-l-2 border-transparent'
                  }
                `}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="text-[#e8eaed] text-sm font-medium truncate mb-1.5">
                      {conv.title}
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-[#9aa0a6]">
                      <span className="truncate font-mono bg-[#1b1c1d] px-1.5 py-0.5 rounded">
                        {conv.model.split('/').pop()?.split('-').slice(0, 2).join('-') || conv.model}
                      </span>
                      <span className="text-[#5f6368]">•</span>
                      <span>{formatDate(conv.lastMessageAt)}</span>
                    </div>
                    <div className="text-xs text-[#5f6368] mt-1.5 flex items-center gap-1">
                      <span>{conv.messageCount} msg{conv.messageCount !== 1 ? 's' : ''}</span>
                    </div>
                  </div>
                  {hoveredId === conv._id && (
                    <button
                      onClick={(e) => handleDeleteConversation(conv._id, e)}
                      className="p-1.5 hover:bg-[#3d3e40] rounded transition-colors opacity-0 group-hover:opacity-100"
                      aria-label="Delete conversation"
                    >
                      <Trash2 size={14} className="text-[#9aa0a6] hover:text-red-400" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="p-3 border-t border-[#333537] bg-[#1b1c1d]">
        <div className="text-xs text-[#5f6368] text-center font-medium">
          {conversations.length} conversation{conversations.length !== 1 ? 's' : ''}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={confirmDelete}
        title="Delete Conversation"
        message="Are you sure you want to delete this conversation? This action cannot be undone."
        variant="danger"
      />
    </div>
  );
}
