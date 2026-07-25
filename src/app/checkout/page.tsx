import React from 'react';
import { CartProvider } from '@/context/CartContext';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import CheckoutClient from '@/app/checkout/component/CheckoutClient';

export const metadata = {
  title: 'Checkout — Madhav Fashion Studio',
  description: 'Complete your Madhav Fashion Studio order. Secure checkout with fast shipping.',
};

export default function CheckoutPage() {
  return (
    <CartProvider>
      <Header />
      <main className="pt-24 min-h-screen">
        <CheckoutClient />
      </main>
      <Footer />
    </CartProvider>
  );
}
