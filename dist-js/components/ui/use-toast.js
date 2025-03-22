// Adapted from https://ui.shadcn.com
import { useState } from 'react';
const DEFAULT_TOAST_DURATION = 5000; // 5 seconds
// Simplified toast hook
export function useToast() {
    const [toasts, setToasts] = useState([]);
    const toast = (options) => {
        const id = Math.random().toString(36).substring(2, 9);
        const newToast = {
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
    const dismiss = (id) => {
        setToasts((prevToasts) => prevToasts.filter((toast) => toast.id !== id));
    };
    return {
        toasts,
        toast,
        dismiss,
    };
}
// Export a standalone toast function
export const toast = (options) => {
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
