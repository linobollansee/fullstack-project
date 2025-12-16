#!/usr/bin/env node

/**
 * Generate a cryptographically secure random secret
 *
 * Usage: node generate-secret.js [options] [length]
 * 
 * Options:
 *   --clipboard, -c    Copy to clipboard instead of displaying
 *   --base64, -b       Output as base64 instead of hex
 *   --file <path>, -f  Write directly to file (with secure permissions)
 *   --silent, -s       Silent mode (minimal output)
 *   --help, -h         Show help message
 * 
 * Default length: 64 bytes (512 bits)
 * 
 * Use cases:
 * - JWT secrets
 * - Database passwords
 * - API keys
 * - Session secrets
 * - Encryption keys
 */

const crypto = require("crypto");
const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

// Maximum length to prevent memory exhaustion attacks
const MAX_LENGTH = 1024;

// Parse command line arguments
const args = process.argv.slice(2);
const options = {
  clipboard: args.includes("--clipboard") || args.includes("-c"),
  base64: args.includes("--base64") || args.includes("-b"),
  silent: args.includes("--silent") || args.includes("-s"),
  help: args.includes("--help") || args.includes("-h"),
  file: null,
  length: 64,
};

// Extract file path if provided
const fileIndex = args.findIndex((arg) => arg === "--file" || arg === "-f");
if (fileIndex !== -1 && args[fileIndex + 1]) {
  options.file = args[fileIndex + 1];
}

// Extract length (first numeric argument that's not after --file)
const lengthArg = args.find((arg, index) => {
  return (
    /^\d+$/.test(arg) &&
    index !== fileIndex + 1 &&
    !arg.startsWith("-")
  );
});
if (lengthArg) {
  options.length = parseInt(lengthArg);
}

// Show help
if (options.help) {
  console.log(`
🔐 Cryptographically Secure Secret Generator

Usage: node generate-secret.js [options] [length]

Options:
  --clipboard, -c       Copy to clipboard (avoids terminal display)
  --base64, -b          Output as base64 instead of hex
  --file <path>, -f     Write directly to file with secure permissions
  --silent, -s          Minimal output (for scripting)
  --help, -h            Show this help message

Arguments:
  length               Length in bytes (default: 64, min: 32, max: ${MAX_LENGTH})

Examples:
  node generate-secret.js                    # Generate 64-byte hex secret
  node generate-secret.js 128                # Generate 128-byte secret
  node generate-secret.js --clipboard        # Copy to clipboard
  node generate-secret.js --base64           # Base64 encoded secret
  node generate-secret.js --file .env        # Append to .env file
  node generate-secret.js -c -b 32           # 32-byte base64 to clipboard

Security Features:
  ✓ Cryptographically secure random number generator
  ✓ Clipboard support (prevents terminal logging)
  ✓ Direct file output with permission checks
  ✓ Input validation and memory protection
  ✓ .gitignore verification
`);
  process.exit(0);
}

// Validate length
if (options.length < 32) {
  console.error("❌ Error: Secret length must be at least 32 bytes (256 bits)");
  console.error("   Recommended: 64 bytes or more for production");
  process.exit(1);
}

if (options.length > MAX_LENGTH) {
  console.error(`❌ Error: Maximum length is ${MAX_LENGTH} bytes`);
  console.error("   This prevents memory exhaustion attacks");
  process.exit(1);
}

// Verify crypto entropy source is available
try {
  crypto.randomBytes(1);
} catch (error) {
  console.error("❌ Error: Cryptographic random number generator unavailable");
  console.error("   System entropy source may be depleted");
  process.exit(1);
}

// Check if .env is in .gitignore
function checkGitignore() {
  const gitignorePath = path.join(__dirname, "..", "..", ".gitignore");
  try {
    if (fs.existsSync(gitignorePath)) {
      const gitignoreContent = fs.readFileSync(gitignorePath, "utf-8");
      if (!gitignoreContent.includes(".env")) {
        console.warn("⚠️  Warning: .env files may not be in .gitignore!");
        console.warn("   Make sure your secrets are not committed to version control.\n");
      }
    }
  } catch (error) {
    // Silently fail if we can't check .gitignore
  }
}

