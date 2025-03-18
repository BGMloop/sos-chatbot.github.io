'use client';

import { useState } from 'react';
import { Settings, Moon, Sun, Volume2 } from 'lucide-react';
import VolumeControl from './VolumeControl';

interface ChatSettingsProps {
  className?: string;
}

export function ChatSettings({ className = '' }: ChatSettingsProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [soundsEnabled, setSoundsEnabled] = useState(true);
  const [fontSize, setFontSize] = useState('medium');
  const [showVolumeControl, setShowVolumeControl] = useState(false);
  
  // Toggle dark mode
  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
    // Actual implementation would be here
  };
  
  // Toggle notification sounds
  const toggleSounds = () => {
    setSoundsEnabled(!soundsEnabled);
    // Actual implementation would be here
  };
  
  return (
    <div className={`chat-settings relative ${className}`}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 hover:text-accent-foreground h-10 w-10 hover:bg-gray-100 dark:hover:bg-gray-800"
        aria-label="Chat Settings"
      >
        <Settings className="h-5 w-5" />
      </button>
      
      {isOpen && (
        <div className="settings-panel absolute right-0 top-full mt-2 bg-white dark:bg-gray-900 p-4 rounded-lg shadow-lg border border-gray-200 dark:border-gray-800 w-80 z-10">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium text-gray-800 dark:text-gray-200">Chat Settings</h3>
            <p className="text-xs text-gray-500 dark:text-gray-400">Customize your chat experience.</p>
          </div>
          
          <div className="space-y-6">
            {/* Dark Mode */}
            <div className="setting-item">
              <div className="flex justify-between items-center mb-1">
                <div className="flex items-center gap-2">
                  {darkMode ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
                  <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">Dark Mode</h4>
                </div>
                <button 
                  onClick={toggleDarkMode}
                  className="relative inline-flex h-6 w-11 items-center rounded-full bg-gray-200 dark:bg-gray-700" 
                >
                  <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${darkMode ? 'translate-x-6' : 'translate-x-1'}`} />
                </button>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400">Toggle dark mode</p>
            </div>
            
            {/* Notification Sounds */}
            <div className="setting-item">
              <div className="flex justify-between items-center mb-1">
                <div className="flex items-center gap-2">
                  <Volume2 className="h-4 w-4" />
                  <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">Notification Sounds</h4>
                </div>
                <div className="flex items-center gap-2">
                  <button 
                    onClick={toggleSounds}
                    className="relative inline-flex h-6 w-11 items-center rounded-full bg-gray-200 dark:bg-gray-700" 
                  >
                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${soundsEnabled ? 'translate-x-6' : 'translate-x-1'}`} />
                  </button>
                  <button 
                    onClick={() => setShowVolumeControl(!showVolumeControl)}
                    className="text-xs text-blue-600 dark:text-blue-400 hover:underline"
                  >
                    {showVolumeControl ? 'Hide' : 'Volume'}
                  </button>
                </div>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400">Toggle sounds</p>
              
              {showVolumeControl && (
                <div className="mt-2 pl-6 pt-2 border-t border-gray-100 dark:border-gray-800">
                  <VolumeControl className="w-full" />
                </div>
              )}
            </div>
            
            {/* Font Size */}
            <div className="setting-item">
              <h4 className="text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Font Size</h4>
              <div className="flex items-center justify-between">
                <button 
                  onClick={() => setFontSize('small')}
                  className={`px-3 py-1 text-xs rounded ${fontSize === 'small' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' : 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400'}`}
                >
                  Small
                </button>
                <button 
                  onClick={() => setFontSize('medium')}
                  className={`px-3 py-1 text-sm rounded ${fontSize === 'medium' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' : 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400'}`}
                >
                  Medium
                </button>
                <button 
                  onClick={() => setFontSize('large')}
                  className={`px-3 py-1 text-base rounded ${fontSize === 'large' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' : 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400'}`}
                >
                  Large
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 