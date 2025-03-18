# Implementing Clerk & Convex Together

## Overview

This document details how to effectively integrate Clerk (authentication) and Convex (database) to create a secure, real-time application. By combining these two powerful services, we can build a robust authentication system with user-specific data access patterns.

## Architecture

The integration between Clerk and Convex follows this architecture:

1. **Clerk** handles user authentication, session management, and user profiles
2. **Convex** stores application data and enforces access control based on user identity
3. **Integration Layer** passes authenticated user information from Clerk to Convex

## Prerequisites

Before starting the integration, ensure you have:

1. Clerk authentication set up as described in the [Setting Up Clerk for Authentication](./04-Setting-Up-Clerk-Authentication.md) document
2. Convex database set up as described in the [Setting Up Convex](./09-Setting-Up-Convex.md) document

## Integration Process

### 1. Configure Clerk JWT Template

First, configure Clerk to include the necessary claims in its JWTs:

1. Go to the [Clerk Dashboard](https://dashboard.clerk.dev/)
2. Navigate to **JWT Templates**
3. Create a new template for Convex or edit the default template
4. Ensure the template includes the following claims:

```json
{
  "userId": "{{user.id}}",
  "email": "{{user.primary_email_address}}",
  "firstName": "{{user.first_name}}",
  "lastName": "{{user.last_name}}"
}
```

### 2. Configure Convex to Use Clerk JWTs

Update the Convex configuration to use Clerk as the authentication provider:

```json
// convex/convex.json
{
  "functions": {
    "path": "./functions"
  },
  "authInfo": {
    "provider": "clerk",
    "domain": "https://your-clerk-domain.clerk.accounts.dev"
  }
}
```

Make sure to replace `your-clerk-domain` with your actual Clerk domain.

### 3. Create Convex Auth Provider

Create a wrapper component that provides authenticated Convex access:

```typescript
// lib/convex-clerk-provider.tsx
import { ClerkProvider, useAuth } from "@clerk/nextjs";
import { ConvexProviderWithClerk } from "convex/react-clerk";
import { ConvexReactClient } from "convex/react";
import { ReactNode } from "react";

// Initialize the Convex client
const convex = new ConvexReactClient(process.env.NEXT_PUBLIC_CONVEX_URL as string);

export function ConvexClerkProvider({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <ClerkProvider
      publishableKey={process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY as string}
    >
      <ConvexProviderWithClerk client={convex} useAuth={useAuth}>
        {children}
      </ConvexProviderWithClerk>
    </ClerkProvider>
  );
}
```

### 4. Update App Layout

Replace the separate providers with the combined provider in your app layout:

```typescript
// app/layout.tsx
import { ConvexClerkProvider } from "@/lib/convex-clerk-provider";
import "./globals.css";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ConvexClerkProvider>
      <html lang="en">
        <body>{children}</body>
      </html>
    </ConvexClerkProvider>
  );
}
```

## Authentication Utilities

### 1. Create Auth Helper Functions

Create utility functions to handle common authentication needs:

```typescript
// lib/auth-utils.ts
import { auth, currentUser } from "@clerk/nextjs";
import { ConvexError } from "convex/values";

// Get the current user ID from Clerk
export function getUserId(): string {
  const { userId } = auth();
  if (!userId) throw new Error("User not authenticated");
  return userId;
}

// Get full user details from Clerk
export async function getCurrentUser() {
  const user = await currentUser();
  if (!user) throw new Error("User not found");
  return user;
}

// Create a helper for Convex auth context
export function getConvexUserIdFromContext(ctx: any) {
  const identity = ctx.auth.getUserIdentity();
  if (!identity) {
    throw new ConvexError("Not authenticated");
  }
  return identity.subject;
}
```

### 2. Create Authorized Action Wrapper for Convex

Create higher-order functions to enforce authorization in Convex:

```typescript
// convex/auth-helpers.ts
import { ConvexError, v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Wrap queries with authentication
export function authorizedQuery(queryFn) {
  return query({
    args: { ...queryFn.args },
    handler: async (ctx, args) => {
      const identity = await ctx.auth.getUserIdentity();
      if (!identity) {
        throw new ConvexError("Not authenticated");
      }
      
      const userId = identity.subject;
      return queryFn.handler(ctx, { ...args, userId });
    },
  });
}

// Wrap mutations with authentication
export function authorizedMutation(mutationFn) {
  return mutation({
    args: { ...mutationFn.args },
    handler: async (ctx, args) => {
      const identity = await ctx.auth.getUserIdentity();
      if (!identity) {
        throw new ConvexError("Not authenticated");
      }
      
      const userId = identity.subject;
      return mutationFn.handler(ctx, { ...args, userId });
    },
  });
}
```

## Data Access Patterns

### 1. User-Specific Data Queries

Structure your Convex queries to filter data based on the authenticated user:

```typescript
// convex/chats.ts
import { authorizedQuery, authorizedMutation } from "./auth-helpers";
import { v } from "convex/values";

// List chats for the authenticated user
export const listUserChats = authorizedQuery({
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

// Create a new chat for the authenticated user
export const createUserChat = authorizedMutation({
  args: {
    title: v.string(),
  },
  handler: async (ctx, args) => {
    const { userId, title } = args;
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

### 2. User Profile Integration

Connect Clerk user profiles with Convex data:

```typescript
// convex/users.ts
import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { authorizedMutation, authorizedQuery } from "./auth-helpers";

// Sync user profile data from Clerk to Convex
export const syncUserProfile = authorizedMutation({
  args: {
    email: v.string(),
    firstName: v.optional(v.string()),
    lastName: v.optional(v.string()),
    imageUrl: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { userId, email, firstName, lastName, imageUrl } = args;
    
    // Check if user exists in our database
    const existingUser = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", userId))
      .unique();
    
    const now = Date.now();
    
    if (existingUser) {
      // Update existing user
      await ctx.db.patch(existingUser._id, {
        email,
        firstName,
        lastName,
        imageUrl,
        updatedAt: now,
      });
      
      return existingUser._id;
    } else {
      // Create new user
      return await ctx.db.insert("users", {
        clerkId: userId,
        email,
        firstName,
        lastName,
        imageUrl,
        createdAt: now,
        updatedAt: now,
      });
    }
  },
});

// Get current user profile
export const getMyProfile = authorizedQuery({
  args: {},
  handler: async (ctx, args) => {
    const { userId } = args;
    
    return await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", userId))
      .unique();
  },
});
```

## Client Integration

### 1. React Component with Authentication and Database

Create components that use both Clerk and Convex:

```typescript
// components/UserChatList.tsx
import { useUser } from "@clerk/nextjs";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useState, useEffect } from "react";
import { Button } from "./ui/button";
import { PlusIcon } from "lucide-react";
import { ChatItem } from "./ChatItem";
import { Spinner } from "./ui/spinner";

