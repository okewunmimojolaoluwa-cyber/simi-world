'use client';

import { motion } from 'framer-motion';
import { useState } from 'react';
import { WORLD } from '@/data/world';
import { UniverseState } from '@/lib/persistence';
import { incrementSmileClicks } from '@/lib/persistence';

interface MakeMeSmileProps {
  state: UniverseState;
  updateState: (updates: Partial<UniverseState>) => void;
  onBack: () => void;
}

export default function MakeMeSmile({ state, updateState, onBack }: MakeMeSmileProps) {
  const [currentContent, setCurrentContent] = useState<any>(null);

  const generateSmile = () => {
    const idx = Math.floor(Math.random() * WORLD.smileContent.length);
    setCurrentContent(WORLD.smileContent[idx]);
    incrementSmileClicks();
    updateState({ smileClicks: state.smileClicks + 1 });
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      style={{
        width: '100%',
        minHeight: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 'clamp(16px, 5vw, 40px)',
        paddingTop: 'clamp(72px, 12vw, 80px)',
        paddingBottom: 'clamp(24px, 5vw, 40px)',
        boxSizing: 'border-box',
        overflowY: 'auto',
        fontFamily: 'var(--font-poppins), sans-serif',
      }}
    >
      <motion.button
        onClick={onBack}
        whileHover={{ x: -4 }}
        style={{
          position: 'absolute',
          top: 'clamp(16px, 4vw, 24px)',
          left: 'clamp(12px, 4vw, 24px)',
          background: 'rgba(14,11,8,0.8)',
          border: '1px solid rgba(200,168,48,0.25)',
          borderRadius: 20,
          padding: '6px 14px',
          color: 'rgba(200,168,48,0.8)',
          cursor: 'pointer',
          fontSize: 'clamp(11px, 3vw, 13px)',
          fontWeight: 700,
          zIndex: 10,
        }}
      >
        ← Back
      </motion.button>

      <div style={{ textAlign: 'center', maxWidth: 480, width: '100%' }}>
        <h2 style={{
          fontFamily: 'var(--font-playfair), Georgia, serif',
          fontSize: 'clamp(1.3rem, 5vw, 2rem)',
          color: '#e8d4a0',
          marginBottom: 'clamp(20px, 5vw, 32px)',
          fontWeight: 400,
        }}>Make Me Smile 😊</h2>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={generateSmile}
          style={{
            background: 'linear-gradient(135deg, #c8a830, #e8d080)',
            color: '#0a0908',
            padding: 'clamp(12px, 3.5vw, 16px) clamp(24px, 8vw, 40px)',
            borderRadius: 50,
            fontSize: 'clamp(14px, 4vw, 18px)',
            fontWeight: 700,
            border: 'none',
            cursor: 'pointer',
            boxShadow: '0 8px 32px rgba(200,168,48,0.35)',
            marginBottom: 'clamp(16px, 5vw, 28px)',
            display: 'inline-block',
          }}
        >
          ✨ Click Me ✨
        </motion.button>

        {currentContent && (
          <motion.div
            key={currentContent.text || currentContent.title}
            initial={{ scale: 0.85, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', damping: 15 }}
            style={{
              background: 'rgba(20,16,12,0.9)',
              border: '1px solid rgba(200,168,48,0.25)',
              borderRadius: 20,
              padding: 'clamp(16px, 5vw, 28px)',
              boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
            }}
          >
            {currentContent.emoji && (
              <div style={{ fontSize: 'clamp(36px, 12vw, 56px)', marginBottom: 12 }}>{currentContent.emoji}</div>
            )}
            {currentContent.title && (
              <h3 style={{ fontSize: 'clamp(1.1rem, 4vw, 1.5rem)', color: '#e8d4a0', marginBottom: 8, fontFamily: 'var(--font-playfair), Georgia, serif', fontWeight: 400 }}>{currentContent.title}</h3>
            )}
            <p style={{ color: '#c8b89a', fontSize: 'clamp(0.9rem, 3.5vw, 1.05rem)', lineHeight: 1.7 }}>
              {currentContent.text}
            </p>
          </motion.div>
        )}

        <p style={{ color: 'rgba(232,181,181,0.35)', fontSize: 'clamp(10px, 2.5vw, 12px)', marginTop: 16 }}>
          Clicked {state.smileClicks} times
        </p>
      </div>
    </motion.div>
  );
}
