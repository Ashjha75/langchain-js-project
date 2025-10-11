# 🚀 Quick Start: Testing Configuration State Management

## Prerequisites

- Backend server running on port 3000
- Frontend running on port 3001
- MongoDB connected
- Authenticated user account

---

## 🧪 5-Minute Test

### Step 1: Create First Conversation (Compound Mini)

1. Open http://localhost:3001
2. Click Settings (gear icon)
3. Configure:
   - **Model**: Compound Mini
   - **System Instructions**: "You are a helpful CS professor"
   - **Temperature**: 1.14
   - **Max Completion Tokens**: 8192
   - **Browser Search**: OFF
4. Close settings
5. Send message: "Hello, introduce yourself"
6. **Note the conversation URL** (e.g., `/chat/67a1b2c3...`)

### Step 2: Create Second Conversation (Different Model)

1. Click "New Chat" button
2. Click Settings
3. Configure:
   - **Model**: OpenAI GPT-OSS-120B (or any other available)
   - **System Instructions**: "You are a creative poet"
   - **Temperature**: 0.7
   - **Browser Search**: ON
4. Close settings
5. Send message: "Write me a haiku"
6. **Note this conversation URL** (e.g., `/chat/89z8y7x6...`)

### Step 3: Verify Settings Persistence

1. Navigate to first conversation URL (Step 1)
2. Open Settings panel
3. ✅ **Verify:**
   - Model shows "Compound Mini"
   - System Instructions: "You are a helpful CS professor"
   - Temperature shows 1.14
   - Browser Search is OFF

4. Navigate to second conversation URL (Step 2)
5. Open Settings panel
6. ✅ **Verify:**
   - Model shows "OpenAI GPT-OSS-120B"
   - System Instructions: "You are a creative poet"
   - Temperature shows 0.7
   - Browser Search is ON

### Step 4: Test Mid-Conversation Change

1. Stay on second conversation
2. Open Settings
3. Change Model to "Compound Mini"
4. ✅ **Verify:** Orange badge appears on Settings button
5. Hover over Settings button
6. ✅ **Verify:** Tooltip shows "⚠️ Settings Changed"
7. Send message: "Continue our conversation"
8. ✅ **Verify:** Orange badge disappears
9. Refresh page (F5)
10. ✅ **Verify:** Model still shows "Compound Mini"

### Step 5: Cross-Contamination Check

1. Navigate back to first conversation (Step 1 URL)
2. Open Settings
3. ✅ **Verify:**
   - Model STILL shows "Compound Mini" (unchanged!)
   - System Instructions STILL shows "CS professor"
   - Temperature STILL shows 1.14
   - Settings were NOT affected by changes in Step 4!

---

## ✅ Success Criteria

Your implementation is working correctly if:

- [x] Each conversation loads its own unique settings
- [x] Settings persist after page refresh
- [x] Orange badge appears when settings change
- [x] Orange badge disappears after sending message
- [x] No cross-contamination between conversations
- [x] System prompts persist and affect AI behavior
- [x] Model changes take effect immediately on next message

---

## 🐛 What to Check if Something Fails

### Settings Don't Load When Switching

**Check Console:**
```
📥 [ConversationConfig] Loading config for conversation: ...
✅ [ConversationConfig] Loaded and cached config: ...
🔄 [ChatUI] Syncing settings with conversation config: ...
```

**If missing:** Check that `useConversationConfig` hook is enabled.

### Orange Badge Doesn't Appear

**Check Console:**
```javascript
// Should see comparison logs in useEffect
Settings: { model: 'gpt-4', ... }
Conversation config: { model: 'compound', ... }
Configs differ: true
```

**If `false`:** Settings comparison logic may have issue.

### Settings Lost After Refresh

**Check localStorage:**
```javascript
localStorage.getItem('runSettings')
```

**Should return:** JSON string with your settings

### Model Not Updating

**Check Backend Logs:**
```
[ChatService] Using effective config for message
  modelOverride: compound → gpt-4  ✅ Should show change
```

**If "none":** Model parameter not being sent to backend.

---

## 📊 Expected Console Output

### When Loading Conversation

```
📥 [ConversationConfig] Loading config for conversation: 67a1b2c3d4e5...
✅ [ConversationConfig] Loaded and cached config: {
  conversationId: "67a1b2c3d4e5...",
  model: "compound",
  systemInstructions: "You are a CS professor",
  temperature: 1.14,
  browserSearch: false
}
🔄 [ChatUI] Syncing settings with conversation config: { ... }
🔄 [RunSettings] Syncing with conversation config: { ... }
✅ [RunSettings] Synced successfully
```

### When Sending Message

```
📊 [ChatUI] Sending message with CURRENT settings: {
  model: "compound",
  systemInstructions: "You are a CS professor",
  messageConfig: { temperature: 1.14, browserSearch: false },
  fullSettings: { ... }
}
📤 Sending to existing conversation - Model: compound Browser: false
📤 [API] Sending model override: compound
```

### Backend Logs

```
[ChatService] Using effective config for message
  conversationId: 67a1b2c3d4e5...
  config: { model: "compound", temperature: 1.14, ... }
  perMessageConfig: { temperature: 1.14, browserSearch: false, ... }
  modelOverride: openai/gpt-oss-120b → compound ✅
  systemPromptOverride: yes ✅

[ChatService] Updating conversation model
  conversationId: 67a1b2c3d4e5...
  oldModel: openai/gpt-oss-120b
  newModel: compound

[ChatService] Message processed successfully
  conversationId: 67a1b2c3d4e5...
  tokensUsed: 245
```

---

## 🎯 Quick Checklist

Run through this in 5 minutes:

1. ⬜ Create conversation with Compound Mini
2. ⬜ Create conversation with different model
3. ⬜ Switch between them → Settings load correctly
4. ⬜ Change model mid-conversation → Badge appears
5. ⬜ Send message → Badge disappears
6. ⬜ Refresh page → Settings still there
7. ⬜ Switch to first conversation → Original settings intact

**All checked?** ✅ System working correctly!

---

## 📞 Need Help?

Check `CONFIG_STATE_MANAGEMENT.md` for detailed documentation, architecture diagrams, and troubleshooting guide.