export function UserChatList() {
  const { user, isLoaded: isUserLoaded } = useUser();
  const chats = useQuery(api.chats.listUserChats);
  const createChat = useMutation(api.chats.createUserChat);
  const syncProfile = useMutation(api.users.syncUserProfile);
  
  // Sync user profile when user data loads
  useEffect(() => {
    if (isUserLoaded && user) {
      syncProfile({
        email: user.primaryEmailAddress?.emailAddress || "",
        firstName: user.firstName || undefined,
        lastName: user.lastName || undefined,
        imageUrl: user.imageUrl || undefined,
      });
    }
  }, [isUserLoaded, user, syncProfile]);
  
  const handleNewChat = async () => {
    if (!user) return;
    
    await createChat({
      title: "New Chat",
    });
  };
  
  if (!isUserLoaded || chats === undefined) {
    return <Spinner />;
  }
  
  return (
    <div className="space-y-4">
      <Button 
        onClick={handleNewChat}
        className="w-full flex items-center gap-2"
      >
        <PlusIcon size={16} />
        New Chat
      </Button>
      
      <div className="space-y-2">
        {chats.length === 0 ? (
          <div className="text-center text-gray-500 py-4">
            No chats yet. Create your first chat!
          </div>
        ) : (
          chats.map((chat) => (
            <ChatItem key={chat._id} chat={chat} />
          ))
        )}
      </div>
    </div>
  );
}
```

### 2. Protected Route with Data Access

Create protected pages that use the integrated auth and database:

```typescript
// app/dashboard/page.tsx
import { auth } from "@clerk/nextjs";
import { redirect } from "next/navigation";
import { UserChatList } from "@/components/UserChatList";
import { Header } from "@/components/Header";
import { Sidebar } from "@/components/Sidebar";

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
          <h1 className="text-2xl font-bold mb-6">Your Chats</h1>
          <UserChatList />
        </main>
      </div>
    </div>
  );
}
```

## Webhook Integration

### 1. Clerk Webhook Handler for User Events

Create a webhook handler to sync user events with Convex:

```typescript
// app/api/webhooks/clerk/route.ts
import { WebhookEvent } from "@clerk/nextjs/server";
import { headers } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { Webhook } from "svix";
import { ConvexHttpClient } from "convex/browser";

// Initialize Convex HTTP client for server operations
const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL as string);

