# LangChain.js Code Generation Agent

An advanced AI-powered code generation agent built with LangChain.js and Google's Generative AI (Gemini) for generating high-quality Next.js and Express.js applications.

## 🚀 Features

- **AI-Powered Code Generation**: Uses Google's Gemini 1.5 Flash model for intelligent code generation
- **Next.js Support**: Generate modern React components, pages, and API routes
- **Express.js Support**: Create robust backend APIs with proper middleware and security
- **Full-Stack Generation**: Generate complete applications with frontend and backend integration
- **Code Validation**: Built-in validation for generated code quality and best practices
- **Docker Support**: Containerized deployment with Docker and Docker Compose
- **Production Ready**: Includes logging, error handling, and security best practices
- **Template System**: Extensible template system for different code patterns

## 📋 Prerequisites

- Node.js 18.0.0 or higher
- Google API Key for Generative AI
- Docker (optional, for containerized deployment)

## 🛠️ Installation

1. **Clone the repository:**
   ```bash
   git clone <your-repo-url>
   cd langchain-js-project
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Environment Setup:**
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` and add your Google API key:
   ```env
   GOOGLE_API_KEY=your_google_api_key_here
   ```

4. **Create logs directory:**
   ```bash
   mkdir logs
   ```

## 🚀 Quick Start

### Development Mode
```bash
npm run dev
```

### Production Mode
```bash
npm start
```

### Docker Deployment
```bash
# Build and run with Docker Compose
npm run docker:dev

# Or build and run manually
npm run build
npm run docker:run
```

The service will be available at `http://localhost:3000`

## 📖 Usage

### Health Check
```bash
curl http://localhost:3000/health
```

### Generate Next.js Component
```bash
curl -X POST http://localhost:3000/generate/nextjs \
  -H "Content-Type: application/json" \
  -d '{
    "requirements": "Create a responsive user profile component",
    "components": ["Avatar", "UserInfo", "Bio"],
    "features": ["responsive design", "dark mode support"]
  }'
```

### Generate Express.js API
```bash
curl -X POST http://localhost:3000/generate/express \
  -H "Content-Type: application/json" \
  -d '{
    "requirements": "Create a user management API",
    "routes": [
      {"path": "/users", "method": "GET", "description": "Get all users"},
      {"path": "/users", "method": "POST", "description": "Create user"}
    ],
    "middleware": ["authentication", "validation"],
    "database": "mongodb"
  }'
```

### Generate Full-Stack Application
```bash
curl -X POST http://localhost:3000/generate/full-stack \
  -H "Content-Type: application/json" \
  -d '{
    "requirements": "Create a blog application",
    "frontend": {
      "components": ["Header", "PostList", "AuthForm"],
      "features": ["authentication", "post management"],
      "styling": "tailwind"
    },
    "backend": {
      "routes": [
        {"path": "/auth/login", "method": "POST", "description": "Login"}
      ],
      "middleware": ["jwt-auth"],
      "database": "mongodb",
      "auth": true
    }
  }'
```

## 📁 Project Structure

```
langchain-js-project/
├── src/
│   ├── agents/              # AI agents for code generation
│   │   ├── BaseAgent.js     # Base agent class
│   │   └── CodeGenerationAgent.js
│   ├── templates/           # Code generation templates
│   │   └── index.js         # Template definitions
│   ├── utils/               # Utility functions
│   │   ├── logger.js        # Winston logging setup
│   │   ├── validation.js    # Input validation
│   │   └── CodeValidator.js # Code quality validation
│   └── index.js             # Main application entry
├── examples/                # Usage examples
├── docs/                    # Documentation
├── logs/                    # Application logs
├── docker-compose.yml       # Docker Compose configuration
├── Dockerfile              # Docker container definition
└── package.json            # Project dependencies
```

## 🔧 Configuration

### Environment Variables

| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| `NODE_ENV` | Environment mode | `development` | No |
| `PORT` | Server port | `3000` | No |
| `GOOGLE_API_KEY` | Google Generative AI API key | - | Yes |
| `GOOGLE_MODEL_NAME` | Gemini model name | `gemini-1.5-flash` | No |
| `LOG_LEVEL` | Logging level | `info` | No |

### Google API Key Setup

1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Create a new API key
3. Add it to your `.env` file

## 📊 API Documentation

See [docs/API.md](docs/API.md) for detailed API documentation including:
- Endpoint specifications
- Request/response examples
- Error handling
- Rate limiting information

## 🧪 Testing

```bash
# Run tests
npm test

# Run with coverage
npm run test:coverage
```

## 🔍 Code Quality

```bash
# Lint code
npm run lint

# Format code
npm run format
```

## 📝 Logging

The application uses Winston for structured logging:
- **Console logs**: Development environment
- **File logs**: `logs/combined.log` and `logs/error.log`
- **Log rotation**: Automatic rotation when files exceed 5MB

## 🔒 Security Features

- **Helmet.js**: Security headers
- **CORS**: Cross-origin resource sharing control
- **Input Validation**: Joi schema validation
- **Rate Limiting**: (Configurable)
- **Non-root Docker User**: Security-first container design

## 🚀 Deployment

### Docker Production Deployment

1. **Build the image:**
   ```bash
   docker build -t langchain-code-agent .
   ```

2. **Run with environment file:**
   ```bash
   docker run -p 3000:3000 --env-file .env langchain-code-agent
   ```

### Cloud Deployment

The application is ready for deployment on:
- Google Cloud Run
- AWS ECS/Fargate
- Azure Container Instances
- Heroku
- DigitalOcean App Platform

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Run linting and tests
6. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

- **Documentation**: Check the `docs/` directory
- **Examples**: See `examples/usage-examples.js`
- **Issues**: Create an issue on GitHub
- **API Reference**: See `docs/API.md`

## 🎯 Roadmap

- [ ] Add support for more frameworks (Vue.js, Svelte)
- [ ] Implement rate limiting
- [ ] Add authentication/authorization
- [ ] WebSocket support for real-time generation
- [ ] Plugin system for custom templates
- [ ] Integration with popular IDEs
- [ ] Code optimization suggestions
- [ ] Performance metrics and analytics

---

Built with ❤️ using LangChain.js and Google Generative AI