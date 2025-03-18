# Setting Up IBM's Watsonx.ai Engine (Wxflows)

## Overview

This guide provides step-by-step instructions for setting up and integrating IBM's Watsonx.ai Engine through the Wxflows library in our chatbot application. Wxflows allows us to create and deploy AI tools using a GraphQL interface, providing our users with enhanced AI capabilities.

## Prerequisites

Before starting with the Watsonx.ai setup, ensure you have:

1. An IBM Cloud account with access to Watson services
2. Watsonx.ai API credentials
3. Node.js and npm/pnpm installed
4. The main application code already set up

## Installation

### 1. Install Wxflows SDK

```bash
pnpm add @wxflows/sdk
```

### 2. Set Up Environment Variables

Add the following environment variables to your `.env.local` file:

```env
# IBM Watsonx.ai Credentials
WXFLOWS_API_KEY=your_wxflows_api_key
WXFLOWS_ENDPOINT=your_wxflows_endpoint
WXFLOWS_PROJECT_ID=your_wxflows_project_id
```

## Project Directory Structure

Create and organize the wxflows directory structure:

```
wxflows/
├── wxflows.config.json        # Main configuration file
├── tools.graphql              # GraphQL schema for tools
├── index.graphql              # Root GraphQL schema
├── config.js                  # JavaScript configuration
├── web_search/               # Web search tool
│   └── index.js
├── wikipedia/                # Wikipedia tool
│   └── index.js
├── google_books/             # Google Books tool
│   └── index.js
├── math/                     # Math (WolframAlpha) tool
│   └── index.js
├── exchange/                 # Exchange rates tool
│   └── index.js
└── handlers/                 # Common handlers
    └── index.js
```

## Basic Configuration

### 1. Create Main Configuration File

Create a `wxflows.config.json` file in the wxflows directory:

```json
{
  "endpoint": "api/ill-gas",
  "tools": [
    "web_search",
    "wikipedia",
    "google_books",
    "math",
    "exchange",
    "open_meteo_weather",
    "news"
  ]
}
```

### 2. Set Up Root GraphQL Schema

Create an `index.graphql` file:

```graphql
schema {
  query: Query
}

type Query {
  _dummy: String
}
```

### 3. Create Config File

Create a `config.js` file:

```javascript
// wxflows/config.js
module.exports = {
  apiKey: process.env.WXFLOWS_API_KEY,
  endpoint: process.env.WXFLOWS_ENDPOINT || 'https://api.wxflows.com/v1',
  projectId: process.env.WXFLOWS_PROJECT_ID,
  developerMode: process.env.NODE_ENV === 'development',
  timeout: 30000, // 30 seconds timeout
};
```

## Tool Implementation

### 1. Define Tools Schema

Create a comprehensive `tools.graphql` file:

```graphql
extend type Query {
  web_search(query: String!): WebSearchResult!
  wikipedia(query: String!): WikipediaResult!
  google_books(query: String!): GoogleBooksResult!
  math(input: String!): MathResult!
  exchange(from: String!, to: String!): ExchangeResult!
  open_meteo_weather(location: String!): WeatherResult!
  news(topic: String!): NewsResult!
}

type WebSearchResult {
  results: [WebSearchItem!]!
}

type WebSearchItem {
  title: String!
  url: String!
  snippet: String!
}

type WikipediaResult {
  title: String!
  summary: String!
  url: String!
  image_url: String
}

type GoogleBooksResult {
  books: [Book!]!
}

type Book {
  title: String!
  authors: [String!]!
  description: String
  published_date: String
  publisher: String
  categories: [String!]
  image_links: ImageLinks
  info_link: String!
}

type ImageLinks {
  thumbnail: String
  small: String
}

type MathResult {
  result: String!
  steps: [String!]
  error: String
}

type ExchangeResult {
  rate: Float!
  from: String!
  to: String!
  amount: Float!
  converted: Float!
  last_updated: String!
}

type WeatherResult {
  current: CurrentWeather!
  forecast: [DailyForecast!]!
  location: String!
}

type CurrentWeather {
  temperature: Float!
  feels_like: Float!
  humidity: Int!
  pressure: Int!
  wind_speed: Float!
  wind_direction: String!
  description: String!
  icon: String!
}

type DailyForecast {
  date: String!
  min_temp: Float!
  max_temp: Float!
  description: String!
  icon: String!
}

type NewsResult {
  articles: [NewsArticle!]!
}

type NewsArticle {
  title: String!
  description: String
  url: String!
  source: String!
  published_at: String!
  image_url: String
}
```

