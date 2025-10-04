// Example: Generate a Next.js component
import fetch from 'node-fetch';

const generateNextJSComponent = async () => {
  const response = await fetch('http://localhost:3000/generate/nextjs', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      requirements: "Create a responsive user profile component with avatar, name, email, and bio sections",
      components: ["Avatar", "UserInfo", "Bio"],
      features: ["responsive design", "dark mode support", "loading states"]
    })
  });

  const result = await response.json();
  console.log('Generated Next.js Component:', result);
};

// Example: Generate an Express.js API
const generateExpressAPI = async () => {
  const response = await fetch('http://localhost:3000/generate/express', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      requirements: "Create a user management API with CRUD operations",
      routes: [
        { path: "/users", method: "GET", description: "Get all users" },
        { path: "/users/:id", method: "GET", description: "Get user by ID" },
        { path: "/users", method: "POST", description: "Create new user" },
        { path: "/users/:id", method: "PUT", description: "Update user" },
        { path: "/users/:id", method: "DELETE", description: "Delete user" }
      ],
      middleware: ["authentication", "validation", "rate-limiting"],
      database: "mongodb"
    })
  });

  const result = await response.json();
  console.log('Generated Express.js API:', result);
};

// Example: Generate a full-stack application
const generateFullStackApp = async () => {
  const response = await fetch('http://localhost:3000/generate/full-stack', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      requirements: "Create a blog application with user authentication and post management",
      frontend: {
        components: ["Header", "PostList", "PostCard", "AuthForm"],
        features: ["authentication", "post creation", "post editing", "responsive design"],
        styling: "tailwind"
      },
      backend: {
        routes: [
          { path: "/auth/login", method: "POST", description: "User login" },
          { path: "/auth/register", method: "POST", description: "User registration" },
          { path: "/posts", method: "GET", description: "Get all posts" },
          { path: "/posts", method: "POST", description: "Create new post" },
          { path: "/posts/:id", method: "PUT", description: "Update post" },
          { path: "/posts/:id", method: "DELETE", description: "Delete post" }
        ],
        middleware: ["jwt-auth", "validation", "cors"],
        database: "mongodb",
        auth: true
      }
    })
  });

  const result = await response.json();
  console.log('Generated Full-Stack Application:', result);
};

// Run examples
const runExamples = async () => {
  try {
    console.log('🚀 Running LangChain Code Generation Examples...\n');
    
    console.log('1. Generating Next.js Component...');
    await generateNextJSComponent();
    
    console.log('\n2. Generating Express.js API...');
    await generateExpressAPI();
    
    console.log('\n3. Generating Full-Stack Application...');
    await generateFullStackApp();
    
    console.log('\n✅ All examples completed!');
  } catch (error) {
    console.error('❌ Error running examples:', error);
  }
};

// Uncomment to run examples
// runExamples();