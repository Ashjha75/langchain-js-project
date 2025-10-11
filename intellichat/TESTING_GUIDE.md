# Quick Testing Guide - Configuration & Browser Search

## 🚀 Quick Start

### 1. Start the Application
```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend
cd intellichatUI
npm run dev
```

### 2. Open Application
Navigate to: http://localhost:3000

## ✅ Test Browser Search (CRITICAL TEST)

### Test Case 1: Real-Time Information
1. **Open Run Settings** (click settings icon in top-right)
2. **Enable "Browser Search"** toggle
3. **Send message**: "What's the latest news about OpenAI?"
4. **Expected Result**: 
   - AI responds with current, real-time information
   - Response mentions recent events/news
   - Backend logs show: `browserSearch: true`
   - Backend logs show: `🔍 Performing browser search`

### Test Case 2: Without Browser Search
1. **Disable "Browser Search"** in Run Settings
2. **Send message**: "What's the weather in Tokyo right now?"
3. **Expected Result**:
   - AI says it doesn't have real-time data
   - No Tavily API calls in backend logs
   - Backend logs show: `browserSearch: false`

### Test Case 3: Toggle Mid-Conversation
1. Send message: "Hello, how are you?" (no browser search)
2. Enable Browser Search in Run Settings
3. Send message: "What's trending on Twitter today?"
4. **Expected Result**: Second message uses browser search

## ✅ Test Configuration Changes

### Test Case 4: Temperature Changes
1. **Open Run Settings**
2. **Set Temperature to 0.1** (very deterministic)
3. **Send**: "Tell me a creative story"
4. **Check logs**: Should show `temperature: 0.1`
5. **Result**: Story should be less creative, more predictable
6. **Change Temperature to 1.8** (very creative)
7. **Send same message again**
8. **Result**: Story should be more creative and varied

### Test Case 5: Max Tokens
1. **Set Max Completion Tokens to 100**
2. **Send**: "Write a long essay about AI"
3. **Expected**: Response is truncated around 100 tokens
4. **Check logs**: `maxTokens: 100`

### Test Case 6: Top-P (Advanced Settings)
1. **Expand "Advanced Settings"**
2. **Set Top-P to 0.3**
3. **Send message**
4. **Check logs**: Should show `topP: 0.3`

## ✅ Test Streaming

### Test Case 7: Streaming On/Off
1. **Enable "Stream" in Run Settings**
2. **Send message**: "Count from 1 to 50"
3. **Expected**: Response appears word-by-word
4. **Disable "Stream"**
5. **Send same message**
6. **Expected**: Full response appears at once

## 🔍 Backend Log Verification

### What to Look For

#### When Sending Message:
```
Sending message with config {
  temperature: 0.95,
  maxTokens: 8192,
  topP: 1,
  stream: true,
  browserSearch: true,  ← ✅ Should match Run Settings
  codeInterpreter: false
}
```

#### In Service Layer:
```
Using effective config {
  config: {
    model: 'openai/gpt-oss-120b',
    temperature: 0.95,
    maxTokens: 8192,
    topP: 1,
    stream: true,
    systemPrompt: 'You are a helpful AI assistant.',
    browserSearch: true,  ← ✅ Should be true if enabled
    codeInterpreter: false
  },
  perMessageConfig: { browserSearch: true, ... }
}
```

#### When Browser Search Active:
```
🔍 Performing browser search for: "latest news about OpenAI"
🌐 Tavily Search API called with: { query: "...", maxResults: 5 }
✅ Browser search completed, found 5 results
```

## 🐛 Troubleshooting

### Browser Search Not Working?

**Check 1: Frontend Sending Config**
- Open browser DevTools → Network tab
- Send message with browser search enabled
- Find POST request to `/api/chat/:id/message`
- Check Request Payload:
  ```json
  {
    "content": "What's the latest news?",
    "config": {
      "browserSearch": true  ← Should be here!
    }
  }
  ```

**Check 2: Backend Receiving Config**
- Check backend console logs
- Should see: `Sending message with config { browserSearch: true }`
- If missing, frontend issue

**Check 3: Backend Environment**
- Check `backend/.env` has `TAVILY_API_KEY=...`
- If missing, browser search won't work

**Check 4: AI Provider Config**
- Check logs for: `Using effective config`
- Verify `browserSearch: true` in the config object

### Configuration Not Applied?

**Check 1: Run Settings Context**
- Verify `RunSettingsProvider` wraps the app
- Check `intellichatUI/src/app/layout.tsx` or similar

**Check 2: ChatUI Using Context**
- Check `ChatUI.tsx` has `useRunSettingsContext()` import
- Verify `messageConfig` is created from `settings`

**Check 3: Type Errors**
- Run `npm run build` to check for TypeScript errors
- Fix any type mismatches

## 📊 Success Indicators

### ✅ Everything Working:
- [ ] Run Settings changes visible in backend logs
- [ ] Browser search returns real-time data
- [ ] Temperature changes affect response style
- [ ] Max tokens limits response length
- [ ] Streaming toggle works correctly
- [ ] No TypeScript errors
- [ ] No console errors in browser

### ❌ Issues to Watch For:
- [ ] `config` undefined in backend logs → Frontend not sending
- [ ] Browser search enabled but no Tavily logs → Backend issue
- [ ] Config changes not reflected → Context not wired
- [ ] TypeScript errors → Interface mismatch

## 🎉 Expected User Experience

### Before Fix:
- User enables browser search → Nothing happens
- User changes temperature → AI behavior unchanged
- User frustrated: "this is very bad you are not listening"

### After Fix:
- User enables browser search → AI provides real-time data ✅
- User changes temperature → AI responses adapt ✅
- User changes max tokens → Responses respect limit ✅
- User sees immediate effect from Run Settings ✅

## 📝 Test Results Template

Copy this template to track your testing:

```
BROWSER SEARCH TEST
==================
✅ Test 1: Real-time query with search enabled
   - Enabled browser search: [ ]
   - Sent message: "____________"
   - Got real-time data: [ ]
   - Logs show browserSearch: true: [ ]

✅ Test 2: Query without search
   - Disabled browser search: [ ]
   - Sent message: "____________"
   - AI says no real-time data: [ ]
   - Logs show browserSearch: false: [ ]

CONFIGURATION TEST
==================
✅ Test 3: Temperature change
   - Changed to: ____
   - Logs show correct value: [ ]
   - Response style changed: [ ]

✅ Test 4: Max tokens
   - Set to: ____
   - Response length limited: [ ]
   - Logs show correct value: [ ]

STREAMING TEST
==============
✅ Test 5: Streaming toggle
   - Enabled: [ ] Disabled: [ ]
   - Behavior correct: [ ]
```

---

**Remember**: Changes to Run Settings should take effect on the NEXT message you send. Current message won't be affected.
