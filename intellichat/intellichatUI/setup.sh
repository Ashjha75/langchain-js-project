#!/bin/bash

# IntelliChat Pro Frontend Setup Script
# This script sets up the complete frontend development environment

set -e

echo "🚀 Starting IntelliChat Pro Frontend Setup..."
echo "======================================"

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18.17.0 or higher."
    exit 1
fi

# Check Node.js version
NODE_VERSION=$(node -v | cut -d'v' -f2)
REQUIRED_VERSION="18.17.0"

if [ "$(printf '%s\n' "$REQUIRED_VERSION" "$NODE_VERSION" | sort -V | head -n1)" != "$REQUIRED_VERSION" ]; then
    echo "❌ Node.js version $NODE_VERSION is too old. Please install Node.js $REQUIRED_VERSION or higher."
    exit 1
fi

echo "✅ Node.js version $NODE_VERSION is compatible"

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed. Please install npm."
    exit 1
fi

echo "✅ npm is available"

# Install dependencies
echo ""
echo "📦 Installing dependencies..."
echo "This may take a few minutes..."
npm install

if [ $? -ne 0 ]; then
    echo "❌ Failed to install dependencies"
    exit 1
fi

echo "✅ Dependencies installed successfully"

# Setup environment file
echo ""
echo "⚙️  Setting up environment configuration..."

if [ ! -f ".env.local" ]; then
    cp .env.example .env.local
    echo "✅ Created .env.local from template"
    echo "📝 Please edit .env.local with your configuration"
else
    echo "⚠️  .env.local already exists, skipping..."
fi

# Setup git hooks (if git is available and this is a git repo)
if command -v git &> /dev/null && [ -d ".git" ]; then
    echo ""
    echo "🪝 Setting up git hooks..."
    npx husky install
    npx husky add .husky/pre-commit "npm run lint:fix && npm run type-check"
    npx husky add .husky/pre-push "npm run test"
    echo "✅ Git hooks configured"
fi

# Run initial linting and type checking
echo ""
echo "🔍 Running initial code quality checks..."

echo "  📋 Type checking..."
npm run type-check

if [ $? -ne 0 ]; then
    echo "⚠️  Type checking found issues, but continuing setup..."
fi

echo "  🧹 Linting and formatting..."
npm run lint:fix

if [ $? -ne 0 ]; then
    echo "⚠️  Linting found issues, but continuing setup..."
fi

# Generate Shadcn/ui components
echo ""
echo "🎨 Setting up UI components..."

# Install essential Shadcn/ui components
echo "  Installing Button component..."
npx shadcn-ui@latest add button --yes

echo "  Installing Card component..."
npx shadcn-ui@latest add card --yes

echo "  Installing Input component..."
npx shadcn-ui@latest add input --yes

echo "  Installing Textarea component..."
npx shadcn-ui@latest add textarea --yes

echo "  Installing Dialog component..."
npx shadcn-ui@latest add dialog --yes

echo "  Installing Dropdown Menu component..."
npx shadcn-ui@latest add dropdown-menu --yes

echo "  Installing Toast component..."
npx shadcn-ui@latest add toast --yes

echo "  Installing Tooltip component..."
npx shadcn-ui@latest add tooltip --yes

echo "  Installing Avatar component..."
npx shadcn-ui@latest add avatar --yes

echo "  Installing Separator component..."
npx shadcn-ui@latest add separator --yes

echo "  Installing Sheet component..."
npx shadcn-ui@latest add sheet --yes

echo "  Installing Skeleton component..."
npx shadcn-ui@latest add skeleton --yes

echo "✅ Essential UI components installed"

# Create additional directories
echo ""
echo "📁 Creating additional directories..."

mkdir -p src/components/chat
mkdir -p src/components/layout
mkdir -p src/components/forms
mkdir -p src/assets/fonts
mkdir -p src/assets/images
mkdir -p src/assets/icons
mkdir -p public/icons
mkdir -p public/images

echo "✅ Directory structure created"

# Success message
echo ""
echo "🎉 Setup completed successfully!"
echo "======================================"
echo ""
echo "📋 Next steps:"
echo "1. Edit .env.local with your configuration"
echo "2. Start the development server: npm run dev"
echo "3. Open http://localhost:3000 in your browser"
echo ""
echo "🛠️  Useful commands:"
echo "  npm run dev          - Start development server"
echo "  npm run build        - Build for production"
echo "  npm run lint         - Run linting"
echo "  npm run type-check   - Check TypeScript types"
echo "  npm test             - Run tests"
echo "  npm run storybook    - Start Storybook"
echo ""
echo "📚 Documentation:"
echo "  - README.md for detailed setup instructions"
echo "  - src/types/index.ts for TypeScript definitions"
echo "  - src/config/index.ts for configuration options"
echo ""
echo "Happy coding! 🚀"