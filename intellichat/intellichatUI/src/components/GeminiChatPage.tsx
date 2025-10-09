'use client';

import { useState, useRef, useEffect } from 'react';
import { 
  MenuIcon, 
  SearchIcon, 
  PlusIcon, 
  MicIcon,
  PaperclipIcon,
  SendIcon,
  SettingsIcon,
  MessageSquareIcon,
  UserIcon,
  BotIcon,
  MoreVerticalIcon
} from 'lucide-react';

interface Message {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: Date;
}

const recentChats = [
  "Project planning discussion",
  "Code review and debugging", 
  "Creative writing session",
  "Data analysis help",
  "Travel itinerary creation",
  "Recipe suggestions",
  "Learning new concepts",
  "Problem solving session"
];

interface GeminiChatPageProps {
  conversationId?: string;
}

export default function GeminiChatPage({ conversationId }: GeminiChatPageProps) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [inputValue, setInputValue] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content: inputValue,
      role: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsTyping(true);

    // Simulate AI response
    setTimeout(() => {
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: `I understand you're asking about: "${userMessage.content}". This is a simulated response. In a real implementation, this would be connected to your AI backend.`,
        role: 'assistant',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, aiMessage]);
      setIsTyping(false);
    }, 1500);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="flex h-screen bg-[#0d1117] text-white">
      {/* Sidebar */}
      <div className={`${sidebarOpen ? 'w-64' : 'w-0'} transition-all duration-300 bg-[#161b22] border-r border-[#21262d] overflow-hidden`}>
        <div className="p-4">
          {/* New Chat Button */}
          <button className="w-full flex items-center gap-3 p-3 rounded-xl bg-[#21262d] hover:bg-[#2d333b] transition-colors group">
            <PlusIcon className="w-5 h-5" />
            <span className="font-medium">New chat</span>
          </button>
          
          {/* Search */}
          <div className="mt-4 relative">
            <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input 
              type="text" 
              placeholder="Search"
              className="w-full pl-10 pr-4 py-2 bg-[#0d1117] border border-[#21262d] rounded-lg text-sm focus:outline-none focus:border-[#1f6feb]"
            />
          </div>

          {/* Recent Section */}
          <div className="mt-6">
            <h3 className="text-sm font-medium text-gray-400 mb-3">Recent</h3>
            <div className="space-y-1">
              {recentChats.map((chat, index) => (
                <button
                  key={index}
                  className={`w-full text-left p-2 rounded-lg hover:bg-[#21262d] transition-colors text-sm truncate ${
                    index === 0 ? 'bg-[#21262d] text-white' : 'text-gray-300'
                  }`}
                >
                  {chat}
                </button>
              ))}
            </div>
          </div>
        </div>
        
        {/* Settings at bottom */}
        <div className="absolute bottom-4 left-4 right-4">
          <button className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-[#21262d] transition-colors">
            <SettingsIcon className="w-5 h-5" />
            <span className="text-sm">Settings & help</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="flex items-center justify-between p-4 border-b border-[#21262d]">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 rounded-lg hover:bg-[#21262d] transition-colors"
            >
              <MenuIcon className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-semibold">IntelliChat</h1>
              <span className="px-2 py-1 text-xs bg-[#1f6feb] rounded-full">Pro</span>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <button className="p-2 rounded-lg hover:bg-[#21262d] transition-colors">
              <MoreVerticalIcon className="w-5 h-5" />
            </button>
          </div>
        </header>

        {/* Chat Messages */}
        <div className="flex-1 overflow-y-auto">
          {messages.length === 0 ? (
            // Empty state
            <div className="flex flex-col items-center justify-center h-full p-8">
              <div className="text-center mb-8">
                <h1 className="text-4xl font-light mb-2">
                  Hello, <span className="text-[#1f6feb]">Ashish</span>
                </h1>
                <p className="text-xl text-gray-400">How can I help you today?</p>
              </div>
            </div>
          ) : (
            // Messages
            <div className="max-w-4xl mx-auto p-4 space-y-6">
              {messages.map((message) => (
                <div key={message.id} className="flex gap-4">
                  <div className="flex-shrink-0">
                    {message.role === 'user' ? (
                      <div className="w-8 h-8 bg-[#1f6feb] rounded-full flex items-center justify-center">
                        <UserIcon className="w-4 h-4 text-white" />
                      </div>
                    ) : (
                      <div className="w-8 h-8 bg-[#21262d] rounded-full flex items-center justify-center">
                        <BotIcon className="w-4 h-4 text-gray-300" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="text-gray-300 text-sm mb-1">
                      {message.role === 'user' ? 'You' : 'IntelliChat'}
                    </div>
                    <div className="text-white whitespace-pre-wrap">
                      {message.content}
                    </div>
                  </div>
                </div>
              ))}
              
              {isTyping && (
                <div className="flex gap-4">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-[#21262d] rounded-full flex items-center justify-center">
                      <BotIcon className="w-4 h-4 text-gray-300" />
                    </div>
                  </div>
                  <div className="flex-1">
                    <div className="text-gray-300 text-sm mb-1">IntelliChat</div>
                    <div className="flex items-center gap-1">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse"></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse delay-75"></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse delay-150"></div>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Chat Input */}
        <div className="p-4 border-t border-[#21262d]">
          <div className="max-w-4xl mx-auto">
            <div className="relative">
              <div className="flex items-center gap-2 p-4 bg-[#161b22] border border-[#21262d] rounded-2xl focus-within:border-[#1f6feb] transition-colors">
                <button className="p-2 hover:bg-[#21262d] rounded-lg transition-colors">
                  <PaperclipIcon className="w-5 h-5 text-gray-400" />
                </button>
                
                <textarea
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Ask IntelliChat"
                  className="flex-1 bg-transparent outline-none text-white placeholder-gray-400 resize-none max-h-32"
                  rows={1}
                />
                
                <div className="flex items-center gap-2">
                  <button className="p-2 hover:bg-[#21262d] rounded-lg transition-colors">
                    <MicIcon className="w-5 h-5 text-gray-400" />
                  </button>
                  
                  {inputValue && (
                    <button 
                      onClick={handleSendMessage}
                      className="p-2 bg-[#1f6feb] hover:bg-[#1f6feb]/80 rounded-lg transition-colors"
                    >
                      <SendIcon className="w-5 h-5 text-white" />
                    </button>
                  )}
                </div>
              </div>
              
              {/* Tools button */}
              <div className="absolute -bottom-2 left-6">
                <button className="flex items-center gap-2 px-3 py-1 bg-[#161b22] border border-[#21262d] rounded-full text-sm text-gray-400 hover:text-white transition-colors">
                  <div className="w-4 h-4 grid grid-cols-2 gap-0.5">
                    <div className="w-1.5 h-1.5 bg-current rounded-sm"></div>
                    <div className="w-1.5 h-1.5 bg-current rounded-sm"></div>
                    <div className="w-1.5 h-1.5 bg-current rounded-sm"></div>
                    <div className="w-1.5 h-1.5 bg-current rounded-sm"></div>
                  </div>
                  Tools
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}