// Copy to clipboard (cross-platform)
function copyToClipboard(text) {
  try {
    if (process.platform === "win32") {
      execSync("clip", { input: text });
    } else if (process.platform === "darwin") {
      execSync("pbcopy", { input: text });
    } else {
      // Linux - try xclip or xsel
      try {
        execSync("xclip -selection clipboard", { input: text });
      } catch {
        execSync("xsel --clipboard --input", { input: text });
      }
    }
    return true;
  } catch (error) {
    return false;
  }
}

// Write to file securely
function writeToFile(filePath, secret) {
  try {
    const fullPath = path.resolve(filePath);
    const secretLine = `\n# Generated secret (${new Date().toISOString()})\nSECRET=${secret}\n`;
    
    // Check if file exists and warn about overwriting
    if (fs.existsSync(fullPath)) {
      if (!options.silent) {
        console.log(`⚠️  File exists: ${fullPath}`);
        console.log("   Appending secret to end of file...");
      }
    }
    
    fs.appendFileSync(fullPath, secretLine, { mode: 0o600 });
    
    // Verify permissions (Unix-like systems)
    if (process.platform !== "win32") {
      const stats = fs.statSync(fullPath);
      const mode = stats.mode & parseInt("777", 8);
      if (mode !== parseInt("600", 8)) {
        console.warn(`⚠️  Warning: File permissions are ${mode.toString(8)}, should be 600`);
      }
    }
    
    return true;
  } catch (error) {
    console.error(`❌ Error writing to file: ${error.message}`);
    return false;
  }
}

// Generate random secret
let secretBuffer;
try {
  secretBuffer = crypto.randomBytes(options.length);
} catch (error) {
  console.error("❌ Error generating random bytes:", error.message);
  process.exit(1);
}

const secret = options.base64
  ? secretBuffer.toString("base64")
  : secretBuffer.toString("hex");

// Output handling
if (options.clipboard) {
  if (copyToClipboard(secret)) {
    if (!options.silent) {
      console.log("\n✅ Secret copied to clipboard!");
      console.log(`   Length: ${secret.length} characters (${options.length * 8} bits)`);
      console.log(`   Format: ${options.base64 ? "base64" : "hex"}`);
      console.log("\n⚠️  Remember:");
      console.log("   • Paste immediately and clear clipboard after use");
      console.log("   • Never commit secrets to version control");
      checkGitignore();
    }
  } else {
    console.error("❌ Failed to copy to clipboard");
    console.error("   Displaying secret instead:");
    console.log(`\n${secret}\n`);
  }
} else if (options.file) {
  if (writeToFile(options.file, secret)) {
    if (!options.silent) {
      console.log(`\n✅ Secret written to: ${path.resolve(options.file)}`);
      console.log(`   Length: ${secret.length} characters (${options.length * 8} bits)`);
      console.log(`   Format: ${options.base64 ? "base64" : "hex"}`);
      checkGitignore();
    }
  } else {
    process.exit(1);
  }
} else {
  // Display in terminal
  if (!options.silent) {
    console.log("\n⚠️  Security Notice:");
    console.log("   This secret will appear in your terminal and may be logged.");
    console.log("   Consider using --clipboard or --file options for better security.");
    console.log("\n🔐 Generated Cryptographically Secure Secret:\n");
  }
  console.log(secret);
  if (!options.silent) {
    console.log(`\n✅ Length: ${secret.length} characters (${options.length * 8} bits)`);
    console.log(`   Format: ${options.base64 ? "base64" : "hex"}\n`);
    console.log("📋 To use this secret:");
    console.log("   1. Copy the secret above");
    console.log("   2. Add to your .env file (e.g., JWT_SECRET=<secret>)");
    console.log("   3. Never commit this secret to version control!");
    console.log("   4. Clear your terminal scrollback after copying");
    checkGitignore();
  }
}

// Clear secret from memory (best effort)
secretBuffer.fill(0);
console.log("");
