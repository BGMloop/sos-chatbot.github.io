"use client";

import { Suspense } from "react";
import { KnowledgeManager } from "@/components/KnowledgeManager";
import { useUser } from "@clerk/nextjs";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

// Simple loading fallback
function KnowledgeLoading() {
  return (
    <div className="container py-10">
      <div className="flex flex-col items-start gap-6">
        <div className="w-full">
          <div className="h-8 w-60 bg-gray-200 rounded-md mb-2 animate-pulse"></div>
          <div className="h-4 w-96 bg-gray-200 rounded-md animate-pulse"></div>
        </div>
        <div className="w-full h-64 bg-gray-100 rounded-lg animate-pulse"></div>
      </div>
    </div>
  );
}

export default function KnowledgePage() {
  const { user, isLoaded } = useUser();
  
  // Show loading state while auth is initializing
  if (!isLoaded) {
    return <KnowledgeLoading />;
  }
  
  // Redirect if not authenticated, but only after checking auth state
  if (isLoaded && !user) {
    return redirect("/");
  }
  
  return (
    <div className="container py-10">
      <div className="flex flex-col items-start gap-6">
        <div className="flex w-full justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Knowledge Base</h1>
            <p className="text-muted-foreground">
              Upload and manage documents to enhance your AI assistant&apos;s knowledge
            </p>
          </div>
          <Link href="/dashboard">
            <Button variant="outline" className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back to Dashboard
            </Button>
          </Link>
        </div>
        
        <Suspense fallback={<KnowledgeLoading />}>
          <KnowledgeManager />
        </Suspense>
      </div>
    </div>
  );
} 