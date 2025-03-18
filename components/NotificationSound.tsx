"use client";

import { useEffect, useRef, useState } from 'react';

interface NotificationSoundProps {
  enabled?: boolean;
}

/**
 * NotificationSound component
 * 
 * NOTE: This component has been disabled as per user request.
 * All sound functionality has been removed to prevent audio issues.
 */
export default function NotificationSound({ enabled = false }: NotificationSoundProps) {
  // Expose a dummy function for backward compatibility
  useEffect(() => {
    if (typeof window !== 'undefined') {
      (window as any).playNotificationSound = () => {
        console.log('Sound functionality has been disabled');
      };
    }
    
    return () => {
      if (typeof window !== 'undefined') {
        delete (window as any).playNotificationSound;
      }
    };
  }, []);
  
  // This component no longer renders anything
  return null;
} 