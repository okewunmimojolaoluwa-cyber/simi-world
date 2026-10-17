/**
 * Iron Session configuration for secure cookie-based sessions
 */

import { SessionOptions } from 'iron-session';
import type { SessionData } from './auth';

export const sessionOptions: SessionOptions = {
  password: process.env.SESSION_SECRET || 'complex_password_at_least_32_characters_long',
  cookieName: 'simi_world_session',
  cookieOptions: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    sameSite: 'lax',
    maxAge: 30 * 24 * 60 * 60, // 30 days
    path: '/',
  },
};

// Extend the default session data type
declare module 'iron-session' {
  interface IronSessionData extends SessionData {}
}

