# Build Breakdown (1/2)

## Initial Project Setup

This document covers the first half of our build process, focusing on project initialization, core dependencies, and basic structural setup.

### Repository Setup

1. **Create GitHub Repository**
   - Created a new repository on GitHub: `sos-chatbot.github.io`
   - Set up GitHub Pages for deployment
   - Configured basic repository settings and security

2. **Initialize Next.js Project**
   ```bash
   npx create-next-app@latest sos-chatbot.github.io
   ```
   - Selected TypeScript support
   - Configured for App Router
   - Added TailwindCSS support
   - Set up ESLint integration

3. **Configure Package Management**
   - Installed PNPM for dependency management
   ```bash
   npm install -g pnpm
   pnpm install
   ```
   - Created initial `.npmrc` and `pnpm-lock.yaml`

## Core Dependencies Installation

1. **UI Framework Setup**
   ```bash
   pnpm add @radix-ui/react-avatar @radix-ui/react-dialog @radix-ui/react-dropdown-menu @radix-ui/react-icons @radix-ui/react-label @radix-ui/react-select @radix-ui/react-slot @radix-ui/react-switch @radix-ui/react-tabs @radix-ui/react-tooltip lucide-react class-variance-authority clsx tailwind-merge tailwindcss-animate
   ```

2. **AI & LLM Dependencies**
   ```bash
   pnpm add langchain @langchain/core @langchain/community @langchain/langgraph @langchain/anthropic @langchain/openai @langchain/google-genai @langchain/groq @langchain/mistralai
   ```

3. **Backend Services**
   ```bash
   pnpm add convex @clerk/nextjs @clerk/clerk-react @supabase/supabase-js
   ```

4. **Utility Libraries**
   ```bash
   pnpm add zod axios js-tiktoken uuid react-markdown rehype-raw remark-gfm react-timeago
   ```

5. **IBM Watsonx.ai Integration**
   ```bash
   pnpm add @wxflows/sdk
   ```

## Project Structure Creation

1. **Directory Structure**
   ```
   sos-chatbot.github.io/
   ├── app/                  # Next.js app directory
   │   ├── api/              # API routes
   │   ├── chat/             # Chat page
   │   ├── dashboard/        # Dashboard page
   │   └── page.tsx          # Landing page
   ├── components/           # React components
   │   ├── ui/               # UI components from shadcn/ui
   │   └── ...               # Custom components
   ├── convex/               # Convex database configurations
   ├── lib/                  # Utility functions and services
   ├── hooks/                # Custom React hooks
   ├── constants/            # Constants and configuration values
   ├── wxflows/              # IBM Watsonx.ai tool configurations
   ├── public/               # Static assets
   └── ...                   # Configuration files
   ```

2. **Environment Setup**
   - Created `.env.local` for local development
   - Added necessary API keys placeholders:
   ```
   CLERK_SECRET_KEY=
   CLERK_PUBLISHABLE_KEY=
   NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
   NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
   NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
   NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard
   NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/dashboard
   
   ANTHROPIC_API_KEY=
   HUGGINGFACE_API_KEY=
   WXFLOWS_API_KEY=
   CONVEX_DEPLOYMENT=
   NEXT_PUBLIC_CONVEX_URL=
   ```

3. **TypeScript Configuration**
   - Updated `tsconfig.json` with paths for improved imports:
   ```json
   {
     "compilerOptions": {
       "paths": {
         "@/*": ["./*"],
         "@/components/*": ["./components/*"],
         "@/lib/*": ["./lib/*"],
         "@/constants/*": ["./constants/*"],
         "@/hooks/*": ["./hooks/*"]
       }
     }
   }
   ```

## Initial Code Implementation

1. **Basic Types Setup** (lib/types.ts)
   ```typescript
   export interface Message {
     id: string;
     content: string;
     role: 'user' | 'assistant' | 'system';
     createdAt: Date;
   }
   
   export interface Chat {
     id: string;
     title: string;
     userId: string;
     messages: Message[];
     createdAt: Date;
     updatedAt: Date;
   }
   ```

2. **Constants Definition** (constants/systemMessage.ts)
   - Created system message for AI model interactions
   - Defined tool schemas and available functionalities

3. **Authentication Utilities** (lib/auth.ts)
   ```typescript
   import { auth } from "@clerk/nextjs";
   
   export function getUserId(): string {
     const { userId } = auth();
     if (!userId) throw new Error("User not authenticated");
     return userId;
   }
   ```

## Core Configuration Files

1. **Next.js Configuration**
   - Updated `next.config.js` for improved performance and security:
   ```javascript
   /** @type {import('next').NextConfig} */
   const nextConfig = {
     reactStrictMode: true,
     images: {
       domains: ['images.clerk.dev']
     },
     experimental: {
       serverComponentsExternalPackages: ["@clerk/nextjs"],
       serverActions: true,
     },
     transpilePackages: ["@wxflows/sdk"],
   };
   
   module.exports = nextConfig;
   ```

2. **TailwindCSS Configuration**
   - Set up TailwindCSS with custom theme in `tailwind.config.js`
   - Added custom color schemes and typography settings

3. **ESLint Configuration**
   - Configured ESLint for code quality checks
   - Added TypeScript-specific rules

## Next Steps

The next part of the build breakdown will cover:
- Setting up Clerk for Authentication
- Implementing Convex database
- Building the landing page
- Creating the initial chat components
- Integrating the first version of IBM Watsonx.ai tools 