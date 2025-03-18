// Adapted from https://ui.shadcn.com
import { useState, useEffect } from 'react';

export type ToastVariant = 'default' | 'destructive';

export interface Toast {
  id: string;
  title?: string;
  description?: string;
  variant?: ToastVariant;
}

export interface ToastOptions {
  title?: string;
  description?: string;
  variant?: ToastVariant;
  duration?: number;
}

const DEFAULT_TOAST_DURATION = 5000; // 5 seconds

// Simplified toast hook
export function useToast() {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const toast = (options: ToastOptions) => {
    const id = Math.random().toString(36).substring(2, 9);
    const newToast: Toast = {
      id,
      title: options.title,
      description: options.description,
      variant: options.variant || 'default',
    };

    setToasts((prevToasts) => [...prevToasts, newToast]);

    // Auto-dismiss after duration
    setTimeout(() => {
      dismiss(id);
    }, options.duration || DEFAULT_TOAST_DURATION);

    return id;
  };

  const dismiss = (id: string) => {
    setToasts((prevToasts) => prevToasts.filter((toast) => toast.id !== id));
  };

  return {
    toasts,
    toast,
    dismiss,
  };
}

// Export a standalone toast function
export const toast = (options: ToastOptions) => {
  // For client-side use only
  if (typeof window !== 'undefined') {
    // Simple window event for components that don't use the hook
    const event = new CustomEvent('toast', { detail: options });
    window.dispatchEvent(event);
    
    // For direct console feedback during development
    console.log('Toast:', options);
  }
  return '';
};

export type ToastActionElement = React.ReactElement 