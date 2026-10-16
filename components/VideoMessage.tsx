'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import FadeIn from './animations/FadeIn';

interface VideoMessageProps {
  videoUrl: string;
  title?: string;
  description?: string;
}

export default function VideoMessage({ 
  videoUrl, 
  title = "A Special Message",
  description = "Something I wanted to share with you"
}: VideoMessageProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.3,
  });

  if (!videoUrl) return null;

  return (
    <section className="relative py-20 px-6 md:px-12 lg:px-24">
      <div className="max-w-4xl mx-auto">
        <FadeIn>
          <div className="text-center mb-8">
            <h2 className="text-4xl md:text-5xl font-serif text-warm-ivory mb-4">
              {title}
            </h2>
            <p className="text-soft-rose text-lg">
              {description}
            </p>
          </div>
        </FadeIn>

        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ duration: 0.8 }}
          className="relative aspect-video rounded-3xl overflow-hidden shadow-2xl border-2 border-soft-rose/20"
        >
          {!isPlaying ? (
            <div 
              className="relative w-full h-full bg-gradient-to-br from-deep-burgundy/30 to-deep-burgundy/10 backdrop-blur-sm cursor-pointer group"
              onClick={() => setIsPlaying(true)}
            >
              <div className="absolute inset-0 flex items-center justify-center">
                <motion.div
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  className="w-24 h-24 bg-deep-burgundy rounded-full flex items-center justify-center shadow-2xl group-hover:bg-opacity-90 transition-all"
                >
                  <svg
                    className="w-12 h-12 text-warm-ivory ml-2"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M8 5v14l11-7z" />
                  </svg>
                </motion.div>
              </div>
              <div className="absolute bottom-0 inset-x-0 p-8 bg-gradient-to-t from-black/60 to-transparent">
                <p className="text-warm-ivory text-lg text-center">
                  Click to play ▶️
                </p>
              </div>
            </div>
          ) : (
            <video
              src={videoUrl}
              controls
              autoPlay
              className="w-full h-full object-cover"
            >
              Your browser does not support the video tag.
            </video>
          )}
        </motion.div>
      </div>
    </section>
  );
}
