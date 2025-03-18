"use client";

import { Id } from "@/convex/_generated/dataModel";
import ChatHeader from "@/components/ChatHeader";
import ChatInterface from "@/components/ChatInterface";
import { useState, useEffect } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import * as Dialog from "@radix-ui/react-dialog";
import { Button } from "@/components/ui/button";
import { Check, Copy, Facebook, Link, Twitter, Moon, Sun, Volume2, VolumeX, MessageSquare } from "lucide-react";

interface ChatContainerProps {
  chatId: Id<"chats">;
  title: string;
}

export default function ChatContainer({ chatId, title }: ChatContainerProps) {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isShareOpen, setIsShareOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  
  // Initialize settings from localStorage if available, otherwise use defaults
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      const savedDarkMode = localStorage.getItem('chatDarkMode');
      return savedDarkMode ? JSON.parse(savedDarkMode) : false;
    }
    return false;
  });
  
  const [soundEnabled, setSoundEnabled] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      const savedSound = localStorage.getItem('chatSoundEnabled');
      return savedSound ? JSON.parse(savedSound) : true;
    }
    return true;
  });
  
  const [fontSize, setFontSize] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('chatFontSize') || 'medium';
    }
    return 'medium';
  });
  
  const messages = useQuery(api.messages.list, { chatId }) || [];

  // Apply dark mode when the setting changes
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('chatDarkMode', JSON.stringify(darkMode));
      
      // Apply dark mode to the document
      if (darkMode) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    }
  }, [darkMode]);

  // Persist sound setting
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('chatSoundEnabled', JSON.stringify(soundEnabled));
    }
  }, [soundEnabled]);

  // Persist and apply font size
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('chatFontSize', fontSize);
      
      // Apply font size to chat container
      const chatContainer = document.querySelector('.chat-container');
      if (chatContainer) {
        // Remove existing font size classes
        chatContainer.classList.remove('text-sm', 'text-base', 'text-lg');
        
        // Add the appropriate class based on the selected font size
        switch (fontSize) {
          case 'small':
            chatContainer.classList.add('text-sm');
            break;
          case 'medium':
            chatContainer.classList.add('text-base');
            break;
          case 'large':
            chatContainer.classList.add('text-lg');
            break;
        }
      }
    }
  }, [fontSize]);

  // Function to play notification sound
  const playNotificationSound = () => {
    if (soundEnabled && typeof window !== 'undefined') {
      // Create and play a simple notification sound
      const audio = new Audio('/notification.mp3');
      audio.play().catch(err => console.error('Failed to play notification sound:', err));
    }
  };

  const handleSettingsClick = () => {
    setIsSettingsOpen(true);
  };

  const handleShareClick = () => {
    setIsShareOpen(true);
  };

  const shareUrl = typeof window !== 'undefined' 
    ? `${window.location.origin}/dashboard/chat/${chatId}`
    : '';

  const copyToClipboard = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    
    // Play a sound when copied (as an example of the sound feature)
    playNotificationSound();
  };

  const shareToTwitter = () => {
    window.open(`https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=Check out this conversation on SOS Chatbot!`, '_blank');
  };

  const shareToFacebook = () => {
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`, '_blank');
  };

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  const toggleSound = () => {
    setSoundEnabled(!soundEnabled);
    
    // Play a test sound when enabling sounds
    if (!soundEnabled) {
      setTimeout(playNotificationSound, 300);
    }
  };

  const handleFontSizeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setFontSize(e.target.value);
  };

  return (
    <div className={`flex-1 flex flex-col chat-container ${
      fontSize === 'small' ? 'text-sm' : 
      fontSize === 'large' ? 'text-lg' : 
      'text-base'
    } ${darkMode ? 'dark bg-gray-900 text-white' : 'bg-white text-gray-900'}`}>
      <ChatHeader 
        title={title} 
        onSettingsClick={handleSettingsClick}
        onShareClick={handleShareClick}
      />
      <ChatInterface chatId={chatId} initialMessages={messages} />

      {/* Share Dialog */}
      <Dialog.Root open={isShareOpen} onOpenChange={setIsShareOpen}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-black/30" />
          <Dialog.Content className={`fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 ${darkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'} rounded-lg p-6 shadow-lg max-w-md w-full`}>
            <Dialog.Title className="text-lg font-medium">Share this conversation</Dialog.Title>
            <Dialog.Description className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-500'} mt-2`}>
              Anyone with the link will be able to view this conversation.
            </Dialog.Description>
            
            <div className="flex items-center space-x-2 mt-4">
              <div className="grid flex-1 gap-2">
                <div className={`${darkMode ? 'bg-gray-700' : 'bg-gray-100'} p-2 rounded-md flex items-center`}>
                  <Link className={`h-4 w-4 mr-2 ${darkMode ? 'text-gray-300' : 'text-gray-500'}`} />
                  <span className={`text-sm ${darkMode ? 'text-gray-200' : 'text-gray-700'} truncate flex-1`}>{shareUrl}</span>
                </div>
              </div>
              <Button size="sm" className="px-3" onClick={copyToClipboard}>
                {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                <span className="sr-only">Copy</span>
              </Button>
            </div>
            
            <div className="flex justify-center gap-4 mt-4">
              <Button variant={darkMode ? "default" : "outline"} className="flex items-center gap-2" onClick={shareToTwitter}>
                <Twitter className="h-4 w-4" />
                Twitter
              </Button>
              <Button variant={darkMode ? "default" : "outline"} className="flex items-center gap-2" onClick={shareToFacebook}>
                <Facebook className="h-4 w-4" />
                Facebook
              </Button>
            </div>
            
            <div className="mt-4 flex justify-end">
              <Button variant="secondary" onClick={() => setIsShareOpen(false)}>
                Close
              </Button>
            </div>
            
            <Dialog.Close asChild>
              <button
                className={`absolute top-4 right-4 inline-flex items-center justify-center rounded-full h-6 w-6 ${darkMode ? 'text-gray-300 hover:text-gray-100' : 'text-gray-500 hover:text-gray-700'}`}
                aria-label="Close"
              >
                ✕
              </button>
            </Dialog.Close>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>

      {/* Settings Dialog */}
      <Dialog.Root open={isSettingsOpen} onOpenChange={setIsSettingsOpen}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-black/30" />
          <Dialog.Content className={`fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 ${darkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'} rounded-lg p-6 shadow-lg max-w-md w-full`}>
            <Dialog.Title className="text-lg font-medium">Chat Settings</Dialog.Title>
            <Dialog.Description className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-500'} mt-2`}>
              Customize your chat experience.
            </Dialog.Description>
            
            <div className="mt-6 space-y-4">
              {/* Dark Mode Toggle */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {darkMode ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
                  <span className="text-sm font-medium">Dark Mode</span>
                </div>
                <button 
                  onClick={toggleDarkMode} 
                  className={`relative inline-flex h-6 w-11 items-center rounded-full ${darkMode ? 'bg-blue-600' : 'bg-gray-200'}`}
                >
                  <span className="sr-only">Toggle dark mode</span>
                  <span 
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${darkMode ? 'translate-x-6' : 'translate-x-1'}`} 
                  />
                </button>
              </div>
              
              {/* Sound Toggle */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {soundEnabled ? <Volume2 className="h-5 w-5" /> : <VolumeX className="h-5 w-5" />}
                  <span className="text-sm font-medium">Notification Sounds</span>
                </div>
                <button 
                  onClick={toggleSound} 
                  className={`relative inline-flex h-6 w-11 items-center rounded-full ${soundEnabled ? 'bg-blue-600' : 'bg-gray-200'}`}
                >
                  <span className="sr-only">Toggle sounds</span>
                  <span 
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${soundEnabled ? 'translate-x-6' : 'translate-x-1'}`} 
                  />
                </button>
              </div>
              
              {/* Font Size */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <MessageSquare className="h-5 w-5" />
                  <span className="text-sm font-medium">Font Size</span>
                </div>
                <select 
                  value={fontSize} 
                  onChange={handleFontSizeChange}
                  className={`${darkMode ? 'bg-gray-700 text-white' : 'bg-gray-100 text-gray-900'} rounded-md border-0 py-1.5 pl-3 pr-10 text-sm`}
                >
                  <option value="small">Small</option>
                  <option value="medium">Medium</option>
                  <option value="large">Large</option>
                </select>
              </div>
            </div>
            
            <div className="mt-6 flex justify-end">
              <Button variant="secondary" onClick={() => setIsSettingsOpen(false)}>
                Close
              </Button>
            </div>
            
            <Dialog.Close asChild>
              <button
                className={`absolute top-4 right-4 inline-flex items-center justify-center rounded-full h-6 w-6 ${darkMode ? 'text-gray-300 hover:text-gray-100' : 'text-gray-500 hover:text-gray-700'}`}
                aria-label="Close"
              >
                ✕
              </button>
            </Dialog.Close>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </div>
  );
} 