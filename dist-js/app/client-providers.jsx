'use client';
import { ThemeProvider } from '@/lib/context/theme';
import NotificationAudioWrapper from '@/components/NotificationAudioWrapper';
import { Toaster } from "@/components/ui/toaster";
import { NavigationProvider } from '@/lib/context/navigation';
export default function ClientProviders({ children, }) {
    return (<NavigationProvider>
      <ThemeProvider>
        {children}
        <NotificationAudioWrapper />
        <Toaster />
      </ThemeProvider>
    </NavigationProvider>);
}
