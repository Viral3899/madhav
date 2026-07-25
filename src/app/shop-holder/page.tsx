'use client';

import { FormEvent, useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';

export default function ShopHolderPage() {
  const { user, login, registerShopHolder, logout } = useAuth();
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('admin@madhavfashionstudio.com');
  const [password, setPassword] = useState('admin123');
  const [showPassword, setShowPassword] = useState(false);
  const [setupKey, setSetupKey] = useState('madhav-shop-holder-setup');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => { if (user?.role === 'seller') window.location.href = '/seller'; }, [user]);

  if (user?.role === 'admin') return <main className="min-h-screen grid place-items-center p-6"><div className="text-center"><p className="text-xs uppercase tracking-widest text-muted-foreground mb-3">Admin account</p><h1 className="font-display text-4xl italic mb-4">Shop holder signed in</h1><div className="flex flex-col sm:flex-row gap-3 justify-center"><Link className="btn-primary rounded-sm" href="/admin">Open admin dashboard</Link><button className="btn-outline rounded-sm" onClick={() => { logout(); window.location.href = '/'; }}>Sign out</button></div></div></main>;

  async function submit(event: FormEvent) {
    event.preventDefault();
    setError(''); setBusy(true);
    try {
      if (mode === 'login') await login(email, password);
      else await registerShopHolder(name, email, password, setupKey);
      const currentUser = JSON.parse(localStorage.getItem('sz_user') || 'null');
      window.location.href = currentUser?.role === 'admin' ? '/admin' : '/seller';
    } catch (err) { setError(err instanceof Error ? err.message : 'Unable to continue'); }
    finally { setBusy(false); }
  }

  return <main className="min-h-screen bg-secondary/40 grid place-items-center p-6"><div className="w-full max-w-md bg-background border border-border rounded-2xl p-7 shadow-xl">
    <Link href="/" className="text-xs uppercase tracking-widest text-muted-foreground">Madhav Fashion Studio</Link>
    <h1 className="font-display text-4xl italic mt-8 mb-2">Shop holder {mode === 'login' ? 'sign in' : 'registration'}</h1>
    <p className="text-sm text-muted-foreground mb-7">Manage products, prices, stock, and orders.</p>
    <div className="flex border-b border-border mb-6"><button onClick={() => setMode('login')} className={`flex-1 py-3 text-xs uppercase tracking-widest border-b-2 ${mode === 'login' ? 'border-accent' : 'border-transparent text-muted-foreground'}`}>Sign in</button><button onClick={() => setMode('register')} className={`flex-1 py-3 text-xs uppercase tracking-widest border-b-2 ${mode === 'register' ? 'border-accent' : 'border-transparent text-muted-foreground'}`}>Register</button></div>
    <form onSubmit={submit} className="space-y-4">
      {mode === 'register' && <input required value={name} onChange={e => setName(e.target.value)} placeholder="Shop holder name" className="w-full checkout-input" />}
      <input required type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="Email" className="w-full checkout-input" />
      <div className="relative"><input required minLength={6} type={showPassword ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} placeholder="Password" className="w-full checkout-input pr-14" /><button type="button" onClick={() => setShowPassword(value => !value)} className="absolute right-0 bottom-2 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">{showPassword ? 'Hide' : 'Show'}</button></div>
      {mode === 'register' && <input required value={setupKey} onChange={e => setSetupKey(e.target.value)} placeholder="Shop-holder setup key" className="w-full checkout-input" />}
      {error && <p className="text-sm text-red-600">{error}</p>}
      <button disabled={busy} className="btn-primary w-full justify-center rounded-sm">{busy ? 'Please wait...' : mode === 'login' ? 'Sign in as shop holder' : 'Create shop-holder account'}</button>
    </form>
    <p className="text-xs text-muted-foreground mt-6">Customers should use the normal sign-in/register controls on the storefront.</p>
    <div className="flex justify-between gap-4 text-xs text-muted-foreground mt-6"><Link href="/" className="hover:text-foreground">Back to store</Link><span>Seller access</span></div>
  </div></main>;
}
