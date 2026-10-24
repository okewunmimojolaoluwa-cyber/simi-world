/**
 * Password Changes API - Admin endpoint to view password change history
 * GET /api/admin/password-changes - Get all password changes
 * PUT /api/admin/password-changes - Mark as viewed
 */

import { NextRequest, NextResponse } from 'next/server';
import { getIronSession } from 'iron-session';
import { cookies } from 'next/headers';
import { supabaseAdmin } from '@/lib/auth';
import { sessionOptions, type SessionData } from '@/lib/session';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    // Check admin authentication
    const cookieStore = await cookies();
    const session = await getIronSession<SessionData>(cookieStore, sessionOptions);

    if (!session.isLoggedIn || session.role !== 'admin') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    if (!supabaseAdmin) {
      return NextResponse.json(
        { error: 'Database not configured. Check SUPABASE_SERVICE_ROLE_KEY in .env' },
        { status: 500 }
      );
    }

    // Fetch all password changes, most recent first
    const { data, error } = await supabaseAdmin
      .from('password_changes')
      .select('*')
      .order('change_timestamp', { ascending: false });

    if (error) {
      console.error('[password-changes] Fetch error:', error);
      
      // Provide helpful error messages
      if (error.code === '42P01') {
        return NextResponse.json(
          { error: 'Table "password_changes" does not exist. Run the setup SQL in Supabase.' },
          { status: 500 }
        );
      }
      
      return NextResponse.json(
        { error: `Database error: ${error.message}` },
        { status: 500 }
      );
    }

    return NextResponse.json({
      changes: data || [],
      unviewedCount: (data || []).filter(c => !c.admin_viewed).length,
    });
  } catch (error) {
    console.error('[password-changes] Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    // Check admin authentication
    const cookieStore = await cookies();
    const session = await getIronSession<SessionData>(cookieStore, sessionOptions);

    if (!session.isLoggedIn || session.role !== 'admin') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    if (!supabaseAdmin) {
      return NextResponse.json(
        { error: 'Database not configured' },
        { status: 500 }
      );
    }

    const { id } = await request.json();

    if (!id) {
      return NextResponse.json(
        { error: 'Password change ID required' },
        { status: 400 }
      );
    }

    // Mark as viewed
    const { error } = await supabaseAdmin
      .from('password_changes')
      .update({
        admin_viewed: true,
        admin_viewed_at: new Date().toISOString(),
      })
      .eq('id', id);

    if (error) {
      console.error('[password-changes] Update error:', error);
      return NextResponse.json(
        { error: 'Failed to mark as viewed' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[password-changes] Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
