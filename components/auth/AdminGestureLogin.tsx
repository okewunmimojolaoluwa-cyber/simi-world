/**
 * Admin Gesture Login - 5-click interaction on "Happy Birthday My Baby" text
 * Hidden admin entrance with password prompt
 */

'use client';

import { useState, useEffect, useRef, ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface AdminGestureLoginProps {
  targetText: ReactNode; // The text element to attach click handler to
  onAdminLogin: (password: string) => Promise<{ success: boolean; error?: string }>;
  onAuthenticated: () => void;
}

export default function AdminGestureLogin({
  targetText,
  onAdminLogin,
  onAuthenticated,
}: AdminGestureLoginProps) {
  const [clickCount, setClickCount] = useState(0);
  const [showPrompt, setShowPrompt] = useState(false);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const clickTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Reset click count after 3 seconds of no clicks
  useEffect(() => {
    if (clickCount > 0 && clickCount < 5) {
      if (clickTimerRef.current) {
        clearTimeout(clickTimerRef.current);
      }
      
      clickTimerRef.current = setTimeout(() => {
        setClickCount(0);
      }, 3000);
    }

    return () => {
      if (clickTimerRef.current) {
        clearTimeout(clickTimerRef.current);
      }
    };
  }, [clickCount]);

  const handleTextClick = () => {
    const newCount = clickCount + 1;
    setClickCount(newCount);

    if (newCount === 5) {
      setShowPrompt(true);
      setClickCount(0);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!password) {
      setError('Please enter admin password');
      return;
    }

    setLoading(true);
    setError('');

    const result = await onAdminLogin(password);

    if (result.success) {
      setShowPrompt(false);
      onAuthenticated();
    } else {
      setError(result.error || 'Incorrect admin password');
      setPassword('');
      setLoading(false);
    }
  };

  const handleClose = () => {
    setShowPrompt(false);
    setPassword('');
    setError('');
    setClickCount(0);
  };

  return (
    <>
      {/* Invisible click target overlay on the birthday text */}
      <div
        onClick={handleTextClick}
        className="cursor-default select-none"
        style={{ display: 'contents' }}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            handleTextClick();
          }
        }}
        aria-label="Admin access"
      >
        {targetText}
      </div>

      {/* Click progress indicator (only visible when clicking) */}
      <AnimatePresence>
        {clickCount > 0 && clickCount < 5 && !showPrompt && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="fixed top-4 right-4 z-50 flex gap-1"
          >
            {[...Array(5)].map((_, i) => (
              <div
                key={i}
                className={`w-2 h-2 rounded-full transition-all ${
                  i < clickCount
                    ? 'bg-yellow-400 scale-125'
                    : 'bg-gray-600/30'
                }`}
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Admin password prompt */}
      <AnimatePresence>
        {showPrompt && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={handleClose}
              className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50"
            />

            {/* Modal */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: -20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: -20 }}
              transition={{ type: 'spring', damping: 20 }}
              className="fixed inset-0 flex items-center justify-center z-50 px-4"
            >
              <div className="w-full max-w-sm bg-gradient-to-br from-gray-900 to-black border border-yellow-500/30 rounded-2xl shadow-2xl p-6">
                {/* Header */}
                <div className="text-center mb-6">
                  <div className="text-4xl mb-2">🔑</div>
                  <h2 className="text-xl font-bold text-yellow-400 mb-1">
                    Admin Access
                  </h2>
                  <p className="text-gray-400 text-sm">
                    Enter administrator password
                  </p>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit}>
                  <div className="mb-4">
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => {
                        setPassword(e.target.value);
                        setError('');
                      }}
                      className="w-full px-4 py-3 bg-black/50 border border-yellow-500/30 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-yellow-500/60 focus:ring-2 focus:ring-yellow-500/20 transition-all"
                      placeholder="Admin password"
                      disabled={loading}
                      autoFocus
                    />
                  </div>

                  {/* Error */}
                  {error && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mb-4 p-2 bg-red-500/10 border border-red-400/20 rounded text-red-300 text-sm text-center"
                    >
                      {error}
                    </motion.div>
                  )}

                  {/* Buttons */}
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={handleClose}
                      className="flex-1 py-2 px-4 bg-gray-700/50 hover:bg-gray-700 text-gray-300 rounded-lg transition-colors"
                      disabled={loading}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={loading || !password}
                      className="flex-1 py-2 px-4 bg-yellow-500 hover:bg-yellow-600 text-black font-semibold rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {loading ? 'Checking...' : 'Enter'}
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}

