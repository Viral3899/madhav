'use client';

import React, { FormEvent, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { apiFetch, type ApiProduct } from '@/lib/api';
import { currencyOptions, useCurrency } from '@/context/CurrencyContext';

export default function SellerDashboard() {
  const { user, token, logout } = useAuth();
  const { currency, setCurrency, toBaseCurrency, formatCurrency } = useCurrency();
  const router = useRouter();
  const [products, setProducts] = useState<ApiProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [message, setMessage] = useState('');
  const [form, setForm] = useState({ sku: '', name: '', price: '', stock: '0', image: '' });

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

  async function addProduct(event: FormEvent) {
    event.preventDefault();
    setMessage('');
    try {
      const saved = await apiFetch<ApiProduct>('/products', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          sku: form.sku,
          name: form.name,
          category: 'fashion',
          price: toBaseCurrency(Number(form.price)),
          stock: Number(form.stock),
          images: form.image ? [form.image] : [],
          description: '',
          colors: [],
          sizes: [],
        }),
      });
      setProducts((current) => [...current, saved]);
      setForm({ sku: '', name: '', price: '', stock: '0', image: '' });
      setMessage('Product added successfully');
      setShowForm(false);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Unable to add product');
    }
  }

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
          <button className="seller-primary" type="button" onClick={() => setShowForm(true)}>
            Add fashion product
          </button>
        </div>
        {showForm && (
          <form className="seller-panel seller-product-form" onSubmit={addProduct}>
            <h2>Add fashion product</h2>
            <input
              required
              placeholder="SKU"
              value={form.sku}
              onChange={(e) => setForm({ ...form, sku: e.target.value })}
            />
            <input
              required
              placeholder="Product name"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
            <label className="seller-price-field">
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value as typeof currency)}
                aria-label="Product currency"
              >
                {currencyOptions.map((item) => (
                  <option key={item.code} value={item.code}>
                    {item.code}
                  </option>
                ))}
              </select>
              <input
                required
                type="number"
                min="0"
                placeholder="Price"
                value={form.price}
                onChange={(e) => setForm({ ...form, price: e.target.value })}
              />
            </label>
            <input
              required
              type="number"
              min="0"
              placeholder="Stock"
              value={form.stock}
              onChange={(e) => setForm({ ...form, stock: e.target.value })}
            />
            <input
              type="url"
              placeholder="Image URL (optional)"
              value={form.image}
              onChange={(e) => setForm({ ...form, image: e.target.value })}
            />
            <button className="seller-primary" type="submit">
              Save product
            </button>
            <button className="seller-cancel" type="button" onClick={() => setShowForm(false)}>
              Cancel
            </button>
          </form>
        )}
        {message && <p className="seller-message">{message}</p>}
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
                  <strong>{formatCurrency(product.price)}</strong>
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
