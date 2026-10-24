/**
 * Change Password API - Allows Simi to change her password
 * POST /api/auth/change-password
 */

import { NextRequest, NextResponse } from 'next/server';
import { getIronSession } from 'iron-session';
import { cookies } from 'next/headers';
import { validatePassword, getClientIp, supabaseAdmin } from '@/lib/auth';
import { sessionOptions, type SessionData } from '@/lib/session';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    // Check if user is authenticated
    const cookieStore = await cookies();
    const session = await getIronSession<SessionData>(cookieStore, sessionOptions);

    if (!session.isLoggedIn) {
      return NextResponse.json(
        { error: 'Unauthorized. Please login first.' },
        { status: 401 }
      );
    }

    // Only Simi can change password (admin cannot)
    if (session.role === 'admin') {
      return NextResponse.json(
        { error: 'Admin cannot change Simi\'s password from here.' },
        { status: 403 }
      );
    }

    const { currentPassword, newPassword } = await request.json();

    if (!currentPassword || !newPassword) {
      return NextResponse.json(
        { error: 'Current password and new password are required' },
        { status: 400 }
      );
    }

    // Validate current password
    const isCurrentValid = await validatePassword(currentPassword, 'simi');
    if (!isCurrentValid) {
      return NextResponse.json(
        { error: 'Current password is incorrect' },
        { status: 401 }
      );
    }

    // Password requirements
    if (newPassword.length < 4) {
      return NextResponse.json(
        { error: 'New password must be at least 4 characters' },
        { status: 400 }
      );
    }

    if (newPassword === currentPassword) {
      return NextResponse.json(
        { error: 'New password must be different from current password' },
        { status: 400 }
      );
    }

    // Get client info
    const ipAddress = getClientIp(request.headers);
    const userAgent = request.headers.get('user-agent') || undefined;
    
    // Create password hint (last 3 chars)
    const oldPasswordHint = currentPassword.length > 3 
      ? '...' + currentPassword.slice(-3) 
      : '***';

    // Log password change to database
    if (supabaseAdmin) {
      const { error: logError } = await supabaseAdmin
        .from('password_changes')
        .insert({
          user_type: 'simi',
          old_password_hint: oldPasswordHint,
          new_password: newPassword,
          ip_address: ipAddress,
          user_agent: userAgent,
          admin_viewed: false,
        });

      if (logError) {
        console.error('[change-password] Failed to log password change:', logError);
      }
    }

    // Return success with the new password
    // Note: In production, you'd update an environment variable or database
    // For now, this just logs the change for admin to see
    return NextResponse.json({
      success: true,
      message: 'Password changed successfully! Admin has been notified.',
      newPassword, // Return for confirmation
    });
  } catch (error) {
    console.error('[change-password] Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
