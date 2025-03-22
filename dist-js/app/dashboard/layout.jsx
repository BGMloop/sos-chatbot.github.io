"use client";
import React from "react";
import { Header } from "@/components/Header";
import { Sidebar } from "@/components/Sidebar";
import { Authenticated } from "@/components/Authenticated";
import StarsBackground from "@/components/StarsBackground";
import ToolsExamples from "@/components/ToolsExamples";
import ChatSettings from "@/components/ChatSettings";
import { FloatingPanel } from "@/components/FloatingPanel";
export default function DashboardLayout({ children, }) {
    return (<Authenticated>
      <div className="flex h-full flex-col">
        {/* Background */}
        <StarsBackground />

        {/* Header */}
        <Header />

        <div className="flex flex-1 overflow-hidden">
          {/* Sidebar */}
          <Sidebar />

          {/* Main Content */}
          <main className="flex-1 overflow-y-auto relative">
            {children}
            
            {/* Floating action panel for quick tools access */}
            <FloatingPanel>
              <ToolsExamples buttonOnly={true}/>
              <ChatSettings buttonOnly={true}/>
            </FloatingPanel>
          </main>
        </div>
      </div>
    </Authenticated>);
}
