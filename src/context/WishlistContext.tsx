'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';

export interface WishlistItem {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  image: string;
  size: string;
  color: string;
  category: string;
}
type WishlistContextValue = {
  items: WishlistItem[];
  isSaved: (id: string) => boolean;
  toggle: (item: WishlistItem) => void;
  remove: (id: string) => void;
};
const WishlistContext = createContext<WishlistContextValue | null>(null);

export function WishlistProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<WishlistItem[]>([]);
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => {
    try {
      const stored = localStorage.getItem('madhav_wishlist');
      if (stored) setItems(JSON.parse(stored));
    } catch {
      localStorage.removeItem('madhav_wishlist');
    } finally {
      setHydrated(true);
    }
  }, []);
  useEffect(() => {
    if (hydrated) localStorage.setItem('madhav_wishlist', JSON.stringify(items));
  }, [hydrated, items]);
  const toggle = (item: WishlistItem) =>
    setItems((current) =>
      current.some((saved) => saved.id === item.id)
        ? current.filter((saved) => saved.id !== item.id)
        : [...current, item]
    );
  return (
    <WishlistContext.Provider
      value={{
        items,
        isSaved: (id) => items.some((item) => item.id === id),
        toggle,
        remove: (id) => setItems((current) => current.filter((item) => item.id !== id)),
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  const context = useContext(WishlistContext);
  if (!context) throw new Error('useWishlist must be used within WishlistProvider');
  return context;
}
