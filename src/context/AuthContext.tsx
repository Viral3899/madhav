'use client';

import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';

const API = process.env.NEXT_PUBLIC_API_URL || '/api';

export interface AuthUser {
  id: number;
  name: string;
  email: string;
  role: 'customer' | 'seller' | 'admin';
  is_active: boolean;
}

interface AuthContextType {
  user: AuthUser | null;
  token: string | null;
  isAuthOpen: boolean;
  authTab: 'login' | 'register';
  openAuth: (tab?: 'login' | 'register') => void;
  closeAuth: () => void;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  registerShopHolder: (name: string, email: string, password: string, setupKey: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [authTab, setAuthTab] = useState<'login' | 'register'>('login');

  // Rehydrate from localStorage on mount
  useEffect(() => {
    try {
      const t = localStorage.getItem('sz_token');
      const u = localStorage.getItem('sz_user');
      if (t && u) {
        setToken(t);
        setUser(JSON.parse(u));
      }
    } catch {
      /* ignore */
    }
  }, []);

  const openAuth = useCallback((tab: 'login' | 'register' = 'login') => {
    setAuthTab(tab);
    setIsAuthOpen(true);
  }, []);

  const closeAuth = useCallback(() => setIsAuthOpen(false), []);

  const login = useCallback(async (email: string, password: string) => {
    const res = await fetch(`${API}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.detail || 'Login failed');
    localStorage.setItem('sz_token', data.access_token);
    localStorage.setItem('sz_user', JSON.stringify(data.user));
    setToken(data.access_token);
    setUser(data.user);
  }, []);

  const register = useCallback(async (name: string, email: string, password: string) => {
    const res = await fetch(`${API}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.detail || 'Registration failed');
    localStorage.setItem('sz_token', data.access_token);
    localStorage.setItem('sz_user', JSON.stringify(data.user));
    setToken(data.access_token);
    setUser(data.user);
  }, []);

  const registerShopHolder = useCallback(async (name: string, email: string, password: string, setupKey: string) => {
    const res = await fetch(`${API}/auth/admin/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password, setup_key: setupKey }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.detail || 'Shop-holder registration failed');
    localStorage.setItem('sz_token', data.access_token);
    localStorage.setItem('sz_user', JSON.stringify(data.user));
    setToken(data.access_token);
    setUser(data.user);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('sz_token');
    localStorage.removeItem('sz_user');
    setToken(null);
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthOpen,
        authTab,
        openAuth,
        closeAuth,
        login,
        register,
        registerShopHolder,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
