'use client';

import { useState } from 'react';
import { useUniverse } from '@/hooks/useUniverse';
import LoadingScreen from '@/components/universe/LoadingScreen';
import WorldRoom from '@/components/world/WorldRoom';
import BirthdayGiftIntro from '@/components/universe/BirthdayGiftIntro';

export default function Universe() {
  const { state, isLoading, updateState } = useUniverse();
  const [isReplaying, setIsReplaying] = useState(false);

  if (isLoading || !state) {
    return <LoadingScreen />;
  }

  // CRITICAL: Show intro if birthdayIntroCompleted is not explicitly true
  // This ensures even after refresh, the intro is required until completed
  const shouldShowBirthdayIntro = state.birthdayIntroCompleted !== true || isReplaying;

  const handleUnlockBirthday = () => {
    // Ensure the completion is saved immediately and persistently
    updateState({ birthdayIntroCompleted: true });
    setIsReplaying(false);
  };

  const handleReplayIntro = () => {
    setIsReplaying(true);
  };

  return (
    <main className="fixed inset-0 overflow-clip">
      {shouldShowBirthdayIntro ? (
        <BirthdayGiftIntro
          onUnlock={handleUnlockBirthday}
          isReplay={isReplaying}
        />
      ) : (
        <WorldRoom
          state={state}
          updateState={updateState}
          onReplayIntro={handleReplayIntro}
        />
      )}
    </main>
  );
}
