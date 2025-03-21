# Clerk Webhooks Integration Guide

This guide explains how to set up and use Clerk webhooks with the SOS Chatbot application to sync user data between Clerk's authentication service and your Convex database.

## What are Clerk Webhooks?

Webhooks provide a way for Clerk to notify your application when specific events occur, such as when a user is created, updated, or deleted. Unlike traditional APIs where you need to poll for data frequently, webhooks deliver data to your application only when relevant events happen, making them more efficient.

Key characteristics of webhooks:
- Event-driven and asynchronous
- One-way communication (Clerk sends data to your app)
- Secured with signatures to verify the sender

## How Webhooks Work in SOS Chatbot

In our application, Clerk webhooks are used to:

1. Automatically create user records in Convex when a new user signs up through Clerk
2. Keep user information updated in the Convex database when users update their profiles
3. Clean up user data when accounts are deleted

## Setting Up Clerk Webhooks

### 1. Create a Webhook Endpoint in Clerk Dashboard

1. Log in to your [Clerk Dashboard](https://dashboard.clerk.dev)
2. Navigate to your application
3. Go to the "Webhooks" section in the sidebar
4. Click "Add Endpoint"
5. Enter your webhook URL: `https://yourdomain.com/api/webhooks/clerk`
   - For local development, you'll need to use a service like [ngrok](https://ngrok.com) to expose your local server
6. Select the events you want to receive:
   - `user.created`
   - `user.updated`
   - `user.deleted`
7. Click "Create" to save the webhook

### 2. Save the Webhook Secret

After creating the endpoint, Clerk will generate a signing secret. Copy this value and add it to your `.env.local` file:

```env
CLERK_WEBHOOK_SECRET=your_webhook_secret_here
```

This secret is used to verify that incoming webhook payloads are genuinely from Clerk.

## Implementation Details

### Webhook Handler

The webhook handler in `app/api/webhooks/clerk/route.ts` is responsible for:

1. Receiving webhook events from Clerk
2. Verifying the signature using the Svix library
3. Processing different event types
4. Updating the Convex database accordingly

```typescript
// app/api/webhooks/clerk/route.ts
export async function POST(req: Request) {
  // Verify webhook signature
  // Extract event data
  // Update Convex database
}
```

### Convex Database Updates

The `convex/users.ts` file contains mutations that are called by the webhook handler:

- `createUser`: Creates a new user record when a user signs up
- `updateUser`: Updates an existing user's information
- `deleteUser`: Removes a user and all associated data when their account is deleted

## Testing Webhooks Locally

To test webhooks during local development:

1. Install [ngrok](https://ngrok.com)
2. Run your Next.js application locally:
   ```bash
   pnpm dev
   ```
3. In a separate terminal, start ngrok to create a tunnel:
   ```bash
   ngrok http 3000
   ```
4. Copy the ngrok URL (e.g., `https://abc123.ngrok.io`)
5. In the Clerk Dashboard, update your webhook endpoint to use this URL:
   ```
   https://abc123.ngrok.io/api/webhooks/clerk
   ```
6. Perform actions that trigger webhooks (sign up, update profile, etc.)
7. Check your terminal for webhook logs

## Troubleshooting

Common issues and how to resolve them:

### Webhook Not Firing

- Ensure the webhook endpoint is correctly configured in the Clerk Dashboard
- Check that you've selected the appropriate events to trigger
- Verify your application is accessible from the internet (if using ngrok, ensure it's running)

### Failed Signature Verification

- Confirm the `CLERK_WEBHOOK_SECRET` in your `.env.local` matches the secret from Clerk Dashboard
- Check that you're passing all headers from the request to the verification function
- Ensure the request body isn't being modified before verification

### Database Updates Not Working

- Verify your Convex connection is working correctly
- Check for errors in your webhook handler
- Ensure your database schema includes all necessary fields

## Webhook Payload Examples

Here's an example of a webhook payload for a `user.created` event:

```json
{
  "data": {
    "id": "user_2KGLFLpEpXrPKEAreJ5zcjxxOyT",
    "email_addresses": [
      {
        "email_address": "user@example.com",
        "id": "idn_29w83yL7CwVlJXylYLxcslromF1",
        "verification": {
          "status": "verified",
          "strategy": "ticket"
        }
      }
    ],
    "first_name": "John",
    "last_name": "Doe",
    "image_url": "https://img.clerk.com/example.jpg"
  },
  "object": "event",
  "type": "user.created",
  "timestamp": 1654012591835
}
```

## Security Considerations

To ensure your webhook endpoint is secure:

1. Always verify webhook signatures using the provided secret
2. Only trust data from verified webhooks
3. Implement rate limiting on your webhook endpoint
4. Consider restricting access to Clerk's IP addresses
5. Use HTTPS for all webhook communications

## Next Steps

After setting up webhooks, you can:

1. Extend your webhook handler to respond to additional event types
2. Implement custom user onboarding flows triggered by webhooks
3. Set up notifications for important user events
4. Create admin dashboards that show real-time user activity 