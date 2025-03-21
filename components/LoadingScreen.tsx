import React from 'react';
import StarsBackground from './StarsBackground';

export default function LoadingScreen() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 relative">
      <StarsBackground />
      <div className="z-10 text-center">
        <div className="mb-4">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
        </div>
        <h1 className="text-2xl font-bold mb-2">Loading</h1>
        <p className="text-muted-foreground">Please wait while we set things up...</p>
      </div>
    </div>
  );
} 