### 2. Implement Web Search Tool

Create a web search implementation:

```javascript
// wxflows/web_search/index.js
const axios = require('axios');

async function webSearch(query) {
  try {
    // Using a search API (replace with actual API endpoint)
    const response = await axios.get('https://api.search.service/search', {
      params: {
        q: query,
        limit: 5,
        api_key: process.env.SEARCH_API_KEY
      }
    });

    return {
      results: response.data.results.map(item => ({
        title: item.title,
        url: item.link,
        snippet: item.snippet
      }))
    };
  } catch (error) {
    console.error('Web search error:', error);
    return {
      results: [
        {
          title: 'Error performing search',
          url: '#',
          snippet: 'There was an error processing your search query.'
        }
      ]
    };
  }
}

module.exports = {
  Query: {
    web_search: (_, { query }) => webSearch(query)
  }
};
```

### 3. Implement Math Tool

Create a math/calculation tool:

```javascript
// wxflows/math/index.js
const axios = require('axios');

async function computeMath(input) {
  try {
    // Using WolframAlpha API
    const response = await axios.get('https://api.wolframalpha.com/v2/query', {
      params: {
        input: input,
        format: 'plaintext',
        output: 'JSON',
        appid: process.env.WOLFRAM_APP_ID
      }
    });

    const pods = response.data.queryresult.pods;
    const result = pods.find(pod => pod.id === 'Result');
    const steps = pods
      .filter(pod => pod.id.includes('Step'))
      .map(pod => pod.subpods[0].plaintext);

    return {
      result: result ? result.subpods[0].plaintext : 'No result found',
      steps: steps.length > 0 ? steps : null
    };
  } catch (error) {
    console.error('Math computation error:', error);
    return {
      result: 'Error processing mathematical expression',
      error: error.message
    };
  }
}

module.exports = {
  Query: {
    math: (_, { input }) => computeMath(input)
  }
};
```

## Integration with Main Application

### 1. Create GraphQL Client

Create a utility function to interact with your Wxflows tools:

```typescript
// lib/wxflows-client.ts
import { GraphQLClient } from 'graphql-request';

const wxflowsEndpoint = process.env.WXFLOWS_ENDPOINT || '/api/wxflows';

export const wxflowsClient = new GraphQLClient(wxflowsEndpoint, {
  headers: {
    authorization: `Bearer ${process.env.WXFLOWS_API_KEY}`,
  },
});

export async function executeWebSearch(query: string) {
  const webSearchQuery = `
    query WebSearch($query: String!) {
      web_search(query: $query) {
        results {
          title
          url
          snippet
        }
      }
    }
  `;

  return wxflowsClient.request(webSearchQuery, { query });
}

export async function executeMathQuery(input: string) {
  const mathQuery = `
    query MathQuery($input: String!) {
      math(input: $input) {
        result
        steps
        error
      }
    }
  `;

  return wxflowsClient.request(mathQuery, { input });
}

// Additional tool functions...
```

### 2. Integrate with LangChain

Create a structured integration with LangChain:

