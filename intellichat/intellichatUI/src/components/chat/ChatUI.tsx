'use client';

import React, { useState, useEffect } from 'react';
import { Menu, X } from 'lucide-react';
import { ModelSelector } from '../ModelSelector_Fixed';
import { ChatInput } from '../homepage/ChatInput';
import { MessageList } from './MessageList';
import { Message } from './types';

interface ChatUIProps {
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  initialMessage: string | null;
}

const mockAiResponse = `
### Understanding React Hooks

React Hooks are functions that let you “hook into” React state and lifecycle features from function components. Here are some of the most common ones:

- **\`useState\`**:  Manages state in a component.
- **\`useEffect\`**:  Performs side effects (e.g., data fetching, subscriptions).
- **\`useContext\`**:  Accesses context directly without passing props down.

#### Code Example:

\`\`\`javascript
import React, { useState, useEffect } from 'react';

function Timer() {
  const [seconds, setSeconds] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setSeconds(s => s + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  return <p>You've been on this page for {seconds} seconds.</p>;
}
\`\`\`

This is a basic example, but it demonstrates the power of combining state and effects in a functional component.
`;

export function ChatUI({ sidebarOpen, setSidebarOpen, initialMessage }: ChatUIProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');

  useEffect(() => {
    if (initialMessage) {
      handleSendMessage(initialMessage);
    }
  }, [initialMessage]);

  const handleSendMessage = (message?: string) => {
    const messageToSend = message || input;
    if (messageToSend.trim()) {
      const newUserMessage: Message = {
        id: Date.now().toString(),
        role: 'user',
        content: messageToSend,
      };
      setMessages((prev) => [...prev, newUserMessage]);
      setInput('');
      simulateStreamingResponse();
    }
  };

  const simulateStreamingResponse = () => {
    const newAiMessage: Message = {
      id: (Date.now() + 1).toString(),
      role: 'assistant',
      content: '',
    };
    setMessages((prev) => [...prev, newAiMessage]);

    let chunkIndex = 0;
    const chunkSize = 20;
    const interval = setInterval(() => {
      if (chunkIndex < mockAiResponse.length) {
        const chunk = mockAiResponse.substring(chunkIndex, chunkIndex + chunkSize);
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === newAiMessage.id ? { ...msg, content: msg.content + chunk } : msg
          )
        );
        chunkIndex += chunkSize;
      } else {
        clearInterval(interval);
      }
    }, 50);
  };

  return (
    <div className="flex-1 flex flex-col bg-[#1b1c1d]">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-[#333537]">
        <div className="flex items-center gap-4">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 rounded-lg hover:bg-[#333537] transition-colors"
          >
            {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
          <div className="flex items-center gap-2">
            <h1 className="text-[#e8eaed] text-xl font-semibold">IntelliChat</h1>
            <span className="text-xs px-2 py-0.5 bg-[#4285f4] text-white rounded-full">
              PRO
            </span>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <ModelSelector />
          <button className="p-2 rounded-lg hover:bg-[#333537] transition-colors">
            <div className="w-8 h-8 rounded-full bg-[#4285f4] flex items-center justify-center text-white font-semibold text-sm">
              A
            </div>
          </button>
        </div>
      </div>

      {/* Message List */}
      <MessageList messages={messages} />

      {/* Chat Input */}
      <div className="w-full max-w-3xl mx-auto p-4">
        <ChatInput
          input={input}
          setInput={setInput}
          handleSendMessage={handleSendMessage}
        />
      </div>
    </div>
  );
}
