#!/bin/bash

# Script to optimize macOS for Next.js development
# Usage: bash scripts/optimize-dev.sh

# Check if running on macOS
if [[ "$(uname)" != "Darwin" ]]; then
  echo "This script is designed for macOS. Exiting."
  exit 1
fi

echo "🚀 Optimizing your macOS environment for Next.js development..."

# Create RAM disk for .next directory if it doesn't exist
if [[ ! -d "/tmp/.next" ]]; then
  echo "📁 Creating RAM disk for .next directory..."
  mkdir -p /tmp/.next
  echo "✅ RAM disk created at /tmp/.next"
else
  echo "✅ Using existing /tmp/.next directory"
fi

# Note: Skip sudo operations to avoid permission issues
echo "💡 Note: For optimal performance, consider manually running:"
echo "  - sudo killall -HUP mDNSResponder (clears DNS cache)"
echo "  - sudo mdutil -i off \"/Users/$(whoami)/Documents/GitHub/sos-chatbot.github.io\" (disables Spotlight)"

# Kill any zombie Node.js processes
echo "💀 Killing any zombie Node.js processes..."
pkill -f "node" || true

# Clear any previous .next directory
echo "🗑️ Cleaning previous build artifacts..."
rm -rf .next
rm -rf node_modules/.cache

# Optional: Create a temp .gitignore for development
if [[ ! -f ".gitignore-dev" ]]; then
  echo "📝 Creating development .gitignore..."
  cp .gitignore .gitignore-backup
  cat > .gitignore-dev << EOF
# Standard ignores
node_modules
.next
.turbo
.cache
*.log
.DS_Store

# Development-specific ignores
.env.local
*.tsbuildinfo
next-env.d.ts
.vercel
.vscode/*
EOF
fi

# Start the development server with optimizations
echo "🌟 Starting optimized development server..."
NEXT_DIST_DIR=/tmp/.next CHOKIDAR_USEPOLLING=false NODE_OPTIONS='--max-old-space-size=4096' pnpm dev

# Run this when done (uncomment to use)
# cleanup() {
#   echo "🧹 Cleaning up..."
#   sudo mdutil -i on "$(pwd)"
#   mv .gitignore-backup .gitignore
#   echo "✅ Spotlight indexing re-enabled"
# }
# 
# trap cleanup EXIT 