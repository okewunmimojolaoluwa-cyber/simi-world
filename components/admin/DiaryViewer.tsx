/**
 * Secret Diary Viewer - Admin only
 * Shows ALL of Simi's diary entries including deleted ones
 * She doesn't know you can see everything 🤫
 */

'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface DiaryEntry {
  id: string;
  title: string;
  content: string;
  mood: string;
  created_at: string;
  updated_at: string;
  deleted_at?: string | null;
}

export default function DiaryViewer() {
  const [entries, setEntries] = useState<DiaryEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedEntry, setSelectedEntry] = useState<DiaryEntry | null>(null);
  const [showDeleted, setShowDeleted] = useState(true);

  useEffect(() => {
    loadEntries();
  }, []);

  const loadEntries = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/diary');
      
      if (!response.ok) throw new Error('Failed to load entries');
      
      const data = await response.json();
      // Admin sees ALL entries including deleted
      setEntries(data.entries);
    } catch (err) {
      console.error('Load diary error:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatFullDate = (dateString: string) => {
    return `${formatDate(dateString)} at ${formatTime(dateString)}`;
  };

  const activeEntries = entries.filter(e => !e.deleted_at);
  const deletedEntries = entries.filter(e => e.deleted_at);
  const displayEntries = showDeleted ? entries : activeEntries;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-purple-400/30 border-t-purple-400 rounded-full animate-spin" />
          <p className="text-gray-400">Loading diary entries...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-400/30 rounded-xl p-6">
        <div className="flex items-start justify-between gap-4 mb-4">
          <div>
            <h2 className="text-2xl font-bold text-purple-300 mb-2 flex items-center gap-2">
              <span>🤫</span>
              <span>Simi's Secret Diary</span>
            </h2>
            <p className="text-gray-400 text-sm">
              Read all her thoughts and feelings. She doesn't know you can see this. 💕
            </p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-purple-500/10 border border-purple-400/20 rounded-lg p-4">
            <div className="text-2xl font-bold text-purple-300">
              {entries.length}
            </div>
            <div className="text-gray-400 text-sm mt-1">Total Entries</div>
          </div>
          <div className="bg-green-500/10 border border-green-400/20 rounded-lg p-4">
            <div className="text-2xl font-bold text-green-300">
              {activeEntries.length}
            </div>
            <div className="text-gray-400 text-sm mt-1">Active</div>
          </div>
          <div className="bg-red-500/10 border border-red-400/20 rounded-lg p-4">
            <div className="text-2xl font-bold text-red-300">
              {deletedEntries.length}
            </div>
            <div className="text-gray-400 text-sm mt-1">Deleted (Secret)</div>
          </div>
        </div>
      </div>

      {/* Filter Toggle */}
      <div className="flex items-center justify-between gap-4 bg-gray-800/30 border border-gray-700/30 rounded-xl p-4">
        <span className="text-gray-300 text-sm font-medium">
          Show deleted entries:
        </span>
        <button
          onClick={() => setShowDeleted(!showDeleted)}
          className={`
            relative w-14 h-7 rounded-full transition-all
            ${showDeleted ? 'bg-purple-500' : 'bg-gray-600'}
          `}
        >
          <motion.div
            animate={{ x: showDeleted ? 28 : 4 }}
            className="absolute top-1 w-5 h-5 bg-white rounded-full"
          />
        </button>
      </div>

      {/* Entries List */}
      {displayEntries.length === 0 ? (
        <div className="bg-gray-800/20 border border-gray-700/30 rounded-xl p-12 text-center">
          <div className="text-4xl mb-4">📖</div>
          <p className="text-gray-400">
            {showDeleted ? 'No diary entries yet' : 'No active entries'}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {displayEntries.map((entry, index) => (
            <motion.div
              key={entry.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.03 }}
              onClick={() => setSelectedEntry(entry)}
              className={`
                group rounded-xl p-4 sm:p-5 cursor-pointer transition-all
                ${entry.deleted_at
                  ? 'bg-red-500/5 border border-red-400/30 hover:border-red-400/50'
                  : 'bg-gradient-to-br from-purple-500/5 to-pink-500/5 border border-purple-400/20 hover:border-purple-400/40'
                }
              `}
            >
              <div className="flex items-start gap-4">
                {/* Mood & Status */}
                <div className="flex flex-col items-center gap-1">
                  <div className="text-3xl sm:text-4xl">
                    {entry.mood}
                  </div>
                  {entry.deleted_at && (
                    <div className="text-xs text-red-400">🗑️</div>
                  )}
                </div>

                {/* Content Preview */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <h3 className={`text-base sm:text-lg font-bold ${
                      entry.deleted_at ? 'text-red-300' : 'text-purple-300'
                    }`}>
                      {entry.title}
                      {entry.deleted_at && (
                        <span className="ml-2 text-xs text-red-400">(Deleted)</span>
                      )}
                    </h3>
                  </div>
                  
                  <p className="text-gray-400 text-sm line-clamp-2 mb-3">
                    {entry.content}
                  </p>

                  <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500">
                    <span>✍️ {formatFullDate(entry.created_at)}</span>
                    {entry.deleted_at && (
                      <span className="text-red-400">
                        🗑️ Deleted: {formatFullDate(entry.deleted_at)}
                      </span>
                    )}
                  </div>
                </div>

                {/* Arrow */}
                <div className={`opacity-0 group-hover:opacity-100 transition-opacity ${
                  entry.deleted_at ? 'text-red-400' : 'text-purple-400'
                }`}>
                  →
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Entry Detail Modal */}
      <AnimatePresence>
        {selectedEntry && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedEntry(null)}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className={`
                rounded-xl max-w-2xl w-full max-h-[85vh] overflow-y-auto p-6 space-y-4
                ${selectedEntry.deleted_at
                  ? 'bg-gray-900 border border-red-400/50'
                  : 'bg-gray-900 border border-purple-400/30'
                }
              `}
            >
              {/* Deleted Badge */}
              {selectedEntry.deleted_at && (
                <div className="bg-red-500/20 border border-red-400/50 rounded-lg p-3 text-center">
                  <p className="text-red-300 font-medium">
                    🗑️ This entry was deleted by Simi
                  </p>
                  <p className="text-red-400/70 text-sm mt-1">
                    Deleted on {formatFullDate(selectedEntry.deleted_at)}
                  </p>
                  <p className="text-gray-500 text-xs mt-2">
                    She doesn't know you can still see it 🤫
                  </p>
                </div>
              )}

              {/* Header */}
              <div className="flex items-start gap-4">
                <div className="text-5xl">{selectedEntry.mood}</div>
                <div className="flex-1">
                  <h2 className={`text-2xl font-bold mb-2 ${
                    selectedEntry.deleted_at ? 'text-red-300' : 'text-purple-300'
                  }`}>
                    {selectedEntry.title}
                  </h2>
                  <div className="text-sm text-gray-500 space-y-1">
                    <div>✍️ Written: {formatFullDate(selectedEntry.created_at)}</div>
                    {selectedEntry.updated_at !== selectedEntry.created_at && (
                      <div>✏️ Updated: {formatFullDate(selectedEntry.updated_at)}</div>
                    )}
                  </div>
                </div>
              </div>

              {/* Content */}
              <div className={`rounded-lg p-4 border ${
                selectedEntry.deleted_at
                  ? 'bg-red-500/5 border-red-400/20'
                  : 'bg-gray-800/30 border-gray-700/30'
              }`}>
                <p className="text-gray-300 whitespace-pre-wrap leading-relaxed">
                  {selectedEntry.content}
                </p>
              </div>

              {/* Close Button */}
              <button
                onClick={() => setSelectedEntry(null)}
                className="w-full py-3 bg-gray-800/50 border border-gray-700/30 text-gray-300 rounded-lg hover:bg-gray-800 transition-all"
              >
                Close
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
