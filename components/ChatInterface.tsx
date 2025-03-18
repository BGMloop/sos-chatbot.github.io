"use client";

import { useEffect, useRef, useState } from "react";
import { Doc, Id } from "@/convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import { ChatRequestBody, StreamMessageType } from "@/lib/types";
import WelcomeMessage from "@/components/WelcomeMessage";
import { MessageBubble } from "@/components/MessageBubble";
import { BookFormatting } from "@/components/BookFormatting";
import { ArrowRight } from "lucide-react";
import { getConvexClient } from "@/lib/convex";
import { api } from "@/convex/_generated/api";
import { useDebounce } from "@/hooks/useDebounce";
import { ToolsGuide } from "./ToolsGuide";
import ReactMarkdown from "react-markdown";
import { AIMessage, HumanMessage } from "@langchain/core/messages";
import { submitQuestion } from "@/lib/huggingface";
import StarsBackground from "@/components/StarsBackground";
import { useNotificationSound } from "@/hooks/useNotificationSound";

// Define types for client-side messages
interface BaseMessage {
  content: string;
  role: "user" | "assistant";
  createdAt: number;
  hasAttachment?: boolean;
  attachment?: {
    type: 'image' | 'file';
    name: string;
    preview?: string | null;
  };
}

// Type for temporary messages that haven't been saved to the database yet
interface TemporaryMessage extends BaseMessage {
  _id: string; // Simple string ID for client-side messages
  chatId: Id<"chats">;
  isTemporary?: boolean;
}

// Extend the Doc<"messages"> type to include our optional UI properties
interface ExtendedDocMessage extends Doc<"messages"> {
  hasAttachment?: boolean;
  attachment?: {
    type: 'image' | 'file';
    name: string;
    preview?: string | null;
  };
}

// Union type for all message types in the UI
type UIMessage = ExtendedDocMessage | TemporaryMessage;

function createSSEParser() {
  let buffer = "";

  return {
    parse(chunk: string) {
      buffer += chunk;
      const messages = [];
      const lines = buffer.split("\n");
      buffer = lines.pop() || "";

      for (const line of lines) {
        if (line.startsWith("data: ")) {
          try {
            const data = JSON.parse(line.slice(6));
            messages.push(data);
          } catch (e) {
            messages.push({
              type: StreamMessageType.Error,
              error: `Failed to parse SSE data: ${e}`,
            });
          }
        }
      }

      return messages;
    },
  };
}

interface ChatInterfaceProps {
  chatId: Id<"chats">;
  initialMessages: Doc<"messages">[];
}

