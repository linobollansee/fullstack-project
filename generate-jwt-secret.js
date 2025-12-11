#!/usr/bin/env node

/**
 * Generate a secure JWT secret
 *
 * Usage: node generate-jwt-secret.js [length]
 * Default length: 64 bytes (512 bits)
 */

const crypto = require("crypto");

// Get length from command line argument or use default
const length = parseInt(process.argv[2]) || 64;

// Validate length
if (length < 32) {
  console.error("❌ Error: Secret length must be at least 32 bytes (256 bits)");
  console.error("Recommended: 64 bytes or more for production");
  process.exit(1);
}

// Generate random secret
const secret = crypto.randomBytes(length).toString("hex");

console.log("\n🔐 Generated JWT Secret:\n");
console.log(secret);
console.log(`\n✅ Length: ${secret.length} characters (${length * 8} bits)\n`);
console.log("📋 To use this secret:");
console.log("   1. Copy the secret above");
console.log("   2. Update your .env file: JWT_SECRET=<paste-secret-here>");
console.log("   3. Never commit this secret to version control!\n");
