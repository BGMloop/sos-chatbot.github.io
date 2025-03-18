# Build Tech Stack

## Overview

This project uses a modern, full-stack architecture built with TypeScript, featuring a robust combination of frameworks and tools designed for AI-powered conversational applications. Below is a breakdown of the key technologies used.

## Frontend

### Core

- **Next.js 15**: React framework for server-side rendering and static site generation
- **React 19**: JavaScript library for building user interfaces, with the latest features including the new 'use' hook
- **TypeScript**: Typed superset of JavaScript for improved developer experience
- **Tailwind CSS**: Utility-first CSS framework for rapid UI development

### UI Components

- **Shadcn/ui**: Re-usable components built with Radix UI and Tailwind CSS
- **Radix UI**: Low-level UI component library for creating accessible design systems
- **Lucide Icons**: Beautiful & consistent icons for React applications

## Backend

### Authentication & Database

- **Clerk**: Complete authentication and user management solution
- **Convex**: Backend development platform with real-time database capabilities
- **Supabase**: Open source Firebase alternative with PostgreSQL database

### AI & Machine Learning

- **LangChain**: Framework for developing applications powered by language models
- **Langgraph**: Framework for building stateful, multi-actor applications with LLMs
- **IBM Watsonx.ai (wxflows)**: Enterprise AI platform for tool integration and workflows
- **Large Language Models**:
  - Anthropic Claude
  - Meta LLaMA 3
  - Hugging Face integration
  - OpenRouter integration
  - Google Gemini
  - Groq

### API Integration

- **Fetch API**: Standard web API for making HTTP requests
- **Axios**: Promise-based HTTP client for API interactions

## Development Tools

- **ESLint**: JavaScript/TypeScript linter for identifying and fixing code issues
- **Jest**: JavaScript testing framework
- **Turbopack**: Incremental bundler and build system optimized for JavaScript and TypeScript
- **Zod**: TypeScript-first schema validation library

## Deployment & Infrastructure

- **GitHub Pages**: Hosting platform for the application
- **Environment Variables**: Secure storage of API keys and configuration
- **TypeScript Configuration**: Custom TypeScript settings for optimal type checking and performance

## Package Management

- **PNPM**: Fast, disk space efficient package manager used for managing dependencies

## Full Dependencies List

```json
"dependencies": {
  "@clerk/clerk-react": "^5.23.0",
  "@clerk/nextjs": "6.12.1",
  "@google/generative-ai": "^0.22.0",
  "@langchain/anthropic": "^0.3.15",
  "@langchain/community": "^0.3.32",
  "@langchain/core": "^0.3.40",
  "@langchain/google-genai": "^0.1.10",
  "@langchain/groq": "^0.1.3",
  "@langchain/langgraph": "^0.2.48",
  "@langchain/mistralai": "^0.2.0",
  "@langchain/openai": "^0.4.4",
  "@radix-ui/react-accordion": "^1.2.3",
  "@radix-ui/react-avatar": "^1.1.3",
  "@radix-ui/react-dialog": "^1.1.6",
  "@radix-ui/react-dropdown-menu": "^2.1.6",
  "@radix-ui/react-icons": "^1.3.2",
  "@radix-ui/react-label": "^2.1.2",
  "@radix-ui/react-select": "^2.1.6",
  "@radix-ui/react-slot": "^1.1.2",
  "@radix-ui/react-switch": "^1.1.3",
  "@radix-ui/react-tabs": "^1.1.3",
  "@radix-ui/react-tooltip": "^1.1.8",
  "@supabase/supabase-js": "^2.49.1",
  "@wxflows/sdk": "^2.0.0",
  "axios": "^1.7.9",
  "class-variance-authority": "^0.7.1",
  "clsx": "^2.1.1",
  "convex": "^1.19.2",
  "js-tiktoken": "^1.0.19",
  "langchain": "^0.3.19",
  "lucide-react": "^0.475.0",
  "next": "15.2.0",
  "radix-ui": "^1.1.3",
  "react": "^19.0.0",
  "react-dom": "^19.0.0",
  "react-markdown": "^10.1.0",
  "react-timeago": "^7.2.0",
  "rehype-raw": "^7.0.0",
  "remark-gfm": "^4.0.1",
  "tailwind-merge": "^3.0.2",
  "tailwindcss-animate": "^1.0.7",
  "uuid": "^11.1.0",
  "zod": "^3.24.2"
}
```

## Architecture Diagram

```
┌─────────────────┐     ┌──────────────┐     ┌─────────────────┐
│                 │     │              │     │                 │
│  React UI       │────▶│  Next.js     │────▶│  Clerk Auth     │
│  (Components)   │     │  Framework   │     │                 │
│                 │     │              │     └─────────────────┘
└─────────────────┘     └──────────────┘              │
        │                      │                       │
        │                      │                       ▼
        │                      │             ┌─────────────────┐
        │                      │             │                 │
        ▼                      ▼             │  Convex DB      │
┌─────────────────┐     ┌──────────────┐     │                 │
│                 │     │              │     └─────────────────┘
│  Shadcn/UI      │────▶│  API Routes  │              │
│  Components     │     │              │              │
│                 │     └──────────────┘              │
└─────────────────┘             │                     │
                                │                     │
                                ▼                     ▼
                      ┌──────────────────────────────────┐
                      │                                  │
                      │  LangChain / Langgraph           │
                      │  (Message Processing)            │
                      │                                  │
                      └──────────────────────────────────┘
                                      │
                                      │
                                      ▼
                      ┌──────────────────────────────────┐
                      │                                  │
                      │  IBM Watsonx.ai (wxflows)        │
                      │  (Tool Orchestration)            │
                      │                                  │
                      └──────────────────────────────────┘
                                      │
                                      │
                       ┌──────────────┴───────────┐
                       │                          │
                       ▼                          ▼
             ┌─────────────────┐        ┌─────────────────┐
             │                 │        │                 │
             │  LLM Models     │        │  External APIs  │
             │  (Claude, etc.) │        │  (Web, etc.)    │
             │                 │        │                 │
             └─────────────────┘        └─────────────────┘
```

## Performance Considerations

- Next.js with Turbopack for fast builds and rendering
- Streaming responses from AI models for better user experience
- Efficient state management with React 19's 'use' hook
- Token management for LLM cost optimization 