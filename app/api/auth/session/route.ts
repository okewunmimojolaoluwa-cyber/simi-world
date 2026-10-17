/**
 * Session Check API - Returns current authentication status
 * GET /api/auth/session
 */

import { NextResponse } from 'next/server';
import { getIronSession } from 'iron-session';
import { cookies } from 'next/headers';
import { sessionOptions } from '@/lib/session';

export async function GET() {
  try {
    const session = await getIronSession(cookies(), sessionOptions);

    if (!session.authenticated || !session.userType) {
      return NextResponse.json({
        authenticated: false,
        userType: null,
      });
    }

    return NextResponse.json({
      authenticated: true,
      userType: session.userType,
      loginTime: session.loginTime,
    });
  } catch (error) {
    console.error('[session] Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

