'use client';

import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';

interface Cat3DProps {
  size?: number;
  animate?: boolean;
}

export default function Cat3D({ size = 140, animate = true }: Cat3DProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [showHeart, setShowHeart] = useState(false);
  const [mood, setMood] = useState<'idle' | 'playful' | 'sleepy'>('idle');

  // Cycle moods
  useEffect(() => {
    if (!animate) return;
    const moods: ('idle' | 'playful' | 'sleepy')[] = ['idle', 'idle', 'playful', 'idle', 'sleepy', 'idle'];
    let i = 0;
    const t = setInterval(() => {
      i = (i + 1) % moods.length;
      setMood(moods[i]);
    }, 5000);
    return () => clearInterval(t);
  }, [animate]);

  const handleHover = () => {
    setIsHovered(true);
    setShowHeart(true);
    setTimeout(() => setShowHeart(false), 1000);
  };

  return (
    <div
      style={{ position: 'relative', width: size, display: 'inline-block' }}
      onMouseEnter={handleHover}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Floating heart on hover */}
      {showHeart && (
        <motion.div
          initial={{ opacity: 1, y: 0, scale: 0.5 }}
          animate={{ opacity: 0, y: -50, scale: 1.3 }}
          transition={{ duration: 0.9, ease: 'easeOut' }}
          style={{
            position: 'absolute',
            top: -20,
            left: '50%',
            transform: 'translateX(-50%)',
            fontSize: size * 0.2,
            pointerEvents: 'none',
            zIndex: 30,
          }}
        >
          💖
        </motion.div>
      )}

      {/* Mood bubble */}
      {mood === 'sleepy' && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          style={{
            position: 'absolute',
            top: -18,
            right: -10,
            fontSize: size * 0.18,
            zIndex: 30,
            pointerEvents: 'none',
          }}
        >
          💤
        </motion.div>
      )}
      {mood === 'playful' && (
        <motion.div
          initial={{ opacity: 0, y: 0 }}
          animate={{ opacity: [0, 1, 0], y: -30 }}
          transition={{ duration: 1.5, repeat: 3 }}
          style={{
            position: 'absolute',
            top: -18,
            right: -10,
            fontSize: size * 0.18,
            zIndex: 30,
            pointerEvents: 'none',
          }}
        >
          ✨
        </motion.div>
      )}

      {/* Main cat image - floats gently */}
      <motion.div
        animate={animate ? {
          y: mood === 'idle' ? [0, -10, 0] : mood === 'playful' ? [0, -20, 0, -12, 0] : [0, -4, 0],
          rotate: mood === 'playful' ? [0, 5, -5, 0] : mood === 'idle' ? [0, 1, -1, 0] : [0, 2, 0],
          scale: isHovered ? 1.06 : 1,
        } : {}}
        transition={{
          duration: mood === 'playful' ? 1.5 : mood === 'sleepy' ? 6 : 4,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
        style={{ position: 'relative', zIndex: 5 }}
      >
        <img
          src="/images/gallery/cute-cat.jpg"
          alt="Olajuwon"
          style={{
            width: size,
            height: size,
            objectFit: 'cover',
            borderRadius: 14,
            display: 'block',
            boxShadow: isHovered
              ? '0 20px 50px rgba(255,107,157,0.6)'
              : '0 10px 30px rgba(0,0,0,0.4)',
            transition: 'box-shadow 0.3s ease',
            filter: mood === 'sleepy' ? 'brightness(0.8) saturate(0.8)' : 'brightness(1)',
          }}
        />

        {/* Flower decorations */}
        <motion.div
          animate={{ rotate: [0, 12, 0] }}
          transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
          style={{ position: 'absolute', top: -14, left: -10, fontSize: size * 0.22, pointerEvents: 'none' }}
        >🌺</motion.div>

        <motion.div
          animate={{ rotate: [0, -10, 0] }}
          transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut', delay: 0.4 }}
          style={{ position: 'absolute', top: -16, right: -8, fontSize: size * 0.19, pointerEvents: 'none' }}
        >🌼</motion.div>

        <motion.div
          animate={{ rotate: [0, 15, 0] }}
          transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut', delay: 0.8 }}
          style={{ position: 'absolute', bottom: -10, left: size * 0.15, fontSize: size * 0.17, pointerEvents: 'none' }}
        >🌸</motion.div>
      </motion.div>

      {/* Name label */}
      <div style={{
        textAlign: 'center',
        marginTop: 8,
        fontSize: 12,
        fontWeight: 600,
        color: isHovered ? '#ffc1e0' : 'rgba(255,193,224,0.65)',
        textShadow: '0 2px 8px rgba(255,107,157,0.4)',
        fontFamily: 'var(--font-poppins), sans-serif',
        letterSpacing: '0.05em',
        transition: 'color 0.3s ease',
        pointerEvents: 'none',
      }}>
        Olajuwon 🐱
      </div>
    </div>
  );
}
