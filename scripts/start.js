// Load environment variables from .env.local
require('dotenv').config({ path: '.env.local' });

// Import and run the standalone server
require('../.next/standalone/server.js'); 