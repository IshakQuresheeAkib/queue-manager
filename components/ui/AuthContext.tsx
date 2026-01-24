'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { User as SupabaseUser } from '@supabase/supabase-js';
import { User } from '@/types';
import { getUserProfile } from '@/lib/supabase/queries';

interface AuthContextType {
  user: User | null;
  loading: boolean;
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
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  const loadUserWithProfile = async (supabaseUser: SupabaseUser): Promise<User> => {
    const profile = await getUserProfile(supabaseUser.id);
    return {
      id: supabaseUser.id,
      email: supabaseUser.email!,
      profile,
    };
  };

  const refreshProfile = async (): Promise<void> => {
    if (!user) return;
    const profile = await getUserProfile(user.id);
    setUser({ ...user, profile });
  };

  useEffect(() => {
    // Check active session
    const initializeAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          const userWithProfile = await loadUserWithProfile(session.user);
          setUser(userWithProfile);
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        if (session?.user) {
          const userWithProfile = await loadUserWithProfile(session.user);
          setUser(userWithProfile);
        } else {
          setUser(null);
        }
        setLoading(false);
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const signup = async (email: string, password: string): Promise<void> => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) throw error;

    if (data.user) {
      const userWithProfile = await loadUserWithProfile(data.user);
      setUser(userWithProfile);
    }
  };

  const login = async (email: string, password: string): Promise<void> => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;

    if (data.user) {
      const userWithProfile = await loadUserWithProfile(data.user);
      setUser(userWithProfile);
    }
  };

  const demoLogin = async (): Promise<void> => {
    // Create or login with demo account
    const demoEmail = 'demo@example.com';
    const demoPassword = 'demo123456';

    try {
      // Try to sign in first
      await login(demoEmail, demoPassword);
    } catch (error) {
      // If sign in fails, try to sign up
      try {
        await signup(demoEmail, demoPassword);
      } catch (signupError) {
        // If signup also fails, try login again (user might already exist)
        await login(demoEmail, demoPassword);
      }
    }
  };

  const logout = async (): Promise<void> => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, signup, logout, demoLogin, refreshProfile }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};