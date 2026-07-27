'use client';

import { FormEvent, useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { apiFetch, type ApiProduct } from '@/lib/api';

export default function AdminPage() {
  const { user, token, logout } = useAuth();
  const [products, setProducts] = useState<ApiProduct[]>([]);
  const [editing, setEditing] = useState<ApiProduct | null>(null);
  const [message, setMessage] = useState('');
  const [form, setForm] = useState({
    sku: '',
    name: '',
    category: 'fashion',
    price: '',
    stock: '0',
    image: '',
  });

  useEffect(() => {
    if (user?.role === 'admin')
      apiFetch<ApiProduct[]>('/products?limit=100')
        .then(setProducts)
        .catch(() => setMessage('Unable to load products'));
  }, [user]);
  if (!user || user.role !== 'admin')
    return (
      <main className="min-h-screen grid place-items-center p-6">
        <div>
          <p className="mb-4">Shop-holder access required.</p>
          <Link href="/shop-holder" className="btn-primary rounded-sm">
            Shop holder sign in
          </Link>
        </div>
      </main>
    );
  const headers = { Authorization: `Bearer ${token}` };
  function startAdd() {
    setEditing(null);
    setForm({ sku: '', name: '', category: 'fashion', price: '', stock: '0', image: '' });
  }
  function startEdit(product: ApiProduct) {
    setEditing(product);
    setForm({
      sku: product.sku,
      name: product.name,
      category: product.category,
      price: String(product.price),
      stock: String(product.stock),
      image: product.images?.[0] || '',
    });
  }
  async function save(event: FormEvent) {
    event.preventDefault();
    setMessage('');
    try {
      const body = {
        name: form.name,
        category: 'fashion',
        price: Number(form.price),
        stock: Number(form.stock),
        images: form.image.trim() ? [form.image.trim()] : [],
        ...(editing ? {} : { sku: form.sku }),
        ...(editing ? {} : { description: '', colors: [], sizes: [] }),
      };
      const saved = await apiFetch<ApiProduct>(editing ? `/products/${editing.id}` : '/products', {
        method: editing ? 'PUT' : 'POST',
        headers,
        body: JSON.stringify(body),
      });
      setProducts((old) =>
        editing ? old.map((p) => (p.id === saved.id ? saved : p)) : [...old, saved]
      );
      setMessage('Saved successfully');
      startAdd();
    } catch (err) {
      setMessage(err instanceof Error ? err.message : 'Save failed');
    }
  }
  return (
    <main className="min-h-screen bg-secondary/30 p-6 sm:p-10">
      <div className="max-w-6xl mx-auto">
        <header className="flex flex-wrap justify-between items-center gap-4 mb-10">
          <div>
            <Link href="/" className="text-xs uppercase tracking-widest text-muted-foreground">
              Madhav Fashion Studio
            </Link>
            <h1 className="font-display text-5xl italic mt-3">Shop holder dashboard</h1>
          </div>
          <button onClick={logout} className="btn-outline rounded-sm">
            Sign out
          </button>
        </header>
        <div className="grid lg:grid-cols-[320px_1fr] gap-8">
          <form
            onSubmit={save}
            className="bg-background border border-border rounded-2xl p-6 space-y-4 h-fit"
          >
            <h2 className="font-display text-2xl italic">
              {editing ? 'Change product' : 'Add product'}
            </h2>
            {!editing && (
              <input
                required
                value={form.sku}
                onChange={(e) => setForm({ ...form, sku: e.target.value })}
                placeholder="SKU"
                className="w-full checkout-input"
              />
            )}
            <label className="price-field">
              <span>₹</span>
              <input
                required
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Fashion item name"
                className="w-full checkout-input"
              />
              <input
                required
                type="number"
                min="0"
                value={form.price}
                onChange={(e) => setForm({ ...form, price: e.target.value })}
                placeholder="Price"
                className="w-full checkout-input"
              />
            </label>
            <input
              required
              type="number"
              min="0"
              value={form.stock}
              onChange={(e) => setForm({ ...form, stock: e.target.value })}
              placeholder="Stock"
              className="w-full checkout-input"
            />
            <input
              required
              type="url"
              value={form.image}
              onChange={(e) => setForm({ ...form, image: e.target.value })}
              placeholder="Product image URL"
              className="w-full checkout-input"
            />
            {form.image && (
              <img
                src={form.image}
                alt="Product preview"
                className="w-full h-40 object-cover rounded-lg bg-secondary"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                }}
              />
            )}
            <input type="hidden" value="fashion" readOnly />
            <button className="btn-primary w-full justify-center rounded-sm">
              {editing ? 'Save price and image' : 'Add fashion item'}
            </button>
            {editing && (
              <button
                type="button"
                onClick={startAdd}
                className="btn-outline w-full justify-center rounded-sm"
              >
                Cancel
              </button>
            )}
            {message && <p className="text-sm text-muted-foreground">{message}</p>}
          </form>
          <section className="bg-background border border-border rounded-2xl overflow-hidden">
            <div className="p-6 border-b border-border">
              <h2 className="font-display text-2xl italic">Fashion products and prices</h2>
            </div>
            <div className="divide-y divide-border">
              {products.map((product) => (
                <div key={product.id} className="p-5 flex justify-between items-center gap-4">
                  <div className="flex items-center gap-3">
                    <img
                      src={product.images?.[0] || '/assets/images/no_image.png'}
                      alt=""
                      className="w-12 h-14 object-cover rounded"
                    />
                    <div>
                      <p className="font-semibold">{product.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {product.category} · {product.stock} in stock
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <strong>₹{product.price.toLocaleString('en-IN')}</strong>
                    <button
                      onClick={() => startEdit(product)}
                      className="btn-outline rounded-sm text-xs"
                    >
                      Edit
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
