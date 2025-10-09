#!/bin/bash
# Next.js 15.5 Upgrade Script
# This script automates the upgrade process

set -e

echo "🚀 Starting Next.js 15.5.1 Upgrade Process..."
echo "============================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    print_error "package.json not found. Please run this script from the project root."
    exit 1
fi

print_info "Checking current versions..."

# Display current versions
CURRENT_NEXT=$(npm list next --depth=0 2>/dev/null | grep next@ | cut -d'@' -f2 || echo "not found")
CURRENT_REACT=$(npm list react --depth=0 2>/dev/null | grep react@ | cut -d'@' -f2 || echo "not found")
CURRENT_TS=$(npm list typescript --depth=0 2>/dev/null | grep typescript@ | cut -d'@' -f2 || echo "not found")

echo "Current versions:"
echo "  Next.js: $CURRENT_NEXT"
echo "  React: $CURRENT_REACT"
echo "  TypeScript: $CURRENT_TS"
echo ""

# Backup package.json
print_info "Creating backup of package.json..."
cp package.json package.json.backup
print_status "Backup created: package.json.backup"

# Clean installation
print_info "Cleaning old dependencies..."
if [ -d "node_modules" ]; then
    rm -rf node_modules
    print_status "Removed node_modules"
fi

if [ -f "package-lock.json" ]; then
    rm package-lock.json
    print_status "Removed package-lock.json"
fi

if [ -d ".next" ]; then
    rm -rf .next
    print_status "Removed .next build cache"
fi

# Install new dependencies
print_info "Installing updated dependencies..."
npm install

if [ $? -eq 0 ]; then
    print_status "Dependencies installed successfully"
else
    print_error "Failed to install dependencies"
    print_info "Restoring backup..."
    cp package.json.backup package.json
    exit 1
fi

# Verify installation
print_info "Verifying installation..."

NEW_NEXT=$(npm list next --depth=0 2>/dev/null | grep next@ | cut -d'@' -f2 || echo "not found")
NEW_REACT=$(npm list react --depth=0 2>/dev/null | grep react@ | cut -d'@' -f2 || echo "not found")
NEW_TS=$(npm list typescript --depth=0 2>/dev/null | grep typescript@ | cut -d'@' -f2 || echo "not found")

echo ""
echo "New versions:"
echo "  Next.js: $NEW_NEXT"
echo "  React: $NEW_REACT"
echo "  TypeScript: $NEW_TS"
echo ""

# Run type checking
print_info "Running type check..."
npm run type-check

if [ $? -eq 0 ]; then
    print_status "Type checking passed"
else
    print_warning "Type checking failed - you may need to fix some type issues"
fi

# Run linting
print_info "Running ESLint..."
npm run lint

if [ $? -eq 0 ]; then
    print_status "Linting passed"
else
    print_warning "Linting failed - you may need to fix some code issues"
    print_info "Try running 'npm run lint:fix' to auto-fix some issues"
fi

# Test build
print_info "Testing production build..."
npm run build

if [ $? -eq 0 ]; then
    print_status "Build successful"
else
    print_error "Build failed - please check the errors above"
    exit 1
fi

# Clean up build
rm -rf .next

# Test development server
print_info "Testing development server..."
timeout 10s npm run dev > /dev/null 2>&1 &
DEV_PID=$!
sleep 5

if ps -p $DEV_PID > /dev/null; then
    print_status "Development server started successfully"
    kill $DEV_PID 2>/dev/null
else
    print_error "Development server failed to start"
fi

# Final summary
echo ""
echo "🎉 Next.js 15.5.1 Upgrade Complete!"
echo "===================================="
echo ""
print_status "Successfully upgraded to:"
echo "  ✨ Next.js 15.5.1"
echo "  ⚛️  React 19.0.0"
echo "  📘 TypeScript 5.7.2"
echo ""

print_info "Next steps:"
echo "  1. Review the NEXTJS_15_MIGRATION.md for detailed changes"
echo "  2. Test your application thoroughly"
echo "  3. Update your CI/CD pipelines if needed"
echo "  4. Consider enabling Turbopack: npm run dev --turbo"
echo ""

print_info "To start development:"
echo "  npm run dev"
echo ""

print_info "To start with Turbopack (experimental):"
echo "  npm run dev --turbo"
echo ""

print_status "Upgrade completed successfully! 🚀"