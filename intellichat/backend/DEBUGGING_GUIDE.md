# Debugging Guide: /api/chat/send endpoint returning 404

## Current Status
- ✅ Route is properly defined in `src/routes/chat.ts` (line 149)
- ✅ Controller method `send` exists in `src/controllers/chat.ts` (line 182)
- ✅ Routes are properly mounted in `src/app.ts` (line 63)
- ✅ No compilation errors
- ❌ Server returns 404 when calling `/api/chat/send`

## Possible Issues & Solutions

### 1. **Server Not Restarted** ⚠️ MOST LIKELY ISSUE
The server logs show it was shut down at 20:26:53. TypeScript changes require a server restart.

**Solution:**
```bash
# Navigate to backend directory
cd /c/Users/Ashish\ jha/Desktop/PERSONAL/langchain-js-project/intellichat/backend

# Start the server
npm run dev
```

**Verify server is running:**
```bash
curl http://localhost:3002/health
# Should return: {"status":"healthy",...}
```

---

### 2. **Wrong URL or Method**
Make sure you're using the correct endpoint and method.

**✅ CORRECT:**
```
POST http://localhost:3002/api/chat/send
Content-Type: application/json
Authorization: Bearer YOUR_TOKEN

{
  "content": "Hello",
  "model": "openai/gpt-oss-120b"
}
```

**❌ WRONG:**
- `GET http://localhost:3002/api/chat/send` (wrong method)
- `POST http://localhost:3002/api/send` (missing /chat)
- `POST http://localhost:3002/api/chat/send/` (trailing slash)
- `POST http://localhost:3001/api/chat/send` (wrong port - should be 3002)

---

### 3. **Missing Required Fields**
The endpoint requires specific fields in the request body.

**Required fields:**
- `content` (string, 1-10000 chars)
- `model` (string)

**Optional fields:**
- `systemPrompt` (string, max 2000 chars)
- `config` (object with temperature, maxTokens, topP, stream)
- `attachments` (array)

**Example Request:**
```json
{
  "content": "What is TypeScript?",
  "model": "openai/gpt-oss-120b",
  "systemPrompt": "You are a helpful programming assistant",
  "config": {
    "temperature": 0.7,
    "maxTokens": 2048,
    "topP": 0.9,
    "stream": false
  }
}
```

---

### 4. **Authentication Issues**
All `/api/chat/*` routes require authentication.

**Check your token:**
```bash
# Test authentication
curl -X GET http://localhost:3002/api/chat/health \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

**If you get 401:**
- Token might be expired (JWT tokens expire after 15 minutes by default)
- Login again to get a new token:
```bash
curl -X POST http://localhost:3002/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"your@email.com","password":"yourpassword"}'
```

---

### 5. **Postman/Thunder Client Configuration**

#### Postman Settings:
1. **Method:** POST
2. **URL:** `http://localhost:3002/api/chat/send`
3. **Headers:**
   - `Content-Type: application/json`
   - `Authorization: Bearer YOUR_TOKEN`
4. **Body:** (raw JSON)
```json
{
  "content": "Hello, how are you?",
  "model": "openai/gpt-oss-120b"
}
```

#### Common Postman Mistakes:
- ❌ Using form-data instead of raw JSON
- ❌ Not selecting "JSON" from the dropdown
- ❌ Extra spaces in the Authorization header
- ❌ Wrong URL (double-check for typos)

---

## Quick Testing Steps

### Step 1: Start Server
```bash
cd /c/Users/Ashish\ jha/Desktop/PERSONAL/langchain-js-project/intellichat/backend
npm run dev
```

Wait for: `📡 Server running on port 3002`

### Step 2: Test Health Endpoint
```bash
curl http://localhost:3002/health
```

### Step 3: Login to Get Token
```bash
curl -X POST http://localhost:3002/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"ashish.jha@novoinvent.com","password":"YOUR_PASSWORD"}'
```

Copy the `accessToken` from the response.

### Step 4: Test Send Endpoint
```bash
curl -X POST http://localhost:3002/api/chat/send \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "content": "Hello",
    "model": "openai/gpt-oss-120b"
  }'
```

---

## Alternative Endpoints (If /send doesn't work)

If `/api/chat/send` continues to fail, use the two-step approach:

### Option 1: Create Conversation First
```bash
# Step 1: Create conversation
curl -X POST http://localhost:3002/api/chat/conversations \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "title": "My Chat",
    "model": "openai/gpt-oss-120b"
  }'

# Returns: { "data": { "_id": "CONVERSATION_ID", ... } }

# Step 2: Send message
curl -X POST http://localhost:3002/api/chat/conversations/CONVERSATION_ID/messages \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "content": "Hello, how are you?"
  }'
```

---

## Checking Server Logs

When you make a request, check the terminal where server is running:

**Expected logs:**
```
[info]: User authenticated successfully
[info]: Message sent to new conversation
```

**If you see:**
- No logs at all → Server not receiving request (check URL/port)
- `Invalid JWT token` → Token expired or invalid
- `User not authenticated` → Missing/wrong Authorization header
- `Model is required` → Missing model field in body
- `404` in logs → Route not registered (need server restart)

---

## Valid Models

Make sure you're using one of these models:
- `openai/gpt-oss-120b` ✅ (recommended)
- `llama-3.1-8b-instant`
- `llama-3.2-1b-preview`
- `llama-3.2-3b-preview`
- `llama-3.2-11b-vision-preview`
- `llama-3.2-90b-vision-preview`
- `openai/gpt-oss-120b`
- `mixtral-8x7b-32768`
- `gemma-7b-it`
- `gemma2-9b-it`

---

## Still Not Working?

If none of the above works, run this test:

```bash
# List all registered routes (add this temporarily to app.ts)
npm install -g express-list-endpoints
```

Or check the nodemon output when server starts - it should show:
```
Routes initialized successfully
```

If you see any errors during startup, that's the issue!
