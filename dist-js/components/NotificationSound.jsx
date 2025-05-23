"use client";
import { useEffect, useRef, useState } from "react";
import { useMessages } from "@/hooks/useMessages";
/**
 * NotificationSound component
 *
 * NOTE: This component has been disabled as per user request.
 * All sound functionality has been removed to prevent audio issues.
 */
export default function NotificationSound() {
    const audioRef = useRef(null);
    const [audioReady, setAudioReady] = useState(false);
    const { messages, lastMessageTime } = useMessages();
    // Initialize audio element
    useEffect(() => {
        if (typeof window !== 'undefined') {
            const audio = new Audio("/sounds/notification.mp3");
            audio.preload = "auto";
            audioRef.current = audio;
            // Mark as ready when loaded
            audio.addEventListener("canplaythrough", () => {
                setAudioReady(true);
            });
            return () => {
                audio.pause();
                audioRef.current = null;
            };
        }
    }, []);
    // Play sound when new message is received
    useEffect(() => {
        var _a;
        if (!audioReady || !lastMessageTime)
            return;
        // Only play for assistant messages
        const lastMessage = messages === null || messages === void 0 ? void 0 : messages[messages.length - 1];
        if ((lastMessage === null || lastMessage === void 0 ? void 0 : lastMessage.role) === "assistant") {
            (_a = audioRef.current) === null || _a === void 0 ? void 0 : _a.play().catch(err => {
                // Handle play() failures (often due to browser autoplay policies)
                console.log("Could not play notification sound:", err);
            });
        }
    }, [audioReady, messages, lastMessageTime]);
    // Component doesn't render anything
    return null;
}
