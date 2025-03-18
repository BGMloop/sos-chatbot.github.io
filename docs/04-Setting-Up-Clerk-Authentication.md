# Setting Up Clerk for Authentication

## Overview

This document outlines the process of setting up Clerk as the authentication provider for our application. Clerk provides a complete authentication and user management solution that simplifies the implementation of secure sign-in, sign-up, and user sessions.

## Prerequisites

Before starting with Clerk integration, ensure you have:

1. A Clerk account created at [clerk.com](https://clerk.com)
2. Created an application in the Clerk dashboard
3. Access to your Clerk API keys

## Installation

1. **Install Clerk Dependencies**

```bash
pnpm add @clerk/nextjs @clerk/clerk-react
```

2. **Environment Variables Setup**

Add the following environment variables to your `.env.local` file:

```env
CLERK_SECRET_KEY=your_clerk_secret_key
CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key

# Authentication redirection URLs
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/dashboard
```

## Configuration

### 1. Set Up Clerk Provider in Root Layout

Edit your `app/layout.tsx` file to include the `ClerkProvider`:

```typescript
import { ClerkProvider } from '@clerk/nextjs';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body className={inter.className}>{children}</body>
      </html>
    </ClerkProvider>
  );
}
```

### 2. Create Authentication Middleware

Create a `middleware.ts` file in the root directory:

```typescript
import { authMiddleware } from '@clerk/nextjs';

export default authMiddleware({
  // Routes that can be accessed while signed out
  publicRoutes: ['/'],
  // Routes that can always be accessed, and have
  // no authentication information
  ignoredRoutes: ['/api/webhook/clerk'],
});

export const config = {
  // Match all routes except for static files, images, etc.
  matcher: ['/((?!.+\\.[\\w]+$|_next).*)', '/', '/(api|trpc)(.*)'],
};
```

### 3. Create Sign-In and Sign-Up Pages

Create the sign-in page at `app/sign-in/page.tsx`:

```typescript
import { SignIn } from '@clerk/nextjs';

export default function SignInPage() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <SignIn
        appearance={{
          elements: {
            card: "bg-white dark:bg-gray-900 shadow-md",
            headerTitle: "text-gray-900 dark:text-white text-xl font-bold",
            headerSubtitle: "text-gray-500 dark:text-gray-400",
            socialButtonsBlockButton: "bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white",
            formButtonPrimary: "bg-blue-600 hover:bg-blue-700 text-white",
            footerActionLink: "text-blue-600 hover:text-blue-700"
          }
        }}
      />
    </div>
  );
}
```

Create the sign-up page at `app/sign-up/page.tsx`:

```typescript
import { SignUp } from '@clerk/nextjs';

export default function SignUpPage() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <SignUp
        appearance={{
          elements: {
            card: "bg-white dark:bg-gray-900 shadow-md",
            headerTitle: "text-gray-900 dark:text-white text-xl font-bold",
            headerSubtitle: "text-gray-500 dark:text-gray-400",
            socialButtonsBlockButton: "bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white",
            formButtonPrimary: "bg-blue-600 hover:bg-blue-700 text-white",
            footerActionLink: "text-blue-600 hover:text-blue-700"
          }
        }}
      />
    </div>
  );
}
```

## Utility Functions

Create authentication utility functions in `lib/auth.ts`:

```typescript
import { auth, currentUser } from "@clerk/nextjs";
import { User } from "@clerk/nextjs/dist/types/server";

/**
 * Get the current authenticated user ID
 */
export function getUserId(): string {
  const { userId } = auth();
  if (!userId) throw new Error("User not authenticated");
  return userId;
}

/**
 * Get the current authenticated user
 */
export async function getUser(): Promise<User> {
  const user = await currentUser();
  if (!user) throw new Error("User not found");
  return user;
}

/**
 * Check if user is authenticated
 */
export function isAuthenticated(): boolean {
  const { userId } = auth();
  return !!userId;
}
```

## Protected Routes

To create protected routes that require authentication, use the `auth()` function from Clerk:

```typescript
// Example of a protected route component
import { auth } from "@clerk/nextjs";
import { redirect } from "next/navigation";

export default function ProtectedPage() {
  const { userId } = auth();
  
  if (!userId) {
    redirect("/sign-in");
  }
  
  return <div>This is a protected page</div>;
}
```

## User Components

Create components to display user information:

```typescript
// components/UserButton.tsx
import { UserButton as ClerkUserButton } from "@clerk/nextjs";

export function UserButton() {
  return (
    <ClerkUserButton
      appearance={{
        elements: {
          userButtonAvatarBox: "w-10 h-10",
          userButtonTrigger: "focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-full"
        }
      }}
    />
  );
}
```

## Clerk Dashboard Configuration

In the Clerk Dashboard, configure the following settings:

1. **Social Connections**
   - Enable/disable social login providers (Google, GitHub, etc.)
   - Configure OAuth credentials for each provider

2. **Email & Password Settings**
   - Configure password requirements
   - Set up email templates

3. **Application URLs**
   - Set the allowed redirect URLs for your application
   - Configure the homepage URL

4. **Appearance**
   - Brand your authentication screens
   - Customize colors and styles

## Testing Authentication

To test the authentication flow:

1. Start your development server: `pnpm dev`
2. Visit your homepage and navigate to the sign-up page
3. Create a new account or sign in with a social provider
4. Verify redirection to the dashboard after successful authentication
5. Test sign-out functionality
6. Verify protection of restricted routes

## Common Issues and Solutions

### CORS Errors

If you encounter CORS errors with Clerk:

1. Make sure your domain is added to the allowed list in the Clerk dashboard
2. Check that your environment variables are correctly set

### Next.js Route Protection

If routes that should be protected are accessible:

1. Verify your middleware configuration
2. Ensure `auth()` checks are implemented correctly in protected pages

### Authentication State Not Persisting

If authentication state is not persisting between page refreshes:

1. Check that `ClerkProvider` is properly set up at the root layout
2. Verify that cookies are being properly set and not blocked

## Next Steps

After setting up basic authentication with Clerk, explore these advanced features:

1. **Multi-factor Authentication**: Enable and configure MFA for enhanced security
2. **User Metadata**: Store and retrieve custom user metadata
3. **Webhooks**: Set up webhooks to react to authentication events
4. **Organization Support**: Implement teams/organizations with Clerk's Organizations feature
5. **Passkey Support**: Implement passwordless authentication with passkeys

For detailed information on these advanced features, refer to the [Clerk Documentation](https://clerk.com/docs). 