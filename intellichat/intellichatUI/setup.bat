@echo off
setlocal enabledelayedexpansion

:: IntelliChat Pro Frontend Setup Script (Windows)
:: This script sets up the complete frontend development environment

echo 🚀 Starting IntelliChat Pro Frontend Setup...
echo ======================================

:: Check if Node.js is installed
where node >nul 2>nul
if !errorlevel! neq 0 (
    echo ❌ Node.js is not installed. Please install Node.js 18.17.0 or higher.
    pause
    exit /b 1
)

:: Check Node.js version
for /f "tokens=*" %%a in ('node -v') do set NODE_VERSION=%%a
set NODE_VERSION=!NODE_VERSION:~1!
echo ✅ Node.js version !NODE_VERSION! detected

:: Check if npm is installed
where npm >nul 2>nul
if !errorlevel! neq 0 (
    echo ❌ npm is not installed. Please install npm.
    pause
    exit /b 1
)

echo ✅ npm is available

:: Install dependencies
echo.
echo 📦 Installing dependencies...
echo This may take a few minutes...
call npm install

if !errorlevel! neq 0 (
    echo ❌ Failed to install dependencies
    pause
    exit /b 1
)

echo ✅ Dependencies installed successfully

:: Setup environment file
echo.
echo ⚙️  Setting up environment configuration...

if not exist ".env.local" (
    copy ".env.example" ".env.local" >nul 2>nul
    echo ✅ Created .env.local from template
    echo 📝 Please edit .env.local with your configuration
) else (
    echo ⚠️  .env.local already exists, skipping...
)

:: Setup git hooks (if git is available and this is a git repo)
where git >nul 2>nul
if !errorlevel! equ 0 (
    if exist ".git" (
        echo.
        echo 🪝 Setting up git hooks...
        call npx husky install
        call npx husky add .husky/pre-commit "npm run lint:fix && npm run type-check"
        call npx husky add .husky/pre-push "npm run test"
        echo ✅ Git hooks configured
    )
)

:: Run initial linting and type checking
echo.
echo 🔍 Running initial code quality checks...

echo   📋 Type checking...
call npm run type-check

echo   🧹 Linting and formatting...
call npm run lint:fix

:: Generate Shadcn/ui components
echo.
echo 🎨 Setting up UI components...

echo   Installing Button component...
call npx shadcn-ui@latest add button --yes

echo   Installing Card component...
call npx shadcn-ui@latest add card --yes

echo   Installing Input component...
call npx shadcn-ui@latest add input --yes

echo   Installing Textarea component...
call npx shadcn-ui@latest add textarea --yes

echo   Installing Dialog component...
call npx shadcn-ui@latest add dialog --yes

echo   Installing Dropdown Menu component...
call npx shadcn-ui@latest add dropdown-menu --yes

echo   Installing Toast component...
call npx shadcn-ui@latest add toast --yes

echo   Installing Tooltip component...
call npx shadcn-ui@latest add tooltip --yes

echo   Installing Avatar component...
call npx shadcn-ui@latest add avatar --yes

echo   Installing Separator component...
call npx shadcn-ui@latest add separator --yes

echo   Installing Sheet component...
call npx shadcn-ui@latest add sheet --yes

echo   Installing Skeleton component...
call npx shadcn-ui@latest add skeleton --yes

echo ✅ Essential UI components installed

:: Create additional directories
echo.
echo 📁 Creating additional directories...

mkdir "src\components\chat" 2>nul
mkdir "src\components\layout" 2>nul
mkdir "src\components\forms" 2>nul
mkdir "src\assets\fonts" 2>nul
mkdir "src\assets\images" 2>nul
mkdir "src\assets\icons" 2>nul
mkdir "public\icons" 2>nul
mkdir "public\images" 2>nul

echo ✅ Directory structure created

:: Success message
echo.
echo 🎉 Setup completed successfully!
echo ======================================
echo.
echo 📋 Next steps:
echo 1. Edit .env.local with your configuration
echo 2. Start the development server: npm run dev
echo 3. Open http://localhost:3000 in your browser
echo.
echo 🛠️  Useful commands:
echo   npm run dev          - Start development server
echo   npm run build        - Build for production
echo   npm run lint         - Run linting
echo   npm run type-check   - Check TypeScript types
echo   npm test             - Run tests
echo   npm run storybook    - Start Storybook
echo.
echo 📚 Documentation:
echo   - README.md for detailed setup instructions
echo   - src/types/index.ts for TypeScript definitions
echo   - src/config/index.ts for configuration options
echo.
echo Happy coding! 🚀
echo.
pause