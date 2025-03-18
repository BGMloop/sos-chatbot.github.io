"use client";

import { Doc, Id } from "@/convex/_generated/dataModel";
import { useRouter, usePathname } from "next/navigation";
import { useNavigation } from "@/lib/context/navigation";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { MessageSquarePlus, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import TimeAgo from "react-timeago";

function ChatRow({
  chat,
  onDelete,
}: {
  chat: Doc<"chats">;
  onDelete: (id: Id<"chats">) => void;
}) {
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

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDelete(chat._id);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      handleClick();
    }
  };

  const handleDeleteKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.stopPropagation();
      onDelete(chat._id);
    }
  };

  return (
    <div 
      role="button"
      tabIndex={0}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      className={cn(
        "group/item relative flex min-h-[60px] w-full items-center justify-between gap-3 rounded-xl p-3 transition-all duration-200 hover:bg-gradient-to-r hover:from-indigo-50/80 hover:to-gray-50/80",
        "cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2",
        isActive && "bg-gradient-to-r from-indigo-50 to-gray-50 shadow-sm",
        !isActive && "text-gray-600 hover:text-gray-900"
      )}
    >
      <div className="flex w-full items-center gap-3 overflow-hidden">
        <div className={cn(
          "flex h-10 w-10 shrink-0 items-center justify-center rounded-full transition-all duration-200",
          isActive ? "bg-gradient-to-r from-indigo-600 to-black" : "bg-gradient-to-r from-indigo-600/10 to-black/10"
        )}>
          <MessageSquarePlus className={cn(
            "h-5 w-5 transition-all duration-200",
            isActive ? "text-white" : "text-indigo-600"
          )} />
        </div>
        
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-2">
            <p className="truncate text-sm font-medium">
              {lastMessage ? (
                <>
                  {lastMessage.role === "user" ? "You: " : "AI: "}
                  {lastMessage.content.replace(/\\n/g, "\n")}
                </>
              ) : (
                "New conversation"
              )}
            </p>
            {lastMessage && (
              <span className="hidden text-xs text-gray-400 group-hover:block">
                <TimeAgo date={lastMessage.createdAt} />
              </span>
            )}
          </div>
        </div>
      </div>

      <div
        role="button"
        tabIndex={0}
        onClick={handleDelete}
        onKeyDown={handleDeleteKeyDown}
        className={cn(
          "group/delete relative ml-2 flex h-8 w-8 shrink-0 items-center justify-center rounded-full",
          "opacity-0 transition-all duration-200 group-hover:opacity-100",
          "focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2",
          "hover:bg-red-50"
        )}
        aria-label="Delete chat"
      >
        <Trash2 className="h-4 w-4 text-gray-400 transition-colors group-hover/delete:text-red-500" />
      </div>
    </div>
  );
}

export default ChatRow;
