'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Icon from '@/components/ui/AppIcon';
import { useAuth } from '@/context/AuthContext';

export default function AuthModal() {
  const { isAuthOpen, authTab, closeAuth, login, register } = useAuth();
  const [tab, setTab] = useState<'login' | 'register'>(authTab);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // sync tab when opened externally
  useEffect(() => {
    setTab(authTab);
    setError('');
    setSuccess('');
  }, [authTab, isAuthOpen]);

  // login fields
  const [lEmail, setLEmail] = useState('');
  const [lPassword, setLPassword] = useState('');

  // register fields
  const [rName, setRName] = useState('');
  const [rEmail, setREmail] = useState('');
  const [rPassword, setRPassword] = useState('');
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [showRegisterPassword, setShowRegisterPassword] = useState(false);

  if (!isAuthOpen) return null;

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(lEmail, lPassword);
      setSuccess('Welcome back! 🎉');
      setTimeout(closeAuth, 1000);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Unable to sign in');
    } finally {
      setLoading(false);
    }
  }

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    if (rPassword.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }
    setLoading(true);
    try {
      await register(rName, rEmail, rPassword);
      setSuccess(`Welcome, ${rName}! Account created 🎉`);
      setTimeout(closeAuth, 1000);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Unable to create account');
    } finally {
      setLoading(false);
    }
  }

  const switchTab = (t: 'login' | 'register') => {
    setTab(t);
    setError('');
    setSuccess('');
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-[60] bg-foreground/40 backdrop-blur-sm"
        onClick={closeAuth}
        aria-hidden="true"
      />

      {/* Modal */}
      <div
        className="fixed inset-0 z-[61] flex items-center justify-center p-4"
        role="dialog"
        aria-modal="true"
        aria-label={tab === 'login' ? 'Sign in' : 'Create account'}
      >
        <div className="w-full max-w-sm bg-background border border-border rounded-2xl shadow-xl overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-border">
            <div>
              <h2 className="font-display text-xl font-semibold italic text-foreground">
                {tab === 'login' ? 'Welcome back' : 'Create account'}
              </h2>
              <p className="text-[11px] tracking-[0.15em] uppercase text-muted-foreground mt-0.5">
                {tab === 'login' ? 'Sign in to your account' : 'Join Madhav Fashion Studio'}
              </p>
            </div>
            <button
              onClick={closeAuth}
              className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
              aria-label="Close"
            >
              <Icon name="XMarkIcon" size={16} variant="outline" />
            </button>
          </div>

          {/* Tab switcher */}
          <div className="flex border-b border-border">
            <button
              onClick={() => switchTab('login')}
              className={`flex-1 py-3 text-[11px] font-bold uppercase tracking-[0.15em] transition-colors border-b-2 ${
                tab === 'login'
                  ? 'text-foreground border-accent'
                  : 'text-muted-foreground border-transparent hover:text-foreground'
              }`}
            >
              Sign In
            </button>
            <button
              onClick={() => switchTab('register')}
              className={`flex-1 py-3 text-[11px] font-bold uppercase tracking-[0.15em] transition-colors border-b-2 ${
                tab === 'register'
                  ? 'text-foreground border-accent'
                  : 'text-muted-foreground border-transparent hover:text-foreground'
              }`}
            >
              Register
            </button>
          </div>

          {/* Body */}
          <div className="px-6 py-5">
            {/* Error / Success */}
            {error && (
              <div className="mb-4 px-4 py-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-[13px] flex items-start gap-2">
                <Icon
                  name="ExclamationCircleIcon"
                  size={16}
                  variant="outline"
                  className="mt-0.5 flex-shrink-0"
                />
                {error}
              </div>
            )}
            {success && (
              <div className="mb-4 px-4 py-3 rounded-lg bg-green-50 border border-green-200 text-green-700 text-[13px] flex items-center gap-2">
                <Icon name="CheckCircleIcon" size={16} variant="outline" />
                {success}
              </div>
            )}

            {/* LOGIN FORM */}
            {tab === 'login' && (
              <form onSubmit={handleLogin} className="space-y-4" noValidate>
                <div>
                  <label className="block text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    value={lEmail}
                    onChange={(e) => setLEmail(e.target.value)}
                    placeholder="you@email.com"
                    required
                    autoComplete="email"
                    className="w-full bg-secondary border border-border rounded-lg px-4 py-3 text-[14px] text-foreground placeholder:text-muted-foreground outline-none focus:border-accent transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground mb-2">
                    Password
                  </label>
                  <input
                    type={showLoginPassword ? 'text' : 'password'}
                    value={lPassword}
                    onChange={(e) => setLPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    autoComplete="current-password"
                    className="w-full bg-secondary border border-border rounded-lg px-4 py-3 pr-16 text-[14px] text-foreground placeholder:text-muted-foreground outline-none focus:border-accent transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowLoginPassword((value) => !value)}
                    className="relative float-right -mt-8 mr-3 text-muted-foreground hover:text-foreground"
                    aria-label={showLoginPassword ? 'Hide password' : 'Show password'}
                  >
                    {
                      <Icon
                        name={showLoginPassword ? 'EyeSlashIcon' : 'EyeIcon'}
                        size={17}
                        variant="outline"
                      />
                    }
                  </button>
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 bg-foreground text-primary-foreground text-[11px] font-bold uppercase tracking-[0.18em] rounded-lg hover:bg-accent transition-colors flex items-center justify-content-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-2 w-full">
                      <span className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                      Signing In…
                    </span>
                  ) : (
                    <span className="flex items-center justify-center gap-2 w-full">
                      Sign In
                      <Icon name="ArrowRightIcon" size={14} variant="outline" />
                    </span>
                  )}
                </button>
              </form>
            )}

            {/* REGISTER FORM */}
            {tab === 'register' && (
              <form onSubmit={handleRegister} className="space-y-4" noValidate>
                <div>
                  <label className="block text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground mb-2">
                    Full Name
                  </label>
                  <input
                    type="text"
                    value={rName}
                    onChange={(e) => setRName(e.target.value)}
                    placeholder="Priya Sharma"
                    required
                    autoComplete="name"
                    className="w-full bg-secondary border border-border rounded-lg px-4 py-3 text-[14px] text-foreground placeholder:text-muted-foreground outline-none focus:border-accent transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    value={rEmail}
                    onChange={(e) => setREmail(e.target.value)}
                    placeholder="you@email.com"
                    required
                    autoComplete="email"
                    className="w-full bg-secondary border border-border rounded-lg px-4 py-3 text-[14px] text-foreground placeholder:text-muted-foreground outline-none focus:border-accent transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground mb-2">
                    Password
                  </label>
                  <input
                    type={showRegisterPassword ? 'text' : 'password'}
                    value={rPassword}
                    onChange={(e) => setRPassword(e.target.value)}
                    placeholder="Min 6 characters"
                    required
                    autoComplete="new-password"
                    className="w-full bg-secondary border border-border rounded-lg px-4 py-3 pr-16 text-[14px] text-foreground placeholder:text-muted-foreground outline-none focus:border-accent transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowRegisterPassword((value) => !value)}
                    className="relative float-right -mt-8 mr-3 text-muted-foreground hover:text-foreground"
                    aria-label={showRegisterPassword ? 'Hide password' : 'Show password'}
                  >
                    {
                      <Icon
                        name={showRegisterPassword ? 'EyeSlashIcon' : 'EyeIcon'}
                        size={17}
                        variant="outline"
                      />
                    }
                  </button>
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 bg-foreground text-primary-foreground text-[11px] font-bold uppercase tracking-[0.18em] rounded-lg hover:bg-accent transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <span className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                      Creating Account…
                    </span>
                  ) : (
                    <span className="flex items-center justify-center gap-2">
                      Create Account
                      <Icon name="ArrowRightIcon" size={14} variant="outline" />
                    </span>
                  )}
                </button>
              </form>
            )}
          </div>

          {/* Footer note */}
          <div className="px-6 pb-5 text-center text-[11px] text-muted-foreground">
            {tab === 'login' ? (
              <>
                No account?{' '}
                <button
                  onClick={() => switchTab('register')}
                  className="text-accent font-semibold hover:underline"
                >
                  Register free
                </button>
              </>
            ) : (
              <>
                Already have an account?{' '}
                <button
                  onClick={() => switchTab('login')}
                  className="text-accent font-semibold hover:underline"
                >
                  Sign in
                </button>
              </>
            )}
            <div className="mt-4 pt-4 border-t border-border">
              <Link href="/shop-holder" className="text-accent font-semibold hover:underline">
                Shop holder? Admin sign in
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
