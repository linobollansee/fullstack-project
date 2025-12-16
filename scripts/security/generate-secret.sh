#!/bin/bash

# Generate Cryptographically Secure Random Secret
# 
# Usage: ./generate-secret.sh [options] [length]
# 
# Options:
#   -c, --clipboard    Copy to clipboard instead of displaying
#   -b, --base64       Output as base64 instead of hex
#   -f, --file <path>  Write directly to file (with secure permissions)
#   -s, --silent       Silent mode (minimal output)
#   -h, --help         Show help message
#
# Default length: 64 bytes (512 bits)
#
# Use cases:
# - JWT secrets
# - Database passwords
# - API keys
# - Session secrets
# - Encryption keys

set -euo pipefail

# Maximum length to prevent memory exhaustion
MAX_LENGTH=1024

# Default values
LENGTH=64
CLIPBOARD=false
BASE64=false
SILENT=false
FILE=""

# Parse arguments
while [[ $# -gt 0 ]]; do
  case $1 in
    -c|--clipboard)
      CLIPBOARD=true
      shift
      ;;
    -b|--base64)
      BASE64=true
      shift
      ;;
    -s|--silent)
      SILENT=true
      shift
      ;;
    -f|--file)
      FILE="$2"
      shift 2
      ;;
    -h|--help)
      cat << EOF

🔐 Cryptographically Secure Secret Generator

Usage: ./generate-secret.sh [options] [length]

Options:
  -c, --clipboard       Copy to clipboard (avoids terminal display)
  -b, --base64          Output as base64 instead of hex
  -f, --file <path>     Write directly to file with secure permissions
  -s, --silent          Minimal output (for scripting)
  -h, --help            Show this help message

Arguments:
  length               Length in bytes (default: 64, min: 32, max: $MAX_LENGTH)

Examples:
  ./generate-secret.sh                    # Generate 64-byte hex secret
  ./generate-secret.sh 128                # Generate 128-byte secret
  ./generate-secret.sh -c                 # Copy to clipboard
  ./generate-secret.sh -b                 # Base64 encoded secret
  ./generate-secret.sh -f .env            # Append to .env file
  ./generate-secret.sh -c -b 32           # 32-byte base64 to clipboard

Security Features:
  ✓ Cryptographically secure random number generator
  ✓ Clipboard support (prevents terminal logging)
  ✓ Direct file output with permission checks
  ✓ Input validation and memory protection
  ✓ .gitignore verification

EOF
      exit 0
      ;;
    -*)
      echo "Unknown option: $1"
      echo "Use -h or --help for usage information"
      exit 1
      ;;
    *)
      if [[ "$1" =~ ^[0-9]+$ ]]; then
        LENGTH=$1
      else
        echo "Invalid argument: $1"
        exit 1
      fi
      shift
      ;;
  esac
done

# Validate length
if [ "$LENGTH" -lt 32 ]; then
  echo "❌ Error: Secret length must be at least 32 bytes (256 bits)"
  echo "   Recommended: 64 bytes or more for production"
  exit 1
fi

if [ "$LENGTH" -gt "$MAX_LENGTH" ]; then
  echo "❌ Error: Maximum length is $MAX_LENGTH bytes"
  echo "   This prevents memory exhaustion attacks"
  exit 1
fi

# Verify OpenSSL is available
if ! command -v openssl &> /dev/null; then
  echo "❌ Error: OpenSSL is not installed"
  echo "   OpenSSL is required for cryptographically secure random generation"
  exit 1
fi

# Check if .env is in .gitignore
check_gitignore() {
  local gitignore_path="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)/.gitignore"
  if [ -f "$gitignore_path" ]; then
    if ! grep -q ".env" "$gitignore_path"; then
      echo "⚠️  Warning: .env files may not be in .gitignore!"
      echo "   Make sure your secrets are not committed to version control."
      echo ""
    fi
  fi
}

