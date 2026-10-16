'use client';

import { motion } from 'framer-motion';
import { useState } from 'react';
import { WORLD } from '@/data/world';

export default function BirthdayLetter() {
  const [currentPage, setCurrentPage] = useState(0);
  const totalPages = Math.ceil(WORLD.birthday.letterParagraphs.length / 3);

  const getParagraphsForPage = (page: number) => {
    const start = page * 3;
    return WORLD.birthday.letterParagraphs.slice(start, start + 3);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0a0a] via-[#1a0a14] to-[#0a0a14] py-12 px-4 sm:px-6 lg:px-8 overflow-y-auto">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center mb-12"
      >
        <motion.div
          animate={{
            scale: [1, 1.1, 1],
            rotate: [0, 5, -5, 0],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            repeatDelay: 3,
          }}
          className="text-6xl sm:text-7xl mb-4"
        >
          💌
        </motion.div>
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-serif text-transparent bg-clip-text bg-gradient-to-r from-pink-300 via-purple-300 to-pink-300 mb-2">
          {WORLD.birthday.specialMessage}
        </h1>
        <p className="text-pink-200/60 text-sm sm:text-base">
          A special letter just for you ✨
        </p>
      </motion.div>

      {/* Letter Card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="max-w-4xl mx-auto"
      >
        <div className="relative bg-gradient-to-br from-pink-50/10 to-purple-50/5 backdrop-blur-xl rounded-3xl shadow-2xl border border-pink-200/20 p-6 sm:p-8 md:p-12">
          {/* Decorative corners */}
          <div className="absolute top-4 left-4 w-12 h-12 border-t-2 border-l-2 border-pink-300/30 rounded-tl-2xl" />
          <div className="absolute top-4 right-4 w-12 h-12 border-t-2 border-r-2 border-pink-300/30 rounded-tr-2xl" />
          <div className="absolute bottom-4 left-4 w-12 h-12 border-b-2 border-l-2 border-pink-300/30 rounded-bl-2xl" />
          <div className="absolute bottom-4 right-4 w-12 h-12 border-b-2 border-r-2 border-pink-300/30 rounded-br-2xl" />

          {/* Floating particles */}
          <div className="absolute inset-0 overflow-hidden rounded-3xl pointer-events-none">
            {[...Array(15)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-1 h-1 bg-pink-300/30 rounded-full"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                }}
                animate={{
                  y: [0, -30, 0],
                  opacity: [0.2, 0.8, 0.2],
                  scale: [1, 1.5, 1],
                }}
                transition={{
                  duration: 3 + Math.random() * 2,
                  repeat: Infinity,
                  delay: Math.random() * 2,
                }}
              />
            ))}
          </div>

          {/* Letter Content */}
          <div className="relative z-10 space-y-6">
            <motion.div
              key={currentPage}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.5 }}
            >
              {getParagraphsForPage(currentPage).map((paragraph, index) => {
                const isGreeting = paragraph.startsWith('My dearest');
                const isPrayer = paragraph.includes('May God') || paragraph.includes('May you') || paragraph.includes('May love') || paragraph.includes('May this year');
                const isClosing = paragraph.includes('Thank you for being') || paragraph.includes('This is your world');

                return (
                  <motion.p
                    key={index}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    className={`
                      ${isGreeting ? 'text-xl sm:text-2xl font-serif text-pink-200 mb-6' : ''}
                      ${isPrayer ? 'text-base sm:text-lg leading-relaxed text-purple-200/90 italic pl-4 border-l-2 border-pink-300/30' : ''}
                      ${isClosing ? 'text-base sm:text-lg leading-relaxed text-pink-100/80 font-medium' : ''}
                      ${!isGreeting && !isPrayer && !isClosing ? 'text-base sm:text-lg leading-relaxed text-pink-50/70' : ''}
                    `}
                  >
                    {paragraph}
                  </motion.p>
                );
              })}
            </motion.div>

            {/* Show signature on last page */}
            {currentPage === totalPages - 1 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
                className="mt-12 text-right"
              >
                <p className="text-xl sm:text-2xl font-serif text-transparent bg-clip-text bg-gradient-to-r from-pink-200 to-purple-200">
                  {WORLD.birthday.signature}
                </p>
              </motion.div>
            )}
          </div>

          {/* Navigation */}
          {totalPages > 1 && (
            <div className="mt-12 flex items-center justify-between">
              <button
                onClick={() => setCurrentPage(Math.max(0, currentPage - 1))}
                disabled={currentPage === 0}
                className="px-6 py-3 rounded-full bg-pink-500/20 hover:bg-pink-500/30 disabled:opacity-30 disabled:cursor-not-allowed text-pink-100 transition-all duration-300 text-sm sm:text-base"
              >
                ← Previous
              </button>

              <div className="flex gap-2">
                {[...Array(totalPages)].map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setCurrentPage(i)}
                    className={`w-2 h-2 rounded-full transition-all duration-300 ${
                      i === currentPage
                        ? 'bg-pink-300 w-8'
                        : 'bg-pink-300/30 hover:bg-pink-300/50'
                    }`}
                  />
                ))}
              </div>

              <button
                onClick={() => setCurrentPage(Math.min(totalPages - 1, currentPage + 1))}
                disabled={currentPage === totalPages - 1}
                className="px-6 py-3 rounded-full bg-pink-500/20 hover:bg-pink-500/30 disabled:opacity-30 disabled:cursor-not-allowed text-pink-100 transition-all duration-300 text-sm sm:text-base"
              >
                Next →
              </button>
            </div>
          )}
        </div>
      </motion.div>

      {/* Birthday Age Badge */}
      <motion.div
        initial={{ opacity: 0, scale: 0 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, delay: 0.4, type: 'spring' }}
        className="mt-12 text-center"
      >
        <div className="inline-flex items-center gap-3 px-8 py-4 rounded-full bg-gradient-to-r from-pink-500/20 to-purple-500/20 backdrop-blur-sm border border-pink-300/30">
          <span className="text-4xl">🎂</span>
          <span className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-pink-200 to-purple-200">
            {WORLD.birthday.age}
          </span>
          <span className="text-4xl">✨</span>
        </div>
      </motion.div>
    </div>
  );
}
