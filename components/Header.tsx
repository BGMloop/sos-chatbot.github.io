"use client";

import { Suspense } from "react";
import dynamic from "next/dynamic";
import { PanelLeft } from "lucide-react";
import { useNavigation } from "@/lib/context/navigation";
import { cn } from "@/lib/utils";

const UserButton = dynamic(
  () => import("@clerk/nextjs").then((mod) => mod.UserButton),
  { ssr: false }
);

export default function Header() {
  const { toggleSidebar, isSidebarOpen } = useNavigation();

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white/80 backdrop-blur-sm">
      <div className="flex h-14 items-center justify-between px-4">
        <div className="flex items-center gap-4">
          <button
            onClick={toggleSidebar}
            className="group relative inline-flex h-9 w-9 items-center justify-center rounded-lg transition-all duration-200 hover:-translate-y-0.5"
            aria-label="Toggle Sidebar"
          >
            <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-indigo-600 to-black opacity-0 group-hover:opacity-10 transition-opacity" />
            <PanelLeft className={cn(
              "h-5 w-5 transition-transform duration-200",
              isSidebarOpen ? "rotate-180 text-indigo-600" : "text-gray-600"
            )} />
          </button>
          <div className="font-semibold text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-black">
            SOS ChatBot
          </div>
        </div>
        <Suspense fallback={<div className="h-8 w-8 rounded-full bg-gray-200 animate-pulse" />}>
          <UserButton afterSignOutUrl="/" />
        </Suspense>
      </div>
    </header>
  );
}

