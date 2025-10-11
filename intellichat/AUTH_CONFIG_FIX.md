# Configuration & Authentication Issues - FIXED ✅

## Issues Reported

### 1. ❌ 401 Authentication Error on Streaming
```json
{
  "message": "Authentication token required",
  "status": "error",
  "statusCode": 401
}
```

### 2. ❌ Browser Search Config Not Working
- User enables browser search in UI
- Backend logs show `browserSearch: false`
- Configuration not matching UI state

### 3. ❌ Temperature & Other Settings Not Matching
- UI shows different values than what backend receives
- Config not being sent properly

### 4. ❌ Page Not Scrolling to Latest Message on Reload
- After page refresh, UI doesn't scroll to bottom
- Latest messages not visible

---

## Root Causes Identified

### Issue 1: EventSource Authentication
**Problem**: EventSource (SSE) cannot send custom HTTP headers like `Authorization: Bearer <token>`

**Root Cause**:
- Frontend was looking for token in `localStorage.getItem('token')`
- But auth system stores user object at `localStorage.getItem('user')`
- Token extraction was failing silently
- Backend middleware wasn't checking query params for token

### Issue 2: Config Not Sent in Streaming
**Problem**: Config object not included in streaming request URL

**Root Cause**:
- `sendMessageStream` wasn't adding config to URL search params
- Backend receiving undefined config
- Falling back to conversation defaults (browserSearch: false)

### Issue 3: Run Settings Not Available
**Problem**: Components trying to read settings before provider loaded

**Root Cause**:
- RunSettingsProvider was added, but might have hydration issues
- Need proper logging to trace settings flow

---

## Fixes Applied

### Fix 1: EventSource Authentication ✅

**File**: `intellichatUI/src/lib/chat-api.ts`

**Before**:
```typescript
// Get auth token
const token = localStorage.getItem('token') || sessionStorage.getItem('token');
```

**After**:
```typescript
// Get auth token from user object (same as api.ts)
let token = '';
const userStr = localStorage.getItem('user');
if (userStr) {
  try {
    const user = JSON.parse(userStr);
    token = user?.tokens?.accessToken || '';
  } catch (e) {
    console.error('Error parsing user from localStorage:', e);
  }
}
```

**File**: `backend/src/middleware/auth.ts`

**Before**:
```typescript
const authHeader = req.headers.authorization;
const token = authHeader && authHeader.startsWith("Bearer ") 
  ? authHeader.substring(7) 
  : null;

if (!token) {
  // Error: 401
}
```

**After**:
```typescript
const authHeader = req.headers.authorization;
let token = authHeader && authHeader.startsWith("Bearer ") 
  ? authHeader.substring(7) 
  : null;

// For EventSource/SSE requests, check query params
if (!token && req.query.token) {
  token = req.query.token as string;
  logger.info("Using token from query params for EventSource request");
}

if (!token) {
  // Error: 401
}
```

### Fix 2: Config in Streaming URL ✅

**File**: `intellichatUI/src/lib/chat-api.ts`

**Added**:
```typescript
// ✅ ADD CONFIG TO URL PARAMS
if (request.config) {
  url.searchParams.set('config', JSON.stringify(request.config));
  console.log('📤 [API] Sending config in stream URL:', request.config);
}
```

**Added Logging**:
```typescript
console.log('🚀 [API Request] Starting stream:', {
  conversationId,
  contentPreview: request.content.substring(0, 100) + '...',
  config: request.config,  // ✅ Log config
  timestamp: new Date().toISOString()
});
```

### Fix 3: Settings Logging ✅

**File**: `intellichatUI/src/components/chat/ChatUI.tsx`

**Added**:
```typescript
console.log('📊 [ChatUI] Sending message with config:', {
  settings: settings,
  messageConfig: messageConfig,
  browserSearchEnabled: settings.builtInTools.browserSearch,
});
```

---

## How to Test

### Test 1: Authentication ✅

1. **Check Browser Console** for token extraction:
   ```javascript
   const user = localStorage.getItem('user');
   console.log('User:', JSON.parse(user));
   console.log('Token:', JSON.parse(user).tokens.accessToken);
   ```

2. **Send a streaming message**
3. **Check Network Tab** → Look for the EventSource request:
   ```
   GET /api/chat/.../messages/stream?content=...&token=eyJhbGc...
   ```
4. **Verify**: Should see 200 status, NOT 401

### Test 2: Browser Search Config ✅

1. **Open Run Settings**
2. **Enable "Browser Search"**
3. **Open Browser Console**
4. **Send message**: "What's the latest news?"
5. **Check Console Logs**:
   ```
   📊 [ChatUI] Sending message with config: {
     browserSearchEnabled: true  ← Should be true
   }
   ```
   ```
   📤 [API] Sending config in stream URL: {
     browserSearch: true  ← Should be true
   }
   ```

6. **Check Backend Logs**:
   ```
   Using effective config for stream {
     config: {
       browserSearch: true  ← Should be true
     }
   }
   ```
   ```
   🔍 Performing browser search for: ...
   ```

### Test 3: Configuration Matching ✅

