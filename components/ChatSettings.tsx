'use client';

import React, { useState } from 'react';
import { 
  Settings, Moon, Sun, PanelLeft, Type, ChevronLeft, 
  ZoomIn, ZoomOut, Palette, MessageSquare
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { useTheme } from '@/lib/context/theme';
import { useNavigation } from '@/lib/context/navigation';
import Image from "next/image";

interface ChatSettingsProps {
  buttonOnly?: boolean; // If true, only show the button without the floating indicator
}

export default function ChatSettings({ buttonOnly = false }: ChatSettingsProps) {
  const [isOpen, setIsOpen] = useState(false);
  const { isDarkMode, setDarkMode, fontSize, setFontSize, textColor, setTextColor, bubbleColor, setBubbleColor } = useTheme();
  const { isSidebarOpen, toggleSidebar } = useNavigation();

  // Color options
  const colorOptions = [
    { name: 'Blue', value: '#2563eb' },
    { name: 'Purple', value: '#8b5cf6' },
    { name: 'Green', value: '#22c55e' },
    { name: 'Red', value: '#ef4444' },
    { name: 'Orange', value: '#f97316' },
  ];

  // Text color options
  const textColorOptions = [
    { name: 'Black', value: '#000000' },
    { name: 'Dark Gray', value: '#4b5563' },
    { name: 'Navy', value: '#1e3a8a' },
    { name: 'Dark Green', value: '#166534' },
    { name: 'Dark Purple', value: '#5b21b6' },
  ];

  // Preview component for the chat appearance
  const AppearancePreview = () => (
    <div className="mt-4 p-3 border rounded-lg overflow-hidden">
      <p className="text-xs mb-2 text-muted-foreground">Preview:</p>
      <div className="flex flex-col space-y-2">
        {/* Bot message */}
        <div className="flex items-start">
          <div className="w-6 h-6 rounded-full overflow-hidden flex-shrink-0 mr-2">
            <Image
              src="/logo/logo.png"
              alt="Bot"
              width={24}
              height={24}
              className="object-cover"
            />
          </div>
          <div 
            className="rounded-lg px-3 py-2 bg-white shadow-sm ring-1 ring-inset ring-gray-200 rounded-tl-none"
            style={{ 
              fontSize: `${fontSize}px`,
              color: textColor
            }}
          >
            Hello! How can I help you today?
          </div>
        </div>
        
        {/* User message */}
        <div className="flex items-start justify-end">
          <div 
            className="rounded-lg px-3 py-2 rounded-tr-none"
            style={{ 
              backgroundColor: bubbleColor,
              fontSize: `${fontSize}px`,
              color: 'white'
            }}
          >
            I have a question about my account.
          </div>
          <div className="w-6 h-6 rounded-full overflow-hidden flex-shrink-0 ml-2 bg-blue-600 flex items-center justify-center text-white text-xs">
            U
          </div>
        </div>
      </div>
    </div>
  );
  
  return (
    <>
      <div className="relative">
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={() => setIsOpen(true)}
          className={`rounded-full ${!buttonOnly ? 'hover:bg-accent hover:text-accent-foreground' : ''}`} 
          title="Chat Settings"
      >
        <Settings className="h-5 w-5" />
        </Button>
        
        {!buttonOnly && (
          <span className="absolute -top-1 -right-1 flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-sky-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-sky-500"></span>
          </span>
        )}
          </div>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Chat Settings</DialogTitle>
          </DialogHeader>
          
          <Tabs defaultValue="appearance" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="appearance">Appearance</TabsTrigger>
              <TabsTrigger value="layout">Layout</TabsTrigger>
            </TabsList>
            
            <TabsContent value="appearance" className="space-y-4 mt-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  {isDarkMode ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
                  <span>Dark Mode</span>
                </div>
                <Switch 
                  checked={isDarkMode} 
                  onCheckedChange={setDarkMode} 
                />
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Type className="h-4 w-4" />
                    <span>Font Size: {fontSize}px</span>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Button 
                    variant="outline" 
                    size="icon" 
                    onClick={() => setFontSize(Math.max(12, fontSize - 1))}
                    disabled={fontSize <= 12}
                  >
                    <ZoomOut className="h-4 w-4" />
                  </Button>
                  <div className="flex-1 h-2 bg-secondary rounded-full">
                    <div 
                      className="h-2 bg-primary rounded-full" 
                      style={{ width: `${((fontSize - 12) / 12) * 100}%` }}
                    />
                  </div>
                  <Button 
                    variant="outline" 
                    size="icon" 
                    onClick={() => setFontSize(Math.min(24, fontSize + 1))}
                    disabled={fontSize >= 24}
                  >
                    <ZoomIn className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              
              {/* Text color picker */}
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Type className="h-4 w-4" />
                  <span>Text Color</span>
                </div>
                <div className="flex flex-wrap gap-2 mt-2">
                  {textColorOptions.map((color) => (
                    <button
                      key={color.value}
                      className={`w-8 h-8 rounded-full border-2 ${
                        textColor === color.value ? 'border-black dark:border-white' : 'border-transparent'
                      }`}
                      style={{ backgroundColor: color.value }}
                      onClick={() => setTextColor(color.value)}
                      title={color.name}
                    />
                  ))}
                </div>
              </div>
              
              {/* Message bubble color picker */}
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <MessageSquare className="h-4 w-4" />
                  <span>Bubble Color</span>
                </div>
                <div className="flex flex-wrap gap-2 mt-2">
                  {colorOptions.map((color) => (
                    <button
                      key={color.value}
                      className={`w-8 h-8 rounded-full border-2 ${
                        bubbleColor === color.value ? 'border-black dark:border-white' : 'border-transparent'
                      }`}
                      style={{ backgroundColor: color.value }}
                      onClick={() => setBubbleColor(color.value)}
                      title={color.name}
                    />
                  ))}
                </div>
              </div>
              
              {/* Preview */}
              <AppearancePreview />
            </TabsContent>
            
            <TabsContent value="layout" className="space-y-4 mt-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <PanelLeft className="h-4 w-4" />
                  <span>Show Sidebar</span>
                </div>
                <Switch 
                  checked={isSidebarOpen} 
                  onCheckedChange={toggleSidebar} 
                />
              </div>
            </TabsContent>
          </Tabs>
          
          <div className="flex justify-between mt-4">
            <Button variant="outline" onClick={() => setIsOpen(false)}>
              <ChevronLeft className="h-4 w-4 mr-2" />
              Close
            </Button>
            <Button onClick={() => {
              // Reset all settings to defaults
              const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
              setDarkMode(systemPrefersDark);
              setFontSize(16);
              setTextColor('#000000');
              setBubbleColor('#2563eb');
              toggleSidebar(true);
            }}>
              Reset to Defaults
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
} 