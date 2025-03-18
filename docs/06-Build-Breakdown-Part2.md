# Build Breakdown (2/2)

## Continuing the Build Process

This document covers the second half of our build process, focusing on UI development, state management, and chat functionality implementation.

## Component Development

### 1. Core UI Components

We utilized Shadcn/ui components for a consistent design system. Key components implemented:

```bash
# Generate shadcn/ui base components
npx shadcn-ui@latest init
npx shadcn-ui@latest add button
npx shadcn-ui@latest add input
npx shadcn-ui@latest add dialog
npx shadcn-ui@latest add dropdown-menu
npx shadcn-ui@latest add avatar
npx shadcn-ui@latest add tooltip
```

### 2. Header Component

The header component provides navigation and user controls:

```typescript
// components/Header.tsx
import { UserButton } from "./UserButton";
import { ModeToggle } from "./ModeToggle";
import Link from "next/link";

export function Header() {
  return (
    <header className="sticky top-0 z-50 flex h-16 w-full shrink-0 items-center justify-between border-b bg-background px-4">
      <div className="flex items-center gap-2">
        <Link href="/" className="flex items-center gap-2">
          <span className="text-xl font-bold">SOS Chatbot</span>
        </Link>
      </div>
      <div className="flex items-center gap-2">
        <ModeToggle />
        <UserButton />
      </div>
    </header>
  );
}
```

### 3. Sidebar Component

Implemented a responsive sidebar for chat navigation:

```typescript
// components/Sidebar.tsx
import { NewChatButton } from "./NewChatButton";
import { ChatList } from "./ChatList";

export function Sidebar() {
  return (
    <div className="flex h-full w-full flex-col overflow-hidden border-r bg-muted/40">
      <div className="p-4">
        <NewChatButton />
      </div>
      <div className="flex-1 overflow-auto">
        <ChatList />
      </div>
    </div>
  );
}
```

### 4. Chat Interface Components

Developed message display and input components:

```typescript
// components/ChatInput.tsx
import { SendIcon } from "lucide-react";
import { Button } from "./ui/button";
import { Textarea } from "./ui/textarea";
import { useState } from "react";

export function ChatInput({ onSend }: { onSend: (message: string) => void }) {
  const [input, setInput] = useState("");
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim()) {
      onSend(input);
      setInput("");
    }
  };
  
  return (
    <form onSubmit={handleSubmit} className="flex items-end gap-2 p-4 border-t">
      <Textarea
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="Type your message..."
        className="flex-1 min-h-[60px] resize-none"
      />
      <Button type="submit" size="icon">
        <SendIcon className="h-5 w-5" />
      </Button>
    </form>
  );
}
```

## State Management Implementation

### 1. React 19 'use' Hook Integration

Utilized React 19's 'use' hook for more efficient state management:

```typescript
// hooks/useChat.ts
import { use, useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { Message } from '@/lib/types';

export function useChat(chatId: string) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  
  const sendMessage = async (content: string) => {
    const userMessage: Message = {
      id: uuidv4(),
      content,
      role: 'user',
      createdAt: new Date()
    };
    
    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);
    
    try {
      // API call to send message and get response
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          chatId,
          message: content,
        }),
      });
      
      const data = await response.json();
      
      const assistantMessage: Message = {
        id: uuidv4(),
        content: data.content,
        role: 'assistant',
        createdAt: new Date()
      };
      
      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  return {
    messages,
    isLoading,
    sendMessage,
  };
}
```

### 2. Server State Management

Implemented Convex for real-time server state:

```typescript
// convex/schema.ts
import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  chats: defineTable({
    title: v.string(),
    userId: v.string(),
    createdAt: v.number(),
    updatedAt: v.number(),
  }),
  messages: defineTable({
    chatId: v.id("chats"),
    content: v.string(),
    role: v.string(),
    createdAt: v.number(),
  }).index("by_chat", ["chatId"]),
});
```

## API Implementation

### 1. Chat API Routes

Created API endpoints for chat interaction:

```typescript
// app/api/chat/route.ts
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs";
import { submitQuestion } from "@/lib/chat";

export async function POST(req: NextRequest) {
  try {
    const { userId } = auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { chatId, message } = body;

    if (!chatId || !message) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const response = await submitQuestion(message, chatId);
    
    return NextResponse.json(response);
  } catch (error) {
    console.error("Error in chat API:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
```

### 2. Convex Actions Implementation

Created Convex mutations for database operations:

```typescript
// convex/chats.ts
import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const createChat = mutation({
  args: {
    title: v.string(),
    userId: v.string(),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    return await ctx.db.insert("chats", {
      title: args.title,
      userId: args.userId,
      createdAt: now,
      updatedAt: now,
    });
  },
});

export const listChats = query({
  args: {
    userId: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("chats")
      .filter((q) => q.eq(q.field("userId"), args.userId))
      .order("desc")
      .collect();
  },
});
```

## AI Integration

### 1. LangChain Implementation

Configured LangChain for message processing:

