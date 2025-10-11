# 🚀 Quick Restart & Test Guide

## Critical Fixes Applied

1. ✅ **Authentication for Streaming** - Fixed 401 error by adding token to query params
2. ✅ **Config in Stream URL** - Browser search and all settings now sent with streaming
3. ✅ **Added Comprehensive Logging** - Track config flow from UI to backend

---

## 📋 Restart Steps (REQUIRED)

### Step 1: Stop All Servers
```bash
# In all terminal windows, press Ctrl+C to stop servers
```

### Step 2: Restart Backend
```bash
cd backend
npm run dev
```

**Wait for**: `Server running on port 3002` ✅

### Step 3: Restart Frontend
```bash
cd intellichatUI
npm run dev
```

**Wait for**: `✓ Ready in ...ms` ✅

### Step 4: Clear Browser Cache
- Press `Ctrl + Shift + R` (Windows/Linux)
- Or `Cmd + Shift + R` (Mac)
- Or right-click refresh → "Empty Cache and Hard Reload"

---

## 🧪 Quick Test (2 Minutes)

### Test 1: Browser Search
1. Navigate to http://localhost:3000
2. Open a chat
3. **Open Browser Console** (F12)
4. **Open Run Settings** (settings icon)
5. **Enable "Browser Search"** toggle
6. **Send message**: "What's the weather in Tokyo right now?"

### Expected Result:
✅ **Browser Console Shows**:
```
📊 [ChatUI] Sending message with config: {
  browserSearchEnabled: true  ← Must be true
}
```
```
📤 [API] Sending config in stream URL: {
  browserSearch: true  ← Must be true
}
```

✅ **Backend Terminal Shows**:
```
[INFO] Using token from query params for EventSource request
[INFO] Using effective config for stream {
  config: { browserSearch: true }  ← Must be true
}
[INFO] 🔍 Performing browser search for: weather in Tokyo
```

✅ **AI Response**:
- Should include current weather data
- Should mention real-time information
- NOT: "I don't have internet access"

---

## 🐛 If Issues Persist

### 401 Error Still Happening?

1. **Check if logged in**:
   ```javascript
   // In browser console
   localStorage.getItem('user')
   ```
   If null → Please log in again

2. **Check URL in Network tab**:
   - Should contain `?token=eyJhbGc...`
   - If missing → Backend middleware issue

### Browser Search Still False?

1. **Check console logs**:
   - Look for `📊 [ChatUI] Sending message with config`
   - Check `browserSearchEnabled` value

2. **Check Run Settings state**:
   ```javascript
   // In browser console
   localStorage.getItem('runSettings')
   ```

3. **Try toggling OFF then ON again**

### No Logs Appearing?

1. **Make sure you restarted servers**
2. **Clear browser cache again**
3. **Check correct terminals** (backend shows backend logs, browser shows frontend logs)

---

## 📊 What Changed (Technical)

### Frontend Changes
**File**: `intellichatUI/src/lib/chat-api.ts`
- Fixed token extraction: Now reads from `user.tokens.accessToken`
- Added config to stream URL: `url.searchParams.set('config', JSON.stringify(request.config))`
- Added logging at API layer

**File**: `intellichatUI/src/components/chat/ChatUI.tsx`
- Added logging before sending message
- Shows full settings and config being sent

### Backend Changes
**File**: `backend/src/middleware/auth.ts`
- Added support for token in query params: `req.query.token`
- Required for EventSource which can't send headers

---

## ✅ Success Criteria

After restart, you should have:
- [x] No 401 errors
- [x] Console logs showing config with correct values
- [x] browserSearch: true when enabled
- [x] Backend receiving correct config
- [x] Browser search returning real-time data
- [x] All settings from UI matching backend logs

---

## 📞 Still Having Issues?

Please share:
1. **Browser console screenshot** (showing the logs)
2. **Backend terminal output** (last 20 lines)
3. **Run Settings screenshot** (what you have enabled)
4. **Network tab screenshot** (the EventSource request URL)

This will help diagnose any remaining issues!

---

**Remember**: Must restart BOTH servers for changes to take effect!
