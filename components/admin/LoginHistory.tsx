/**
 * Login History - Display login events with Lagos timezone
 */

'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

interface LoginEvent {
  id: string;
  user_type: 'simi' | 'admin';
  status: 'success' | 'failed' | 'rate_limited';
  login_timestamp: string;
  ip_address: string | null;
  user_agent: string | null;
  created_at: string;
  // Formatted Lagos timezone fields (added by API)
  lagos_date?: string;
  lagos_time?: string;
  lagos_datetime?: string;
}

export default function LoginHistory() {
  const [events, setEvents] = useState<LoginEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    try {
      setLoading(true);
      setError('');
      
      const response = await fetch('/api/admin/login-history');
      
      if (!response.ok) {
        throw new Error('Failed to load login history');
      }
      
      const data = await response.json();
      setEvents(data.events || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load history');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      timeZone: 'Africa/Lagos',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };

  const getRoleColor = (userType: string) => {
    return userType === 'admin' ? 'text-purple-400' : 'text-pink-400';
  };

  const getRoleBadge = (userType: string) => {
    return userType === 'admin' ? '🔑 Admin' : '👤 Simi';
  };

  const isSuccess = (status: string) => {
    return status === 'success';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-yellow-400/30 border-t-yellow-400 rounded-full animate-spin" />
          <p className="text-gray-400">Loading history...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-500/10 border border-red-400/30 rounded-xl p-6 text-center">
        <p className="text-red-300 mb-4">{error}</p>
        <button
          onClick={loadHistory}
          className="px-4 py-2 bg-red-500/20 hover:bg-red-500/30 border border-red-400/30 text-red-300 rounded-lg transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Stats Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="bg-gradient-to-br from-yellow-500/10 to-yellow-600/5 border border-yellow-400/30 rounded-xl p-4">
          <div className="text-yellow-400 text-2xl font-bold">
            {events.length}
          </div>
          <div className="text-gray-400 text-sm mt-1">Total Events</div>
        </div>
        <div className="bg-gradient-to-br from-green-500/10 to-green-600/5 border border-green-400/30 rounded-xl p-4">
          <div className="text-green-400 text-2xl font-bold">
            {events.filter(e => e.status === 'success').length}
          </div>
          <div className="text-gray-400 text-sm mt-1">Successful</div>
        </div>
        <div className="bg-gradient-to-br from-red-500/10 to-red-600/5 border border-red-400/30 rounded-xl p-4">
          <div className="text-red-400 text-2xl font-bold">
            {events.filter(e => e.status === 'failed').length}
          </div>
          <div className="text-gray-400 text-sm mt-1">Failed</div>
        </div>
      </div>

      {/* Event List */}
      {events.length === 0 ? (
        <div className="bg-gray-800/20 border border-gray-700/30 rounded-xl p-12 text-center">
          <div className="text-4xl mb-4">📊</div>
          <p className="text-gray-400">No login events yet</p>
        </div>
      ) : (
        <div className="space-y-2">
          {events.map((event, index) => (
            <motion.div
              key={event.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className={`
                bg-gray-800/30 border rounded-xl p-4
                ${isSuccess(event.status) 
                  ? 'border-gray-700/30 hover:border-gray-600/30' 
                  : 'border-red-400/20 hover:border-red-400/30'
                }
                transition-colors
              `}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-start gap-3">
                  <div className="text-2xl mt-1">
                    {isSuccess(event.status) ? '✅' : event.status === 'rate_limited' ? '⏱️' : '❌'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`font-medium ${getRoleColor(event.user_type)}`}>
                        {getRoleBadge(event.user_type)}
                      </span>
                      <span className="text-gray-500 text-sm">
                        {event.status === 'success' ? 'logged in' : event.status === 'rate_limited' ? 'rate limited' : 'failed to login'}
                      </span>
                    </div>
                    <div className="text-gray-400 text-sm">
                      {event.lagos_datetime || formatDate(event.login_timestamp)}
                    </div>
                    {event.ip_address && (
                      <div className="text-gray-500 text-xs mt-1 font-mono truncate">
                        IP: {event.ip_address}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
