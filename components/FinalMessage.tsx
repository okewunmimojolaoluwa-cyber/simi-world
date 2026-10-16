'use client';

import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { CONTENT } from '@/config/content';

export default function FinalMessage() {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.3,
  });

  return (
    <section className="relative py-32 px-6 md:px-12 lg:px-24 min-h-screen flex items-center justify-center">
      <div ref={ref} className="max-w-4xl mx-auto text-center space-y-12">
        <motion.p
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ duration: 1, delay: 0.5 }}
          className="text-3xl md:text-5xl font-serif text-warm-ivory"
        >
          {CONTENT.FINAL_MESSAGE.line1}
        </motion.p>

        <motion.p
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ duration: 1, delay: 1.5 }}
          className="text-2xl md:text-4xl font-serif text-soft-rose"
        >
          {CONTENT.FINAL_MESSAGE.line2}
        </motion.p>

        <motion.p
          initial={{ opacity: 0, scale: 0.8 }}
          animate={inView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.8 }}
          transition={{ duration: 1, delay: 2.5 }}
          className="text-4xl md:text-6xl font-serif text-gold-accent"
        >
          {CONTENT.FINAL_MESSAGE.line3}
        </motion.p>

        <motion.p
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : { opacity: 0 }}
          transition={{ duration: 1.5, delay: 3.5 }}
          className="text-xl md:text-2xl text-muted-blush"
        >
          {CONTENT.FINAL_MESSAGE.line4}
        </motion.p>

        <motion.div
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 0.3 } : { opacity: 0 }}
          transition={{ duration: 2, delay: 4.5 }}
          className="pt-20"
        >
          <p className="text-sm text-soft-rose/50">
            Made with love, just for you
          </p>
        </motion.div>
      </div>
    </section>
  );
}
