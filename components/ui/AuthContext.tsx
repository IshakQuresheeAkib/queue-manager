'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

interface AuthContextType {
  user: { email: string } | null;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string) => Promise<void>;
  logout: () => void;
  demoLogin: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<{ email: string } | null>(null);

  useEffect(() => {
    // React 19: useEffect works the same
    const savedUser = localStorage.getItem('app_user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, []);

  const signup = async (email: string, password: string): Promise<void> => {
    await new Promise((resolve) => setTimeout(resolve, 500));

    const users = JSON.parse(localStorage.getItem('app_users') || '[]');

    if (users.find((u: { email: string }) => u.email === email)) {
      throw new Error('User already exists');
    }

    users.push({ email, password });
    localStorage.setItem('app_users', JSON.stringify(users));

    const newUser = { email };
    setUser(newUser);
    localStorage.setItem('app_user', JSON.stringify(newUser));
  };

  const login = async (email: string, password: string): Promise<void> => {
    await new Promise((resolve) => setTimeout(resolve, 500));

    const users = JSON.parse(localStorage.getItem('app_users') || '[]');
    const foundUser = users.find(
      (u: { email: string; password: string }) =>
        u.email === email && u.password === password
    );

    if (!foundUser) {
      throw new Error('Invalid credentials');
    }

    const newUser = { email };
    setUser(newUser);
    localStorage.setItem('app_user', JSON.stringify(newUser));
  };

  const demoLogin = async (): Promise<void> => {
    await new Promise((resolve) => setTimeout(resolve, 500));
    const demoUser = { email: 'demo@example.com' };

    setUser(demoUser);
    localStorage.setItem('app_user', JSON.stringify(demoUser));
  };

  const logout = (): void => {
    setUser(null);
    localStorage.removeItem('app_user');
  };

  return (
    <AuthContext.Provider value={{ user, login, signup, logout, demoLogin }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
