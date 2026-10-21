'use client';

import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { useUniverse } from '@/hooks/useUniverse';
import { useAuth } from '@/hooks/useAuth';
import LoadingScreen from '@/components/universe/LoadingScreen';
import BirthdayGiftIntro from '@/components/universe/BirthdayGiftIntro';
import SimiPasswordGate from '@/components/auth/SimiPasswordGate';

// Dynamically import WorldRoom with no SSR to prevent Three.js build issues
const WorldRoom = dynamic(
  () => import('@/components/world/WorldRoom').catch((err) => {
    console.error('Failed to load WorldRoom:', err);
    return { default: () => <div>Loading world...</div> };
  }),
  {
    ssr: false,
    loading: () => <LoadingScreen />,
  }
);

export default function Universe() {
  const { state, isLoading, updateState } = useUniverse();
  const { authenticated, userType, loading: authLoading, login } = useAuth();
  const [isReplaying, setIsReplaying] = useState(false);
  const [showPasswordGate, setShowPasswordGate] = useState(false);
  const [introCompleted, setIntroCompleted] = useState(false);

  // Debug logging
  useEffect(() => {
    console.log('[Universe] State:', { 
      stateExists: !!state, 
      isLoading, 
      authenticated, 
      authLoading,
      introCompleted,
      showPasswordGate 
    });
  }, [state, isLoading, authenticated, authLoading, introCompleted, showPasswordGate]);

  // Only wait for universe state to load, not auth
  if (isLoading || !state) {
    console.log('[Universe] Loading state or waiting for state...');
    return <LoadingScreen />;
  }

  const handleUnlockBirthday = () => {
    // Mark intro as completed and show password gate
    setIntroCompleted(true);
    setShowPasswordGate(true);
    setIsReplaying(false);
  };

  const handleReplayIntro = () => {
    setIntroCompleted(false);
    setIsReplaying(true);
  };

  const handleSimiLogin = async (password: string) => {
    return await login(password, 'simi');
  };

  const handleAuthenticated = () => {
    setShowPasswordGate(false);
  };

  // Show birthday intro first (only if not completed yet)
  if (!introCompleted || isReplaying) {
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
  if (showPasswordGate || !authenticated) {
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
  if (authenticated && !authLoading) {
    console.log('[Universe] Rendering WorldRoom with state:', state);
    
    // Safety check - ensure state exists
    if (!state) {
      console.error('[Universe] State is null when trying to render WorldRoom!');
      return <LoadingScreen />;
    }

    return (
      <main className="fixed inset-0 overflow-clip">
        <ErrorBoundary 
          fallback={
            <div className="fixed inset-0 flex items-center justify-center bg-gradient-to-br from-gray-900 to-black text-white">
              <div className="text-center p-8">
                <h2 className="text-2xl font-bold mb-4">Loading Your World...</h2>
                <p className="text-gray-400">Setting up the experience</p>
              </div>
            </div>
          }
        >
          <WorldRoom
            state={state}
            updateState={updateState}
            onReplayIntro={handleReplayIntro}
          />
        </ErrorBoundary>
      </main>
    );
  }

  // Loading state
  console.log('[Universe] Showing loading screen (auth not ready)');
  return <LoadingScreen />;
}

// Simple Error Boundary Component
class ErrorBoundary extends React.Component<
  { children: React.ReactNode; fallback: React.ReactNode },
  { hasError: boolean; error: Error | null }
> {
  constructor(props: { children: React.ReactNode; fallback: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    console.error('[ErrorBoundary] Error caught:', error);
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('[ErrorBoundary] WorldRoom Error:', error);
    console.error('[ErrorBoundary] Error Info:', errorInfo);
  }

  render() {
    if (this.state.hasError) {
      console.error('[ErrorBoundary] Rendering fallback due to error:', this.state.error);
      return this.props.fallback;
    }
    return this.props.children;
  }
}
