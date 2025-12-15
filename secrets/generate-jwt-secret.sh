#!/bin/bash

# Generate JWT Secret Script
# 
# Usage: ./generate-jwt-secret.sh [length]
# Default length: 64 bytes (512 bits)

LENGTH=${1:-64}

# Validate length
if [ "$LENGTH" -lt 32 ]; then
  echo "❌ Error: Secret length must be at least 32 bytes (256 bits)"
  echo "Recommended: 64 bytes or more for production"
  exit 1
fi

# Generate random secret using OpenSSL
SECRET=$(openssl rand -hex "$LENGTH")

echo ""
echo "🔐 Generated JWT Secret:"
echo ""
echo "$SECRET"
echo ""
echo "✅ Length: ${#SECRET} characters ($((LENGTH * 8)) bits)"
echo ""
echo "📋 To use this secret:"
echo "   1. Copy the secret above"
echo "   2. Update your .env file: JWT_SECRET=<paste-secret-here>"
echo "   3. Never commit this secret to version control!"
echo ""
