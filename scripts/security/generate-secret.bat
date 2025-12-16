@echo off
REM Generate Cryptographically Secure Random Secret (Windows)
REM 
REM Usage: generate-secret.bat [options] [length]
REM
REM Options:
REM   -c, --clipboard    Copy to clipboard
REM   -b, --base64       Output as base64
REM   -f, --file <path>  Write to file
REM   -s, --silent       Silent mode
REM   -h, --help         Show help
REM
REM Use cases:
REM - JWT secrets
REM - Database passwords
REM - API keys
REM - Session secrets
REM - Encryption keys

setlocal enabledelayedexpansion

REM Check for help flag
if "%~1"=="-h" goto :help
if "%~1"=="--help" goto :help

echo.
echo 🔐 Generating Cryptographically Secure Secret...
echo.

REM Pass all arguments to Node.js script
node "%~dp0generate-secret.js" %*

if errorlevel 1 (
  echo.
  echo ❌ Failed to generate secret.
  echo    Make sure Node.js is installed.
  echo.
  pause
  exit /b 1
)

goto :end

:help
echo.
echo 🔐 Cryptographically Secure Secret Generator
echo.
echo Usage: generate-secret.bat [options] [length]
echo.
echo Options:
echo   -c, --clipboard       Copy to clipboard
echo   -b, --base64          Output as base64
echo   -f, --file ^<path^>     Write to file
echo   -s, --silent          Silent mode
echo   -h, --help            Show help
echo.
echo Examples:
echo   generate-secret.bat                 # Generate 64-byte hex secret
echo   generate-secret.bat 128             # Generate 128-byte secret
echo   generate-secret.bat -c              # Copy to clipboard
echo   generate-secret.bat -b              # Base64 encoded
echo   generate-secret.bat -f .env         # Write to .env file
echo.
pause
exit /b 0

:end
pause
endlocal
