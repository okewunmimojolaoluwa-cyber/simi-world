'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useState } from 'react';

interface Achievement {
  id: string;
  title: string;
  emoji: string;
}

let achievementQueue: Achievement[] = [];
let listeners: Array<() => void> = [];

export const showAchievement = (achievement: Achievement) => {
  achievementQueue.push(achievement);
  listeners.forEach(fn => fn());
};

export default function AchievementToast() {
  const [current, setCurrent] = useState<Achievement | null>(null);

  useEffect(() => {
    const checkQueue = () => {
      if (achievementQueue.length > 0 && !current) {
        const next = achievementQueue.shift();
        if (next) {
          setCurrent(next);
          setTimeout(() => setCurrent(null), 4000);
        }
      }
    };

    listeners.push(checkQueue);
    
    const interval = setInterval(checkQueue, 500);

    return () => {
      clearInterval(interval);
      listeners = listeners.filter(fn => fn !== checkQueue);
    };
  }, [current]);

  return (
    <AnimatePresence>
      {current && (
        <motion.div
          initial={{ opacity: 0, y: -100, x: '-50%' }}
          animate={{ opacity: 1, y: 20 }}
          exit={{ opacity: 0, y: -100 }}
          transition={{ type: 'spring', damping: 20, stiffness: 300 }}
          className="fixed top-0 left-1/2 z-50 -translate-x-1/2"
        >
          <div className="bg-gradient-to-r from-[#d4af37]/90 to-[#f4d03f]/90 backdrop-blur-lg px-6 py-3 rounded-full shadow-2xl border border-[#d4af37]/20">
            <div className="flex items-center gap-3">
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: [0, 1.3, 1] }}
                transition={{ delay: 0.2, duration: 0.5 }}
                className="text-2xl"
              >
                {current.emoji}
              </motion.span>
              <div>
                <p className="text-xs text-[#0a0908]/60 font-medium uppercase tracking-wider">
                  Achievement Unlocked
                </p>
                <p className="text-sm text-[#0a0908] font-semibold">
                  {current.title}
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
