'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { CONTENT } from '@/config/content';

interface CountdownProps {
  onComplete: () => void;
}

export default function Countdown({ onComplete }: CountdownProps) {
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = new Date().getTime();
      const birthday = new Date(CONTENT.BIRTHDAY_DATE).getTime();
      const difference = birthday - now;

      if (difference <= 0) {
        onComplete();
        return;
      }

      setTimeLeft({
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        minutes: Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((difference % (1000 * 60)) / 1000),
      });
    };

    calculateTimeLeft();
    const interval = setInterval(calculateTimeLeft, 1000);

    return () => clearInterval(interval);
  }, [onComplete]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-[#1a1618] via-[#2a1e24] to-[#3a2630]">
      <div className="text-center px-6 max-w-4xl">
        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-4xl md:text-6xl font-serif text-warm-ivory mb-8"
        >
          Your special day is coming...
        </motion.h1>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="grid grid-cols-4 gap-4 md:gap-8 mb-8"
        >
          <TimeUnit value={timeLeft.days} label="Days" />
          <TimeUnit value={timeLeft.hours} label="Hours" />
          <TimeUnit value={timeLeft.minutes} label="Minutes" />
          <TimeUnit value={timeLeft.seconds} label="Seconds" />
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="text-xl text-soft-rose"
        >
          Can't wait to celebrate you, Roqeebat ❤️
        </motion.p>
      </div>
    </div>
  );
}

interface TimeUnitProps {
  value: number;
  label: string;
}

function TimeUnit({ value, label }: TimeUnitProps) {
  return (
    <div className="bg-deep-burgundy/30 backdrop-blur-sm rounded-xl p-4 md:p-6 border border-soft-rose/20">
      <motion.div
        key={value}
        initial={{ scale: 1.2, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.3 }}
        className="text-4xl md:text-6xl font-bold text-gold-accent mb-2"
      >
        {String(value).padStart(2, '0')}
      </motion.div>
      <div className="text-sm md:text-base text-soft-rose uppercase tracking-wider">
        {label}
      </div>
    </div>
  );
}
