"use client";
import { useAuth } from "@clerk/nextjs";
import { ConvexProviderWithClerk } from "convex/react-clerk";
import { ConvexReactClient } from "convex/react";
import { useEffect, useState } from "react";
import { toast } from "@/components/ui/use-toast";
// Use production URL if available, otherwise fallback to dev URL
const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL || "https://next-lemur-994.convex.cloud";
// Create a new ConvexReactClient instance
const convex = new ConvexReactClient(convexUrl);
export function ConvexClientProvider({ children }) {
    const [hasLoaded, setHasLoaded] = useState(false);
    const [retryCount, setRetryCount] = useState(0);
    const clerkAuth = useAuth();
    // Ensure auth is properly initialized before rendering children
    useEffect(() => {
        if (clerkAuth.isLoaded) {
            setHasLoaded(true);
        }
    }, [clerkAuth.isLoaded]);
    // Handle auth errors with retries
    useEffect(() => {
        const handleError = (error) => {
            var _a;
            console.error("Convex auth error:", error);
            if (((_a = error === null || error === void 0 ? void 0 : error.message) === null || _a === void 0 ? void 0 : _a.includes("auth provider")) && retryCount < 3) {
                // If it's an auth provider error, try to reload the page after a delay
                setTimeout(() => {
                    setRetryCount(prev => prev + 1);
                    window.location.reload();
                }, 2000);
            }
            else if (retryCount >= 3) {
                toast({
                    title: "Authentication Error",
                    description: "There was a problem connecting to the server. Please try signing out and back in.",
                    variant: "destructive",
                });
            }
        };
        window.addEventListener("unhandledrejection", (event) => {
            var _a, _b;
            if ((_b = (_a = event.reason) === null || _a === void 0 ? void 0 : _a.message) === null || _b === void 0 ? void 0 : _b.includes("Failed to authenticate")) {
                handleError(event.reason);
            }
        });
        return () => {
            window.removeEventListener("unhandledrejection", handleError);
        };
    }, [retryCount]);
    if (!hasLoaded) {
        return (<div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-4 border-blue-500 rounded-full border-t-transparent"></div>
      </div>);
    }
    return (<ConvexProviderWithClerk client={convex} useAuth={useAuth}>
      {children}
    </ConvexProviderWithClerk>);
}
