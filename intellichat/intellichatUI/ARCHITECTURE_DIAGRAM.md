# Run Settings System - Visual Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                         USER INTERFACE                              │
│                                                                     │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │         RunSettingsSidebar Component                         │  │
│  │  ┌────────────────────────────────────────────────────────┐  │  │
│  │  │  Header:  [↻ Reset] [Code] [Settings] [X]              │  │  │
│  │  │           (blue)     (icons)          (close)           │  │  │
│  │  └────────────────────────────────────────────────────────┘  │  │
│  │                                                              │  │
│  │  Model: [gemini-2.5-pro ▼]                                  │  │
│  │  System Instructions: [textarea]                            │  │
│  │  Temperature: [slider] 0.95                                 │  │
│  │  Max Tokens: [slider] 8192                                  │  │
│  │  Reasoning: [medium ▼]                                      │  │
│  │  Stream: [toggle] ON                                        │  │
│  │  JSON Mode: [toggle] OFF                                    │  │
│  │  Browser Search: [toggle] OFF                               │  │
│  │  Code Interpreter: [toggle] OFF                             │  │
│  │  Advanced: [collapsible]                                    │  │
│  │    - Top P: [slider] 1.0                                    │  │
│  │    - Seed: [input] null                                     │  │
│  │    - Stop Sequence: [input] ""                              │  │
│  └──────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────┘
                                  │
                                  │ User changes setting
                                  ▼
┌─────────────────────────────────────────────────────────────────────┐
│                    STATE MANAGEMENT LAYER                           │
│                                                                     │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │         RunSettingsContext (Global State)                    │  │
│  │                                                              │  │
│  │  settings: {                  changedSettings: {            │  │
│  │    model: "gemini-2.5-pro",     temperature: 1.2           │  │
│  │    temperature: 1.2,          }                            │  │
│  │    maxTokens: 8192,           (only modified values)       │  │
│  │    stream: true,                                           │  │
│  │    ...all values              ┌──────────────┐             │  │
│  │  }                            │ localStorage │             │  │
│  │                               │ (persisted)  │             │  │
│  │  updateSetting()              └──────────────┘             │  │
│  │  resetSettings()                                           │  │
│  │  getApiPayload()                                           │  │
│  └──────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────┘
                                  │
                                  │ Component uses context
                                  ▼
┌─────────────────────────────────────────────────────────────────────┐
│                    APPLICATION COMPONENTS                           │
│                                                                     │
│  ┌──────────────────┐  ┌──────────────────┐  ┌─────────────────┐  │
│  │   Chat Page      │  │  Message Input   │  │  Settings Panel │  │
│  │                  │  │                  │  │                 │  │
│  │  const {         │  │  const {         │  │  const {        │  │
│  │    settings,     │  │    getApiPayload │  │    hasChanges,  │  │
│  │    updateSetting │  │  } = useContext  │  │    reset        │  │
│  │  } = useContext  │  │                  │  │  } = useContext │  │
│  └──────────────────┘  └──────────────────┘  └─────────────────┘  │
└─────────────────────────────────────────────────────────────────────┘
                                  │
                                  │ Send message with settings
                                  ▼
┌─────────────────────────────────────────────────────────────────────┐
│                      API FORMATTING LAYER                           │
│                                                                     │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │  formatSettingsForGeminiAPI()                                │  │
│  │                                                              │  │
│  │  Input: { temperature: 1.2 }                                │  │
│  │                                                              │  │
│  │  Output: {                                                  │  │
│  │    generationConfig: {                                      │  │
│  │      temperature: 1.2                                       │  │
│  │    }                                                        │  │
│  │  }                                                          │  │
│  └──────────────────────────────────────────────────────────────┘  │
│                                                                     │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │  formatSettingsForOpenAIAPI()                                │  │
│  │                                                              │  │
│  │  Input: { temperature: 1.2 }                                │  │
│  │                                                              │  │
│  │  Output: {                                                  │  │
│  │    temperature: 1.2                                         │  │
│  │  }                                                          │  │
│  └──────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────┘
                                  │
                                  │ Send to backend
                                  ▼
┌─────────────────────────────────────────────────────────────────────┐
│                      BACKEND API ROUTES                             │
│                                                                     │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │  POST /api/chat                                              │  │
│  │                                                              │  │
│  │  const {                                                     │  │
│  │    message,                                                  │  │
│  │    model,              ← From settings                       │  │
│  │    temperature,        ← From settings                       │  │
│  │    maxOutputTokens,    ← From settings                       │  │
│  │    systemInstruction,  ← From settings                       │  │
│  │    ...otherSettings    ← From settings                       │  │
│  │  } = await request.json();                                   │  │
│  │                                                              │  │
│  │  // Use in AI API call                                       │  │
│  └──────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────┘
                                  │
                                  │ Forward to AI API
                                  ▼
