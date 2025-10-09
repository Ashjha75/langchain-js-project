'use client';

import { useState } from 'react';
import { 
  MenuIcon, 
  SearchIcon, 
  PlusIcon, 
  MicIcon,
  PaperclipIcon,
  SendIcon,
  SettingsIcon,
  MessageSquareIcon
} from 'lucide-react';
import { ModelSelector } from './ModelSelector';

interface SuggestionCard {
  title: string;
  description: string;
  icon: string;
}

const suggestionCards: SuggestionCard[] = [
  {
    title: "Plan a trip",
    description: "Create a detailed itinerary for a weekend getaway",
    icon: "🗺️"
  },
  {
    title: "Write code",
    description: "Help me build a responsive web component",
    icon: "💻"
  },
  {
    title: "Analyze data",
    description: "Review this spreadsheet and find insights",
    icon: "📊"
  },
  {
    title: "Creative writing",
    description: "Write a short story about space exploration",
    icon: "✍️"
  }
];

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

export default function GeminiHomePage() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [inputValue, setInputValue] = useState('');

  const handleSuggestionClick = (suggestion: SuggestionCard) => {
    setInputValue(suggestion.description);
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
                  className="w-full text-left p-2 rounded-lg hover:bg-[#21262d] transition-colors text-sm text-gray-300 truncate"
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
            <ModelSelector />
            <button className="p-2 rounded-lg hover:bg-[#21262d] transition-colors">
              <MessageSquareIcon className="w-5 h-5" />
            </button>
          </div>
        </header>

        {/* Main Chat Area */}
        <main className="flex-1 flex flex-col items-center justify-center p-8">
          {/* Welcome Message */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-light mb-2">
              Hello, <span className="text-[#1f6feb]">Ashish</span>
            </h1>
            <p className="text-xl text-gray-400">What should we do today?</p>
          </div>

          {/* Suggestion Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8 max-w-4xl w-full">
            {suggestionCards.map((card, index) => (
              <button
                key={index}
                onClick={() => handleSuggestionClick(card)}
                className="p-6 bg-[#161b22] border border-[#21262d] rounded-2xl hover:border-[#1f6feb] transition-all duration-200 text-left group"
              >
                <div className="flex items-start gap-4">
                  <span className="text-2xl">{card.icon}</span>
                  <div>
                    <h3 className="font-medium text-white mb-2">{card.title}</h3>
                    <p className="text-sm text-gray-400">{card.description}</p>
                  </div>
                </div>
              </button>
            ))}
          </div>

          {/* Chat Input */}
          <div className="w-full max-w-4xl">
            <div className="relative">
              <div className="flex items-center gap-2 p-4 bg-[#161b22] border border-[#21262d] rounded-2xl focus-within:border-[#1f6feb] transition-colors">
                <button className="p-2 hover:bg-[#21262d] rounded-lg transition-colors">
                  <PaperclipIcon className="w-5 h-5 text-gray-400" />
                </button>
                
                <input
                  type="text"
                  placeholder="Ask IntelliChat"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  className="flex-1 bg-transparent outline-none text-white placeholder-gray-400"
                />
                
                <div className="flex items-center gap-2">
                  <button className="p-2 hover:bg-[#21262d] rounded-lg transition-colors">
                    <MicIcon className="w-5 h-5 text-gray-400" />
                  </button>
                  
                  {inputValue && (
                    <button className="p-2 bg-[#1f6feb] hover:bg-[#1f6feb]/80 rounded-lg transition-colors">
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

          {/* Footer disclaimer */}
          <p className="text-xs text-gray-500 mt-6 text-center max-w-2xl">
            IntelliChat can make mistakes. Consider checking important information.
          </p>
        </main>
      </div>
    </div>
  );
}