"use client";
import { Volume2, VolumeX } from 'lucide-react';
import { useNotificationVolume } from '@/hooks/useNotificationVolume';
export default function VolumeControl({ className = '' }) {
    const [volume, setVolume] = useNotificationVolume();
    // Play a test sound when volume changes
    const handleVolumeChange = (newVolume) => {
        setVolume(newVolume);
        // Play a test sound with a small delay to ensure the new volume is applied
        setTimeout(() => {
            if (typeof window !== 'undefined' && window.playNotificationSound) {
                window.playNotificationSound();
            }
        }, 50);
    };
    return (<div className={`volume-control ${className}`}>
      <div className="flex flex-col space-y-3">
        <div className="flex items-center gap-2">
          <button onClick={() => handleVolumeChange(0)} className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300" aria-label="Mute">
            <VolumeX className="w-4 h-4"/>
          </button>
          
          <input type="range" min="0" max="1" step="0.05" value={volume} onChange={(e) => handleVolumeChange(parseFloat(e.target.value))} className="flex-grow"/>
          
          <button onClick={() => handleVolumeChange(1)} className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300" aria-label="Max volume">
            <Volume2 className="w-4 h-4"/>
          </button>
          
          <span className="text-xs text-gray-500 dark:text-gray-400 w-10 text-right">
            {Math.round(volume * 100)}%
          </span>
        </div>
        
        <div className="flex gap-2">
          <button onClick={() => {
            if (volume === 0) {
                // If currently muted, restore to 70%
                handleVolumeChange(0.7);
            }
            else {
                // Otherwise mute
                handleVolumeChange(0);
            }
        }} className="flex-1 text-xs py-1 px-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 rounded text-gray-700 dark:text-gray-300 transition-colors">
            {volume === 0 ? "Unmute" : "Mute"}
          </button>
          
          <button onClick={() => {
            // Play test sound
            if (typeof window !== 'undefined' && window.playNotificationSound) {
                window.playNotificationSound();
            }
        }} className="flex-1 text-xs py-1 px-2 bg-blue-50 hover:bg-blue-100 dark:bg-blue-900/20 dark:hover:bg-blue-800/30 rounded text-blue-700 dark:text-blue-400 transition-colors">
            Test Sound
          </button>
        </div>
      </div>
    </div>);
}
