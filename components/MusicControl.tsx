'use client';

import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { CONTENT } from '@/config/content';

export default function MusicControl() {
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    audioRef.current = new Audio(CONTENT.MUSIC_URL);
    audioRef.current.loop = true;
    audioRef.current.volume = 0.3;

    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  const toggleMusic = () => {
    if (!audioRef.current) return;

    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play().catch(() => {
        // Handle autoplay restrictions
      });
      setIsPlaying(true);
    }
  };

  return (
    <motion.button
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: 2 }}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      onClick={toggleMusic}
      className="fixed bottom-8 right-8 z-40 w-14 h-14 bg-deep-burgundy/80 backdrop-blur-sm rounded-full flex items-center justify-center shadow-2xl hover:bg-deep-burgundy transition-colors focus:outline-none focus:ring-2 focus:ring-gold-accent"
      aria-label={isPlaying ? 'Pause music' : 'Play music'}
    >
      <motion.div
        animate={isPlaying ? { scale: [1, 1.2, 1] } : { scale: 1 }}
        transition={{ duration: 0.8, repeat: isPlaying ? Infinity : 0 }}
      >
        {isPlaying ? (
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            className="text-warm-ivory"
          >
            <rect x="6" y="4" width="4" height="16" />
            <rect x="14" y="4" width="4" height="16" />
          </svg>
        ) : (
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            className="text-warm-ivory ml-1"
          >
            <path d="M9 18V5l12-2v13" />
            <circle cx="6" cy="18" r="3" />
            <circle cx="18" cy="16" r="3" />
          </svg>
        )}
      </motion.div>
    </motion.button>
  );
}
