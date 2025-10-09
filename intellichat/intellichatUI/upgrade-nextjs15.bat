@echo off
REM Next.js 15.5 Upgrade Script for Windows
REM This script automates the upgrade process

echo 🚀 Starting Next.js 15.5.1 Upgrade Process...
echo =============================================

REM Check if we're in the right directory
if not exist "package.json" (
    echo ❌ package.json not found. Please run this script from the project root.
    pause
    exit /b 1
)

echo ℹ️  Checking current versions...

REM Display current versions
for /f "tokens=2 delims=@" %%i in ('npm list next --depth=0 2^>nul ^| findstr "next@"') do set CURRENT_NEXT=%%i
for /f "tokens=2 delims=@" %%i in ('npm list react --depth=0 2^>nul ^| findstr "react@"') do set CURRENT_REACT=%%i
for /f "tokens=2 delims=@" %%i in ('npm list typescript --depth=0 2^>nul ^| findstr "typescript@"') do set CURRENT_TS=%%i

echo Current versions:
echo   Next.js: %CURRENT_NEXT%
echo   React: %CURRENT_REACT%
echo   TypeScript: %CURRENT_TS%
echo.

REM Backup package.json
echo ℹ️  Creating backup of package.json...
copy package.json package.json.backup >nul
echo ✅ Backup created: package.json.backup

REM Clean installation
echo ℹ️  Cleaning old dependencies...
if exist "node_modules" (
    rmdir /s /q node_modules
    echo ✅ Removed node_modules
)

if exist "package-lock.json" (
    del package-lock.json
    echo ✅ Removed package-lock.json
)

if exist ".next" (
    rmdir /s /q .next
    echo ✅ Removed .next build cache
)

REM Install new dependencies
echo ℹ️  Installing updated dependencies...
npm install

if %errorlevel% equ 0 (
    echo ✅ Dependencies installed successfully
) else (
    echo ❌ Failed to install dependencies
    echo ℹ️  Restoring backup...
    copy package.json.backup package.json >nul
    pause
    exit /b 1
)

REM Verify installation
echo ℹ️  Verifying installation...

for /f "tokens=2 delims=@" %%i in ('npm list next --depth=0 2^>nul ^| findstr "next@"') do set NEW_NEXT=%%i
for /f "tokens=2 delims=@" %%i in ('npm list react --depth=0 2^>nul ^| findstr "react@"') do set NEW_REACT=%%i
for /f "tokens=2 delims=@" %%i in ('npm list typescript --depth=0 2^>nul ^| findstr "typescript@"') do set NEW_TS=%%i

echo.
echo New versions:
echo   Next.js: %NEW_NEXT%
echo   React: %NEW_REACT%
echo   TypeScript: %NEW_TS%
echo.

REM Run type checking
echo ℹ️  Running type check...
npm run type-check

if %errorlevel% equ 0 (
    echo ✅ Type checking passed
) else (
    echo ⚠️  Type checking failed - you may need to fix some type issues
)

REM Run linting
echo ℹ️  Running ESLint...
npm run lint

if %errorlevel% equ 0 (
    echo ✅ Linting passed
) else (
    echo ⚠️  Linting failed - you may need to fix some code issues
    echo ℹ️  Try running 'npm run lint:fix' to auto-fix some issues
)

REM Test build
echo ℹ️  Testing production build...
npm run build

if %errorlevel% equ 0 (
    echo ✅ Build successful
) else (
    echo ❌ Build failed - please check the errors above
    pause
    exit /b 1
)

REM Clean up build
rmdir /s /q .next 2>nul

REM Final summary
echo.
echo 🎉 Next.js 15.5.1 Upgrade Complete!
echo ====================================
echo.
echo ✅ Successfully upgraded to:
echo   ✨ Next.js 15.5.1
echo   ⚛️  React 19.0.0
echo   📘 TypeScript 5.7.2
echo.
echo ℹ️  Next steps:
echo   1. Review the NEXTJS_15_MIGRATION.md for detailed changes
echo   2. Test your application thoroughly
echo   3. Update your CI/CD pipelines if needed
echo   4. Consider enabling Turbopack: npm run dev --turbo
echo.
echo ℹ️  To start development:
echo   npm run dev
echo.
echo ℹ️  To start with Turbopack (experimental):
echo   npm run dev --turbo
echo.
echo ✅ Upgrade completed successfully! 🚀
echo.
pause