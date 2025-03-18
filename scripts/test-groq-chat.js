// Test script for Groq API chat functionality with rate limiting
import { config } from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { HumanMessage, SystemMessage } from '@langchain/core/messages';

// Import our custom GroqClient with rate limiting
import GroqClient from '../lib/groq-client.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables from .env.local
config({ path: path.join(__dirname, '..', '.env.local') });

async function testGroqChat() {
  console.log('Testing Groq Chat API with llama3-8b-8192 model and rate limiting...');
  
  // Check if API key is available
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    console.error('Error: GROQ_API_KEY not found in environment variables.');
    console.log('Please set the GROQ_API_KEY in your .env.local file.');
    process.exit(1);
  }
  
  try {
    // Initialize our enhanced Groq client
    const groqClient = new GroqClient({
      modelName: "llama3-8b-8192",
      apiKey: process.env.GROQ_API_KEY,
      temperature: 0.7,
      maxTokens: 1024,
    });
    
    console.log('Creating a chat conversation with system message and user message...');
    
    // Create messages for a chat conversation
    const messages = [
      new SystemMessage("You are a helpful AI assistant that answers questions accurately and concisely."),
      new HumanMessage("What are the top 3 benefits of using LLMs in modern applications?")
    ];
    
    console.log('Sending chat request to Groq API with token rate limiting...');
    
    // Use our enhanced client's chat method
    const response = await groqClient.chat(messages);
    
    console.log('\n✅ Success! Chat response received:');
    console.log('-----------------------------------');
    console.log(response.content);
    console.log('-----------------------------------');
    
    // Test token estimation
    const estimatedTokens = groqClient.estimateTokens(messages);
    console.log(`\nEstimated token usage: ${estimatedTokens}`);
    console.log(`Remaining tokens in current window: ${groqClient.tokenLimiter.getRemainingTokens()}`);
    
    console.log('\nGroq Chat API integration with rate limiting is working correctly! ✅');
    
  } catch (error) {
    console.error('❌ Error testing Groq Chat API:');
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
testGroqChat().catch(err => {
  console.error('Unhandled error:', err);
  process.exit(1);
}); 