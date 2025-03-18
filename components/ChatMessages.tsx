"use client";

import { useEffect, useRef } from "react";
import { Id } from "@/convex/_generated/dataModel";
import { api } from "@/convex/_generated/api";
import { useQuery } from "convex/react";
import { MessageBubble } from "./MessageBubble";

interface ChatMessagesProps {
  chatId: Id<"chats">;
}

export default function ChatMessages({ chatId }: ChatMessagesProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messages = useQuery(api.messages.list, { chatId });

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  if (!messages) {
    return (
      <div className="flex-1 overflow-y-auto p-4">
        <div className="flex justify-center items-center h-full">
          <div className="animate-pulse">Loading messages...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto p-4">
      <div className="space-y-4">
        {messages.map((message) => (
          <MessageBubble
            key={message._id}
            content={message.content}
            isUser={message.role === "user"}
          />
        ))}
        <div ref={messagesEndRef} />
      </div>
    </div>
  );
} 