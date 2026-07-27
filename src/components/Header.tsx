'use client';
import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Icon from '@/components/ui/AppIcon';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import CartDrawer from '@/components/CartDrawer';
import AuthModal from '@/components/AuthModal';

export default function Header() {
  const { totalItems, openCart } = useCart();
  const { user } = useAuth();
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [department, setDepartment] = useState('all');
  const [menuOpen, setMenuOpen] = useState(false);
  function submit(event: React.FormEvent) {
    event.preventDefault();
    const params = new URLSearchParams();
    if (query.trim()) params.set('q', query.trim());
    if (department !== 'all') params.set('department', department);
    const search = params.toString();
    router.push(`/products${search ? `?${search}` : ''}`);
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
          <form className="market-search" onSubmit={submit}>
            <select
              aria-label="Search fashion department"
              value={department}
              onChange={(event) => setDepartment(event.target.value)}
            >
              <option value="all">All fashion</option>
              <option value="women">Women</option>
              <option value="men">Men</option>
              <option value="kids">Kids</option>
              <option value="footwear">Footwear</option>
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
            <Link href="/products" className="nav-all-fashion">
              All fashion
            </Link>
            <Link href="/products">Today&apos;s Deals</Link>
            <Link href="/products?department=women">Women</Link>
            <Link href="/products?department=men">Men</Link>
            <Link href="/products?department=kids">Kids</Link>
            <Link href="/products?department=footwear">Footwear</Link>
            <Link href="/products?department=accessories">Accessories</Link>
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
          <Link href="/products?department=women">Women</Link>
          <Link href="/products?department=men">Men</Link>
          <Link href="/products?department=kids">Kids</Link>
          <Link href="/account/settings">Your account</Link>
          <Link href="/orders">Your orders</Link>
        </div>
      )}
      <CartDrawer />
      <AuthModal />
    </>
  );
}
