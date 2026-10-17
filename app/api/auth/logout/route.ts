/**
 * Logout API - Destroys the current session
 * POST /api/auth/logout
 */

import { NextResponse } from 'next/server';
import { getIronSession } from 'iron-session';
import { cookies } from 'next/headers';
import { sessionOptions } from '@/lib/session';

export async function POST() {
  try {
    const session = await getIronSession(cookies(), sessionOptions);
    session.destroy();

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[logout] Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

