'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  Menu,
  X,
  Plus,
  Search,
  Settings,
  Mic,
  Send,
  Paperclip,
  Clock
} from 'lucide-react'
import { ModelSelector } from './ModelSelector_Fixed'

export function GeminiHomePage() {
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [input, setInput] = useState('')
  const router = useRouter()

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

  const suggestionCards = [
    {
      title: 'Explain quantum computing',
      subtitle: 'in simple terms',
      icon: '🔬'
    },
    {
      title: 'Plan a trip to Japan',
      subtitle: 'with budget considerations',
      icon: '🗾'
    },
    {
      title: 'Write a Python function',
      subtitle: 'to parse CSV files',
      icon: '🐍'
    },
    {
      title: 'Create a workout plan',
      subtitle: 'for beginners',
      icon: '💪'
    }
  ]

  const handleSuggestionClick = (suggestion: { title: string; subtitle: string }) => {
    const query = `${suggestion.title} ${suggestion.subtitle}`
    setInput(query)
    handleSendMessage(query)
  }

  const handleSendMessage = (message?: string) => {
    const messageToSend = message || input
    if (messageToSend.trim()) {
      const chatId = Date.now().toString()
      router.push(`/chat/${chatId}?message=${encodeURIComponent(messageToSend)}`)
    }
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

        {/* Welcome Content */}
        <div style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '32px',
          maxWidth: '1024px',
          margin: '0 auto',
          width: '100%'
        }}>
          <div style={{ textAlign: 'center', marginBottom: '48px' }}>
            <h2 style={{ fontSize: '48px', fontWeight: '300', marginBottom: '16px', margin: 0 }}>
              <span style={{ color: '#e8eaed' }}>Hello, </span>
              <span style={{ color: '#4285f4' }}>Ashish</span>
            </h2>
            <p style={{ color: '#9aa0a6', fontSize: '20px', margin: 0 }}>How can I help you today?</p>
          </div>

          {/* Suggestion Cards */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '16px',
            width: '100%',
            maxWidth: '768px',
            marginBottom: '48px'
          }}>
            {suggestionCards.map((card, index) => (
              <button
                key={index}
                onClick={() => handleSuggestionClick(card)}
                style={{
                  backgroundColor: '#282a2c',
                  padding: '24px',
                  borderRadius: '16px',
                  border: '1px solid #333537',
                  textAlign: 'left',
                  cursor: 'pointer',
                  transition: 'border-color 0.2s ease',
                  color: '#e8eaed'
                }}
                onMouseEnter={(e) => e.currentTarget.style.borderColor = '#4285f4'}
                onMouseLeave={(e) => e.currentTarget.style.borderColor = '#333537'}
              >
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                  <span style={{ fontSize: '24px' }}>{card.icon}</span>
                  <div>
                    <h3 style={{ color: '#e8eaed', fontWeight: '500', marginBottom: '4px', margin: 0 }}>{card.title}</h3>
                    <p style={{ color: '#9aa0a6', fontSize: '14px', margin: 0 }}>{card.subtitle}</p>
                  </div>
                </div>
              </button>
            ))}
          </div>

          {/* Chat Input */}
          <div style={{ width: '100%', maxWidth: '768px' }}>
            <div style={{ position: 'relative' }}>
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
                  placeholder="Ask IntelliChat"
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
                    disabled={!input.trim()}
                    style={{
                      padding: '8px',
                      backgroundColor: '#4285f4',
                      borderRadius: '8px',
                      border: 'none',
                      cursor: input.trim() ? 'pointer' : 'not-allowed',
                      transition: 'background-color 0.2s ease',
                      opacity: input.trim() ? 1 : 0.5
                    }}
                    onMouseEnter={(e) => {
                      if (input.trim()) e.currentTarget.style.backgroundColor = '#3367d6'
                    }}
                    onMouseLeave={(e) => {
                      if (input.trim()) e.currentTarget.style.backgroundColor = '#4285f4'
                    }}
                  >
                    <Send size={20} style={{ color: '#ffffff' }} />
                  </button>
                </div>
              </div>
            </div>
            
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginTop: '16px',
              gap: '16px'
            }}>
              <button style={{
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                fontSize: '14px',
                color: '#9aa0a6',
                backgroundColor: 'transparent',
                padding: '8px 12px',
                borderRadius: '8px',
                border: 'none',
                cursor: 'pointer',
                transition: 'background-color 0.2s ease'
              }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#333537'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
              >
                <div style={{
                  width: '16px',
                  height: '16px',
                  borderRadius: '4px',
                  background: 'linear-gradient(135deg, #ef4444 0%, #eab308 100%)'
                }}></div>
                <span>Tools</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}