┌─────────────────────────────────────────────────────────────────────┐
│                      EXTERNAL AI APIS                               │
│                                                                     │
│  ┌──────────────────┐  ┌──────────────────┐  ┌─────────────────┐  │
│  │  Gemini API      │  │  OpenAI API      │  │  Other APIs     │  │
│  │                  │  │                  │  │                 │  │
│  │  ✓ Receives all  │  │  ✓ Receives all  │  │  ✓ Receives all │  │
│  │    settings      │  │    settings      │  │    settings     │  │
│  │  ✓ Properly      │  │  ✓ Properly      │  │  ✓ Properly     │  │
│  │    formatted     │  │    formatted     │  │    formatted    │  │
│  └──────────────────┘  └──────────────────┘  └─────────────────┘  │
└─────────────────────────────────────────────────────────────────────┘
```

## Data Flow Diagram

```
┌─────────────┐
│ User Action │
└──────┬──────┘
       │
       ▼
┌──────────────────────────┐
│ UI Component             │
│ (Slider, Input, Toggle)  │
└──────┬───────────────────┘
       │ onChange event
       ▼
┌──────────────────────────┐
│ updateSetting(key, val)  │
└──────┬───────────────────┘
       │
       ├─────────────────────┐
       │                     │
       ▼                     ▼
┌─────────────┐      ┌────────────────┐
│ settings    │      │ changedSettings│
│ (full)      │      │ (only modified)│
└─────┬───────┘      └────────┬───────┘
      │                       │
      ├───────────────────────┤
      │                       │
      ▼                       ▼
┌─────────────────────────────────┐
│ localStorage.setItem()          │
│ (persist for next session)      │
└─────────────────────────────────┘
      │
      │ User sends message
      ▼
┌─────────────────────────────────┐
│ getApiPayload()                 │
│ Returns: changedSettings        │
└─────┬───────────────────────────┘
      │
      ▼
┌─────────────────────────────────┐
│ formatSettingsForGeminiAPI()    │
│ Transforms to API format        │
└─────┬───────────────────────────┘
      │
      ▼
┌─────────────────────────────────┐
│ fetch('/api/chat', {            │
│   body: {                       │
│     message,                    │
│     ...apiSettings              │
│   }                             │
│ })                              │
└─────┬───────────────────────────┘
      │
      ▼
┌─────────────────────────────────┐
│ Backend API Route               │
│ Receives all settings           │
│ Forwards to AI API              │
└─────┬───────────────────────────┘
      │
      ▼
┌─────────────────────────────────┐
│ AI API Response                 │
│ (Gemini, OpenAI, etc.)          │
└─────────────────────────────────┘
```

## Reset Flow

```
┌─────────────────┐
│ User clicks     │
│ Reset button    │
└────────┬────────┘
         │
         ▼
┌─────────────────────────┐
│ resetSettings()         │
└────────┬────────────────┘
         │
         ├──────────────────────┐
         │                      │
         ▼                      ▼
┌────────────────┐    ┌─────────────────┐
│ settings =     │    │ changedSettings │
│ DEFAULT        │    │ = {}            │
└────────┬───────┘    └────────┬────────┘
         │                     │
         └──────────┬──────────┘
                    │
                    ▼
         ┌──────────────────────┐
         │ localStorage.setItem │
         │ (save defaults)      │
         └──────────────────────┘
                    │
                    ▼
         ┌──────────────────────┐
         │ UI updates           │
         │ Reset button grays   │
         │ All inputs reset     │
         └──────────────────────┘
```

## File Dependencies

```
runSettingsDefaults.ts (Base config)
           │
           ├─────────────────────────┐
           │                         │
           ▼                         ▼
   useRunSettings.ts         RunSettingsSidebar.tsx
   (Hook - State logic)      (UI Component)
           │
           ▼
   RunSettingsContext.tsx
   (Global Provider)
           │
           ├────────────────────────┐
           │                        │
           ▼                        ▼
   formatRunSettings.ts      Any Component
   (API Formatters)          (Uses context)
           │
           ▼
      API Routes
   (Backend integration)
```

## Key Concepts

### 1. Two-State System
```
settings          →  All current values (11 properties)
changedSettings   →  Only modified values (could be 0-11)
```

### 2. Automatic Tracking
```
User changes temperature from 0.95 to 1.2
  ↓
settings.temperature = 1.2
  ↓
Compare with DEFAULT_RUN_SETTINGS.temperature (0.95)
  ↓
Different! Add to changedSettings
  ↓
changedSettings = { temperature: 1.2 }
```

### 3. Reset Logic
```
User clicks reset
  ↓
settings = DEFAULT_RUN_SETTINGS (all values)
  ↓
changedSettings = {} (empty)
  ↓
hasChanges = false (button grays out)
```

### 4. API Payload
```
getApiPayload()
  ↓
Returns changedSettings (only modified)
  ↓
formatSettingsForGeminiAPI()
  ↓
Transforms to API format
  ↓
Send with chat request
```

---

This visual guide shows exactly how everything connects and flows through the system!
