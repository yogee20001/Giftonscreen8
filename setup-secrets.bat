@echo off
chcp 65001 >nul

REM GiftOnScreen - Cloudflare Secrets Setup Script (Windows)
REM This script sets up all required secrets for Cloudflare Pages and Worker

echo 🎁 GiftOnScreen - Secrets Setup
echo ==================================
echo.
echo This script will set up all required secrets.
echo.
echo You will need:
echo   - Supabase URL (e.g., https://your-project.supabase.co)
echo   - Supabase Anon Key (from Supabase Dashboard -^> Settings -^> API)
echo   - Supabase Service Role Key (from Supabase Dashboard -^> Settings -^> API)
echo   - Cloudinary credentials (from Cloudinary Dashboard)
echo   - GitHub Token (from GitHub Settings -^> Developer settings -^> Personal access tokens)
echo   - GitHub Repo (format: username/repo-name)
echo.
pause
echo.

REM Check if wrangler is installed
wrangler --version >nul 2>&1
if errorlevel 1 (
    echo ✗ Wrangler CLI is not installed
    echo Please install it: npm install -g wrangler
    exit /b 1
)

echo ✓ Wrangler CLI found
echo.

REM Check if user is logged in
wrangler whoami >nul 2>&1
if errorlevel 1 (
    echo ✗ Not logged in to Cloudflare
    echo Please run: wrangler login first
    exit /b 1
)

echo ✓ Cloudflare authentication verified
echo.
echo ==================================
echo.

REM Set up Pages secrets (frontend + worker secrets)
echo 🔧 Setting up Pages secrets (giftonscreen8)...
echo.

echo [1/8] Setting SUPABASE_URL...
wrangler secret put SUPABASE_URL
echo.

echo [2/8] Setting SUPABASE_ANON_KEY...
wrangler secret put SUPABASE_ANON_KEY
echo.

echo [3/8] Setting SUPABASE_SERVICE_KEY...
echo NOTE: Use the Service Role Key, NOT the Anon Key!
wrangler secret put SUPABASE_SERVICE_KEY
echo.

echo [4/8] Setting CLOUDINARY_CLOUD_NAME...
wrangler secret put CLOUDINARY_CLOUD_NAME
echo.

echo [5/8] Setting CLOUDINARY_API_KEY...
wrangler secret put CLOUDINARY_API_KEY
echo.

echo [6/8] Setting CLOUDINARY_API_SECRET...
wrangler secret put CLOUDINARY_API_SECRET
echo.

echo [7/8] Setting GITHUB_TOKEN...
wrangler secret put GITHUB_TOKEN
echo.

echo [8/8] Setting GITHUB_REPO...
echo Example: yogee20001/giftonscreen-templates
wrangler secret put GITHUB_REPO
echo.

echo ✓ Pages secrets configured!
echo.
echo ==================================
echo.

REM Set up Worker secrets (same as Pages)
echo 🔧 Setting up Worker secrets (giftonscreen-worker)...
echo.

cd worker

echo [1/4] Setting SUPABASE_URL for Worker...
wrangler secret put SUPABASE_URL
echo.

echo [2/4] Setting SUPABASE_SERVICE_KEY for Worker...
wrangler secret put SUPABASE_SERVICE_KEY
echo.

echo [3/4] Setting GITHUB_TOKEN for Worker...
wrangler secret put GITHUB_TOKEN
echo.

echo [4/4] Setting GITHUB_REPO for Worker...
wrangler secret put GITHUB_REPO
echo.

cd ..

echo ✓ Worker secrets configured!
echo.
echo ==================================
echo.
echo 🎉 All secrets have been set up for both Pages and Worker!
echo.
echo You can now deploy your application using:
echo   deploy.bat
echo.
echo Or manually:
echo   npm run deploy
echo.
pause
