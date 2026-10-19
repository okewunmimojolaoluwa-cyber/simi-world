/**
 * Login History API - Retrieve login events for admin dashboard
 * Requires admin authentication
 * GET /api/admin/login-history
 */

import { NextRequest, NextResponse } from 'next/server';
import { getIronSession } from 'iron-session';
import { cookies } from 'next/headers';
import { sessionOptions, type SessionData } from '@/lib/session';
import { supabaseAdmin } from '@/lib/auth';

// Force dynamic rendering for routes using cookies
export const dynamic = 'force-dynamic';

// Check admin auth
async function requireAdmin() {
  const cookieStore = await cookies();
  const session = await getIronSession<SessionData>(cookieStore, sessionOptions);
  if (!session.isLoggedIn || session.role !== 'admin') {
    throw new Error('Unauthorized');
  }
  return session;
}

/**
 * Convert UTC timestamp to Lagos timezone (Africa/Lagos = UTC+1)
 */
function formatLagosTime(utcTimestamp: string): {
  date: string;
  time: string;
  datetime: string;
} {
  try {
    const date = new Date(utcTimestamp);
    
    // Format for Lagos timezone (Africa/Lagos)
    const lagosFormatter = new Intl.DateTimeFormat('en-GB', {
      timeZone: 'Africa/Lagos',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
    });

    const parts = lagosFormatter.formatToParts(date);
    const year = parts.find((p) => p.type === 'year')?.value || '';
    const month = parts.find((p) => p.type === 'month')?.value || '';
    const day = parts.find((p) => p.type === 'day')?.value || '';
    const hour = parts.find((p) => p.type === 'hour')?.value || '';
    const minute = parts.find((p) => p.type === 'minute')?.value || '';
    const second = parts.find((p) => p.type === 'second')?.value || '';

    return {
      date: `${day}/${month}/${year}`,
      time: `${hour}:${minute}:${second}`,
      datetime: `${day}/${month}/${year} ${hour}:${minute}:${second}`,
    };
  } catch (error) {
    console.error('[login-history] Time format error:', error);
    return {
      date: 'Invalid Date',
      time: 'Invalid Time',
      datetime: 'Invalid DateTime',
    };
  }
}

export async function GET(request: NextRequest) {
  try {
    await requireAdmin();

    if (!supabaseAdmin) {
      return NextResponse.json(
        { error: 'Database not configured' },
        { status: 500 }
      );
    }

    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '50', 10);
    const offset = parseInt(searchParams.get('offset') || '0', 10);
    const userType = searchParams.get('userType'); // Filter by simi/admin

    let query = supabaseAdmin
      .from('login_events')
      .select('*', { count: 'exact' })
      .order('login_timestamp', { ascending: false })
      .range(offset, offset + limit - 1);

    // Filter by user type if specified
    if (userType === 'simi' || userType === 'admin') {
      query = query.eq('user_type', userType);
    }

    // Only show successful logins by default (can be changed)
    const statusFilter = searchParams.get('status');
    if (statusFilter) {
      query = query.eq('status', statusFilter);
    } else {
      query = query.eq('status', 'success');
    }

    const { data, error, count } = await query;

    if (error) {
      console.error('[login-history] Fetch error:', error);
      return NextResponse.json(
        { error: 'Failed to fetch login history' },
        { status: 500 }
      );
    }

    // Format timestamps for Lagos timezone
    const formattedData = (data || []).map((event) => ({
      ...event,
      lagos_date: formatLagosTime(event.login_timestamp).date,
      lagos_time: formatLagosTime(event.login_timestamp).time,
      lagos_datetime: formatLagosTime(event.login_timestamp).datetime,
    }));

    return NextResponse.json({
      events: formattedData,
      total: count || 0,
      limit,
      offset,
    });
  } catch (error: any) {
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    console.error('[login-history] Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

