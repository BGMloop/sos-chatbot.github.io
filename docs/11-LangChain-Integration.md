# LangChain Integration

## Overview

This document explains how we integrate LangChain into our chatbot application to power advanced features like chain-of-thought reasoning, tool use, and conversational memory. LangChain provides a robust framework for building LLM-powered applications, allowing us to create more intelligent and useful interactions.

## Prerequisites

Before integrating LangChain, ensure you have:

1. A functioning application with Clerk authentication and Convex database
2. API keys for language models (Claude, OpenAI, etc.)
3. Node.js and npm/pnpm installed
4. The main application code already set up

## Installation

### 1. Install LangChain Dependencies

```bash
pnpm add langchain @langchain/anthropic @langchain/core langchain-anthropic langchain-openai
```

### 2. Set Up Environment Variables

Add these environment variables to your `.env.local` file:

```env
# LLM API Keys
ANTHROPIC_API_KEY=your_anthropic_api_key
OPENAI_API_KEY=your_openai_api_key

# LangChain Configuration
LANGCHAIN_TRACING_V2=true
LANGCHAIN_ENDPOINT=https://api.smith.langchain.com
LANGCHAIN_API_KEY=your_langchain_api_key
LANGCHAIN_PROJECT=your_project_name
```

## Core LangChain Setup

### 1. Setting Up the LLM Client

Create a file called `lib/llm-client.ts` to handle LLM initialization:

```typescript
// lib/llm-client.ts
import { ChatAnthropic } from "@langchain/anthropic";
import { ChatOpenAI } from "@langchain/openai";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { StringOutputParser } from "@langchain/core/output_parsers";
import { RunnableSequence } from "@langchain/core/runnables";

// Create Anthropic model instance (Claude)
export function getAnthropicModel(options: {
  temperature?: number;
  modelName?: string;
} = {}) {
  const {
    temperature = 0.7,
    modelName = "claude-3-opus-20240229",
  } = options;

  return new ChatAnthropic({
    apiKey: process.env.ANTHROPIC_API_KEY!,
    modelName,
    temperature,
  });
}

// Create OpenAI model instance (GPT)
export function getOpenAIModel(options: {
  temperature?: number;
  modelName?: string;
} = {}) {
  const {
    temperature = 0.7,
    modelName = "gpt-4-turbo",
  } = options;

  return new ChatOpenAI({
    apiKey: process.env.OPENAI_API_KEY!,
    modelName,
    temperature,
  });
}

// Create a simple chat chain
export function createChatChain(systemPrompt: string) {
  const model = getAnthropicModel();
  const prompt = ChatPromptTemplate.fromMessages([
    ["system", systemPrompt],
    ["human", "{input}"],
  ]);
  const outputParser = new StringOutputParser();

  return RunnableSequence.from([
    prompt,
    model,
    outputParser,
  ]);
}
```

### 2. Creating the System Message

Create a file for your system message:

```typescript
// constants/systemMessage.ts
export const SYSTEM_MESSAGE = `You are SOS (Student Operated Solutions) Chatbot, a helpful and clever AI assistant designed by students. 
You are knowledgeable, thoughtful, and aim to provide accurate, educational responses.

Here are your core principles:
1. Be helpful, concise, and accurate
2. Provide educational insights rather than mere answers
3. When unsure, acknowledge limitations and avoid speculation
4. Use available tools when needed to provide up-to-date or factual information
5. Maintain a friendly, encouraging tone
6. Explain complex concepts in a clear, accessible way

If users ask about coding or technical topics, provide sample code and explain it clearly.
If you use external tools, explain what tools you're using and why.
`;
```

## Building Conversational Chains

### 1. Basic Chat Implementation

Create a basic chat implementation:

