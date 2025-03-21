"use client";

import React from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Home, Moon, Sun, Volume2, VolumeX, Bell, Languages, Shield, UserCircle, LogOut } from 'lucide-react';
import { useTheme } from '@/lib/context/theme';
import Link from 'next/link';

export default function SettingsPage() {
  const router = useRouter();
  const { isDarkMode, toggleDarkMode, fontSize, setFontSize, textColor, setTextColor, bubbleColor, setBubbleColor } = useTheme();
  
  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-gray-900 text-white' : 'bg-white text-gray-900'}`}>
      <header className="border-b p-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <h1 className="text-2xl font-bold">Settings</h1>
          <Button 
            variant="outline" 
            onClick={() => router.push('/dashboard')}
            className="flex items-center gap-2"
          >
            <Home className="h-4 w-4" />
            Return to Dashboard
          </Button>
        </div>
      </header>
      
      <main className="p-4 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {/* Left Column - Navigation */}
          <div className="col-span-1">
            <div className={`rounded-lg border ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
              <nav className="p-2">
                <ul className="space-y-1">
                  <li>
                    <Link 
                      href="#appearance" 
                      className={`flex items-center gap-2 p-2 rounded-md ${isDarkMode ? 'hover:bg-gray-800' : 'hover:bg-gray-100'}`}
                    >
                      <Sun className="h-4 w-4" />
                      <span>Appearance</span>
                    </Link>
                  </li>
                  <li>
                    <Link 
                      href="#notifications" 
                      className={`flex items-center gap-2 p-2 rounded-md ${isDarkMode ? 'hover:bg-gray-800' : 'hover:bg-gray-100'}`}
                    >
                      <Bell className="h-4 w-4" />
                      <span>Notifications</span>
                    </Link>
                  </li>
                  <li>
                    <Link 
                      href="#language" 
                      className={`flex items-center gap-2 p-2 rounded-md ${isDarkMode ? 'hover:bg-gray-800' : 'hover:bg-gray-100'}`}
                    >
                      <Languages className="h-4 w-4" />
                      <span>Language</span>
                    </Link>
                  </li>
                  <li>
                    <Link 
                      href="#privacy" 
                      className={`flex items-center gap-2 p-2 rounded-md ${isDarkMode ? 'hover:bg-gray-800' : 'hover:bg-gray-100'}`}
                    >
                      <Shield className="h-4 w-4" />
                      <span>Privacy & Security</span>
                    </Link>
                  </li>
                  <li>
                    <Link 
                      href="#account" 
                      className={`flex items-center gap-2 p-2 rounded-md ${isDarkMode ? 'hover:bg-gray-800' : 'hover:bg-gray-100'}`}
                    >
                      <UserCircle className="h-4 w-4" />
                      <span>Account</span>
                    </Link>
                  </li>
                </ul>
              </nav>
              
              <div className="border-t p-2 mt-2">
                <button className={`flex w-full items-center gap-2 p-2 rounded-md text-red-500 ${isDarkMode ? 'hover:bg-gray-800' : 'hover:bg-gray-100'}`}>
                  <LogOut className="h-4 w-4" />
                  <span>Sign Out</span>
                </button>
              </div>
            </div>
          </div>
          
          {/* Right Column - Settings Content */}
          <div className="col-span-3">
            {/* Appearance Section */}
            <section id="appearance" className={`mb-8 p-6 rounded-lg border ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
              <h2 className="text-xl font-semibold mb-4">Appearance</h2>
              
              {/* Dark Mode */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    {isDarkMode ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
                    <h3 className="font-medium">Dark Mode</h3>
                  </div>
                  <button 
                    onClick={toggleDarkMode}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full ${isDarkMode ? 'bg-blue-600' : 'bg-gray-200'}`}
                  >
                    <span className="sr-only">Toggle dark mode</span>
                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${isDarkMode ? 'translate-x-6' : 'translate-x-1'}`} />
                  </button>
                </div>
                <p className="text-sm text-gray-500">Switch between light and dark themes</p>
              </div>
              
              {/* Font Size */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-1">
                  <h3 className="font-medium">Font Size</h3>
                  <div className="text-sm">{fontSize}px</div>
                </div>
                <div className="flex items-center gap-4 mt-2">
                  <span className="text-sm">A</span>
                  <input 
                    type="range" 
                    min="12" 
                    max="24" 
                    value={fontSize} 
                    onChange={(e) => setFontSize(parseInt(e.target.value))}
                    className="flex-1"
                  />
                  <span className="text-lg">A</span>
                </div>
              </div>
              
              {/* Text Color */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-1">
                  <h3 className="font-medium">Text Color</h3>
                  <div className="text-sm">{textColor}</div>
                </div>
                <div className="flex items-center gap-2 mt-2">
                  <input 
                    type="color" 
                    value={textColor}
                    onChange={(e) => setTextColor(e.target.value)}
                    className="w-10 h-10 rounded cursor-pointer"
                  />
                  <span className="text-sm">Select a color for text in chat bubbles</span>
                </div>
              </div>
              
              {/* Bubble Color */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-1">
                  <h3 className="font-medium">Bubble Color</h3>
                  <div className="text-sm">{bubbleColor}</div>
                </div>
                <div className="flex items-center gap-2 mt-2">
                  <input 
                    type="color" 
                    value={bubbleColor}
                    onChange={(e) => setBubbleColor(e.target.value)}
                    className="w-10 h-10 rounded cursor-pointer"
                  />
                  <span className="text-sm">Select a color for chat bubbles</span>
                </div>
              </div>
              
              {/* Preview */}
              <div className="mt-6 p-4 rounded-lg border">
                <h3 className="font-medium mb-3">Preview</h3>
                <div className="flex flex-col gap-3">
                  <div className="flex items-start gap-2">
                    <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white">B</div>
                    <div 
                      className="p-3 rounded-lg max-w-[80%]" 
                      style={{ backgroundColor: bubbleColor, color: textColor, fontSize: `${fontSize}px` }}
                    >
                      Hello! How can I help you today?
                    </div>
                  </div>
                  <div className="flex items-start gap-2 justify-end">
                    <div 
                      className="p-3 rounded-lg bg-blue-600 text-white max-w-[80%]" 
                      style={{ fontSize: `${fontSize}px` }}
                    >
                      I have a question about my account.
                    </div>
                    <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center">U</div>
                  </div>
                </div>
              </div>
            </section>
            
            {/* Notifications Section */}
            <section id="notifications" className={`mb-8 p-6 rounded-lg border ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
              <h2 className="text-xl font-semibold mb-4">Notifications</h2>
              
              {/* Sound */}
              <div className="mb-4">
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <Volume2 className="h-5 w-5" />
                    <h3 className="font-medium">Sound</h3>
                  </div>
                  <button 
                    className="relative inline-flex h-6 w-11 items-center rounded-full bg-blue-600"
                  >
                    <span className="sr-only">Toggle sound</span>
                    <span className="inline-block h-4 w-4 transform rounded-full bg-white transition translate-x-6" />
                  </button>
                </div>
                <p className="text-sm text-gray-500">Play sound when receiving new messages</p>
              </div>
              
              {/* Email Notifications */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <Bell className="h-5 w-5" />
                    <h3 className="font-medium">Email Notifications</h3>
                  </div>
                  <button 
                    className="relative inline-flex h-6 w-11 items-center rounded-full bg-gray-200"
                  >
                    <span className="sr-only">Toggle email notifications</span>
                    <span className="inline-block h-4 w-4 transform rounded-full bg-white transition translate-x-1" />
                  </button>
                </div>
                <p className="text-sm text-gray-500">Receive email notifications for important updates</p>
              </div>
            </section>
          </div>
        </div>
      </main>
    </div>
  );
} 