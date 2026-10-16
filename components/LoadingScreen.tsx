'use client';

import { motion } from 'framer-motion';

export default function LoadingScreen() {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-[#1a1618] via-[#2a1e24] to-[#3a2630]">
      <div className="text-center">
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.5, 1, 0.5],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
          className="text-6xl mb-4"
        >
          ❤️
        </motion.div>
        
        <motion.p
          animate={{
            opacity: [0.3, 1, 0.3],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
          className="text-warm-ivory text-lg"
        >
          Loading something special...
        </motion.p>
      </div>
    </div>
  );
}
