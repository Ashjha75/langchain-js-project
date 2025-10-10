# Clipboard JSON Copy Examples

## Overview
When you click the `</>` (Code) icon in the RunSettingsSidebar, it copies the **complete settings JSON** to your clipboard. This JSON includes **ALL parameters**, whether they've been changed or are still at default values.

## Example 1: Default Settings (No Changes)
If you haven't changed anything, the copied JSON will look like this:

```json
{
  "model": "gemini-2.0-flash-exp",
  "maxCompletionTokens": 8192,
  "temperature": 1,
  "topP": 0.95,
  "topK": 40,
  "reasoning": "default",
  "stream": true,
  "responseFormat": "text",
  "jsonMode": false,
  "builtInTools": {
    "codeExecution": false,
    "googleSearch": false
  },
  "advanced": {
    "presencePenalty": 0,
    "frequencyPenalty": 0,
    "stopSequences": [],
    "seed": null,
    "responseMimeType": "text/plain"
  }
}
```

## Example 2: With Some Changes
Let's say you changed:
- Temperature: 1 → 0.7
- Code Execution: false → true
- Max Tokens: 8192 → 4096

The copied JSON will show ALL settings with updated values:

```json
{
  "model": "gemini-2.0-flash-exp",
  "maxCompletionTokens": 4096,
  "temperature": 0.7,
  "topP": 0.95,
  "topK": 40,
  "reasoning": "default",
  "stream": true,
  "responseFormat": "text",
  "jsonMode": false,
  "builtInTools": {
    "codeExecution": true,
    "googleSearch": false
  },
  "advanced": {
    "presencePenalty": 0,
    "frequencyPenalty": 0,
    "stopSequences": [],
    "seed": null,
    "responseMimeType": "text/plain"
  }
}
```

## Example 3: Multiple Advanced Changes
Changed:
- Model: gemini-2.0-flash-exp → gemini-1.5-pro
- Temperature: 1 → 1.5
- Top P: 0.95 → 0.9
- Reasoning: default → thinking
- JSON Mode: false → true
- Google Search: false → true
- Presence Penalty: 0 → 0.5
- Frequency Penalty: 0 → 0.3

Copied JSON:

```json
{
  "model": "gemini-1.5-pro",
  "maxCompletionTokens": 8192,
  "temperature": 1.5,
  "topP": 0.9,
  "topK": 40,
  "reasoning": "thinking",
  "stream": true,
  "responseFormat": "json_object",
  "jsonMode": true,
  "builtInTools": {
    "codeExecution": false,
    "googleSearch": true
  },
  "advanced": {
    "presencePenalty": 0.5,
    "frequencyPenalty": 0.3,
    "stopSequences": [],
    "seed": null,
    "responseMimeType": "application/json"
  }
}
```

## Key Features

### ✅ Always Complete
- **Every parameter is included**, even if unchanged
- No missing fields - you always get the full configuration
- Ready to be sent directly to API or shared with others

### ✅ Current Values
- Shows the **actual current state** of all settings
- Mix of default and modified values
- Exactly what will be used in the next API call

### ✅ Well Formatted
- Pretty-printed with 2-space indentation
- Easy to read and understand
- Can be directly edited and used in code

## Use Cases

### 1. Sharing Configuration
Copy and share your exact settings with teammates:
```bash
"Here are my settings for that prompt:"
[Paste JSON]
```

### 2. Debugging
When reporting issues, include your full settings:
```bash
"The model isn't responding correctly. Here's my config:"
[Paste JSON]
```

### 3. Documentation
Save configurations for different use cases:
```bash
# Creative Writing Settings
{
  "temperature": 1.5,
  "topP": 0.95,
  ...
}

# Code Generation Settings
{
  "temperature": 0.3,
  "topP": 0.9,
  ...
}
```

### 4. API Integration
Directly use in your backend code:
```typescript
const runSettings = {
  "model": "gemini-2.0-flash-exp",
  // ... pasted from clipboard
};

const response = await sendChatRequest(message, runSettings);
```

### 5. Version Control
Track configuration changes over time:
```bash
git diff settings.json
# See exactly what changed between versions
```

## Integration Examples

