@echo off
REM Fullstack Project Stop Script for Windows

echo 🛑 Stopping all services...

REM Kill node processes
taskkill /F /IM node.exe 2>nul

REM Stop Docker containers
docker compose down

echo ✅ All services stopped
pause
