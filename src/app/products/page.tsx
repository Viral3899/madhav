import React from 'react';
import { CartProvider } from '@/context/CartContext';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ProductsClient from '@/app/products/components/ProductsClient';

export const metadata = {
  title: 'Shop All — Madhav Fashion Studio',
  description:
    'Browse the full Madhav Fashion Studio collection. Everyday casual clothing for women and men — comfortable, affordable, and real.',
};

export default function ProductsPage() {
  return (
    <CartProvider>
      <Header />
      <main className="pt-8">
        <ProductsClient />
      </main>
      <Footer />
    </CartProvider>
  );
}
