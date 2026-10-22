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
    console.log('[Universe] ✅ Authenticated! Preparing to render WorldRoom');
    console.log('[Universe] State details:', {
      hasState: !!state,
      stateKeys: state ? Object.keys(state) : [],
      totalVisits: state?.totalVisits,
      selectedMood: state?.selectedMood
    });
    
    // Safety check - ensure state exists
    if (!state) {
      console.error('[Universe] ❌ State is null when trying to render WorldRoom!');
      return (
        <main className="fixed inset-0 overflow-clip">
          <div style={{ 
            position: 'fixed', 
            inset: 0, 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            background: 'linear-gradient(135deg, #1a0f1e 0%, #2d1b3d 100%)',
            color: '#fff',
            fontFamily: 'system-ui, sans-serif'
          }}>
            <div style={{ textAlign: 'center', padding: 32 }}>
              <h2 style={{ fontSize: 28, fontWeight: 'bold', marginBottom: 16 }}>⚠️ State Error</h2>
              <p style={{ color: '#c4b5fd', fontSize: 16 }}>Unable to load your universe data</p>
              <button 
                onClick={() => window.location.reload()} 
                style={{ 
                  marginTop: 24, 
                  padding: '12px 24px', 
                  background: '#c4b5fd', 
                  color: '#1a0f1e', 
                  border: 'none', 
                  borderRadius: 8, 
                  cursor: 'pointer',
                  fontSize: 16,
                  fontWeight: 600
                }}
              >
                Reload Page
              </button>
            </div>
          </div>
        </main>
      );
    }

    console.log('[Universe] 🎨 About to render WorldRoom component...');
    
    return (
      <main className="fixed inset-0 overflow-clip">
        <ErrorBoundary>
          <React.Suspense fallback={
            <div style={{ 
              position: 'fixed', 
              inset: 0, 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              background: 'linear-gradient(135deg, #1a0f1e 0%, #2d1b3d 100%)',
              color: '#fff'
            }}>
              <LoadingScreen />
            </div>
          }>
            <WorldRoom
              state={state}
              updateState={updateState}
              onReplayIntro={handleReplayIntro}
            />
          </React.Suspense>
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
  { children: React.ReactNode },
  { hasError: boolean; error: Error | null }
> {
  constructor(props: { children: React.ReactNode }) {
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
      const errorMessage = this.state.error?.message || 'Unknown error';
      const errorStack = this.state.error?.stack?.split('\n').slice(0, 5).join('\n') || '';
      
      return (
        <div style={{ 
          position: 'fixed', 
          inset: 0, 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center', 
          background: 'linear-gradient(135deg, #1a0f1e 0%, #2d1b3d 100%)',
          color: '#fff',
          fontFamily: 'system-ui, sans-serif',
          padding: '20px'
        }}>
          <div style={{ textAlign: 'center', padding: 32, maxWidth: 600 }}>
            <h2 style={{ fontSize: 28, fontWeight: 'bold', marginBottom: 16, color: '#ff6b9d' }}>⚠️ Error Loading World</h2>
            <p style={{ color: '#c4b5fd', fontSize: 16, marginBottom: 16 }}>Something went wrong while loading your dashboard</p>
            <details style={{ 
              textAlign: 'left', 
              background: 'rgba(0,0,0,0.3)', 
              padding: 16, 
              borderRadius: 8,
              marginBottom: 16,
              cursor: 'pointer'
            }}>
              <summary style={{ color: '#ffd700', marginBottom: 8 }}>Error Details (click to expand)</summary>
              <div style={{ fontSize: 12, color: '#e0e0e0', fontFamily: 'monospace' }}>
                <strong>Error:</strong> {errorMessage}
                <pre style={{ marginTop: 8, whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>{errorStack}</pre>
              </div>
            </details>
            <p style={{ color: '#9ca3af', fontSize: 14, marginBottom: 16 }}>
              Try refreshing the page. If the problem persists, check the browser console (F12) for more details.
            </p>
            <button 
              onClick={() => window.location.reload()} 
              style={{ 
                padding: '12px 24px', 
                background: '#c4b5fd', 
                color: '#1a0f1e', 
                border: 'none', 
                borderRadius: 8, 
                cursor: 'pointer',
                fontSize: 16,
                fontWeight: 600
              }}
            >
              Reload Page
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
