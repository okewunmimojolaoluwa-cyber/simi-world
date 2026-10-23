/**
 * Admin Diary API - Secret access to ALL of Simi's diary entries
 * Admin sees everything including deleted entries
 * GET - Fetch ALL entries (including soft-deleted)
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
