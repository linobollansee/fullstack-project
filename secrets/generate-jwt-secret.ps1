#!/usr/bin/env pwsh
<#
.SYNOPSIS
    Generates a cryptographically secure JWT secret.

.DESCRIPTION
    This script generates a random JWT secret using .NET's cryptographic random number generator.
    The default length is 64 bytes (512 bits / 128 hex characters), which is recommended for production.

.PARAMETER Length
    The length of the secret in bytes. Minimum is 32 bytes. Default is 64 bytes.

.EXAMPLE
    .\generate-jwt-secret.ps1
    Generates a 128-character secret (default 64 bytes)

.EXAMPLE
    .\generate-jwt-secret.ps1 -Length 32
    Generates a 64-character secret (32 bytes)
#>

param(
    [Parameter(Position=0)]
    [int]$Length = 64
)

# Validate minimum length
if ($Length -lt 32) {
    Write-Host "❌ Error: Length must be at least 32 bytes for security." -ForegroundColor Red
    Write-Host "   Recommended: 64 bytes or more for production use." -ForegroundColor Yellow
    exit 1
}

try {
    # Generate cryptographically secure random bytes
    $rng = [System.Security.Cryptography.RandomNumberGenerator]::Create()
    $bytes = New-Object byte[] $Length
    $rng.GetBytes($bytes)
    
    # Convert to hexadecimal string
    $secret = [System.BitConverter]::ToString($bytes) -replace '-', ''
    $secret = $secret.ToLower()
    
    # Display the secret
    Write-Host ""
    Write-Host "🔐 Generated JWT Secret:" -ForegroundColor Cyan
    Write-Host $secret -ForegroundColor Green
    Write-Host ""
    Write-Host "✅ Length: $($secret.Length) characters ($($Length * 8) bits)" -ForegroundColor Green
    Write-Host ""
    Write-Host "📋 To use this secret:" -ForegroundColor Yellow
    Write-Host "   1. Copy the secret above"
    Write-Host "   2. Update your .env file: JWT_SECRET=<paste-secret-here>"
    Write-Host "   3. Never commit this secret to version control!"
    Write-Host ""
    
    $rng.Dispose()
}
catch {
    Write-Host "❌ Error generating secret: $_" -ForegroundColor Red
    exit 1
}
