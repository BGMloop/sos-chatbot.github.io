"use client"

import { useEffect, useState } from "react";
import { Toast, useToast, ToastVariant } from "./use-toast";

interface ToastProps {
  toast: Toast;
  onDismiss: (id: string) => void;
}

const ToastComponent = ({ toast, onDismiss }: ToastProps) => {
  return (
    <div 
      className={`
        fixed bottom-4 right-4 p-4 rounded-md shadow-lg max-w-md w-full 
        transition-all duration-300 ease-in-out transform 
        ${toast.variant === 'destructive' ? 'bg-red-600 text-white' : 'bg-white text-gray-800 dark:bg-gray-800 dark:text-gray-100'} 
        border border-gray-200 dark:border-gray-700
      `}
    >
      {toast.title && (
        <div className="font-medium text-sm mb-1">{toast.title}</div>
      )}
      {toast.description && (
        <div className="text-sm opacity-90">{toast.description}</div>
      )}
      <button 
        onClick={() => onDismiss(toast.id)}
        className="absolute top-2 right-2 text-sm opacity-70 hover:opacity-100"
        aria-label="Close toast"
      >
        ✕
      </button>
    </div>
  );
};

export function Toaster() {
  const { toasts, dismiss } = useToast();
  const [localToasts, setLocalToasts] = useState<Toast[]>([]);
  
  // For components that don't use the hook but use the toast function directly
  useEffect(() => {
    const handleToastEvent = (event: CustomEvent<{ title?: string; description?: string; variant?: ToastVariant }>) => {
      if (event.detail) {
        const id = Math.random().toString(36).substring(2, 9);
        const newToast: Toast = {
          id,
          ...event.detail,
        };
        setLocalToasts(prev => [...prev, newToast]);
        
        // Auto-dismiss after 5 seconds
        setTimeout(() => {
          setLocalToasts(prev => prev.filter(t => t.id !== id));
        }, 5000);
      }
    };

    window.addEventListener('toast' as any, handleToastEvent as any);
    return () => {
      window.removeEventListener('toast' as any, handleToastEvent as any);
    };
  }, []);

  // Combine both sources of toasts
  const allToasts = [...toasts, ...localToasts];
  
  return (
    <>
      {allToasts.map((toast) => (
        <ToastComponent 
          key={toast.id} 
          toast={toast} 
          onDismiss={dismiss} 
        />
      ))}
    </>
  );
} 