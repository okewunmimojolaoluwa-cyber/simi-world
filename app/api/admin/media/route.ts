/**
 * Media Library API - CRUD operations for photos, videos, and music
 * Requires admin authentication
 */

import { NextRequest, NextResponse } from 'next/server';
import { getIronSession } from 'iron-session';
import { cookies } from 'next/headers';
import { sessionOptions, type SessionData } from '@/lib/session';
import { supabaseAdmin } from '@/lib/auth';

// Check admin auth
async function requireAdmin() {
  const session = await getIronSession<SessionData>(cookies(), sessionOptions);
  if (!session.isLoggedIn || session.role !== 'admin') {
    throw new Error('Unauthorized');
  }
  return session;
}

// GET - Retrieve media library
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const mediaType = searchParams.get('type'); // photo, video, music, or all

    if (!supabaseAdmin) {
      return NextResponse.json(
        { error: 'Database not configured' },
        { status: 500 }
      );
    }

    let query = supabaseAdmin
      .from('media_library')
      .select('*')
      .order('sort_order', { ascending: true })
      .order('created_at', { ascending: false });

    if (mediaType && mediaType !== 'all') {
      query = query.eq('media_type', mediaType);
    }

    const { data, error } = await query;

    if (error) throw error;

    return NextResponse.json({ media: data || [] });
  } catch (error: any) {
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    console.error('[media-get] Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch media' },
      { status: 500 }
    );
  }
}

// POST - Create new media entry
export async function POST(request: NextRequest) {
  try {
    await requireAdmin();

    if (!supabaseAdmin) {
      return NextResponse.json(
        { error: 'Database not configured' },
        { status: 500 }
      );
    }

    const body = await request.json();
    const {
      mediaType,
      title,
      caption,
      artist,
      storagePath,
      storageBucket,
      contentType,
      fileSize,
      sortOrder,
    } = body;

    // Validation
    if (!mediaType || !title || !storagePath || !contentType || !fileSize) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const { data, error } = await supabaseAdmin
      .from('media_library')
      .insert({
        media_type: mediaType,
        title,
        caption: caption || null,
        artist: artist || null,
        storage_path: storagePath,
        storage_bucket: storageBucket || 'media',
        content_type: contentType,
        file_size: fileSize,
        sort_order: sortOrder || 0,
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ media: data }, { status: 201 });
  } catch (error: any) {
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    console.error('[media-post] Error:', error);
    return NextResponse.json(
      { error: 'Failed to create media entry' },
      { status: 500 }
    );
  }
}

// PATCH - Update media entry
export async function PATCH(request: NextRequest) {
  try {
    await requireAdmin();

    if (!supabaseAdmin) {
      return NextResponse.json(
        { error: 'Database not configured' },
        { status: 500 }
      );
    }

    const body = await request.json();
    const { id, title, caption, artist, sortOrder } = body;

    if (!id) {
      return NextResponse.json(
        { error: 'Missing media ID' },
        { status: 400 }
      );
    }

    const updates: any = {};
    if (title !== undefined) updates.title = title;
    if (caption !== undefined) updates.caption = caption;
    if (artist !== undefined) updates.artist = artist;
    if (sortOrder !== undefined) updates.sort_order = sortOrder;

    const { data, error } = await supabaseAdmin
      .from('media_library')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ media: data });
  } catch (error: any) {
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    console.error('[media-patch] Error:', error);
    return NextResponse.json(
      { error: 'Failed to update media' },
      { status: 500 }
    );
  }
}

// DELETE - Remove media entry and file
export async function DELETE(request: NextRequest) {
  try {
    await requireAdmin();

    if (!supabaseAdmin) {
      return NextResponse.json(
        { error: 'Database not configured' },
        { status: 500 }
      );
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'Missing media ID' },
        { status: 400 }
      );
    }

    // Get media details first
    const { data: media, error: fetchError } = await supabaseAdmin
      .from('media_library')
      .select('*')
      .eq('id', id)
      .single();

    if (fetchError) throw fetchError;

    // Delete from storage
    const { error: storageError } = await supabaseAdmin.storage
      .from(media.storage_bucket)
      .remove([media.storage_path]);

    if (storageError) {
      console.warn('[media-delete] Storage deletion failed:', storageError);
    }

    // Delete from database
    const { error: dbError } = await supabaseAdmin
      .from('media_library')
      .delete()
      .eq('id', id);

    if (dbError) throw dbError;

    return NextResponse.json({ success: true });
  } catch (error: any) {
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    console.error('[media-delete] Error:', error);
    return NextResponse.json(
      { error: 'Failed to delete media' },
      { status: 500 }
    );
  }
}

