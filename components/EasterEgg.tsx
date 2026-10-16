'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CONTENT } from '@/config/content';

export default function EasterEgg() {
  const [clicked, setClicked] = useState(false);
  const [showRecovery, setShowRecovery] = useState(false);

  const handleClick = () => {
    setClicked(true);
    setTimeout(() => {
      setShowRecovery(true);
    }, 2000);

    setTimeout(() => {
      setClicked(false);
      setShowRecovery(false);
    }, 6000);
  };

  return (
    <>
      <button
        onClick={handleClick}
        className="fixed bottom-8 left-8 z-40 text-soft-rose/30 hover:text-soft-rose/60 transition-colors text-2xl focus:outline-none"
        aria-label="Easter egg"
      >
        {CONTENT.EASTER_EGG.trigger}
      </button>

      <AnimatePresence>
        {clicked && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm"
          >
            <div className="text-center px-6">
              <AnimatePresence mode="wait">
                {!showRecovery ? (
                  <motion.div
                    key="error"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    className="space-y-4"
                  >
                    <div className="text-8xl font-bold text-deep-burgundy">
                      {CONTENT.EASTER_EGG.error}
                    </div>
                    <p className="text-2xl text-soft-rose">
                      {CONTENT.EASTER_EGG.errorMessage}
                    </p>
                  </motion.div>
                ) : (
                  <motion.div
                    key="recovery"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                  >
                    <p className="text-2xl text-warm-ivory max-w-2xl leading-relaxed">
                      {CONTENT.EASTER_EGG.recovery}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
