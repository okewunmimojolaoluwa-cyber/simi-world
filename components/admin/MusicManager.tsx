/**
 * Music Manager - Upload and manage music tracks
 * Optimized for mobile responsiveness
 */

'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import MediaUploader from './MediaUploader';

interface MusicTrack {
  id: string;
  url: string;
  caption: string | null;
  order_index: number;
  created_at: string;
}

export default function MusicManager() {
  const [tracks, setTracks] = useState<MusicTrack[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [playingId, setPlayingId] = useState<string | null>(null);

  useEffect(() => {
    loadMusic();
  }, []);

  const loadMusic = async () => {
    try {
      setLoading(true);
      setError('');
      
      const response = await fetch('/api/media?type=music');
      
      if (!response.ok) {
        throw new Error('Failed to load music');
      }
      
      const data = await response.json();
      setTracks(data.media || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load music');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this track?')) {
      return;
    }

    try {
      setDeletingId(id);
      
      const response = await fetch(`/api/admin/media?id=${id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete track');
      }
      
      setTracks(prev => prev.filter(t => t.id !== id));
      if (playingId === id) {
        setPlayingId(null);
      }
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to delete');
    } finally {
      setDeletingId(null);
    }
  };

  const handleUploadComplete = () => {
    loadMusic();
  };

  const getTrackName = (url: string, caption: string | null) => {
    if (caption) return caption;
    const parts = url.split('/');
    const filename = parts[parts.length - 1];
    return decodeURIComponent(filename.replace(/\.[^/.]+$/, ''));
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Upload Section */}
      <div className="bg-gradient-to-br from-purple-500/5 to-pink-500/5 border border-purple-400/20 rounded-xl p-4 sm:p-6">
        <h2 className="text-lg sm:text-xl font-bold text-purple-400 mb-4 flex items-center gap-2">
          <span>📤</span>
          <span>Upload Music</span>
        </h2>
        <MediaUploader 
          onUploadComplete={handleUploadComplete}
          allowedTypes={['music']}
          defaultType="music"
        />
      </div>

      {/* Music Library */}
      <div className="bg-gray-800/20 border border-gray-700/30 rounded-xl p-4 sm:p-6">
        <h2 className="text-lg sm:text-xl font-bold text-gray-200 mb-4 flex items-center gap-2">
          <span>🎵</span>
          <span>Music Library ({tracks.length})</span>
        </h2>

        {loading ? (
          <div className="flex items-center justify-center py-12 sm:py-20">
            <div className="flex flex-col items-center gap-4">
              <div className="w-10 h-10 sm:w-12 sm:h-12 border-4 border-purple-400/30 border-t-purple-400 rounded-full animate-spin" />
              <p className="text-gray-400 text-sm sm:text-base">Loading music...</p>
            </div>
          </div>
        ) : error ? (
          <div className="bg-red-500/10 border border-red-400/30 rounded-xl p-4 sm:p-6 text-center">
            <p className="text-red-300 text-sm sm:text-base mb-4">{error}</p>
            <button
              onClick={loadMusic}
              className="px-4 py-2 bg-red-500/20 hover:bg-red-500/30 border border-red-400/30 text-red-300 rounded-lg transition-colors text-sm sm:text-base"
            >
              Retry
            </button>
          </div>
        ) : tracks.length === 0 ? (
          <div className="bg-gray-800/20 border border-gray-700/30 rounded-xl p-8 sm:p-12 text-center">
            <div className="text-3xl sm:text-4xl mb-3 sm:mb-4">🎵</div>
            <p className="text-gray-400 text-sm sm:text-base">
              No music tracks yet. Upload some above!
            </p>
          </div>
        ) : (
          <div className="space-y-2 sm:space-y-3">
            <AnimatePresence>
              {tracks.map((track, index) => (
                <motion.div
                  key={track.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ delay: index * 0.05 }}
                  className="group bg-gray-800/30 border border-gray-700/30 rounded-xl p-3 sm:p-4 hover:border-purple-400/30 transition-all"
                >
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4">
                    {/* Track Icon & Info */}
                    <div className="flex items-center gap-3 flex-1 min-w-0 w-full sm:w-auto">
                      <div className="text-2xl sm:text-3xl flex-shrink-0">
                        {playingId === track.id ? '🎶' : '🎵'}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-white font-medium text-sm sm:text-base truncate">
                          {getTrackName(track.url, track.caption)}
                        </h3>
                        <p className="text-gray-500 text-xs sm:text-sm">
                          {new Date(track.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>

                    {/* Audio Player - Full width on mobile */}
                    <div className="w-full sm:w-auto sm:flex-1 sm:max-w-xs">
                      <audio
                        src={track.url}
                        controls
                        onPlay={() => setPlayingId(track.id)}
                        onPause={() => setPlayingId(null)}
                        onEnded={() => setPlayingId(null)}
                        className="w-full h-8 sm:h-10"
                        style={{
                          filter: 'invert(0.9) hue-rotate(180deg)',
                        }}
                      />
                    </div>

                    {/* Actions - Full width buttons on mobile */}
                    <div className="flex gap-2 w-full sm:w-auto">
                      <a
                        href={track.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 sm:flex-initial px-3 py-2 bg-blue-500/20 hover:bg-blue-500/30 border border-blue-400/30 text-blue-300 rounded-lg text-xs sm:text-sm font-medium transition-colors text-center"
                      >
                        Download
                      </a>
                      <button
                        onClick={() => handleDelete(track.id)}
                        disabled={deletingId === track.id}
                        className="flex-1 sm:flex-initial px-3 py-2 bg-red-500/20 hover:bg-red-500/30 border border-red-400/30 text-red-300 rounded-lg text-xs sm:text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {deletingId === track.id ? 'Deleting...' : 'Delete'}
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
}
