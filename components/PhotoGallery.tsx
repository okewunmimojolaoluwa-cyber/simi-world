'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { CONTENT } from '@/config/content';
import FadeIn from './animations/FadeIn';

export default function PhotoGallery() {
  const [selectedPhoto, setSelectedPhoto] = useState<number | null>(null);

  const handlePrevious = () => {
    if (selectedPhoto !== null) {
      setSelectedPhoto(selectedPhoto === 0 ? CONTENT.PHOTOS.length - 1 : selectedPhoto - 1);
    }
  };

  const handleNext = () => {
    if (selectedPhoto !== null) {
      setSelectedPhoto(selectedPhoto === CONTENT.PHOTOS.length - 1 ? 0 : selectedPhoto + 1);
    }
  };

  const handleKeyDown = (e: KeyboardEvent) => {
    if (selectedPhoto === null) return;
    
    if (e.key === 'Escape') setSelectedPhoto(null);
    if (e.key === 'ArrowLeft') handlePrevious();
    if (e.key === 'ArrowRight') handleNext();
  };

  useState(() => {
    window.addEventListener('keydown', handleKeyDown as any);
    return () => window.removeEventListener('keydown', handleKeyDown as any);
  });

  return (
    <section className="relative py-20 px-6 md:px-12 lg:px-24">
      <div className="max-w-7xl mx-auto">
        <FadeIn>
          <h2 className="text-4xl md:text-6xl font-serif text-center text-warm-ivory mb-4">
            Captured Moments
          </h2>
          <p className="text-center text-soft-rose text-lg mb-16">
            Pictures worth a thousand memories
          </p>
        </FadeIn>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
          {CONTENT.PHOTOS.map((photo, index) => (
            <PhotoItem
              key={photo.id}
              photo={photo}
              index={index}
              onClick={() => setSelectedPhoto(index)}
            />
          ))}
        </div>
      </div>

      <PhotoLightbox
        photos={CONTENT.PHOTOS}
        selectedIndex={selectedPhoto}
        onClose={() => setSelectedPhoto(null)}
        onPrevious={handlePrevious}
        onNext={handleNext}
      />
    </section>
  );
}

interface PhotoItemProps {
  photo: typeof CONTENT.PHOTOS[0];
  index: number;
  onClick: () => void;
}

function PhotoItem({ photo, index, onClick }: PhotoItemProps) {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, scale: 0.9 }}
      animate={inView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.9 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      whileHover={{ scale: 1.05, y: -5 }}
      onClick={onClick}
      className="relative aspect-square rounded-xl overflow-hidden cursor-pointer shadow-lg"
    >
      <img
        src={photo.url}
        alt={photo.caption}
        className="w-full h-full object-cover"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
        <p className="text-white text-sm font-medium">{photo.caption}</p>
      </div>
    </motion.div>
  );
}

interface PhotoLightboxProps {
  photos: typeof CONTENT.PHOTOS;
  selectedIndex: number | null;
  onClose: () => void;
  onPrevious: () => void;
  onNext: () => void;
}

function PhotoLightbox({ photos, selectedIndex, onClose, onPrevious, onNext }: PhotoLightboxProps) {
  if (selectedIndex === null) return null;

  const photo = photos[selectedIndex];

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center p-4"
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-white text-4xl hover:text-gold-accent transition-colors z-10 focus:outline-none"
          aria-label="Close"
        >
          ×
        </button>

        <button
          onClick={(e) => {
            e.stopPropagation();
            onPrevious();
          }}
          className="absolute left-4 text-white text-4xl hover:text-gold-accent transition-colors focus:outline-none"
          aria-label="Previous"
        >
          ‹
        </button>

        <button
          onClick={(e) => {
            e.stopPropagation();
            onNext();
          }}
          className="absolute right-4 text-white text-4xl hover:text-gold-accent transition-colors focus:outline-none"
          aria-label="Next"
        >
          ›
        </button>

        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.8, opacity: 0 }}
          transition={{ duration: 0.3 }}
          onClick={(e) => e.stopPropagation()}
          className="max-w-5xl max-h-[90vh] w-full"
        >
          <img
            src={photo.url}
            alt={photo.caption}
            className="w-full h-full object-contain rounded-lg"
          />
          <p className="text-center text-white mt-4 text-lg">{photo.caption}</p>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
