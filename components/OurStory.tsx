'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { CONTENT } from '@/config/content';
import FadeIn from './animations/FadeIn';

export default function OurStory() {
  return (
    <section className="relative py-20 px-6 md:px-12 lg:px-24">
      <div className="max-w-6xl mx-auto">
        <FadeIn>
          <h2 className="text-4xl md:text-6xl font-serif text-center text-warm-ivory mb-4">
            Our Story
          </h2>
          <p className="text-center text-soft-rose text-lg mb-16 max-w-2xl mx-auto">
            Moments we've shared, memories we've made
          </p>
        </FadeIn>

        <div className="space-y-24">
          {CONTENT.MEMORIES.map((memory, index) => (
            <MemoryCard key={memory.id} memory={memory} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
}

interface MemoryCardProps {
  memory: typeof CONTENT.MEMORIES[0];
  index: number;
}

function MemoryCard({ memory, index }: MemoryCardProps) {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.2,
  });
  const [showVideo, setShowVideo] = useState(false);

  const isEven = index % 2 === 0;
  const hasVideo = memory.video && memory.video.trim() !== '';

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 50 }}
      animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
      transition={{ duration: 0.8, delay: 0.2, ease: 'easeOut' }}
      className={`flex flex-col ${isEven ? 'md:flex-row' : 'md:flex-row-reverse'} gap-8 items-center`}
    >
      <div className="w-full md:w-1/2">
        <motion.div
          whileHover={{ scale: 1.02 }}
          transition={{ duration: 0.3 }}
          className="relative aspect-[4/3] rounded-2xl overflow-hidden shadow-2xl"
        >
          {!showVideo ? (
            <>
              <img
                src={memory.image}
                alt={memory.title}
                className="w-full h-full object-cover"
              />
              {hasVideo && (
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setShowVideo(true)}
                  className="absolute inset-0 flex items-center justify-center bg-black/30 backdrop-blur-sm hover:bg-black/40 transition-colors"
                >
                  <div className="w-20 h-20 bg-deep-burgundy/90 rounded-full flex items-center justify-center shadow-2xl">
                    <svg
                      className="w-10 h-10 text-warm-ivory ml-1"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M8 5v14l11-7z" />
                    </svg>
                  </div>
                </motion.button>
              )}
            </>
          ) : (
            <div className="relative w-full h-full">
              <video
                src={memory.video}
                controls
                autoPlay
                className="w-full h-full object-cover"
              >
                Your browser does not support the video tag.
              </video>
              <button
                onClick={() => setShowVideo(false)}
                className="absolute top-4 right-4 w-10 h-10 bg-black/70 rounded-full flex items-center justify-center text-white hover:bg-black/90 transition-colors"
              >
                ×
              </button>
            </div>
          )}
        </motion.div>
      </div>

      <div className="w-full md:w-1/2 space-y-4">
        <p className="text-gold-accent text-sm tracking-wider uppercase">
          {memory.date}
        </p>
        <h3 className="text-3xl md:text-4xl font-serif text-warm-ivory">
          {memory.title}
        </h3>
        <p className="text-soft-rose text-lg leading-relaxed">
          {memory.description}
        </p>
        {memory.location && (
          <p className="text-muted-blush text-sm italic">
            📍 {memory.location}
          </p>
        )}
      </div>
    </motion.div>
  );
}
