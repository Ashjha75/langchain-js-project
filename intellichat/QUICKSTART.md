# Quick Start Guide - IntelliChat

## 🚀 Running the Application

### 1. Start Backend Server

```bash
cd backend
npm run dev
```

Server will start on `http://localhost:3002`

### 2. Start Frontend Application

```bash
cd ../intellichatUI
npm run dev
```

Application will start on `http://localhost:3000`

### 3. Access the Application

Open your browser to `http://localhost:3000`

## 📱 Using IntelliChat

### Starting a New Chat

1. Click **"New Chat"** button in the left sidebar
2. Type your message in the input box
3. Press Enter or click Send
4. Watch the AI response stream in real-time!

### Managing Conversations

- **View History**: All conversations appear in the left sidebar
- **Switch Chats**: Click any conversation to open it
- **Search**: Use search bar to find conversations
- **Delete**: Hover over a conversation and click the trash icon

### Configuration

Click the **Settings** button (top-right) to configure:
- AI Model selection
- Temperature settings
- Max tokens
- Streaming options
- Security settings
- Logging preferences

## 🔧 Provider Configuration

### Current Provider: Groq

The backend is currently configured to use Groq:

```env
# backend/.env
AI_PROVIDER=groq
GROQ_API_KEY=your_groq_api_key
```

### Switching to LangChain (Future)

When you're ready to migrate to LangChain:

1. Create the LangChain provider:
```typescript
// backend/src/providers/langchain.ts
export class LangChainProvider implements AIProvider {
  async* sendMessageStream(messages, config) {
    // LangChain implementation
  }
}
```

2. Update provider factory:
```typescript
// backend/src/providers/index.ts
case 'langchain': return new LangChainProvider();
```

3. Change environment variable:
```env
AI_PROVIDER=langchain
LANGCHAIN_API_KEY=your_key
```

4. Restart backend - **No frontend changes needed!**

## 🧪 Testing the Integration

### Test New Chat
```
1. Click "New Chat"
2. Send: "Hello, how are you?"
3. Verify: Stream response appears
4. Check: Conversation appears in sidebar
```

### Test Existing Chat
```
1. Click conversation from sidebar
2. Verify: Messages load
3. Send: "Tell me more"
4. Verify: Streaming works
```

### Test Sidebar Features
```
1. Search conversations
2. Delete a conversation
3. Create multiple chats
4. Switch between them
```

## 🐛 Troubleshooting

### Backend Not Starting
```bash
# Check MongoDB connection
# Verify .env file exists with correct values
cd backend
cat .env

# Install dependencies
npm install

# Check for errors
npm run dev
```

### Frontend Not Connecting
```bash
# Verify API URL in frontend .env
cd intellichatUI
cat .env.local

# Should contain:
NEXT_PUBLIC_API_URL=http://localhost:3002

# Clear cache and restart
rm -rf .next
npm run dev
```

### Streaming Not Working
```bash
# Check browser console for errors
# Verify backend /api/chat/conversations/:id/messages/stream endpoint
# Check CORS settings in backend
# Ensure EventSource is supported in browser
```

### Authentication Issues
```bash
# Clear browser localStorage
# Login again
# Check JWT_SECRET in backend .env
# Verify token expiration settings
```

## 📊 Monitoring

### Backend Logs
Monitor the backend terminal for:
- API requests
- Streaming events
- Database operations
- Provider interactions

### Frontend State
Use React DevTools to inspect:
- useChat hook state
- Conversation data
- Message arrays
- Loading states

### Network Activity
Check browser Network tab for:
- API calls to backend
- EventSource connections
- Authentication headers
- Response payloads

## ✅ Verification Checklist

After starting both servers:

- [ ] Backend running on port 3002
- [ ] Frontend running on port 3000
- [ ] MongoDB connected
- [ ] Can login/register
- [ ] "New Chat" creates conversation
- [ ] Messages stream in real-time
- [ ] Sidebar shows conversations
- [ ] Can search conversations
- [ ] Can delete conversations
- [ ] Can switch between chats
- [ ] Settings sidebar opens
- [ ] Messages persist after refresh

## 🎯 Next Steps

1. **Test Complete Flow**: Go through all features
2. **Check Provider**: Verify Groq responses
3. **Monitor Performance**: Watch API response times
4. **Plan Migration**: Prepare LangChain/LangGraph providers
5. **Add Features**: Extend as needed

## 📚 Documentation

- **Integration Details**: See `INTEGRATION_COMPLETE.md`
- **Architecture Analysis**: See `ARCHITECTURE_ANALYSIS.md`
- **API Reference**: See backend route files
- **Component Docs**: See component JSDoc comments

## 🆘 Support

If you encounter issues:

1. Check error messages in both terminals
2. Verify environment variables
3. Check MongoDB connection
4. Review browser console
5. Validate API endpoints with Postman/curl

## 🎉 Success!

You now have a fully integrated chat application with:
- ✅ Real-time streaming responses
- ✅ Provider-agnostic architecture
- ✅ Complete conversation management
- ✅ Persistent storage
- ✅ Type-safe implementation
- ✅ Ready for provider migration

Enjoy using IntelliChat! 🚀
