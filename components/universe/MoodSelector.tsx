'use client';

import { motion } from 'framer-motion';
import { WORLD } from '@/data/world';

interface MoodSelectorProps {
  currentMood: string | null;
  onSelect: (mood: string) => void;
  onBack: () => void;
}

export default function MoodSelector({ currentMood, onSelect, onBack }: MoodSelectorProps) {
  const moods = Object.entries(WORLD.moods);

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

      <div style={{ maxWidth: 560, width: '100%' }}>
        <h2 style={{
          fontFamily: 'var(--font-playfair), Georgia, serif',
          fontSize: 'clamp(1.3rem, 5vw, 2rem)',
          color: '#e8d4a0',
          marginBottom: 'clamp(16px, 5vw, 28px)',
          textAlign: 'center',
          fontWeight: 400,
        }}>How are you feeling?</h2>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(clamp(100px, 22vw, 130px), 1fr))',
          gap: 'clamp(8px, 2.5vw, 14px)',
        }}>
          {moods.map(([key, mood], index) => (
            <motion.button
              key={key}
              initial={{ opacity: 0, scale: 0.85 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.04 }}
              whileHover={{ scale: 1.08 }}
              whileTap={{ scale: 0.94 }}
              onClick={() => onSelect(key)}
              style={{
                background: currentMood === key
                  ? 'rgba(200,168,48,0.15)'
                  : 'rgba(20,16,12,0.88)',
                border: `1px solid ${currentMood === key ? 'rgba(200,168,48,0.6)' : 'rgba(200,168,48,0.2)'}`,
                borderRadius: 16,
                padding: 'clamp(12px, 3.5vw, 20px) 8px',
                cursor: 'pointer',
                textAlign: 'center',
                boxShadow: currentMood === key ? '0 0 20px rgba(200,168,48,0.2)' : 'none',
                transition: 'all 0.2s ease',
              }}
            >
              <div style={{ fontSize: 'clamp(28px, 8vw, 38px)', marginBottom: 6, lineHeight: 1 }}>{mood.emoji}</div>
              <p style={{ color: '#e8d4a0', fontSize: 'clamp(10px, 2.5vw, 13px)', fontWeight: 600, margin: 0 }}>{mood.name}</p>
            </motion.button>
          ))}
        </div>

        <p style={{
          color: 'rgba(232,181,181,0.4)',
          fontSize: 'clamp(10px, 2.5vw, 12px)',
          marginTop: 'clamp(14px, 4vw, 24px)',
          textAlign: 'center',
        }}>
          Your world will shift to match your mood
        </p>
      </div>
    </motion.div>
  );
}
