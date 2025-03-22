"use client";
import { Suspense } from "react";
import dynamic from "next/dynamic";
import { useNavigation } from "@/lib/context/navigation";
import { PanelLeft, PanelRightClose } from "lucide-react";
import { Button } from "@/components/ui/button";
const UserButton = dynamic(() => import("@clerk/nextjs").then((mod) => mod.UserButton), { ssr: false });
export function Header() {
    const { isSidebarOpen, toggleSidebar } = useNavigation();
    return (<header className="sticky top-0 z-50 w-full border-b bg-white/80 backdrop-blur-sm dark:bg-gray-900/80">
      <div className="flex h-14 items-center justify-between px-4">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={toggleSidebar} aria-label={isSidebarOpen ? "Close sidebar" : "Open sidebar"} className="h-8 w-8" data-state={isSidebarOpen ? "open" : "closed"}>
            {isSidebarOpen ? (<PanelRightClose className="h-4 w-4"/>) : (<PanelLeft className="h-4 w-4"/>)}
          </Button>
          <div className="font-semibold text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-black dark:from-indigo-400 dark:to-white">
            SOS ChatBot
          </div>
        </div>
        <Suspense fallback={<div className="h-8 w-8 rounded-full bg-gray-200 animate-pulse"/>}>
          <UserButton afterSignOutUrl="/"/>
        </Suspense>
      </div>
    </header>);
}