export async function POST(req: NextRequest) {
  // Webhook secret from environment variables
  const webhookSecret = process.env.WEBHOOK_SECRET;
  
  if (!webhookSecret) {
    return NextResponse.json(
      { error: "Webhook secret not configured" },
      { status: 500 }
    );
  }

  // Get the headers
  const headerPayload = headers();
  const svix_id = headerPayload.get("svix-id");
  const svix_timestamp = headerPayload.get("svix-timestamp");
  const svix_signature = headerPayload.get("svix-signature");

  // If there are no svix headers, error out
  if (!svix_id || !svix_timestamp || !svix_signature) {
    return NextResponse.json(
      { error: "Missing svix headers" },
      { status: 400 }
    );
  }

  // Get the body
  const payload = await req.json();
  const body = JSON.stringify(payload);

  // Create new Svix instance with our secret
  const wh = new Webhook(webhookSecret);

  let evt: WebhookEvent;

  // Verify the payload with the headers
  try {
    evt = wh.verify(body, {
      "svix-id": svix_id,
      "svix-timestamp": svix_timestamp,
      "svix-signature": svix_signature,
    }) as WebhookEvent;
  } catch (err) {
    console.error("Error verifying webhook:", err);
    return NextResponse.json(
      { error: "Error verifying webhook" },
      { status: 400 }
    );
  }

  // Handle the webhook event
  const eventType = evt.type;
  
  if (eventType === "user.created") {
    // Sync new user to Convex
    await convex.mutation("users.createUser", {
      clerkId: evt.data.id,
      email: evt.data.email_addresses[0]?.email_address || "",
      firstName: evt.data.first_name || "",
      lastName: evt.data.last_name || "",
      imageUrl: evt.data.image_url || "",
    });
  } else if (eventType === "user.updated") {
    // Update user in Convex
    await convex.mutation("users.updateUser", {
      clerkId: evt.data.id,
      email: evt.data.email_addresses[0]?.email_address || "",
      firstName: evt.data.first_name || "",
      lastName: evt.data.last_name || "",
      imageUrl: evt.data.image_url || "",
    });
  } else if (eventType === "user.deleted") {
    // Handle user deletion in Convex
    await convex.mutation("users.markUserDeleted", {
      clerkId: evt.data.id,
    });
  }

  return NextResponse.json({ success: true });
}
```

### 2. Convex User Management Functions

Create the corresponding Convex functions to handle user lifecycle events:

```typescript
// convex/users.ts (additional functions)
import { mutation } from "./_generated/server";
import { v } from "convex/values";

// Create a new user from Clerk webhook
export const createUser = mutation({
  args: {
    clerkId: v.string(),
    email: v.string(),
    firstName: v.optional(v.string()),
    lastName: v.optional(v.string()),
    imageUrl: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { clerkId, email, firstName, lastName, imageUrl } = args;
    
    // Check if user already exists
    const existingUser = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", clerkId))
      .unique();
    
    if (existingUser) {
      return existingUser._id;
    }
    
    const now = Date.now();
    
    return await ctx.db.insert("users", {
      clerkId,
      email,
      firstName: firstName || "",
      lastName: lastName || "",
      imageUrl: imageUrl || "",
      createdAt: now,
      updatedAt: now,
      isActive: true,
    });
  },
});

// Update a user from Clerk webhook
export const updateUser = mutation({
  args: {
    clerkId: v.string(),
    email: v.string(),
    firstName: v.optional(v.string()),
    lastName: v.optional(v.string()),
    imageUrl: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { clerkId, email, firstName, lastName, imageUrl } = args;
    
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", clerkId))
      .unique();
    
    if (!user) {
      return null;
    }
    
    await ctx.db.patch(user._id, {
      email,
      firstName: firstName || user.firstName,
      lastName: lastName || user.lastName,
      imageUrl: imageUrl || user.imageUrl,
      updatedAt: Date.now(),
    });
    
    return user._id;
  },
});

// Mark a user as deleted (soft delete)
export const markUserDeleted = mutation({
  args: {
    clerkId: v.string(),
  },
  handler: async (ctx, args) => {
    const { clerkId } = args;
    
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", clerkId))
      .unique();
    
    if (!user) {
      return null;
    }
    
    await ctx.db.patch(user._id, {
      isActive: false,
      updatedAt: Date.now(),
    });
    
    return user._id;
  },
});
```

## Error Handling

Implement comprehensive error handling for authentication and database operations:

```typescript
// lib/error-handling.ts
import { ConvexError } from "convex/values";

// Custom error types
export class AuthenticationError extends Error {
  constructor(message = "Authentication required") {
    super(message);
    this.name = "AuthenticationError";
  }
}

