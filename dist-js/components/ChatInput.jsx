"use client";
import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Send, Paperclip } from "lucide-react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
export default function ChatInput({ chatId }) {
    var _a, _b;
    const [message, setMessage] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const fileInputRef = useRef(null);
    const sendMessage = useMutation(api.messages.send);
    const handleSubmit = async (e) => {
        var _a, _b;
        e.preventDefault();
        if (!message.trim() && !((_b = (_a = fileInputRef.current) === null || _a === void 0 ? void 0 : _a.files) === null || _b === void 0 ? void 0 : _b.length))
            return;
        setIsSubmitting(true);
        try {
            await sendMessage({
                chatId,
                content: message
            });
            setMessage("");
        }
        catch (error) {
            console.error("Failed to send message:", error);
        }
        finally {
            setIsSubmitting(false);
        }
    };
    const handleKeyDown = (e) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSubmit(e);
        }
    };
    return (<form onSubmit={handleSubmit} className="p-4 border-t">
      <div className="flex items-end gap-2">
        <input type="file" ref={fileInputRef} className="hidden" onChange={() => { }}/>
        <Button type="button" variant="ghost" size="icon" onClick={() => { var _a; return (_a = fileInputRef.current) === null || _a === void 0 ? void 0 : _a.click(); }} className="hover:bg-gray-100 dark:hover:bg-gray-800">
          <Paperclip className="h-5 w-5"/>
        </Button>
        <Textarea value={message} onChange={(e) => setMessage(e.target.value)} onKeyDown={handleKeyDown} placeholder="Type your message..." className="flex-1 min-h-[50px] max-h-[200px] resize-none" rows={1}/>
        <Button type="submit" disabled={isSubmitting || (!message.trim() && !((_b = (_a = fileInputRef.current) === null || _a === void 0 ? void 0 : _a.files) === null || _b === void 0 ? void 0 : _b.length))}>
          <Send className="h-5 w-5"/>
        </Button>
      </div>
    </form>);
}
