# Markdown Response Handling Guide

## 📋 Overview

The backend now returns AI responses in **Markdown format** with metadata indicating the content type. Your frontend needs to render this Markdown as formatted HTML.

---

## 🎯 Response Format

### Example Response:

```json
{
  "success": true,
  "message": "Message sent successfully",
  "data": {
    "_id": "68e9240658e70b1901998a85",
    "conversationId": "68e9240658e70b1901998a84",
    "role": "assistant",
    "content": "## Heading\n\nThis is **bold** and *italic* text...",
    "contentType": "markdown",  // 👈 Content type indicator
    "formatted": {
      "isMarkdown": true,
      "hasCodeBlocks": true,
      "hasTables": true,
      "hasHeaders": true
    },
    "tokens": {
      "prompt": 82,
      "completion": 2048,
      "total": 2130
    },
    "metadata": {
      "model": "openai/gpt-oss-120b",
      "provider": "groq",
      "contentType": "markdown"
    }
  }
}
```

---

## 🎨 Frontend Solutions

### **Option 1: React with `react-markdown` (Recommended)**

#### Installation:
```bash
npm install react-markdown remark-gfm rehype-highlight
```

#### Usage:
```tsx
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import 'highlight.js/styles/github-dark.css'; // Code syntax theme

interface Message {
  content: string;
  contentType?: string;
  formatted?: {
    isMarkdown: boolean;
    hasCodeBlocks: boolean;
    hasTables: boolean;
  };
}

function MessageComponent({ message }: { message: Message }) {
  return (
    <div className="message">
      {message.contentType === 'markdown' || message.formatted?.isMarkdown ? (
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}  // For tables, strikethrough, etc.
          rehypePlugins={[rehypeHighlight]}  // For code syntax highlighting
          components={{
            // Custom styling for elements
            h1: ({ node, ...props }) => <h1 className="text-2xl font-bold my-4" {...props} />,
            h2: ({ node, ...props }) => <h2 className="text-xl font-bold my-3" {...props} />,
            h3: ({ node, ...props }) => <h3 className="text-lg font-bold my-2" {...props} />,
            p: ({ node, ...props }) => <p className="my-2" {...props} />,
            code: ({ node, inline, ...props }) => 
              inline ? (
                <code className="bg-gray-100 px-1 rounded" {...props} />
              ) : (
                <code className="block bg-gray-900 text-white p-4 rounded my-2" {...props} />
              ),
            table: ({ node, ...props }) => (
              <div className="overflow-x-auto my-4">
                <table className="min-w-full border-collapse border" {...props} />
              </div>
            ),
            th: ({ node, ...props }) => (
              <th className="border px-4 py-2 bg-gray-100 font-bold" {...props} />
            ),
            td: ({ node, ...props }) => (
              <td className="border px-4 py-2" {...props} />
            ),
          }}
        >
          {message.content}
        </ReactMarkdown>
      ) : (
        <p>{message.content}</p>
      )}
    </div>
  );
}
```

---

### **Option 2: Vue with `marked` and `DOMPurify`**

#### Installation:
```bash
npm install marked dompurify highlight.js
npm install --save-dev @types/marked @types/dompurify
```

#### Usage:
```vue
<template>
  <div class="message">
    <div
      v-if="isMarkdown"
      class="markdown-content"
      v-html="renderedContent"
    />
    <p v-else>{{ message.content }}</p>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { marked } from 'marked';
import DOMPurify from 'dompurify';
import hljs from 'highlight.js';
import 'highlight.js/styles/github-dark.css';

interface Message {
  content: string;
  contentType?: string;
  formatted?: {
    isMarkdown: boolean;
  };
}

const props = defineProps<{
  message: Message;
}>();

// Configure marked
marked.setOptions({
  highlight: function(code, lang) {
    if (lang && hljs.getLanguage(lang)) {
      return hljs.highlight(code, { language: lang }).value;
    }
    return hljs.highlightAuto(code).value;
  },
  gfm: true, // GitHub Flavored Markdown
  breaks: true,
});

const isMarkdown = computed(() => 
  props.message.contentType === 'markdown' || 
  props.message.formatted?.isMarkdown
);

const renderedContent = computed(() => {
  if (isMarkdown.value) {
    const html = marked(props.message.content);
    return DOMPurify.sanitize(html); // Sanitize for security
  }
  return props.message.content;
});
</script>

<style>
.markdown-content {
  line-height: 1.6;
}

.markdown-content h1 {
  font-size: 2rem;
  font-weight: bold;
  margin: 1rem 0;
}

.markdown-content h2 {
  font-size: 1.5rem;
  font-weight: bold;
  margin: 0.75rem 0;
}

.markdown-content table {
  border-collapse: collapse;
  width: 100%;
  margin: 1rem 0;
}

.markdown-content th,
.markdown-content td {
  border: 1px solid #ddd;
  padding: 8px;
}

.markdown-content th {
  background-color: #f3f4f6;
  font-weight: bold;
}

.markdown-content code {
  background-color: #f3f4f6;
  padding: 2px 4px;
  border-radius: 3px;
}

.markdown-content pre {
  background-color: #1f2937;
  color: white;
  padding: 1rem;
  border-radius: 5px;
  overflow-x: auto;
}
</style>
```

