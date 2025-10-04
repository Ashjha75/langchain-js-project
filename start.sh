#!/bin/bash

echo "🚀 LangChain.js Code Generation Agent - Quick Start"
echo "=================================================="

# Check if .env exists and has API key
if [ ! -f .env ]; then
    echo "❌ .env file not found. Creating from example..."
    cp .env.example .env
    echo "✅ Created .env file"
fi

# Check for Google API key
if ! grep -q "GOOGLE_API_KEY=your_google_api_key_here" .env; then
    echo "✅ Google API key appears to be configured"
else
    echo "⚠️  Please add your Google API key to .env file:"
    echo "   1. Get API key from: https://makersuite.google.com/app/apikey"
    echo "   2. Replace 'your_google_api_key_here' with your actual key"
    echo ""
fi

# Check if logs directory exists
if [ ! -d "logs" ]; then
    mkdir -p logs
    echo "✅ Created logs directory"
fi

echo ""
echo "🎯 Available Commands:"
echo "  npm start          - Start production server"
echo "  npm run dev        - Start development server"
echo "  npm run docker:dev - Start with Docker Compose"
echo "  npm test           - Run tests"
echo ""
echo "📖 Documentation:"
echo "  README.md          - Complete project documentation"
echo "  docs/API.md        - API endpoint documentation"
echo "  examples/          - Usage examples"
echo ""
echo "🌐 After starting the server:"
echo "  Health Check: http://localhost:3000/health"
echo "  API Docs:     See docs/API.md"