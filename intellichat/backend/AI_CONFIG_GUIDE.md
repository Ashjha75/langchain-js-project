# AI Model Configuration System

## 📋 Overview

This system provides a **centralized, single source of truth** for all AI model configurations. All APIs that need model configurations or parameters will read from this central configuration.

## 🎯 Key Benefits

1. **Single Source of Truth**: All model configs in one JSON file
2. **Easy Updates**: Change once, applies everywhere
3. **Type Safety**: Full TypeScript support
4. **Hot Reload**: Reload config without restarting server
5. **Validation**: Automatic validation and limit enforcement
6. **Provider Support**: Support multiple AI providers (Groq, OpenRouter, etc.)

---

## 📁 File Structure

```
src/
├── config/
│   ├── ai-models.json          # 👈 MAIN CONFIG FILE - Edit this!
│   └── ai-config.ts             # Configuration manager
├── controllers/
│   └── models.ts                # API endpoints for models
└── routes/
    └── models.ts                # Model routes
```

---

## 🔧 How to Add/Update Models

### Edit `src/config/ai-models.json`

```json
{
  "models": {
    "groq": {
      "YOUR-MODEL-ID": {
        "provider": "groq",
        "modelId": "YOUR-MODEL-ID",
        "displayName": "Display Name",
        "description": "Model description",
        "enabled": true,              // ⭐ Set to false to disable
        "config": {
          "temperature": 0.98,        // 0-2
          "maxTokens": 8192,          // Max output tokens
          "topP": 1,                  // 0-1
          "stream": true,             // true/false
          "reasoning": "medium",      // low/medium/high
          "seed": null,               // Optional: for reproducibility
          "stopSequence": ""          // Optional: stop generation
        },
        "features": {
          "jsonMode": false,          // JSON output mode
          "browserSearch": false,     // Web search capability
          "codeInterpreter": false,   // Code execution
          "moderation": false         // Content moderation
        },
        "limits": {
          "maxCompletionTokens": 8192,   // Hard limit
          "contextWindow": 32768         // Total context size
        }
      }
    }
  },
  "defaultModel": "llama-3.1-70b-versatile",
  "defaultProvider": "groq"
}
```

### Example: Your Gemini Flash Configuration

```json
{
  "models": {
    "groq": {
      "gemini-flash-latest": {
        "provider": "groq",
        "modelId": "gemini-flash-latest",
        "displayName": "Gemini Flash (Latest)",
        "description": "Fast and efficient Gemini model",
        "enabled": true,
        "config": {
          "temperature": 0.98,
          "maxTokens": 8192,
          "topP": 1,
          "stream": true,
          "reasoning": "medium"
        },
        "features": {
          "jsonMode": false,
          "browserSearch": false,
          "codeInterpreter": false,
          "moderation": false
        },
        "limits": {
          "maxCompletionTokens": 8192,
          "contextWindow": 32768
        }
      }
    }
  }
}
```

---

## 🚀 API Endpoints

### 1. Get All Available Models

```bash
GET /api/models

Response:
{
  "success": true,
  "data": {
    "models": [
      {
        "id": "llama-3.1-70b-versatile",
        "name": "LLaMA 3.1 70B",
        "description": "High-performance general-purpose model",
        "provider": "groq",
        "config": { ... },
        "features": { ... },
        "limits": { ... }
      }
    ],
    "defaultModel": "llama-3.1-70b-versatile",
    "defaultProvider": "groq"
  }
}
```

### 2. Get Specific Model Configuration

```bash
GET /api/models/gemini-flash-latest

Response:
{
  "success": true,
  "data": {
    "id": "gemini-flash-latest",
    "name": "Gemini Flash (Latest)",
    "provider": "groq",
    "enabled": true,
    "config": {
      "temperature": 0.98,
      "maxTokens": 8192,
      ...
    }
  }
}
```

### 3. Get Models by Provider

```bash
GET /api/models/provider/groq

Response:
{
  "success": true,
  "data": [
    { /* model 1 */ },
    { /* model 2 */ }
  ]
}
```

### 4. Reload Configuration (Admin Only)

```bash
POST /api/models/reload
Authorization: Bearer YOUR_ADMIN_TOKEN

Response:
{
  "success": true,
  "message": "Configuration reloaded successfully"
}
```

---

## 💻 Usage in Code

### Get Model Configuration

```typescript
import { aiConfigManager, getMergedConfig } from '@/config/ai-config';

// Get model config
const modelConfig = aiConfigManager.getModelConfig('gemini-flash-latest');

// Get merged config (user overrides + defaults)
const config = getMergedConfig('gemini-flash-latest', {
  temperature: 0.5,  // User override
  maxTokens: 4096    // User override
});
// Returns: { temperature: 0.5, maxTokens: 4096, topP: 1, stream: true, ... }
```

