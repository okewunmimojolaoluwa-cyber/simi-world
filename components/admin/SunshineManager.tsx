/**
 * Sunshine Manager - Upload and manage photos/videos
 */

'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import MediaUploader from './MediaUploader';
import { WORLD } from '@/data/world';

interface MediaItem {
  id: string;
  type: 'photo' | 'video';
  url: string;
  caption: string | null;
  order_index: number;
  created_at: string;
  source?: 'database' | 'hardcoded'; // Track source
}

export default function SunshineManager() {
  const [photos, setPhotos] = useState<MediaItem[]>([]);
  const [videos, setVideos] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeType, setActiveType] = useState<'photo' | 'video'>('photo');
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    loadMedia();
  }, []);

  const loadMedia = async () => {
    try {
      setLoading(true);
      setError('');
      
      // Fetch database media
      const [photosRes, videosRes] = await Promise.all([
        fetch('/api/media?type=photo'),
        fetch('/api/media?type=video'),
      ]);
      
      if (!photosRes.ok || !videosRes.ok) {
        throw new Error('Failed to load media');
      }
      
      const photosData = await photosRes.json();
      const videosData = await videosRes.json();
      
      // Get hardcoded photos from WORLD data
      const hardcodedPhotos: MediaItem[] = [];
      if (WORLD.memoryMuseum?.exhibitions) {
        WORLD.memoryMuseum.exhibitions.forEach((exhibition, exhibitionIndex) => {
          exhibition.photos.forEach((photo, photoIndex) => {
            hardcodedPhotos.push({
              id: `hardcoded-photo-${exhibition.id}-${photo.id}`,
              type: 'photo',
              url: photo.url,
              caption: `${exhibition.title} - ${photo.caption}`,
              order_index: exhibitionIndex * 100 + photoIndex,
              created_at: new Date(2024, 0, 1).toISOString(),
              source: 'hardcoded',
            });
          });
        });
      }
      
      // Get hardcoded videos from WORLD data
      const hardcodedVideos: MediaItem[] = [];
      if ((WORLD as any).videoMemories) {
        (WORLD as any).videoMemories.forEach((video: any, index: number) => {
          hardcodedVideos.push({
            id: `hardcoded-video-${video.id}`,
            type: 'video',
            url: video.url,
            caption: video.caption,
            order_index: index,
            created_at: new Date(2024, 0, 1).toISOString(),
            source: 'hardcoded',
          });
        });
      }
      
      // Combine database and hardcoded media
      const allPhotos = [
        ...hardcodedPhotos,
        ...(photosData.media || []).map((m: any) => ({ ...m, type: 'photo', source: 'database' }))
      ];
      
      const allVideos = [
        ...hardcodedVideos,
        ...(videosData.media || []).map((m: any) => ({ ...m, type: 'video', source: 'database' }))
      ];
      
      setPhotos(allPhotos);
      setVideos(allVideos);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load media');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string, source?: string) => {
    if (!confirm('Are you sure you want to delete this item?')) {
      return;
    }

    try {
      setDeletingId(id);
      
      // Only call API for database items
      if (source !== 'hardcoded') {
        const response = await fetch(`/api/admin/media?id=${id}`, {
          method: 'DELETE',
        });
        
        if (!response.ok) {
          throw new Error('Failed to delete media');
        }
      }
      
      // Remove from state (works for both hardcoded and database)
      setPhotos(prev => prev.filter(p => p.id !== id));
      setVideos(prev => prev.filter(v => v.id !== id));
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to delete');
    } finally {
      setDeletingId(null);
    }
  };

  const handleUploadComplete = () => {
    loadMedia();
  };

  // Modal state for viewing media
  const [viewingMedia, setViewingMedia] = useState<MediaItem | null>(null);

  const activeItems = activeType === 'photo' ? photos : videos;

  return (
    <div className="space-y-6">
      {/* Upload Section */}
      <div className="bg-gradient-to-br from-yellow-500/5 to-pink-500/5 border border-yellow-400/20 rounded-xl p-4 sm:p-6">
        <h2 className="text-xl font-bold text-yellow-400 mb-4 flex items-center gap-2">
          <span>📤</span>
          <span>Upload Photos & Videos</span>
        </h2>
        <MediaUploader 
          onUploadComplete={handleUploadComplete}
          allowedTypes={['photo', 'video']}
          defaultType="photo"
        />
      </div>

      {/* Type Toggle */}
      <div className="flex gap-2">
        <button
          onClick={() => setActiveType('photo')}
          className={`
            flex-1 px-4 py-3 rounded-lg font-medium transition-all
            ${activeType === 'photo'
              ? 'bg-yellow-500/20 border-2 border-yellow-400/50 text-yellow-300'
              : 'bg-gray-800/30 border border-gray-700/30 text-gray-400 hover:text-gray-300'
            }
          `}
        >
          📷 Photos ({photos.length})
        </button>
        <button
          onClick={() => setActiveType('video')}
          className={`
            flex-1 px-4 py-3 rounded-lg font-medium transition-all
            ${activeType === 'video'
              ? 'bg-pink-500/20 border-2 border-pink-400/50 text-pink-300'
              : 'bg-gray-800/30 border border-gray-700/30 text-gray-400 hover:text-gray-300'
            }
          `}
        >
          🎥 Videos ({videos.length})
        </button>
      </div>

      {/* Media Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="flex flex-col items-center gap-4">
            <div className="w-12 h-12 border-4 border-yellow-400/30 border-t-yellow-400 rounded-full animate-spin" />
            <p className="text-gray-400">Loading media...</p>
          </div>
        </div>
      ) : error ? (
        <div className="bg-red-500/10 border border-red-400/30 rounded-xl p-6 text-center">
          <p className="text-red-300 mb-4">{error}</p>
          <button
            onClick={loadMedia}
            className="px-4 py-2 bg-red-500/20 hover:bg-red-500/30 border border-red-400/30 text-red-300 rounded-lg transition-colors"
          >
            Retry
          </button>
        </div>
      ) : activeItems.length === 0 ? (
        <div className="bg-gray-800/20 border border-gray-700/30 rounded-xl p-12 text-center">
          <div className="text-4xl mb-4">{activeType === 'photo' ? '📷' : '🎥'}</div>
          <p className="text-gray-400">
            No {activeType === 'photo' ? 'photos' : 'videos'} yet. Upload some above!
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <AnimatePresence>
            {activeItems.map((item, index) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ delay: index * 0.05 }}
                className="group relative bg-gray-800/30 border border-gray-700/30 rounded-xl overflow-hidden hover:border-yellow-400/30 transition-all"
              >
                {/* Media Preview */}
                <div 
                  className="aspect-video bg-gray-900/50 relative overflow-hidden cursor-pointer"
                  onClick={() => setViewingMedia(item)}
                >
                  {item.type === 'photo' ? (
                    <img
                      src={item.url}
                      alt={item.caption || 'Photo'}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="relative w-full h-full bg-black">
                      <video
                        src={item.url}
                        className="w-full h-full object-cover"
                        preload="metadata"
                        playsInline
                        muted
                        onError={(e) => {
                          console.error('Video thumbnail error:', item.url, e);
                        }}
                        onLoadedMetadata={(e) => {
                          console.log('Video metadata loaded:', item.url);
                        }}
                      />
                      {/* Play button overlay */}
                      <div className="absolute inset-0 flex items-center justify-center bg-black/40 pointer-events-none">
                        <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center border-2 border-white/50">
                          <svg className="w-8 h-8 text-white ml-1" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M8 5v14l11-7z" />
                          </svg>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {/* Overlay Actions */}
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setViewingMedia(item);
                      }}
                      className="px-3 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-sm font-medium transition-colors"
                    >
                      {item.type === 'video' ? 'Play' : 'View'}
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(item.id, item.source);
                      }}
                      disabled={deletingId === item.id}
                      className="px-3 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {deletingId === item.id ? 'Deleting...' : 'Delete'}
                    </button>
                  </div>
                </div>

                {/* Caption */}
                {item.caption && (
                  <div className="p-3">
                    <p className="text-gray-300 text-sm line-clamp-2">
                      {item.caption}
                    </p>
                  </div>
                )}

                {/* Metadata */}
                <div className="px-3 pb-3 text-xs text-gray-500">
                  {new Date(item.created_at).toLocaleDateString()}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
      
      {/* Media Viewer Modal */}
      <AnimatePresence>
        {viewingMedia && (
          <motion.div
            key={viewingMedia.id}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setViewingMedia(null)}
            className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="relative max-w-6xl w-full max-h-[90vh] bg-gray-900 rounded-xl overflow-hidden"
            >
              {/* Close Button */}
              <button
                onClick={() => setViewingMedia(null)}
                className="absolute top-4 right-4 z-10 w-10 h-10 bg-black/50 hover:bg-black/70 text-white rounded-full flex items-center justify-center transition-colors"
              >
                ✕
              </button>

              {/* Media Content */}
              <div className="w-full h-full flex items-center justify-center p-4">
                {viewingMedia.type === 'photo' ? (
                  <img
                    src={viewingMedia.url}
                    alt={viewingMedia.caption || 'Photo'}
                    className="max-w-full max-h-[90vh] object-contain"
                  />
                ) : (
                  <video
                    src={viewingMedia.url}
                    controls
                    autoPlay
                    playsInline
                    className="max-w-full max-h-[80vh] w-auto rounded-lg"
                    style={{ backgroundColor: '#000' }}
                  >
                    Your browser does not support the video tag.
                  </video>
                )}
              </div>

              {/* Caption */}
              {viewingMedia.caption && (
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-6">
                  <p className="text-white text-center">{viewingMedia.caption}</p>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
