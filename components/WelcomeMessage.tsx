"use client";

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import { useUser } from '@clerk/nextjs';

export default function WelcomeMessage() {
  const [fadeIn, setFadeIn] = useState(false);
  const { user } = useUser();
  
  useEffect(() => {
    setFadeIn(true);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center h-full mt-10 px-4 sm:px-0">
      <div className={`bg-white rounded-2xl shadow-sm ring-1 ring-inset ring-gray-200 px-4 sm:px-6 py-5 max-w-lg w-full transition-opacity duration-700 ease-in-out ${fadeIn ? 'opacity-100' : 'opacity-0'}`}>
        <div className="flex justify-center mb-4">
          <div className="relative w-[400px] h-[246px]">
            <Image
              src="/logo/logo.png"
              alt="AI Agent Chat Logo"
              fill
              sizes="400px"
              className="object-contain dark:invert"
              priority
            />
          </div>
        </div>
        <h2 className="text-lg font-semibold text-gray-900 mb-3 text-center">
          Welcome {user?.firstName ? `${user.firstName}` : ''} to your FREE AI Agent Chat! 👋
        </h2>
        <p className="text-md text-blue-600 font-medium mb-3 text-center">
          Your academic assistant for college success
        </p>
        <p className="text-sm text-gray-600 mb-3 leading-relaxed text-center">
          I can help you with:
        </p>
        <ul className="space-y-2 text-sm text-gray-600">
          <li className="flex items-start gap-3 p-2 hover:bg-gray-50 rounded-lg transition-colors">
            <span className="text-blue-500 bg-blue-50 p-1.5 rounded-full">
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12c0 4.97-4.03 9-9 9s-9-4.03-9-9 4.03-9 9-9 9 4.03 9 9z"/><path d="M9 12l2 2 4-4"/></svg>
            </span>
            <span>Research assistance and paper writing support</span>
          </li>
          <li className="flex items-start gap-3 p-2 hover:bg-gray-50 rounded-lg transition-colors">
            <span className="text-blue-500 bg-blue-50 p-1.5 rounded-full">
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12c0 4.97-4.03 9-9 9s-9-4.03-9-9 4.03-9 9-9 9 4.03 9 9z"/><path d="M9 12l2 2 4-4"/></svg>
            </span>
            <span>Explaining complex academic concepts</span>
          </li>
          <li className="flex items-start gap-3 p-2 hover:bg-gray-50 rounded-lg transition-colors">
            <span className="text-blue-500 bg-blue-50 p-1.5 rounded-full">
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12c0 4.97-4.03 9-9 9s-9-4.03-9-9 4.03-9 9-9 9 4.03 9 9z"/><path d="M9 12l2 2 4-4"/></svg>
            </span>
            <span>Study planning and time management tips</span>
          </li>
        </ul>
        <p className="text-sm text-gray-600 mt-3 leading-relaxed text-center">
          Ask me anything about your coursework or campus life!
        </p>
      </div>
    </div>
  );
}