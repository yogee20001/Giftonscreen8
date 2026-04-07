@echo off
chcp 65001 >nul
echo ============================================
echo Set Worker Secrets for giftonscreen8-worker
echo ============================================
echo.
echo This script sets the required secrets for the Cloudflare Worker.
echo You will be prompted to enter each secret value.
echo.
echo Press any key to start...
pause >nul
cls

echo ============================================
echo Step 1/4: SUPABASE_URL
echo ============================================
echo.
echo Paste your Supabase URL (e.g., https://your-project.supabase.co)
echo Then press Enter, then Ctrl+Z, then Enter again.
echo.
wrangler secret put SUPABASE_URL --name giftonscreen8-worker
cls

echo ============================================
echo Step 2/4: SUPABASE_SERVICE_KEY
echo ============================================
echo.
echo Paste your Supabase Service Role Key
echo Then press Enter, then Ctrl+Z, then Enter again.
echo.
wrangler secret put SUPABASE_SERVICE_KEY --name giftonscreen8-worker
cls

echo ============================================
echo Step 3/4: GITHUB_TOKEN
echo ============================================
echo.
echo Paste your GitHub Personal Access Token
echo Then press Enter, then Ctrl+Z, then Enter again.
echo.
wrangler secret put GITHUB_TOKEN --name giftonscreen8-worker
cls

echo ============================================
echo Step 4/4: GITHUB_REPO
echo ============================================
echo.
echo Paste your GitHub repository (e.g., username/repo-name)
echo Then press Enter, then Ctrl+Z, then Enter again.
echo.
wrangler secret put GITHUB_REPO --name giftonscreen8-worker
cls

echo ============================================
echo All secrets have been set!
echo ============================================
echo.
echo The Worker is now fully configured.
echo Test a gift link to verify everything works.
echo.
pause
