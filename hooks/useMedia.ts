/**
 * useMedia Hook - Fetch media library from database
 * Used by Sunshine (photos/videos) and Music features
 */

import { useState, useEffect } from 'react';

export interface MediaItem {
  id: string;
  media_type: 'photo' | 'video' | 'music';
  title: string;
  caption?: string | null;
  artist?: string | null;
  storage_path: string;
  storage_bucket: string;
  content_type: string;
  file_size: number;
  sort_order: number;
  publicUrl: string;
  created_at: string;
  updated_at: string;
}

interface UseMediaResult {
  media: MediaItem[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useMedia(mediaType: 'photo' | 'video' | 'music' | 'all' = 'all'): UseMediaResult {
  const [media, setMedia] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMedia = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`/api/media?type=${mediaType}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch media');
      }

      const data = await response.json();
      setMedia(data.media || []);
    } catch (err: any) {
      console.error('[useMedia] Error:', err);
      setError(err.message || 'Failed to load media');
      setMedia([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMedia();
  }, [mediaType]);

  return {
    media,
    loading,
    error,
    refetch: fetchMedia,
  };
}

/**
 * Filter media by type from a mixed array
 */
export function filterMediaByType(
  media: MediaItem[],
  type: 'photo' | 'video' | 'music'
): MediaItem[] {
  return media.filter((item) => item.media_type === type);
}

/**
 * Get photos and videos for Sunshine feature
 */
export function useSunshineMedia(): UseMediaResult {
  const { media, loading, error, refetch } = useMedia('all');
  
  // Filter to only photos and videos
  const sunshineMedia = media.filter(
    (item) => item.media_type === 'photo' || item.media_type === 'video'
  );

  return {
    media: sunshineMedia,
    loading,
    error,
    refetch,
  };
}

/**
 * Get music tracks for Music feature
 */
export function useMusicTracks(): UseMediaResult {
  return useMedia('music');
}

