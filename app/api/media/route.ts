/**
 * Public Media API - Retrieve media library for Sunshine and Music features
 * No authentication required (read-only)
 * GET /api/media?type=photo|video|music
 */

import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/auth';
import { getPublicUrl } from '@/lib/storage';

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

    if (error) {
      console.error('[media-api] Fetch error:', error);
      return NextResponse.json(
        { error: 'Failed to fetch media' },
        { status: 500 }
      );
    }

    // Add public URLs to each media item
    const mediaWithUrls = (data || []).map((item) => ({
      ...item,
      publicUrl: getPublicUrl(item.storage_path),
    }));

    return NextResponse.json({
      media: mediaWithUrls,
      count: mediaWithUrls.length,
    });
  } catch (error) {
    console.error('[media-api] Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Enable edge runtime for faster response
export const runtime = 'edge';

