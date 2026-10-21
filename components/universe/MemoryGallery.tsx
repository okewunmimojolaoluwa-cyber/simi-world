'use client';

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { UniverseState } from '@/lib/persistence';

interface MemoryGalleryProps {
  state: UniverseState;
  updateState: (updates: Partial<UniverseState>) => void;
  onBack: () => void;
}

type MediaFilter = 'all' | 'photos' | 'videos';

interface MediaItem {
  id: string;
  type: 'photo' | 'video';
  src: string;
  title: string;
  caption: string;
  badge: string;
}

const ITEMS: MediaItem[] = [
  {
    id: 'pic-1',
    type: 'photo',
    src: '/images/gallery/photo1.jpg',
    title: 'UK Royalty 👑',
    caption: 'Effortless grace and perfection in every single detail.',
    badge: 'PORTRAIT',
  },
  {
    id: 'vid-1',
    type: 'video',
    src: '/videos/video2.mp4',
    title: 'Queen Energy ✨',
    caption: 'That radiant smile that instantly lights up the whole room.',
    badge: 'VIDEO',
  },
  {
    id: 'pic-2',
    type: 'photo',
    src: '/images/gallery/photo2.jpg',
    title: 'Pure Radiance 💕',
    caption: 'Unmatched beauty, glowing confidence, and effortless style.',
    badge: 'PORTRAIT',
  },
  {
    id: 'vid-2',
    type: 'video',
    src: '/videos/video3.mp4',
    title: 'Iconic Moments 🔥',
    caption: 'Unfiltered laughter, gorgeous energy, and the sweetest vibe.',
    badge: 'VIDEO',
  },
  {
    id: 'pic-3',
    type: 'photo',
    src: '/images/gallery/photo3.jpg',
    title: 'Main Character Energy 🌸',
    caption: 'The most stunning person to ever exist, inside and out.',
    badge: 'PORTRAIT',
  },
  {
    id: 'vid-3',
    type: 'video',
    src: '/videos/video4.mp4',
    title: 'Precious Clip 💖',
    caption: 'A moment so special I could watch it on loop forever.',
    badge: 'VIDEO',
  },
  {
    id: 'pic-4',
    type: 'photo',
    src: '/images/gallery/photo4.jpg',
    title: 'Absolute Perfection 💫',
    caption: 'Breathtaking elegance and a look that stops time.',
    badge: 'PORTRAIT',
  },
];