export default function ChatInterface({
  chatId,
  initialMessages,
}: ChatInterfaceProps) {
  const [messages, setMessages] = useState<UIMessage[]>(initialMessages);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [streamedResponse, setStreamedResponse] = useState("");
  const [currentTool, setCurrentTool] = useState<{
    name: string;
    input: unknown;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isTyping, setIsTyping] = useState(false);
  const debouncedInput = useDebounce(input, 300);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [result, setResult] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [retries, setRetries] = useState(0);
  const MAX_RETRIES = 3;
  const playNotificationSound = useNotificationSound();

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, streamedResponse]);

  const formatToolOutput = (output: unknown): string => {
    if (typeof output === "string") return output;
    return JSON.stringify(output, null, 2);
  };

  const formatTerminalOutput = (
    tool: string,
    input: unknown,
    output: unknown
  ) => {
    const terminalHtml = `<div class="bg-[#1e1e1e] text-white font-mono p-2 rounded-md my-2 overflow-x-auto whitespace-normal max-w-[600px]">
      <div class="flex items-center gap-1.5 border-b border-gray-700 pb-1">
        <span class="text-red-500">●</span>
        <span class="text-yellow-500">●</span>
        <span class="text-green-500">●</span>
        <span class="text-gray-400 ml-1 text-sm">~/${tool}</span>
      </div>
      <div class="text-gray-400 mt-1">$ Input</div>
      <pre class="text-yellow-400 mt-0.5 whitespace-pre-wrap overflow-x-auto">${formatToolOutput(input)}</pre>
      <div class="text-gray-400 mt-2">$ Output</div>
      <pre class="text-green-400 mt-0.5 whitespace-pre-wrap overflow-x-auto">${formatToolOutput(output)}</pre>
    </div>`;

    return `---START---\n${terminalHtml}\n---END---`;
  };

  const processStream = async (
    reader: ReadableStreamDefaultReader<Uint8Array>,
    onChunk: (chunk: string) => Promise<void>
  ) => {
    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        await onChunk(new TextDecoder().decode(value));
      }
    } finally {
      reader.releaseLock();
    }
  };

  const retryMessage = async (messageId: string | Id<"messages">) => {
    const messageToRetry = messages.find(msg => msg._id === messageId);
    if (!messageToRetry) return;
    
    setError(null);
    setInput(messageToRetry.content);
    
    const fakeEvent = {
      preventDefault: () => {}
    } as React.FormEvent;
    
    handleSubmit(fakeEvent);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) {
      setImageFile(null);
      setSelectedImage(null);
      return;
    }

    setImageFile(file);
    
    // Create a preview URL for image files
    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setSelectedImage(result);
      };
      reader.readAsDataURL(file);
    } else {
      // For non-image files, we'll just show a generic icon
      setSelectedImage('file'); // Using 'file' as a marker that we have a non-image file
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if ((!input.trim() && !imageFile) || isLoading) {
      return;
    }
    
    // Play the notification sound
    playNotificationSound();
    
    setIsLoading(true);
    setIsTyping(true);
    setError(null);
    
    // Create optimistic user message
    const optimisticUserMessage: UIMessage = {
      _id: `temp_${Date.now()}`,
      chatId,
      content: input,
      role: "user",
      createdAt: Date.now(),
      hasAttachment: !!imageFile,
      attachment: imageFile ? {
        type: imageFile.type.startsWith('image/') ? 'image' : 'file',
        name: imageFile.name,
        preview: selectedImage
      } : undefined,
      isTemporary: true
    };
    
    // Add optimistic message to the UI
    setMessages(prev => [...prev, optimisticUserMessage]);
    
    // Reset input field but keep the image if any
    setInput('');

    try {
      // Convert all messages including the new one to BaseMessage format
      const messagesToProcess = [...messages, optimisticUserMessage]
        .map(msg => {
          if (!msg.content) return null;
          return msg.role === "user" 
            ? new HumanMessage(msg.content) 
            : new AIMessage(msg.content);
        })
        .filter((msg): msg is HumanMessage | AIMessage => msg !== null);

      if (messagesToProcess.length === 0) {
        throw new Error("No messages with content to process");
      }

      // Process messages
      const stream = await submitQuestion(messagesToProcess, chatId, user?.id);
      if (!stream) {
        throw new Error("Failed to get response stream");
      }

      let fullResponse = "";
      let toolResponse = "";
      
      for await (const chunk of stream) {
        if (typeof chunk === "string") {
          fullResponse += chunk;
          setStreamedResponse(fullResponse);
        } else if (chunk instanceof AIMessage) {
          // Extract and handle tool calls if present
          if (chunk.tool_calls && chunk.tool_calls.length > 0) {
            const toolCall = chunk.tool_calls[0];
            setCurrentTool({
              name: toolCall.name,
              input: toolCall.args
            });
            
            // Format tool output for display
            // Note: Actual tool output will be in a subsequent message
            toolResponse = formatTerminalOutput(
              toolCall.name,
              toolCall.args,
              "Tool response will appear here when complete"
            );
          } else if (chunk.additional_kwargs?.tool_response) {
            // Handle tool response if available
            const toolResponseData = chunk.additional_kwargs.tool_response;
            if (currentTool) {
              // Use a type-safe approach to access the response content
              const responseContent = typeof toolResponseData === 'object' && toolResponseData !== null
                ? 'content' in toolResponseData
                  ? toolResponseData.content
                  : JSON.stringify(toolResponseData)
                : String(toolResponseData);
                
              toolResponse = formatTerminalOutput(
                currentTool.name,
                currentTool.input,
                responseContent
              );
            }
          }
          
          if (typeof chunk.content === "string") {
            fullResponse += chunk.content;
            setStreamedResponse(fullResponse);
          }
        }
      }

      // Add the AI response to messages
      if (fullResponse || toolResponse) {
        const finalContent = toolResponse 
          ? `${fullResponse}\n\n${toolResponse}` 
          : fullResponse;
          
        setMessages(prev => [...prev, {
          _id: `ai_${Date.now()}`,
          chatId,
          content: finalContent,
          role: "assistant",
          createdAt: Date.now()
        }]);
        
        // Clear streamed response after adding the final message
        setStreamedResponse("");
      }

    } catch (error) {
      console.error("Error processing message:", error);
      setError(error instanceof Error ? error.message : "An error occurred");
      // Remove the optimistic message on error
      setMessages(prev => prev.filter(msg => msg._id !== optimisticUserMessage._id));
    } finally {
      setIsLoading(false);
      setIsTyping(false);
      setImageFile(null);
      setSelectedImage(null);
      setCurrentTool(null);
    }
  };

  return (
    <main className="flex flex-col h-[calc(100vh-theme(spacing.14))] relative">
      <StarsBackground />
      <section className="flex-1 overflow-y-auto bg-gray-50 p-2 md:p-0">
        <div className="max-w-4xl mx-auto p-4 space-y-3">
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
              {error}
            </div>
          )}
          
          {messages?.length === 0 && <WelcomeMessage />}

          {messages?.map((message) => {
            // Use type narrowing to determine if the message has attachments
            const hasAttachment = 'hasAttachment' in message ? message.hasAttachment : false;
            const attachment = 'attachment' in message ? message.attachment : undefined;
            
            // Use BookFormatting for AI messages, and regular MessageBubble for user messages
            return message.role === "assistant" ? (
              <BookFormatting
                key={message._id}
                content={message.content}
                title={`Response to ${messages.find(m => m.role === "user" && m._id !== message._id)?.content.substring(0, 30) || "Your Question"}...`}
                onRetry={() => retryMessage(message._id)}
              />
            ) : (
              <MessageBubble
                key={message._id}
                content={message.content}
                isUser={true}
                onRetry={() => retryMessage(message._id)}
                attachment={attachment}
                hasAttachment={hasAttachment}
              />
            );
          })}

          {isTyping && (
            <div className="flex items-center space-x-2 text-gray-400">
              <div className="animate-bounce">●</div>
              <div className="animate-bounce delay-100">●</div>
              <div className="animate-bounce delay-200">●</div>
            </div>
          )}

          {/* Only show the streamed response if typing and we have content */}
          {isTyping && streamedResponse && (
            <BookFormatting 
              content={streamedResponse} 
              title="Working on your response..."
            />
          )}

          {isLoading && !streamedResponse && (
            <div className="flex justify-start animate-in fade-in-0">
              <div className="rounded-2xl px-4 py-3 bg-white text-gray-900 rounded-bl-none shadow-sm ring-1 ring-inset ring-gray-200">
                <div className="flex items-center gap-1.5">
                  {[0.3, 0.15, 0].map((delay, i) => (
                    <div
                      key={i}
                      className="h-1.5 w-1.5 rounded-full bg-gray-400 animate-bounce"
                      style={{ animationDelay: `-${delay}s` }}
                    />
                  ))}
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </section>

      <footer className="border-t bg-white p-4">
        <div className="max-w-4xl mx-auto mb-2">
          <ToolsGuide />
        </div>
        
        {/* File Upload Preview */}
        {selectedImage && (
          <div className="max-w-4xl mx-auto mb-3">
            <div className="bg-white rounded-lg p-2 border flex items-center">
              <div className="w-14 h-14 mr-3 flex-shrink-0">
                {imageFile?.type.startsWith('image/') ? (
                  <img 
                    src={selectedImage} 
                    alt="Preview" 
                    className="h-full w-full object-cover rounded"
                  />
                ) : (
                  <div className="h-full w-full flex items-center justify-center bg-gray-100 rounded">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-500">
                      <path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/>
                      <path d="M14 2v4a2 2 0 0 0 2 2h4"/>
                    </svg>
                  </div>
                )}
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium truncate">{imageFile?.name}</p>
                <p className="text-xs text-gray-500">
                  {(imageFile?.size && imageFile.size < 1024 * 1024) 
                    ? `${(imageFile.size / 1024).toFixed(1)} KB` 
                    : `${(imageFile?.size ? (imageFile.size / (1024 * 1024)).toFixed(1) : 0)} MB`}
                </p>
              </div>
              <button 
                onClick={() => {
                  setImageFile(null);
                  setSelectedImage(null);
                }}
                className="ml-2 text-gray-500 hover:text-gray-700"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18 6 6 18"/>
                  <path d="m6 6 12 12"/>
                </svg>
              </button>
            </div>
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="max-w-4xl mx-auto relative">
          <div className="relative flex items-center">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Message AI Agent..."
              className="w-full py-3 pl-12 pr-16 rounded-2xl border focus:ring-2 disabled:opacity-50"
              disabled={isLoading}
            />
            {/* Hidden file input */}
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleFileChange} 
              accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.txt"
              className="hidden" 
            />
            {/* Paperclip button */}
            <button
              type="button"
              aria-label="Add files"
              className="absolute left-4 flex items-center justify-center text-center font-medium cursor-pointer outline-hidden focus-visible:ring-3 whitespace-nowrap transition-colors focus-visible:ring-default focus-visible:ring-offset-1 aria-disabled:text-hint aria-disabled:bg-state-disabled aria-disabled:cursor-not-allowed aria-busy:cursor-wait aria-busy:text-transparent bg-state-soft hover:bg-state-soft-hover active:bg-state-soft-press gap-1 text-sm p-0 rounded-md size-8 text-icon-default-subtle"
              onClick={() => fileInputRef.current?.click()}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-paperclip size-[18px]">
                <path d="M13.234 20.252 21 12.3"></path>
                <path d="m16 6-8.414 8.586a2 2 0 0 0 0 2.828 2 2 0 0 0 2.828 0l8.414-8.586a4 4 0 0 0 0-5.656 4 4 0 0 0-5.656 0l-8.415 8.585a6 6 0 1 0 8.486 8.486"></path>
              </svg>
            </button>
            <Button
              type="submit"
              disabled={isLoading || (!input.trim() && !imageFile)}
              className="absolute right-2 top-2"
            >
              <ArrowRight className={isLoading ? "animate-spin" : ""} />
            </Button>
          </div>
        </form>
      </footer>
    </main>
  );
}
