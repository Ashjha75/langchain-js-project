'use client'

import React, { useState, useEffect, useRef } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import {
  Menu,
  X,
  Plus,
  Search,
  Settings,
  Mic,
  Send,
  Paperclip,
  Clock,
  User,
  Bot,
  Copy,
  ThumbsUp,
  ThumbsDown,
  MoreHorizontal
} from 'lucide-react'
import { ModelSelector } from './ModelSelector_Fixed'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
}

export function GeminiChatPage() {
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [input, setInput] = useState('')
  const [messages, setMessages] = useState<Message[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const router = useRouter()
  const searchParams = useSearchParams()

  const recentChats = [
    'Project planning discussion',
    'Code review and debugging', 
    'Creative writing session',
    'Data analysis help',
    'Travel itinerary creation',
    'Recipe suggestions',
    'Learning new concepts',
    'Problem solving session'
  ]

  useEffect(() => {
    const initialMessage = searchParams?.get('message')
    if (initialMessage) {
      handleSendMessage(initialMessage)
    }
  }, [searchParams])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const handleSendMessage = async (messageText?: string) => {
    const messageToSend = messageText || input
    if (!messageToSend.trim()) return

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: messageToSend,
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setInput('')
    setIsLoading(true)

    // Simulate AI response
    setTimeout(() => {
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: `I understand you're asking about "${messageToSend}". This is a simulated response. In a real implementation, this would connect to your AI backend service to provide intelligent responses based on your query.`,
        timestamp: new Date()
      }
      setMessages(prev => [...prev, aiMessage])
      setIsLoading(false)
    }, 1500)
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  return (
    <div style={{ backgroundColor: '#1b1c1d', color: '#e8eaed', height: '100vh', display: 'flex', fontFamily: 'Google Sans, system-ui, sans-serif' }}>
      {/* Sidebar */}
      <div 
        style={{
          backgroundColor: '#282a2c',
          width: sidebarOpen ? '256px' : '0px',
          transition: 'width 0.3s ease',
          overflow: 'hidden',
          borderRight: '1px solid #333537'
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', height: '100%', padding: '16px' }}>
          {/* Header */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                backgroundColor: '#4285f4',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#ffffff',
                fontWeight: '600',
                fontSize: '14px'
              }}>
                IC
              </div>
              <div>
                <h1 style={{ color: '#e8eaed', fontSize: '18px', fontWeight: '600', margin: 0 }}>IntelliChat</h1>
                <span style={{
                  fontSize: '12px',
                  padding: '2px 8px',
                  backgroundColor: '#4285f4',
                  color: '#ffffff',
                  borderRadius: '9999px'
                }}>PRO</span>
              </div>
            </div>
          </div>

          {/* New Chat Button */}
          <button
            onClick={() => router.push('/chat/new')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              width: '100%',
              padding: '12px',
              borderRadius: '8px',
              backgroundColor: 'transparent',
              color: '#e8eaed',
              border: '1px solid #333537',
              cursor: 'pointer',
              marginBottom: '16px',
              transition: 'background-color 0.2s ease'
            }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#333537'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
          >
            <Plus size={20} />
            <span>New chat</span>
          </button>

          {/* Search */}
          <div style={{ position: 'relative', marginBottom: '16px' }}>
            <Search style={{
              width: '16px',
              height: '16px',
              position: 'absolute',
              left: '12px',
              top: '50%',
              transform: 'translateY(-50%)',
              color: '#9aa0a6'
            }} />
            <input
              type="text"
              placeholder="Search"
              style={{
                width: '100%',
                paddingLeft: '40px',
                paddingRight: '16px',
                paddingTop: '8px',
                paddingBottom: '8px',
                borderRadius: '8px',
                backgroundColor: '#333537',
                border: '1px solid #333537',
                color: '#e8eaed',
                outline: 'none'
              }}
            />
          </div>

          {/* Recent Chats */}
          <div style={{ flex: 1, overflowY: 'auto' }}>
            <div style={{ marginBottom: '16px' }}>
              <h3 style={{ color: '#9aa0a6', fontSize: '14px', fontWeight: '500', marginBottom: '8px' }}>Recent</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                {recentChats.map((chat, index) => (
                  <button
                    key={index}
                    style={{
                      width: '100%',
                      textAlign: 'left',
                      padding: '8px',
                      borderRadius: '8px',
                      backgroundColor: 'transparent',
                      color: '#e8eaed',
                      fontSize: '14px',
                      border: 'none',
                      cursor: 'pointer',
                      transition: 'background-color 0.2s ease'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#333537'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Clock size={16} style={{ color: '#9aa0a6' }} />
                      <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{chat}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Settings */}
          <div style={{ paddingTop: '16px', borderTop: '1px solid #333537' }}>
            <button style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              width: '100%',
              padding: '8px',
              borderRadius: '8px',
              backgroundColor: 'transparent',
              color: '#e8eaed',
              border: 'none',
              cursor: 'pointer',
              transition: 'background-color 0.2s ease'
            }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#333537'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
            >
              <Settings size={20} />
              <span>Settings & help</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', backgroundColor: '#1b1c1d' }}>
        {/* Header */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '16px',
          borderBottom: '1px solid #333537'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              style={{
                padding: '8px',
                borderRadius: '8px',
                backgroundColor: 'transparent',
                color: '#e8eaed',
                border: 'none',
                cursor: 'pointer',
                transition: 'background-color 0.2s ease'
              }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#333537'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
            >
              {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <h1 style={{ color: '#e8eaed', fontSize: '20px', fontWeight: '600', margin: 0 }}>IntelliChat</h1>
              <span style={{
                fontSize: '12px',
                padding: '2px 8px',
                backgroundColor: '#4285f4',
                color: '#ffffff',
                borderRadius: '9999px'
              }}>PRO</span>
            </div>
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <ModelSelector />
            <button style={{
              padding: '8px',
              borderRadius: '8px',
              backgroundColor: 'transparent',
              color: '#e8eaed',
              border: 'none',
              cursor: 'pointer',
              transition: 'background-color 0.2s ease'
            }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#333537'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
            >
              <div style={{
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                backgroundColor: '#4285f4',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#ffffff',
                fontWeight: '600',
                fontSize: '14px'
              }}>
                A
              </div>
            </button>
          </div>
        </div>

        {/* Messages Area */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '24px', maxWidth: '768px', margin: '0 auto', width: '100%' }}>
          {messages.length === 0 ? (
            <div style={{ textAlign: 'center', paddingTop: '120px' }}>
              <h2 style={{ fontSize: '32px', fontWeight: '300', marginBottom: '16px', color: '#e8eaed', margin: 0 }}>
                How can I help you today?
              </h2>
              <p style={{ color: '#9aa0a6', fontSize: '16px', margin: 0 }}>Start a conversation by typing a message below.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              {messages.map((message) => (
                <div key={message.id} style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
                  {/* Avatar */}
                  <div style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    backgroundColor: message.role === 'user' ? '#4285f4' : '#282a2c',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0
                  }}>
                    {message.role === 'user' ? (
                      <User size={18} style={{ color: '#ffffff' }} />
                    ) : (
                      <Bot size={18} style={{ color: '#e8eaed' }} />
                    )}
                  </div>

                  {/* Message Content */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                      <span style={{ color: '#e8eaed', fontWeight: '600', fontSize: '14px' }}>
                        {message.role === 'user' ? 'You' : 'IntelliChat'}
                      </span>
                      <span style={{ color: '#9aa0a6', fontSize: '12px' }}>
                        {message.timestamp.toLocaleTimeString()}
                      </span>
                    </div>
                    <div style={{ 
                      color: '#e8eaed', 
                      lineHeight: '1.6',
                      fontSize: '14px',
                      wordBreak: 'break-word'
                    }}>
                      {message.content}
                    </div>
                    
                    {message.role === 'assistant' && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '12px' }}>
                        <button style={{
                          padding: '4px',
                          backgroundColor: 'transparent',
                          border: 'none',
                          borderRadius: '4px',
                          cursor: 'pointer',
                          color: '#9aa0a6',
                          transition: 'background-color 0.2s ease'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#333537'}
                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                        >
                          <Copy size={16} />
                        </button>
                        <button style={{
                          padding: '4px',
                          backgroundColor: 'transparent',
                          border: 'none',
                          borderRadius: '4px',
                          cursor: 'pointer',
                          color: '#9aa0a6',
                          transition: 'background-color 0.2s ease'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#333537'}
                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                        >
                          <ThumbsUp size={16} />
                        </button>
                        <button style={{
                          padding: '4px',
                          backgroundColor: 'transparent',
                          border: 'none',
                          borderRadius: '4px',
                          cursor: 'pointer',
                          color: '#9aa0a6',
                          transition: 'background-color 0.2s ease'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#333537'}
                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                        >
                          <ThumbsDown size={16} />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
              
              {isLoading && (
                <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
                  <div style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    backgroundColor: '#282a2c',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0
                  }}>
                    <Bot size={18} style={{ color: '#e8eaed' }} />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                      <span style={{ color: '#e8eaed', fontWeight: '600', fontSize: '14px' }}>IntelliChat</span>
                    </div>
                    <div style={{ color: '#9aa0a6', fontSize: '14px' }}>
                      <span>Thinking</span>
                      <span style={{ animation: 'pulse 1.5s ease-in-out infinite' }}>...</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div style={{ padding: '24px', borderTop: '1px solid #333537' }}>
          <div style={{ maxWidth: '768px', margin: '0 auto', width: '100%' }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              backgroundColor: '#333537',
              border: '1px solid #333537',
              borderRadius: '24px',
              padding: '16px',
              transition: 'border-color 0.2s ease'
            }}>
              <button style={{
                padding: '8px',
                backgroundColor: 'transparent',
                borderRadius: '8px',
                border: 'none',
                cursor: 'pointer',
                marginRight: '8px',
                transition: 'background-color 0.2s ease'
              }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#404040'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
              >
                <Paperclip size={20} style={{ color: '#9aa0a6' }} />
              </button>
              
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Message IntelliChat..."
                disabled={isLoading}
                style={{
                  flex: 1,
                  backgroundColor: 'transparent',
                  color: '#e8eaed',
                  outline: 'none',
                  border: 'none',
                  fontSize: '16px'
                }}
              />
              
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginLeft: '8px' }}>
                <button style={{
                  padding: '8px',
                  backgroundColor: 'transparent',
                  borderRadius: '8px',
                  border: 'none',
                  cursor: 'pointer',
                  transition: 'background-color 0.2s ease'
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#404040'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                >
                  <Mic size={20} style={{ color: '#9aa0a6' }} />
                </button>
                <button
                  onClick={() => handleSendMessage()}
                  disabled={!input.trim() || isLoading}
                  style={{
                    padding: '8px',
                    backgroundColor: '#4285f4',
                    borderRadius: '8px',
                    border: 'none',
                    cursor: (input.trim() && !isLoading) ? 'pointer' : 'not-allowed',
                    transition: 'background-color 0.2s ease',
                    opacity: (input.trim() && !isLoading) ? 1 : 0.5
                  }}
                  onMouseEnter={(e) => {
                    if (input.trim() && !isLoading) e.currentTarget.style.backgroundColor = '#3367d6'
                  }}
                  onMouseLeave={(e) => {
                    if (input.trim() && !isLoading) e.currentTarget.style.backgroundColor = '#4285f4'
                  }}
                >
                  <Send size={20} style={{ color: '#ffffff' }} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}