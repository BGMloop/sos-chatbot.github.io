"use client";

import React, { useState, useEffect, useRef } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import dynamic from "next/dynamic";

// Import smaller components
import ChatHeader from "@/components/ChatHeader";
import ChatInput from "@/components/ChatInput";

// Dynamically import heavy components
const ChatMessages = dynamic(() => import("@/components/ChatMessages"), { 
  ssr: false,
  loading: () => <MessagesLoadingPlaceholder /> 
});

const NotificationAudio = dynamic(() => import("@/components/NotificationAudio"), { 
  ssr: false 
});

// Simple loading component
function MessagesLoadingPlaceholder() {
  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-8">
      {[1, 2, 3].map((i) => (
        <div key={i} className="animate-pulse flex space-x-4">
          <div className="rounded-full bg-slate-200 h-10 w-10"></div>
          <div className="flex-1 space-y-2 py-1">
            <div className="h-4 bg-slate-200 rounded w-3/4"></div>
            <div className="space-y-2">
              <div className="h-3 bg-slate-200 rounded"></div>
              <div className="h-3 bg-slate-200 rounded w-5/6"></div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export default function ChatContainer({ chatId }: { chatId: string }) {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [isInputFocused, setIsInputFocused] = useState(false);
  
  // Fetch chat data
  const chat = useQuery(api.chats.getChat, { id: chatId });
  const messages = useQuery(api.messages.list, { chatId });
  
  // Scroll to bottom when messages change
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  // If data is loading, show a placeholder
  if (!chat || !messages) {
    return (
      <div className="flex flex-col h-full">
        <div className="h-14 border-b animate-pulse bg-slate-100"></div>
        <MessagesLoadingPlaceholder />
        <div className="h-20 border-t animate-pulse bg-slate-100"></div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Chat header */}
      <ChatHeader title={chat.title} />
      
      {/* Messages area */}
      <ChatMessages 
        messages={messages} 
        messagesEndRef={messagesEndRef}
      />
      
      {/* Input area */}
      <div className="border-t p-4">
        <ChatInput 
          chatId={chatId}
          onFocus={() => setIsInputFocused(true)}
          onBlur={() => setIsInputFocused(false)}
        />
      </div>
      
      {/* Notification sound */}
      <NotificationAudio />
    </div>
  );
} 