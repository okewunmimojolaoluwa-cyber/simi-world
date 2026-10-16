'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CONTENT } from '@/config/content';

interface FunEntranceProps {
  onStart: () => void;
}

export default function FunEntrance({ onStart }: FunEntranceProps) {
  const [phase, setPhase] = useState<'bouncing' | 'explode' | 'reveal'>('bouncing');
  const [clickedLetters, setClickedLetters] = useState<number[]>([]);
  const [showHint, setShowHint] = useState(true);

  const name = CONTENT.HER_NAME;
  const letters = name.split('');

  // Auto-progress after 7s if no interaction
  useEffect(() => {
    const t = setTimeout(() => { if (phase === 'bouncing') setPhase('reveal'); }, 7000);
    return () => clearTimeout(t);
  }, [phase]);

  const handleLetterClick = (index: number) => {
    if (clickedLetters.includes(index)) return;
    const next = [...clickedLetters, index];
    setClickedLetters(next);
    setShowHint(false);
    if (next.length === letters.length) {
      setTimeout(() => { setPhase('explode'); setTimeout(() => setPhase('reveal'), 1000); }, 300);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-[#1a1618] via-[#2a1e24] to-[#3a2630] overflow-hidden">
      <AnimatePresence mode="wait">

        {/* ══ PHASE 1: BOUNCING LETTERS ══ */}
        {phase === 'bouncing' && (
          <motion.div key="bouncing" exit={{ opacity: 0, scale: 0.5, transition: { duration: 0.4 } }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 40 }}>

            {/* Top label */}
            <motion.p
              initial={{ opacity: 0, y: -12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              style={{
                fontFamily: 'var(--font-poppins), sans-serif',
                fontSize: 'clamp(10px, 3vw, 13px)',
                color: 'rgba(212,175,55,0.5)',
                letterSpacing: '0.22em',
                textTransform: 'uppercase',
                fontWeight: 500,
              }}
            >
              This is for you
            </motion.p>

            {/* Letter row */}
            <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 'clamp(6px, 2vw, 16px)', maxWidth: '90vw' }}>
              {letters.map((letter, i) => {
                const clicked = clickedLetters.includes(i);
                return (
                  <motion.div
                    key={i}
                    onClick={() => handleLetterClick(i)}
                    initial={{ y: -80, opacity: 0 }}
                    animate={{
                      y: clicked ? 0 : [0, -28, 0],
                      opacity: 1,
                      rotate: clicked ? [0, 720] : [0, 4, -4, 0],
                      scale: clicked ? [1, 1.5, 1.15] : 1,
                    }}
                    transition={{
                      y:       { duration: 0.65, repeat: clicked ? 0 : Infinity, delay: i * 0.08, ease: 'easeInOut' },
                      opacity: { duration: 0.3,  delay: i * 0.08 },
                      rotate:  { duration: clicked ? 0.55 : 0.7, repeat: clicked ? 0 : Infinity, delay: i * 0.08 },
                      scale:   { duration: 0.4 },
                    }}
                    whileHover={!clicked ? { scale: 1.3, y: -12, transition: { duration: 0.18 } } : {}}
                    whileTap={!clicked ? { scale: 0.88 } : {}}
                    style={{
                      fontFamily: 'var(--font-playfair), Georgia, serif',
                      fontSize: 'clamp(2.8rem, 10vw, 6rem)',
                      fontWeight: 700,
                      color: clicked ? '#d4af37' : '#f8f0e8',
                      cursor: 'pointer',
                      userSelect: 'none',
                      lineHeight: 1,
                      textShadow: clicked
                        ? '0 0 28px rgba(212,175,55,0.85), 0 0 56px rgba(212,175,55,0.4)'
                        : '0 4px 24px rgba(212,175,55,0.35), 0 2px 8px rgba(0,0,0,0.6)',
                      position: 'relative',
                      letterSpacing: '-0.02em',
                    }}
                  >
                    {letter === ' ' ? '\u00A0' : letter}
                    {clicked && (
                      <motion.span
                        initial={{ scale: 0, opacity: 1 }}
                        animate={{ scale: 3.5, opacity: 0 }}
                        transition={{ duration: 0.55 }}
                        style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none', fontSize: '0.35em' }}
                      >✨</motion.span>
                    )}
                  </motion.div>
                );
              })}
            </div>

            {/* Progress + hint */}
            <div style={{ width: 'clamp(200px, 60vw, 320px)', textAlign: 'center' }}>
              <div style={{ height: 3, background: 'rgba(212,175,55,0.15)', borderRadius: 3, overflow: 'hidden', marginBottom: 14 }}>
                <motion.div
                  animate={{ width: `${(clickedLetters.length / letters.length) * 100}%` }}
                  transition={{ duration: 0.3 }}
                  style={{ height: '100%', background: 'linear-gradient(90deg, #c8a830, #e8d080)', borderRadius: 3 }}
                />
              </div>
              <motion.p
                animate={{ opacity: showHint ? [0.5, 1, 0.5] : 1 }}
                transition={{ duration: 2, repeat: showHint ? Infinity : 0 }}
                style={{
                  fontFamily: 'var(--font-poppins), sans-serif',
                  fontSize: 'clamp(12px, 3.5vw, 16px)',
                  color: 'rgba(248,240,232,0.6)',
                  fontWeight: 300,
                  letterSpacing: '0.04em',
                }}
              >
                {clickedLetters.length === 0
                  ? 'Tap each letter ✨'
                  : clickedLetters.length < letters.length
                  ? `${letters.length - clickedLetters.length} to go...`
                  : 'Perfect! 🎉'
                }
              </motion.p>
            </div>

            {/* Floating hearts */}
            <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
              {[...Array(12)].map((_, i) => (
                <motion.div key={i}
                  initial={{ y: '110vh', opacity: 0, x: `${(i / 12) * 100}%` }}
                  animate={{ y: '-20vh', opacity: [0, 0.7, 0.7, 0] }}
                  transition={{ duration: 4 + i * 0.4, repeat: Infinity, delay: i * 0.55, ease: 'easeInOut' }}
                  style={{ position: 'absolute', left: `${(i / 12) * 100}%`, fontSize: 'clamp(20px, 5vw, 32px)' }}
                >
                  {['❤️','💛','✨','🎉','💫','🎁'][i % 6]}
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* ══ PHASE 2: EXPLODE ══ */}
        {phase === 'explode' && (
          <motion.div key="explode" style={{ display: 'flex', gap: 'clamp(6px, 2vw, 16px)' }}>
            {letters.map((letter, i) => (
              <motion.div key={i}
                initial={{ x: 0, y: 0, opacity: 1 }}
                animate={{
                  x: (Math.random() - 0.5) * Math.min(window.innerWidth * 0.8, 600),
                  y: (Math.random() - 0.5) * Math.min(window.innerHeight * 0.8, 500),
                  rotate: Math.random() * 720 - 360,
                  scale: [1, 2, 0],
                  opacity: [1, 1, 0],
                }}
                transition={{ duration: 0.75, delay: i * 0.04 }}
                style={{
                  fontFamily: 'var(--font-playfair), Georgia, serif',
                  fontSize: 'clamp(2.5rem, 9vw, 5rem)',
                  fontWeight: 700,
                  color: '#d4af37',
                  textShadow: '0 0 30px rgba(212,175,55,0.7)',
                }}
              >
                {letter === ' ' ? '\u00A0' : letter}
              </motion.div>
            ))}
          </motion.div>
        )}

        {/* ══ PHASE 3: REVEAL ══ */}
        {phase === 'reveal' && (
          <motion.div key="reveal"
            initial={{ opacity: 0, scale: 0.88 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.65, ease: [0.34, 1.56, 0.64, 1] }}
            style={{ textAlign: 'center', padding: '0 clamp(20px, 6vw, 48px)', maxWidth: 560 }}
          >
            {/* Emoji burst */}
            <motion.div
              initial={{ scale: 0 }} animate={{ scale: [0, 1.4, 1] }}
              transition={{ duration: 0.6, ease: 'backOut' }}
              style={{ fontSize: 'clamp(48px, 14vw, 80px)', marginBottom: 20 }}
            >
              🎉
            </motion.div>

            {/* Main heading */}
            <motion.h1
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.25 }}
              style={{
                fontFamily: 'var(--font-playfair), Georgia, serif',
                fontSize: 'clamp(2rem, 10vw, 4.2rem)',
                fontWeight: 400,
                color: '#f8f0e8',
                marginBottom: 12,
                lineHeight: 1.15,
                letterSpacing: '-0.02em',
                textShadow: '0 4px 30px rgba(212,175,55,0.25)',
              }}
            >
              Happy Birthday!
            </motion.h1>

            {/* Name line */}
            <motion.p
              initial={{ y: 16, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.55, delay: 0.42 }}
              style={{
                fontFamily: 'var(--font-poppins), sans-serif',
                fontSize: 'clamp(1rem, 4.5vw, 1.5rem)',
                fontWeight: 300,
                color: 'rgba(232,181,181,0.8)',
                marginBottom: 32,
                letterSpacing: '0.04em',
              }}
            >
              {CONTENT.HER_NAME}, today is all about you 🎂
            </motion.p>

            {/* CTA Button */}
            <motion.button
              initial={{ y: 16, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.55, delay: 0.60 }}
              whileHover={{ scale: 1.06, boxShadow: '0 0 40px rgba(212,175,55,0.55)' }}
              whileTap={{ scale: 0.96 }}
              onClick={onStart}
              style={{
                padding: 'clamp(12px, 3vw, 16px) clamp(32px, 8vw, 52px)',
                background: 'linear-gradient(135deg, #6b2737 0%, #c8a830 100%)',
                color: '#f8f0e8',
                borderRadius: 50,
                border: 'none',
                cursor: 'pointer',
                fontFamily: 'var(--font-poppins), sans-serif',
                fontSize: 'clamp(14px, 3.5vw, 17px)',
                fontWeight: 600,
                letterSpacing: '0.06em',
                boxShadow: '0 8px 32px rgba(212,175,55,0.35)',
                transition: 'box-shadow 0.25s',
              }}
            >
              Let&apos;s Celebrate 🎊
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
