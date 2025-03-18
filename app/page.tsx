"use client";

import Image from "next/image";
import { useState, useEffect } from "react";
import { SignedIn, SignedOut, SignInButton } from "@clerk/nextjs";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { useNotificationSound } from "@/hooks/useNotificationSound";
        
export default function LandingPage() {
  const [showLightning, setShowLightning] = useState(false);
  const [showPreConduction, setShowPreConduction] = useState(false);
  const playNotificationSound = useNotificationSound();

  // Lightning animation sequence
  const triggerLightning = () => {
    // Play the notification sound
    playNotificationSound();
    
    // First show the pre-conduction effect
    setShowPreConduction(true);
    
    // Flash effect for the dramatic pause described
    document.body.classList.add('lightning-flash');
    
    // Then show the actual lightning after a short delay
    setTimeout(() => {
      setShowPreConduction(false);
      setShowLightning(true);
      document.body.classList.remove('lightning-flash');
      
      // Reset after animation completes
      setTimeout(() => {
        setShowLightning(false);
      }, 1500); // Extend animation duration for more impact
    }, 300); // Pre-conduction duration
  };
  
  // Add an effect to ensure body class is removed if component unmounts during animation
  useEffect(() => {
    return () => {
      document.body.classList.remove('lightning-flash');
    };
  }, []);

  // Style for the lightning flash that affects the whole screen
  useEffect(() => {
    // Add the flash styling
    const style = document.createElement('style');
    style.innerHTML = `
      .lightning-flash {
        position: relative;
      }
      .lightning-flash::after {
        content: '';
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background-color: rgba(255, 255, 255, 0.9);
        z-index: 100;
        opacity: 0;
        animation: lightning-whole-screen 0.3s forwards;
        pointer-events: none;
      }
      @keyframes lightning-whole-screen {
        0% { opacity: 0; }
        10% { opacity: 0.9; }
        20% { opacity: 0.1; }
        30% { opacity: 0.7; }
        40% { opacity: 0; }
        100% { opacity: 0; }
      }
    `;
    document.head.appendChild(style);
    
    return () => {
      document.head.removeChild(style);
    };
  }, []);

  return (
    <main className="min-h-screen bg-gradient-to-b from-white to-gray-50/50 flex items-center justify-center">
      {/* Background pattern */}
      <div className="absolute inset-0 -z-10 h-full w-full" style={{
        backgroundColor: "#e5e5f7",
        opacity: 0.8,
        backgroundImage: `radial-gradient(circle at center center, #c1c3e0, #e5e5f7), 
                        repeating-radial-gradient(circle at center center, #c1c3e0, #c1c3e0, 10px, transparent 20px, transparent 10px)`,
        backgroundBlendMode: "multiply"
      }} />

      <section className="w-full px-4 py-8 mx-auto max-w-7xl sm:px-6 lg:px-8 flex flex-col items-center space-y-10 text-center">
        {/* Hero content */}
        <header className="space-y-4 pt-12 relative">
            <div className="group relative">
              <Image
                className="dark:invert mx-auto mt-1 mb-2 transition-transform duration-300 group-hover:scale-105"
                src="/logo/logo.png"
                alt="Logo.png logo"
                width={400}
                height={246}
                priority
              />
              
              {/* Pre-conduction effect - subtle glow at the ground */}
              {showPreConduction && (
                <div className="absolute left-1/2 transform -translate-x-1/2 bottom-0 w-12 h-12 bg-gradient-radial from-white via-blue-200 to-violet-300 opacity-40 rounded-full blur-md animate-pulse"></div>
              )}
              
              {/* Lightning strike */}
              {showLightning && (
                <>
                  {/* Lightning bolt from forehead */}
                  <div className="absolute left-1/2 transform -translate-x-1/2 top-[100px] w-6 h-[500px] overflow-visible">
                    {/* Main lightning path - white core with colored edges */}
                    <div className="absolute top-0 left-0 right-0 h-full bg-gradient-to-b from-white via-yellow-300 to-transparent 
                                    animate-lightning-dissipate z-10"></div>
                    
                    {/* Glow effect around the main bolt */}
                    <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-20 h-full bg-gradient-to-b from-blue-400/50 via-violet-400/30 to-transparent blur-md animate-lightning-dissipate"></div>
                    
                    {/* Jagged edges with multi-color effect */}
                    <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-24 h-12">
                      <svg viewBox="0 0 100 40" className="w-full h-full">
                        <defs>
                          <linearGradient id="lightning-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stopColor="white" />
                            <stop offset="40%" stopColor="#fdeb71" /> 
                            <stop offset="60%" stopColor="#7ba2ff" />
                            <stop offset="100%" stopColor="#a6c1ee" />
                          </linearGradient>
                        </defs>
                        <path 
                          d="M50,0 L30,10 L60,15 L25,25 L70,30 L40,40 L50,50" 
                          fill="none" 
                          stroke="url(#lightning-gradient)" 
                          strokeWidth="4"
                          className="animate-lightning-flicker"
                        />
                      </svg>
                    </div>
                    
                    {/* Branching lightning parts with color variations */}
                    <div className="absolute top-[30%] left-0 w-16 h-8 ml-4 transform -rotate-30 opacity-80">
                      <svg viewBox="0 0 40 20" className="w-full h-full">
                        <defs>
                          <linearGradient id="branch1-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stopColor="white" />
                            <stop offset="50%" stopColor="#9fe7ff" />
                            <stop offset="100%" stopColor="#7ba2ff" />
                          </linearGradient>
                        </defs>
                        <path 
                          d="M0,0 L20,5 L5,15 L30,20" 
                          fill="none" 
                          stroke="url(#branch1-gradient)" 
                          strokeWidth="2.5"
                          className="animate-lightning-flicker"
                        />
                      </svg>
                    </div>
                    
                    <div className="absolute top-[50%] right-0 w-20 h-10 -mr-4 transform rotate-20 opacity-80">
                      <svg viewBox="0 0 40 20" className="w-full h-full">
                        <defs>
                          <linearGradient id="branch2-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stopColor="white" />
                            <stop offset="50%" stopColor="#a6c1ee" />
                            <stop offset="100%" stopColor="#84fab0" />
                          </linearGradient>
                        </defs>
                        <path 
                          d="M0,0 L20,10 L5,15 L35,20" 
                          fill="none" 
                          stroke="url(#branch2-gradient)" 
                          strokeWidth="2.5"
                          className="animate-lightning-flicker"
                        />
                      </svg>
                    </div>
                    
                    {/* Additional small branches for more chaos and energy */}
                    <div className="absolute top-[25%] right-2 w-12 h-6 transform rotate-45 opacity-70">
                      <svg viewBox="0 0 30 15" className="w-full h-full">
                        <path 
                          d="M0,0 L10,5 L5,10 L15,15" 
                          fill="none" 
                          stroke="rgba(255, 255, 255, 0.9)" 
                          strokeWidth="2"
                          className="animate-lightning-flicker-fast"
                        />
                      </svg>
                    </div>
                    
                    <div className="absolute top-[65%] left-2 w-12 h-6 transform -rotate-30 opacity-70">
                      <svg viewBox="0 0 30 15" className="w-full h-full">
                        <path 
                          d="M0,0 L15,7 L5,10 L20,15" 
                          fill="none" 
                          stroke="rgba(168, 169, 230, 0.9)" 
                          strokeWidth="2"
                          className="animate-lightning-flicker-fast"
                        />
                      </svg>
                    </div>
                    
                    {/* Ground impact effect */}
                    <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 w-48 h-24">
                      <div className="w-full h-full bg-gradient-radial from-white via-yellow-300 to-blue-400 rounded-full opacity-0 animate-lightning-impact"></div>
                    </div>
                  </div>
                </>
              )}
            </div>
          <h1 className="text-5xl font-bold tracking-tight sm:text-7xl bg-gradient-to-r from-indigo-600 via-black to-black bg-clip-text text-transparent">
            SOS Chatbot
          </h1>
          <p className="max-w-[600px] text-lg text-gray-700 md:text-xl/relaxed xl:text-2xl/relaxed">
            Your AI-powered academic assistant that helps you navigate college life - from
            research papers to campus emergencies!
            <br />
            <span className="text-gray-500 text-sm font-medium">
              Powered by IBM&apos;s WxTools & your favourite LLM&apos;s.
            </span>
            <br />
            <span className="text-gray-500 text-sm font-medium">
              Sign up for free - no credit card required!
            </span>
          </p>
          
          {/* CTA Button - Moved up */}
          <div className="mt-4">
            <SignedIn>
              <Link href="/dashboard">
                <button 
                  className="group relative inline-flex items-center justify-center px-8 py-3.5 text-base font-medium text-white bg-gradient-to-r from-indigo-600 to-black rounded-full hover:from-indigo-500 hover:to-black transition-all duration-200 shadow-lg hover:shadow-xl hover:-translate-y-0.5"
                  onClick={(e) => {
                    triggerLightning();
                    // Let the animation play before navigation
                    e.preventDefault();
                    setTimeout(() => {
                      window.location.href = "/dashboard";
                    }, 1200);
                  }}
                >
                  Get Started
                  <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-0.5" />
                  <div className="absolute inset-0 rounded-full bg-gradient-to-r from-indigo-600/20 to-black/20 blur-xl opacity-0 group-hover:opacity-100 transition-opacity" />
                </button>
              </Link>
            </SignedIn>

            <SignedOut>
              <SignInButton
                mode="modal"
                fallbackRedirectUrl={"/dashboard"}
                forceRedirectUrl={"/dashboard"}
              >
                <button className="group relative inline-flex items-center justify-center px-8 py-3.5 text-base font-medium text-white bg-gradient-to-r from-gray-900 to-gray-800 rounded-full hover:from-gray-800 hover:to-gray-700 transition-all duration-200 shadow-lg hover:shadow-xl hover:-translate-y-0.5">
                  Sign Up
                  <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-0.5" />
                  <div className="absolute inset-0 rounded-full bg-gradient-to-r from-indigo-600/20 to-black/20 blur-xl opacity-0 group-hover:opacity-100 transition-opacity" />
                </button>
              </SignInButton>
              <p className="font-medium text-sm text-indigo-600 mt-2">SIGN UP FOR FREE - NO CREDIT CARD REQUIRED</p>
            </SignedOut>
          </div>
        </header>

        {/* Features grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-16 pt-8 max-w-3xl mx-auto">
          {[
            { title: "Academic Support", description: "Research assistance and paper writing help" },
            {
              title: "Campus Resources",
              description: "Find services, events, and emergency contacts",
            },
            { title: "Study Buddy", description: "Time management and study planning assistance" },
          ].map(({ title, description }) => (
            <div key={title} className="text-center">
              <div className="text-2xl font-semibold text-gray-900">
                {title}
              </div>
              <div className="text-sm text-gray-600 mt-1">{description}</div>
            </div>
          ))}
        </div>
        {/* Add social proof */}
        <div className="mt-6 pt-5 border-t border-gray-200">
          <p className="text-sm text-gray-500 text-center mb-2">Trusted by students at 50+ universities</p>
          <div className="flex justify-center space-x-4">
            <span className="flex items-center">
              <span className="text-yellow-400">★★★★★</span>
              <span className="ml-1 text-xs text-gray-600">4.9/5</span>
            </span>
          </div>
        </div>
        <footer className="mt-8">
          <p className="text-sm text-gray-500 text-center">
            &copy; 2025 SOS Chatbot. All rights reserved.
          </p>
        </footer>
      </section>
    </main>
  );
}