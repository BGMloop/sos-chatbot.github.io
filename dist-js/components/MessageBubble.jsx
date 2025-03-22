"use client";
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { RefreshCw, Copy, Check } from "lucide-react";
import Image from "next/image";
import { useUser } from "@clerk/nextjs";
import { useTheme } from "@/lib/context/theme";
function extractHtmlContent(content) {
    if (!content)
        return null;
    // Special handling for content that has our terminal HTML format
    if (content.includes("---START---") && content.includes("---END---")) {
        const parts = content.split(/(---START---|---END---)/g);
        return (<>
        {parts.map((part, index) => {
                if (part === "---START---" || part === "---END---")
                    return null;
                if (part.trim().startsWith("<div")) {
                    return <div key={index} dangerouslySetInnerHTML={{ __html: part }}/>;
                }
                return part ? <p key={index}>{part}</p> : null;
            })}
      </>);
    }
    // Regular content
    return <p>{content}</p>;
}
export function MessageBubble({ content, isUser = false, onRetry, hasAttachment = false, attachment }) {
    var _a;
    const [copied, setCopied] = useState(false);
    const { user } = useUser();
    const { fontSize, textColor, bubbleColor } = useTheme();
    const copyToClipboard = () => {
        if (!content)
            return;
        // Remove HTML tags for cleaner clipboard content
        const plainText = content.replace(/<[^>]*>/g, '');
        navigator.clipboard.writeText(plainText)
            .then(() => {
            setCopied(true);
            setTimeout(() => setCopied(false), 2000); // Reset after 2 seconds
        })
            .catch(err => {
            console.error('Failed to copy text: ', err);
        });
    };
    return (<div className={`flex items-start gap-2 ${isUser ? "justify-end" : "justify-start"} animate-in fade-in-0`}>
      {/* Bot avatar - only shown when not a user message */}
      {!isUser && (<div className="w-10 h-10 rounded-full overflow-hidden flex-shrink-0">
          <Image src="/logo/logo.png" alt="Bot" width={70} height={70} className="object-cover"/>
        </div>)}
      
      <div style={{
            fontSize: `${fontSize}px`,
            color: isUser ? 'white' : textColor,
            backgroundColor: isUser ? bubbleColor : 'white',
        }} className={`rounded-2xl px-4 py-3 ${isUser
            ? "rounded-br-none"
            : "rounded-bl-none shadow-sm ring-1 ring-inset ring-gray-200"}`}>
        {extractHtmlContent(content)}
        
        {/* Display attachment if present */}
        {hasAttachment && attachment && (<div className="mt-2">
            {attachment.type === 'image' && attachment.preview && (<div className="mt-2 rounded-lg overflow-hidden border">
                <img src={attachment.preview} alt={attachment.name} className="max-w-full object-contain max-h-64 w-auto h-auto"/>
              </div>)}
            
            {attachment.type === 'file' && (<div className="flex items-center gap-2 p-2 rounded-lg border mt-2">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/>
                  <path d="M14 2v4a2 2 0 0 0 2 2h4"/>
                </svg>
                <span className="text-sm truncate">{attachment.name}</span>
              </div>)}
          </div>)}
        
        {!isUser && (<div className="mt-2 flex justify-end space-x-2">
            {onRetry && (<Button onClick={onRetry} variant="ghost" size="sm" className="text-xs flex items-center gap-1">
                <RefreshCw className="h-3 w-3"/>
                Retry
              </Button>)}
            <Button onClick={copyToClipboard} variant="ghost" size="sm" className="text-xs flex items-center gap-1" title="Copy to clipboard">
              {copied ? (<><Check className="h-3 w-3"/> Copied</>) : (<><Copy className="h-3 w-3"/> Copy</>)}
            </Button>
          </div>)}
      </div>
      
      {/* User avatar - only shown for user messages */}
      {isUser && (<div className="w-7 h-7 rounded-full overflow-hidden flex-shrink-0">
          {(user === null || user === void 0 ? void 0 : user.imageUrl) ? (<Image src={user.imageUrl} alt="User" width={28} height={28} className="object-cover"/>) : (<div className="w-full h-full flex items-center justify-center text-white" style={{ backgroundColor: bubbleColor }}>
              {(((_a = user === null || user === void 0 ? void 0 : user.firstName) === null || _a === void 0 ? void 0 : _a[0]) || 'U')}
            </div>)}
        </div>)}
    </div>);
}
