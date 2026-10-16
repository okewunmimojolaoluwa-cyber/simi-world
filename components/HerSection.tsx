'use client';

import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { CONTENT } from '@/config/content';

export default function HerSection() {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.3,
  });

  return (
    <section className="relative py-32 px-6 md:px-12 lg:px-24 overflow-hidden">
      {/* Decorative background */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-20 left-10 w-72 h-72 bg-deep-burgundy rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-gold-accent rounded-full blur-3xl"></div>
      </div>

      <div ref={ref} className="relative max-w-4xl mx-auto text-center space-y-12">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={inView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.8 }}
          transition={{ duration: 1, ease: 'easeOut' }}
          className="space-y-6"
        >
          <motion.div
            animate={inView ? {
              scale: [1, 1.05, 1],
              opacity: [0.5, 1, 0.5],
            } : {}}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
            className="inline-block text-6xl mb-4"
          >
            👑
          </motion.div>

          <h2 className="text-5xl md:text-7xl font-serif text-warm-ivory">
            Happy Birthday, {CONTENT.HER_NAME}! 🎉
          </h2>

          <motion.div
            initial={{ width: 0 }}
            animate={inView ? { width: '100%' } : { width: 0 }}
            transition={{ duration: 1.5, delay: 0.5 }}
            className="h-1 bg-gradient-to-r from-transparent via-gold-accent to-transparent mx-auto"
          />

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            transition={{ duration: 0.8, delay: 0.8 }}
            className="text-2xl md:text-3xl text-soft-rose font-light leading-relaxed max-w-3xl mx-auto"
          >
            {CONTENT.LOCATION}'s absolute legend! 🌟
            <br />
            Today we're celebrating YOU!
            <br />
            Get ready for the most epic birthday ever!
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            transition={{ duration: 0.8, delay: 1.2 }}
            className="flex flex-wrap justify-center gap-4 pt-8"
          >
            {['Stunning', 'Fabulous', 'Iconic', 'Unstoppable', 'Queen Energy'].map((word, index) => (
              <motion.span
                key={word}
                initial={{ opacity: 0, scale: 0 }}
                animate={inView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0 }}
                transition={{ duration: 0.5, delay: 1.4 + index * 0.1 }}
                whileHover={{ scale: 1.1, y: -5 }}
                className="px-6 py-3 bg-deep-burgundy/30 backdrop-blur-sm border border-soft-rose/30 rounded-full text-warm-ivory text-lg font-medium"
              >
                {word}
              </motion.span>
            ))}
          </motion.div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : { opacity: 0 }}
          transition={{ duration: 1, delay: 2 }}
          className="pt-12"
        >
          <p className="text-gold-accent text-xl italic">
            "Not all heroes wear capes. Some just show up and slay every single day! 💅"
          </p>
        </motion.div>
      </div>
    </section>
  );
}
