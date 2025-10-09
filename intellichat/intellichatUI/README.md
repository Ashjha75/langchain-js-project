# 🎨 IntelliChat Pro - Frontend

A modern, professional-grade chat interface built with **Next.js 14**, **TypeScript**, **Tailwind CSS**, and **Shadcn/ui**. Inspired by ChatGPT's sleek design with enterprise-level architecture.

## ✨ Features

- 🌙 **Dark theme** with professional aesthetics
- 📱 **Responsive design** for all devices
- ⚡ **Real-time messaging** with WebSocket support
- 🎯 **Modern component architecture** with Shadcn/ui
- 🔥 **Performance optimized** with virtual scrolling
- 🎨 **Smooth animations** and transitions
- 🧩 **Modular architecture** with clean separation
- 🔧 **TypeScript** for type safety
- 📦 **Professional tooling** and linting

## 🚀 Quick Start

### Prerequisites

- **Node.js** 18.17.0 or higher
- **npm** 9.0.0 or higher

### Installation

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   # Edit .env.local with your configuration
   ```

3. **Start development server**
   ```bash
   npm run dev
   ```

4. **Open your browser**
   ```
   http://localhost:3000
   ```

## 📁 Project Structure

```
src/
├── 📁 app/                     # Next.js 14 App Router
│   ├── 📁 chat/                # Chat routes
│   ├── 📄 layout.tsx           # Root layout
│   ├── 📄 page.tsx             # Home page
│   ├── 📄 loading.tsx          # Loading UI
│   ├── 📄 error.tsx            # Error UI
│   └── 📄 not-found.tsx        # 404 page
├── 📁 components/              # React components
│   ├── 📁 ui/                  # Shadcn/ui components
│   ├── 📁 chat/                # Chat components
│   ├── 📁 layout/              # Layout components
│   └── 📁 providers/           # Context providers
├── 📁 hooks/                   # Custom React hooks
├── 📁 lib/                     # Utility functions
├── 📁 stores/                  # Zustand state management
├── 📁 types/                   # TypeScript definitions
├── 📁 styles/                  # Global styles
└── 📁 config/                  # Configuration files
```

## 🎨 Design System

The project uses a comprehensive design system with:

- **Color palette**: Dark theme optimized
- **Typography**: Inter font family with proper hierarchy
- **Spacing**: Consistent spacing scale
- **Components**: Reusable UI components
- **Animations**: Smooth transitions and micro-interactions

### Color System

```css
/* Primary colors */
--primary: #238636;           /* Green accent */
--background: #0d1117;        /* Dark background */
--foreground: #f0f6fc;        /* Light text */

/* Chat colors */
--chat-user: #2d333b;         /* User messages */
--chat-assistant: #21262d;    /* AI messages */
--chat-system: #1c2128;       /* System messages */
```

## 🧩 Component Architecture

### Atomic Design Pattern

- **Atoms**: Basic UI elements (Button, Input, Icon)
- **Molecules**: Simple combinations (SearchBox, MessageBubble)
- **Organisms**: Complex sections (Sidebar, ChatContainer)
- **Templates**: Page layouts (ChatLayout)
- **Pages**: Specific instances (HomePage, ChatPage)

### Component Example

```typescript
// components/ui/button.tsx
import { cva, type VariantProps } from 'class-variance-authority';

const buttonVariants = cva(
  'inline-flex items-center justify-center...',
  {
    variants: {
      variant: {
        default: 'bg-primary text-primary-foreground...',
        secondary: 'bg-secondary text-secondary-foreground...',
        ghost: 'hover:bg-accent hover:text-accent-foreground',
      },
      size: {
        default: 'h-9 px-4 py-2',
        sm: 'h-8 px-3 text-xs',
        lg: 'h-10 px-8',
      },
    },
  }
);
```

## 🔄 State Management

### Zustand Store Architecture

```typescript
// stores/app-store.ts
interface AppState {
  // User state
  user: User | null;
  isAuthenticated: boolean;
  
  // Chat state
  conversations: Conversation[];
  currentConversationId: string | null;
  messages: Record<string, Message[]>;
  
  // UI state
  ui: ChatUIState;
  loading: LoadingState;
  errors: ErrorState;
  
  // Actions
  actions: {
    setUser: (user: User) => void;
    addMessage: (conversationId: string, message: Message) => void;
    // ... more actions
  };
}
```

### Server State with TanStack Query

```typescript
// hooks/use-chat.ts
export function useChat() {
  const { data: conversations } = useQuery({
    queryKey: ['conversations'],
    queryFn: api.conversations.getAll,
    staleTime: 5 * 60 * 1000,
  });
  
  const sendMessageMutation = useMutation({
    mutationFn: api.messages.send,
    onSuccess: (newMessage) => {
      // Optimistic updates
    },
  });
  
  return { conversations, sendMessage: sendMessageMutation.mutate };
}
```

## 🎯 Custom Hooks

### Chat Functionality

```typescript
// hooks/use-chat.ts
const { 
  conversations, 
  sendMessage, 
  isLoading 
} = useChat();

