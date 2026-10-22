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
    console.error('[CRITICAL] Failed to load WorldRoom module:', err);
    // Return a fallback component instead of crashing
    return { 
      default: () => (
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
          <div style={{ textAlign: 'center', maxWidth: 500 }}>
            <h2 style={{ fontSize: 24, fontWeight: 'bold', marginBottom: 16, color: '#ff6b9d' }}>
              ⚠️ WorldRoom Failed to Load
            </h2>
            <p style={{ color: '#c4b5fd', marginBottom: 16 }}>
              The 3D world component could not be loaded. This might be a Three.js or WebGL issue.
            </p>
            <p style={{ color: '#9ca3af', fontSize: 14, marginBottom: 16 }}>
              Error: {err.message || 'Unknown module error'}
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
      )
    };
  }),
  {
    ssr: false,
    loading: () => {
      console.log('[WorldRoom] Loading component...');
      return <LoadingScreen />;
    },
  }
);

export default function Universe() {
  const { state, isLoading, updateState } = useUniverse();
  const { authenticated, userType, loading: authLoading, login } = useAuth();
  const [isReplaying, setIsReplaying] = useState(false);
  const [showPasswordGate, setShowPasswordGate] = useState(false);
  const [introCompleted, setIntroCompleted] = useState(false);
  const [globalError, setGlobalError] = useState<Error | null>(null);

  // Global error handler - MUST BE BEFORE ANY CONDITIONAL RETURNS
  useEffect(() => {
    const handleError = (event: ErrorEvent) => {
      console.error('[GLOBAL ERROR]', event.error);
      setGlobalError(event.error);
      event.preventDefault(); // Prevent default error handling
    };

    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      console.error('[UNHANDLED PROMISE REJECTION]', event.reason);
      setGlobalError(new Error(`Promise rejection: ${event.reason}`));
      event.preventDefault();
    };

    window.addEventListener('error', handleError);
    window.addEventListener('unhandledrejection', handleUnhandledRejection);

    return () => {
      window.removeEventListener('error', handleError);
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
    };
  }, []);

  // Debug logging - MUST BE BEFORE ANY CONDITIONAL RETURNS
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

  // NOW safe to do conditional returns (all hooks are called above)
  
  // Show global error if caught
  if (globalError) {
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
          fontFamily: 'system-ui, sans-serif',
          padding: '20px'
        }}>
          <div style={{ textAlign: 'center', maxWidth: 600 }}>
            <h2 style={{ fontSize: 28, fontWeight: 'bold', marginBottom: 16, color: '#ff6b9d' }}>
              ⚠️ Application Error
            </h2>
            <p style={{ color: '#c4b5fd', fontSize: 16, marginBottom: 16 }}>
              An unexpected error occurred
            </p>
            <div style={{ 
              textAlign: 'left', 
              background: 'rgba(0,0,0,0.3)', 
              padding: 16, 
              borderRadius: 8,
              marginBottom: 16,
              maxHeight: 200,
              overflow: 'auto'
            }}>
              <div style={{ fontSize: 12, color: '#ffd700', fontFamily: 'monospace', whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                {globalError.message}
                {globalError.stack && (
                  <pre style={{ marginTop: 8, fontSize: 11, color: '#e0e0e0' }}>
                    {globalError.stack.split('\n').slice(0, 10).join('\n')}
                  </pre>
                )}
              </div>
            </div>
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
      </main>
    );
  }

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
                onClick={() => {
                  localStorage.clear();
                  window.location.reload();
                }} 
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
                Clear Cache & Reload
              </button>
            </div>
          </div>
        </main>
      );
    }

    console.log('[Universe] 🎨 About to render WorldRoom component...');
    
    // TEMPORARY TEST: Show a simple test UI instead of WorldRoom
    // This will help us identify if the issue is with WorldRoom or authentication
    const TEST_MODE = false; // Set to true to enable test mode
    
    if (TEST_MODE) {
      return (
        <main className="fixed inset-0 overflow-clip" style={{
          background: 'linear-gradient(135deg, #1a0f1e 0%, #2d1b3d 100%)',
          color: '#fff',
          padding: '40px',
          fontFamily: 'system-ui, sans-serif'
        }}>
          <h1 style={{ fontSize: 32, marginBottom: 20 }}>🎉 Test Mode - Authentication Working!</h1>
          <p style={{ marginBottom: 20, color: '#c4b5fd' }}>If you see this, authentication is working. The issue is with WorldRoom.</p>
          <div style={{ background: 'rgba(0,0,0,0.3)', padding: 20, borderRadius: 8 }}>
            <h2 style={{ fontSize: 20, marginBottom: 10 }}>State Info:</h2>
            <pre style={{ fontSize: 12, overflow: 'auto' }}>{JSON.stringify(state, null, 2)}</pre>
          </div>
          <button 
            onClick={() => window.location.reload()} 
            style={{ 
              marginTop: 20, 
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
            Reload
          </button>
        </main>
      );
    }
    
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
              <div style={{ textAlign: 'center' }}>
                <h2 style={{ fontSize: 24, marginBottom: 10 }}>Loading Your World...</h2>
                <p style={{ color: '#c4b5fd' }}>Please wait</p>
              </div>
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
