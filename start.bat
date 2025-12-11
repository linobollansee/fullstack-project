@echo off
REM Fullstack Project Startup Script for Windows

echo 🚀 Starting Fullstack Project...
echo.

REM Start PostgreSQL database
echo 📦 Starting PostgreSQL database...
docker compose up -d postgres

REM Wait for database to be ready
echo ⏳ Waiting for database to be ready...
timeout /t 3 /nobreak >nul

REM Start backend in new terminal
echo 🔧 Starting backend API...
start "Backend API" cmd /k "cd backend && npm run start:dev"

REM Wait for backend to initialize
echo ⏳ Waiting for backend to initialize...
timeout /t 5 /nobreak >nul

REM Start frontend in new terminal
echo 🎨 Starting frontend...
start "Frontend App" cmd /k "cd frontend && npm run dev"

echo.
echo ✅ All services started in separate windows!
echo.
echo 📍 Access points:
echo    Frontend:     http://localhost:3000
echo    Backend API:  http://localhost:3001
echo    Swagger Docs: http://localhost:3001/api
echo    Database:     localhost:5432
echo.
echo To stop all services, run: stop.bat
echo.
pause
