@echo off
REM Marcel V8.0 Ultimate - Package for Replit Deployment
REM =====================================================

echo ==========================================
echo Marcel V8.0 Ultimate - Packaging for Replit
echo ==========================================
echo.

REM Check if required files exist
if not exist "server.js" (
    echo ERROR: server.js not found!
    pause
    exit /b 1
)

if not exist "package.json" (
    echo ERROR: package.json not found!
    pause
    exit /b 1
)

echo Creating deployment package...

REM Create deployment folder
if exist "marcel-v8-deploy" rmdir /s /q "marcel-v8-deploy"
mkdir "marcel-v8-deploy"

REM Copy essential files
echo Copying essential files...
copy "server.js" "marcel-v8-deploy\" >nul
copy "package.json" "marcel-v8-deploy\" >nul
copy ".replit" "marcel-v8-deploy\" >nul 2>nul
copy "replit.nix.optimized" "marcel-v8-deploy\replit.nix" >nul
copy ".env.example" "marcel-v8-deploy\" >nul 2>nul
copy "deploy-to-replit.sh" "marcel-v8-deploy\" >nul
copy "README.md" "marcel-v8-deploy\" >nul 2>nul
copy "DEPLOYMENT_GUIDE.md" "marcel-v8-deploy\" >nul 2>nul

REM Copy package-lock.json if it exists
if exist "package-lock.json" (
    copy "package-lock.json" "marcel-v8-deploy\" >nul
    echo - package-lock.json copied
)

echo.
echo Files packaged successfully!
echo.
echo ==========================================
echo DEPLOYMENT PACKAGE READY
echo ==========================================
echo.
echo Location: marcel-v8-deploy\
echo.
echo Files included:
dir /b "marcel-v8-deploy\"
echo.
echo ==========================================
echo NEXT STEPS:
echo ==========================================
echo.
echo 1. Upload the 'marcel-v8-deploy' folder to Replit
echo 2. Run 'bash deploy-to-replit.sh' in Replit Shell
echo 3. Configure Secrets in Replit:
echo    - ANTHROPIC_API_KEY
echo    - NODE_ENV=production
echo    - PORT=3000
echo 4. Click Run to start Marcel!
echo.
echo ==========================================
pause