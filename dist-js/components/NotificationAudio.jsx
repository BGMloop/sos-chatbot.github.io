"use client";
import { useEffect, useRef, useState } from 'react';
export default function NotificationAudio({ enabled = true }) {
    const audioRef = useRef(null);
    const audioContextRef = useRef(null);
    const [useWebAudioFallback, setUseWebAudioFallback] = useState(false);
    // Initialize audio context for fallback mechanism
    useEffect(() => {
        if (typeof window !== 'undefined' && enabled) {
            try {
                audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
            }
            catch (err) {
                console.warn("Could not initialize Web Audio API:", err);
            }
        }
        return () => {
            if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
                audioContextRef.current.close().catch(console.error);
            }
        };
    }, [enabled]);
    // Initialize audio element
    useEffect(() => {
        if (typeof window !== 'undefined' && enabled) {
            console.log("Initializing notification audio system");
            // Create audio element and set attributes
            const audio = new Audio('/notification.mp3');
            audio.preload = 'auto';
            audio.volume = 1.0; // Set to maximum volume
            // Add event listeners for debugging
            audio.addEventListener('canplaythrough', () => {
                console.log("Notification sound loaded successfully");
            });
            audio.addEventListener('error', (e) => {
                console.error("Error loading notification sound:", e);
                setUseWebAudioFallback(true);
            });
            // Store the reference
            audioRef.current = audio;
            // Load the audio
            audio.load();
            // Clean up function
            return () => {
                if (audioRef.current) {
                    audioRef.current.pause();
                    audioRef.current.removeEventListener('canplaythrough', () => { });
                    audioRef.current.removeEventListener('error', () => { });
                    audioRef.current = null;
                }
            };
        }
    }, [enabled]);
    // Generate a lightning sound using Web Audio API
    const generateLightningSound = () => {
        if (!audioContextRef.current)
            return;
        const context = audioContextRef.current;
        // Create oscillator for the initial crack
        const initialCrack = context.createOscillator();
        initialCrack.type = 'sawtooth';
        initialCrack.frequency.setValueAtTime(120, context.currentTime);
        initialCrack.frequency.exponentialRampToValueAtTime(60, context.currentTime + 0.1);
        // Create noise for the thunder
        const bufferSize = context.sampleRate * 2; // 2 seconds
        const noiseBuffer = context.createBuffer(1, bufferSize, context.sampleRate);
        const output = noiseBuffer.getChannelData(0);
        // Fill with noise with a rumbling envelope
        for (let i = 0; i < bufferSize; i++) {
            const t = i / bufferSize;
            // Create an envelope that starts loud and fades
            let envelope = 0;
            if (t < 0.1) { // Initial crack
                envelope = 1.0;
            }
            else { // Thunder rumble
                envelope = Math.pow(1 - (t - 0.1) / 0.9, 2);
            }
            // Add low-frequency modulation for thunder rumble
            const lowFreqMod = Math.sin(t * 3) * 0.2;
            // Apply envelope to white noise
            output[i] = (Math.random() * 2 - 1) * envelope * (1 + lowFreqMod);
        }
        // Create noise source
        const noise = context.createBufferSource();
        noise.buffer = noiseBuffer;
        // Create gain nodes for volume control
        const initialGain = context.createGain();
        initialGain.gain.value = 0.8;
        const noiseGain = context.createGain();
        noiseGain.gain.value = 0.7;
        // Create a compressor to make sound more impactful
        const compressor = context.createDynamicsCompressor();
        compressor.threshold.value = -20;
        compressor.knee.value = 5;
        compressor.ratio.value = 12;
        compressor.attack.value = 0;
        compressor.release.value = 0.25;
        // Connect nodes
        initialCrack.connect(initialGain);
        initialGain.connect(compressor);
        noise.connect(noiseGain);
        noiseGain.connect(compressor);
        compressor.connect(context.destination);
        // Start sounds
        initialCrack.start();
        initialCrack.stop(context.currentTime + 0.2);
        noise.start();
        console.log("Playing synthesized lightning sound");
        return noise; // Return for cleanup
    };
    // Function to play the notification sound
    const playNotification = () => {
        console.log("Attempting to play notification sound");
        if (useWebAudioFallback) {
            console.log("Using Web Audio API fallback");
            generateLightningSound();
            return;
        }
        if (audioRef.current) {
            try {
                // Reset the audio to the beginning if it's already playing
                audioRef.current.pause();
                audioRef.current.currentTime = 0;
                audioRef.current.volume = 1.0; // Ensure max volume
                // Play the audio
                const playPromise = audioRef.current.play();
                if (playPromise !== undefined) {
                    playPromise.then(() => {
                        console.log("Notification sound playing successfully");
                    }).catch(err => {
                        console.error('Failed to play notification sound:', err);
                        // If file playback fails, fall back to synthesized sound
                        setUseWebAudioFallback(true);
                        generateLightningSound();
                    });
                }
            }
            catch (err) {
                console.error("Error playing notification:", err);
                // Fall back to Web Audio API
                setUseWebAudioFallback(true);
                generateLightningSound();
            }
        }
        else {
            console.warn("Audio element not initialized");
            // Try to generate sound anyway
            if (audioContextRef.current) {
                generateLightningSound();
            }
        }
    };
    // Expose the play method to the global window object
    useEffect(() => {
        if (typeof window !== 'undefined' && enabled) {
            console.log("Setting up global notification sound player");
            window.playNotificationSound = playNotification;
        }
        return () => {
            if (typeof window !== 'undefined') {
                delete window.playNotificationSound;
            }
        };
    }, [enabled, useWebAudioFallback]);
    // This component doesn't render anything visible
    return null;
}
