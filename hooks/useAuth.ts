/**
 * useAuth Hook - Manages authentication state
 */

import { useState, useEffect } from 'react';

export interface AuthState {
  authenticated: boolean;
  userType: 'simi' | 'admin' | null;
  loading: boolean;
  loginTime: string | null;
}

export function useAuth() {
  const [authState, setAuthState] = useState<AuthState>({
    authenticated: false,
    userType: null,
    loading: true,
    loginTime: null,
  });

  // Check session on mount
  useEffect(() => {
    checkSession();
  }, []);

  const checkSession = async () => {
    try {
      const response = await fetch('/api/auth/session');
      if (response.ok) {
        const data = await response.json();
        setAuthState({
          authenticated: data.authenticated || false,
          userType: data.userType || null,
          loading: false,
          loginTime: data.loginTime || null,
        });
      } else {
        setAuthState({
          authenticated: false,
          userType: null,
          loading: false,
          loginTime: null,
        });
      }
    } catch (error) {
      console.error('[useAuth] Session check failed:', error);
      setAuthState({
        authenticated: false,
        userType: null,
        loading: false,
        loginTime: null,
      });
    }
  };

  const login = async (password: string, userType: 'simi' | 'admin'): Promise<{ success: boolean; error?: string }> => {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password, userType }),
      });

      const data = await response.json();

      if (response.ok) {
        setAuthState({
          authenticated: true,
          userType: data.userType,
          loading: false,
          loginTime: new Date().toISOString(),
        });
        return { success: true };
      } else {
        return { success: false, error: data.error || 'Login failed' };
      }
    } catch (error) {
      console.error('[useAuth] Login error:', error);
      return { success: false, error: 'Network error' };
    }
  };

  const logout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      setAuthState({
        authenticated: false,
        userType: null,
        loading: false,
        loginTime: null,
      });
    } catch (error) {
      console.error('[useAuth] Logout error:', error);
    }
  };

  return {
    ...authState,
    login,
    logout,
    refresh: checkSession,
  };
}

