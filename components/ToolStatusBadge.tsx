"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

export default function ToolStatusBadge() {
  const toolStatus = useQuery(api.tools.getToolStatus);
  
  const status = toolStatus?.status || "unknown";
  const message = toolStatus?.message || `Tools are ${status}`;
  
  const statusColors = {
    online: "bg-green-500 hover:bg-green-600",
    offline: "bg-red-500 hover:bg-red-600",
    degraded: "bg-yellow-500 hover:bg-yellow-600",
    unknown: "bg-gray-500 hover:bg-gray-600"
  };

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Badge 
            className={cn(
              "ml-auto h-2 w-2 rounded-full", 
              statusColors[status as keyof typeof statusColors] || statusColors.unknown
            )}
            variant="outline"
          />
        </TooltipTrigger>
        <TooltipContent>
          <p>{message}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
} 