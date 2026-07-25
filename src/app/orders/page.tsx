'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { useAuth } from '@/context/AuthContext';
import { apiFetch, type ApiProduct } from '@/lib/api';
import { useCurrency } from '@/context/CurrencyContext';
import { CartProvider } from '@/context/CartContext';

type Order = {
  id: number;
  status: string;
  total: number;
  created_at: string;
  items: { quantity: number; unit_price: number; product?: ApiProduct }[];
};
function OrdersContent() {
  const { user } = useAuth();
  const { formatCurrency } = useCurrency();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  useEffect(() => {
    if (!user) return;
    apiFetch<Order[]>('/orders/mine')
      .then(setOrders)
      .catch((err) => setError(err instanceof Error ? err.message : 'Unable to load orders'))
      .finally(() => setLoading(false));
  }, [user]);
  if (!user)
    return (
      <>
        <Header />
        <main className="catalog-empty">
          <h1>Sign in to view your orders</h1>
          <Link href="/customer-login?tab=login" className="market-button">
            Sign in
          </Link>
        </main>
        <Footer />
      </>
    );
  return (
    <>
      <Header />
      <main className="orders-page">
        <div className="account-breadcrumb">
          <Link href="/">Home</Link> / Order history
        </div>
        <div className="orders-heading">
          <div>
            <p className="eyebrow">Your account</p>
            <h1>Order history</h1>
          </div>
          <Link href="/products" className="market-button">
            Shop fashion
          </Link>
        </div>
        {loading ? (
          <div className="catalog-empty">Loading your orders...</div>
        ) : error ? (
          <div className="catalog-empty">{error}</div>
        ) : orders.length === 0 ? (
          <div className="catalog-empty">
            <h2>No orders yet</h2>
            <p>When you place a fashion order, it will appear here.</p>
            <Link href="/products" className="market-button">
              Explore fashion
            </Link>
          </div>
        ) : (
          <div className="order-list">
            {orders.map((order) => (
              <article key={order.id} className="order-card">
                <div className="order-card-head">
                  <div>
                    <b>Order #{order.id}</b>
                    <span>Placed {new Date(order.created_at).toLocaleDateString('en-IN')}</span>
                  </div>
                  <strong className={`order-status status-${order.status}`}>{order.status}</strong>
                  <b>{formatCurrency(order.total)}</b>
                </div>
                <div className="order-items">
                  {order.items.map((item, index) => (
                    <div key={`${order.id}-${index}`}>
                      <img
                        src={item.product?.images?.[0] || '/assets/images/no_image.png'}
                        alt=""
                      />
                      <span>
                        {item.product?.name || 'Fashion item'} × {item.quantity}
                      </span>
                      <b>{formatCurrency(item.unit_price * item.quantity)}</b>
                    </div>
                  ))}
                </div>
              </article>
            ))}
          </div>
        )}
      </main>
      <Footer />
    </>
  );
}

export default function OrdersPage() {
  return (
    <CartProvider>
      <OrdersContent />
    </CartProvider>
  );
}