```typescript
// lib/chat.ts
import { BaseMessage, HumanMessage, SystemMessage } from "@langchain/core/messages";
import { ConversationChain } from "langchain/chains";
import { BufferMemory } from "langchain/memory";
import { SYSTEM_MESSAGE } from "@/constants/systemMessage";
import { getAnthropicModel } from "./llm-client";

export async function createChatResponse(
  messages: BaseMessage[],
  chatId: string
) {
  // Initialize the model
  const model = getAnthropicModel({
    temperature: 0.7,
    modelName: "claude-3-opus-20240229",
  });

  // Create memory for this conversation
  const memory = new BufferMemory({
    returnMessages: true,
    memoryKey: "history",
  });

  // Initialize the conversation chain
  const chain = new ConversationChain({
    llm: model,
    memory,
    verbose: process.env.NODE_ENV === "development",
  });

  // Add system message to the beginning
  const systemMessage = new SystemMessage(SYSTEM_MESSAGE);
  
  // Filter out any additional system messages to avoid duplication
  const filteredMessages = messages.filter(msg => msg._getType() !== 'system');
  
  // Combine system message with filtered messages
  const allMessages = [systemMessage, ...filteredMessages];

  // Load message history into memory
  for (let i = 0; i < allMessages.length - 1; i++) {
    if (allMessages[i]._getType() === 'human' && 
        allMessages[i + 1]._getType() === 'ai') {
      await memory.saveContext(
        { input: allMessages[i].content },
        { output: allMessages[i + 1].content }
      );
    }
  }

  // Handle last user message
  const lastMessage = allMessages[allMessages.length - 1];
  if (lastMessage._getType() === 'human') {
    const response = await chain.call({
      input: lastMessage.content,
    });
    
    return response.response;
  }
  
  return "I'm sorry, I didn't receive a valid query to respond to.";
}
```

### 2. Adding Tool Use with ReAct Agent

Expand your chat implementation to use tools:

```typescript
// lib/chat-with-tools.ts
import { SystemMessage, HumanMessage, AIMessage } from "@langchain/core/messages";
import { getAnthropicModel } from "./llm-client";
import { SYSTEM_MESSAGE } from "@/constants/systemMessage";
import { initializeAgentExecutorWithOptions } from "langchain/agents";
import { WebSearchTool, MathTool, WeatherTool } from "./tools";

export async function createChatResponseWithTools(
  messages: Array<SystemMessage | HumanMessage | AIMessage>,
  chatId: string
) {
  try {
    // Initialize tools
    const tools = [
      new WebSearchTool(),
      new MathTool(),
      new WeatherTool(),
    ];

    // Initialize model
    const model = getAnthropicModel();

    // Initialize agent executor
    const executor = await initializeAgentExecutorWithOptions(
      tools,
      model,
      {
        agentType: "chat-conversational-react-description",
        verbose: process.env.NODE_ENV === "development",
        maxIterations: 5,
      }
    );

    // Add system message and chat history
    const systemMessage = new SystemMessage(SYSTEM_MESSAGE);
    const chatHistory = [systemMessage, ...messages.slice(0, -1)];
    const lastMessage = messages[messages.length - 1];

    // Run the agent
    const response = await executor.invoke({
      input: lastMessage.content,
      chat_history: chatHistory,
    });

    return response.output;
  } catch (error) {
    console.error("Error in chat with tools:", error);
    return "I encountered an error while processing your request. Please try again.";
  }
}
```

### 3. Custom Tool Implementations

Create a file for custom tools:

```typescript
// lib/tools.ts
import { z } from "zod";
import { StructuredTool } from "langchain/tools";
import { executeWebSearch, fetchWeather, solveCalculation } from "./tool-utilities";

export class WebSearchTool extends StructuredTool {
  name = "web_search";
  description = "Search the web for real-time information about any topic.";
  schema = z.object({
    query: z.string().describe("The search term to look up on the web"),
  });

  async _call({ query }: z.infer<typeof this.schema>) {
    try {
      const results = await executeWebSearch(query);
      return JSON.stringify(results);
    } catch (error) {
      return `Error performing web search: ${error.message}`;
    }
  }
}

export class MathTool extends StructuredTool {
  name = "calculator";
  description = "Perform mathematical calculations and solve equations.";
  schema = z.object({
    expression: z.string().describe("The math expression to calculate"),
  });

  async _call({ expression }: z.infer<typeof this.schema>) {
    try {
      const result = await solveCalculation(expression);
      return JSON.stringify(result);
    } catch (error) {
      return `Error performing calculation: ${error.message}`;
    }
  }
}

export class WeatherTool extends StructuredTool {
  name = "weather";
  description = "Get current weather information for a location.";
  schema = z.object({
    location: z.string().describe("The location to get weather for"),
  });

  async _call({ location }: z.infer<typeof this.schema>) {
    try {
      const weather = await fetchWeather(location);
      return JSON.stringify(weather);
    } catch (error) {
      return `Error fetching weather: ${error.message}`;
    }
  }
}
```

