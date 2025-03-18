"use client";

import Header from "@/components/Header";
import { NavigationProvider } from "@/lib/context/navigation";
import { Authenticated } from "convex/react";
import Sidebar from "@/components/Sidebar";
import StarsBackground from "@/components/StarsBackground";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <NavigationProvider>
      <div className="flex h-screen flex-col relative">
        <StarsBackground />
        
        <Header />
        <div className="flex flex-1 overflow-hidden">
          <Authenticated>
            <Sidebar />
          </Authenticated>
          <main className="flex-1 overflow-y-auto">
            {children}
          </main>
        </div>
      </div>
    </NavigationProvider>
  );
}