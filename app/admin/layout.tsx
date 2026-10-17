/**
 * Admin Layout - Protected layout for admin routes
 * Checks for admin authentication before rendering
 */

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { getIronSession } from 'iron-session';
import { SessionData, sessionOptions } from '@/lib/session';

// Force dynamic rendering for layouts using cookies
export const dynamic = 'force-dynamic';

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getIronSession<SessionData>(cookies(), sessionOptions);

  // Redirect if not authenticated or not an admin
  if (!session.isLoggedIn || session.role !== 'admin') {
    redirect('/');
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-purple-950/20 to-gray-950">
      {children}
    </div>
  );
}
