import type { Metadata } from "next";
import { Inter } from 'next/font/google';
import { ConvexClientProvider } from '@/components/ConvexClientProvider';
import { ClerkProvider } from '@clerk/nextjs';
import NotificationAudioWrapper from '@/components/NotificationAudioWrapper';
import { Toaster } from "@/components/ui/toaster";
import './globals.css';

const inter = Inter({ 
  subsets: ['latin'],
  variable: '--font-inter',
});

export const metadata: Metadata = {
  title: 'SOS AI Agent',
  description: 'Your FREE AI-powered assistant',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning className={`${inter.variable} antialiased`}>
      <body className="min-h-screen bg-background" suppressHydrationWarning>
        <ClerkProvider>
          <ConvexClientProvider>
            {children}
            <NotificationAudioWrapper />
            <Toaster />
          </ConvexClientProvider>
        </ClerkProvider>
      </body>
    </html>
  );
}
