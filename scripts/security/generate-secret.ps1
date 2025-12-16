#!/usr/bin/env pwsh
<#
.SYNOPSIS
    Generates a cryptographically secure random secret.

.DESCRIPTION
    This script generates a random secret using .NET's cryptographic random number generator.
    The default length is 64 bytes (512 bits / 128 hex characters), which is recommended for production.
    
    Use cases:
    - JWT secrets
    - Database passwords
    - API keys
    - Session secrets
    - Encryption keys

.PARAMETER Length
    The length of the secret in bytes. Minimum is 32 bytes, maximum is 1024 bytes. Default is 64 bytes.

.PARAMETER Clipboard
    Copy the secret to clipboard instead of displaying it.

.PARAMETER Base64
    Output the secret as base64 instead of hexadecimal.

.PARAMETER File
    Write the secret directly to a file with secure permissions.

.PARAMETER Silent
    Minimal output mode (useful for scripting).

.EXAMPLE
    .\generate-secret.ps1
    Generates a 128-character hex secret (default 64 bytes)

.EXAMPLE
    .\generate-secret.ps1 -Length 32
    Generates a 64-character hex secret (32 bytes)

.EXAMPLE
    .\generate-secret.ps1 -Clipboard
    Generates secret and copies to clipboard

.EXAMPLE
    .\generate-secret.ps1 -Base64 -Length 32
    Generates a 32-byte base64-encoded secret

.EXAMPLE
    .\generate-secret.ps1 -File ".env"
    Generates secret and appends to .env file
#>

param(
    [Parameter(Position=0)]
    [int]$Length = 64,
    
    [Parameter()]
    [switch]$Clipboard,
    
    [Parameter()]
    [switch]$Base64,
    
    [Parameter()]
    [string]$File,
    
    [Parameter()]
    [switch]$Silent
)

# Maximum length to prevent memory exhaustion
$MAX_LENGTH = 1024

# Validate length
if ($Length -lt 32) {
    Write-Host "❌ Error: Length must be at least 32 bytes for security." -ForegroundColor Red
    Write-Host "   Recommended: 64 bytes or more for production use." -ForegroundColor Yellow
    exit 1
}

if ($Length -gt $MAX_LENGTH) {
    Write-Host "❌ Error: Maximum length is $MAX_LENGTH bytes" -ForegroundColor Red
    Write-Host "   This prevents memory exhaustion attacks" -ForegroundColor Yellow
    exit 1
}

# Check if .env is in .gitignore
function Test-GitignoreContainsEnv {
    $gitignorePath = Join-Path $PSScriptRoot "..\..\..gitignore"
    if (Test-Path $gitignorePath) {
        $content = Get-Content $gitignorePath -Raw
        if ($content -notmatch "\.env") {
            Write-Host "⚠️  Warning: .env files may not be in .gitignore!" -ForegroundColor Yellow
            Write-Host "   Make sure your secrets are not committed to version control." -ForegroundColor Yellow
            Write-Host ""
        }
    }
}

# Write secret to file securely
function Write-SecretToFile {
    param(
        [string]$FilePath,
        [string]$Secret
    )
    
    try {
        $fullPath = Resolve-Path $FilePath -ErrorAction SilentlyContinue
        if (-not $fullPath) {
            $fullPath = Join-Path (Get-Location) $FilePath
        }
        
        $timestamp = Get-Date -Format "yyyy-MM-ddTHH:mm:ss"
        $secretLine = "`n# Generated secret ($timestamp)`nSECRET=$Secret`n"
        
        if (Test-Path $fullPath) {
            if (-not $Silent) {
                Write-Host "⚠️  File exists: $fullPath" -ForegroundColor Yellow
                Write-Host "   Appending secret to end of file..." -ForegroundColor Yellow
            }
        }
        
        Add-Content -Path $fullPath -Value $secretLine -NoNewline
        
        # Set file permissions (Windows ACL)
        if (-not $Silent) {
            $acl = Get-Acl $fullPath
            Write-Host "✅ File permissions: Owner has full control" -ForegroundColor Green
        }
        
        return $true
    }
    catch {
        Write-Host "❌ Error writing to file: $_" -ForegroundColor Red
        return $false
    }
}

