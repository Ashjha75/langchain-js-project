# API Documentation

## Overview
The LangChain Code Generation Agent provides RESTful API endpoints for generating Next.js and Express.js code using Google's Generative AI.

## Base URL
```
http://localhost:3000
```

## Authentication
Currently, no authentication is required. In production, implement proper API key authentication.

## Endpoints

### Health Check
**GET** `/health`

Returns the service health status.

**Response:**
```json
{
  "status": "healthy",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "service": "LangChain Code Generation Agent"
}
```

### Generate Next.js Code
**POST** `/generate/nextjs`

Generates Next.js components and pages based on requirements.

**Request Body:**
```json
{
  "requirements": "string (required) - Description of what to generate",
  "components": ["string"] - Array of component names,
  "features": ["string"] - Array of features to include
}
```

**Example Request:**
```json
{
  "requirements": "Create a responsive user profile component",
  "components": ["Avatar", "UserInfo", "Bio"],
  "features": ["responsive design", "dark mode support"]
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "code": ["generated code blocks"],
    "validation": {
      "overall": true,
      "files": [],
      "warnings": [],
      "suggestions": []
    },
    "metadata": {
      "framework": "Next.js",
      "generatedAt": "2024-01-01T00:00:00.000Z",
      "requirements": "...",
      "components": ["..."],
      "features": ["..."]
    }
  },
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

### Generate Express.js Code
**POST** `/generate/express`

Generates Express.js server code and API endpoints.

**Request Body:**
```json
{
  "requirements": "string (required) - Description of what to generate",
  "routes": [
    {
      "path": "string",
      "method": "GET|POST|PUT|DELETE|PATCH",
      "description": "string"
    }
  ],
  "middleware": ["string"] - Array of middleware names,
  "database": "none|mongodb|postgresql|mysql|sqlite"
}
```

**Example Request:**
```json
{
  "requirements": "Create a user management API",
  "routes": [
    {
      "path": "/users",
      "method": "GET",
      "description": "Get all users"
    },
    {
      "path": "/users",
      "method": "POST",
      "description": "Create new user"
    }
  ],
  "middleware": ["authentication", "validation"],
  "database": "mongodb"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "code": ["generated code blocks"],
    "validation": {
      "overall": true,
      "files": [],
      "warnings": [],
      "suggestions": []
    },
    "metadata": {
      "framework": "Express.js",
      "generatedAt": "2024-01-01T00:00:00.000Z",
      "requirements": "...",
      "routes": [],
      "middleware": [],
      "database": "mongodb"
    }
  },
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

### Generate Full-Stack Code
**POST** `/generate/full-stack`

Generates complete full-stack application with Next.js frontend and Express.js backend.

**Request Body:**
```json
{
  "requirements": "string (required) - Description of the application",
  "frontend": {
    "components": ["string"],
    "features": ["string"],
    "styling": "tailwind|css-modules|styled-components"
  },
  "backend": {
    "routes": [
      {
        "path": "string",
        "method": "string",
        "description": "string"
      }
    ],
    "middleware": ["string"],
    "database": "string",
    "auth": boolean
  }
}
```

**Example Request:**
```json
{
  "requirements": "Create a blog application with authentication",
  "frontend": {
    "components": ["Header", "PostList", "AuthForm"],
    "features": ["authentication", "post management"],
    "styling": "tailwind"
  },
  "backend": {
    "routes": [
      {
        "path": "/auth/login",
        "method": "POST",
        "description": "User login"
      }
    ],
    "middleware": ["jwt-auth", "validation"],
    "database": "mongodb",
    "auth": true
  }
}
```

## Error Responses

All endpoints return consistent error responses:

```json
{
  "success": false,
  "error": "Error message",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

## Status Codes

- `200` - Success
- `400` - Bad Request (validation error)
- `500` - Internal Server Error
- `404` - Route Not Found

## Rate Limiting

Currently not implemented. Consider adding rate limiting in production:
- 100 requests per 15 minutes per IP
- Adjust based on your needs

## Examples

See `examples/usage-examples.js` for complete working examples of how to use each endpoint.