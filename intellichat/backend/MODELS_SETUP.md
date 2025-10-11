# AI Models Database Setup

## Overview

The AI models are now stored in MongoDB instead of being hardcoded in the configuration. This allows for dynamic model management and updates without code changes.

## Database Schema

The `AIModel` schema is defined in `backend/src/models/aiModel.ts` and includes:
- Model ID and metadata
- Feature flags (chat, tools, JSON mode, etc.)
- Pricing information (batch and on-demand)
- Rate limits and constraints
- Owner/provider information

## Initial Setup

### 1. Seed the Database

Run the seeding script to populate the database with models from `intellichatUI/src/config/models.ts`:

```bash
cd backend
npm run seed:models
```

Or manually:

```bash
cd backend
npx tsx src/scripts/seedModels.ts
```

This will:
- Clear existing models from the database
- Insert all models from the models.ts configuration
- Log a summary of inserted models by provider

### 2. Verify Models Are Loaded

Check the API endpoint to see loaded models:

```bash
curl http://localhost:3002/api/models
```

Or visit in browser: `http://localhost:3002/api/models`

## API Endpoints

### Get All Models
```
GET /api/models
```
Returns all active models from the database.

### Get Specific Model
```
GET /api/models/:modelId
```
Example: `GET /api/models/openai/gpt-oss-120b`

### Get Models by Provider
```
GET /api/models/provider/:provider
```
Example: `GET /api/models/provider/OpenAI`

### Reload Configuration
```
POST /api/models/reload
```
Syncs with database and returns count of active models.

## Adding New Models

### Option 1: Update models.ts and Re-seed

1. Edit `intellichatUI/src/config/models.ts`
2. Add your new model object
3. Run the seed script again: `npm run seed:models`

### Option 2: Direct Database Insert

Use MongoDB Compass or CLI to insert a new model document directly:

```javascript
db.ai_models.insertOne({
  "id": "provider/model-name",
  "object": "model",
  "created": Date.now(),
  "owned_by": "Provider Name",
  "active": true,
  "context_window": 131072,
  "max_completion_tokens": 8192,
  "features": {
    "chat": true,
    "tools": true,
    "json_mode": true,
    "max_input_images": 0,
    "transcription": false,
    "audio_translation": false,
    "is_batch_enabled": false
  },
  "metadata": {
    "display_name": "Model Display Name",
    "release_stage": "production",
    "limits": {
      "requests_per_minute": 30,
      "requests_per_day": 1000,
      "tokens_per_minute": 8000,
      "tokens_per_day": 200000
    }
  },
  "can_run": true
})
```

## Logging

### Frontend Logging

The frontend now logs all API requests with:
- 🚀 Request details (model, config, timestamp)
- ✅ Response details (status, tokens used)
- ❌ Error details

Check your browser console to see:
```
🚀 [API Request] Creating conversation: { model: 'openai/gpt-oss-120b', config: {...} }
✅ [API Response] Conversation created: { conversationId: '...', model: '...' }
```

### Backend Logging

The backend Groq provider logs all API calls:
- 🚀 [GROQ API REQUEST] - Full UI config sent to Groq
- ✅ [GROQ API RESPONSE] - Response details
- ❌ [GROQ API ERROR] - Error details

Check backend logs:
```bash
cd backend
npm run dev
```

Look for logs like:
```
[INFO] 🚀 [GROQ API REQUEST] Starting generation {
  model: 'openai/gpt-oss-120b',
  temperature: 0.95,
  maxCompletionTokens: 8192,
  stream: true,
  ...
}
```

## Configuration Files

### Frontend
- `intellichatUI/src/config/models.ts` - Model definitions (source of truth)
- `intellichatUI/src/config/runSettingsDefaults.ts` - Default UI settings

### Backend
- `backend/src/models/aiModel.ts` - Mongoose schema
- `backend/src/scripts/seedModels.ts` - Seeding script
- `backend/src/controllers/models.ts` - API endpoints

## Default Model

The default model is now set to `openai/gpt-oss-120b` in:
- `intellichatUI/src/config/runSettingsDefaults.ts`
- `intellichatUI/src/components/chat/ChatUI.tsx`

Make sure this model exists in your database after seeding.

## Troubleshooting

### Models Not Showing Up

1. Check if seeding was successful:
```bash
npx tsx src/scripts/seedModels.ts
```

2. Verify database connection in `.env`:
```
MONGO_URI=mongodb://localhost:27017/intellichat
```

3. Check MongoDB directly:
```bash
mongosh
use intellichat
db.ai_models.find().pretty()
```

### Model Not Found Error

Ensure the model ID in your request matches the `id` field in the database exactly:
- Frontend uses: `openai/gpt-oss-120b`
- Database should have: `{ id: "openai/gpt-oss-120b" }`

### No Logs Appearing

**Frontend:** Open browser console (F12)
**Backend:** Check terminal where `npm run dev` is running

## Package.json Script

Add this to `backend/package.json`:

```json
{
  "scripts": {
    "seed:models": "tsx src/scripts/seedModels.ts"
  }
}
```

## Next Steps

1. Run the seed script
2. Test the API endpoints
3. Verify models appear in the UI
4. Check logs in browser console and backend terminal
5. Create your first chat with the default model!
