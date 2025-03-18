// Test script for Groq API integration
import { config } from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { ChatGroq } from '@langchain/groq';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables from .env.local
config({ path: path.join(__dirname, '..', '.env.local') });

async function testGroqApi() {
  console.log('Testing Groq API with llama3-8b-8192 model...');
  
  // Check if API key is available
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    console.error('Error: GROQ_API_KEY not found in environment variables.');
    console.log('Please set the GROQ_API_KEY in your .env.local file.');
    process.exit(1);
  }
  
  try {
    // Initialize Groq client with LangChain
    const groqModel = new ChatGroq({
      modelName: "llama3-8b-8192",
      apiKey: process.env.GROQ_API_KEY,
      temperature: 0.7,
      maxTokens: 1024,
    });
    
    console.log('Sending test request to Groq API...');
    
    // Use LangChain's invoke method
    const response = await groqModel.invoke([
      {
        role: 'user',
        content: 'Explain the importance of fast language models in 2-3 sentences.'
      }
    ]);
    
    console.log('\n✅ Success! Response received:');
    console.log('-----------------------------------');
    console.log(response.content);
    console.log('-----------------------------------');
    
    console.log('\nGroq API integration is working correctly! ✅');
    
  } catch (error) {
    console.error('❌ Error testing Groq API:');
    console.error(error.message);
    
    // More detailed error information
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
    
    process.exit(1);
  }
}

// Run the test
testGroqApi().catch(err => {
  console.error('Unhandled error:', err);
  process.exit(1);
}); 