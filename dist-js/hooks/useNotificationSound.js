import { useCallback } from 'react';
/**
 * Hook for playing the notification sound
 * Note: Sound functionality is now disabled as per user request
 * @returns Function that does nothing (sound disabled)
 */
export function useNotificationSound() {
    /**
     * This function is now just a placeholder that does nothing
     * Sounds have been disabled to prevent potential issues
     */
    const playSound = useCallback(() => {
        // Sound functionality is disabled
        // No implementation needed
        console.log('Sound functionality has been disabled');
    }, []);
    return playSound;
}
