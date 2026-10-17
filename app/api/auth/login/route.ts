/**
 * Login API - Handles authentication for both Simi and Admin
 * POST /api/auth/login
 */

import { NextRequest, NextResponse } from 'next/server';
import { getIronSession } from 'iron-session';
import { cookies } from 'next/headers';
import {
  validatePassword,
  logLoginEvent,
  checkRateLimit,
  recordFailedAttempt,
  clearFailedAttempts,
  getClientIp,
  type UserType,
} from '@/lib/auth';
import { sessionOptions, type SessionData } from '@/lib/session';

// Force dynamic rendering for routes using cookies
export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const { password, userType } = await request.json();

    if (!password || !userType) {
      return NextResponse.json(
        { error: 'Missing password or userType' },
        { status: 400 }
      );
    }

    if (userType !== 'simi' && userType !== 'admin') {
      return NextResponse.json(
        { error: 'Invalid user type' },
        { status: 400 }
      );
    }

    const ipAddress = getClientIp(request.headers);

    // Check rate limiting
    const isRateLimited = await checkRateLimit(ipAddress, userType);
    if (isRateLimited) {
      await logLoginEvent(userType, 'rate_limited', undefined, request.headers.get('user-agent') || undefined, ipAddress);
      return NextResponse.json(
        { error: 'Too many failed attempts. Please try again in 15 minutes.' },
        { status: 429 }
      );
    }

    // Validate password
    const isValid = validatePassword(password, userType);

    if (!isValid) {
      await recordFailedAttempt(ipAddress, userType);
      await logLoginEvent(userType, 'failed', undefined, request.headers.get('user-agent') || undefined, ipAddress);
      
      return NextResponse.json(
        { error: 'Invalid password' },
        { status: 401 }
      );
    }

    // Clear any failed attempts
    await clearFailedAttempts(ipAddress, userType);

    // Create session
    const session = await getIronSession<SessionData>(cookies(), sessionOptions);
    session.isLoggedIn = true;
    session.role = userType;
    session.loginTime = new Date().toISOString();
    await session.save();

    // Log successful login
    await logLoginEvent(
      userType,
      'success',
      session.loginTime,
      request.headers.get('user-agent') || undefined,
      ipAddress
    );

    return NextResponse.json({
      success: true,
      userType,
    });
  } catch (error) {
    console.error('[login] Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

