/**
 * Change Password Modal - Beautiful modal for Simi to change her password
 */

'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { createPortal } from 'react-dom';

interface ChangePasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export default function ChangePasswordModal({ isOpen, onClose, onSuccess }: ChangePasswordModalProps) {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [success, setSuccess] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validation
    if (!currentPassword || !newPassword || !confirmPassword) {
      setError('All fields are required');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('New passwords do not match');
      return;
    }

    if (newPassword.length < 4) {
      setError('Password must be at least 4 characters');
      return;
    }

    if (newPassword === currentPassword) {
      setError('New password must be different from current password');
      return;
    }

    // Show confirmation dialog
    setShowConfirmation(true);
  };

  const confirmChange = async () => {
    setLoading(true);
    setShowConfirmation(false);

    try {
      const response = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentPassword,
          newPassword,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess(true);
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
        
        setTimeout(() => {
          onSuccess?.();
          onClose();
          setSuccess(false);
        }, 3000);
      } else {
        setError(data.error || 'Failed to change password');
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
              <h3 className="text-2xl font-bold text-white mb-2">Password Changed!</h3>
              <p className="text-pink-200/80">
                Your new password has been set successfully.
                <br />
                Admin has been notified! 🔐
              </p>
            </div>
          )}

          {/* Confirmation Dialog */}
          {showConfirmation && !success && (
            <div className="text-center">
              <div className="text-6xl mb-4">🔒</div>
              <h3 className="text-2xl font-bold text-white mb-3">Are you sure?</h3>
              <p className="text-pink-200/80 mb-6">
                Do you want to change your password?
                <br />
                Admin will be able to see your new password.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowConfirmation(false)}
                  className="flex-1 py-3 rounded-xl font-semibold text-pink-200 bg-white/5 border border-pink-200/20 hover:bg-white/10 transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmChange}
                  className="flex-1 py-3 rounded-xl font-semibold text-white bg-gradient-to-r from-pink-500 to-purple-500 hover:shadow-lg hover:shadow-pink-500/50 transition-all"
                >
                  Yes, Change It
                </button>
              </div>
            </div>
          )}

          {/* Form */}
          {!showConfirmation && !success && (
            <>
              {/* Header */}
              <div className="text-center mb-6">
                <div className="text-5xl mb-3">🔐</div>
                <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2">
                  Change Password
                </h2>
                <p className="text-pink-200/60 text-sm">
                  Update your password to keep your world secure
                </p>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Current Password */}
                <div>
                  <label className="block text-pink-200/80 text-sm font-medium mb-2">
                    Current Password
                  </label>
                  <div className="relative">
                    <input
                      type={showCurrent ? 'text' : 'password'}
                      value={currentPassword}
                      onChange={(e) => {
                        setCurrentPassword(e.target.value);
                        setError('');
                      }}
                      className="w-full px-4 py-3 bg-white/5 border border-pink-300/20 rounded-xl text-white placeholder-pink-300/30 focus:outline-none focus:border-pink-300/50 focus:ring-2 focus:ring-pink-300/20 transition-all"
                      placeholder="Enter current password"
                      disabled={loading}
                    />
                    <button
                      type="button"
                      onClick={() => setShowCurrent(!showCurrent)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-pink-300/50 hover:text-pink-300/80 transition-colors"
                    >
                      {showCurrent ? '👁️' : '👁️‍🗨️'}
                    </button>
                  </div>
                </div>

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
                <div className="p-3 bg-yellow-500/10 border border-yellow-400/20 rounded-lg text-yellow-200 text-xs text-center">
                  ⚠️ Admin will be notified and can see your new password
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
                    {loading ? 'Changing...' : 'Change Password'}
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
