@echo off
echo 🚀 LangChain.js Code Generation Agent - Quick Start
echo ==================================================

REM Check if .env exists and has API key
if not exist .env (
    echo ❌ .env file not found. Creating from example...
    copy .env.example .env
    echo ✅ Created .env file
)

REM Check for logs directory
if not exist logs (
    mkdir logs
    echo ✅ Created logs directory
)

echo.
echo ⚠️  Please ensure your Google API key is configured in .env file:
echo    1. Get API key from: https://makersuite.google.com/app/apikey
echo    2. Replace 'your_google_api_key_here' with your actual key
echo.
echo 🎯 Available Commands:
echo   npm start          - Start production server
echo   npm run dev        - Start development server
echo   npm run docker:dev - Start with Docker Compose
echo   npm test           - Run tests
echo.
echo 📖 Documentation:
echo   README.md          - Complete project documentation
echo   docs/API.md        - API endpoint documentation
echo   examples/          - Usage examples
echo.
echo 🌐 After starting the server:
echo   Health Check: http://localhost:3000/health
echo   API Docs:     See docs/API.md
echo.
pause