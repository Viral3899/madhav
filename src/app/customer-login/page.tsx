'use client';

import { FormEvent, useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import Icon from '@/components/ui/AppIcon';

export default function CustomerLoginPage() {
  const { login, register, logout } = useAuth();
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('customer@madhavfashionstudio.com');
  const [password, setPassword] = useState('customer123');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (new URLSearchParams(window.location.search).get('tab') === 'register') setMode('register');
  }, []);

  async function submit(event: FormEvent) {
    event.preventDefault();
    setError('');
    setBusy(true);
    try {
      if (mode === 'login') await login(email, password);
      else await register(name, email, password);
      const storedUser = JSON.parse(localStorage.getItem('sz_user') || 'null');
      if (storedUser?.role !== 'customer') {
        logout();
        throw new Error('Please use the shop-holder login for admin accounts');
      }
      window.location.href = '/';
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to continue');
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="min-h-screen bg-secondary/40 grid place-items-center p-6">
      <div className="w-full max-w-md bg-background border border-border rounded-2xl p-7 shadow-xl">
        <Link href="/" className="text-xs uppercase tracking-widest text-muted-foreground">
          Madhav Fashion Studio
        </Link>
        <h1 className="font-display text-4xl italic mt-8 mb-2">
          {mode === 'login' ? 'Customer sign in' : 'Create customer account'}
        </h1>
        <p className="text-sm text-muted-foreground mb-7">
          Shop girls&apos; Indian clothing, T-shirts, and jeans.
        </p>
        <div className="flex border-b border-border mb-6">
          <button
            onClick={() => setMode('login')}
            className={`flex-1 py-3 text-xs uppercase tracking-widest border-b-2 ${mode === 'login' ? 'border-accent' : 'border-transparent text-muted-foreground'}`}
          >
            Sign in
          </button>
          <button
            onClick={() => setMode('register')}
            className={`flex-1 py-3 text-xs uppercase tracking-widest border-b-2 ${mode === 'register' ? 'border-accent' : 'border-transparent text-muted-foreground'}`}
          >
            Register
          </button>
        </div>
        <form onSubmit={submit} className="space-y-4">
          {mode === 'register' && (
            <input
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Full name"
              className="w-full checkout-input"
            />
          )}
          <input
            required
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            className="w-full checkout-input"
          />
          <div className="relative">
            <input
              required
              minLength={6}
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              className="w-full checkout-input pr-14"
            />
            <button
              type="button"
              onClick={() => setShowPassword((value) => !value)}
              className="absolute right-0 bottom-2 text-muted-foreground"
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              <Icon name={showPassword ? 'EyeSlashIcon' : 'EyeIcon'} size={17} variant="outline" />
            </button>
          </div>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <button disabled={busy} className="btn-primary w-full justify-center rounded-sm">
            {busy ? 'Please wait...' : mode === 'login' ? 'Sign in' : 'Create account'}
          </button>
        </form>
        <div className="flex justify-between gap-4 text-xs text-muted-foreground mt-6">
          <Link href="/" className="hover:text-foreground">
            Back to store
          </Link>
          <Link href="/shop-holder" className="hover:text-foreground">
            Shop holder login
          </Link>
        </div>
      </div>
    </main>
  );
}