## Tool Utilities Implementation

Create utility functions to implement the tool functionality:

```typescript
// lib/tool-utilities.ts
import axios from 'axios';

// Function to execute web searches
export async function executeWebSearch(query: string) {
  try {
    // This would be replaced with your actual search API implementation
    const response = await axios.get('https://api.search.service/search', {
      params: {
        q: query,
        limit: 5,
      },
      headers: {
        'X-API-Key': process.env.SEARCH_API_KEY,
      },
    });
    
    return response.data.results;
  } catch (error) {
    console.error('Web search error:', error);
    throw new Error('Failed to perform web search');
  }
}

// Function to solve mathematical calculations
export async function solveCalculation(expression: string) {
  try {
    // Basic implementation - would be replaced with a more robust solution
    // eslint-disable-next-line no-eval
    const result = eval(expression);
    
    return {
      expression,
      result,
    };
  } catch (error) {
    console.error('Calculation error:', error);
    throw new Error('Failed to solve the calculation');
  }
}

// Function to fetch weather data
export async function fetchWeather(location: string) {
  try {
    // This would be replaced with your actual weather API implementation
    const response = await axios.get('https://api.weather.service/current', {
      params: {
        location,
      },
      headers: {
        'X-API-Key': process.env.WEATHER_API_KEY,
      },
    });
    
    return response.data;
  } catch (error) {
    console.error('Weather fetch error:', error);
    throw new Error('Failed to fetch weather data');
  }
}
```

## Integrating with API Routes

Create an API route for the chat interface:

```typescript
// app/api/chat/route.ts
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs";
import { HumanMessage, AIMessage } from "@langchain/core/messages";
import { createChatResponseWithTools } from "@/lib/chat-with-tools";
import { ConvexHttpClient } from "convex/browser";

// Initialize Convex client for server operations
const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL as string);

export async function POST(req: NextRequest) {
  try {
    // Check authentication
    const { userId } = auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Parse request body
    const body = await req.json();
    const { chatId, messages } = body;

    if (!chatId || !messages || !Array.isArray(messages)) {
      return NextResponse.json(
        { error: "Invalid request format" },
        { status: 400 }
      );
    }

    // Convert message format for LangChain
    const formattedMessages = messages.map((msg) => {
      if (msg.role === "user") {
        return new HumanMessage(msg.content);
      } else if (msg.role === "assistant") {
        return new AIMessage(msg.content);
      }
      return null;
    }).filter(Boolean);

    // Get response from LangChain
    const response = await createChatResponseWithTools(formattedMessages, chatId);

    // Save the message to the database
    await convex.mutation("messages.add", {
      chatId,
      content: response,
      role: "assistant",
    });

    return NextResponse.json({ content: response });
  } catch (error) {
    console.error("Error in chat API:", error);
    return NextResponse.json(
      { error: "Error processing request" },
      { status: 500 }
    );
  }
}
```

## Creating the Chat UI Components

### 1. Chat Interface Component

