"use client";
import { useRouter, usePathname } from "next/navigation";
import { useNavigation } from "@/lib/context/navigation";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { MessageSquarePlus, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import TimeAgo from "react-timeago";
// Function to truncate text to a specific number of words
const truncateToWords = (text, wordCount) => {
    const words = text.split(' ');
    if (words.length <= wordCount)
        return text;
    return words.slice(0, wordCount).join(' ') + '...';
};
function ChatRow({ chat, onDelete, }) {
    const router = useRouter();
    const pathname = usePathname();
    const { closeSidebar } = useNavigation();
    const lastMessage = useQuery(api.messages.getLastMessage, {
        chatId: chat._id,
    });
    const isActive = pathname === `/dashboard/chat/${chat._id}`;
    const handleClick = () => {
        if (!isActive) {
            router.push(`/dashboard/chat/${chat._id}`);
            closeSidebar();
        }
    };
    const handleDelete = (e) => {
        e.stopPropagation();
        onDelete(chat._id);
    };
    const handleKeyDown = (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
            handleClick();
        }
    };
    const handleDeleteKeyDown = (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
            e.stopPropagation();
            onDelete(chat._id);
        }
    };
    // Get the message content and truncate it
    const messageContent = lastMessage
        ? `${lastMessage.role === "user" ? "You: " : "AI: "}${lastMessage.content.replace(/\\n/g, "\n")}`
        : "New conversation";
    const truncatedMessage = truncateToWords(messageContent, 4);
    return (<div role="button" tabIndex={0} onClick={handleClick} onKeyDown={handleKeyDown} className={cn("group relative flex min-h-[60px] w-full items-center gap-3 rounded-xl p-3 transition-all duration-200 hover:bg-gradient-to-r hover:from-indigo-50/80 hover:to-gray-50/80", "cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2", isActive && "bg-gradient-to-r from-indigo-50 to-gray-50 shadow-sm", !isActive && "text-gray-600 hover:text-gray-900")}>
      <div className="flex items-center gap-2">
        <div className={cn("flex h-10 w-10 shrink-0 items-center justify-center rounded-full transition-all duration-200", isActive ? "bg-gradient-to-r from-indigo-600 to-black" : "bg-gradient-to-r from-indigo-600/10 to-black/10")}>
          <MessageSquarePlus className={cn("h-5 w-5 transition-all duration-200", isActive ? "text-white" : "text-indigo-600")}/>
        </div>
        
        <button type="button" onClick={handleDelete} onKeyDown={handleDeleteKeyDown} className={cn("relative flex h-7 w-7 shrink-0 items-center justify-center rounded-full", "opacity-0 group-hover:opacity-100 transition-opacity duration-200", "focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2", "hover:bg-red-50")} aria-label="Delete chat">
          <Trash2 className="h-4 w-4 text-gray-400 hover:text-red-500"/>
        </button>
      </div>

      <div className="min-w-0 flex-1 overflow-hidden">
        <div className="flex items-center justify-between gap-2">
          <p className="truncate text-sm font-medium" title={messageContent}>
            {truncatedMessage}
          </p>
          {lastMessage && (<span className="text-xs text-gray-400 whitespace-nowrap">
              <TimeAgo date={lastMessage.createdAt}/>
            </span>)}
        </div>
        {chat.updatedAt && (<p className="text-xs text-gray-400 truncate">
            Last activity: <TimeAgo date={chat.updatedAt}/>
          </p>)}
      </div>
    </div>);
}
export default ChatRow;
