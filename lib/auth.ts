/**
 * Authentication utilities - Server-side only
 * Handles password validation and session management
 */

import { createClient } from '@supabase/supabase-js';

// Server-side Supabase client with service role key
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

export const supabaseAdmin = supabaseUrl && serviceRoleKey
  ? createClient(supabaseUrl, serviceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    })
  : null;

export type UserType = 'simi' | 'admin';

export interface SessionData {
  userType: UserType;
  authenticated: boolean;
  loginTime: string;
}

/**
 * Validate password against environment variable
 */
export function validatePassword(password: string, userType: UserType): boolean {
  const expectedPassword = userType === 'simi'
    ? process.env.SIMI_ACCESS_PASSWORD
    : process.env.ADMIN_ACCESS_PASSWORD;

  if (!expectedPassword) {
    console.error(`[auth] ${userType.toUpperCase()} password not configured in environment`);
    return false;
  }

  return password === expectedPassword;
}

/**
 * Log login event to database
 */
export async function logLoginEvent(
  userType: UserType,
  status: 'success' | 'failed' | 'rate_limited',
  sessionId?: string,
  userAgent?: string,
  ipAddress?: string
): Promise<void> {
  if (!supabaseAdmin) {
    console.warn('[auth] Supabase admin client not configured');
    return;
  }

  try {
    const { error } = await supabaseAdmin
      .from('login_events')
      .insert({
        user_type: userType,
        status,
        session_id: sessionId || null,
        user_agent: userAgent || null,
        ip_address: ipAddress || null,
      });

    if (error) {
      console.error('[auth] Failed to log login event:', error);
    }
  } catch (err) {
    console.error('[auth] Error logging login event:', err);
  }
}

/**
 * Check rate limiting for failed attempts
 * Returns true if should be blocked
 */
export async function checkRateLimit(ipAddress: string, userType: UserType): Promise<boolean> {
  if (!supabaseAdmin) return false;

  try {
    // Check failed attempts in last 15 minutes
    const fifteenMinutesAgo = new Date(Date.now() - 15 * 60 * 1000).toISOString();

    const { data, error } = await supabaseAdmin
      .from('failed_login_attempts')
      .select('id')
      .eq('user_type', userType)
      .eq('ip_address', ipAddress)
      .gte('attempt_timestamp', fifteenMinutesAgo);

    if (error) {
      console.error('[auth] Rate limit check failed:', error);
      return false;
    }

    // Block after 5 failed attempts in 15 minutes
    return (data?.length || 0) >= 5;
  } catch (err) {
    console.error('[auth] Rate limit check error:', err);
    return false;
  }
}

/**
 * Record failed login attempt
 */
export async function recordFailedAttempt(ipAddress: string, userType: UserType): Promise<void> {
  if (!supabaseAdmin) return;

  try {
    await supabaseAdmin
      .from('failed_login_attempts')
      .insert({
        user_type: userType,
        ip_address: ipAddress,
      });
  } catch (err) {
    console.error('[auth] Failed to record attempt:', err);
  }
}

/**
 * Clear failed attempts after successful login
 */
export async function clearFailedAttempts(ipAddress: string, userType: UserType): Promise<void> {
  if (!supabaseAdmin) return;

  try {
    await supabaseAdmin
      .from('failed_login_attempts')
      .delete()
      .eq('user_type', userType)
      .eq('ip_address', ipAddress);
  } catch (err) {
    console.error('[auth] Failed to clear attempts:', err);
  }
}

/**
 * Get client IP address from request
 */
export function getClientIp(headers: Headers): string {
  return (
    headers.get('x-forwarded-for')?.split(',')[0] ||
    headers.get('x-real-ip') ||
    'unknown'
  );
}

