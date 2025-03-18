import { KnowledgeManager } from "@/components/KnowledgeManager";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default function KnowledgePage() {
  const { userId } = auth();
  
  if (!userId) {
    redirect("/");
  }
  
  return (
    <div className="container py-10">
      <div className="flex flex-col items-start gap-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Knowledge Base</h1>
          <p className="text-muted-foreground">
            Upload and manage documents to enhance your AI assistant's knowledge
          </p>
        </div>
        
        <KnowledgeManager />
      </div>
    </div>
  );
} 