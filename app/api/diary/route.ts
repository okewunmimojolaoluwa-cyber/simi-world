/**
 * Diary API - For Simi to read/write/delete her diary entries
 * POST - Create new entry
 * GET - Get her entries (excludes deleted)
 * DELETE - Soft delete entry (admin can still see it)
 */

import { NextRequest, NextResponse } from 'next/server';
import { getIronSession } from 'iron-session';
import { cookies } from 'next/headers';
import { sessionOptions, type SessionData } from '@/lib/session';
import { supabaseAdmin } from '@/lib/auth';

export const dynamic = 'force-dynamic';

// Check Simi authentication
async function requireSimi() {
  const cookieStore = await cookies();
  const session = await getIronSession<SessionData>(cookieStore, sessionOptions);
  if (!session.isLoggedIn || session.role !== 'simi') {
    throw new Error('Unauthorized');
  }
  return session;
}

// GET - Fetch Simi's diary entries (excludes deleted)
export async function GET(request: NextRequest) {
  try {
    await requireSimi();

    if (!supabaseAdmin) {
      return NextResponse.json(
        { error: 'Database not configured' },
        { status: 500 }
      );
    }

    const { data, error } = await supabaseAdmin
      .from('diary_entries')
      .select('*')
      .is('deleted_at', null) // Only non-deleted entries for Simi
      .order('created_at', { ascending: false });

    if (error) {
      console.error('[diary] Fetch error:', error);
      return NextResponse.json(
        { error: 'Failed to fetch entries' },
        { status: 500 }
      );
    }

    return NextResponse.json({ entries: data || [] });
  } catch (error: any) {
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    console.error('[diary] GET error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST - Create new diary entry
export async function POST(request: NextRequest) {
  try {
    await requireSimi();

    if (!supabaseAdmin) {
      return NextResponse.json(
        { error: 'Database not configured' },
        { status: 500 }
      );
    }

    const { title, content, mood } = await request.json();

    if (!title || !content) {
      return NextResponse.json(
        { error: 'Title and content required' },
        { status: 400 }
      );
    }

    const { data, error } = await supabaseAdmin
      .from('diary_entries')
      .insert({
        title: title.trim(),
        content: content.trim(),
        mood: mood || '😊',
      })
      .select()
      .single();

    if (error) {
      console.error('[diary] Insert error:', error);
      return NextResponse.json(
        { error: 'Failed to save entry' },
        { status: 500 }
      );
    }

    return NextResponse.json({ entry: data });
  } catch (error: any) {
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    console.error('[diary] POST error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE - Soft delete diary entry (admin can still see it)
export async function DELETE(request: NextRequest) {
  try {
    await requireSimi();

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
        { error: 'Entry ID required' },
        { status: 400 }
      );
    }

    // Soft delete: set deleted_at timestamp instead of actually deleting
    const { error } = await supabaseAdmin
      .from('diary_entries')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', id);

    if (error) {
      console.error('[diary] Delete error:', error);
      return NextResponse.json(
        { error: 'Failed to delete entry' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    console.error('[diary] DELETE error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