const { 
  messages, 
  isSending 
} = useMessages(conversationId);
```

### Real-time Features

```typescript
// hooks/use-realtime.ts
const { 
  connect, 
  disconnect, 
  sendTyping 
} = useRealTime();
```

## 🛠️ Development Tools

### Available Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npm run lint:fix     # Fix ESLint issues
npm run type-check   # Check TypeScript types
npm run format       # Format code with Prettier
npm test             # Run tests
npm run storybook    # Start Storybook
```

### Code Quality

- **TypeScript**: Strict mode enabled
- **ESLint**: Custom rules for React and TypeScript
- **Prettier**: Consistent code formatting
- **Husky**: Git hooks for pre-commit checks

### Testing

```bash
npm test             # Run all tests
npm run test:watch   # Run tests in watch mode
npm run test:coverage # Generate coverage report
```

## 📱 Responsive Design

### Breakpoint System

```typescript
const breakpoints = {
  mobile: 'max-width: 640px',     // Single column
  tablet: '641px - 1024px',       // Two columns
  desktop: 'min-width: 1025px',   // Three columns
};
```

### Mobile-First Approach

- Touch-friendly interactions (44px minimum)
- Gesture support (swipe, pinch)
- Optimized for mobile performance
- Progressive enhancement

## 🚀 Performance Optimization

### Features

- **Code splitting**: Automatic route-based splitting
- **Image optimization**: Next.js Image component
- **Bundle analysis**: Built-in analyzer
- **Virtual scrolling**: For large message lists
- **Lazy loading**: Components and images
- **Caching**: Aggressive caching strategies

### Performance Targets

- **First Contentful Paint**: < 1.5s
- **Largest Contentful Paint**: < 2.5s
- **Cumulative Layout Shift**: < 0.1
- **First Input Delay**: < 100ms

## 🔧 Configuration

### Environment Variables

```bash
# .env.local
NEXT_PUBLIC_API_URL=http://localhost:3001/api/v1
NEXT_PUBLIC_WS_URL=ws://localhost:3001
NEXT_PUBLIC_ENABLE_VOICE_INPUT=true
```

### Tailwind Configuration

```typescript
// tailwind.config.ts
export default {
  content: ['./src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        border: 'hsl(var(--border))',
        background: 'hsl(var(--background))',
        // ... custom colors
      },
    },
  },
  plugins: [
    require('tailwindcss-animate'),
    require('@tailwindcss/typography'),
  ],
};
```

## 🎨 Theming

### CSS Variables

```css
:root {
  --background: 221 39% 11%;
  --foreground: 213 31% 91%;
  --primary: 137 72% 32%;
  --secondary: 220 23% 18%;
  /* ... more variables */
}
```

### Theme Switching

```typescript
// providers/theme-provider.tsx
<ThemeProvider
  attribute="class"
  defaultTheme="dark"
  enableSystem
>
  {children}
</ThemeProvider>
```

## 🔌 API Integration

### API Client

```typescript
// lib/api.ts
const api = {
  conversations: {
    getAll: () => fetch('/api/conversations'),
    create: (data) => fetch('/api/conversations', { method: 'POST', body: JSON.stringify(data) }),
  },
  messages: {
    send: (data) => fetch('/api/messages', { method: 'POST', body: data }),
  },
};
```

### Error Handling

```typescript
// Global error boundary
<ErrorBoundary fallback={<ErrorPage />}>
  <App />
</ErrorBoundary>
```

## 🧪 Testing Strategy

### Testing Stack

- **Vitest**: Fast unit testing
- **Testing Library**: Component testing
- **Playwright**: E2E testing
- **Storybook**: Component documentation

### Test Examples

```typescript
// __tests__/components/Button.test.tsx
describe('Button', () => {
  it('renders with correct variant', () => {
    render(<Button variant="primary">Click me</Button>);
    expect(screen.getByRole('button')).toHaveClass('bg-primary');
  });
});
```

## 📦 Deployment

### Build Process

```bash
npm run build        # Build for production
npm run start        # Start production server
```

### Docker Support

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

## 🎯 Best Practices

### Code Organization

- **Feature-based structure**: Group by functionality
- **Consistent naming**: Use descriptive names
- **Type safety**: Leverage TypeScript
- **Component composition**: Prefer composition over inheritance

### Performance

- **Minimize re-renders**: Use React.memo and useMemo
- **Optimize bundles**: Tree shaking and code splitting
- **Lazy load**: Non-critical components
- **Cache strategies**: Aggressive caching for static assets

### Accessibility

- **Semantic HTML**: Use proper HTML elements
- **ARIA labels**: For screen readers
- **Keyboard navigation**: Full keyboard support
- **Color contrast**: WCAG 2.1 AA compliance

## 🔮 Future Enhancements

- **Voice input**: Speech-to-text integration
- **File upload**: Drag-and-drop file support
- **Offline mode**: PWA capabilities
- **Advanced search**: Full-text search
- **Collaboration**: Multi-user features

## 📚 Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Tailwind CSS](https://tailwindcss.com)
- [Shadcn/ui](https://ui.shadcn.com)
- [Zustand](https://zustand-demo.pmnd.rs)
- [TanStack Query](https://tanstack.com/query)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

---

**Built with ❤️ for the future of AI conversations**