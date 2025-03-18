# Setting Up Convex

## Overview

This document outlines the process of setting up Convex as the backend database for our chatbot application. Convex is a backend platform that provides a real-time database with built-in sync capabilities, making it ideal for collaborative and real-time applications like our chatbot.

## Prerequisites

Before setting up Convex, ensure you have:

1. Node.js and npm/pnpm installed
2. A Convex account created at [convex.dev](https://www.convex.dev/)
3. The main application codebase already set up

## Installation

### 1. Install Convex Dependencies

```bash
pnpm add convex
```

### 2. Set Up Environment Variables

Add the following environment variables to your `.env.local` file:

```env
# Convex credentials
CONVEX_DEPLOYMENT=your_convex_deployment_id
NEXT_PUBLIC_CONVEX_URL=your_convex_public_url
```

## Initializing Convex

### 1. Create Convex Project

You can create a new Convex project through the Convex dashboard or using the CLI:

```bash
npx convex init
```

This command will:
- Create a new Convex project
- Generate the necessary configuration files
- Provide you with the deployment URL

### 2. Configure Convex in the Application

Create a `convex/_generated` directory (this will be populated by the Convex CLI).

Create a `convex/convex.json` file with the following content:

```json
{
  "functions": {
    "path": "./functions"
  },
  "authInfo": {
    "provider": "clerk",
    "domain": "https://clerk.your-domain.com"
  }
}
```

## Create Client Provider

Create a `lib/convex.ts` file to set up the Convex client provider:

```typescript
// lib/convex.ts
import { ConvexProvider, ConvexReactClient } from "convex/react";

// Create a client instance
const convex = new ConvexReactClient(process.env.NEXT_PUBLIC_CONVEX_URL as string);

export function ConvexClientProvider({ children }: { children: React.ReactNode }) {
  return <ConvexProvider client={convex}>{children}</ConvexProvider>;
}
```

Update your `app/layout.tsx` file to include the Convex provider:

```typescript
// app/layout.tsx
import { ClerkProvider } from '@clerk/nextjs';
import { ConvexClientProvider } from '@/lib/convex';
import './globals.css';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider>
      <ConvexClientProvider>
        <html lang="en">
          <body>{children}</body>
        </html>
      </ConvexClientProvider>
    </ClerkProvider>
  );
}
```

## Setting Up Data Schema

### 1. Define Database Schema

Create a `convex/schema.ts` file to define your database schema:

```typescript
// convex/schema.ts
import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  // Chats table for storing chat sessions
  chats: defineTable({
    title: v.string(),
    userId: v.string(),
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index("by_user", ["userId"]),

  // Messages table for storing individual messages
  messages: defineTable({
    chatId: v.id("chats"),
    content: v.string(),
    role: v.union(v.literal("user"), v.literal("assistant"), v.literal("system")),
    createdAt: v.number(),
  }).index("by_chat", ["chatId"])
});
```

### 2. Create Database Access Functions

Create files for CRUD operations on your database:

```typescript
// convex/chats.ts
import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// Create a new chat
export const create = mutation({
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

// Get all chats for a user
export const list = query({
  args: {
    userId: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("chats")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .order("desc")
      .collect();
  },
});

// Get a specific chat by ID
export const get = query({
  args: {
    id: v.id("chats"),
  },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

// Update a chat's title
export const update = mutation({
  args: {
    id: v.id("chats"),
    title: v.string(),
  },
  handler: async (ctx, args) => {
    const { id, title } = args;
    const now = Date.now();
    
    // Check if chat exists
    const chat = await ctx.db.get(id);
    if (!chat) {
      throw new Error(`Chat ${id} not found`);
    }
    
    await ctx.db.patch(id, {
      title,
      updatedAt: now,
    });
    
    return id;
  },
});

// Delete a chat
export const remove = mutation({
  args: {
    id: v.id("chats"),
  },
  handler: async (ctx, args) => {
    const { id } = args;
    
    // Delete all messages in the chat
    const messages = await ctx.db
      .query("messages")
      .withIndex("by_chat", (q) => q.eq("chatId", id))
      .collect();
    
    for (const message of messages) {
      await ctx.db.delete(message._id);
    }
    
    // Delete the chat
    await ctx.db.delete(id);
    
    return id;
  },
});
```

```typescript
// convex/messages.ts
import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// Add a message to a chat
export const add = mutation({
  args: {
    chatId: v.id("chats"),
    content: v.string(),
    role: v.union(v.literal("user"), v.literal("assistant"), v.literal("system")),
  },
  handler: async (ctx, args) => {
    const { chatId, content, role } = args;
    
    // Check if chat exists
    const chat = await ctx.db.get(chatId);
    if (!chat) {
      throw new Error(`Chat ${chatId} not found`);
    }
    
    const now = Date.now();
    
    // Add message
    const messageId = await ctx.db.insert("messages", {
      chatId,
      content,
      role,
      createdAt: now,
    });
    
    // Update chat's updatedAt timestamp
    await ctx.db.patch(chatId, {
      updatedAt: now,
    });
    
    return messageId;
  },
});

// Get all messages for a chat
export const list = query({
  args: {
    chatId: v.id("chats"),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("messages")
      .withIndex("by_chat", (q) => q.eq("chatId", args.chatId))
      .order("asc")
      .collect();
  },
});
```

## Authentication Integration

### 1. Integrate Clerk with Convex

Create a file to handle authentication integration:

```typescript
// convex/auth.ts
import { ConvexError, v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Verify the user is authenticated and get their ID
export const getUserId = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new ConvexError("User not authenticated");
    }
    return identity.subject;
  },
});

// Higher-order function to create authorized queries
export function withAuth(queryFn) {
  return query({
    args: { ...queryFn.args },
    handler: async (ctx, args) => {
      const identity = await ctx.auth.getUserIdentity();
      if (!identity) {
        throw new ConvexError("User not authenticated");
      }
      
      const userId = identity.subject;
      return queryFn.handler(ctx, { ...args, userId });
    },
  });
}

// Higher-order function to create authorized mutations
export function withAuthMutation(mutationFn) {
  return mutation({
    args: { ...mutationFn.args },
    handler: async (ctx, args) => {
      const identity = await ctx.auth.getUserIdentity();
      if (!identity) {
        throw new ConvexError("User not authenticated");
      }
      
      const userId = identity.subject;
      return mutationFn.handler(ctx, { ...args, userId });
    },
  });
}
```

### 2. Update CRUD Operations to Use Authentication

Update the chat-related functions to use authentication:

```typescript
// convex/chats.ts (updated with authentication)
import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { withAuth, withAuthMutation } from "./auth";

// Create a new chat
export const create = withAuthMutation({
  args: {
    title: v.string(),
  },
  handler: async (ctx, args) => {
    const { title, userId } = args;
    const now = Date.now();
    
    return await ctx.db.insert("chats", {
      title,
      userId,
      createdAt: now,
      updatedAt: now,
    });
  },
});

// Get all chats for the authenticated user
export const list = withAuth({
  args: {},
  handler: async (ctx, args) => {
    const { userId } = args;
    
    return await ctx.db
      .query("chats")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .order("desc")
      .collect();
  },
});

// ... other functions updated similarly
```

## Using Convex in Components

### 1. Basic Usage in React Components

```typescript
// components/ChatList.tsx
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Spinner } from "./ui/spinner";
import { ChatItem } from "./ChatItem";

export function ChatList() {
  const chats = useQuery(api.chats.list);

  if (chats === undefined) {
    return <Spinner />;
  }

  if (chats.length === 0) {
    return <div className="text-center text-gray-500">No chats yet</div>;
  }

  return (
    <div className="space-y-2">
      {chats.map((chat) => (
        <ChatItem key={chat._id} chat={chat} />
      ))}
    </div>
  );
}
```

### 2. Data Mutation in React Components

```typescript
// components/NewChatButton.tsx
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Button } from "./ui/button";
import { PlusIcon } from "lucide-react";
import { useRouter } from "next/navigation";

export function NewChatButton() {
  const createChat = useMutation(api.chats.create);
  const router = useRouter();

  const handleCreateChat = async () => {
    const chatId = await createChat({
      title: "New Chat",
    });
    
    router.push(`/chat/${chatId}`);
  };

  return (
    <Button 
      onClick={handleCreateChat}
      className="w-full flex gap-2 items-center"
    >
      <PlusIcon size={16} />
      New Chat
    </Button>
  );
}
```

### 3. Using Subscriptions for Real-Time Updates

```typescript
// components/MessageList.tsx
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Message } from "@/lib/types";
import { MessageItem } from "./MessageItem";
import { Spinner } from "./ui/spinner";

interface MessageListProps {
  chatId: string;
}

export function MessageList({ chatId }: MessageListProps) {
  const messages = useQuery(api.messages.list, { chatId });

  if (messages === undefined) {
    return (
      <div className="flex justify-center p-4">
        <Spinner />
      </div>
    );
  }

  if (messages.length === 0) {
    return (
      <div className="text-center text-gray-500 p-4">
        No messages yet. Start the conversation!
      </div>
    );
  }

  return (
    <div className="space-y-4 p-4">
      {messages.map((message) => (
        <MessageItem key={message._id} message={message} />
      ))}
    </div>
  );
}
```

## Deployment and Management

### 1. Deploy to Convex Cloud

When you're ready to deploy your application to production:

```bash
npx convex deploy
```

This command:
- Validates your schema
- Deploys your functions to the Convex cloud
- Updates your generated TypeScript to reflect any changes

### 2. Convex Dashboard

The Convex dashboard provides several useful features:
- Data browser for viewing and editing records
- Logs for monitoring function execution
- Usage metrics
- Schema editor

Visit your project in the [Convex Dashboard](https://dashboard.convex.dev) to access these features.

## Optimizing Performance

### 1. Pagination

For lists that might get large, implement pagination:

```typescript
// convex/chats.ts (with pagination)
export const listPaginated = query({
  args: {
    userId: v.string(),
    limit: v.optional(v.number()),
    cursor: v.optional(v.id("chats")),
  },
  handler: async (ctx, args) => {
    const { userId, cursor, limit = 10 } = args;
    
    let query = ctx.db
      .query("chats")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .order("desc");
      
    if (cursor) {
      query = query.cursor(cursor);
    }
    
    const page = await query.take(limit);
    const nextCursor = page.length === limit ? page[page.length - 1]._id : null;
    
    return {
      chats: page,
      nextCursor,
    };
  },
});
```

### 2. Indexes

Create appropriate indexes for common query patterns:

```typescript
// convex/schema.ts (with additional indexes)
export default defineSchema({
  chats: defineTable({
    title: v.string(),
    userId: v.string(),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_user_updated", ["userId", "updatedAt"]),
    
  // ...
});
```

## Debugging and Troubleshooting

### Common Issues

1. **Authentication Issues**

If you're having trouble with authentication:
- Make sure Clerk is properly set up with Convex
- Check that you're using the auth context correctly in your functions
- Verify that clerk domain in `convex.json` matches your Clerk application

2. **Database Query Issues**

If your queries aren't returning expected results:
- Use `console.log` in your functions to debug (logs appear in the Convex dashboard)
- Verify your indexes are set up correctly
- Check that your filter conditions match your data

3. **Deployment Issues**

If deployment fails:
- Check for schema validation errors
- Verify your TypeScript types are correct
- Look for syntax errors in your functions

## Best Practices

1. **Keep Functions Small and Focused**

Each Convex function should do one thing well. Split complex operations into multiple functions.

2. **Use Transactions for Multi-Step Operations**

For operations that need to modify multiple documents atomically:

```typescript
export const moveMessage = mutation({
  args: {
    messageId: v.id("messages"),
    newChatId: v.id("chats"),
  },
  handler: async (ctx, args) => {
    const { messageId, newChatId } = args;
    
    // Fetch the message
    const message = await ctx.db.get(messageId);
    if (!message) {
      throw new Error("Message not found");
    }
    
    // Verify the new chat exists
    const newChat = await ctx.db.get(newChatId);
    if (!newChat) {
      throw new Error("New chat not found");
    }
    
    // Update the message within a transaction
    await ctx.db.patch(messageId, {
      chatId: newChatId,
    });
    
    // Update both chats' updatedAt timestamps
    const now = Date.now();
    await ctx.db.patch(message.chatId, { updatedAt: now });
    await ctx.db.patch(newChatId, { updatedAt: now });
    
    return messageId;
  },
});
```

3. **Add Validation Logic**

Always validate input data in your functions:

```typescript
export const create = mutation({
  args: {
    title: v.string(),
    userId: v.string(),
  },
  handler: async (ctx, args) => {
    const { title, userId } = args;
    
    // Validate title
    if (title.trim().length === 0) {
      throw new Error("Title cannot be empty");
    }
    if (title.length > 100) {
      throw new Error("Title is too long (max 100 characters)");
    }
    
    // Create the chat
    const now = Date.now();
    return await ctx.db.insert("chats", {
      title,
      userId,
      createdAt: now,
      updatedAt: now,
    });
  },
});
```

## Next Steps

After setting up Convex as your database, you can explore:

1. **Advanced Queries**: Implement more complex queries like search or aggregation
2. **Scheduled Functions**: Set up background jobs using Convex scheduled functions
3. **Data Migration**: Create scripts for migrating data between environments
4. **Backup and Recovery**: Implement regular backups of your Convex data
5. **Monitoring**: Set up alerts for critical operations or errors

The completed Convex setup provides a robust, real-time database for your chatbot application, with secure authentication integration and efficient data access patterns. 