#!/usr/bin/env node

const path = require('path');
const { execSync } = require('child_process');
const fs = require('fs');

// Define paths
const rootDir = path.resolve(__dirname, '..');
const nextBin = path.join(rootDir, 'node_modules', '.bin', 'next');

// Create a minimal temp next.config.js
const tempConfigPath = path.join(rootDir, 'next.config.minimal.js');
const tempConfig = `
module.exports = {
  output: 'standalone',
  distDir: '.next',
  reactStrictMode: false,
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  staticPageGenerationTimeout: 1,
};
`;

// Write the temp config file
fs.writeFileSync(tempConfigPath, tempConfig);

try {
  console.log('🔨 Running minimal build...');
  
  // Run the build with minimal config
  execSync(`NEXT_CONFIG_FILE=${tempConfigPath} NODE_ENV=development node ${nextBin} build --no-lint`, {
    stdio: 'inherit',
    cwd: rootDir,
    env: {
      ...process.env,
      SKIP_TYPE_CHECK: 'true',
      NEXT_TELEMETRY_DISABLED: '1',
    }
  });
  
  console.log('✅ Minimal build completed successfully');
} catch (error) {
  console.error('❌ Build failed:', error.message);
  process.exit(1);
} finally {
  // Clean up temp config
  if (fs.existsSync(tempConfigPath)) {
    fs.unlinkSync(tempConfigPath);
  }
} 