```typescript
// components/ChatInterface.tsx
import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { MessageList } from "./MessageList";
import { ChatInput } from "./ChatInput";
import { LoadingSpinner } from "./ui/spinner";
import { Message } from "@/lib/types";

interface ChatInterfaceProps {
  chatId: string;
}

export function ChatInterface({ chatId }: ChatInterfaceProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const convexMessages = useQuery(api.messages.list, { chatId });
  const addMessage = useMutation(api.messages.add);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [convexMessages]);

  const handleSendMessage = async (content: string) => {
    if (!content.trim() || isProcessing) return;

    // Optimistically add the user message to the UI
    const userMessageId = await addMessage({
      chatId,
      content,
      role: "user",
    });

    setIsProcessing(true);

    try {
      // Prepare messages for the API
      const messages = convexMessages?.map(msg => ({
        role: msg.role,
        content: msg.content,
      })) || [];

      // Add the new message
      messages.push({
        role: "user",
        content,
      });

      // Call the API
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          chatId,
          messages,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to get response");
      }

      // Response is handled by the API and saved to the database
      // We don't need to do anything here as the UI will update automatically
    } catch (error) {
      console.error("Error sending message:", error);
      // Add error message
      await addMessage({
        chatId,
        content: "Sorry, there was an error processing your request.",
        role: "assistant",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  if (convexMessages === undefined) {
    return (
      <div className="flex h-full items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto p-4">
        <MessageList messages={convexMessages} />
        <div ref={messagesEndRef} />
      </div>
      <div className="border-t p-4">
        <ChatInput
          onSend={handleSendMessage}
          isDisabled={isProcessing}
        />
        {isProcessing && (
          <div className="flex items-center justify-center py-2">
            <span className="text-sm text-gray-500 animate-pulse">
              AI is thinking...
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
```

### 2. Message Display Components

```typescript
// components/MessageList.tsx
import { Message as MessageType } from "@/lib/types";
import { Message } from "./Message";

interface MessageListProps {
  messages: MessageType[];
}

export function MessageList({ messages }: MessageListProps) {
  if (messages.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center p-4">
        <p className="text-gray-500">
          No messages yet. Start the conversation!
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {messages.map((message) => (
        <Message key={message._id} message={message} />
      ))}
    </div>
  );
}
```

```typescript
// components/Message.tsx
import { Message as MessageType } from "@/lib/types";
import { Avatar } from "./ui/avatar";
import { cn } from "@/lib/utils";
import { UserCircle, Bot } from "lucide-react";
import Markdown from "react-markdown";

interface MessageProps {
  message: MessageType;
}

export function Message({ message }: MessageProps) {
  const isUser = message.role === "user";

  return (
    <div
      className={cn(
        "flex items-start gap-3 p-4 rounded-lg",
        isUser ? "bg-primary/10" : "bg-muted"
      )}
    >
      <Avatar className="h-8 w-8">
        {isUser ? (
          <UserCircle className="h-8 w-8 text-primary" />
        ) : (
          <Bot className="h-8 w-8 text-primary" />
        )}
      </Avatar>
      <div className="flex-1 overflow-hidden">
        <div className="font-semibold mb-1">
          {isUser ? "You" : "SOS Chatbot"}
        </div>
        <div className="prose prose-sm max-w-none dark:prose-invert">
          <Markdown>{message.content}</Markdown>
        </div>
      </div>
    </div>
  );
}
```

## Setting Up Chat Types

Create a types file for your chat application:

```typescript
// lib/types.ts
import { Id } from "@/convex/_generated/dataModel";

export interface Message {
  _id: Id<"messages">;
  _creationTime: number;
  chatId: Id<"chats">;
  content: string;
  role: "user" | "assistant" | "system";
  createdAt: number;
}

export interface Chat {
  _id: Id<"chats">;
  _creationTime: number;
  title: string;
  userId: string;
  createdAt: number;
  updatedAt: number;
}
```

## Testing LangChain Integration

### 1. Manual Testing

Test the chat integration manually:

1. Open your application's chat interface
2. Send a test message
3. Verify that the AI responds correctly
4. Test tool usage with specific queries:
   - Search query: "What's the latest news about AI?"
   - Math query: "Calculate 485 * 32.5"
   - Weather query: "What's the weather in New York?"

### 2. Unit Testing

Create tests for your LangChain integration:

