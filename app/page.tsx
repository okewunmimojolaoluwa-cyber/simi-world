'use client';

import { useState, useEffect } from 'react';
import { useUniverse } from '@/hooks/useUniverse';
import { useAuth } from '@/hooks/useAuth';
import LoadingScreen from '@/components/universe/LoadingScreen';
import WorldRoom from '@/components/world/WorldRoom';
import BirthdayGiftIntro from '@/components/universe/BirthdayGiftIntro';
import SimiPasswordGate from '@/components/auth/SimiPasswordGate';

export default function Universe() {
  const { state, isLoading, updateState } = useUniverse();
  const { authenticated, userType, loading: authLoading, login } = useAuth();
  const [isReplaying, setIsReplaying] = useState(false);
  const [showPasswordGate, setShowPasswordGate] = useState(false);

  // Check if user needs to authenticate
  const needsAuth = !authLoading && !authenticated && state?.birthdayIntroCompleted;

  if (isLoading || authLoading || !state) {
    return <LoadingScreen />;
  }

  // CRITICAL: Show intro if birthdayIntroCompleted is not explicitly true
  // This ensures even after refresh, the intro is required until completed
  const shouldShowBirthdayIntro = state.birthdayIntroCompleted !== true || isReplaying;

  const handleUnlockBirthday = () => {
    // Ensure the completion is saved immediately and persistently
    updateState({ birthdayIntroCompleted: true });
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
  if (needsAuth || showPasswordGate) {
    return (
      <main className="fixed inset-0 overflow-clip">
        <SimiPasswordGate
          onAuthenticated={handleAuthenticated}
          onLogin={handleSimiLogin}
        />
      </main>
    );
  }

  // Show dashboard only when authenticated
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