```typescript
// lib/tool-schemas.ts
import { z } from "zod";
import { StructuredTool } from "langchain/tools";
import { executeWebSearch, executeMathQuery } from "./wxflows-client";

export class WebSearchTool extends StructuredTool {
  name = "web_search";
  description = "Search the web for real-time information about any topic.";
  schema = z.object({
    query: z.string().describe("The search term to look up on the web")
  });

  async _call({ query }: z.infer<typeof this.schema>) {
    try {
      const result = await executeWebSearch(query);
      return JSON.stringify(result.web_search);
    } catch (error) {
      return `Error performing web search: ${error.message}`;
    }
  }
}

export class MathTool extends StructuredTool {
  name = "math";
  description = "Perform mathematical calculations and solve equations.";
  schema = z.object({
    input: z.string().describe("The math expression to calculate")
  });

  async _call({ input }: z.infer<typeof this.schema>) {
    try {
      const result = await executeMathQuery(input);
      return JSON.stringify(result.math);
    } catch (error) {
      return `Error performing calculation: ${error.message}`;
    }
  }
}

// Additional tool classes...
```

### 3. Create Tools API Route

Create an API route to handle Wxflows requests:

```typescript
// app/api/wxflows/route.ts
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs";
import { wxflowsClient } from "@/lib/wxflows-client";

export async function POST(req: NextRequest) {
  try {
    const { userId } = auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { query, variables } = body;

    const result = await wxflowsClient.request(query, variables || {});
    
    return NextResponse.json(result);
  } catch (error) {
    console.error("Error in wxflows API:", error);
    return NextResponse.json(
      { error: "Error processing wxflows request" },
      { status: 500 }
    );
  }
}
```

## Deployment

### 1. Deploy Wxflows Tools

```bash
# Deploy your tools to Wxflows platform
npx wxflows deploy
```

### 2. Test Deployment

```bash
# Test your deployed tools
npx wxflows test web_search --query "latest AI developments"
```

### 3. Monitor Tool Usage

```bash
# Check deployment status and usage
npx wxflows status
```

## Usage in Chat Flow

Here's how to use the Wxflows tools within your LangChain chat flow:

```typescript
// lib/chat.ts (excerpt)
import { ChatAnthropic } from "@langchain/anthropic";
import { BaseMessage, HumanMessage, SystemMessage } from "@langchain/core/messages";
import { SYSTEM_MESSAGE } from "@/constants/systemMessage";
import { WebSearchTool, MathTool } from "@/lib/tool-schemas";
import { initializeAgentExecutorWithOptions } from "langchain/agents";

export async function submitQuestion(messages: BaseMessage[], chatId: string) {
  try {
    // Initialize tools
    const tools = [
      new WebSearchTool(),
      new MathTool(),
      // Add other tools here
    ];

    // Initialize model
    const model = new ChatAnthropic({
      apiKey: process.env.ANTHROPIC_API_KEY!,
      modelName: "claude-3-opus-20240229",
      temperature: 0.7,
    });

    // Initialize agent executor
    const executor = await initializeAgentExecutorWithOptions(
      tools,
      model,
      {
        agentType: "chat-conversational-react-description",
        verbose: true,
      }
    );

    // Add system message and chat history
    const systemMessage = new SystemMessage(SYSTEM_MESSAGE);
    const chatHistory = [systemMessage, ...messages];

    // Run the agent
    const response = await executor.invoke({
      input: messages[messages.length - 1].content,
      chat_history: chatHistory.slice(0, -1),
    });

    return response;
  } catch (error) {
    console.error("Error in chat:", error);
    throw error;
  }
}
```

## Troubleshooting

### Tool Connection Issues

If your tools fail to connect:

1. Verify API keys in environment variables
2. Check network connectivity to Wxflows endpoints
3. Verify correct GraphQL schema syntax

### Authentication Errors

If you encounter authentication errors:

1. Regenerate your Wxflows API key
2. Verify the API key is correctly set in environment variables
3. Check authorization headers in your requests

### Deployment Failures

If deployment fails:

1. Check for GraphQL schema errors
2. Ensure your Wxflows project has correct permissions
3. Try redeploying with `--force` flag: `npx wxflows deploy --force`

## Next Steps

After setting up the basic Wxflows integration, consider these enhancements:

1. Add more specialized tools for your domain
2. Implement caching for tool results to improve performance
3. Add rate limiting and usage tracking
4. Implement fallback mechanisms for when tools fail
5. Create a tool usage dashboard for analytics 