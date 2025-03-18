'use client';

import dynamic from 'next/dynamic';

// Use dynamic import with SSR disabled for window-dependent component
const NotificationSound = dynamic(
  () => import('@/components/NotificationSound'),
  { ssr: false }
);

export default function NotificationAudioWrapper() {
  return <NotificationSound />;
} 