export class AuthorizationError extends Error {
  constructor(message = "Access denied") {
    super(message);
    this.name = "AuthorizationError";
  }
}

export class ResourceNotFoundError extends Error {
  constructor(resource: string, id: string) {
    super(`${resource} with ID ${id} not found`);
    this.name = "ResourceNotFoundError";
  }
}

// Convert Convex errors to application errors
export function handleConvexError(error: unknown) {
  if (error instanceof ConvexError) {
    if (error.message.includes("Not authenticated")) {
      return new AuthenticationError();
    }
    if (error.message.includes("Access denied")) {
      return new AuthorizationError();
    }
    if (error.message.includes("not found")) {
      return new ResourceNotFoundError("Resource", "unknown");
    }
  }
  
  // Pass through other errors
  return error;
}
```

## Performance Optimization

### 1. Caching User Data

Implement a caching layer for frequently accessed user data:

```typescript
// hooks/useUserProfile.ts
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useUser } from "@clerk/nextjs";
import { useCallback, useEffect } from "react";

export function useUserProfile() {
  const { user, isLoaded: isClerkLoaded } = useUser();
  const convexProfile = useQuery(api.users.getMyProfile);
  const syncProfile = api.users.syncUserProfile.useMutation();
  
  // Function to sync Clerk profile to Convex
  const refreshProfile = useCallback(async () => {
    if (!user) return;
    
    await syncProfile({
      email: user.primaryEmailAddress?.emailAddress || "",
      firstName: user.firstName || undefined,
      lastName: user.lastName || undefined,
      imageUrl: user.imageUrl || undefined,
    });
  }, [user, syncProfile]);
  
  // Sync profile when user data loads or changes
  useEffect(() => {
    if (isClerkLoaded && user) {
      refreshProfile();
    }
  }, [isClerkLoaded, user, refreshProfile]);
  
  return {
    isLoaded: isClerkLoaded && convexProfile !== undefined,
    profile: convexProfile,
    refreshProfile,
  };
}
```

### 2. Optimistic Updates

Implement optimistic updates for a better user experience:

```typescript
// components/EditChatTitle.tsx
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useState } from "react";
import { Input } from "./ui/input";
import { Button } from "./ui/button";

interface EditChatTitleProps {
  chatId: string;
  initialTitle: string;
  onComplete: () => void;
}

export function EditChatTitle({ chatId, initialTitle, onComplete }: EditChatTitleProps) {
  const [title, setTitle] = useState(initialTitle);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const updateChat = useMutation(api.chats.update);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || title === initialTitle) {
      onComplete();
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Optimistically update the UI
      const originalTitle = initialTitle;
      setTitle(title);
      
      // Try to update in the database
      await updateChat({
        id: chatId,
        title,
      });
      
      onComplete();
    } catch (error) {
      // If it fails, revert to the original title
      setTitle(initialTitle);
      console.error("Failed to update chat title:", error);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <form onSubmit={handleSubmit} className="flex items-center gap-2">
      <Input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        autoFocus
        disabled={isSubmitting}
      />
      <Button type="submit" disabled={isSubmitting}>
        Save
      </Button>
    </form>
  );
}
```

## Testing the Integration

### 1. Authentication Flow Testing

Test the complete authentication and data access flow:

1. Sign up with a new user through Clerk
2. Verify the user is created in Convex
3. Sign in with the user
4. Create and retrieve user-specific data
5. Sign out and verify data is no longer accessible

### 2. Access Control Testing

Verify that users can only access their own data:

1. Create two test users
2. Sign in as User A and create some data
3. Sign in as User B and verify User A's data is not accessible
4. Attempt to modify User A's data as User B and verify it fails

## Troubleshooting Common Issues

### 1. Authentication Token Issues

If authentication tokens aren't working properly:

- Verify your Clerk JWT template includes the required claims
- Check that the Convex domain in `convex.json` matches your Clerk domain
- Ensure the token is being passed correctly in the client

### 2. Data Access Issues

If users can't access their data:

- Check if the user ID from Clerk matches the user ID being used in Convex queries
- Verify the authorization logic in your Convex functions
- Test direct queries in the Convex dashboard to ensure data exists

### 3. Webhook Issues

If webhooks aren't working:

- Verify the webhook secret is set correctly
- Check that webhook endpoints are publicly accessible
- Test with Clerk's webhook testing tool
- Check server logs for errors in webhook processing

## Conclusion

By integrating Clerk and Convex, you've created a powerful foundation for your application with:

- Secure authentication and user management via Clerk
- Robust, real-time data storage and access via Convex
- User-specific data isolation and access control
- Seamless user experience with optimized performance

This integration provides a scalable architecture that can grow with your application's needs while maintaining security and performance. 