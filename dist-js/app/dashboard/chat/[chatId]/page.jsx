"use client";
import dynamic from "next/dynamic";
import { useParams } from "next/navigation";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useUser } from "@clerk/nextjs";
// Use dynamic import with loading state
const ChatContainer = dynamic(() => import("./ChatContainer"), {
    ssr: false,
    loading: () => <ChatPageSkeleton />
});
// Skeleton for the chat page
function ChatPageSkeleton() {
    return (<div className="h-full flex flex-col">
      {/* Header skeleton */}
      <div className="border-b h-14 px-4 flex items-center animate-pulse">
        <div className="h-5 w-36 bg-gray-200 rounded"></div>
      </div>
      
      {/* Message area skeleton */}
      <div className="flex-1 p-4 space-y-4">
        {Array(3).fill(0).map((_, i) => (<div key={i} className="flex items-start gap-3 p-2 rounded-lg animate-pulse">
            <div className="h-8 w-8 rounded-full bg-gray-200"></div>
            <div className="flex-1">
              <div className="h-4 w-24 bg-gray-200 rounded mb-2"></div>
              <div className="space-y-1">
                <div className="h-3 bg-gray-200 rounded w-full"></div>
                <div className="h-3 bg-gray-200 rounded w-5/6"></div>
              </div>
            </div>
          </div>))}
      </div>
      
      {/* Input area skeleton */}
      <div className="border-t p-4 animate-pulse">
        <div className="h-10 bg-gray-200 rounded"></div>
      </div>
    </div>);
}
export default function ChatPage() {
    const params = useParams();
    const chatId = params.chatId;
    const { user } = useUser();
    // Convert string ID to Convex ID type
    const chatIdAsConvex = chatId;
    // Verify chat exists - pass the userId parameter required by the getChat query
    const chat = useQuery(api.chats.getChat, {
        id: chatIdAsConvex,
        userId: (user === null || user === void 0 ? void 0 : user.id) || ""
    });
    // Show loading state while auth is initializing or chat is loading
    if (!user || chat === undefined) {
        return <ChatPageSkeleton />;
    }
    // Not found state
    if (chat === null) {
        return (<div className="h-full flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-semibold mb-2">Chat not found</h2>
          <p className="text-gray-500">This chat may have been deleted or does not exist.</p>
        </div>
      </div>);
    }
    return <ChatContainer chatId={chatId}/>;
}