### Validate Model

```typescript
import { isValidModel } from '@/config/ai-config';

if (!isValidModel('some-model-id')) {
  throw new Error('Invalid model');
}
```

### Get All Enabled Models

```typescript
import { getEnabledModels } from '@/config/ai-config';

const models = getEnabledModels();
// Returns array of all enabled models
```

---

## 🔄 How APIs Use This System

### Example: Chat API with Model Config

```typescript
// src/services/chat.ts
import { aiConfigManager } from '@/config/ai-config';

async function sendMessage(data: { model: string, userConfig?: any }) {
  // 1. Get merged configuration
  const modelConfig = aiConfigManager.getMergedConfig(
    data.model,
    data.userConfig
  );
  
  // 2. Use the config for AI API call
  const response = await groqClient.chat.completions.create({
    model: data.model,
    temperature: modelConfig.temperature,
    max_tokens: modelConfig.maxTokens,
    top_p: modelConfig.topP,
    stream: modelConfig.stream,
    // ... other configs
  });
  
  return response;
}
```

### Example: Request Body

When making API calls to `/api/chat/send`, you can now use your model:

```json
POST /api/chat/send
{
  "content": "Hello!",
  "model": "gemini-flash-latest",
  "config": {
    "temperature": 0.5,   // Optional: override default
    "maxTokens": 4000     // Optional: override default
  }
}
```

The system will:
1. ✅ Validate the model exists
2. ✅ Check if model is enabled
3. ✅ Merge user config with defaults
4. ✅ Enforce limits (e.g., maxTokens <= maxCompletionTokens)
5. ✅ Use the merged config for the API call

---

## 🎨 Configuration Features

### Automatic Limit Enforcement

```typescript
// If model has maxCompletionTokens: 8192
// User requests: maxTokens: 10000
// System enforces: maxTokens: 8192 (capped at limit)
```

### Default Values

```typescript
// If user doesn't provide config, uses model defaults
const config = getMergedConfig('gemini-flash-latest');
// Returns: { temperature: 0.98, maxTokens: 8192, ... }
```

### Type Safety

```typescript
interface ModelConfig {
  temperature: number;     // 0-2
  maxTokens: number;       // Positive integer
  topP: number;            // 0-1
  stream: boolean;
  reasoning?: 'low' | 'medium' | 'high';
  seed?: number | null;
  stopSequence?: string;
}
```

---

## 🔥 Hot Reload

Update `ai-models.json` and reload without restarting:

```bash
# 1. Edit ai-models.json
# 2. Call reload endpoint
curl -X POST http://localhost:3002/api/models/reload \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"

# 3. New config is live immediately!
```

---

## ✅ Best Practices

### 1. Single Source of Truth
- ✅ DO: Edit `ai-models.json` for all model configs
- ❌ DON'T: Hardcode configs in code

### 2. Enable/Disable Models
```json
{
  "enabled": false  // Model won't be available in API
}
```

### 3. Add New Providers
```json
{
  "models": {
    "groq": { ... },
    "openai": {
      "gpt-4": { ... }
    },
    "anthropic": {
      "claude-3": { ... }
    }
  }
}
```

### 4. Version Control
- Commit `ai-models.json` to git
- Track changes over time
- Easy rollback if needed

---

## 🎯 Example Workflow

### Scenario: You want to add a new model

1. **Edit `src/config/ai-models.json`:**
```json
{
  "models": {
    "groq": {
      "new-awesome-model": {
        "provider": "groq",
        "modelId": "new-awesome-model",
        "displayName": "New Awesome Model",
        "description": "Latest and greatest",
        "enabled": true,
        "config": {
          "temperature": 0.7,
          "maxTokens": 4096,
          "topP": 0.9,
          "stream": true
        },
        "features": {
          "jsonMode": true,
          "browserSearch": false,
          "codeInterpreter": false,
          "moderation": false
        },
        "limits": {
          "maxCompletionTokens": 8192,
          "contextWindow": 32768
        }
      }
    }
  }
}
```

2. **Restart server OR call reload endpoint**

3. **Use the model immediately:**
```bash
POST /api/chat/send
{
  "content": "Test message",
  "model": "new-awesome-model"
}
```

**That's it!** No code changes needed! 🎉

---

## 📝 Summary

✅ **One file to rule them all**: `ai-models.json`  
✅ **All APIs use it**: Chat, completions, streaming, etc.  
✅ **Easy updates**: Change once, works everywhere  
✅ **Type-safe**: Full TypeScript support  
✅ **Validated**: Automatic limit enforcement  
✅ **Hot reload**: No server restart needed  

**Your JSON config is now the single source of truth for all AI model configurations!** 🚀
