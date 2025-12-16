@echo off
chcp 65001 >nul
REM Fullstack Project Startup Script for Windows

echo 🚀 Starting Fullstack Project...
echo.

REM Get the directory where the script is located
set "SCRIPT_DIR=%~dp0"
cd /d "%SCRIPT_DIR%"

REM Ensure Docker is authenticated
echo 🔐 Checking Docker authentication...
docker login >nul 2>&1
if errorlevel 1 (
    echo ⚠️  Not logged into Docker. Please authenticate:
    docker login
    if errorlevel 1 (
        echo ❌ Docker login failed.
        pause
        exit /b 1
    )
)
echo ✅ Docker authenticated
echo.

REM Start PostgreSQL database
echo 📦 Starting PostgreSQL database...
docker-compose up -d postgres
if errorlevel 1 (
    echo ❌ Failed to start database. Make sure Docker is running.
    pause
    exit /b 1
)

REM Wait for database to be ready
echo ⏳ Waiting for database to be ready...
timeout /t 3 /nobreak >nul

REM Start backend in new terminal
echo 🔧 Starting backend API...
start "Backend API" cmd /k "cd /d "%SCRIPT_DIR%backend" && npm run start:dev"

REM Wait for backend to initialize
echo ⏳ Waiting for backend to initialize...
timeout /t 5 /nobreak >nul

REM Start frontend in new terminal
echo 🎨 Starting frontend...
start "Frontend App" cmd /k "cd /d "%SCRIPT_DIR%frontend" && npm run dev"

echo.
echo ✅ All services started in separate windows!
echo.
echo 📍 Access points:
echo    Frontend:     http://localhost:3000
echo    Backend API:  http://localhost:3001
echo    Swagger Docs: http://localhost:3001/api
echo    Database:     localhost:5432
echo.
echo To stop all services, run: stop-all-services.bat
echo.
pause
