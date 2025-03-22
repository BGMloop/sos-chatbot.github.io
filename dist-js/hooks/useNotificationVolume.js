import { useState, useEffect } from 'react';
const VOLUME_STORAGE_KEY = 'notification-sound-volume';
const DEFAULT_VOLUME = 0.7; // 70% volume by default
/**
 * Hook to manage notification sound volume with localStorage persistence
 * @returns [volume, setVolume] - Current volume (0-1) and function to update it
 */
export function useNotificationVolume() {
    const [volume, setVolumeState] = useState(DEFAULT_VOLUME);
    // Load saved volume from localStorage on mount
    useEffect(() => {
        if (typeof window === 'undefined')
            return;
        try {
            const savedVolume = localStorage.getItem(VOLUME_STORAGE_KEY);
            if (savedVolume !== null) {
                const parsedVolume = parseFloat(savedVolume);
                if (!isNaN(parsedVolume) && parsedVolume >= 0 && parsedVolume <= 1) {
                    setVolumeState(parsedVolume);
                }
            }
        }
        catch (err) {
            console.warn('Failed to load volume setting from localStorage:', err);
        }
    }, []);
    // Update volume and save to localStorage
    const setVolume = (newVolume) => {
        if (newVolume < 0 || newVolume > 1) {
            console.warn('Volume must be between 0 and 1, got:', newVolume);
            return;
        }
        setVolumeState(newVolume);
        if (typeof window !== 'undefined') {
            try {
                localStorage.setItem(VOLUME_STORAGE_KEY, newVolume.toString());
            }
            catch (err) {
                console.warn('Failed to save volume setting to localStorage:', err);
            }
        }
        // Update the global volume setting if available
        if (typeof window !== 'undefined' && window.setNotificationVolume) {
            window.setNotificationVolume(newVolume);
        }
    };
    return [volume, setVolume];
}
