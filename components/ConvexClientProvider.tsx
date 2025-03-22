"use client";

import { useAuth } from "@clerk/nextjs";
import { ConvexProviderWithClerk } from "convex/react-clerk";
import { ConvexReactClient } from "convex/react";
import { ReactNode, useEffect, useState } from "react";
import { toast } from "@/components/ui/use-toast";

// Use production URL if available, otherwise fallback to dev URL
const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL || "https://next-lemur-994.convex.cloud";

// Create a new ConvexReactClient instance - safely handle server-side case
const convex = typeof window !== 'undefined' ? new ConvexReactClient(convexUrl) : null;

export function ConvexClientProvider({ children }: { children: ReactNode }) {
  const [hasLoaded, setHasLoaded] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const clerkAuth = useAuth();
  
  // Ensure auth is properly initialized before rendering children
  useEffect(() => {
    if (clerkAuth.isLoaded) {
      setHasLoaded(true);
    }
  }, [clerkAuth.isLoaded]);

  // Handle auth errors with retries - ensure this runs only in browser
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    const handleError = (error: any) => {
      console.error("Convex auth error:", error);
      
      if (error?.message?.includes("auth provider") && retryCount < 3) {
        // If it's an auth provider error, try to reload the page after a delay
        setTimeout(() => {
          setRetryCount(prev => prev + 1);
          window.location.reload();
        }, 2000);
      } else if (retryCount >= 3) {
        toast({
          title: "Authentication Error",
          description: "There was a problem connecting to the server. Please try signing out and back in.",
          variant: "destructive",
        });
      }
    };

    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      if (event.reason?.message?.includes("Failed to authenticate")) {
        handleError(event.reason);
      }
    };

    window.addEventListener("unhandledrejection", handleUnhandledRejection);

    return () => {
      window.removeEventListener("unhandledrejection", handleUnhandledRejection);
    };
  }, [retryCount]);

  if (!hasLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-4 border-blue-500 rounded-full border-t-transparent"></div>
      </div>
    );
  }
  
  // Safety check for server-side rendering
  if (!convex) {
    return children;
  }
  
  return (
    <ConvexProviderWithClerk client={convex} useAuth={useAuth}>
      {children}
    </ConvexProviderWithClerk>
  );
}