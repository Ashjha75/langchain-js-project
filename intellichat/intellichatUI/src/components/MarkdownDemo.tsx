'use client';

import React, { useState } from 'react';
import { ChatMessage } from './chat/ChatMessage';
import { Message } from './chat/types';

export function MarkdownDemo() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'user',
      content: 'Show me how you handle rich markdown content including code, math, and tables',
    },
    {
      id: '2',
      role: 'assistant',
      content: `# Rich Markdown Demonstration

Thank you for asking! Here's a comprehensive showcase of how I render various markdown elements:

## Code Examples

### Python Code Block
\`\`\`python
def fibonacci(n):
    """
    Generate Fibonacci sequence up to n terms
    """
    if n <= 0:
        return []
    elif n == 1:
        return [0]
    elif n == 2:
        return [0, 1]
    
    sequence = [0, 1]
    for i in range(2, n):
        sequence.append(sequence[i-1] + sequence[i-2])
    
    return sequence

# Generate first 10 Fibonacci numbers
result = fibonacci(10)
print(f"First 10 Fibonacci numbers: {result}")
\`\`\`

### JavaScript/TypeScript Example
\`\`\`typescript
interface User {
  id: string;
  name: string;
  email: string;
}

const fetchUserData = async (userId: string): Promise<User> => {
  const response = await fetch(\`/api/users/\${userId}\`);
  
  if (!response.ok) {
    throw new Error('Failed to fetch user data');
  }
  
  return response.json();
};

// Usage with error handling
try {
  const user = await fetchUserData('123');
  console.log(\`Welcome, \${user.name}!\`);
} catch (error) {
  console.error('Error:', error.message);
}
\`\`\`

## Mathematical Formulas

### Inline Math
The quadratic formula is $x = \\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}$ and Euler's identity is $e^{i\\pi} + 1 = 0$.

### Block Math
$$
\\begin{align}
f(x) &= \\int_{-\\infty}^{\\infty} \\hat{f}(\\xi) e^{2\\pi i \\xi x} d\\xi \\\\
&= \\mathcal{F}^{-1}[\\hat{f}](x)
\\end{align}
$$

## Tables

| Feature | ChatGPT | Gemini | IntelliChat |
|---------|---------|--------|-------------|
| **Markdown Support** | ✅ Basic | ✅ Good | ✅ **Enhanced** |
| **Code Highlighting** | ✅ | ✅ | ✅ **Advanced** |
| **Math Rendering** | ✅ | ✅ | ✅ **KaTeX** |
| **Copy/Download** | ❌ | ❌ | ✅ **Built-in** |
| **Custom Styling** | ❌ | ❌ | ✅ **Professional** |

## Lists and Formatting

### Key Features:
1. **Enhanced Code Blocks** with syntax highlighting
2. **Math Support** using KaTeX for LaTeX rendering
3. **Professional Tables** with hover effects
4. **Copy/Download** functionality for code
5. **Responsive Design** for all screen sizes

### Supported Languages:
- 🐍 **Python** - Data science and AI
- 🟨 **JavaScript** - Web development
- 🔷 **TypeScript** - Type-safe development
- ☕ **Java** - Enterprise applications
- 🌐 **HTML/CSS** - Web markup and styling
- 💻 **Bash/Shell** - System administration

## Blockquotes and Emphasis

> **Important Note**: This enhanced markdown rendering provides a **professional chat experience** similar to ChatGPT and Gemini, but with additional features like code downloading and advanced styling.

### Text Formatting Examples:
- **Bold text** for emphasis
- *Italic text* for subtle emphasis
- \`inline code\` for technical terms
- ~~Strikethrough~~ for corrections

## Links and References

For more information:
- [React Markdown Documentation](https://github.com/remarkjs/react-markdown)
- [KaTeX Math Rendering](https://katex.org/)
- [Highlight.js Syntax Highlighting](https://highlightjs.org/)

---

**✨ Summary**: This demonstrates professional markdown rendering with enhanced features for code, math, tables, and formatting - creating a ChatGPT/Gemini-like experience in your Next.js application!`,
    }
  ]);

  return (
    <div className="min-h-screen bg-[#1b1c1d] p-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-[#282a2c] rounded-lg p-6 mb-6">
          <h1 className="text-2xl font-bold text-[#e8eaed] mb-2">
            Enhanced Markdown Rendering Demo
          </h1>
          <p className="text-[#9aa0a6]">
            This demonstrates professional AI chat responses with rich markdown content
          </p>
        </div>
        
        <div className="space-y-4">
          {messages.map((message) => (
            <ChatMessage key={message.id} message={message} />
          ))}
        </div>
      </div>
    </div>
  );
}