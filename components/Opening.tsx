'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CONTENT } from '@/config/content';

interface OpeningProps {
  onStart: () => void;
}

export default function Opening({ onStart }: OpeningProps) {
  const [step, setStep] = useState(0);

  useEffect(() => {
    const t1 = setTimeout(() => setStep(1), 900);
    const t2 = setTimeout(() => setStep(2), 2800);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-[#1a1618] via-[#2a1e24] to-[#3a2630]">
      {/* Ambient gold glow */}
      <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at 50% 60%, rgba(212,175,55,0.07), transparent 65%)', pointerEvents: 'none' }} />

      <div style={{ textAlign: 'center', padding: '0 clamp(20px,6vw,48px)', maxWidth: 680, position: 'relative', zIndex: 1 }}>

        <AnimatePresence mode="wait">
          {step >= 0 && (
            <motion.h1
              key="greeting"
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.9, ease: 'easeOut' }}
              style={{
                fontFamily: 'var(--font-playfair), Georgia, serif',
                fontSize: 'clamp(2.2rem, 9vw, 5rem)',
                fontWeight: 400,
                color: '#f5ede2',
                marginBottom: 'clamp(16px, 4vw, 28px)',
                lineHeight: 1.15,
                letterSpacing: '-0.02em',
                textShadow: '0 4px 32px rgba(212,175,55,0.22)',
              }}
            >
              {CONTENT.INTRO_MESSAGES.greeting}
            </motion.h1>
          )}
        </AnimatePresence>

        <AnimatePresence mode="wait">
          {step >= 1 && (
            <motion.p
              key="subtitle"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              transition={{ duration: 0.85, ease: 'easeOut', delay: 0.15 }}
              style={{
                fontFamily: 'var(--font-poppins), sans-serif',
                fontSize: 'clamp(1rem, 4vw, 1.45rem)',
                fontWeight: 300,
                color: 'rgba(232,181,181,0.85)',
                marginBottom: 'clamp(32px, 7vw, 52px)',
                letterSpacing: '0.03em',
                lineHeight: 1.6,
              }}
            >
              {CONTENT.INTRO_MESSAGES.subtitle}
            </motion.p>
          )}
        </AnimatePresence>

        <AnimatePresence mode="wait">
          {step >= 2 && (
            <motion.button
              key="button"
              initial={{ opacity: 0, scale: 0.88 }}
              animate={{ opacity: 1, scale: 1 }}
              whileHover={{ scale: 1.06, boxShadow: '0 0 40px rgba(212,175,55,0.45)' }}
              whileTap={{ scale: 0.95 }}
              transition={{ duration: 0.5, ease: [0.34, 1.56, 0.64, 1] }}
              onClick={onStart}
              style={{
                padding: 'clamp(12px,3vw,16px) clamp(32px,8vw,56px)',
                background: 'linear-gradient(135deg, #6b2737 0%, #c8a830 100%)',
                color: '#f5ede2',
                borderRadius: 50,
                border: 'none',
                cursor: 'pointer',
                fontFamily: 'var(--font-poppins), sans-serif',
                fontSize: 'clamp(13px, 3.5vw, 16px)',
                fontWeight: 600,
                letterSpacing: '0.10em',
                textTransform: 'uppercase' as const,
                boxShadow: '0 8px 32px rgba(212,175,55,0.28)',
                transition: 'box-shadow 0.25s',
              }}
            >
              {CONTENT.INTRO_MESSAGES.buttonText}
            </motion.button>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