# Copy to clipboard (cross-platform)
copy_to_clipboard() {
  local text="$1"
  if command -v xclip &> /dev/null; then
    echo -n "$text" | xclip -selection clipboard
    return 0
  elif command -v xsel &> /dev/null; then
    echo -n "$text" | xsel --clipboard --input
    return 0
  elif command -v pbcopy &> /dev/null; then
    echo -n "$text" | pbcopy
    return 0
  elif command -v clip.exe &> /dev/null; then
    echo -n "$text" | clip.exe
    return 0
  else
    return 1
  fi
}

# Write to file securely
write_to_file() {
  local filepath="$1"
  local secret="$2"
  local timestamp=$(date -u +"%Y-%m-%dT%H:%M:%SZ")
  
  if [ -f "$filepath" ]; then
    if [ "$SILENT" = false ]; then
      echo "⚠️  File exists: $filepath"
      echo "   Appending secret to end of file..."
    fi
  fi
  
  {
    echo ""
    echo "# Generated secret ($timestamp)"
    echo "SECRET=$secret"
  } >> "$filepath"
  
  # Set secure permissions
  chmod 600 "$filepath" 2>/dev/null || true
  
  # Verify permissions
  if [ "$SILENT" = false ]; then
    local perms=$(stat -c "%a" "$filepath" 2>/dev/null || stat -f "%OLp" "$filepath" 2>/dev/null || echo "unknown")
    if [ "$perms" != "600" ]; then
      echo "⚠️  Warning: File permissions are $perms, should be 600"
    fi
  fi
}

# Generate random secret using OpenSSL
if [ "$BASE64" = true ]; then
  SECRET=$(openssl rand -base64 "$LENGTH")
else
  SECRET=$(openssl rand -hex "$LENGTH")
fi

# Output handling
if [ "$CLIPBOARD" = true ]; then
  if copy_to_clipboard "$SECRET"; then
    if [ "$SILENT" = false ]; then
      echo ""
      echo "✅ Secret copied to clipboard!"
      echo "   Length: ${#SECRET} characters ($((LENGTH * 8)) bits)"
      echo "   Format: $([ "$BASE64" = true ] && echo "base64" || echo "hex")"
      echo ""
      echo "⚠️  Remember:"
      echo "   • Paste immediately and clear clipboard after use"
      echo "   • Never commit secrets to version control"
      echo ""
      check_gitignore
    fi
  else
    echo "❌ Failed to copy to clipboard (no clipboard tool found)"
    echo "   Install xclip, xsel, or pbcopy"
    echo "   Displaying secret instead:"
    echo ""
    echo "$SECRET"
    echo ""
  fi
elif [ -n "$FILE" ]; then
  write_to_file "$FILE" "$SECRET"
  if [ "$SILENT" = false ]; then
    echo ""
    echo "✅ Secret written to: $(readlink -f "$FILE" 2>/dev/null || realpath "$FILE" 2>/dev/null || echo "$FILE")"
    echo "   Length: ${#SECRET} characters ($((LENGTH * 8)) bits)"
    echo "   Format: $([ "$BASE64" = true ] && echo "base64" || echo "hex")"
    echo ""
    check_gitignore
  fi
else
  # Display in terminal
  if [ "$SILENT" = false ]; then
    echo ""
    echo "⚠️  Security Notice:"
    echo "   This secret will appear in your terminal and may be logged."
    echo "   Consider using -c or -f options for better security."
    echo ""
    echo "🔐 Generated Cryptographically Secure Secret:"
    echo ""
  fi
  echo "$SECRET"
  if [ "$SILENT" = false ]; then
    echo ""
    echo "✅ Length: ${#SECRET} characters ($((LENGTH * 8)) bits)"
    echo "   Format: $([ "$BASE64" = true ] && echo "base64" || echo "hex")"
    echo ""
    echo "📋 To use this secret:"
    echo "   1. Copy the secret above"
    echo "   2. Add to your .env file (e.g., JWT_SECRET=<secret>)"
    echo "   3. Never commit this secret to version control!"
    echo "   4. Clear your terminal scrollback after copying"
    echo ""
    check_gitignore
  fi
fi

# Clear secret from memory (best effort - Bash doesn't provide secure memory clearing)
unset SECRET
