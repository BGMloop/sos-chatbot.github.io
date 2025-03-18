"use client";

import { useRouter } from "next/navigation";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { PlusIcon } from "@radix-ui/react-icons";
import { MessageSquarePlus, ArrowRight, PanelLeftClose, Wrench, BookOpen, Settings, Home, Database, FileText } from "lucide-react";
import { Doc, Id } from "@/convex/_generated/dataModel";
import { cn } from "@/lib/utils";
import { useNavigation } from "@/lib/context/navigation";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import ToolStatusBadge from "@/components/ToolStatusBadge";

function ChatRow({
  chat,
  onDelete,
}: {
  chat: Doc<"chats">;
  onDelete: (id: Id<"chats">) => void;
}) {
  const router = useRouter();
  const { closeSidebar } = useNavigation();
  const lastMessage = useQuery(api.messages.getLastMessage, {
    chatId: chat._id,
  });

  const handleClick = () => {
    router.push(`/dashboard/chat/${chat._id}`);
    closeSidebar();
  };

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={handleClick}
      onKeyDown={(e) => e.key === 'Enter' && handleClick()}
      className="group/item relative flex min-h-12 w-full shrink-0 flex-row items-center justify-between gap-3 rounded-lg p-2 text-gray-600 transition-all duration-200 hover:bg-gradient-to-r hover:from-indigo-50 hover:to-gray-50 hover:text-gray-900 cursor-pointer hover:shadow-sm"
    >
      <div className="block min-h-5 w-full flex-1 flex-row items-center justify-between truncate pl-1 text-sm leading-5.5">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-r from-indigo-600/10 to-black/10">
            <MessageSquarePlus className="h-4 w-4 text-indigo-600" />
          </div>
          <span className="truncate font-medium text-left">
            {lastMessage ? (
              <>
                {lastMessage.role === "user" ? "You: " : "AI: "}
                {lastMessage.content.replace(/\\n/g, "\n")}
              </>
            ) : (
              "New conversation"
            )}
          </span>
        </div>
      </div>
      <div className="flex items-center gap-1 opacity-0 group-hover/item:opacity-100 transition-opacity">
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete(chat._id);
          }}
          className="group relative inline-flex h-8 w-8 items-center justify-center rounded-full text-gray-400 transition-colors hover:text-red-500"
        >
          <div className="absolute inset-0 rounded-full bg-gradient-to-r from-red-600/10 to-red-900/10 opacity-0 group-hover:opacity-100 transition-opacity" />
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 6h18"></path>
            <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path>
            <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path>
          </svg>
        </button>
      </div>
    </div>
  );
}

export default function Sidebar() {
  const router = useRouter();
  const { isSidebarOpen, closeSidebar } = useNavigation();

  const chats = useQuery(api.chats.listChats);
  const createChat = useMutation(api.chats.createChat);
  const deleteChat = useMutation(api.chats.deleteChat);

  const handleNewChat = async () => {
    const chatId = await createChat({ title: "New Chat" });
    router.push(`/dashboard/chat/${chatId}`);
    closeSidebar();
  };

  const handleDeleteChat = async (id: Id<"chats">) => {
    await deleteChat({ id });
    if (window.location.pathname.includes(id)) {
      router.push("/dashboard");
    }
  };

  return (
    <>
      {/* Overlay for mobile */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 md:hidden"
          onClick={closeSidebar}
        />
      )}
      
      <aside
        className={cn(
          "fixed md:relative md:inset-y-0 top-14 bottom-0 left-0 z-50 bg-white border-r transform transition-all duration-300 ease-in-out flex flex-col shadow-lg md:shadow-none",
          isSidebarOpen ? "w-72" : "w-0",
          "overflow-hidden"
        )}
      >
        <div className="flex h-full flex-col min-w-[288px]">
          <div className="p-4">
            <button
              onClick={handleNewChat}
              className="group relative inline-flex h-10 w-full items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-indigo-600 to-black px-4 py-2 text-sm font-medium text-white transition-all duration-200 hover:from-indigo-500 hover:to-black hover:shadow-md hover:-translate-y-0.5"
            >
              <PlusIcon className="h-4 w-4" />
              New Chat
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-indigo-600/20 to-black/20 blur-xl opacity-0 group-hover:opacity-100 transition-opacity" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto px-2">
            <div className="space-y-1">
              {chats?.map((chat) => (
                <ChatRow key={chat._id} chat={chat} onDelete={handleDeleteChat} />
              ))}
            </div>
          </div>

          {/* Knowledge section */}
          <div className="mt-4 px-4">
            <div className="flex items-center justify-between">
              <span className="font-semibold">Knowledge</span>
            </div>
            <div className="mt-2 space-y-1 px-2">
              <Button variant="ghost" className="w-full justify-start gap-2" asChild>
                <Link href="/knowledge">
                  <Database className="h-4 w-4" />
                  Manage Knowledge
                </Link>
              </Button>
            </div>
          </div>

          {/* Tools section */}
          <div className="mt-4 px-4">
            <div className="flex items-center justify-between">
              <span className="font-semibold">Tools</span>
              <ToolStatusBadge />
            </div>
            <div className="mt-2 space-y-1 px-2">
              <Button variant="ghost" className="w-full justify-start gap-2" asChild>
                <Link href="/dashboard/tools">
                  <Wrench className="h-4 w-4" />
                  Test Tools
                </Link>
              </Button>
              <Button variant="ghost" className="w-full justify-start gap-2" asChild>
                <Link href="/dashboard/tools/docs">
                  <BookOpen className="h-4 w-4" />
                  Tool Documentation
                </Link>
              </Button>
              <Button variant="ghost" className="w-full justify-start gap-2" asChild>
                <Link href="/dashboard/tools/status">
                  <Settings className="h-4 w-4" />
                  Tool Status
                </Link>
              </Button>
            </div>
          </div>

          {/* Dashboard button */}
          <div className="p-4 mt-auto border-t">
            <Button variant="outline" className="w-full justify-start gap-2" asChild>
              <Link href="/dashboard">
                <Home className="h-4 w-4" />
                Back to Dashboard
              </Link>
            </Button>
          </div>
        </div>
      </aside>
    </>
  );
}
