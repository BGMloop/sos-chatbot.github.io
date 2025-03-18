"use client";

import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { ArrowLeft, Settings, Share2 } from "lucide-react";

interface ChatHeaderProps {
  title?: string;
  onSettingsClick?: () => void;
  onShareClick?: () => void;
}

export default function ChatHeader({
  title = "Chat",
  onSettingsClick,
  onShareClick,
}: ChatHeaderProps) {
  const router = useRouter();

  return (
    <div className="flex items-center justify-between px-4 py-2 border-b">
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => router.push("/dashboard")}
          className="hover:bg-gray-100 dark:hover:bg-gray-800"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h2 className="text-lg font-semibold">{title}</h2>
      </div>
      <div className="flex items-center gap-2">
        {onShareClick && (
          <Button
            variant="ghost"
            size="icon"
            onClick={onShareClick}
            className="hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            <Share2 className="h-5 w-5" />
          </Button>
        )}
        {onSettingsClick && (
          <Button
            variant="ghost"
            size="icon"
            onClick={onSettingsClick}
            className="hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            <Settings className="h-5 w-5" />
          </Button>
        )}
      </div>
    </div>
  );
} 