```typescript
// lib/chat.ts
import { HumanMessage, SystemMessage } from "@langchain/core/messages";
import { ChatAnthropic } from "@langchain/anthropic";
import { StringOutputParser } from "@langchain/core/output_parsers";
import SYSTEM_MESSAGE from "@/constants/systemMessage";

export async function submitQuestion(question: string, chatId: string) {
  try {
    const model = new ChatAnthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
      modelName: "claude-3-opus-20240229",
      temperature: 0.7,
    });

    const messages = [
      new SystemMessage(SYSTEM_MESSAGE),
      new HumanMessage(question),
    ];

    const result = await model.invoke(messages);
    const parser = new StringOutputParser();
    const parsedResult = await parser.parse(result.content);

    return { content: parsedResult };
  } catch (error) {
    console.error("Error in submitQuestion:", error);
    throw error;
  }
}
```

### 2. IBM Watsonx.ai Tools Integration

Set up IBM Watsonx.ai tools for enhanced capabilities:

```typescript
// wxflows/tools.graphql
type Query {
  web_search(query: String!): WebSearchResult!
  wikipedia(query: String!): WikipediaResult!
  google_books(query: String!): GoogleBooksResult!
  math(input: String!): MathResult!
  exchange(from: String!, to: String!): ExchangeResult!
}

type WebSearchResult {
  results: [WebSearchItem!]!
}

type WebSearchItem {
  title: String!
  url: String!
  snippet: String!
}

# Additional tool types...
```

## Page Implementation

### 1. Dashboard Page

Implemented the dashboard page for chat management:

```typescript
// app/dashboard/page.tsx
import { auth } from "@clerk/nextjs";
import { redirect } from "next/navigation";
import { Header } from "@/components/Header";
import { Sidebar } from "@/components/Sidebar";
import { EmptyState } from "@/components/EmptyState";

export default function DashboardPage() {
  const { userId } = auth();
  
  if (!userId) {
    redirect("/sign-in");
  }
  
  return (
    <div className="flex h-screen flex-col">
      <Header />
      <div className="flex flex-1 overflow-hidden">
        <div className="w-64 hidden md:block">
          <Sidebar />
        </div>
        <main className="flex-1 overflow-auto p-4">
          <EmptyState />
        </main>
      </div>
    </div>
  );
}
```

### 2. Chat Page

Developed the chat interface page:

```typescript
// app/chat/[chatId]/page.tsx
import { auth } from "@clerk/nextjs";
import { redirect } from "next/navigation";
import { Header } from "@/components/Header";
import { Sidebar } from "@/components/Sidebar";
import { ChatInterface } from "@/components/ChatInterface";

export default function ChatPage({ params }: { params: { chatId: string } }) {
  const { userId } = auth();
  
  if (!userId) {
    redirect("/sign-in");
  }
  
  return (
    <div className="flex h-screen flex-col">
      <Header />
      <div className="flex flex-1 overflow-hidden">
        <div className="w-64 hidden md:block">
          <Sidebar />
        </div>
        <main className="flex-1 overflow-hidden">
          <ChatInterface chatId={params.chatId} />
        </main>
      </div>
    </div>
  );
}
```

## Testing and Debugging

### 1. Testing Setup

Configured Jest for unit testing:

```typescript
// jest.config.js
const nextJest = require('next/jest');

const createJestConfig = nextJest({
  dir: './',
});

const customJestConfig = {
  moduleDirectories: ['node_modules', '<rootDir>/'],
  testEnvironment: 'jest-environment-jsdom',
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
  },
};

module.exports = createJestConfig(customJestConfig);
```

### 2. Basic Test Implementation

Created unit tests for critical functionality:

```typescript
// lib/chat.test.ts
import { submitQuestion } from './chat';

// Mock environment variables and dependencies
jest.mock('@langchain/anthropic', () => ({
  ChatAnthropic: jest.fn().mockImplementation(() => ({
    invoke: jest.fn().mockResolvedValue({
      content: 'Test response',
    }),
  })),
}));

describe('submitQuestion', () => {
  it('should return parsed content from the model', async () => {
    const result = await submitQuestion('Test question', 'test-chat-id');
    expect(result).toEqual({ content: 'Test response' });
  });
});
```

## Final Polishing

1. **Error Handling Improvements**
   - Added comprehensive error handling throughout the application
   - Implemented error boundaries for graceful failure

2. **Performance Optimizations**
   - Implemented code splitting for faster page loads
   - Added caching strategies for API responses

3. **UI Refinements**
   - Enhanced responsive design for mobile compatibility
   - Improved dark mode consistency

4. **Accessibility Enhancements**
   - Added ARIA labels for screen reader support
   - Ensured keyboard navigation support

## Next Steps

After completing this phase of the build, the next steps include:

1. Implementing streaming functionality for AI responses
2. Setting up IBM's Watsonx.ai Engine with more advanced tools
3. Adding Clerk Passkey functionality for passwordless authentication
4. Enhancing the chat interface with more features
5. Implementing Langgraph for advanced conversational flows 