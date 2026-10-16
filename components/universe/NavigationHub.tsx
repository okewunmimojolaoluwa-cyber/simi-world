'use client';

import { motion } from 'framer-motion';
import { useState } from 'react';

interface NavigationHubProps {
  name: string;
  onNavigate: (view: any) => void;
  birthdayMode: boolean;
}

export default function NavigationHub({ name, onNavigate, birthdayMode }: NavigationHubProps) {
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  const features: Array<{
    id: string;
    icon: string;
    label: string;
    onClick: () => void;
    glow: 'yellow' | 'pink' | 'purple' | 'blue';
  }> = [
    { id: 'games', icon: '🎮', label: 'Play Games', onClick: () => onNavigate('games'), glow: 'purple' },
    { id: 'gift', icon: '🎁', label: 'Surprise Box', onClick: () => onNavigate('daily'), glow: 'yellow' },
    { id: 'memories', icon: '📸', label: 'Best Pics of You', onClick: () => onNavigate('memories'), glow: 'pink' },
    { id: 'vibe', icon: '💿', label: 'My Vibe', onClick: () => onNavigate('mood'), glow: 'purple' },
    { id: 'openwhen', icon: '💌', label: 'Open When...', onClick: () => onNavigate('openwhen'), glow: 'pink' },
    { id: 'pet', icon: '🐾', label: 'My Pet', onClick: () => onNavigate('pet'), glow: 'blue' },
    { id: 'random', icon: '🔮', label: 'Random Fun', onClick: () => onNavigate('smile'), glow: 'blue' },
    { id: 'mood', icon: '😊', label: 'My Mood', onClick: () => onNavigate('mood'), glow: 'yellow' },
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="relative w-full h-full flex flex-col items-center justify-center px-4 sm:px-6 md:px-8 py-8"
    >
      {/* Main Greeting - Clean & Centered */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.6 }}
        className="text-center mb-8 sm:mb-10 md:mb-12 z-20"
      >
        <div className="flex items-center justify-center gap-2 sm:gap-3 mb-2 sm:mb-3">
          <motion.span 
            className="text-3xl sm:text-4xl md:text-5xl"
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          >
            ♡
          </motion.span>
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl text-white font-bold drop-shadow-md">
            Hey <span className="font-extrabold bg-gradient-to-r from-pink-300 via-yellow-200 to-pink-300 bg-clip-text text-transparent drop-shadow">
              {name}!
            </span>
          </h1>
        </div>
        <p className="text-[#ffe8f3] text-lg sm:text-xl md:text-2xl font-semibold drop-shadow">What are we doing today?</p>
      </motion.div>

      {/* Feature Grid - Professional Layout */}
      <div className="w-full max-w-6xl">
        {/* Desktop: 4 columns, Tablet: 3 columns, Mobile: 2 columns */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-5 md:gap-6 lg:gap-8">
          {features.map((feature, index) => (
            <FeatureCard
              key={feature.id}
              {...feature}
              index={index}
              hovered={hoveredId === feature.id}
              onHover={setHoveredId}
            />
          ))}
        </div>
      </div>

      {/* Birthday Mode Indicator */}
      {birthdayMode && (
        <motion.div
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          className="absolute top-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-yellow-400 to-orange-400 px-4 sm:px-6 py-2 rounded-full shadow-2xl z-30"
        >
          <p className="text-black font-semibold text-xs sm:text-sm">🎉 BIRTHDAY MODE! 🎉</p>
        </motion.div>
      )}
    </motion.div>
  );
}

// Feature Card Component - Clean & Modern
interface FeatureCardProps {
  id: string;
  icon: string;
  label: string;
  onClick: () => void;
  index: number;
  hovered: boolean;
  onHover: (id: string | null) => void;
  glow?: 'yellow' | 'pink' | 'purple' | 'blue';
}

