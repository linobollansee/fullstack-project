@echo off
REM Generate JWT Secret Script for Windows
REM 
REM Usage: generate-jwt-secret.bat

echo.
echo 🔐 Generating JWT Secret...
echo.

node generate-jwt-secret.js %1

if errorlevel 1 (
  echo.
  echo ❌ Failed to generate secret. Make sure Node.js is installed.
  pause
  exit /b 1
)

pause
