#!/usr/bin/env node

/**
 * This script helps analyze Next.js build performance issues
 * Run with: node scripts/analyze-bundle.js
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🔍 Analyzing Next.js application for performance issues...');

// Check package.json for potential issues
try {
  console.log('\n📦 Checking dependencies...');
  const packageJson = JSON.parse(fs.readFileSync('./package.json', 'utf8'));
  
  // Count dependencies
  const deps = Object.keys(packageJson.dependencies || {}).length;
  const devDeps = Object.keys(packageJson.devDependencies || {}).length;
  
  console.log(`Total dependencies: ${deps} regular, ${devDeps} dev dependencies`);
  
  if (deps > 50) {
    console.log('⚠️ High number of dependencies may slow down builds. Consider removing unused ones.');
  }
  
  // Check for duplicate React versions
  const hasReact18 = packageJson.dependencies.react && packageJson.dependencies.react.includes('18');
  const hasReact19 = packageJson.dependencies.react && packageJson.dependencies.react.includes('19');
  
  if (hasReact19) {
    console.log('⚠️ Using React 19, which is very new. Ensure all your dependencies are compatible.');
  }
  
  // Check for known problematic dependencies
  const largePackages = [
    'core-js',
    'lodash',
    'moment',
    'antd',
    'material-ui',
    '@aws-amplify',
  ];
  
  const installedLargePackages = Object.keys(packageJson.dependencies || {})
    .filter(dep => largePackages.some(p => dep.includes(p)));
  
  if (installedLargePackages.length > 0) {
    console.log(`⚠️ Found potentially large packages: ${installedLargePackages.join(', ')}`);
    console.log('   Consider using alternatives or dynamic imports for these.');
  }
  
} catch (error) {
  console.error('Error analyzing package.json:', error.message);
}

// Check source code structure
try {
  console.log('\n📁 Analyzing project structure...');
  
  // Count files by type
  const countFilesByType = (dir, extensions, ignore = []) => {
    let counts = {};
    
    const readDir = (currentDir) => {
      if (ignore.some(i => currentDir.includes(i))) return;
      
      const files = fs.readdirSync(currentDir, { withFileTypes: true });
      
      for (const file of files) {
        const fullPath = path.join(currentDir, file.name);
        
        if (file.isDirectory()) {
          readDir(fullPath);
        } else {
          const ext = path.extname(file.name).toLowerCase();
          if (extensions.includes(ext)) {
            counts[ext] = (counts[ext] || 0) + 1;
            
            // Check file size
            const stats = fs.statSync(fullPath);
            if (stats.size > 100 * 1024) { // Over 100KB
              console.log(`⚠️ Large file detected: ${fullPath} (${Math.round(stats.size / 1024)}KB)`);
            }
          }
        }
      }
    };
    
    readDir(dir);
    return counts;
  };
  
  const fileCounts = countFilesByType('./app', ['.js', '.jsx', '.ts', '.tsx'], ['node_modules', '.next']);
  console.log('File counts by type:', fileCounts);
  
  // Look for potential route bottlenecks
  console.log('\n🧭 Checking route complexity...');
  const routeDir = './app/dashboard/chat/[chatId]';
  
  if (fs.existsSync(routeDir)) {
    const files = fs.readdirSync(routeDir);
    console.log(`Found ${files.length} files in the slow route.`);
    
    // Check page.tsx file for component imports
    const pageFile = path.join(routeDir, 'page.tsx');
    if (fs.existsSync(pageFile)) {
      const content = fs.readFileSync(pageFile, 'utf8');
      const importLines = content.split('\n').filter(line => line.trim().startsWith('import'));
      
      console.log(`Page has ${importLines.length} import statements.`);
      
      if (importLines.length > 15) {
        console.log('⚠️ High number of imports may be causing slow compilation.');
      }
    }
  }
  
} catch (error) {
  console.error('Error analyzing project structure:', error.message);
}

// Provide optimization recommendations
console.log('\n🚀 Recommendations for improving build performance:');
console.log('1. Use dynamic imports for heavy components:');
console.log('   const HeavyComponent = dynamic(() => import("./HeavyComponent"), { ssr: false });');
console.log('2. Split the ChatContainer into smaller components');
console.log('3. Convert client-side-only components to use React.lazy()');
console.log('4. Add "use client" directive only at component boundaries, not in utility files');
console.log('5. Implement code splitting for different sections of your dashboard');
console.log('\nFor more detailed analysis, run:');
console.log('ANALYZE=true pnpm build');

// Output system info
console.log('\n💻 System information:');
console.log('Node.js version:', process.version);
console.log('Operating system:', process.platform, process.arch);
console.log('Available memory:', Math.round(require('os').totalmem() / (1024 * 1024 * 1024)), 'GB');
console.log('Free memory:', Math.round(require('os').freemem() / (1024 * 1024 * 1024)), 'GB'); 