function FeatureCard({
  id,
  icon,
  label,
  onClick,
  index,
  hovered,
  onHover,
  glow = 'purple'
}: FeatureCardProps) {
  const glowColors = {
    yellow: { bg: 'rgba(255, 217, 102, 0.3)', shadow: 'rgba(255, 217, 102, 0.5)' },
    pink: { bg: 'rgba(255, 107, 157, 0.3)', shadow: 'rgba(255, 107, 157, 0.5)' },
    purple: { bg: 'rgba(183, 148, 246, 0.3)', shadow: 'rgba(183, 148, 246, 0.5)' },
    blue: { bg: 'rgba(147, 197, 253, 0.3)', shadow: 'rgba(147, 197, 253, 0.5)' }
  };

  return (
    <motion.button
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ 
        delay: 0.3 + index * 0.1,
        type: 'spring',
        damping: 15,
        stiffness: 100
      }}
      whileHover={{ y: -8, scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      onMouseEnter={() => onHover(id)}
      onMouseLeave={() => onHover(null)}
      onTouchStart={() => onHover(id)}
      onTouchEnd={() => onHover(null)}
      className="group relative w-full aspect-square"
    >
      {/* Glow Effect */}
      <motion.div
        className="absolute inset-0 rounded-2xl sm:rounded-3xl blur-xl sm:blur-2xl -z-10"
        style={{
          backgroundColor: glowColors[glow].bg,
        }}
        animate={{
          opacity: hovered ? 0.8 : 0.3,
          scale: hovered ? 1.2 : 1,
        }}
        transition={{ duration: 0.3 }}
      />

      {/* Card Container */}
      <motion.div 
        className="relative w-full h-full backdrop-blur-xl rounded-2xl sm:rounded-3xl border flex flex-col items-center justify-center p-3 sm:p-4 md:p-6 transition-all duration-300"
        style={{
          background: hovered 
            ? 'linear-gradient(135deg, rgba(255, 255, 255, 0.15), rgba(255, 255, 255, 0.05))'
            : 'linear-gradient(135deg, rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0.03))',
          borderColor: hovered 
            ? 'rgba(212, 175, 55, 0.4)'
            : 'rgba(255, 255, 255, 0.15)',
          boxShadow: hovered 
            ? `0 20px 40px ${glowColors[glow].shadow}, 0 0 40px ${glowColors[glow].shadow}, inset 0 2px 10px rgba(255, 255, 255, 0.1)`
            : '0 10px 30px rgba(0, 0, 0, 0.3)'
        }}
      >
        {/* Icon */}
        <motion.div
          animate={{
            y: hovered ? [-5, 5, -5] : 0,
          }}
          transition={{
            duration: 1.5,
            repeat: hovered ? Infinity : 0,
            ease: "easeInOut"
          }}
          className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl mb-2 sm:mb-3 filter drop-shadow-2xl"
        >
          {icon}
        </motion.div>

        {/* Label */}
        <p className="text-white font-bold text-sm sm:text-base md:text-lg text-center leading-tight tracking-wide drop-shadow-md">
          {label}
        </p>

        {/* Hover Arrow */}
        <motion.div
          initial={{ opacity: 0, x: -10 }}
          animate={{ 
            opacity: hovered ? 1 : 0,
            x: hovered ? 0 : -10
          }}
          transition={{ duration: 0.2 }}
          className="absolute bottom-2 right-2 sm:bottom-3 sm:right-3 text-white/60 text-sm sm:text-base"
        >
          →
        </motion.div>

        {/* Sparkles on Hover */}
        {hovered && (
          <>
            {[...Array(4)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-1 h-1 sm:w-1.5 sm:h-1.5 bg-white rounded-full"
                initial={{ opacity: 0, scale: 0 }}
                animate={{
                  opacity: [0, 1, 0],
                  scale: [0, 1.5, 0],
                  x: [0, (Math.random() - 0.5) * 40],
                  y: [0, (Math.random() - 0.5) * 40],
                }}
                transition={{
                  duration: 1,
                  repeat: Infinity,
                  delay: i * 0.2
                }}
                style={{
                  left: '50%',
                  top: '50%'
                }}
              />
            ))}
          </>
        )}
      </motion.div>
    </motion.button>
  );
}

