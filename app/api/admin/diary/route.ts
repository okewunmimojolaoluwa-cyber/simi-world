/**
 * Admin Diary API - Secret access to ALL of Simi's diary entries
 * Admin sees everything including deleted entries
 * GET - Fetch ALL entries (including soft-deleted)
 * PUT - Restore deleted entry (set deleted_at = null)
 * DELETE - Permanently delete entry
 */

import { NextRequest, NextResponse } from 'next/server';
import { getIronSession } from 'iron-session';
import { cookies } from 'next/headers';
import { sessionOptions, type SessionData } from '@/lib/session';
import { supabaseAdmin } from '@/lib/auth';

export const dynamic = 'force-dynamic';

// Check admin authentication
async function requireAdmin() {
  const cookieStore = await cookies();
  const session = await getIronSession<SessionData>(cookieStore, sessionOptions);
  if (!session.isLoggedIn || session.role !== 'admin') {
    throw new Error('Unauthorized');
  }
  return session;
}

// GET - Fetch ALL diary entries (including deleted ones)
export async function GET(request: NextRequest) {
  try {
    await requireAdmin();

    if (!supabaseAdmin) {
      return NextResponse.json(
        { error: 'Database not configured' },
        { status: 500 }
      );
    }

    // Admin sees EVERYTHING - no filter on deleted_at
    const { data, error } = await supabaseAdmin
      .from('diary_entries')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('[admin/diary] Fetch error:', error);
      return NextResponse.json(
        { error: 'Failed to fetch entries' },
        { status: 500 }
      );
    }

    return NextResponse.json({ 
      entries: data || [],
      total: data?.length || 0,
      active: data?.filter(e => !e.deleted_at).length || 0,
      deleted: data?.filter(e => e.deleted_at).length || 0,
    });
  } catch (error: any) {
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    console.error('[admin/diary] GET error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PUT - Restore deleted entry (set deleted_at = null)
export async function PUT(request: NextRequest) {
  try {
    await requireAdmin();

    if (!supabaseAdmin) {
      return NextResponse.json(
        { error: 'Database not configured' },
        { status: 500 }
      );
    }

    const { id } = await request.json();

    if (!id) {
      return NextResponse.json(
        { error: 'Entry ID required' },
        { status: 400 }
      );
    }

    // Restore entry by setting deleted_at to null
    const { data, error } = await supabaseAdmin
      .from('diary_entries')
      .update({ deleted_at: null })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('[admin/diary] Restore error:', error);
      return NextResponse.json(
        { error: 'Failed to restore entry' },
        { status: 500 }
      );
    }

    return NextResponse.json({ 
      message: 'Entry restored successfully',
      entry: data 
    });
  } catch (error: any) {
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    console.error('[admin/diary] PUT error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE - Permanently delete entry
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
        { error: 'Entry ID required' },
        { status: 400 }
      );
    }

    // Permanently delete entry
    const { error } = await supabaseAdmin
      .from('diary_entries')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('[admin/diary] Delete error:', error);
      return NextResponse.json(
        { error: 'Failed to delete entry' },
        { status: 500 }
      );
    }

    return NextResponse.json({ 
      message: 'Entry permanently deleted' 
    });
  } catch (error: any) {
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    console.error('[admin/diary] DELETE error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
