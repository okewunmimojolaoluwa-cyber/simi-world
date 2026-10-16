'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { CONTENT } from '@/config/content';
import FadeIn from './animations/FadeIn';

export default function Appreciation() {
  return (
    <section className="relative py-20 px-6 md:px-12 lg:px-24">
      <div className="max-w-6xl mx-auto">
        <FadeIn>
          <h2 className="text-4xl md:text-6xl font-serif text-center text-warm-ivory mb-4">
            Things I Appreciate About You
          </h2>
          <p className="text-center text-soft-rose text-lg mb-16">
            Just a few of the many reasons you're extraordinary
          </p>
        </FadeIn>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {CONTENT.APPRECIATION_MESSAGES.map((item, index) => (
            <AppreciationCard key={item.id} item={item} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
}

interface AppreciationCardProps {
  item: typeof CONTENT.APPRECIATION_MESSAGES[0];
  index: number;
}

function AppreciationCard({ item, index }: AppreciationCardProps) {
  const [isRevealed, setIsRevealed] = useState(false);
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 30 }}
      animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
      transition={{ duration: 0.6, delay: index * 0.1 }}
    >
      <motion.div
        onClick={() => setIsRevealed(!isRevealed)}
        whileHover={{ scale: 1.03, rotateY: 5 }}
        whileTap={{ scale: 0.98 }}
        className="relative h-64 bg-gradient-to-br from-deep-burgundy/30 to-deep-burgundy/10 backdrop-blur-sm rounded-2xl p-6 cursor-pointer border border-soft-rose/20 shadow-xl overflow-hidden"
        style={{ perspective: '1000px' }}
      >
        <motion.div
          animate={{ rotateY: isRevealed ? 180 : 0 }}
          transition={{ duration: 0.6, ease: 'easeInOut' }}
          className="relative w-full h-full"
          style={{ transformStyle: 'preserve-3d' }}
        >
          {/* Front */}
          <div
            className="absolute inset-0 flex flex-col items-center justify-center text-center"
            style={{ backfaceVisibility: 'hidden' }}
          >
            <div className="text-5xl mb-4">{item.icon}</div>
            <h3 className="text-2xl font-serif text-warm-ivory">{item.title}</h3>
            <p className="text-sm text-soft-rose mt-4">Click to reveal</p>
          </div>

          {/* Back */}
          <div
            className="absolute inset-0 flex items-center justify-center text-center p-4"
            style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
          >
            <p className="text-warm-ivory leading-relaxed">{item.message}</p>
          </div>
        </motion.div>
      </motion.div>
    </motion.div>
  );
}
