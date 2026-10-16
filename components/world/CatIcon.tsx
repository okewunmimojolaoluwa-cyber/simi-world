'use client';

import { motion } from 'framer-motion';

/**
 * CatIcon — a clean black-and-white cartoon cat face drawn in SVG.
 * No images, no pink. Used everywhere Olajuwon is referenced on the home page.
 */

interface CatIconProps {
  size?: number;
  animated?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

export default function CatIcon({ size = 32, animated = true, className, style }: CatIconProps) {
  return (
    <motion.svg
      viewBox="0 0 100 100"
      width={size}
      height={size}
      className={className}
      style={style}
      animate={animated ? { y: [0, -2, 0] } : {}}
      transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
    >
      {/* Head */}
      <circle cx="50" cy="54" r="34" fill="#1a1a1f" />

      {/* White muzzle */}
      <ellipse cx="50" cy="65" rx="15" ry="11" fill="#f0ece3" />

      {/* White cheeks */}
      <ellipse cx="32" cy="64" rx="10" ry="8" fill="#f0ece3" opacity="0.6" />
      <ellipse cx="68" cy="64" rx="10" ry="8" fill="#f0ece3" opacity="0.6" />

      {/* Left ear */}
      <polygon points="16,30 26,52 36,30" fill="#1a1a1f" />
      <polygon points="19,32 26,47 33,32" fill="#c8606e" opacity="0.7" />

      {/* Right ear */}
      <polygon points="84,30 74,52 64,30" fill="#1a1a1f" />
      <polygon points="81,32 74,47 67,32" fill="#c8606e" opacity="0.7" />

      {/* Left eye */}
      <ellipse cx="37" cy="50" rx="8" ry="9" fill="#c8950e" />
      <ellipse cx="37" cy="51" rx="4.5" ry="6.5" fill="#0a0a0a" />
      <circle cx="39" cy="47" r="2" fill="white" />

      {/* Right eye */}
      <ellipse cx="63" cy="50" rx="8" ry="9" fill="#c8950e" />
      <ellipse cx="63" cy="51" rx="4.5" ry="6.5" fill="#0a0a0a" />
      <circle cx="65" cy="47" r="2" fill="white" />

      {/* Nose */}
      <ellipse cx="50" cy="62" rx="3.5" ry="2.5" fill="#d4707e" />

      {/* Mouth */}
      <path d="M 44 66 Q 50 71 56 66" fill="none" stroke="#8a5a5a" strokeWidth="1.8" strokeLinecap="round" />
      <line x1="50" y1="62" x2="50" y2="66" stroke="#d4707e" strokeWidth="1.2" />

      {/* Whiskers left */}
      <line x1="10" y1="60" x2="36" y2="63" stroke="#aaa" strokeWidth="1.2" strokeLinecap="round" opacity="0.8" />
      <line x1="10" y1="64" x2="36" y2="65" stroke="#aaa" strokeWidth="1.2" strokeLinecap="round" opacity="0.8" />
      <line x1="10" y1="68" x2="36" y2="67" stroke="#aaa" strokeWidth="1.2" strokeLinecap="round" opacity="0.8" />

      {/* Whiskers right */}
      <line x1="90" y1="60" x2="64" y2="63" stroke="#aaa" strokeWidth="1.2" strokeLinecap="round" opacity="0.8" />
      <line x1="90" y1="64" x2="64" y2="65" stroke="#aaa" strokeWidth="1.2" strokeLinecap="round" opacity="0.8" />
      <line x1="90" y1="68" x2="64" y2="67" stroke="#aaa" strokeWidth="1.2" strokeLinecap="round" opacity="0.8" />
    </motion.svg>
  );
}
