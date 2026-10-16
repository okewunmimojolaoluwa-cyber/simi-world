'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { CONTENT } from '@/config/content';
import FadeIn from './animations/FadeIn';

export default function Letter() {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.2,
  });

  return (
    <section className="relative py-32 px-6 md:px-12 lg:px-24">
      <div className="max-w-3xl mx-auto">
        <FadeIn>
          <div className="text-center mb-12">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.5, ease: 'backOut' }}
              className="inline-block text-6xl mb-4"
            >
              💌
            </motion.div>
            <h2 className="text-4xl md:text-5xl font-serif text-warm-ivory">
              {CONTENT.BIRTHDAY_MESSAGE.title}
            </h2>
          </div>
        </FadeIn>

        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ duration: 0.8 }}
          className="bg-gradient-to-br from-warm-ivory/10 to-deep-burgundy/10 backdrop-blur-sm rounded-3xl p-8 md:p-12 border border-soft-rose/20 shadow-2xl"
        >
          <div className="space-y-6 text-warm-ivory">
            {CONTENT.BIRTHDAY_MESSAGE.paragraphs.map((paragraph, index) => (
              <TypedText
                key={index}
                text={paragraph}
                delay={index * 0.5}
                className="text-lg leading-relaxed text-soft-rose"
              />
            ))}

            <TypedText
              text={CONTENT.BIRTHDAY_MESSAGE.closing}
              delay={CONTENT.BIRTHDAY_MESSAGE.paragraphs.length * 0.5}
              className="text-2xl font-serif text-gold-accent mt-8"
            />
          </div>
        </motion.div>
      </div>
    </section>
  );
}

interface TypedTextProps {
  text: string;
  delay: number;
  className?: string;
}

function TypedText({ text, delay, className }: TypedTextProps) {
  const [displayedText, setDisplayedText] = useState('');
  const [showCursor, setShowCursor] = useState(true);
  const [started, setStarted] = useState(false);

  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  useEffect(() => {
    if (!inView || started) return;
    
    setStarted(true);
    const startTimeout = setTimeout(() => {
      let currentIndex = 0;
      const interval = setInterval(() => {
        if (currentIndex <= text.length) {
          setDisplayedText(text.slice(0, currentIndex));
          currentIndex++;
        } else {
          clearInterval(interval);
          setShowCursor(false);
        }
      }, 20);

      return () => clearInterval(interval);
    }, delay * 1000);

    return () => clearTimeout(startTimeout);
  }, [inView, text, delay, started]);

  return (
    <p ref={ref} className={className}>
      {displayedText}
      {showCursor && started && (
        <motion.span
          animate={{ opacity: [1, 0] }}
          transition={{ duration: 0.5, repeat: Infinity, repeatType: 'reverse' }}
          className="inline-block w-0.5 h-5 bg-gold-accent ml-1 align-middle"
        />
      )}
    </p>
  );
}
