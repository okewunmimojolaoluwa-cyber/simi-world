/**
 * File Upload API - Handles media file uploads to Supabase Storage
 * Requires admin authentication
 * POST /api/admin/upload
 */

import { NextRequest, NextResponse } from 'next/server';
import { getIronSession } from 'iron-session';
import { cookies } from 'next/headers';
import { sessionOptions, type SessionData } from '@/lib/session';
import { supabaseAdmin } from '@/lib/auth';
import {
  validateFile,
  generateStoragePath,
  uploadFile,
  type UploadResult,
} from '@/lib/storage';

// Check admin auth
async function requireAdmin() {
  const cookieStore = await cookies();
  const session = await getIronSession<SessionData>(cookieStore, sessionOptions);
  if (!session.isLoggedIn || session.role !== 'admin') {
    throw new Error('Unauthorized');
  }
  return session;
}

export async function POST(request: NextRequest) {
  try {
    await requireAdmin();

    if (!supabaseAdmin) {
      return NextResponse.json(
        { error: 'Storage not configured' },
        { status: 500 }
      );
    }

    // Parse multipart form data
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const mediaType = formData.get('mediaType') as 'photo' | 'video' | 'music';
    const title = formData.get('title') as string;
    const caption = formData.get('caption') as string | null;
    const artist = formData.get('artist') as string | null;
    const sortOrder = formData.get('sortOrder') as string | null;

    // Validation
    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    if (!mediaType || !['photo', 'video', 'music'].includes(mediaType)) {
      return NextResponse.json(
        { error: 'Invalid media type' },
        { status: 400 }
      );
    }

    if (!title) {
      return NextResponse.json(
        { error: 'Title is required' },
        { status: 400 }
      );
    }

    // Validate file
    const validation = validateFile(file, mediaType);
    if (!validation.valid) {
      return NextResponse.json(
        { error: validation.error },
        { status: 400 }
      );
    }

    // Check if this is an image that will be optimized
    const isImage = file.type.startsWith('image/');
    
    // Generate storage path (with .webp extension for images)
    const storagePath = generateStoragePath(mediaType, file.name, isImage);

    // Upload file with auto-optimization
    const uploadResult: UploadResult = await uploadFile(file, storagePath, true);

    if (!uploadResult.success) {
      return NextResponse.json(
        { error: uploadResult.error || 'Upload failed' },
        { status: 500 }
      );
    }

    // Save metadata to database
    const { data: mediaEntry, error: dbError } = await supabaseAdmin
      .from('media_library')
      .insert({
        media_type: mediaType,
        title,
        caption: caption || null,
        artist: artist || null,
        storage_path: uploadResult.storagePath,
        storage_bucket: 'media',
        content_type: uploadResult.optimized ? 'image/webp' : file.type,
        file_size: uploadResult.finalSize || file.size,
        sort_order: sortOrder ? parseInt(sortOrder, 10) : 0,
      })
      .select()
      .single();

    if (dbError) {
      console.error('[upload] Database error:', dbError);
      return NextResponse.json(
        { error: 'Failed to save media metadata' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      media: {
        ...mediaEntry,
        publicUrl: uploadResult.publicUrl,
      },
      optimized: uploadResult.optimized,
      originalSize: uploadResult.originalSize,
      finalSize: uploadResult.finalSize,
    });
  } catch (error: any) {
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    console.error('[upload] Error:', error);
    return NextResponse.json(
      { error: 'Upload failed' },
      { status: 500 }
    );
  }
}

// Set max file size for Next.js (50MB)
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

// Modern way to configure body size in App Router
// Note: Body size limits are now handled at the platform level
// For Vercel: Configure in vercel.json
// For other platforms: Configure in platform settings