---

### **Option 3: Plain JavaScript with `marked`**

#### Installation:
```bash
npm install marked dompurify highlight.js
```

#### Usage:
```javascript
import { marked } from 'marked';
import DOMPurify from 'dompurify';
import hljs from 'highlight.js';
import 'highlight.js/styles/github-dark.css';

// Configure marked
marked.setOptions({
  highlight: function(code, lang) {
    if (lang && hljs.getLanguage(lang)) {
      return hljs.highlight(code, { language: lang }).value;
    }
    return hljs.highlightAuto(code).value;
  },
  gfm: true,
  breaks: true,
});

function renderMessage(message) {
  const container = document.getElementById('message-container');
  
  if (message.contentType === 'markdown' || message.formatted?.isMarkdown) {
    // Render as Markdown
    const html = marked(message.content);
    const clean = DOMPurify.sanitize(html);
    container.innerHTML = clean;
  } else {
    // Render as plain text
    container.textContent = message.content;
  }
}

// Usage
fetch('http://localhost:3002/api/chat/send', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer YOUR_TOKEN'
  },
  body: JSON.stringify({
    content: "Explain machine learning",
    model: "openai/gpt-oss-120b"
  })
})
.then(res => res.json())
.then(data => {
  renderMessage(data.data.message);
});
```

---

## 📦 Popular Markdown Libraries

### React:
- ✅ **`react-markdown`** - Most popular, component-based
- ✅ **`markdown-to-jsx`** - Fast, converts MD to JSX
- ✅ **`remark` + `rehype`** - Plugin-based ecosystem

### Vue:
- ✅ **`marked`** - Fast, lightweight
- ✅ **`markdown-it`** - Extensible with plugins
- ✅ **`@nuxt/content`** - For Nuxt.js projects

### Angular:
- ✅ **`ngx-markdown`** - Angular wrapper for marked
- ✅ **`markdown-it`** - Direct usage

### Vanilla JS:
- ✅ **`marked`** - Fast, simple
- ✅ **`markdown-it`** - Extensible
- ✅ **`showdown`** - Bidirectional MD ↔ HTML

---

## 🎨 CSS Styling

### GitHub-style Markdown:
```bash
npm install github-markdown-css
```

```tsx
import 'github-markdown-css/github-markdown.css';

<div className="markdown-body">
  <ReactMarkdown>{content}</ReactMarkdown>
</div>
```

### Custom Tailwind CSS:
```css
.markdown-content h1 {
  @apply text-3xl font-bold mb-4;
}

.markdown-content h2 {
  @apply text-2xl font-bold mb-3;
}

.markdown-content h3 {
  @apply text-xl font-bold mb-2;
}

.markdown-content p {
  @apply mb-4;
}

.markdown-content ul {
  @apply list-disc list-inside mb-4;
}

.markdown-content ol {
  @apply list-decimal list-inside mb-4;
}

.markdown-content code {
  @apply bg-gray-100 px-1 rounded text-sm;
}

.markdown-content pre {
  @apply bg-gray-900 text-white p-4 rounded overflow-x-auto mb-4;
}

.markdown-content table {
  @apply w-full border-collapse mb-4;
}

.markdown-content th {
  @apply border border-gray-300 px-4 py-2 bg-gray-100 font-bold;
}

.markdown-content td {
  @apply border border-gray-300 px-4 py-2;
}

.markdown-content blockquote {
  @apply border-l-4 border-gray-300 pl-4 italic;
}
```

---

## 🔒 Security: Always Sanitize!

