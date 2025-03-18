# Token Management for LLM Conversations

This document explains how to use the token management utilities to prevent rate limit errors when working with LLM APIs like Groq.

## The Problem

The Groq API for the `llama3-8b-8192` model has the following rate limits:
- 6000 tokens per minute (TPM)
- Maximum context window of 8192 tokens

When these limits are exceeded, you'll get errors like:

```
413 {"error":{"message":"Request too large for model `llama3-8b-8192` in organization `org_01jn5hjdwgfn78dvnx65brs6tq` service tier `on_demand` on tokens per minute (TPM): Limit 6000, Requested 7950, please reduce your message size and try again."}}
```

## Solution Components

We've created several utilities to help manage token usage:

### 1. TokenRateLimiter (`lib/token-limiter.js`)

Tracks token usage over time and provides methods to:
- Record token usage
- Check if a request would exceed rate limits
- Wait for tokens to become available
- Truncate conversation history to fit within limits

### 2. GroqClient (`lib/groq-client.js`)

A wrapper around the Groq API that:
- Uses TokenRateLimiter to prevent rate limit errors
- Automatically truncates conversations if they're too large
- Retries with reduced token usage if rate limits are hit
- Provides token estimation

### 3. ConversationManager (`lib/conversation-manager.js`)

Manages conversation history and ensures it doesn't exceed token limits by:
- Tracking token usage in conversations
- Automatically summarizing conversations when they get too large
- Preserving important context while reducing token usage

## How to Use

### Basic Usage with GroqClient

```javascript
import GroqClient from './lib/groq-client.js';

// Initialize the client
const groqClient = new GroqClient({
  modelName: "llama3-8b-8192",
  apiKey: process.env.GROQ_API_KEY,
  temperature: 0.7
});

// Use the client to send messages
const messages = [
  { role: 'system', content: 'You are a helpful assistant.' },
  { role: 'user', content: 'Tell me about token management.' }
];

// The client will handle token limits automatically
const response = await groqClient.chat(messages);
console.log(response.content);
```

### Managing Conversations

```javascript
import ConversationManager from './lib/conversation-manager.js';
import GroqClient from './lib/groq-client.js';

// Initialize components
const groqClient = new GroqClient();
const conversationManager = new ConversationManager({
  systemMessage: "You are a helpful AI assistant.",
  maxConversationTokens: 4000
});

// Add messages to the conversation
conversationManager.addUserMessage("Tell me about AI.");
// ...conversation continues...
conversationManager.addAssistantMessage("AI is a field of computer science...");
conversationManager.addUserMessage("Tell me more about machine learning.");

// When you want to get a response, send the current conversation to Groq
const response = await groqClient.chat(conversationManager.getMessages());

// Add the response to the conversation
conversationManager.addAssistantMessage(response.content);

// The conversation manager will automatically summarize when needed
```

## Testing

You can test these utilities with the provided test scripts:

```bash
# Test the GroqClient with token limiting
node scripts/test-groq-chat.js

# Test the complete token management solution
node scripts/test-token-management.js
```

## Implementation Details

### Token Estimation

Token counting is approximated using a character-based heuristic (1 token ≈ 4 characters). For more accurate token counting, you could integrate with a tokenizer library specific to your model.

### Conversation Summarization

When conversations exceed the token threshold, the ConversationManager will:
1. Extract the conversation history
2. Replace it with a system message containing a summary prompt
3. Keep the most recent messages that fit within the limits

### Rate Limiting

The TokenRateLimiter tracks token usage with timestamps, allowing it to:
1. Record usage when requests are made
2. Clear old usage data outside the time window (1 minute)
3. Prevent requests that would exceed the TPM limit

## Modifying for Other LLMs

These utilities can be adapted for other LLM providers by adjusting:
- Token limits in TokenRateLimiter
- Client implementation in a new wrapper class
- Token estimation method for model-specific tokenization

## Best Practices

1. **Set conservative limits**: Set token limits below the actual API limits to allow for estimation errors
2. **Monitor token usage**: Log token usage to understand patterns and optimize
3. **Graceful degradation**: When approaching limits, prioritize recent context
4. **User feedback**: Inform users when conversations are being summarized or truncated
5. **Optimize prompts**: Use concise system prompts to save tokens 