```typescript
// lib/chat.test.ts
import { createChatResponse } from './chat';
import { HumanMessage } from '@langchain/core/messages';

// Mock dependencies
jest.mock('@langchain/anthropic', () => ({
  ChatAnthropic: jest.fn().mockImplementation(() => ({
    invoke: jest.fn().mockResolvedValue({
      content: 'Test response',
    }),
  })),
}));

describe('Chat Functions', () => {
  it('should return a response for a valid message', async () => {
    const result = await createChatResponse(
      [new HumanMessage('Hello, how are you?')],
      'test-chat-id'
    );
    
    expect(typeof result).toBe('string');
    expect(result.length).toBeGreaterThan(0);
  });
});
```

## Performance Optimization

### 1. Caching Responses

Implement caching for repeated queries:

```typescript
// lib/cache.ts
import { Redis } from '@upstash/redis';

// Initialize Redis client
const redis = new Redis({
  url: process.env.UPSTASH_REDIS_URL as string,
  token: process.env.UPSTASH_REDIS_TOKEN as string,
});

// Function to get cached response
export async function getCachedResponse(
  chatId: string,
  messages: string
): Promise<string | null> {
  const cacheKey = `chat:${chatId}:${hashMessages(messages)}`;
  return redis.get(cacheKey);
}

// Function to cache response
export async function cacheResponse(
  chatId: string,
  messages: string,
  response: string,
  expirationInSeconds: number = 3600
): Promise<void> {
  const cacheKey = `chat:${chatId}:${hashMessages(messages)}`;
  await redis.set(cacheKey, response, { ex: expirationInSeconds });
}

// Helper to create a hash of the messages
function hashMessages(messages: string): string {
  return Buffer.from(messages).toString('base64');
}
```

### 2. Streaming Responses

Implement streaming for a better user experience:

```typescript
// app/api/chat-stream/route.ts
import { StreamingTextResponse, LangChainStream } from 'ai';
import { auth } from "@clerk/nextjs";
import { getAnthropicModel } from "@/lib/llm-client";
import { HumanMessage, SystemMessage } from '@langchain/core/messages';
import { SYSTEM_MESSAGE } from "@/constants/systemMessage";

export async function POST(req: Request) {
  // Check authentication
  const { userId } = auth();
  if (!userId) {
    return new Response('Unauthorized', { status: 401 });
  }

  // Parse request
  const { messages } = await req.json();

  // Create a stream
  const { stream, handlers } = LangChainStream();

  // Get the model
  const model = getAnthropicModel();

  // Process in the background
  const systemMessage = new SystemMessage(SYSTEM_MESSAGE);
  const userMessages = messages.map((m: any) => {
    if (m.role === 'user') {
      return new HumanMessage(m.content);
    }
    return null;
  }).filter(Boolean);

  // Start the streaming process
  model.invoke([systemMessage, ...userMessages], {
    callbacks: [handlers],
  });

  // Return the stream response
  return new StreamingTextResponse(stream);
}
```

## Debugging and Monitoring

### 1. Setting Up LangSmith Tracing

Configure LangSmith for monitoring:

```typescript
// lib/langsmith.ts
import { Client } from "langsmith";

// Initialize LangSmith client
export const langSmith = new Client({
  apiKey: process.env.LANGCHAIN_API_KEY,
  projectName: process.env.LANGCHAIN_PROJECT,
});

// Function to log an error to LangSmith
export async function logError(
  error: Error,
  context: Record<string, any>
): Promise<void> {
  await langSmith.createRun({
    name: "Error",
    inputs: context,
    error: error.message,
    outputs: {},
    start_time: new Date().toISOString(),
    end_time: new Date().toISOString(),
  });
}
```

### 2. Logging and Error Tracking

Implement comprehensive error tracking:

```typescript
// lib/logger.ts
import pino from 'pino';
import { logError } from './langsmith';

// Create a logger instance
const logger = pino({
  level: process.env.LOG_LEVEL || 'info',
});

// Extended error logging function
export async function logChatError(
  error: Error,
  chatId: string,
  userId: string,
  messages: any[]
): Promise<void> {
  // Log to console/file
  logger.error({
    error: error.message,
    stack: error.stack,
    chatId,
    userId,
    messageCount: messages.length,
  });
  
  // Log to LangSmith
  await logError(error, {
    chatId,
    userId,
    messageCount: messages.length,
    lastMessage: messages.length > 0 ? messages[messages.length - 1] : null,
  });
}
```

