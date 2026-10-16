'use client';

import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

export default function LoadingScreen() {
  const [progress, setProgress] = useState(0);
  const [phrase, setPhrase] = useState(0);

  const phrases = [
    'Preparing something special...',
    'Almost there...',
    'Getting everything ready...',
    'Almost done...',
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) { clearInterval(interval); return 100; }
        return Math.min(prev + Math.random() * 12, 100);
      });
    }, 120);
    const phraseTimer = setInterval(() => setPhrase(p => (p + 1) % phrases.length), 1800);
    return () => { clearInterval(interval); clearInterval(phraseTimer); };
  }, []); // eslint-disable-line

  return (
    <div className="fixed inset-0 bg-[#0a0908] flex items-center justify-center">
      <div style={{ textAlign: 'center', padding: '0 24px' }}>

        {/* Animated star/sparkle mark */}
        <motion.div
          initial={{ opacity: 0, scale: 0.6 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, ease: [0.34, 1.56, 0.64, 1] }}
          style={{ marginBottom: 28 }}
        >
          <motion.svg width="48" height="48" viewBox="0 0 48 48" fill="none"
            animate={{ rotate: [0, 15, -15, 0] }}
            transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}>
            <path d="M24 4L27.5 18.5L42 22L27.5 25.5L24 40L20.5 25.5L6 22L20.5 18.5Z"
              fill="none" stroke="#c8a830" strokeWidth="1.4" strokeLinejoin="round" />
            <circle cx="24" cy="22" r="3" fill="#c8a830" opacity="0.5" />
          </motion.svg>
        </motion.div>

        {/* Main heading */}
        <motion.h1
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.65, delay: 0.15 }}
          style={{
            fontFamily: 'var(--font-playfair), Georgia, serif',
            fontSize: 'clamp(1.1rem, 5vw, 1.6rem)',
            fontWeight: 400,
            color: '#e8d4a0',
            letterSpacing: '0.22em',
            textTransform: 'uppercase',
            marginBottom: 8,
          }}
        >
          Loading Your Universe
        </motion.h1>

        {/* Sub-line */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.35 }}
          style={{
            fontFamily: 'var(--font-poppins), sans-serif',
            fontSize: 'clamp(11px, 3vw, 13px)',
            color: 'rgba(200,168,48,0.38)',
            letterSpacing: '0.06em',
            marginBottom: 36,
            fontWeight: 300,
          }}
        >
          Simi&apos;s World
        </motion.p>

        {/* Progress bar */}
        <motion.div
          initial={{ opacity: 0, scaleX: 0.6 }}
          animate={{ opacity: 1, scaleX: 1 }}
          transition={{ delay: 0.4, duration: 0.5 }}
          style={{ width: 'clamp(200px, 60vw, 280px)', margin: '0 auto 16px' }}
        >
          <div style={{ height: 2, background: 'rgba(200,168,48,0.12)', borderRadius: 2, overflow: 'hidden' }}>
            <motion.div
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.35, ease: 'easeOut' }}
              style={{
                height: '100%',
                background: 'linear-gradient(90deg, #c8a830, #e8d080)',
                borderRadius: 2,
                boxShadow: '0 0 10px rgba(200,168,48,0.5)',
              }}
            />
          </div>
        </motion.div>

        {/* Changing phrase */}
        <motion.div style={{ height: 20 }}>
          <motion.p
            key={phrase}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.35 }}
            style={{
              fontFamily: 'var(--font-poppins), sans-serif',
              fontSize: 'clamp(10px, 2.5vw, 12px)',
              color: 'rgba(200,168,48,0.35)',
              letterSpacing: '0.08em',
              fontStyle: 'italic',
            }}
          >
            {phrases[phrase]}
          </motion.p>
        </motion.div>
      </div>
    </div>
  );
}