**⚠️ IMPORTANT:** Always sanitize HTML before rendering to prevent XSS attacks!

```javascript
import DOMPurify from 'dompurify';

// Good ✅
const clean = DOMPurify.sanitize(html);
container.innerHTML = clean;

// Bad ❌ - Never do this!
container.innerHTML = html; // Vulnerable to XSS
```

---

## 🚀 Complete React Example

```tsx
import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import 'highlight.js/styles/atom-one-dark.css';

interface Message {
  _id: string;
  role: 'user' | 'assistant';
  content: string;
  contentType?: string;
  formatted?: {
    isMarkdown: boolean;
    hasCodeBlocks: boolean;
    hasTables: boolean;
  };
}

function ChatMessage({ message }: { message: Message }) {
  const isAssistant = message.role === 'assistant';
  const isMarkdown = message.contentType === 'markdown' || message.formatted?.isMarkdown;

  return (
    <div className={`flex ${isAssistant ? 'justify-start' : 'justify-end'} mb-4`}>
      <div 
        className={`max-w-3xl px-4 py-3 rounded-lg ${
          isAssistant 
            ? 'bg-gray-100 text-gray-900' 
            : 'bg-blue-600 text-white'
        }`}
      >
        {isAssistant && isMarkdown ? (
          <ReactMarkdown
            className="markdown-content"
            remarkPlugins={[remarkGfm]}
            rehypePlugins={[rehypeHighlight]}
            components={{
              h1: ({ node, ...props }) => (
                <h1 className="text-2xl font-bold mt-4 mb-2 first:mt-0" {...props} />
              ),
              h2: ({ node, ...props }) => (
                <h2 className="text-xl font-bold mt-3 mb-2" {...props} />
              ),
              h3: ({ node, ...props }) => (
                <h3 className="text-lg font-semibold mt-2 mb-1" {...props} />
              ),
              p: ({ node, ...props }) => (
                <p className="mb-3 last:mb-0" {...props} />
              ),
              ul: ({ node, ...props }) => (
                <ul className="list-disc list-inside mb-3 space-y-1" {...props} />
              ),
              ol: ({ node, ...props }) => (
                <ol className="list-decimal list-inside mb-3 space-y-1" {...props} />
              ),
              code: ({ node, inline, className, children, ...props }) => {
                const match = /language-(\w+)/.exec(className || '');
                return !inline ? (
                  <code
                    className={`block bg-gray-900 text-white p-4 rounded my-3 overflow-x-auto ${className}`}
                    {...props}
                  >
                    {children}
                  </code>
                ) : (
                  <code className="bg-gray-200 px-1.5 py-0.5 rounded text-sm" {...props}>
                    {children}
                  </code>
                );
              },
              table: ({ node, ...props }) => (
                <div className="overflow-x-auto my-4">
                  <table className="min-w-full border-collapse" {...props} />
                </div>
              ),
              th: ({ node, ...props }) => (
                <th className="border border-gray-300 px-3 py-2 bg-gray-200 font-semibold text-left" {...props} />
              ),
              td: ({ node, ...props }) => (
                <td className="border border-gray-300 px-3 py-2" {...props} />
              ),
              blockquote: ({ node, ...props }) => (
                <blockquote className="border-l-4 border-gray-300 pl-4 italic my-3" {...props} />
              ),
            }}
          >
            {message.content}
          </ReactMarkdown>
        ) : (
          <p className="whitespace-pre-wrap">{message.content}</p>
        )}
      </div>
    </div>
  );
}

export default ChatMessage;
```

---

## 📊 Testing

Test your markdown rendering with this sample response:

```json
{
  "content": "# Heading 1\n\n## Heading 2\n\nThis is **bold** and *italic* text.\n\n```javascript\nconst x = 10;\nconsole.log(x);\n```\n\n| Header 1 | Header 2 |\n|----------|----------|\n| Cell 1   | Cell 2   |\n\n- Item 1\n- Item 2\n\n> Blockquote",
  "contentType": "markdown"
}
```

---

## ✅ Summary

✅ Backend now returns `contentType: "markdown"` metadata  
✅ Backend includes `formatted` object with Markdown indicators  
✅ Use `react-markdown`, `marked`, or similar library on frontend  
✅ Always sanitize HTML with DOMPurify  
✅ Apply custom CSS for beautiful rendering  
✅ Support code syntax highlighting with highlight.js  

**Your Markdown responses are now properly formatted!** 🎉
