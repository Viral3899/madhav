'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { apiFetch, type ApiProduct } from '@/lib/api';

export default function SellerDashboard() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [products, setProducts] = useState<ApiProduct[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    if (user.role !== 'seller') {
      router.replace(user.role === 'admin' ? '/admin' : '/shop-holder');
      return;
    }
    apiFetch<ApiProduct[]>('/products?limit=100')
      .then(setProducts)
      .finally(() => setLoading(false));
  }, [router, user]);

  if (!user || user.role !== 'seller')
    return (
      <main className="min-h-screen grid place-items-center">Opening seller dashboard...</main>
    );
  const totalStock = products.reduce((sum, product) => sum + product.stock, 0);
  const lowStock = products.filter((product) => product.stock < 20).length;

  return (
    <main className="seller-dashboard">
      <header className="seller-header">
        <div>
          <Link href="/" className="seller-brand">
            Madhav Fashion Studio
          </Link>
          <p>Seller Central</p>
        </div>
        <div className="seller-actions">
          <span>
            Signed in as <b>{user.name}</b>
          </span>
          <button
            onClick={() => {
              logout();
              window.location.href = '/';
            }}
          >
            Sign out
          </button>
        </div>
      </header>
      <section className="seller-content">
        <div className="seller-welcome">
          <div>
            <p className="eyebrow">Seller workspace</p>
            <h1>Good to see you, {user.name.split(' ')[0]}.</h1>
            <p>Manage your fashion catalogue and monitor stock from one place.</p>
          </div>
          <button
            className="seller-primary"
            onClick={() =>
              alert('Product creation is available to administrators in this local build.')
            }
          >
            Add fashion product
          </button>
        </div>
        <div className="seller-stats">
          <div>
            <span>Live products</span>
            <b>{products.length}</b>
          </div>
          <div>
            <span>Total units in stock</span>
            <b>{totalStock}</b>
          </div>
          <div>
            <span>Low stock alerts</span>
            <b>{lowStock}</b>
          </div>
          <div>
            <span>Store rating</span>
            <b>4.8 ★</b>
          </div>
        </div>
        <section className="seller-panel">
          <div className="seller-panel-heading">
            <div>
              <h2>Your fashion catalogue</h2>
              <p>Review live prices, availability, and product performance.</p>
            </div>
            <Link href="/products">View storefront</Link>
          </div>
          {loading ? (
            <p className="seller-empty">Loading catalogue...</p>
          ) : (
            <div className="seller-products">
              {products.map((product) => (
                <div className="seller-product" key={product.id}>
                  <img src={product.images[0] || '/assets/images/no_image.png'} alt="" />
                  <div>
                    <h3>{product.name}</h3>
                    <p>
                      {product.specs?.Gender || 'Fashion'} · SKU {product.sku}
                    </p>
                  </div>
                  <strong>₹{product.price.toLocaleString('en-IN')}</strong>
                  <span className={product.stock < 20 ? 'seller-low' : 'seller-in-stock'}>
                    {product.stock} units
                  </span>
                </div>
              ))}
            </div>
          )}
        </section>
      </section>
    </main>
  );
}
