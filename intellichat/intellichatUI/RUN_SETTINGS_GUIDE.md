# Run Settings System - Complete Guide

## Overview
This system provides complete management of AI model parameters and settings with:
- ✅ Default configuration in JSON format
- ✅ Reset button to restore defaults
- ✅ Change tracking (only modified values)
- ✅ Persistent storage (localStorage)
- ✅ Global state management
- ✅ API-ready formatting

## File Structure

```
src/
├── config/
│   └── runSettingsDefaults.ts       # Default settings configuration
├── hooks/
│   └── useRunSettings.ts            # Hook for settings management
├── contexts/
│   └── RunSettingsContext.tsx       # Context provider for global access
├── lib/
│   └── formatRunSettings.ts         # API formatting utilities
└── components/
    └── RunSettingsSidebar.tsx       # UI component with reset button
```

## 1. Default Configuration (JSON)

All settings with their default values are defined in `runSettingsDefaults.ts`:

```typescript
{
  model: 'gemini-2.5-pro',
  systemInstructions: '',
  temperature: 0.95,
  maxCompletionTokens: 8192,
  reasoning: 'medium',
  stream: true,
  jsonMode: false,
  builtInTools: {
    browserSearch: false,
    codeInterpreter: false,
  },
  mcpServers: [],
  advanced: {
    moderation: false,
    topP: 1.0,
    seed: null,
    stopSequence: '',
    template: false,
  }
}
```

## 2. Reset Button Feature

The reset button (↻ icon) is located in the top-right of the sidebar:
- **Blue color**: When settings have been modified
- **Gray color**: When all settings are at defaults
- **Disabled**: When no changes to reset
- **Click**: Instantly restores all settings to defaults

## 3. Change Tracking

The system tracks two separate states:

### Full Settings State
```typescript
settings: RunSettingsConfig
// Contains ALL current values
```

### Changed Settings State
```typescript
changedSettings: Partial<RunSettingsConfig>
// Contains ONLY values different from defaults
// This is what you send to the backend API
```

## 4. Usage in Components

### Option A: Using Context (Recommended)

First, wrap your app with the provider in `layout.tsx`:

```typescript
import { RunSettingsProvider } from '@/contexts/RunSettingsContext';

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <RunSettingsProvider>
          {children}
        </RunSettingsProvider>
      </body>
    </html>
  );
}
```

Then use in any component:

```typescript
import { useRunSettingsContext } from '@/contexts/RunSettingsContext';

function ChatComponent() {
  const { 
    settings,           // Full current settings
    changedSettings,    // Only modified settings
    getApiPayload,      // Get formatted settings
    updateSetting,      // Update a setting
    resetSettings       // Reset to defaults
  } = useRunSettingsContext();

  // Access specific settings
  console.log('Temperature:', settings.temperature);
  console.log('Model:', settings.model);
  
  // Get only changed settings for API
  const modifiedSettings = getApiPayload();
  
  return <div>...</div>;
}
```

### Option B: Using Hook Directly

```typescript
import { useRunSettings } from '@/hooks/useRunSettings';

function MyComponent() {
  const { settings, changedSettings, updateSetting } = useRunSettings();
  
  return <div>...</div>;
}
```

## 5. API Integration Examples

### Example 1: Send to Chat API

```typescript
import { useRunSettingsContext } from '@/contexts/RunSettingsContext';
import { formatSettingsForGeminiAPI } from '@/lib/formatRunSettings';

function ChatPage() {
  const { changedSettings, getApiPayload } = useRunSettingsContext();

  const sendMessage = async (message: string) => {
    // Get only the modified settings
    const settingsPayload = getApiPayload();
    
    // Format for Gemini API
    const apiSettings = formatSettingsForGeminiAPI(settingsPayload);
    
    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message,
        ...apiSettings,  // Include settings in request
      }),
    });
    
    return response.json();
  };

  return <div>...</div>;
}
```

### Example 2: Direct Gemini API Call

```typescript
const { settings } = useRunSettingsContext();
const apiPayload = formatSettingsForGeminiAPI(settings);

const response = await fetch('https://generativelanguage.googleapis.com/v1/models/gemini-pro:generateContent', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${API_KEY}`,
  },
  body: JSON.stringify({
    contents: [{ parts: [{ text: message }] }],
    ...apiPayload,
  }),
});
```

### Example 3: OpenAI-Compatible API

```typescript
import { formatSettingsForOpenAIAPI } from '@/lib/formatRunSettings';

const openAIPayload = formatSettingsForOpenAIAPI(changedSettings);

const response = await fetch('/api/openai/chat', {
  method: 'POST',
  body: JSON.stringify({
    messages: [{ role: 'user', content: message }],
    ...openAIPayload,
  }),
});
```

## 6. Accessing Settings in API Routes

```typescript
// app/api/chat/route.ts
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  const body = await request.json();
  
  const {
    message,
    model,
    temperature,
    maxCompletionTokens,
    systemInstructions,
    ...otherSettings
  } = body;

  // Use settings in your API logic
  const response = await callAIModel({
    prompt: message,
    model: model || 'gemini-2.5-pro',
    temperature: temperature || 0.95,
    maxTokens: maxCompletionTokens || 8192,
    systemPrompt: systemInstructions,
  });

  return NextResponse.json(response);
}
```

## 7. Display Settings Summary

```typescript
import { getSettingsSummary } from '@/lib/formatRunSettings';

function SettingsSummary() {
  const { changedSettings } = useRunSettingsContext();
  const summary = getSettingsSummary(changedSettings);

  return (
    <div>
      <h3>Active Customizations:</h3>
      {summary.length === 0 ? (
        <p>Using default settings</p>
      ) : (
        <ul>
          {summary.map((item, i) => (
            <li key={i}>{item}</li>
          ))}
        </ul>
      )}
    </div>
  );
}
```

## 8. Update Settings Programmatically

```typescript
const { updateSetting } = useRunSettingsContext();

// Update single setting
updateSetting('temperature', 1.2);
updateSetting('model', 'gemini-flash-latest');

// Update nested setting
updateSetting('builtInTools', { 
  browserSearch: true, 
  codeInterpreter: false 
});
```

## 9. Persist Settings

Settings are automatically saved to `localStorage` and restored on page reload. To manually control this:

```typescript
// Clear saved settings
localStorage.removeItem('runSettings');

// Manually save
localStorage.setItem('runSettings', JSON.stringify(settings));
```

## 10. TypeScript Types

All types are fully typed for autocomplete:

```typescript
import { 
  RunSettingsConfig,      // Full settings type
  MODEL_OPTIONS,          // Available models
  REASONING_OPTIONS,      // Reasoning levels
  PARAMETER_CONSTRAINTS   // Min/max values
} from '@/config/runSettingsDefaults';
```

## Complete Integration Checklist

- [x] Default settings defined in JSON format
- [x] Reset button added to sidebar (with visual indicator)
- [x] Change tracking implemented
- [x] Settings persist across sessions
- [x] Global state management via Context
- [x] API formatting utilities (Gemini & OpenAI)
- [x] TypeScript types for all settings
- [x] Easy access in all components
- [x] Ready for backend integration

## Quick Start

1. **Wrap your app** with `RunSettingsProvider`
2. **Use the context** in components that need settings
3. **Get API payload** with `getApiPayload()`
4. **Send to backend** with your chat requests
5. **Reset anytime** with the reset button

You're all set! 🎉