## Advanced Features

### 1. Structured Output with Function Calling

Implement function calling for structured outputs:

```typescript
// lib/function-calling.ts
import { ChatAnthropic } from "@langchain/anthropic";
import { HumanMessage, SystemMessage } from "@langchain/core/messages";
import { SYSTEM_MESSAGE } from "@/constants/systemMessage";
import { z } from "zod";

// Define the structured output schema
const weatherQuerySchema = z.object({
  location: z.string().describe("The location to get weather for"),
  date: z.string().optional().describe("The date to get weather for, defaults to today"),
  includeForecasts: z.boolean().optional().describe("Whether to include forecasts"),
});

// Function to parse weather queries
export async function parseWeatherQuery(query: string) {
  const model = new ChatAnthropic({
    apiKey: process.env.ANTHROPIC_API_KEY!,
    modelName: "claude-3-opus-20240229"
  });
  
  const systemMsg = `${SYSTEM_MESSAGE}
  
You are tasked with extracting structured information from user queries about weather.
Extract the following information:
- location: The location the user is asking about
- date: The date they're asking about (today, tomorrow, etc.)
- includeForecasts: Whether they want multi-day forecasts

Output the information as a valid JSON object with these fields.`;

  const response = await model.invoke([
    new SystemMessage(systemMsg),
    new HumanMessage(query)
  ]);
  
  try {
    // Extract JSON from the response
    const jsonMatch = response.content.toString().match(/```json\n([\s\S]*?)\n```/);
    const jsonStr = jsonMatch ? jsonMatch[1] : response.content.toString();
    const parsed = JSON.parse(jsonStr);
    
    // Validate with zod schema
    return weatherQuerySchema.parse(parsed);
  } catch (error) {
    console.error("Error parsing structured output:", error);
    // Fallback to basic extraction
    return {
      location: query.includes("in ") ? query.split("in ")[1].split(" ")[0] : "unknown",
      includeForecasts: query.includes("forecast")
    };
  }
}
```

### 2. Chaining Multiple Agents

Implement a multi-agent workflow:

```typescript
// lib/multi-agent-workflow.ts
import { createChatResponseWithTools } from "./chat-with-tools";
import { getAnthropicModel } from "./llm-client";
import { HumanMessage, SystemMessage } from "@langchain/core/messages";

// Define specialized agent roles
const RESEARCH_AGENT_PROMPT = `You are a research specialist. Your job is to gather comprehensive information on topics from reliable sources. Provide detailed, factual information with sources when possible.`;

const SUMMARIZATION_AGENT_PROMPT = `You are a summarization specialist. Your job is to take detailed information and create clear, concise summaries that capture the most important points.`;

// Multi-agent workflow function
export async function researchAndSummarize(query: string) {
  // Step 1: Research agent gathers information
  const researchModel = getAnthropicModel();
  const researchResponse = await researchModel.invoke([
    new SystemMessage(RESEARCH_AGENT_PROMPT),
    new HumanMessage(query)
  ]);
  
  // Step 2: Summarization agent processes the research
  const summarizationModel = getAnthropicModel({ temperature: 0.3 });
  const summarizationResponse = await summarizationModel.invoke([
    new SystemMessage(SUMMARIZATION_AGENT_PROMPT),
    new HumanMessage(`Summarize the following research information in a concise, easy-to-understand way:
    
${researchResponse.content}`)
  ]);
  
  return {
    research: researchResponse.content.toString(),
    summary: summarizationResponse.content.toString()
  };
}
```

## Conclusion

This LangChain integration provides a robust foundation for your AI chatbot, enabling:

1. Advanced conversation capabilities with memory and context
2. Tool use for accessing external data and performing actions
3. Structured output for programmatic interaction
4. Multi-agent workflows for complex tasks
5. Comprehensive monitoring and error tracking

Next steps to enhance your LangChain integration:

1. Add more specialized tools for your domain
2. Implement fine-tuning for improved performance
3. Create domain-specific agents for different use cases
4. Add retrieval-augmented generation (RAG) for knowledge base access
5. Implement stream processing for all responses 