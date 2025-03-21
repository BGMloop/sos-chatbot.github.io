import type { Metadata } from "next";
import { Inter } from 'next/font/google';
import { ClerkProvider } from '@clerk/nextjs';
import { ConvexClientProvider } from '@/components/ConvexClientProvider';
import './globals.css';

// Import client components in a client wrapper
import ClientProviders from './client-providers';

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
            <ClientProviders>
              {children}
            </ClientProviders>
          </ConvexClientProvider>
        </ClerkProvider>
      </body>
    </html>
  );
}
