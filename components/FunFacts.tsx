'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { CONTENT } from '@/config/content';
import FadeIn from './animations/FadeIn';

export default function FunFacts() {
  return (
    <section className="relative py-20 px-6 md:px-12 lg:px-24">
      <div className="max-w-6xl mx-auto">
        <FadeIn>
          <div className="text-center mb-12">
            <motion.div
              animate={{
                rotate: [0, 10, -10, 0],
                scale: [1, 1.1, 1],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
              className="text-6xl mb-4"
            >
              📊
            </motion.div>
            <h2 className="text-4xl md:text-6xl font-serif text-warm-ivory mb-4">
              Fun Facts About The Birthday Queen
            </h2>
            <p className="text-soft-rose text-lg md:text-xl">
              100% real, 0% cap! 💯
            </p>
          </div>
        </FadeIn>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {CONTENT.FUN_FACTS.map((fact, index) => (
            <FactCard key={fact.id} fact={fact} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
}

interface FactCardProps {
  fact: typeof CONTENT.FUN_FACTS[0];
  index: number;
}

function FactCard({ fact, index }: FactCardProps) {
  const [isFlipped, setIsFlipped] = useState(false);
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 50 }}
      animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
      transition={{ duration: 0.6, delay: index * 0.1 }}
      className="h-64"
    >
      <motion.div
        onClick={() => setIsFlipped(!isFlipped)}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        animate={{ rotateY: isFlipped ? 180 : 0 }}
        transition={{ duration: 0.6 }}
        className="relative w-full h-full cursor-pointer"
        style={{ transformStyle: 'preserve-3d' }}
      >
        {/* Front */}
        <div
          className="absolute inset-0 bg-gradient-to-br from-deep-burgundy/30 to-gold-accent/20 backdrop-blur-sm rounded-2xl p-6 border-2 border-soft-rose/30 flex flex-col items-center justify-center text-center"
          style={{ backfaceVisibility: 'hidden' }}
        >
          <div className="text-6xl mb-4">{fact.icon}</div>
          <h3 className="text-2xl font-bold text-warm-ivory">{fact.title}</h3>
          <p className="text-soft-rose text-sm mt-4">Tap to reveal</p>
        </div>

        {/* Back */}
        <div
          className="absolute inset-0 bg-gradient-to-br from-gold-accent/30 to-deep-burgundy/20 backdrop-blur-sm rounded-2xl p-6 border-2 border-gold-accent/50 flex items-center justify-center text-center"
          style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
        >
          <p className="text-warm-ivory text-lg leading-relaxed">{fact.fact}</p>
        </div>
      </motion.div>
    </motion.div>
  );
}
