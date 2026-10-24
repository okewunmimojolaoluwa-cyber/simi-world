/**
 * Reset Password API - Allows Simi to reset password without logging in
 * POST /api/auth/reset-password
 */

import { NextRequest, NextResponse } from 'next/server';
import { getClientIp, supabaseAdmin } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const { newPassword } = await request.json();

    if (!newPassword) {
      return NextResponse.json(
        { error: 'New password is required' },
        { status: 400 }
      );
    }

    // Password requirements
    if (newPassword.length < 4) {
      return NextResponse.json(
        { error: 'Password must be at least 4 characters' },
        { status: 400 }
      );
    }

    // Get client info
    const ipAddress = getClientIp(request.headers);
    const userAgent = request.headers.get('user-agent') || undefined;

    // Log password reset to database
    if (supabaseAdmin) {
      const { error: logError } = await supabaseAdmin
        .from('password_changes')
        .insert({
          user_type: 'simi',
          old_password_hint: '[RESET]', // Special marker for password reset
          new_password: newPassword,
          ip_address: ipAddress,
          user_agent: userAgent,
          admin_viewed: false,
        });

      if (logError) {
        console.error('[reset-password] Failed to log password reset:', logError);
      }
    }

    // Return success
    return NextResponse.json({
      success: true,
      message: 'Password reset successfully! You can now login with your new password.',
      newPassword, // Return for confirmation
    });
  } catch (error) {
    console.error('[reset-password] Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
