# Critical Configuration Issues - Analysis & Fix Plan

## Issues Identified

### 1. **Config Not Sent with Messages** ❌
**Problem**: When sending messages to existing conversations, the config (temperature, browserSearch, etc.) is NOT being sent.

**Current Flow**:
```
User changes Run Settings → sendMessage() → Backend
                                    ↓
                              NO CONFIG SENT! ❌
```

**Root Causes**:
- `sendMessageBodySchema` doesn't accept `config` field
- `sendMessage` controller doesn't accept `config` parameter
- Frontend `useChat` hook doesn't send config with messages

### 2. **Config Not Stored Per-Message** ❌
**Problem**: Configuration is stored at conversation level, not per-message.

**Current**: One config for entire conversation
**Needed**: Each message should have its own config snapshot

### 3. **Browser Search Not Working** ❌
**Problem**: Even when enabled, browser search doesn't execute.

**Root Causes**:
- Config not reaching backend (see issue #1)
- `context.config.browserSearch` is undefined because config isn't passed
- Backend checks fail, so Tavily API is never called

## Required Fixes

### Fix 1: Allow Config in sendMessage Endpoint

#### Backend Changes:

**File**: `backend/src/routes/chat.ts`
```typescript
// BEFORE
const sendMessageBodySchema = z.object({
  content: z.string().min(1).max(10000),
  attachments: z.array(...).optional(),
});

// AFTER
const sendMessageBodySchema = z.object({
  content: z.string().min(1).max(10000),
  attachments: z.array(...).optional(),
  config: z.object({
    temperature: z.number().min(0).max(2).optional(),
    maxTokens: z.number().min(1).max(8192).optional(),
    topP: z.number().min(0).max(1).optional(),
    stream: z.boolean().optional(),
    browserSearch: z.boolean().optional(),      // NEW
    codeInterpreter: z.boolean().optional(),    // NEW
  }).optional(),
});
```

**File**: `backend/src/controllers/chat.ts`
```typescript
// BEFORE
async sendMessage(req: Request, res: Response, next: NextFunction) {
  const { content, attachments } = req.body;
  
  const message = await chatService.sendMessage({
    conversationId,
    userId,
    content,
    attachments,
  });
}

// AFTER
async sendMessage(req: Request, res: Response, next: NextFunction) {
  const { content, attachments, config } = req.body;  // NEW
  
  const message = await chatService.sendMessage({
    conversationId,
    userId,
    content,
    attachments,
    config,  // NEW - Pass config to service
  });
}
```

**File**: `backend/src/services/chat.ts`
```typescript
// Add config to SendMessageRequest interface
interface SendMessageRequest {
  conversationId: string;
  userId: string;
  content: string;
  attachments?: any[];
  config?: any;  // NEW
}

// Use config when calling AI provider
async sendMessage(request: SendMessageRequest) {
  // Merge conversation config with per-message config
  const effectiveConfig = {
    ...conversation.config,
    ...request.config,  // Override with per-message config
  };
  
  // Pass to AI provider
  const response = await aiProvider.chat({
    messages: history,
    config: effectiveConfig,  // Use merged config
  });
}
```

### Fix 2: Store Config Per-Message

**File**: `backend/src/models/message.ts`
```typescript
// Add config field to Message schema
const MessageSchema = new Schema({
  // ... existing fields
  config: {
    temperature: Number,
    maxTokens: Number,
    topP: Number,
    stream: Boolean,
    browserSearch: Boolean,      // NEW
    codeInterpreter: Boolean,    // NEW
  },
  // ... other fields
});
```

**File**: `backend/src/services/chat.ts`
```typescript
// Save config with message
const message = await Message.create({
  conversationId,
  role: 'user',
  content,
  config: effectiveConfig,  // Store config snapshot
  // ... other fields
});
```

### Fix 3: Send Config from Frontend

**File**: `intellichatUI/src/hooks/useChat.ts`
```typescript
// BEFORE
const sendMessage = useCallback(async (content: string, attachments?: any[]) => {
  const payload: SendMessageRequest = { content };
  if (attachments) {
    payload.attachments = attachments;
  }
  const response = await chatAPI.sendMessage(conversationId, payload);
}, [conversationId]);

// AFTER
const sendMessage = useCallback(async (
  content: string, 
  attachments?: any[],
  config?: any  // NEW parameter
) => {
  const payload: SendMessageRequest = { 
    content,
    config  // NEW - Include config
  };
  if (attachments) {
    payload.attachments = attachments;
  }
  const response = await chatAPI.sendMessage(conversationId, payload);
}, [conversationId]);
```

**File**: `intellichatUI/src/lib/chat-api.ts`
```typescript
// Update interface
export interface SendMessageRequest {
  content: string;
  attachments?: any[];
  config?: {
    temperature?: number;
    maxTokens?: number;
    topP?: number;
    stream?: boolean;
    browserSearch?: boolean;      // NEW
    codeInterpreter?: boolean;    // NEW
  };
}
```

### Fix 4: Pass Current Config When Sending

**File**: Components using useChat (e.g., `GeminiChatPage.tsx`)
```typescript
// BEFORE
await sendMessage(inputValue);

// AFTER
import { useRunSettings } from '@/contexts/RunSettingsContext';

const { settings } = useRunSettings();

await sendMessage(inputValue, undefined, {
  temperature: settings.temperature,
  maxTokens: settings.maxTokens,
  topP: settings.topP,
  stream: settings.stream,
  browserSearch: settings.builtInTools?.browserSearch,
  codeInterpreter: settings.builtInTools?.codeInterpreter,
});
```

### Fix 5: Auto-Load Last Config from API

**File**: `intellichatUI/src/contexts/RunSettingsContext.tsx`
```typescript
// Load last used config from conversation
useEffect(() => {
  if (conversationId) {
    // Fetch conversation
    const conversation = await chatAPI.getConversationById(conversationId);
    
    // Load config from conversation or last message
    if (conversation.config) {
      setSettings({
        ...settings,
        ...conversation.config,
      });
    }
  }
}, [conversationId]);
```

## Implementation Priority

1. **HIGH**: Fix 1 & 3 - Allow config in sendMessage + Send from frontend
   - This makes browser search work immediately
   
2. **HIGH**: Fix 4 - Pass current config when sending
   - This makes all Run Settings work
   
3. **MEDIUM**: Fix 2 - Store config per-message
   - For history tracking
   
4. **MEDIUM**: Fix 5 - Auto-load last config
   - Better UX

## Testing Plan

### Test 1: Browser Search
1. Enable "Browser Search" in Run Settings
2. Ask "What's the weather in New York today?"
3. Backend should call Tavily API
4. Response should include real-time data

### Test 2: Config Changes
1. Set temperature to 1.5
2. Send message
3. Check backend logs - should show config with temp=1.5
4. Change to 0.5
5. Send another message
6. Should use new config

### Test 3: Per-Message Config
1. Send message with browserSearch=true
2. Send another with browserSearch=false
3. Check database - each message should have its config

### Test 4: Config Persistence
1. Change settings in conversation A
2. Switch to conversation B
3. Switch back to conversation A
4. Settings should restore to what was used in A

## Expected Outcome

✅ Run Settings changes immediately affect next message
✅ Browser search works when enabled
✅ Each message stores its config
✅ Config persists across conversation switches
✅ Backend receives full config with every message
✅ AI provider gets browserSearch flag correctly

## Files to Modify

### Backend (6 files):
1. `backend/src/routes/chat.ts` - Add config to schema
2. `backend/src/controllers/chat.ts` - Accept config parameter
3. `backend/src/services/chat.ts` - Pass config to AI provider
4. `backend/src/models/message.ts` - Add config field
5. `backend/src/ai/providers/groq.ts` - Already handles browserSearch ✓
6. `backend/src/ai/interfaces.ts` - Already has browserSearch ✓

### Frontend (4 files):
1. `intellichatUI/src/lib/chat-api.ts` - Add config to interface
2. `intellichatUI/src/hooks/useChat.ts` - Accept and send config
3. `intellichatUI/src/components/GeminiChatPage.tsx` - Pass config when sending
4. `intellichatUI/src/contexts/RunSettingsContext.tsx` - Load config from API

## Current Status

❌ Config not sent with messages
❌ Config not stored per-message  
❌ Browser search not working
❌ Run Settings changes ignored

## After Fix

✅ Config sent with every message
✅ Config stored per-message
✅ Browser search works when enabled
✅ Run Settings changes take effect immediately
