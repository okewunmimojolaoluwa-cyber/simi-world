/**
 * Supabase Storage utilities for media file management
 * Handles uploads, deletions, and URL generation
 * Now with automatic format conversion and optimization
 */

import { supabaseAdmin } from './auth';

const STORAGE_BUCKET = 'media';
const MAX_FILE_SIZE = 100 * 1024 * 1024; // 100MB (increased for raw uploads)

// Accept ANY image/video/audio format - we'll convert as needed
const IMAGE_MIME_PREFIXES = ['image/'];
const VIDEO_MIME_PREFIXES = ['video/'];
const AUDIO_MIME_PREFIXES = ['audio/'];

// Common file extensions to detect type if MIME is missing
const IMAGE_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.bmp', '.tiff', '.tif', '.svg', '.heic', '.heif', '.avif', '.jfif'];
const VIDEO_EXTENSIONS = ['.mp4', '.webm', '.mov', '.avi', '.mkv', '.flv', '.wmv', '.m4v', '.3gp', '.ogv'];
const AUDIO_EXTENSIONS = ['.mp3', '.wav', '.ogg', '.m4a', '.aac', '.flac', '.wma', '.opus', '.webm'];

export interface UploadResult {
  success: boolean;
  storagePath?: string;
  publicUrl?: string;
  error?: string;
  optimized?: boolean;
  originalSize?: number;
  finalSize?: number;
}

/**
 * Detect media type from file
 */
function detectMediaType(file: File): 'photo' | 'video' | 'music' | null {
  const fileName = file.name.toLowerCase();
  const mimeType = file.type.toLowerCase();

  // Check by MIME type first
  if (IMAGE_MIME_PREFIXES.some(prefix => mimeType.startsWith(prefix))) {
    return 'photo';
  }
  if (VIDEO_MIME_PREFIXES.some(prefix => mimeType.startsWith(prefix))) {
    return 'video';
  }
  if (AUDIO_MIME_PREFIXES.some(prefix => mimeType.startsWith(prefix))) {
    return 'music';
  }

  // Fallback to extension detection
  if (IMAGE_EXTENSIONS.some(ext => fileName.endsWith(ext))) {
    return 'photo';
  }
  if (VIDEO_EXTENSIONS.some(ext => fileName.endsWith(ext))) {
    return 'video';
  }
  if (AUDIO_EXTENSIONS.some(ext => fileName.endsWith(ext))) {
    return 'music';
  }

  return null;
}

/**
 * Optimize and resize image in browser
 * Converts any format to WebP and resizes to max 1920x1080
 */
async function optimizeImage(file: File): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const reader = new FileReader();

    reader.onload = (e) => {
      img.src = e.target?.result as string;
    };

    img.onload = () => {
      // Calculate new dimensions (max 1920x1080, maintain aspect ratio)
      let width = img.width;
      let height = img.height;
      const MAX_WIDTH = 1920;
      const MAX_HEIGHT = 1080;

      if (width > MAX_WIDTH || height > MAX_HEIGHT) {
        const ratio = Math.min(MAX_WIDTH / width, MAX_HEIGHT / height);
        width = Math.round(width * ratio);
        height = Math.round(height * ratio);
      }

      // Create canvas and draw resized image
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      
      if (!ctx) {
        reject(new Error('Failed to get canvas context'));
        return;
      }

      // Enable image smoothing for better quality
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      
      ctx.drawImage(img, 0, 0, width, height);

      // Convert to WebP with good quality (0.85 = 85% quality)
      canvas.toBlob(
        (blob) => {
          if (blob) {
            resolve(blob);
          } else {
            reject(new Error('Failed to convert image'));
          }
        },
        'image/webp',
        0.85
      );
    };

    img.onerror = () => {
      reject(new Error('Failed to load image'));
    };

    reader.onerror = () => {
      reject(new Error('Failed to read file'));
    };

    reader.readAsDataURL(file);
  });
}

/**
 * Validate file before upload - NOW ACCEPTS ANY FORMAT
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

  // Auto-detect type if not specified
  const detectedType = detectMediaType(file);
  
  if (!detectedType) {
    return {
      valid: false,
      error: 'Unable to detect file type. Please ensure it\'s an image, video, or audio file.',
    };
  }

  // Verify detected type matches requested type
  if (detectedType !== mediaType) {
    return {
      valid: false,
      error: `File appears to be a ${detectedType}, but ${mediaType} was expected`,
    };
  }

  // All checks passed!
  return { valid: true };
}

/**
 * Generate unique storage path with proper extension
 */
export function generateStoragePath(
  mediaType: 'photo' | 'video' | 'music',
  filename: string,
  optimized: boolean = false
): string {
  const timestamp = Date.now();
  const randomStr = Math.random().toString(36).substring(2, 8);
  const sanitizedFilename = filename.replace(/[^a-zA-Z0-9.-]/g, '_');
  
  // If optimized, change extension to webp for images
  let finalFilename = sanitizedFilename;
  if (optimized && mediaType === 'photo') {
    const nameWithoutExt = sanitizedFilename.replace(/\.[^/.]+$/, '');
    finalFilename = `${nameWithoutExt}.webp`;
  }
  
  return `${mediaType}s/${timestamp}_${randomStr}_${finalFilename}`;
}

/**
 * Upload file to Supabase Storage with automatic optimization
 */
export async function uploadFile(
  file: File,
  storagePath: string,
  autoOptimize: boolean = true
): Promise<UploadResult> {
  if (!supabaseAdmin) {
    return {
      success: false,
      error: 'Storage not configured',
    };
  }

  try {
    const originalSize = file.size;
    let fileToUpload: File | Blob = file;
    let contentType = file.type;
    let optimized = false;

    // Auto-optimize images (convert to WebP and resize)
    if (autoOptimize && file.type.startsWith('image/')) {
      try {
        const optimizedBlob = await optimizeImage(file);
        fileToUpload = optimizedBlob;
        contentType = 'image/webp';
        optimized = true;
        console.log(`[storage] Optimized image: ${originalSize} → ${optimizedBlob.size} bytes (${Math.round((1 - optimizedBlob.size / originalSize) * 100)}% reduction)`);
      } catch (optimizeError) {
        console.warn('[storage] Image optimization failed, uploading original:', optimizeError);
        // Continue with original file if optimization fails
      }
    }

    // Convert to ArrayBuffer
    const arrayBuffer = await fileToUpload.arrayBuffer();
    const buffer = new Uint8Array(arrayBuffer);

    const { data, error } = await supabaseAdmin.storage
      .from(STORAGE_BUCKET)
      .upload(storagePath, buffer, {
        contentType: contentType || 'application/octet-stream',
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
      optimized,
      originalSize,
      finalSize: fileToUpload.size,
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