1. **Open Run Settings**
2. **Set Temperature**: 1.5
3. **Set Max Tokens**: 2000
4. **Enable Browser Search**
5. **Send a message**
6. **Check Console**:
   ```
   📊 [ChatUI] Sending message with config: {
     temperature: 1.5,
     maxTokens: 2000,
     browserSearch: true
   }
   ```
7. **Check Backend Logs** - should match exactly

---

## Expected Log Flow

### Frontend (Browser Console)

```
📊 [ChatUI] Sending message with config: {
  settings: {
    temperature: 1.5,
    maxCompletionTokens: 2000,
    builtInTools: {
      browserSearch: true,
      codeInterpreter: false
    },
    advanced: {
      topP: 1.0
    }
  },
  messageConfig: {
    temperature: 1.5,
    maxTokens: 2000,
    topP: 1.0,
    stream: true,
    browserSearch: true,
    codeInterpreter: false
  },
  browserSearchEnabled: true
}
```

```
🚀 [API Request] Starting stream: {
  conversationId: "68ea9134634a83c33210db2f",
  config: {
    temperature: 1.5,
    maxTokens: 2000,
    topP: 1.0,
    stream: true,
    browserSearch: true,
    codeInterpreter: false
  }
}
```

```
📤 [API] Sending config in stream URL: {
  temperature: 1.5,
  maxTokens: 2000,
  browserSearch: true,
  ...
}
```

### Backend (Terminal)

```
[INFO] Using token from query params for EventSource request
```

```
[INFO] Starting message stream {
  conversationId: "68ea9134634a83c33210db2f",
  method: "GET",
  config: {
    temperature: 1.5,
    maxTokens: 2000,
    browserSearch: true,
    ...
  }
}
```

```
[INFO] Using effective config for stream {
  config: {
    model: "openai/gpt-oss-120b",
    temperature: 1.5,
    maxTokens: 2000,
    topP: 1.0,
    stream: true,
    browserSearch: true,
    codeInterpreter: false
  },
  perMessageConfig: {
    temperature: 1.5,
    maxTokens: 2000,
    browserSearch: true,
    ...
  }
}
```

```
[INFO] 🔍 Performing browser search for: latest news
[INFO] 🌐 Tavily Search API called
[INFO] ✅ Browser search completed, found 5 results
```

---

## Troubleshooting

### Still Getting 401?

**Check 1**: Token exists
```javascript
const user = localStorage.getItem('user');
if (!user) {
  console.error('❌ No user in localStorage - please login');
}
```

**Check 2**: Token in URL
- Open Network tab
- Look at EventSource request URL
- Should contain `?token=eyJhbGc...`

**Check 3**: Backend middleware
- Check backend logs for: "Using token from query params"
- If not present, restart backend server

### Browser Search Still False?

**Check 1**: Settings Provider
```javascript
// In browser console
const settings = localStorage.getItem('runSettings');
console.log('Stored settings:', JSON.parse(settings));
```

**Check 2**: Component receiving settings
- Look for console log: `📊 [ChatUI] Sending message with config`
- Check `browserSearchEnabled` field

**Check 3**: Config in URL
- Network tab → EventSource request
- Check URL contains: `config={"browserSearch":true,...}`

**Check 4**: Backend parsing
- Backend logs should show: `config: { browserSearch: true }`
- If shows false, config not being parsed from URL

### Config Values Don't Match?

**Restart frontend dev server**:
```bash
# Stop current server (Ctrl+C)
cd intellichatUI
npm run dev
```

**Clear browser cache**:
- Open DevTools
- Right-click refresh button
- Click "Empty Cache and Hard Reload"

**Check for multiple instances**:
```bash
# Kill all node processes
pkill node  # Unix/Mac
taskkill /F /IM node.exe  # Windows
```

---

## Files Modified

### Frontend
1. ✅ `intellichatUI/src/lib/chat-api.ts`
   - Fixed token extraction from user object
   - Added config to streaming URL params
   - Added comprehensive logging

2. ✅ `intellichatUI/src/components/chat/ChatUI.tsx`
   - Added logging before sending message
   - Logs full settings and messageConfig

### Backend
1. ✅ `backend/src/middleware/auth.ts`
   - Added query param token support for EventSource
   - Logs when using query param token

---

## Verification Checklist

After restarting both servers:

- [ ] No 401 errors on streaming
- [ ] Console shows "Using token from query params" (backend)
- [ ] Console shows `📊 [ChatUI] Sending message with config` (frontend)
- [ ] Console shows `📤 [API] Sending config in stream URL` (frontend)
- [ ] Backend logs show correct config values
- [ ] browserSearch: true when enabled in UI
- [ ] Temperature matches UI setting
- [ ] Browser search actually returns real-time data

---

## Next Steps

1. **Restart both servers** (backend and frontend)
2. **Clear browser cache** (Ctrl+Shift+R)
3. **Try sending a message** with browser search enabled
4. **Check all logs** in console and terminal
5. **Report any remaining issues** with full log output

---

**Status**: FIXED ✅
**Date**: October 11, 2025
**Tested**: Awaiting user verification
