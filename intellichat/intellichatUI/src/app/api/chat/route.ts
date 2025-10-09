export async function POST(request: Request) {
  try {
    const { message } = await request.json();
    
    // Simulate AI response with rich markdown content
    const aiResponse = `# AI Response to: "${message}"

Thank you for your question! Here's a comprehensive response with various markdown elements:

## Key Points

1. **Important Information**: This is a demo response showing how markdown is rendered
2. **Code Examples**: Below you'll find some code snippets
3. **Mathematical Formulas**: Includes LaTeX math rendering

### Code Example

Here's a Python function that demonstrates the concept:

\`\`\`python
def generate_response(user_input):
    """
    Generates an AI response with markdown formatting
    """
    response = {
        "content": user_input,
        "timestamp": datetime.now(),
        "formatted": True
    }
    return response

# Usage example
result = generate_response("Hello, AI!")
print(f"Response: {result['content']}")
\`\`\`

### JavaScript Example

\`\`\`javascript
const processMessage = async (message) => {
    const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message })
    });
    
    return response.json();
};
\`\`\`

## Mathematical Concepts

The quadratic formula is: $$x = \\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}$$

Inline math example: The value of $\\pi$ is approximately 3.14159.

## Lists and Tables

### Features Supported:
- ✅ **Syntax highlighting** for code blocks
- ✅ **Math rendering** with KaTeX
- ✅ **Tables** with proper styling
- ✅ **Links** and formatting
- ✅ **Blockquotes** and lists

### Comparison Table

| Feature | ChatGPT | Gemini | IntelliChat |
|---------|---------|--------|-------------|
| Markdown | ✅ | ✅ | ✅ |
| Code Highlighting | ✅ | ✅ | ✅ |
| Math Rendering | ✅ | ✅ | ✅ |
| Custom Styling | ❌ | ❌ | ✅ |

## Important Notes

> **Note**: This is a demonstration of how AI responses with markdown are rendered in our interface. The styling is designed to be similar to ChatGPT and Gemini for a familiar user experience.

### Links and References

For more information, visit:
- [OpenAI Documentation](https://platform.openai.com/docs)
- [Google AI Documentation](https://ai.google.dev)
- [Markdown Guide](https://www.markdownguide.org)

---

**Summary**: This response demonstrates rich markdown rendering including code blocks, math formulas, tables, lists, and proper typography styling.
`;

    return Response.json({
      message: aiResponse,
      timestamp: new Date().toISOString(),
      model: "demo-ai",
      tokens: aiResponse.length
    });
    
  } catch (error) {
    console.error('Chat API error:', error);
    return Response.json(
      { error: 'Failed to process chat message' },
      { status: 500 }
    );
  }
}