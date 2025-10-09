'use client'

import React, { useState } from 'react'
import { ChevronDown, Check } from 'lucide-react'

const models = [
  {
    id: 'gemini-pro',
    name: 'Gemini Pro',
    description: 'Most capable model for complex tasks'
  },
  {
    id: 'gemini-standard', 
    name: 'Gemini Standard',
    description: 'Balanced performance and speed'
  },
  {
    id: 'gemini-code',
    name: 'Gemini Code',
    description: 'Optimized for code generation'
  }
]

export function ModelSelector() {
  const [isOpen, setIsOpen] = useState(false)
  const [selectedModel, setSelectedModel] = useState(models[0])

  const handleModelSelect = (model: typeof models[0]) => {
    setSelectedModel(model)
    setIsOpen(false)
  }

  return (
    <div style={{ position: 'relative' }}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          padding: '8px 12px',
          backgroundColor: '#333537',
          border: '1px solid #333537',
          borderRadius: '8px',
          color: '#e8eaed',
          cursor: 'pointer',
          transition: 'background-color 0.2s ease',
          fontSize: '14px'
        }}
        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#404040'}
        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#333537'}
      >
        <span>{selectedModel?.name || 'Select Model'}</span>
        <ChevronDown 
          size={16} 
          style={{ 
            color: '#9aa0a6',
            transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
            transition: 'transform 0.2s ease'
          }} 
        />
      </button>

      {isOpen && (
        <div style={{
          position: 'absolute',
          top: '100%',
          right: 0,
          marginTop: '8px',
          minWidth: '280px',
          backgroundColor: '#282a2c',
          border: '1px solid #333537',
          borderRadius: '8px',
          padding: '8px',
          zIndex: 50,
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.4)'
        }}>
          {models.map((model) => (
            <button
              key={model.id}
              onClick={() => handleModelSelect(model)}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '12px',
                backgroundColor: 'transparent',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                textAlign: 'left',
                transition: 'background-color 0.2s ease'
              }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#333537'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
            >
              <div>
                <div style={{
                  color: '#e8eaed',
                  fontWeight: '500',
                  fontSize: '14px',
                  marginBottom: '4px'
                }}>
                  {model.name}
                </div>
                <div style={{
                  color: '#9aa0a6',
                  fontSize: '12px'
                }}>
                  {model.description}
                </div>
              </div>
              {selectedModel?.id === model.id && (
                <Check size={16} style={{ color: '#4285f4', flexShrink: 0 }} />
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}