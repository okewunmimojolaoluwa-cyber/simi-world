'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { useUniverse } from '@/hooks/useUniverse';
import { useAuth } from '@/hooks/useAuth';
import LoadingScreen from '@/components/universe/LoadingScreen';
import BirthdayGiftIntro from '@/components/universe/BirthdayGiftIntro';
import SimiPasswordGate from '@/components/auth/SimiPasswordGate';

// Dynamically import WorldRoom with no SSR to prevent Three.js build issues
const WorldRoom = dynamic(() => import('@/components/world/WorldRoom'), {
  ssr: false,
  loading: () => <LoadingScreen />,
});

// Force dynamic rendering - required for client-only components
export const dynamic = 'force-dynamic';

export default function Universe() {
  const { state, isLoading, updateState } = useUniverse();
  const { authenticated, userType, loading: authLoading, login } = useAuth();
  const [isReplaying, setIsReplaying] = useState(false);
  const [showPasswordGate, setShowPasswordGate] = useState(false);

  // Only wait for universe state to load, not auth
  if (isLoading || !state) {
    return <LoadingScreen />;
  }

  // IMPORTANT: ALWAYS show intro on page load/refresh
  // Remove the birthdayIntroCompleted check to force intro every time
  const shouldShowBirthdayIntro = true; // Always show intro, ignore saved state

  const handleUnlockBirthday = () => {
    // Don't save completion state - we want intro to show every time
    setIsReplaying(false);
    // Show password gate after intro completion
    setShowPasswordGate(true);
  };

  const handleReplayIntro = () => {
    setIsReplaying(true);
  };

  const handleSimiLogin = async (password: string) => {
    return await login(password, 'simi');
  };

  const handleAuthenticated = () => {
    setShowPasswordGate(false);
  };

  // Show birthday intro first
  if (shouldShowBirthdayIntro) {
    return (
      <main className="fixed inset-0 overflow-clip">
        <BirthdayGiftIntro
          onUnlock={handleUnlockBirthday}
          isReplay={isReplaying}
        />
      </main>
    );
  }

  // Show password gate after intro (before dashboard)
  if (showPasswordGate) {
    return (
      <main className="fixed inset-0 overflow-clip">
        <SimiPasswordGate
          onAuthenticated={handleAuthenticated}
          onLogin={handleSimiLogin}
        />
      </main>
    );
  }

  // Show dashboard only when authenticated (or if auth is still loading, wait)
  if (!authLoading && authenticated) {
    return (
      <main className="fixed inset-0 overflow-clip">
        <WorldRoom
          state={state}
          updateState={updateState}
          onReplayIntro={handleReplayIntro}
        />
      </main>
    );
  }

  // If auth is loading or not authenticated, show password gate
  return (
    <main className="fixed inset-0 overflow-clip">
      <SimiPasswordGate
        onAuthenticated={handleAuthenticated}
        onLogin={handleSimiLogin}
      />
    </main>
  );
}