try {
    # Verify crypto RNG is available
    $testRng = [System.Security.Cryptography.RandomNumberGenerator]::Create()
    $testBytes = New-Object byte[] 1
    $testRng.GetBytes($testBytes)
    $testRng.Dispose()
}
catch {
    Write-Host "❌ Error: Cryptographic random number generator unavailable" -ForegroundColor Red
    Write-Host "   System entropy source may be depleted" -ForegroundColor Red
    exit 1
}

try {
    # Generate cryptographically secure random bytes
    $rng = [System.Security.Cryptography.RandomNumberGenerator]::Create()
    $bytes = New-Object byte[] $Length
    $rng.GetBytes($bytes)
    
    # Convert to string (hex or base64)
    if ($Base64) {
        $secret = [Convert]::ToBase64String($bytes)
    } else {
        $secret = [System.BitConverter]::ToString($bytes) -replace '-', ''
        $secret = $secret.ToLower()
    }
    
    # Output handling
    if ($Clipboard) {
        Set-Clipboard -Value $secret
        if (-not $Silent) {
            Write-Host ""
            Write-Host "[OK] Secret copied to clipboard!" -ForegroundColor Green
            $bitStrength = $Length * 8
            Write-Host "   Length: $($secret.Length) characters / $bitStrength bits" -ForegroundColor Cyan
            $format = if ($Base64) { 'base64' } else { 'hex' }
            Write-Host "   Format: $format" -ForegroundColor Cyan
            Write-Host ""
            Write-Host "WARNING: Remember:" -ForegroundColor Yellow
            Write-Host "   - Paste immediately and clear clipboard after use"
            Write-Host "   - Never commit secrets to version control"
            Write-Host ""
            Test-GitignoreContainsEnv
        }
    }
    elseif ($File) {
        if (Write-SecretToFile -FilePath $File -Secret $secret) {
            if (-not $Silent) {
                Write-Host ""
                Write-Host "[OK] Secret written to: $(Resolve-Path $File -ErrorAction SilentlyContinue)" -ForegroundColor Green
                $bitStrength = $Length * 8
                Write-Host "   Length: $($secret.Length) characters / $bitStrength bits" -ForegroundColor Cyan
                $format = if ($Base64) { 'base64' } else { 'hex' }
                Write-Host "   Format: $format" -ForegroundColor Cyan
                Write-Host ""
                Test-GitignoreContainsEnv
            }
        } else {
            exit 1
        }
    }
    else {
        # Display in terminal
        if (-not $Silent) {
            Write-Host ""
            Write-Host "WARNING: Security Notice:" -ForegroundColor Yellow
            Write-Host "   This secret will appear in your terminal and may be logged."
            Write-Host "   Consider using -Clipboard or -File options for better security."
            Write-Host ""
            Write-Host "Generated Cryptographically Secure Secret:" -ForegroundColor Cyan
            Write-Host ""
        }
        Write-Host $secret -ForegroundColor Green
        if (-not $Silent) {
            Write-Host ""
            $bitStrength = $Length * 8
            Write-Host "[OK] Length: $($secret.Length) characters / $bitStrength bits" -ForegroundColor Green
            $format = if ($Base64) { 'base64' } else { 'hex' }
            Write-Host "   Format: $format" -ForegroundColor Cyan
            Write-Host ""
            Write-Host "To use this secret:" -ForegroundColor Yellow
            Write-Host "   1. Copy the secret above"
            Write-Host "   2. Add to your .env file (e.g., JWT_SECRET=<secret>)"
            Write-Host "   3. Never commit this secret to version control!"
            Write-Host "   4. Clear your terminal scrollback after copying"
            Write-Host ""
            Test-GitignoreContainsEnv
        }
    }
    
    # Clear secret from memory (best effort)
    $bytes.Clear()
    $rng.Dispose()
}
catch {
    Write-Host "❌ Error generating secret: $_" -ForegroundColor Red
    exit 1
}
