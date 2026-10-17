/**
 * Supabase Storage utilities for media file management
 * Handles uploads, deletions, and URL generation
 */

import { supabaseAdmin } from './auth';

const STORAGE_BUCKET = 'media';
const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB

// Allowed MIME types
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
const ALLOWED_VIDEO_TYPES = ['video/mp4', 'video/webm', 'video/quicktime'];
const ALLOWED_AUDIO_TYPES = ['audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/ogg', 'audio/mp4'];

export interface UploadResult {
  success: boolean;
  storagePath?: string;
  publicUrl?: string;
  error?: string;
}

/**
 * Validate file before upload
 */
export function validateFile(
  file: File,
  mediaType: 'photo' | 'video' | 'music'
): { valid: boolean; error?: string } {
  // Check file size
  if (file.size > MAX_FILE_SIZE) {
    return {
      valid: false,
      error: `File size exceeds ${MAX_FILE_SIZE / 1024 / 1024}MB limit`,
    };
  }

  // Check MIME type
  let allowedTypes: string[];
  switch (mediaType) {
    case 'photo':
      allowedTypes = ALLOWED_IMAGE_TYPES;
      break;
    case 'video':
      allowedTypes = ALLOWED_VIDEO_TYPES;
      break;
    case 'music':
      allowedTypes = ALLOWED_AUDIO_TYPES;
      break;
    default:
      return { valid: false, error: 'Invalid media type' };
  }

  if (!allowedTypes.includes(file.type)) {
    return {
      valid: false,
      error: `Invalid file type. Allowed: ${allowedTypes.join(', ')}`,
    };
  }

  return { valid: true };
}

/**
 * Generate unique storage path
 */
export function generateStoragePath(
  mediaType: 'photo' | 'video' | 'music',
  filename: string
): string {
  const timestamp = Date.now();
  const randomStr = Math.random().toString(36).substring(2, 8);
  const sanitizedFilename = filename.replace(/[^a-zA-Z0-9.-]/g, '_');
  return `${mediaType}s/${timestamp}_${randomStr}_${sanitizedFilename}`;
}

/**
 * Upload file to Supabase Storage
 */
export async function uploadFile(
  file: File,
  storagePath: string
): Promise<UploadResult> {
  if (!supabaseAdmin) {
    return {
      success: false,
      error: 'Storage not configured',
    };
  }

  try {
    // Convert File to ArrayBuffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = new Uint8Array(arrayBuffer);

    const { data, error } = await supabaseAdmin.storage
      .from(STORAGE_BUCKET)
      .upload(storagePath, buffer, {
        contentType: file.type,
        upsert: false,
      });

    if (error) {
      console.error('[storage] Upload error:', error);
      return {
        success: false,
        error: error.message,
      };
    }

    // Get public URL
    const { data: urlData } = supabaseAdmin.storage
      .from(STORAGE_BUCKET)
      .getPublicUrl(storagePath);

    return {
      success: true,
      storagePath: data.path,
      publicUrl: urlData.publicUrl,
    };
  } catch (error: any) {
    console.error('[storage] Upload exception:', error);
    return {
      success: false,
      error: error.message || 'Upload failed',
    };
  }
}

/**
 * Delete file from Supabase Storage
 */
export async function deleteFile(storagePath: string): Promise<boolean> {
  if (!supabaseAdmin) {
    return false;
  }

  try {
    const { error } = await supabaseAdmin.storage
      .from(STORAGE_BUCKET)
      .remove([storagePath]);

    if (error) {
      console.error('[storage] Delete error:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('[storage] Delete exception:', error);
    return false;
  }
}

/**
 * Get public URL for a storage path
 */
export function getPublicUrl(storagePath: string): string | null {
  if (!supabaseAdmin) {
    return null;
  }

  const { data } = supabaseAdmin.storage
    .from(STORAGE_BUCKET)
    .getPublicUrl(storagePath);

  return data.publicUrl;
}

/**
 * List all files in storage bucket (for debugging)
 */
export async function listFiles(folder?: string): Promise<any[]> {
  if (!supabaseAdmin) {
    return [];
  }

  try {
    const { data, error } = await supabaseAdmin.storage
      .from(STORAGE_BUCKET)
      .list(folder);

    if (error) {
      console.error('[storage] List error:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('[storage] List exception:', error);
    return [];
  }
}

