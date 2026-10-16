'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { CONTENT } from '@/config/content';
import FadeIn from './animations/FadeIn';

export default function VideoShowcase() {
  const [selectedVideo, setSelectedVideo] = useState<number | null>(null);

  if (!CONTENT.VIDEOS || CONTENT.VIDEOS.length === 0) return null;

  return (
    <section className="relative py-20 px-6 md:px-12 lg:px-24 bg-gradient-to-b from-transparent to-deep-burgundy/10">
      <div className="max-w-7xl mx-auto">
        <FadeIn>
          <div className="text-center mb-12">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', bounce: 0.5 }}
              className="text-6xl mb-4"
            >
              📹
            </motion.div>
            <h2 className="text-4xl md:text-6xl font-serif text-warm-ivory mb-4">
              The Roqeebat Chronicles
            </h2>
            <p className="text-soft-rose text-lg md:text-xl">
              Moments captured, vibes documented 🎬
            </p>
          </div>
        </FadeIn>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {CONTENT.VIDEOS.map((video, index) => (
            <VideoCard
              key={video.id}
              video={video}
              index={index}
              onClick={() => setSelectedVideo(index)}
            />
          ))}
        </div>
      </div>

      {/* Video Player Modal */}
      <VideoPlayer
        video={selectedVideo !== null ? CONTENT.VIDEOS[selectedVideo] : null}
        onClose={() => setSelectedVideo(null)}
        onNext={() => {
          if (selectedVideo !== null && selectedVideo < CONTENT.VIDEOS.length - 1) {
            setSelectedVideo(selectedVideo + 1);
          }
        }}
        onPrevious={() => {
          if (selectedVideo !== null && selectedVideo > 0) {
            setSelectedVideo(selectedVideo - 1);
          }
        }}
      />
    </section>
  );
}

interface VideoCardProps {
  video: typeof CONTENT.VIDEOS[0];
  index: number;
  onClick: () => void;
}

function VideoCard({ video, index, onClick }: VideoCardProps) {
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
      whileHover={{ y: -10 }}
      onClick={onClick}
      className="relative aspect-video rounded-2xl overflow-hidden cursor-pointer group bg-gradient-to-br from-deep-burgundy/30 to-deep-burgundy/10 border-2 border-soft-rose/20 shadow-xl"
    >
      {/* Video Thumbnail Placeholder */}
      <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-deep-burgundy/50 to-black/50">
        <motion.div
          whileHover={{ scale: 1.2, rotate: 5 }}
          transition={{ duration: 0.3 }}
          className="text-7xl"
        >
          ▶️
        </motion.div>
      </div>

      {/* Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        <div className="absolute bottom-0 left-0 right-0 p-6">
          <h3 className="text-xl font-bold text-warm-ivory mb-2">
            {video.title}
          </h3>
          <p className="text-soft-rose text-sm">
            {video.caption}
          </p>
        </div>
      </div>

      {/* Play Button Pulse */}
      <motion.div
        animate={{
          scale: [1, 1.1, 1],
          opacity: [0.5, 1, 0.5],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
        className="absolute top-4 right-4 w-12 h-12 bg-gold-accent/80 rounded-full flex items-center justify-center"
      >
        <span className="text-2xl">▶️</span>
      </motion.div>
    </motion.div>
  );
}

interface VideoPlayerProps {
  video: typeof CONTENT.VIDEOS[0] | null;
  onClose: () => void;
  onNext: () => void;
  onPrevious: () => void;
}

function VideoPlayer({ video, onClose, onNext, onPrevious }: VideoPlayerProps) {
  if (!video) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center p-4"
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-12 h-12 bg-deep-burgundy rounded-full flex items-center justify-center text-white text-2xl hover:bg-deep-burgundy/80 transition-colors z-10"
        >
          ×
        </button>

        {/* Previous Button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onPrevious();
          }}
          className="absolute left-4 w-12 h-12 bg-deep-burgundy/80 rounded-full flex items-center justify-center text-white text-2xl hover:bg-deep-burgundy transition-colors"
        >
          ‹
        </button>

        {/* Next Button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onNext();
          }}
          className="absolute right-4 w-12 h-12 bg-deep-burgundy/80 rounded-full flex items-center justify-center text-white text-2xl hover:bg-deep-burgundy transition-colors"
        >
          ›
        </button>

        {/* Video Player */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.8, opacity: 0 }}
          transition={{ duration: 0.3 }}
          onClick={(e) => e.stopPropagation()}
          className="max-w-5xl w-full"
        >
          <div className="relative aspect-video rounded-2xl overflow-hidden shadow-2xl">
            <video
              src={video.url}
              controls
              autoPlay
              className="w-full h-full object-contain bg-black"
            >
              Your browser does not support the video tag.
            </video>
          </div>
          
          {/* Video Info */}
          <div className="mt-4 text-center">
            <h3 className="text-2xl font-bold text-warm-ivory mb-2">
              {video.title}
            </h3>
            <p className="text-soft-rose text-lg">
              {video.caption}
            </p>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
