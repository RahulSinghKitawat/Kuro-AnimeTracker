'use client';

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { signIn as nextAuthSignIn, signOut as nextAuthSignOut } from 'next-auth/react';

export interface SafeUser {
  id: string;
  handle: string;
  name: string;
  email: string;
  avatar: string;
  location?: string;
  website?: string;
  bio?: string;
}

interface AuthContextType {
  user: SafeUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (identity: string, password: string) => Promise<{ success: boolean; error?: string }>;
  loginWithGoogle: () => Promise<void>;
  register: (
    handle: string,
    email: string,
    password: string,
    name?: string
  ) => Promise<{ success: boolean; error?: string }>;
  loginAsGuest: () => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const LOCAL_STORAGE_KEY = 'kuro_auth_user';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<SafeUser | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const router = useRouter();

  useEffect(() => {
    // Check localStorage first for instant hydration
    try {
      const cached = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (cached) {
        setUser(JSON.parse(cached));
      }
    } catch (e) {
      console.warn('Could not read cached user from localStorage', e);
    }

    // Verify session with server API
    fetch('/api/auth/me')
      .then((res) => res.json())
      .then((data) => {
        if (data?.user) {
          setUser(data.user);
          localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(data.user));
        } else {
          // If server says no session, clear local cache
          const cached = localStorage.getItem(LOCAL_STORAGE_KEY);
          if (cached) {
            // Keep cached user if offline, or sync
            setUser(null);
            localStorage.removeItem(LOCAL_STORAGE_KEY);
          }
        }
      })
      .catch((err) => {
        console.warn('Session check failed or offline', err);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, []);

  const login = async (identity: string, password: string) => {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identity, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        return { success: false, error: data?.error || 'Authentication failed' };
      }
      setUser(data.user);
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(data.user));
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err?.message || 'Network error occurred.' };
    }
  };

  const register = async (
    handle: string,
    email: string,
    password: string,
    name?: string
  ) => {
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ handle, email, password, name }),
      });
      const data = await res.json();
      if (!res.ok) {
        return { success: false, error: data?.error || 'Registration failed' };
      }
      setUser(data.user);
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(data.user));
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err?.message || 'Network error occurred.' };
    }
  };

  const loginWithGoogle = async () => {
    await nextAuthSignIn('google', { callbackUrl: '/list' });
  };

  const loginAsGuest = async () => {
    // Quick login using default demo archivist
    await login('archivist@kuro.media', 'password123');
  };

  const logout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      await nextAuthSignOut({ redirect: false }); // also clear Google/NextAuth session
    } catch (err) {
      console.error('Logout error', err);
    }
    setUser(null);
    localStorage.removeItem(LOCAL_STORAGE_KEY);
    router.push('/');
  };

  const refreshUser = async () => {
    try {
      const res = await fetch('/api/auth/me');
      const data = await res.json();
      if (data?.user) {
        setUser(data.user);
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(data.user));
      }
    } catch (err) {
      console.warn('Failed to refresh user', err);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: Boolean(user),
        isLoading,
        login,
        loginWithGoogle,
        register,
        loginAsGuest,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
