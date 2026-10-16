'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { CONTENT } from '@/config/content';
import FadeIn from './animations/FadeIn';

export default function BirthdayWishes() {
  const [currentWish, setCurrentWish] = useState(0);
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.3,
  });

  // Auto-advance wishes
  useEffect(() => {
    if (!inView) return;
    
    const interval = setInterval(() => {
      setCurrentWish((prev) => (prev + 1) % CONTENT.WISHES.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [inView]);

  const wish = CONTENT.WISHES[currentWish];

  return (
    <section className="relative py-32 px-6 md:px-12 lg:px-24 overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 opacity-10">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            animate={{
              y: [0, -30, 0],
              x: [0, Math.random() * 20 - 10, 0],
              opacity: [0.3, 1, 0.3],
            }}
            transition={{
              duration: 3 + Math.random() * 2,
              repeat: Infinity,
              delay: i * 0.2,
            }}
            className="absolute text-4xl"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
          >
            {['🎉', '🎊', '✨', '💝', '🎂', '🎁'][Math.floor(Math.random() * 6)]}
          </motion.div>
        ))}
      </div>

      <div ref={ref} className="relative max-w-4xl mx-auto text-center">
        <FadeIn>
          <h2 className="text-4xl md:text-6xl font-serif text-warm-ivory mb-12">
            Birthday Wishes 🎉
          </h2>
        </FadeIn>

        {/* Wish Display */}
        <div className="relative min-h-[300px] flex items-center justify-center">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentWish}
              initial={{ opacity: 0, y: 50, scale: 0.8 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -50, scale: 0.8 }}
              transition={{ duration: 0.5 }}
              className="bg-gradient-to-br from-deep-burgundy/30 to-gold-accent/20 backdrop-blur-sm rounded-3xl p-8 md:p-12 border-2 border-soft-rose/30 shadow-2xl"
            >
              <motion.div
                animate={{
                  rotate: [0, 10, -10, 0],
                  scale: [1, 1.2, 1],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                }}
                className="text-7xl mb-6"
              >
                {wish.emoji}
              </motion.div>

              <p className="text-xl md:text-3xl text-warm-ivory leading-relaxed font-light">
                {wish.message}
              </p>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Navigation Dots */}
        <div className="flex justify-center gap-3 mt-12">
          {CONTENT.WISHES.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentWish(index)}
              className={`w-3 h-3 rounded-full transition-all duration-300 ${
                index === currentWish
                  ? 'bg-gold-accent w-8'
                  : 'bg-soft-rose/30 hover:bg-soft-rose/50'
              }`}
              aria-label={`Go to wish ${index + 1}`}
            />
          ))}
        </div>

        {/* Manual Navigation */}
        <div className="flex justify-center gap-4 mt-8">
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => setCurrentWish((prev) => (prev - 1 + CONTENT.WISHES.length) % CONTENT.WISHES.length)}
            className="px-6 py-3 bg-deep-burgundy/50 backdrop-blur-sm rounded-full text-warm-ivory text-lg hover:bg-deep-burgundy/70 transition-colors"
          >
            ← Previous
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => setCurrentWish((prev) => (prev + 1) % CONTENT.WISHES.length)}
            className="px-6 py-3 bg-deep-burgundy/50 backdrop-blur-sm rounded-full text-warm-ivory text-lg hover:bg-deep-burgundy/70 transition-colors"
          >
            Next →
          </motion.button>
        </div>
      </div>
    </section>
  );
}
