/**
 * Forgot Password Modal - Allows Simi to reset password without logging in
 */

'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { createPortal } from 'react-dom';

interface ForgotPasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (newPassword: string) => void;
}

export default function ForgotPasswordModal({ isOpen, onClose, onSuccess }: ForgotPasswordModalProps) {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [resetPassword, setResetPassword] = useState('');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validation
    if (!newPassword || !confirmPassword) {
      setError('All fields are required');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (newPassword.length < 4) {
      setError('Password must be at least 4 characters');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          newPassword,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess(true);
        setResetPassword(newPassword);
        setNewPassword('');
        setConfirmPassword('');
        
        setTimeout(() => {
          onSuccess?.(newPassword);
          onClose();
          setSuccess(false);
        }, 4000);
      } else {
        setError(data.error || 'Failed to reset password');
        setLoading(false);
      }
    } catch (err) {
      setError('Network error. Please try again.');
      setLoading(false);
    }
  };

  if (!isOpen || !mounted) return null;

  return createPortal(
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
          className="w-full max-w-md bg-gradient-to-br from-pink-50/10 to-purple-50/5 backdrop-blur-xl rounded-3xl shadow-2xl border border-pink-200/20 p-6 sm:p-8"
        >
          {/* Success State */}
          {success && (
            <div className="text-center py-8">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="text-7xl mb-4"
              >
                ✅
              </motion.div>
              <h3 className="text-2xl font-bold text-white mb-2">Password Reset!</h3>
              <p className="text-pink-200/80 mb-4">
                Your new password has been set successfully! 🔐
              </p>
              <div className="p-4 bg-green-500/20 border border-green-400/30 rounded-xl">
                <p className="text-xs text-green-200 mb-2">Your New Password:</p>
                <p className="text-2xl font-mono font-bold text-white">{resetPassword}</p>
              </div>
              <p className="text-pink-200/60 text-sm mt-4">
                Please save this password somewhere safe!
              </p>
            </div>
          )}

          {/* Form */}
          {!success && (
            <>
              {/* Header */}
              <div className="text-center mb-6">
                <div className="text-5xl mb-3">🔓</div>
                <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2">
                  Reset Password
                </h2>
                <p className="text-pink-200/60 text-sm">
                  Set a new password for your world
                </p>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* New Password */}
                <div>
                  <label className="block text-pink-200/80 text-sm font-medium mb-2">
                    New Password
                  </label>
                  <div className="relative">
                    <input
                      type={showNew ? 'text' : 'password'}
                      value={newPassword}
                      onChange={(e) => {
                        setNewPassword(e.target.value);
                        setError('');
                      }}
                      className="w-full px-4 py-3 bg-white/5 border border-pink-300/20 rounded-xl text-white placeholder-pink-300/30 focus:outline-none focus:border-pink-300/50 focus:ring-2 focus:ring-pink-300/20 transition-all"
                      placeholder="Enter new password"
                      disabled={loading}
                      autoFocus
                    />
                    <button
                      type="button"
                      onClick={() => setShowNew(!showNew)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-pink-300/50 hover:text-pink-300/80 transition-colors"
                    >
                      {showNew ? '👁️' : '👁️‍🗨️'}
                    </button>
                  </div>
                </div>

                {/* Confirm Password */}
                <div>
                  <label className="block text-pink-200/80 text-sm font-medium mb-2">
                    Confirm New Password
                  </label>
                  <div className="relative">
                    <input
                      type={showConfirm ? 'text' : 'password'}
                      value={confirmPassword}
                      onChange={(e) => {
                        setConfirmPassword(e.target.value);
                        setError('');
                      }}
                      className="w-full px-4 py-3 bg-white/5 border border-pink-300/20 rounded-xl text-white placeholder-pink-300/30 focus:outline-none focus:border-pink-300/50 focus:ring-2 focus:ring-pink-300/20 transition-all"
                      placeholder="Confirm new password"
                      disabled={loading}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirm(!showConfirm)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-pink-300/50 hover:text-pink-300/80 transition-colors"
                    >
                      {showConfirm ? '👁️' : '👁️‍🗨️'}
                    </button>
                  </div>
                </div>

                {/* Error Message */}
                <AnimatePresence>
                  {error && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="p-3 bg-red-500/10 border border-red-400/20 rounded-lg text-red-200 text-sm text-center"
                    >
                      {error}
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Info */}
                <div className="p-3 bg-blue-500/10 border border-blue-400/20 rounded-lg text-blue-200 text-xs text-center">
                  💡 Make sure to save your new password somewhere safe!
                </div>

                {/* Buttons */}
                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={onClose}
                    disabled={loading}
                    className="flex-1 py-3 rounded-xl font-semibold text-pink-200 bg-white/5 border border-pink-200/20 hover:bg-white/10 transition-all disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 py-3 rounded-xl font-semibold text-white bg-gradient-to-r from-pink-500 to-purple-500 hover:shadow-lg hover:shadow-pink-500/50 transition-all disabled:opacity-50"
                  >
                    {loading ? 'Resetting...' : 'Reset Password'}
                  </button>
                </div>
              </form>
            </>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>,
    document.body
  );
}
