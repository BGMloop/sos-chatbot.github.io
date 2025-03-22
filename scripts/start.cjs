// Load environment variables from .env.local
require('dotenv').config({ path: '.env.local' });
const fs = require('fs');
const path = require('path');

// Set port and important Clerk environment variables
process.env.PORT = 3001;

// Explicitly set these if they're not already set
// We don't want to overwrite values loaded from .env.local
if (!process.env.CLERK_SECRET_KEY) {
  process.env.CLERK_SECRET_KEY = "sk_test_WW04s3alnfFHStCjwB1NcQtYTVsh5sjq0tXPS4Cptb";
}

if (!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY) {
  process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY = "pk_test_bW9kZWwtZ3VsbC02OS5jbGVyay5hY2NvdW50cy5kZXYk";
}

// Copy static assets to the correct location if they don't exist
const staticDir = path.join(__dirname, '../.next/standalone/.next/static');
const originalStaticDir = path.join(__dirname, '../.next/static');

// Create the directory if it doesn't exist
if (!fs.existsSync(staticDir)) {
  console.log('Creating static directory...');
  fs.mkdirSync(staticDir, { recursive: true });
}

// Copy static files if they don't exist or if source is newer
console.log('Copying static assets to standalone directory...');
if (fs.existsSync(originalStaticDir)) {
  copyDir(originalStaticDir, staticDir);
}

// Also copy the public folder to the standalone directory
const publicDir = path.join(__dirname, '../public');
const standalonePublicDir = path.join(__dirname, '../.next/standalone/public');

if (fs.existsSync(publicDir)) {
  console.log('Copying public folder to standalone directory...');
  copyDir(publicDir, standalonePublicDir);
}

// Log the environment variables we care about
console.log("Starting server with:");
console.log("PORT:", process.env.PORT);
console.log("CLERK_SECRET_KEY:", process.env.CLERK_SECRET_KEY ? "✓ Set" : "❌ Not set");
console.log("NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY:", process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY ? "✓ Set" : "❌ Not set");

// Run the standalone server
require('../.next/standalone/server.js');

// Helper function to copy directory recursively
function copyDir(src, dest) {
  if (!fs.existsSync(dest)) {
    fs.mkdirSync(dest, { recursive: true });
  }
  
  const entries = fs.readdirSync(src, { withFileTypes: true });
  
  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    
    if (entry.isDirectory()) {
      copyDir(srcPath, destPath);
    } else {
      // Only copy if destination doesn't exist or source is newer
      if (!fs.existsSync(destPath) || 
          fs.statSync(srcPath).mtime > fs.statSync(destPath).mtime) {
        fs.copyFileSync(srcPath, destPath);
        console.log(`Copied: ${destPath}`);
      }
    }
  }
} 