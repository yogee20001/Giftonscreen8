@echo off
chcp 65001 >nul

REM GiftOnScreen Deployment Script for Windows
REM Deploys both Worker and Pages to Cloudflare

echo 🎁 GiftOnScreen Deployment Script
echo ==================================
echo.

REM Check if wrangler is installed
wrangler --version >nul 2>&1
if errorlevel 1 (
    echo ✗ Wrangler CLI is not installed
    echo Please install it: npm install -g wrangler
    exit /b 1
)

echo ✓ Wrangler CLI found

REM Check if user is logged in
wrangler whoami >nul 2>&1
if errorlevel 1 (
    echo ✗ Not logged in to Cloudflare
    echo Please run: wrangler login
    exit /b 1
)

echo ✓ Cloudflare authentication verified
echo.

REM Deploy Worker
echo 📦 Deploying Gift Rendering Worker...
cd worker
wrangler deploy
if errorlevel 1 (
    echo ✗ Worker deployment failed
    exit /b 1
)
echo ✓ Worker deployed successfully
cd ..
echo.

REM Deploy Pages
echo 🌐 Deploying Frontend to Cloudflare Pages...
wrangler pages deploy . --project-name=giftonscreen8
if errorlevel 1 (
    echo ✗ Pages deployment failed
    exit /b 1
)
echo ✓ Pages deployed successfully

echo.
echo ==================================
echo ✓ Deployment Complete!
echo.
echo Your application is available at:
echo   • Frontend: https://giftonscreen.pages.dev
echo   • Worker: Check your Cloudflare Dashboard
echo.
echo Next steps:
echo   1. Configure custom domain (optional)
echo   2. Update Supabase Auth redirect URLs

echo   3. Test the complete user flow
echo.
pause
