'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CONTENT } from '@/config/content';

interface GameEntranceProps {
  onStart: () => void;
}

export default function GameEntrance({ onStart }: GameEntranceProps) {
  const [phase, setPhase] = useState<'game' | 'reveal'>('game');
  const [score, setScore] = useState(0);
  const [cakes, setCakes] = useState<Array<{ id: number; x: number; y: number }>>([]);
  const [gameStarted, setGameStarted] = useState(false);
  const [timeLeft, setTimeLeft] = useState(10);

  useEffect(() => {
    if (!gameStarted) return;

    // Spawn cakes
    const spawnInterval = setInterval(() => {
      const newCake = {
        id: Date.now(),
        x: Math.random() * (window.innerWidth - 100),
        y: -50,
      };
      setCakes(prev => [...prev, newCake]);
    }, 800);

    // Countdown timer
    const timerInterval = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          setGameStarted(false);
          setTimeout(() => setPhase('reveal'), 500);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      clearInterval(spawnInterval);
      clearInterval(timerInterval);
    };
  }, [gameStarted]);

  // Remove cakes that fell off screen
  useEffect(() => {
    const cleanupInterval = setInterval(() => {
      setCakes(prev => prev.filter(cake => cake.y < window.innerHeight + 100));
    }, 100);

    return () => clearInterval(cleanupInterval);
  }, []);

  const handleCakeClick = (cakeId: number) => {
    setScore(prev => prev + 1);
    setCakes(prev => prev.filter(cake => cake.id !== cakeId));
  };

  const handleSkip = () => {
    setPhase('reveal');
  };

  return (
    <div className="fixed inset-0 z-50 bg-gradient-to-br from-[#1a1618] via-[#2a1e24] to-[#3a2630] overflow-hidden">
      <AnimatePresence mode="wait">
        {phase === 'game' && (
          <motion.div
            key="game"
            exit={{ opacity: 0, scale: 0.9 }}
            className="relative w-full h-full"
          >
            {!gameStarted ? (
              // Game Start Screen
              <div className="flex flex-col items-center justify-center h-full px-6">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', bounce: 0.5 }}
                  className="text-9xl mb-8"
                >
                  🎂
                </motion.div>

                <motion.h1
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.2 }}
                  className="text-4xl md:text-6xl font-bold text-warm-ivory text-center mb-6"
                >
                  Quick! Catch The Birthday Cakes! 🎂
                </motion.h1>

                <motion.p
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.3 }}
                  className="text-xl text-soft-rose text-center mb-8 max-w-md"
                >
                  Help celebrate Roqeebat's birthday by catching falling cakes!<br />
                  Click them before they disappear!
                </motion.p>

                <motion.button
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.4 }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setGameStarted(true)}
                  className="px-12 py-4 bg-gradient-to-r from-deep-burgundy to-gold-accent text-warm-ivory rounded-full text-2xl font-bold shadow-2xl mb-4"
                >
                  START GAME! 🎮
                </motion.button>

                <motion.button
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.6 }}
                  onClick={handleSkip}
                  className="text-soft-rose/70 hover:text-soft-rose underline"
                >
                  Skip to celebration →
                </motion.button>
              </div>
            ) : (
              // Active Game
              <>
                {/* Game HUD */}
                <div className="absolute top-4 left-0 right-0 flex justify-between items-center px-6 z-20">
                  <div className="bg-deep-burgundy/80 backdrop-blur-sm px-6 py-3 rounded-full">
                    <span className="text-2xl font-bold text-warm-ivory">
                      🎂 Score: {score}
                    </span>
                  </div>
                  
                  <div className="bg-gold-accent/80 backdrop-blur-sm px-6 py-3 rounded-full">
                    <span className="text-2xl font-bold text-warm-charcoal">
                      ⏱️ {timeLeft}s
                    </span>
                  </div>
                </div>

                {/* Falling Cakes */}
                {cakes.map(cake => (
                  <FallingCake
                    key={cake.id}
                    id={cake.id}
                    initialX={cake.x}
                    onClick={handleCakeClick}
                  />
                ))}

                {/* Encouragement Text */}
                <motion.div
                  animate={{ opacity: [0.5, 1, 0.5] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="absolute bottom-12 left-0 right-0 text-center"
                >
                  <p className="text-2xl text-soft-rose font-bold">
                    {score === 0 ? "Click the cakes! 🎂" :
                     score < 5 ? "Keep going! 🔥" :
                     score < 10 ? "You're on fire! 🎉" :
                     "AMAZING! 🌟"}
                  </p>
                </motion.div>
              </>
            )}
          </motion.div>
        )}

        {phase === 'reveal' && (
          <motion.div
            key="reveal"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6 }}
            className="flex flex-col items-center justify-center h-full px-6"
          >
            {/* Confetti Effect */}
            {[...Array(30)].map((_, i) => (
              <motion.div
                key={i}
                initial={{ 
                  x: window.innerWidth / 2, 
                  y: window.innerHeight / 2,
                  scale: 0,
                }}
                animate={{
                  x: Math.random() * window.innerWidth,
                  y: Math.random() * window.innerHeight,
                  scale: [0, 1.5, 1],
                  rotate: Math.random() * 720,
                }}
                transition={{ duration: 1, delay: i * 0.02 }}
                className="absolute text-4xl"
              >
                {['🎉', '🎊', '✨', '🎂', '🎁', '💝'][i % 6]}
              </motion.div>
            ))}

            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: [0, 1.3, 1] }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="text-9xl mb-6"
            >
              🎉
            </motion.div>

            {score > 0 && (
              <motion.div
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="bg-gold-accent/20 backdrop-blur-sm px-8 py-4 rounded-2xl mb-6 border-2 border-gold-accent"
              >
                <p className="text-3xl font-bold text-gold-accent">
                  You caught {score} cake{score !== 1 ? 's' : ''}! 🎂
                </p>
              </motion.div>
            )}

            <motion.h1
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="text-5xl md:text-7xl font-bold text-warm-ivory text-center mb-4"
            >
              🎊 BREAKING NEWS! 🎊
            </motion.h1>

            <motion.h2
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.7 }}
              className="text-3xl md:text-5xl font-bold text-gold-accent text-center mb-4"
            >
              It's {CONTENT.HER_NAME} Day!
            </motion.h2>

            <motion.p
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.8 }}
              className="text-xl md:text-2xl text-soft-rose text-center mb-8 max-w-2xl"
            >
              {CONTENT.LOCATION}'s finest is celebrating another year of being absolutely fabulous!
            </motion.p>

            <motion.button
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.9 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onStart}
              className="px-12 py-4 bg-gradient-to-r from-deep-burgundy via-gold-accent to-deep-burgundy text-warm-ivory rounded-full text-2xl font-bold shadow-2xl animate-breathe"
            >
              Show Me The Love! 💝
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Falling Cake Component
function FallingCake({ id, initialX, onClick }: { id: number; initialX: number; onClick: (id: number) => void }) {
  return (
    <motion.button
      initial={{ y: -50, x: initialX, scale: 1 }}
      animate={{ y: window.innerHeight + 100, rotate: 360 }}
      transition={{ duration: 4, ease: 'linear' }}
      whileHover={{ scale: 1.3 }}
      whileTap={{ scale: 0.8 }}
      onClick={() => onClick(id)}
      className="absolute text-6xl cursor-pointer z-10 hover:drop-shadow-2xl"
      style={{ left: 0, top: 0 }}
    >
      🎂
    </motion.button>
  );
}
