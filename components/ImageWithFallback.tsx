'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';

interface ImageWithFallbackProps {
  src: string;
  alt: string;
  className?: string;
}

export default function ImageWithFallback({ src, alt, className = '' }: ImageWithFallbackProps) {
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(true);

  if (error) {
    return (
      <div className={`${className} bg-gradient-to-br from-deep-burgundy/20 to-deep-burgundy/5 flex items-center justify-center`}>
        <div className="text-center p-8">
          <div className="text-6xl mb-4">📸</div>
          <p className="text-soft-rose text-sm">
            Add photo here:<br />
            <code className="text-xs text-muted-blush">{src}</code>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full">
      {loading && (
        <div className="absolute inset-0 bg-gradient-to-br from-deep-burgundy/20 to-deep-burgundy/5 flex items-center justify-center">
          <motion.div
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.5, 1, 0.5],
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
            className="text-4xl"
          >
            ❤️
          </motion.div>
        </div>
      )}
      <img
        src={src}
        alt={alt}
        className={className}
        onLoad={() => setLoading(false)}
        onError={() => {
          setError(true);
          setLoading(false);
        }}
      />
    </div>
  );
}
