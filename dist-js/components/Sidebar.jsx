"use client";
import React, { useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { useUser } from '@clerk/nextjs';
import { useNavigation } from '@/lib/context/navigation';
import { useQuery, useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { Plus, X, Home, ImageIcon, Book, Settings, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import ChatRow from '@/components/ChatRow';
export function Sidebar() {
    const { user } = useUser();
    const router = useRouter();
    const pathname = usePathname();
    const { isSidebarOpen, toggleSidebar } = useNavigation();
    const [searchQuery, setSearchQuery] = useState("");
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [chatToDelete, setChatToDelete] = useState(null);
    // Get all chats for the current user
    const chats = useQuery(api.chats.listChats);
    // Mutations
    const createNewChat = useMutation(api.chats.createChat);
    const deleteChat = useMutation(api.chats.deleteChat);
    // Handle search input
    const filteredChats = (chats === null || chats === void 0 ? void 0 : chats.filter((chat) => { var _a; return (_a = chat.title) === null || _a === void 0 ? void 0 : _a.toLowerCase().includes(searchQuery.toLowerCase()); })) || [];
    // Handle new chat creation
    const handleCreateChat = async () => {
        if (!(user === null || user === void 0 ? void 0 : user.id))
            return;
        try {
            const newChatId = await createNewChat({
                title: "New Chat"
            });
            // Navigate to the new chat
            router.push(`/dashboard/chat/${newChatId}`);
        }
        catch (error) {
            console.error("Error creating chat:", error);
        }
    };
    // Handle delete chat
    const handleDeleteChat = async () => {
        if (!chatToDelete)
            return;
        try {
            await deleteChat({ id: chatToDelete });
            setChatToDelete(null);
            setIsDeleteDialogOpen(false);
            // If we deleted the current chat, navigate back to dashboard
            if (pathname.includes(chatToDelete.toString())) {
                router.push('/dashboard');
            }
        }
        catch (error) {
            console.error("Error deleting chat:", error);
        }
    };
    // Handle delete chat from ChatRow component
    const handleDeleteChatFromRow = (id) => {
        setChatToDelete(id);
        setIsDeleteDialogOpen(true);
    };
    // If sidebar is closed, just show the toggle button
    if (!isSidebarOpen) {
        return null;
    }
    // Otherwise show the full sidebar
    return (<>
      <aside className="w-80 border-r bg-background h-full relative flex flex-col">
        {/* Sidebar Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="font-semibold">Conversations</h2>
          <Button variant="ghost" size="icon" onClick={toggleSidebar} className="md:hidden">
            <X className="h-5 w-5"/>
          </Button>
        </div>
        
        {/* New Chat Button */}
          <div className="p-4">
          <Button onClick={handleCreateChat} className="w-full justify-start">
            <Plus className="h-5 w-5 mr-2"/>
              New Chat
          </Button>
          </div>

        {/* Search */}
        <div className="px-4 mb-2">
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground"/>
            <Input placeholder="Search conversations..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-8"/>
          </div>
        </div>
        
        {/* Chat List */}
        <ScrollArea className="flex-1 px-4">
          <div className="space-y-2 py-2">
            {filteredChats.length > 0 ? (filteredChats.map((chat) => (<ChatRow key={chat._id.toString()} chat={chat} onDelete={handleDeleteChatFromRow}/>))) : (<div className="text-center py-4 text-muted-foreground">
                {searchQuery
                ? "No chats found"
                : "No conversations yet"}
              </div>)}
          </div>
        </ScrollArea>
        
        {/* Navigation */}
        <div className="border-t p-4">
          <nav className="space-y-2">
            <Link href="/dashboard" className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-accent">
              <Home className="h-5 w-5"/>
              Home
            </Link>
            <Link href="/calories" className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-accent">
              <ImageIcon className="h-5 w-5"/>
              Calorie Tracker
                </Link>
            <Link href="/knowledge" className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-accent">
              <Book className="h-5 w-5"/>
              Knowledge Base
                </Link>
            <Link href="/settings" className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-accent">
              <Settings className="h-5 w-5"/>
              Settings
                </Link>
          </nav>
            </div>
      </aside>
      
      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Delete Chat</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p>Are you sure you want to delete this chat? This action cannot be undone.</p>
          </div>
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteChat}>
              Delete
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>);
}
