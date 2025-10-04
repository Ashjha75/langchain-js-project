export const NEXTJS_TEMPLATES = {
  component: `
You are an expert Next.js developer. Generate high-quality, production-ready Next.js code based on the following requirements:

Requirements: {requirements}
Components: {components}
Features: {features}
Generated at: {timestamp}

Please generate:
1. Component files with proper TypeScript/JavaScript syntax
2. Appropriate Next.js patterns (App Router, Server Components, etc.)
3. Styling with Tailwind CSS or CSS modules
4. Proper error handling and loading states
5. SEO optimization with metadata
6. Performance optimizations

Ensure the code follows Next.js 14+ best practices and is production-ready.
Include proper imports, exports, and file structure suggestions.

Generate the complete code with explanations for each major component.
`,

  page: `
Generate a Next.js page component with the following specifications:

Requirements: {requirements}
Route: {route}
Layout: {layout}
SEO Requirements: {seo}

Include:
- Proper metadata configuration
- Server/Client component architecture
- Loading and error boundaries
- Responsive design
- Accessibility features
`,

  api: `
Generate Next.js API routes with the following specifications:

Requirements: {requirements}
Endpoints: {endpoints}
Authentication: {auth}
Database: {database}

Include:
- Proper HTTP methods handling
- Input validation
- Error handling
- Rate limiting considerations
- TypeScript types
`
};

export const EXPRESS_TEMPLATES = {
  server: `
You are an expert Express.js developer. Generate high-quality, production-ready Express.js server code based on the following requirements:

Requirements: {requirements}
Routes: {routes}
Middleware: {middleware}
Database: {database}
Generated at: {timestamp}

Please generate:
1. Main server file with proper configuration
2. Route handlers with proper error handling
3. Middleware setup (CORS, helmet, rate limiting, etc.)
4. Database connection and models (if specified)
5. Input validation and sanitization
6. Logging and monitoring setup
7. Environment configuration
8. Security best practices

Ensure the code follows Express.js best practices and is production-ready.
Include proper error handling, validation, and security measures.

Generate the complete server structure with explanations.
`,

  routes: `
Generate Express.js route handlers for the following specifications:

Requirements: {requirements}
Endpoints: {endpoints}
Authentication: {auth}
Validation: {validation}

Include:
- RESTful API design
- Proper HTTP status codes
- Input validation
- Error handling
- Authentication/authorization
- Rate limiting
`,

  middleware: `
Generate Express.js middleware functions for:

Requirements: {requirements}
Middleware Types: {types}
Security: {security}

Include:
- Custom middleware functions
- Error handling middleware
- Authentication middleware
- Logging middleware
- Security middleware
`
};

export const FULLSTACK_TEMPLATES = {
  project: `
You are an expert full-stack developer specializing in Next.js and Express.js. Generate a complete full-stack application based on the following requirements:

Requirements: {requirements}
Frontend (Next.js): {frontend}
Backend (Express.js): {backend}
Generated at: {timestamp}

Please generate:

FRONTEND (Next.js):
1. Complete Next.js application structure
2. Components with proper state management
3. API integration with the Express backend
4. Responsive UI with modern styling
5. SEO optimization and metadata
6. Error boundaries and loading states
7. TypeScript support

BACKEND (Express.js):
1. Complete Express.js server structure
2. RESTful API endpoints
3. Database models and connections
4. Authentication and authorization
5. Input validation and sanitization
6. Error handling and logging
7. Security middleware

INTEGRATION:
1. API communication between frontend and backend
2. Shared TypeScript types/interfaces
3. Environment configuration
4. Docker setup for both services
5. Testing strategies

Provide a complete project structure with detailed explanations for each component.
Ensure the code is production-ready and follows best practices for both frameworks.
`,

  architecture: `
Design the architecture for a full-stack application with:

Requirements: {requirements}
Scale: {scale}
Features: {features}

Include:
- Project structure
- API design
- Database schema
- Authentication flow
- Deployment strategy
`
};