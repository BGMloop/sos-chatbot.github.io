import { Webhook } from 'svix';
import { headers } from 'next/headers';
import { WebhookEvent } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { ConvexHttpClient } from 'convex/browser';
import { api } from '@/convex/_generated/api';

// Initialize the Convex client
const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL as string);

export async function POST(req: Request) {
  // Get the headers
  const headerPayload = await headers();
  const svix_id = headerPayload.get('svix-id');
  const svix_timestamp = headerPayload.get('svix-timestamp');
  const svix_signature = headerPayload.get('svix-signature');

  // If there are no svix headers, return 400
  if (!svix_id || !svix_timestamp || !svix_signature) {
    return new NextResponse('Error: Missing svix headers', { status: 400 });
  }

  // Get the body
  const payload = await req.json();
  const body = JSON.stringify(payload);

  // Create a new Svix instance with your webhook secret
  const webhookSecret = process.env.CLERK_WEBHOOK_SECRET;
  
  if (!webhookSecret) {
    return new NextResponse('Error: Missing webhook secret', { status: 500 });
  }

  // Create a new Webhook instance with your secret
  const wh = new Webhook(webhookSecret);

  let evt: WebhookEvent;

  // Verify the payload with the headers
  try {
    evt = wh.verify(body, {
      'svix-id': svix_id,
      'svix-timestamp': svix_timestamp,
      'svix-signature': svix_signature,
    }) as WebhookEvent;
  } catch (err) {
    console.error('Error verifying webhook:', err);
    return new NextResponse('Error verifying webhook', { status: 400 });
  }

  // Get the event type
  const eventType = evt.type;
  console.log(`Webhook received: ${eventType}`);

  // Handle the event based on the type
  try {
    switch (eventType) {
      case 'user.created': {
        // Create a new user in Convex
        const { id, email_addresses, first_name, last_name, image_url } = evt.data;
        
        if (!id) {
          console.error('User created event missing id');
          break;
        }
        
        await convex.mutation(api.users.createUser, {
          clerkId: id,
          email: email_addresses?.[0]?.email_address || '',
          firstName: first_name || '',
          lastName: last_name || '',
          imageUrl: image_url || '',
        });
        
        break;
      }
      
      case 'user.updated': {
        // Update user in Convex
        const { id, email_addresses, first_name, last_name, image_url } = evt.data;
        
        if (!id) {
          console.error('User updated event missing id');
          break;
        }
        
        await convex.mutation(api.users.updateUser, {
          clerkId: id,
          email: email_addresses?.[0]?.email_address || '',
          firstName: first_name || '',
          lastName: last_name || '',
          imageUrl: image_url || '',
        });
        
        break;
      }
      
      case 'user.deleted': {
        // Delete user from Convex
        const { id } = evt.data;
        
        if (!id) {
          console.error('User deleted event missing id');
          break;
        }
        
        await convex.mutation(api.users.deleteUser, {
          clerkId: id,
        });
        
        break;
      }
      
      default:
        console.log(`Unhandled event type: ${eventType}`);
    }
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error processing webhook:', error);
    return new NextResponse('Error processing webhook', { status: 500 });
  }
} 