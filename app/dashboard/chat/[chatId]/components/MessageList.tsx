"use client";

import React, { RefObject, memo } from "react";
import { Id } from "@/convex/_generated/dataModel";
import { cn } from "@/lib/utils";
import Image from "next/image";

// Define the Message type since it's not exported from convex
interface Message {
  _id: Id<"messages">;
  chatId: Id<"chats">;
  content: string;
  role: string;
  createdAt: number;
  timestamp?: number;
}

interface MessageListProps {
  messages: Message[];
  messagesEndRef: RefObject<HTMLDivElement | null>;
}

// Function to format message content with proper styling
const formatMessageContent = (content: string): React.ReactNode => {
  // Simple check if content contains numbered list pattern (\n1., \n2., etc.)
  if (content.includes("\n1.") || content.match(/\n\d+\./)) {
    // Convert the text to something more readable without changing the actual content
    return (
      <div>
        {content.split('\n').map((line, index) => {
          // Check if this line is a numbered list item
          const listMatch = line.match(/^(\d+)\.\s*(.*)/);
          
          if (listMatch) {
            // It's a list item, format it nicely
            const [, number, text] = listMatch;
            return (
              <div key={index} className="flex items-start py-1 -mx-1">
                <span className="inline-flex items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900 w-6 h-6 text-xs font-medium text-blue-800 dark:text-blue-200 mr-2 flex-shrink-0">
                  {number}
                </span>
                <span>{text}</span>
              </div>
            );
          } else {
            // Regular line, just return it with a line break
            return (
              <div key={index}>
                {line}
                {index < content.split('\n').length - 1 && line.trim() && <br />}
              </div>
            );
          }
        })}
      </div>
    );
  }
  
  // For all other content, just return as is with newlines preserved
  return (
    <div>
      {content.split('\n').map((line, i) => (
        <React.Fragment key={i}>
          {line}
          {i < content.split('\n').length - 1 && line.trim() && <br />}
        </React.Fragment>
      ))}
    </div>
  );
};

function MessageList({ messages, messagesEndRef }: MessageListProps) {
  if (!messages.length) {
    return (
      <div className="flex-1 overflow-y-auto p-4 flex items-center justify-center">
        <p className="text-gray-400">No messages yet. Start a conversation!</p>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto p-4">
      <div className="space-y-4">
        {messages.map((message) => (
          <MessageItem key={message._id} message={message} />
        ))}
      </div>
      {/* This empty div is used to scroll to the bottom */}
      <div ref={messagesEndRef} />
    </div>
  );
}

// Separate component for each message to improve re-rendering performance
const MessageItem = memo(({ message }: { message: Message }) => {
  const isUser = message.role === "user";
  
  return (
    <div 
      className={cn(
        "flex items-start gap-3 p-3 rounded-lg",
        isUser ? "bg-blue-50 dark:bg-blue-900/20" : "bg-gray-50 dark:bg-gray-800/50"
      )}
    >
      {isUser ? (
        <div 
          className={cn(
            "h-8 w-8 rounded-full flex items-center justify-center text-white",
            "bg-blue-500"
          )}
        >
          U
        </div>
      ) : (
        <div className="h-10 w-10 rounded-full overflow-hidden flex-shrink-0">
          <Image
            src="/logo/logo.png"
            alt="Assistant"
            width={40}
            height={40}
            className="object-cover"
          />
        </div>
      )}
      <div className="flex-1 min-w-0">
        <div className="font-medium text-sm mb-1 flex items-center">
          <span>{isUser ? "You" : "Assistant"}</span>
          {message.timestamp && (
            <span className="text-xs text-gray-400 ml-2">
              {new Date(message.timestamp).toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit'
              })}
            </span>
          )}
        </div>
        <div className="text-sm leading-relaxed">
          {formatMessageContent(message.content)}
        </div>
      </div>
    </div>
  );
});

MessageItem.displayName = "MessageItem";

export default memo(MessageList); 