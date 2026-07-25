'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { useAuth } from '@/context/AuthContext';
import { CartProvider } from '@/context/CartContext';

function AccountSettingsContent() {
  const { user, updateProfile, logout } = useAuth();
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  useEffect(() => {
    if (!user) router.replace('/customer-login?tab=login');
    else {
      setName(user.name);
      setEmail(user.email);
    }
  }, [router, user]);
  if (!user) return <main className="catalog-empty">Opening account settings...</main>;
  async function save(event: React.FormEvent) {
    event.preventDefault();
    setMessage('');
    setError('');
    try {
      await updateProfile(name, email);
      setMessage('Account details updated.');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to update account');
    }
  }
  return (
    <>
      <Header />
      <main className="account-page">
        <div className="account-breadcrumb">
          <Link href="/">Home</Link> / Account settings
        </div>
        <div className="account-layout">
          <aside>
            <p className="eyebrow">Your account</p>
            <h1>Account settings</h1>
            <Link href="/orders">Order history</Link>
            <Link href="/wishlist">Wishlist</Link>
            <button
              onClick={() => {
                logout();
                window.location.href = '/';
              }}
            >
              Sign out
            </button>
          </aside>
          <section className="account-card">
            <p className="eyebrow">Profile</p>
            <h2>Personal information</h2>
            <p className="account-muted">
              Update the name and email used for your Madhav Fashion Studio account.
            </p>
            <form onSubmit={save}>
              <label>
                Full name
                <input value={name} onChange={(e) => setName(e.target.value)} required />
              </label>
              <label>
                Email address
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </label>
              {message && <p className="account-success">{message}</p>}
              {error && <p className="account-error">{error}</p>}
              <button className="market-button">Save changes</button>
            </form>
          </section>
        </div>
      </main>
      <Footer />
    </>
  );
}

export default function AccountSettingsPage() {
  return (
    <CartProvider>
      <AccountSettingsContent />
    </CartProvider>
  );
}
