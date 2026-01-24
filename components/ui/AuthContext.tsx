'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { User } from '@/types';
import { getUserProfile } from '@/lib/supabase/queries';
import { DEMO_EMAIL, DEMO_PASSWORD } from '@/lib/constants/demo';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  initializing: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  demoLogin: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);
  const [initializing, setInitializing] = useState(true);
  const supabase = useMemo(() => createClient(), []);

  const refreshProfile = useCallback(async (): Promise<void> => {
    if (!user) return;
    const profile = await getUserProfile(user.id);
    setUser(prev => prev ? { ...prev, profile } : null);
  }, [user]);

  useEffect(() => {
    let mounted = true;

    // Use onAuthStateChange as primary - it handles INITIAL_SESSION event
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!mounted) return;
        
        if (session?.user) {
          setUser({
            id: session.user.id,
            email: session.user.email ?? '',
            profile: null,
          });
          setInitializing(false);
          
          // Load profile in background
          getUserProfile(session.user.id)
            .then(profile => {
              if (mounted) {
                setUser(prev => prev ? { ...prev, profile } : null);
              }
            })
            .catch();
        } else {
          setUser(null);
          setInitializing(false);
        }
      }
    );

    // Fallback timeout in case onAuthStateChange doesn't fire (defensive)
    const fallbackTimeout = setTimeout(() => {
      if (mounted) {
        setInitializing(false);
      }
    }, 3000);

    return () => {
      mounted = false;
      subscription.unsubscribe();
      clearTimeout(fallbackTimeout);
    };
  }, [supabase]);

  const signup = useCallback(async (email: string, password: string): Promise<void> => {
    setLoading(true);
    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) throw error;
      // onAuthStateChange will handle setting user
    } finally {
      setLoading(false);
    }
  }, [supabase]);

  const login = useCallback(async (email: string, password: string): Promise<void> => {
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;
      // onAuthStateChange will handle setting user
    } finally {
      setLoading(false);
    }
  }, [supabase]);

  const demoLogin = useCallback(async (): Promise<void> => {
    // Try login first (most common case)
    try {
      await login(DEMO_EMAIL, DEMO_PASSWORD);
      return;
    } catch {
      // Login failed, try signup
    }

    // If login fails, try creating the account
    try {
      await signup(DEMO_EMAIL, DEMO_PASSWORD);
      return;
    } catch {
      // Signup failed, try login one more time
    }

    // Final attempt - login again (in case signup succeeded but returned error)
    await login(DEMO_EMAIL, DEMO_PASSWORD);
  }, [login, signup]);

  const logout = useCallback(async (): Promise<void> => {
    setLoading(true);
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, [supabase]);

  const contextValue = useMemo(() => ({
    user,
    loading,
    initializing,
    login,
    signup,
    logout,
    demoLogin,
    refreshProfile,
  }), [user, loading, initializing, login, signup, logout, demoLogin, refreshProfile]);

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};