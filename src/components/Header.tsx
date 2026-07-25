'use client';
import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Icon from '@/components/ui/AppIcon';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import CartDrawer from '@/components/CartDrawer';
import AuthModal from '@/components/AuthModal';
import { countryOptions, useCurrency } from '@/context/CurrencyContext';

export default function Header() {
  const { totalItems, openCart } = useCart();
  const { user, logout } = useAuth();
  const { country, setCountry } = useCurrency();
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [menuOpen, setMenuOpen] = useState(false);
  function submit(event: React.FormEvent) {
    event.preventDefault();
    router.push(`/products${query ? `?q=${encodeURIComponent(query)}` : ''}`);
  }
  return (
    <>
      <header className="market-header">
        <div className="header-top">
          <button
            className="mobile-menu"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Toggle menu"
          >
            <Icon name={menuOpen ? 'XMarkIcon' : 'Bars3Icon'} size={23} />
          </button>
          <Link href="/" className="market-logo">
            <span className="logo-mark">M</span>
            <span>
              Madhav Fashion Studio<small>.in</small>
            </span>
          </Link>
          <div className="deliver">
            <Icon name="MapPinIcon" size={19} />
            <span>
              Deliver to
              <select
                aria-label="Delivery country"
                className="country-select"
                value={country}
                onChange={(event) => setCountry(event.target.value as typeof country)}
              >
                {countryOptions.map((item) => (
                  <option key={item}>{item}</option>
                ))}
              </select>
            </span>
          </div>
          <form className="market-search" onSubmit={submit}>
            <select aria-label="Search fashion department">
              <option>All fashion</option>
              <option>Women</option>
              <option>Men</option>
              <option>Kids</option>
              <option>Footwear</option>
            </select>
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search dresses, kurtis, shirts..."
            />
            <button aria-label="Search">
              <Icon name="MagnifyingGlassIcon" size={21} />
            </button>
          </form>
          <div className="header-actions">
            <Link href="/wishlist" className="wishlist-link" aria-label="Wishlist" title="Wishlist">
              ♥
            </Link>
            <Link
              href={user ? '/account/settings' : '/customer-login?tab=login'}
              className="account-action"
            >
              <small>Hello, {user ? user.name.split(' ')[0] : 'sign in'}</small>
              <b>Account & Lists</b>
            </Link>
            <Link
              href={user ? '/account/settings' : '/customer-login?tab=login'}
              className="settings-link"
              aria-label="Settings"
              title="Settings"
            >
              <Icon name="Cog6ToothIcon" size={19} variant="outline" />
            </Link>
            {user && (
              <button className="logout-link" onClick={logout}>
                Sign out
              </button>
            )}
            <Link href={user ? '/orders' : '/customer-login?tab=login'} className="orders-action">
              <small>Returns</small>
              <b>& Orders</b>
            </Link>
            <button
              className="cart-action"
              onClick={openCart}
              aria-label={`Cart, ${totalItems} items`}
            >
              <Icon name="ShoppingCartIcon" size={28} />
              <b>{totalItems}</b>
              <span>Cart</span>
            </button>
          </div>
        </div>
        <nav className="market-nav">
          <div className="nav-inner">
            <button onClick={() => setMenuOpen(!menuOpen)}>
              <Icon name="Bars3Icon" size={19} /> All fashion
            </button>
            <Link href="/products">Today&apos;s Deals</Link>
            <Link href="/products">Women</Link>
            <Link href="/products">Men</Link>
            <Link href="/products">Kids</Link>
            <Link href="/products">Footwear</Link>
            <Link href="/products">Accessories</Link>
            <span className="nav-spacer" />
            <span>
              Madhav Plus <Icon name="ChevronDownIcon" size={14} />
            </span>
          </div>
        </nav>
      </header>
      {menuOpen && (
        <div className="mobile-nav">
          <Link href="/products">Today&apos;s Deals</Link>
          <Link href="/products">All fashion</Link>
          <Link href="/products">Women</Link>
          <Link href="/products">Men</Link>
          <Link href="/products">Kids</Link>
          <Link href="/account/settings">Your account</Link>
          <Link href="/orders">Your orders</Link>
        </div>
      )}
      <CartDrawer />
      <AuthModal />
    </>
  );
}