export default function MemoryGallery({ onBack }: MemoryGalleryProps) {
  const [filter, setFilter] = useState<MediaFilter>('all');
  const [selectedItem, setSelectedItem] = useState<MediaItem | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Keyboard navigation for viewer
  useEffect(() => {
    if (!selectedItem) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setSelectedItem(null);
      if (e.key === 'ArrowRight') handleNext();
      if (e.key === 'ArrowLeft') handlePrev();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedItem, filter, handleNext, handlePrev]);

  // Lock background scroll when viewer is open
  useEffect(() => {
    if (selectedItem) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [selectedItem]);

  const filteredItems = ITEMS.filter((item) => {
    if (filter === 'photos') return item.type === 'photo';
    if (filter === 'videos') return item.type === 'video';
    return true;
  });

  const photoCount = ITEMS.filter((i) => i.type === 'photo').length;
  const videoCount = ITEMS.filter((i) => i.type === 'video').length;

  const handleNext = () => {
    if (!selectedItem) return;
    const currentIndex = filteredItems.findIndex((i) => i.id === selectedItem.id);
    if (currentIndex < filteredItems.length - 1) {
      setSelectedItem(filteredItems[currentIndex + 1]);
    } else {
      setSelectedItem(filteredItems[0]);
    }
  };

  const handlePrev = () => {
    if (!selectedItem) return;
    const currentIndex = filteredItems.findIndex((i) => i.id === selectedItem.id);
    if (currentIndex > 0) {
      setSelectedItem(filteredItems[currentIndex - 1]);
    } else {
      setSelectedItem(filteredItems[filteredItems.length - 1]);
    }
  };

  return (
    <div className="relative w-full min-h-screen flex flex-col items-center px-4 sm:px-6 lg:px-12 pb-24 pt-20 md:pt-24 bg-gradient-to-b from-[#0a0712] via-[#120d20] to-[#080510] text-[#fef9f5]">
      {/* Sleek Floating Back Button */}
      <motion.button
        onClick={onBack}
        whileHover={{ scale: 1.05, x: -3 }}
        whileTap={{ scale: 0.95 }}
        className="feature-back-btn fixed top-5 left-4 md:left-8 z-40 flex items-center gap-2.5 px-4 py-2 rounded-full bg-[#120d20]/90 hover:bg-[#818cf8]/25 border border-[#c4b5fd]/40 text-[#ffffff] font-bold text-xs sm:text-sm backdrop-blur-2xl shadow-xl shadow-black/50 transition-all cursor-pointer"
        aria-label="Back"
      >
        <span className="text-sm">←</span>
        <span>Back</span>
      </motion.button>

      {/* Main Container */}
      <div className="w-full max-w-6xl mx-auto flex flex-col items-center">
        {/* Editorial Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-8 md:mb-12 max-w-2xl px-2"
        >
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-gradient-to-r from-[#818cf8]/20 to-[#c084fc]/20 border border-[#c4b5fd]/30 mb-4 shadow-sm">
            <span className="text-xs">✨</span>
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#c4b5fd]">
              Exclusive Gallery
            </span>
          </div>

          <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white tracking-tight mb-3 drop-shadow-lg">
            Best Pics of You
          </h1>

          <p className="text-sm sm:text-base md:text-lg text-[#c4b5fd]/90 font-medium leading-relaxed max-w-xl mx-auto">
            A handpicked collection of your most stunning portraits, radiant smiles, and favorite videos ✨
          </p>
        </motion.div>

        {/* Filter Capsule Tabs */}
        <div className="flex items-center justify-center gap-1 sm:gap-2 mb-6 sm:mb-8 p-1 sm:p-1.5 rounded-2xl bg-black/50 border border-[#c4b5fd]/25 backdrop-blur-2xl shadow-lg">
          <button
            onClick={() => setFilter('all')}
            className={`px-3 sm:px-5 py-1.5 sm:py-2 rounded-xl text-[11px] sm:text-xs md:text-sm font-bold transition-all duration-200 cursor-pointer ${
              filter === 'all'
                ? 'bg-gradient-to-r from-[#818cf8] via-[#9333ea] to-[#c084fc] text-white shadow-md shadow-[#818cf8]/30'
                : 'text-[#c4b5fd]/80 hover:text-white hover:bg-white/10'
            }`}
          >
            All ({ITEMS.length})
          </button>

          <button
            onClick={() => setFilter('photos')}
            className={`px-3 sm:px-5 py-1.5 sm:py-2 rounded-xl text-[11px] sm:text-xs md:text-sm font-bold transition-all duration-200 cursor-pointer ${
              filter === 'photos'
                ? 'bg-gradient-to-r from-[#818cf8] via-[#9333ea] to-[#c084fc] text-white shadow-md shadow-[#818cf8]/30'
                : 'text-[#c4b5fd]/80 hover:text-white hover:bg-white/10'
            }`}
          >
            Pics 📸 ({photoCount})
          </button>

          <button
            onClick={() => setFilter('videos')}
            className={`px-3 sm:px-5 py-1.5 sm:py-2 rounded-xl text-[11px] sm:text-xs md:text-sm font-bold transition-all duration-200 cursor-pointer ${
              filter === 'videos'
                ? 'bg-gradient-to-r from-[#818cf8] via-[#9333ea] to-[#c084fc] text-white shadow-md shadow-[#818cf8]/30'
                : 'text-[#c4b5fd]/80 hover:text-white hover:bg-white/10'
            }`}
          >
            Videos 🎬 ({videoCount})
          </button>
        </div>

        {/* Gallery Grid - 2 columns on mobile, 3 on tablet, 4 on desktop */}
        <motion.div
          layout
          className="w-full grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-5"
        >
          <AnimatePresence>
            {filteredItems.map((item, index) => (
              <motion.div
                key={item.id}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.35, delay: index * 0.04 }}
                whileHover={{ y: -4, scale: 1.02 }}
                onClick={() => setSelectedItem(item)}
                className="group relative flex flex-col rounded-2xl sm:rounded-3xl overflow-hidden bg-gradient-to-b from-white/[0.08] to-white/[0.02] border border-[#c4b5fd]/20 hover:border-[#818cf8]/60 shadow-lg shadow-black/40 hover:shadow-xl hover:shadow-[#818cf8]/25 transition-all duration-300 cursor-pointer"
              >
                {/* Visual Media Container with 1:1 square or 4:5 on desktop */}
                <div className="relative aspect-square sm:aspect-[4/5] w-full overflow-hidden bg-[#100b1a]">
                  {item.type === 'photo' ? (
                    <img
                      src={item.src}
                      alt={item.title}
                      className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-106"
                    />
                  ) : (
                    <div className="relative w-full h-full">
                      <video
                        src={item.src}
                        preload="metadata"
                        muted
                        playsInline
                        className="w-full h-full object-cover opacity-90 transition-transform duration-500 ease-out group-hover:scale-106"
                      />
                      {/* Play Button Overlay */}
                      <div className="absolute inset-0 flex items-center justify-center bg-black/30 group-hover:bg-black/15 transition-colors">
                        <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center bg-gradient-to-tr from-[#818cf8] to-[#c084fc] text-white shadow-lg shadow-[#818cf8]/45 group-hover:scale-110 transition-transform">
                          <svg className="w-4 h-4 sm:w-5 sm:h-5 ml-0.5" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M8 5v14l11-7z" />
                          </svg>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Top Floating Badge */}
                  <div className="absolute top-2 left-2 sm:top-2.5 sm:left-2.5 flex items-center gap-1 px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-full bg-black/65 backdrop-blur-md border border-white/20 text-white text-[9px] sm:text-[10px] font-extrabold uppercase tracking-wider">
                    <span>{item.type === 'photo' ? '📸' : '🎥'}</span>
                    <span>{item.badge}</span>
                  </div>

                  {/* Gradient Vignette for Text Overlay */}
                  <div className="absolute inset-x-0 bottom-0 h-24 sm:h-28 bg-gradient-to-t from-[#0d0918] via-[#0d0918]/75 to-transparent pointer-events-none" />

                  {/* Card Overlay Text */}
                  <div className="absolute inset-x-0 bottom-0 p-2.5 sm:p-3.5 flex flex-col justify-end">
                    <h3 className="font-serif text-xs sm:text-sm md:text-base font-bold text-white group-hover:text-[#c4b5fd] transition-colors leading-tight drop-shadow-md truncate">
                      {item.title}
                    </h3>
                    <p className="text-[10px] sm:text-xs text-[#c4b5fd]/90 font-medium line-clamp-1 mt-0.5 drop-shadow-sm">
                      {item.caption}
                    </p>

                    <div className="mt-1 sm:mt-2 flex items-center justify-between text-[10px] sm:text-xs font-bold text-[#ffd700] pt-1 border-t border-white/10">
                      <span className="truncate">{item.type === 'photo' ? 'View' : 'Play'}</span>
                      <span className="group-hover:translate-x-0.5 transition-transform">→</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      </div>

      {/* ══════════════ FULLSCREEN THEATER VIEWER (Mounted to document.body) ══════════════ */}
      {mounted &&
        createPortal(
          <AnimatePresence>
            {selectedItem && (
              <motion.div
                key="theaterViewer"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-[9999] flex flex-col items-center justify-between p-3 sm:p-5 md:p-6 bg-black/95 backdrop-blur-2xl"
                onClick={() => setSelectedItem(null)}
              >
                {/* Top Control Bar */}
                <div
                  className="w-full max-w-3xl flex items-center justify-between pb-2.5 px-2 border-b border-white/15"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center bg-white/10 text-white text-xs sm:text-sm font-bold">
                      {selectedItem.type === 'photo' ? '📸' : '🎬'}
                    </div>
                    <div>
                      <h2 className="text-sm sm:text-base md:text-lg font-serif font-bold text-white drop-shadow truncate max-w-[200px] sm:max-w-md">
                        {selectedItem.title}
                      </h2>
                      <span className="text-[9px] sm:text-[10px] font-bold uppercase tracking-wider text-[#c4b5fd]">
                        {selectedItem.badge}
                      </span>
                    </div>
                  </div>

                  {/* Navigation Arrows & Close Button */}
                  <div className="flex items-center gap-1.5 sm:gap-2">
                    <button
                      onClick={handlePrev}
                      className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-white/10 hover:bg-white/20 active:scale-95 text-white flex items-center justify-center text-base sm:text-lg font-bold transition-all cursor-pointer"
                      title="Previous"
                      aria-label="Previous item"
                    >
                      ‹
                    </button>
                    <button
                      onClick={handleNext}
                      className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-white/10 hover:bg-white/20 active:scale-95 text-white flex items-center justify-center text-base sm:text-lg font-bold transition-all cursor-pointer"
                      title="Next"
                      aria-label="Next item"
                    >
                      ›
                    </button>
                    <button
                      onClick={() => setSelectedItem(null)}
                      className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-[#818cf8]/25 hover:bg-[#818cf8]/45 active:scale-95 border border-[#c4b5fd]/40 text-white flex items-center justify-center text-sm sm:text-base font-bold transition-all cursor-pointer ml-1"
                      title="Close"
                      aria-label="Close viewer"
                    >
                      ✕
                    </button>
                  </div>
                </div>

                {/* Central Media Viewer Box - Compact and responsive */}
                <div
                  className="relative flex-1 w-full max-w-3xl flex items-center justify-center my-2 sm:my-3 overflow-hidden"
                  onClick={(e) => e.stopPropagation()}
                >
                  {selectedItem.type === 'photo' ? (
                    <motion.img
                      key={selectedItem.src}
                      initial={{ scale: 0.95, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0.95, opacity: 0 }}
                      transition={{ type: 'spring', damping: 25 }}
                      src={selectedItem.src}
                      alt={selectedItem.title}
                      className="max-h-[58vh] sm:max-h-[65vh] w-auto max-w-full rounded-xl sm:rounded-2xl object-contain shadow-2xl border border-white/10 select-none"
                    />
                  ) : (
                    <motion.div
                      key={selectedItem.src}
                      initial={{ scale: 0.95, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0.95, opacity: 0 }}
                      transition={{ type: 'spring', damping: 25 }}
                      className="w-full max-w-2xl aspect-video rounded-xl sm:rounded-2xl overflow-hidden bg-black shadow-2xl border border-white/15 flex items-center justify-center"
                    >
                      <video
                        src={selectedItem.src}
                        controls
                        autoPlay
                        playsInline
                        className="w-full h-full object-contain"
                      >
                        Your browser does not support this video.
                      </video>
                    </motion.div>
                  )}
                </div>

                {/* Bottom Caption Card */}
                <div
                  className="w-full max-w-3xl p-3 sm:p-4 rounded-xl sm:rounded-2xl bg-gradient-to-r from-[#140e22]/90 to-[#0e0918]/90 border border-white/15 backdrop-blur-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div>
                    <p className="text-xs sm:text-sm md:text-base text-white font-medium">
                      {selectedItem.caption}
                    </p>
                    <p className="text-[10px] sm:text-xs text-[#ffd700] font-semibold mt-0.5">
                      Looking absolutely stunning ✨
                    </p>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-center">
                    <span className="text-[10px] sm:text-xs text-[#c4b5fd] font-semibold">
                      {filteredItems.findIndex((i) => i.id === selectedItem.id) + 1} of{' '}
                      {filteredItems.length}
                    </span>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>,
          document.body
        )}
    </div>
  );
}
