# Initializing the Build

## Pre-build Setup

This document outlines the steps to properly initialize and prepare the application for development. Following these steps ensures all dependencies are installed correctly and the development environment is properly configured.

## Repository Cloning

1. **Clone the Repository**

```bash
git clone https://github.com/sos-chatbot/sos-chatbot.github.io.git
cd sos-chatbot.github.io
```

2. **Create Development Branch**

```bash
git checkout -b development
```

## Dependencies Installation

1. **Install PNPM (if not already installed)**

```bash
npm install -g pnpm
```

2. **Install Project Dependencies**

```bash
pnpm install
```

3. **Install Platform-specific Dependencies**

If you're on macOS:

```bash
# If you have issues with native dependencies
pnpm install --no-optional
```

## Environment Configuration

1. **Create Environment Variables File**

Create a copy of the example environment file:

```bash
cp .env .env.local
```

2. **Update Environment Variables**

Edit `.env.local` with your specific API keys and secrets:

```
# Clerk Authentication
CLERK_SECRET_KEY=your_clerk_secret_key
CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/dashboard

# AI Services
ANTHROPIC_API_KEY=your_anthropic_key
HUGGINGFACE_API_KEY=your_huggingface_key

# IBM Watsonx.ai
WXFLOWS_API_KEY=your_wxflows_key

# Convex Database
CONVEX_DEPLOYMENT=your_convex_deployment_url
NEXT_PUBLIC_CONVEX_URL=your_public_convex_url
```

## Development Server Setup

1. **Start Convex Development Server**

```bash
# In a separate terminal
npx convex dev
```

2. **Start Next.js Development Server**

```bash
# With Turbopack (faster development)
pnpm dev
```

Or, if you prefer the standard Next.js development server:

```bash
# Without Turbopack
pnpm dev:standard
```

## Verify Installation

1. **Check Frontend**
   - Open your browser and navigate to [http://localhost:3000](http://localhost:3000)
   - Verify the landing page loads correctly

2. **Verify Authentication**
   - Try navigating to [http://localhost:3000/sign-in](http://localhost:3000/sign-in)
   - Check that the Clerk authentication UI appears

3. **Test Convex Connection**
   - Open browser console and look for successful connection to Convex
   - No connection errors should appear

## IBM Watsonx.ai Configuration

1. **Configure wxflows**

```bash
# Initialize wxflows configuration
npx wxflows init

# Test the wxflows configuration
npx wxflows test
```

2. **Deploy wxflows Tools**

```bash
# Deploy the defined tools to wxflows platform
npx wxflows deploy
```

## Building for Production

To create a production build for testing:

```bash
pnpm build
```

Verify the build completes without errors.

## Common Initialization Issues

### Node.js Version Compatibility

This project requires Node.js version 18.0.0 or newer. If you encounter errors during installation:

```bash
# Check your Node.js version
node -v

# If needed, install recommended version using nvm
nvm install 18
nvm use 18
```

### PNPM Dependency Resolution

If you encounter dependency resolution issues with PNPM:

```bash
# Clear PNPM store
pnpm store prune

# Try installation with frozen lockfile
pnpm install --frozen-lockfile
```

### Environment Variable Errors

If the application can't access environment variables:

1. Check that `.env.local` exists in the project root
2. Ensure environment variables are correctly formatted without spaces around equals signs
3. Restart the development server after changes

## Project Structure Verification

After initialization, verify that your project structure matches the expected layout:

```
sos-chatbot.github.io/
├── app/                  # Next.js app directory
├── components/           # React components
├── convex/               # Convex database configurations
├── lib/                  # Utility functions and services
├── hooks/                # Custom React hooks
├── constants/            # Constants and configuration values
├── wxflows/              # IBM Watsonx.ai tool configurations
├── public/               # Static assets
├── .env.local            # Local environment variables
├── next.config.js        # Next.js configuration
├── package.json          # Project dependencies
├── pnpm-lock.yaml        # PNPM lock file
├── tailwind.config.js    # Tailwind CSS configuration
└── tsconfig.json         # TypeScript configuration
```

## Next Steps

After successfully initializing the build:

1. Start implementing core components
2. Set up the authentication flow
3. Configure Convex database schemas
4. Implement IBM Watsonx.ai tools integration
5. Build the chat interface 