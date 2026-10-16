'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import FadeIn from './animations/FadeIn';
import Confetti from './Confetti';

export default function BirthdayCake() {
  const [candlesLit, setCandlesLit] = useState(true);
  const [showConfetti, setShowConfetti] = useState(false);
  const [showMessage, setShowMessage] = useState(false);

  const blowCandles = () => {
    setCandlesLit(false);
    setShowConfetti(true);
    
    setTimeout(() => {
      setShowMessage(true);
    }, 500);

    setTimeout(() => {
      setShowConfetti(false);
    }, 5000);
  };

  return (
    <section className="relative py-32 px-6 md:px-12 lg:px-24">
      <div className="max-w-4xl mx-auto text-center">
        <FadeIn>
          <h2 className="text-4xl md:text-6xl font-serif text-warm-ivory mb-12">
            Make a Wish ✨
          </h2>
        </FadeIn>

        <div className="flex justify-center mb-12">
          <Cake candlesLit={candlesLit} />
        </div>

        <AnimatePresence mode="wait">
          {candlesLit ? (
            <motion.button
              key="blow-button"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={blowCandles}
              className="px-10 py-4 bg-deep-burgundy text-warm-ivory rounded-full text-lg font-medium shadow-xl hover:bg-opacity-90 transition-all"
            >
              Blow out the candles 🎂
            </motion.button>
          ) : showMessage && (
            <motion.div
              key="message"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, ease: 'easeOut' }}
              className="space-y-4"
            >
              <p className="text-3xl md:text-4xl font-serif text-gold-accent">
                Happy Birthday! 🎉
              </p>
              <p className="text-xl text-soft-rose">
                May all your wishes come true
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {showConfetti && <Confetti />}
    </section>
  );
}

interface CakeProps {
  candlesLit: boolean;
}

function Cake({ candlesLit }: CakeProps) {
  return (
    <div className="relative">
      {/* Cake layers */}
      <svg width="280" height="280" viewBox="0 0 280 280" className="drop-shadow-2xl">
        {/* Bottom layer */}
        <ellipse cx="140" cy="220" rx="100" ry="20" fill="#8B4513" />
        <rect x="40" y="180" width="200" height="40" fill="#A0522D" />
        <ellipse cx="140" cy="180" rx="100" ry="20" fill="#CD853F" />
        
        {/* Middle layer */}
        <ellipse cx="140" cy="160" rx="80" ry="16" fill="#8B4513" />
        <rect x="60" y="130" width="160" height="30" fill="#A0522D" />
        <ellipse cx="140" cy="130" rx="80" ry="16" fill="#CD853F" />
        
        {/* Top layer */}
        <ellipse cx="140" cy="115" rx="60" ry="12" fill="#8B4513" />
        <rect x="80" y="90" width="120" height="25" fill="#A0522D" />
        <ellipse cx="140" cy="90" rx="60" ry="12" fill="#CD853F" />

        {/* Frosting decorations */}
        <circle cx="140" cy="200" r="4" fill="#FFB6C1" />
        <circle cx="120" cy="205" r="4" fill="#FFB6C1" />
        <circle cx="160" cy="205" r="4" fill="#FFB6C1" />
        <circle cx="100" cy="195" r="4" fill="#FFB6C1" />
        <circle cx="180" cy="195" r="4" fill="#FFB6C1" />

        {/* Candles */}
        <Candle x={100} lit={candlesLit} delay={0} />
        <Candle x={140} lit={candlesLit} delay={0.1} />
        <Candle x={180} lit={candlesLit} delay={0.2} />
      </svg>
    </div>
  );
}

interface CandleProps {
  x: number;
  lit: boolean;
  delay: number;
}

function Candle({ x, lit, delay }: CandleProps) {
  return (
    <g>
      {/* Candle stick */}
      <rect x={x - 3} y={60} width="6" height="30" fill="#FFF8DC" stroke="#DEB887" strokeWidth="0.5" />
      
      {/* Wick */}
      <line x1={x} y1={60} x2={x} y2={50} stroke="#333" strokeWidth="1" />
      
      {/* Flame */}
      <AnimatePresence>
        {lit && (
          <motion.g
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0 }}
            transition={{ duration: 0.3, delay }}
          >
            {/* Flame glow */}
            <motion.ellipse
              cx={x}
              cy={45}
              rx="8"
              ry="12"
              fill="url(#flameGradient)"
              animate={{
                scale: [1, 1.1, 1],
                opacity: [0.8, 1, 0.8],
              }}
              transition={{
                duration: 0.8,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
            />
            {/* Flame core */}
            <ellipse cx={x} cy={47} rx="4" ry="6" fill="#FFD700" />
          </motion.g>
        )}
      </AnimatePresence>

      {/* Smoke after blowing */}
      <AnimatePresence>
        {!lit && (
          <motion.g
            initial={{ opacity: 0, y: 0 }}
            animate={{ opacity: [0.6, 0], y: -30 }}
            transition={{ duration: 2, ease: 'easeOut' }}
          >
            <circle cx={x} cy={50} r="3" fill="#999" opacity="0.5" />
            <circle cx={x + 2} cy={45} r="2" fill="#AAA" opacity="0.4" />
            <circle cx={x - 2} cy={42} r="2" fill="#BBB" opacity="0.3" />
          </motion.g>
        )}
      </AnimatePresence>

      {/* Gradient definition */}
      <defs>
        <radialGradient id="flameGradient">
          <stop offset="0%" stopColor="#FFF" stopOpacity="1" />
          <stop offset="30%" stopColor="#FFD700" stopOpacity="1" />
          <stop offset="70%" stopColor="#FF8C00" stopOpacity="0.8" />
          <stop offset="100%" stopColor="#FF4500" stopOpacity="0.4" />
        </radialGradient>
      </defs>
    </g>
  );
}
