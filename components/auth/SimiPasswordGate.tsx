/**
 * Simi Password Gate - Beautiful password screen matching gift theme
 * Appears after birthday intro, before dashboard access
 */

'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface SimiPasswordGateProps {
  onAuthenticated: () => void;
  onLogin: (password: string) => Promise<{ success: boolean; error?: string }>;
  onForgotPassword?: () => void;
}

export default function SimiPasswordGate({ onAuthenticated, onLogin, onForgotPassword }: SimiPasswordGateProps) {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!password) {
      setError('Please enter the password');
      return;
    }

    setLoading(true);
    setError('');

    const result = await onLogin(password);

    if (result.success) {
      onAuthenticated();
    } else {
      setError(result.error || 'Incorrect password');
      setPassword('');
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center overflow-hidden"
      style={{
        background: 'linear-gradient(135deg, #0a0a0a 0%, #1a0a14 50%, #0a0a0a 100%)',
      }}
    >
      {/* Floating particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-pink-300/20 rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [0, -30, 0],
              opacity: [0.2, 0.6, 0.2],
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

      {/* Main content */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6 }}
        className="relative z-10 w-full max-w-md px-6"
      >
        {/* Lock icon */}
        <motion.div
          className="text-center mb-8"
          animate={{
            scale: [1, 1.1, 1],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            repeatDelay: 3,
          }}
        >
          <div className="text-7xl mb-4">🔐</div>
          <h1 className="text-3xl sm:text-4xl font-serif text-transparent bg-clip-text bg-gradient-to-r from-pink-300 via-purple-300 to-pink-300 mb-2">
            Welcome Back
          </h1>
          <p className="text-pink-200/60 text-sm sm:text-base">
            Enter your special password to continue ✨
          </p>
        </motion.div>

        {/* Password form */}
        <motion.form
          onSubmit={handleSubmit}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="bg-gradient-to-br from-pink-50/10 to-purple-50/5 backdrop-blur-xl rounded-3xl shadow-2xl border border-pink-200/20 p-8"
        >
          {/* Password input */}
          <div className="mb-6">
            <label className="block text-pink-200/80 text-sm font-medium mb-3">
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setError('');
                }}
                className="w-full px-4 py-3 bg-white/5 border border-pink-300/20 rounded-xl text-white placeholder-pink-300/30 focus:outline-none focus:border-pink-300/50 focus:ring-2 focus:ring-pink-300/20 transition-all"
                placeholder="Enter password"
                disabled={loading}
                autoFocus
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-pink-300/50 hover:text-pink-300/80 transition-colors text-sm"
              >
                {showPassword ? '👁️' : '👁️‍🗨️'}
              </button>
            </div>
          </div>

          {/* Error message */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="mb-4 p-3 bg-red-500/10 border border-red-400/20 rounded-lg text-red-200 text-sm text-center"
              >
                {error}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Submit button */}
          <motion.button
            type="submit"
            disabled={loading || !password}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="w-full py-3 rounded-xl font-semibold text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            style={{
              background: loading
                ? 'linear-gradient(135deg, rgba(236, 72, 153, 0.5), rgba(168, 85, 247, 0.5))'
                : 'linear-gradient(135deg, rgb(236, 72, 153), rgb(168, 85, 247))',
              boxShadow: loading
                ? 'none'
                : '0 10px 40px rgba(236, 72, 153, 0.4)',
            }}
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <motion.span
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                >
                  ⏳
                </motion.span>
                Checking...
              </span>
            ) : (
              'Enter Your World'
            )}
          </motion.button>

          {/* Hint */}
          <p className="mt-4 text-center text-pink-300/40 text-xs">
            Hint: This is your special password from Olajuwon 💝
          </p>

          {/* Forgot Password Link */}
          {onForgotPassword && (
            <button
              type="button"
              onClick={onForgotPassword}
              className="mt-3 w-full text-center text-pink-300/60 hover:text-pink-300/90 text-sm underline transition-colors"
            >
              Forgot Password?
            </button>
          )}
        </motion.form>

        {/* Decorative elements */}
        <div className="absolute -top-20 -left-20 w-40 h-40 bg-pink-500/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-20 -right-20 w-40 h-40 bg-purple-500/10 rounded-full blur-3xl" />
      </motion.div>
    </div>
  );
}

