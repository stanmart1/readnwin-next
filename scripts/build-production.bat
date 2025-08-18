@echo off
setlocal enabledelayedexpansion

echo 🚀 Starting production build for Phusion Server deployment...

REM Check if Node.js is available
node --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Node.js is not installed. Please install Node.js 18+ first.
    pause
    exit /b 1
)

REM Check Node.js version
for /f "tokens=1,2 delims=." %%a in ('node --version') do set NODE_VERSION=%%a
set NODE_VERSION=!NODE_VERSION:~1!
if !NODE_VERSION! LSS 18 (
    echo ❌ Node.js version 18+ is required. Current version: 
    node --version
    pause
    exit /b 1
)

echo ✅ Node.js version: 
node --version

REM Clean previous builds
echo 🧹 Cleaning previous builds...
if exist .next rmdir /s /q .next
if exist out rmdir /s /q out
if exist dist rmdir /s /q dist

REM Install dependencies
echo 📦 Installing dependencies...
call npm ci --only=production

REM Build the application
echo 🔨 Building application...
set NODE_ENV=production
call npm run build

REM Create production directory
echo 📁 Creating production directory...
if exist production rmdir /s /q production
mkdir production

REM Copy necessary files
echo 📋 Copying production files...
xcopy .next production\.next /e /i /q
xcopy public production\public /e /i /q
copy package.json production\
copy package-lock.json production\
copy server.js production\
copy next.config.production.js production\next.config.js

REM Create production package.json
echo 📝 Creating production package.json...
(
echo {
echo   "name": "readnwinnext2-production",
echo   "version": "1.0.0",
echo   "private": true,
echo   "scripts": {
echo     "start": "NODE_ENV=production node server.js"
echo   },
echo   "dependencies": {
echo     "next": "^13.5.11",
echo     "react": "^18.2.0",
echo     "react-dom": "^18.2.0"
echo   },
echo   "engines": {
echo     "node": ">=18.0.0"
echo   }
echo }
) > production\package.json

REM Create .htaccess for cPanel
echo 🔧 Creating .htaccess file...
(
echo # Phusion Passenger + Next.js Configuration
echo PassengerEnabled On
echo PassengerAppRoot /home/username/readnwinnext2
echo PassengerAppType node
echo PassengerStartupFile server.js
echo PassengerNodejs /home/username/.nvm/versions/node/v18.17.0/bin/node
echo.
echo RewriteEngine On
echo RewriteCond %%{REQUEST_FILENAME} !-f
echo RewriteCond %%{REQUEST_FILENAME} !-d
echo RewriteRule ^^(.*^)$ /index.html [L]
echo.
echo Header always set X-Frame-Options "DENY"
echo Header always set X-Content-Type-Options "nosniff"
echo Header always set X-XSS-Protection "1; mode=block"
) > production\.htaccess

echo ✅ Production build completed successfully!
echo 📁 Production files are in the 'production' directory
echo 📤 Upload the contents of 'production' folder to your cPanel public_html directory
echo 📖 Read DEPLOYMENT_INSTRUCTIONS.md for detailed steps

pause
