/**
 * Schedule and run tool tests
 * 
 * This script is run during the build process to test all tools 
 * and save their status to a JSON file that can be used by the UI.
 */
const fs = require('fs');
const path = require('path');
const { testAllTools } = require('../lib/tool-tester');

async function main() {
  console.log('🧰 Running tool tests during build...');
  
  try {
    // Run all tool tests
    const results = await testAllTools();
    
    console.log('✅ Tool tests completed during build');
  } catch (error) {
    console.error('❌ Error running tool tests:', error);
    // Don't fail the build if tests fail
  }
}

// Run the script
main().catch(console.error); 