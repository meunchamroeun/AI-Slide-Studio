'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';

export interface User {
  id: string;
  name: string;
  email: string | null;
  avatar_url: string | null;
  role: 'user' | 'admin';
}

export interface AuthContextType {
  user: User | null;
  loading: boolean;
  setUser: (user: User | null) => void;
  login: (email: string, password?: string) => Promise<User>;
  register: (name: string, email: string, password?: string) => Promise<User>;
  loginDemo: () => Promise<User>;
  loginAdmin: () => Promise<User>;
  logout: () => Promise<void>;
}

const AUTH_STORAGE_KEY = 'slidestudio:auth_user';

export const ADMIN_EMAIL = 'meunchamroeun09@gmail.com';

export const ADMIN_USER: User = {
  id: 'usr-admin-01',
  name: 'Chamroeun Meun',
  email: ADMIN_EMAIL,
  avatar_url: null,
  role: 'admin',
};

const DEMO_USER: User = {
  id: 'usr-demo-01',
  name: 'Alex Morgan',
  email: 'alex.morgan@slidestudio.ai',
  avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
  role: 'user',
};

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [user, setUserState] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Initialize from storage
  useEffect(() => {
    try {
      const stored = localStorage.getItem(AUTH_STORAGE_KEY);
      if (stored) {
        setUserState(JSON.parse(stored));
      } else {
        setUserState(null);
      }
    } catch {
      setUserState(null);
    } finally {
      setLoading(false);
    }
  }, []);

  const setUser = useCallback((u: User | null) => {
    setUserState(u);
    try {
      if (u) {
        localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(u));
      } else {
        localStorage.removeItem(AUTH_STORAGE_KEY);
      }
    } catch {}
  }, []);

  const login = useCallback(
    async (email: string): Promise<User> => {
      const isSuperAdmin = email.trim().toLowerCase() === ADMIN_EMAIL.toLowerCase();
      const isAdmin = isSuperAdmin || email.toLowerCase().includes('admin');

      const loggedUser: User = {
        id: isSuperAdmin ? 'usr-admin-01' : `usr-${Date.now()}`,
        name: isSuperAdmin
          ? 'Chamroeun Meun'
          : email.split('@')[0].replace('.', ' ').replace(/\b\w/g, (c) => c.toUpperCase()),
        email,
        avatar_url: null,
        role: isAdmin ? 'admin' : 'user',
      };
      setUser(loggedUser);
      return loggedUser;
    },
    [setUser]
  );

  const register = useCallback(
    async (name: string, email: string): Promise<User> => {
      const isSuperAdmin = email.trim().toLowerCase() === ADMIN_EMAIL.toLowerCase();
      const newUser: User = {
        id: isSuperAdmin ? 'usr-admin-01' : `usr-${Date.now()}`,
        name,
        email,
        avatar_url: null,
        role: isSuperAdmin ? 'admin' : 'user',
      };
      setUser(newUser);
      return newUser;
    },
    [setUser]
  );

  const loginDemo = useCallback(async (): Promise<User> => {
    setUser(DEMO_USER);
    return DEMO_USER;
  }, [setUser]);

  const loginAdmin = useCallback(async (): Promise<User> => {
    setUser(ADMIN_USER);
    return ADMIN_USER;
  }, [setUser]);

  const logout = useCallback(async () => {
    setUser(null);
    router.push('/login');
  }, [setUser, router]);

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        setUser,
        login,
        register,
        loginDemo,
        loginAdmin,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
}
