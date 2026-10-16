'use client';

import { motion } from 'framer-motion';
import { UniverseState } from '@/lib/persistence';
import { WORLD } from '@/data/world';

interface AchievementsProps {
  state: UniverseState;
  onBack: () => void;
}

export default function Achievements({ state, onBack }: AchievementsProps) {
  const achievements = WORLD.achievements;
  const unlockedIds = state.unlockedAchievements || [];
  const unlockedCount = unlockedIds.length;
  const totalCount = achievements.length;
  const progress = Math.round((unlockedCount / totalCount) * 100);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0a0a] via-[#1a0a14] to-[#0a0a14] py-12 px-4 sm:px-6 lg:px-8 overflow-y-auto">
      {/* Back Button */}
      <motion.button
        onClick={onBack}
        whileHover={{ x: -4, scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="fixed top-6 left-6 z-50 px-4 py-2 rounded-full bg-black/60 backdrop-blur-sm border border-yellow-500/30 text-yellow-300/80 hover:text-yellow-200 hover:border-yellow-400/50 transition-all duration-300 text-sm font-bold"
      >
        ← Back
      </motion.button>

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center mb-12 mt-8"
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
          🏆
        </motion.div>
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-serif text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 via-yellow-200 to-yellow-300 mb-2">
          Achievements
        </h1>
        <p className="text-yellow-200/60 text-sm sm:text-base mb-6">
          {unlockedCount} of {totalCount} unlocked
        </p>

        {/* Progress Bar */}
        <div className="max-w-md mx-auto">
          <div className="h-3 bg-black/40 rounded-full overflow-hidden border border-yellow-500/20">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 1, delay: 0.3, ease: 'easeOut' }}
              className="h-full bg-gradient-to-r from-yellow-600 to-yellow-400 relative"
            >
              <motion.div
                animate={{
                  x: ['-100%', '100%'],
                }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  ease: 'linear',
                }}
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
              />
            </motion.div>
          </div>
          <p className="text-yellow-300/70 text-xs mt-2 font-bold">{progress}% Complete</p>
        </div>
      </motion.div>

      {/* Achievements Grid */}
      <motion.div
        initial="hidden"
        animate="show"
        variants={{
          hidden: { opacity: 0 },
          show: {
            opacity: 1,
            transition: {
              staggerChildren: 0.05,
            },
          },
        }}
        className="max-w-5xl mx-auto grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4"
      >
        {achievements.map((achievement) => {
          const isUnlocked = unlockedIds.includes(achievement.id);

          return (
            <motion.div
              key={achievement.id}
              variants={{
                hidden: { opacity: 0, scale: 0.8, y: 20 },
                show: { opacity: 1, scale: 1, y: 0 },
              }}
              whileHover={isUnlocked ? { scale: 1.05, y: -5 } : {}}
              className={`
                relative p-4 rounded-2xl backdrop-blur-sm transition-all duration-300
                ${
                  isUnlocked
                    ? 'bg-gradient-to-br from-yellow-500/20 to-yellow-600/10 border border-yellow-400/40 shadow-lg shadow-yellow-500/10'
                    : 'bg-black/40 border border-gray-700/30 opacity-50 grayscale'
                }
              `}
            >
              {/* Locked Overlay */}
              {!isUnlocked && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/60 rounded-2xl backdrop-blur-sm">
                  <div className="text-4xl opacity-50">🔒</div>
                </div>
              )}

              {/* Achievement Icon */}
              <motion.div
                animate={
                  isUnlocked
                    ? {
                        scale: [1, 1.1, 1],
                        rotate: [0, 5, -5, 0],
                      }
                    : {}
                }
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  repeatDelay: 3,
                }}
                className="text-5xl mb-3 text-center"
              >
                {achievement.emoji}
              </motion.div>

              {/* Achievement Info */}
              <div className="text-center">
                <h3
                  className={`font-bold text-sm mb-1 ${
                    isUnlocked ? 'text-yellow-200' : 'text-gray-400'
                  }`}
                >
                  {achievement.title}
                </h3>
                <p
                  className={`text-xs ${
                    isUnlocked ? 'text-yellow-300/60' : 'text-gray-500'
                  }`}
                >
                  {achievement.description}
                </p>
              </div>

              {/* Unlock Sparkle Effect */}
              {isUnlocked && (
                <>
                  {[...Array(4)].map((_, i) => (
                    <motion.div
                      key={i}
                      className="absolute w-1 h-1 bg-yellow-300 rounded-full"
                      style={{
                        top: '20%',
                        left: '20%',
                      }}
                      animate={{
                        x: [0, (i % 2 === 0 ? 1 : -1) * 30],
                        y: [0, (i < 2 ? -1 : 1) * 30],
                        opacity: [1, 0],
                        scale: [1, 0],
                      }}
                      transition={{
                        duration: 1,
                        repeat: Infinity,
                        delay: i * 0.2,
                        repeatDelay: 2,
                      }}
                    />
                  ))}
                </>
              )}
            </motion.div>
          );
        })}
      </motion.div>

      {/* Achievement Hints */}
      {unlockedCount < totalCount && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="mt-12 max-w-2xl mx-auto p-6 bg-gradient-to-br from-yellow-500/10 to-transparent backdrop-blur-sm rounded-2xl border border-yellow-400/20"
        >
          <h3 className="text-lg font-bold text-yellow-200 mb-3 text-center">
            ✨ How to Unlock More
          </h3>
          <ul className="space-y-2 text-sm text-yellow-300/70">
            <li>🎮 Play all the mini-games to unlock achievements</li>
            <li>🐾 Feed and play with Olajuwon the cat</li>
            <li>🗺️ Explore different areas of the universe</li>
            <li>🕒 Visit at different times (midnight, early morning)</li>
            <li>🎂 Come back on your birthday for a special surprise</li>
            <li>🌙 Try all the different mood settings</li>
            <li>⭐ Visit for 7 days in a row to build your streak</li>
          </ul>
        </motion.div>
      )}

      {/* Celebration for 100% */}
      {progress === 100 && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="mt-12 text-center"
        >
          <div className="text-6xl mb-4">🎉✨🏆✨🎉</div>
          <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-200 to-yellow-400 mb-2">
            Perfect Score!
          </h2>
          <p className="text-yellow-300/80 text-lg">
            You've unlocked every achievement! You're amazing! 🌟
          </p>
        </motion.div>
      )}
    </div>
  );
}
