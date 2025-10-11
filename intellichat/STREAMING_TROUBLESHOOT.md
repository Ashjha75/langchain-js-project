# Streaming Connection Troubleshooting

## ERR_CONNECTION_REFUSED - Quick Fix Guide

### Issue
```
EventSource failed: ERR_CONNECTION_REFUSED
URL: http://localhost:3002/api/chat/conversations/.../messages/stream
```

---

## Quick Fixes (Try in Order)

### 1. ✅ Check Backend is Running

```bash
# Open terminal and navigate to backend
cd c:\Users\Ashish jha\Desktop\PERSONAL\langchain-js-project\intellichat\backend

# Start backend
npm run dev
```

**Expected Output**:
```
Server running on port 3002
MongoDB connected successfully
✓ All systems operational
```

**If you don't see this**, backend is not running!

---

### 2. ✅ Check Port 3002 is Free

**Windows**:
```bash
netstat -ano | findstr :3002
```

**If something is using it**:
```bash
# Kill the process
taskkill /F /PID <process_id>
```

**Mac/Linux**:
```bash
lsof -i :3002
kill -9 <PID>
```

---

### 3. ✅ Test Backend Directly

**Open browser and visit**:
```
http://localhost:3002/health
```

**Should see**:
```json
{
  "status": "healthy",
  "timestamp": "2025-10-12T...",
  "environment": "development"
}
```

**If you can't access this**, backend has an issue!

---

### 4. ✅ Check .env File

**File**: `backend/.env`

**Must have**:
```env
PORT=3002
MONGODB_URI=mongodb://localhost:27017/intellichat
JWT_ACCESS_SECRET=your-secret-here
GROQ_API_KEY=your-groq-key
TAVILY_API_KEY=your-tavily-key
CORS_ORIGIN=*
```

**If PORT is different**, update frontend:

**File**: `intellichatUI/.env.local`
```env
NEXT_PUBLIC_API_URL=http://localhost:3002/api
```

---

### 5. ✅ Clear Browser Cache

1. Open DevTools (F12)
2. Right-click refresh button
3. Select "Empty Cache and Hard Reload"
4. Close all browser tabs
5. Reopen application

---

### 6. ✅ Check Firewall/Antivirus

**Windows Defender**:
1. Open Windows Security
2. Firewall & network protection
3. Allow an app through firewall
4. Find "Node.js" and enable for Private networks

**Third-party antivirus**:
- Temporarily disable
- Try sending message
- If works, add exception for Node.js

---

### 7. ✅ Try Different Browser

Sometimes browser extensions block WebSockets/EventSource:
- Try Chrome Incognito
- Try Firefox Private Window
- Disable all extensions

---

### 8. ✅ Check Token is Valid

**Browser Console**:
```javascript
const user = localStorage.getItem('user');
if (!user) {
  console.error('❌ Not logged in!');
} else {
  const parsed = JSON.parse(user);
  console.log('Token exists:', !!parsed.tokens.accessToken);
  console.log('Expires:', new Date(parsed.tokens.accessTokenExpiry));
}
```

**If expired**, log out and log back in.

---

### 9. ✅ Check Backend Logs for Errors

When you try to send a message, check terminal where backend is running.

**Look for**:
```
[ERROR] EventSource connection failed
[ERROR] Token validation failed
[ERROR] Database connection error
```

**Common errors**:
- MongoDB not running → Start MongoDB
- Invalid token → Re-login
- Port in use → Kill process

---

### 10. ✅ Test with curl (Advanced)

```bash
curl -X GET "http://localhost:3002/api/chat/conversations/YOUR_CONVERSATION_ID/messages/stream?content=test&token=YOUR_TOKEN"
```

Replace:
- `YOUR_CONVERSATION_ID` - from URL
- `YOUR_TOKEN` - from localStorage (see step 8)

**If this fails**, backend issue. Check logs.

---

## Still Not Working?

### Restart Everything

```bash
# Stop all processes
# Backend terminal: Ctrl+C
# Frontend terminal: Ctrl+C

# Kill all node processes
taskkill /F /IM node.exe  # Windows
pkill node                # Mac/Linux

# Start MongoDB (if not running)
# Windows: net start MongoDB
# Mac: brew services start mongodb-community
# Linux: sudo systemctl start mongod

# Start backend
cd backend
npm run dev

# Wait for "Server running on port 3002"

# Start frontend  
cd intellichatUI
npm run dev

# Wait for "✓ Ready in ...ms"

# Visit http://localhost:3000
# Clear cache (Ctrl+Shift+R)
# Try again
```

---

## Debug Checklist

Copy this and fill in:

```
[ ] Backend running on port 3002
[ ] Frontend running on port 3000
[ ] MongoDB running and connected
[ ] http://localhost:3002/health returns 200
[ ] User logged in (token in localStorage)
[ ] Token not expired
[ ] Port 3002 not blocked by firewall
[ ] No errors in backend terminal
[ ] No errors in browser console (besides the connection error)
[ ] CORS_ORIGIN set correctly in backend .env
[ ] NEXT_PUBLIC_API_URL correct in frontend .env
```

---

## Alternative: Use Non-Streaming Mode

If streaming still doesn't work, you can use non-streaming:

**Frontend** - `intellichatUI/src/config/runSettingsDefaults.ts`:
```typescript
export const DEFAULT_RUN_SETTINGS: RunSettingsConfig = {
  // ... other settings ...
  stream: false,  // ← Change to false
};
```

This will use regular HTTP POST instead of EventSource (SSE).

**Trade-off**: No word-by-word streaming, but messages will still work.

---

## Get Help

If nothing works, provide:

1. **Backend terminal output** (last 50 lines)
2. **Browser console errors** (screenshot)
3. **Network tab** (screenshot of failed request)
4. **Output of**:
   ```bash
   netstat -ano | findstr :3002
   curl http://localhost:3002/health
   ```

This will help diagnose the exact issue!

---

**Most Common Solution**: Backend not running or running on wrong port! 🎯
