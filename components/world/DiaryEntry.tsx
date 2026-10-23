/**
 * Diary Entry - Simi's personal diary feature
 * She can write daily thoughts and reflections
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

export default function DiaryEntry() {
  const [entries, setEntries] = useState<DiaryEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [writing, setWriting] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState<DiaryEntry | null>(null);
  
  // Form state
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [mood, setMood] = useState('😊');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const moods = ['😊', '😔', '😍', '😢', '😄', '😌', '🥰', '😤', '🤔', '😴'];

  useEffect(() => {
    loadEntries();
  }, []);

  const loadEntries = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/diary');
      
      if (!response.ok) throw new Error('Failed to load entries');
      
      const data = await response.json();
      // Only show non-deleted entries to Simi
      setEntries(data.entries.filter((e: DiaryEntry) => !e.deleted_at));
    } catch (err) {
      console.error('Load diary error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!title.trim() || !content.trim()) {
      setError('Please write a title and your thoughts');
      return;
    }

    try {
      setSaving(true);
      setError('');

      const response = await fetch('/api/diary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: title.trim(),
          content: content.trim(),
          mood,
        }),
      });

      if (!response.ok) throw new Error('Failed to save entry');

      // Reset form
      setTitle('');
      setContent('');
      setMood('😊');
      setWriting(false);
      
      // Reload entries
      await loadEntries();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this diary entry?')) return;

    try {
      const response = await fetch(`/api/diary?id=${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete');

      // Remove from UI
      setEntries(prev => prev.filter(e => e.id !== id));
      setSelectedEntry(null);
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to delete');
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
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

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-pink-400/30 border-t-pink-400 rounded-full animate-spin" />
          <p className="text-gray-400">Loading your diary...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-pink-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
          📖 My Secret Diary
        </h1>
        <p className="text-gray-400">
          Your private space to express yourself ✨
        </p>
      </div>

      {/* Write New Entry Button */}
      {!writing && (
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setWriting(true)}
          className="w-full py-4 bg-gradient-to-r from-pink-500/20 to-purple-500/20 border-2 border-pink-400/30 rounded-xl text-pink-300 font-medium hover:border-pink-400/50 transition-all"
        >
          ✍️ Write New Entry
        </motion.button>
      )}

      {/* Writing Form */}
      <AnimatePresence>
        {writing && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-gradient-to-br from-pink-500/5 to-purple-500/5 border border-pink-400/20 rounded-xl p-6 space-y-4"
          >
            {/* Mood Selector */}
            <div className="space-y-2">
              <label className="text-gray-300 text-sm font-medium">
                How are you feeling? 💭
              </label>
              <div className="flex gap-2 flex-wrap">
                {moods.map((m) => (
                  <button
                    key={m}
                    onClick={() => setMood(m)}
                    className={`
                      text-3xl p-2 rounded-lg transition-all
                      ${mood === m
                        ? 'bg-pink-500/20 border-2 border-pink-400 scale-110'
                        : 'bg-gray-800/30 border border-gray-700/30 hover:scale-105'
                      }
                    `}
                  >
                    {m}
                  </button>
                ))}
              </div>
            </div>

            {/* Title */}
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Today's title..."
              maxLength={100}
              className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700/30 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-pink-400/50 focus:ring-2 focus:ring-pink-400/20"
            />

            {/* Content */}
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="What's on your mind? Write freely... 💕"
              rows={8}
              className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700/30 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-pink-400/50 focus:ring-2 focus:ring-pink-400/20 resize-none"
            />

            {/* Error */}
            {error && (
              <p className="text-red-400 text-sm">{error}</p>
            )}

            {/* Actions */}
            <div className="flex gap-3">
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex-1 py-3 bg-gradient-to-r from-pink-500 to-purple-500 text-white font-medium rounded-lg hover:from-pink-600 hover:to-purple-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? 'Saving...' : '💾 Save Entry'}
              </button>
              <button
                onClick={() => {
                  setWriting(false);
                  setTitle('');
                  setContent('');
                  setError('');
                }}
                disabled={saving}
                className="px-6 py-3 bg-gray-800/50 border border-gray-700/30 text-gray-300 rounded-lg hover:bg-gray-800 transition-all disabled:opacity-50"
              >
                Cancel
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Entries List */}
      {entries.length === 0 ? (
        <div className="bg-gray-800/20 border border-gray-700/30 rounded-xl p-12 text-center">
          <div className="text-4xl mb-4">📖</div>
          <p className="text-gray-400">
            No diary entries yet. Start writing! ✍️
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {entries.map((entry, index) => (
            <motion.div
              key={entry.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              onClick={() => setSelectedEntry(entry)}
              className="group bg-gradient-to-br from-pink-500/5 to-purple-500/5 border border-pink-400/20 rounded-xl p-4 sm:p-6 cursor-pointer hover:border-pink-400/40 transition-all"
            >
              <div className="flex items-start gap-4">
                {/* Mood Icon */}
                <div className="text-4xl flex-shrink-0">
                  {entry.mood}
                </div>

                {/* Content Preview */}
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg sm:text-xl font-bold text-pink-300 mb-2">
                    {entry.title}
                  </h3>
                  <p className="text-gray-400 text-sm sm:text-base line-clamp-2 mb-3">
                    {entry.content}
                  </p>
                  <div className="flex items-center gap-4 text-xs sm:text-sm text-gray-500">
                    <span>📅 {formatDate(entry.created_at)}</span>
                    <span>🕐 {formatTime(entry.created_at)}</span>
                  </div>
                </div>

                {/* Arrow */}
                <div className="text-pink-400 opacity-0 group-hover:opacity-100 transition-opacity">
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
              className="bg-gray-900 border border-pink-400/30 rounded-xl max-w-2xl w-full max-h-[80vh] overflow-y-auto p-6 space-y-4"
            >
              {/* Header */}
              <div className="flex items-start gap-4 mb-4">
                <div className="text-5xl">{selectedEntry.mood}</div>
                <div className="flex-1">
                  <h2 className="text-2xl font-bold text-pink-300 mb-2">
                    {selectedEntry.title}
                  </h2>
                  <div className="text-sm text-gray-500 space-y-1">
                    <div>📅 {formatDate(selectedEntry.created_at)}</div>
                    <div>🕐 {formatTime(selectedEntry.created_at)}</div>
                  </div>
                </div>
              </div>

              {/* Content */}
              <div className="bg-gray-800/30 rounded-lg p-4 border border-gray-700/30">
                <p className="text-gray-300 whitespace-pre-wrap leading-relaxed">
                  {selectedEntry.content}
                </p>
              </div>

              {/* Actions */}
              <div className="flex gap-3">
                <button
                  onClick={() => handleDelete(selectedEntry.id)}
                  className="px-4 py-2 bg-red-500/20 border border-red-400/30 text-red-300 rounded-lg hover:bg-red-500/30 transition-all"
                >
                  🗑️ Delete
                </button>
                <button
                  onClick={() => setSelectedEntry(null)}
                  className="flex-1 py-2 bg-gray-800/50 border border-gray-700/30 text-gray-300 rounded-lg hover:bg-gray-800 transition-all"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
