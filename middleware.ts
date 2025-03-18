import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import { NextRequest } from 'next/server';

// Define public routes that don't require authentication
const isPublicRoute = createRouteMatcher(["/", "/((?!api|trpc))(_next|.+\\..+)(.+)"]);

// This example protects all routes except those defined as public
export default clerkMiddleware((auth, request: NextRequest) => {
  if (!isPublicRoute(request)) {
    // Protect the route if it's not public
    auth.protect();
  }
  // No need to return anything
});

export const config = {
  matcher: ['/((?!.+\\.[\\w]+$|_next).*)', '/', '/(api|trpc)(.*)'],
};