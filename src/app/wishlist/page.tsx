'use client';

import React from 'react';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Icon from '@/components/ui/AppIcon';
import { CartProvider, useCart } from '@/context/CartContext';
import { useCurrency } from '@/context/CurrencyContext';
import { useWishlist } from '@/context/WishlistContext';

function WishlistContent() {
  const { items, remove } = useWishlist();
  const { addItem } = useCart();
  const { formatCurrency } = useCurrency();
  return (
    <main className="wishlist-page">
      <div className="catalog-breadcrumb">
        <Link href="/">Home</Link>
        <Icon name="ChevronRightIcon" size={13} />
        <span>Wishlist</span>
      </div>
      <div className="wishlist-heading">
        <div>
          <p className="eyebrow">Saved fashion</p>
          <h1>Your wishlist</h1>
          <p>
            {items.length} saved {items.length === 1 ? 'item' : 'items'}
          </p>
        </div>
        <Link href="/products" className="market-button">
          Continue shopping
        </Link>
      </div>
      {items.length === 0 ? (
        <div className="catalog-empty">
          <h2>Your wishlist is waiting for a favourite</h2>
          <Link href="/products" className="market-button">
            Explore fashion
          </Link>
        </div>
      ) : (
        <div className="wishlist-grid">
          {items.map((item) => (
            <article key={item.id} className="wishlist-card">
              <Link href={`/products/${item.id}`}>
                <img src={item.image} alt={item.name} />
              </Link>
              <button onClick={() => remove(item.id)} className="wishlist-remove">
                Remove
              </button>
              <h2>{item.name}</h2>
              <p>{formatCurrency(item.price)}</p>
              <button
                className="catalog-add"
                onClick={() => {
                  addItem({ ...item });
                  remove(item.id);
                }}
              >
                Move to cart
              </button>
            </article>
          ))}
        </div>
      )}
    </main>
  );
}

export default function WishlistPage() {
  return (
    <CartProvider>
      <Header />
      <WishlistContent />
      <Footer />
    </CartProvider>
  );
}
