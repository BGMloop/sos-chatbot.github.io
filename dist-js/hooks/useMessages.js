import { useState, useEffect, useMemo } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
export function useMessages(chatId) {
    const [lastMessageTime, setLastMessageTime] = useState(null);
    // Only query if chatId is provided
    const messages = useQuery(api.messages.list, chatId ? { chatId } : "skip");
    // Memoize messages to prevent unnecessary re-renders
    const memoizedMessages = useMemo(() => messages, [messages]);
    // Track when the last message was received
    useEffect(() => {
        if (memoizedMessages && memoizedMessages.length > 0) {
            const lastMessage = memoizedMessages[memoizedMessages.length - 1];
            const timestamp = lastMessage.timestamp || Date.now();
            setLastMessageTime(timestamp);
        }
    }, [memoizedMessages]);
    return {
        messages: memoizedMessages,
        lastMessageTime,
        isLoading: chatId && !memoizedMessages,
        isEmpty: (memoizedMessages === null || memoizedMessages === void 0 ? void 0 : memoizedMessages.length) === 0
    };
}
