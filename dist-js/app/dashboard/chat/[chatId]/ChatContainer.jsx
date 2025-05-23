"use client";
import React, { useState, useEffect, useRef } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import dynamic from "next/dynamic";
import { useUser } from "@clerk/nextjs";
// Static imports for lightweight components
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send } from "lucide-react";
import ShareConversation from "@/components/ShareConversation";
import ToolsExamples from "@/components/ToolsExamples";
import ChatSettings from "@/components/ChatSettings";
// Dynamic imports for heavy components (these will be loaded only when needed)
const MessageList = dynamic(() => import("./components/MessageList"), {
    ssr: false,
    loading: () => <MessageListSkeleton />
});
const NotificationSound = dynamic(() => import("@/components/NotificationSound"), {
    ssr: false
});
// Simple skeleton loader
function MessageListSkeleton() {
    return (<div className="flex-1 overflow-y-auto p-4 space-y-4">
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
    </div>);
}
export default function ChatContainer({ chatId }) {
    const messagesEndRef = useRef(null);
    const [inputValue, setInputValue] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { user, isLoaded: isUserLoaded } = useUser();
    // Convert string ID to Convex ID type properly
    // This is needed because URL params are strings but Convex expects an ID type
    const chatIdAsConvex = chatId;
    // Queries - using separate queries helps with granular data loading
    const chat = useQuery(api.chats.getChat, isUserLoaded && (user === null || user === void 0 ? void 0 : user.id)
        ? {
            id: chatIdAsConvex,
            userId: user.id
        }
        : "skip");
    const messages = useQuery(api.messages.list, { chatId: chatIdAsConvex });
    // Mutations
    const sendMessage = useMutation(api.messages.send);
    // Auto-scroll when new messages arrive
    useEffect(() => {
        if (messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
        }
    }, [messages]);
    // Handle message submission
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!inputValue.trim() || isSubmitting)
            return;
        setIsSubmitting(true);
        try {
            // Add message to database
            await sendMessage({
                chatId: chatIdAsConvex,
                content: inputValue,
            });
            // Clear input
            setInputValue("");
        }
        catch (error) {
            console.error("Error sending message:", error);
        }
        finally {
            setIsSubmitting(false);
        }
    };
    // Handle tool example clicks
    const handleExampleClick = (example) => {
        setInputValue(example);
    };
    // Loading state - show while user auth or chat data is loading
    if (!isUserLoaded || !user || !chat) {
        return (<div className="flex flex-col h-full">
        <div className="border-b h-14 px-4 flex items-center animate-pulse">
          <div className="h-5 w-32 bg-gray-200 rounded"></div>
        </div>
        <MessageListSkeleton />
        <div className="border-t p-4 animate-pulse">
          <div className="h-10 bg-gray-200 rounded"></div>
                </div>
              </div>);
    }
    return (<div className="flex flex-col h-full">
      {/* Header */}
      <div className="border-b h-14 px-4 flex items-center justify-between">
        <div></div>
        <div className="flex items-center gap-1">
          <ToolsExamples onExampleClick={handleExampleClick}/>
          <ShareConversation chatId={chatId} messages={messages || []} title={chat.title || "Conversation"}/>
          <ChatSettings />
            </div>
            </div>
            
      {/* Messages */}
      {messages ? (<div className="flex-1 overflow-y-auto">
          <MessageList messages={messages} messagesEndRef={messagesEndRef}/>
            </div>) : (<MessageListSkeleton />)}
      
      {/* Input */}
      <div className="border-t p-4">
        <form onSubmit={handleSubmit} className="flex gap-2">
          <Input placeholder="Type your message..." value={inputValue} onChange={(e) => setInputValue(e.target.value)} disabled={isSubmitting} className="flex-1"/>
          <Button type="submit" disabled={isSubmitting || !inputValue.trim()}>
            <Send className="h-4 w-4"/>
          </Button>
        </form>
        
        {isSubmitting && (<div className="text-center text-sm text-gray-500 mt-2 animate-pulse">
            Processing...
                </div>)}
            </div>
            
      {/* Sound effect - loaded asynchronously */}
      <NotificationSound />
    </div>);
}