### Frontend (React/Next.js)
```typescript
// Paste copied JSON
const settings = {
  "model": "gemini-2.0-flash-exp",
  "maxCompletionTokens": 8192,
  // ... rest of settings
};

// Use in API call
const response = await fetch('/api/chat', {
  method: 'POST',
  body: JSON.stringify({
    message: userMessage,
    runSettings: settings
  })
});
```

### Backend (API Route)
```typescript
// api/chat/route.ts
export async function POST(req: Request) {
  const { message, runSettings } = await req.json();
  
  // Format for Gemini API
  const geminiConfig = formatSettingsForGeminiAPI(runSettings);
  
  const result = await model.generateContent({
    contents: [{ role: 'user', parts: [{ text: message }] }],
    generationConfig: geminiConfig
  });
  
  return Response.json(result);
}
```

### Python Backend
```python
import json

# Load from clipboard
settings = {
    "model": "gemini-2.0-flash-exp",
    "maxCompletionTokens": 8192,
    # ... rest of settings
}

# Use with Google AI SDK
response = model.generate_content(
    prompt,
    generation_config={
        "temperature": settings["temperature"],
        "max_output_tokens": settings["maxCompletionTokens"],
        "top_p": settings["topP"],
        "top_k": settings["topK"]
    }
)
```

## JSON Structure Explanation

### Top-Level Parameters
```json
{
  "model": "string",              // AI model identifier
  "maxCompletionTokens": number,  // Max output length
  "temperature": number,          // Randomness (0-2)
  "topP": number,                 // Nucleus sampling (0-1)
  "topK": number,                 // Top-K sampling (0-100)
  "reasoning": "string",          // Reasoning mode
  "stream": boolean,              // Streaming response
  "responseFormat": "string",     // Output format
  "jsonMode": boolean,            // Force JSON output
  "builtInTools": { ... },        // Tool configuration
  "advanced": { ... }             // Advanced options
}
```

### Built-in Tools
```json
"builtInTools": {
  "codeExecution": boolean,  // Enable code execution
  "googleSearch": boolean    // Enable web search
}
```

### Advanced Settings
```json
"advanced": {
  "presencePenalty": number,      // Penalize repeated topics (-2 to 2)
  "frequencyPenalty": number,     // Penalize token repetition (-2 to 2)
  "stopSequences": string[],      // Stop generation at these sequences
  "seed": number | null,          // Reproducibility seed
  "responseMimeType": string      // MIME type of response
}
```

## Validation

### Valid JSON
The copied JSON is always valid and can be:
- ✅ Parsed with `JSON.parse()`
- ✅ Sent in API requests
- ✅ Saved to files
- ✅ Used in configuration systems

### Type Safety
All values match their expected types:
- Strings for model names and formats
- Numbers for tokens, temperature, penalties
- Booleans for flags
- Objects for nested configurations
- Arrays for sequences

## Tips

### Quick Copy-Paste Workflow
1. Adjust settings in sidebar
2. Click `</>` icon
3. See green ✓ confirmation
4. Paste anywhere (Ctrl+V)
5. Use immediately in your code

### Modify After Copy
You can edit the pasted JSON:
```json
{
  "model": "gemini-2.0-flash-exp",  // Change this
  "temperature": 0.7,                // Or this
  // ... rest stays the same
}
```

### Save as Presets
```typescript
// presets.ts
export const CREATIVE_MODE = {
  "model": "gemini-2.0-flash-exp",
  "temperature": 1.8,
  // ...
};

export const PRECISE_MODE = {
  "model": "gemini-1.5-pro",
  "temperature": 0.2,
  // ...
};
```

### Compare Settings
```bash
# Save current settings
cat clipboard > current-settings.json

# Compare with defaults
diff defaults.json current-settings.json

# Or compare two configurations
diff config-v1.json config-v2.json
```

## Troubleshooting

### Clipboard Empty?
- Make sure you clicked the `</>` icon (not Reset or Close)
- Check browser console for errors
- Try again - may need HTTPS or localhost

### JSON Parse Error?
- Copied JSON is always valid
- Check if you accidentally modified it
- Use JSON validator: https://jsonlint.com

### Missing Parameters?
- All parameters are always included
- If you see fewer, check what you pasted
- Re-copy from the sidebar

### Wrong Values?
- JSON shows current state at time of copy
- If settings changed after copy, re-copy
- Reset button only affects UI, not clipboard

---
**Pro Tip:** The copied JSON is production-ready and can be used directly in your API calls without any modifications!
