'use client';

import React from 'react';
import Link from 'next/link';
import { useCart } from '@/context/CartContext';
import Icon from '@/components/ui/AppIcon';
// Change:
// To:
import AppImage from '@/components/ui/AppImage';
import { useCurrency } from '@/context/CurrencyContext';

export default function CartDrawer() {
  const { items, isCartOpen, closeCart, removeItem, updateQuantity, subtotal, totalItems } =
    useCart();
  const { formatCurrency } = useCurrency();

  return (
    <>
      {/* Backdrop */}
      {isCartOpen && (
        <div
          className="fixed inset-0 z-50 bg-foreground/30 backdrop-blur-sm"
          onClick={closeCart}
          aria-hidden="true"
        />
      )}
      {/* Drawer */}
      <div
        className={`cart-drawer fixed right-0 top-0 bottom-0 z-50 w-full sm:max-w-md bg-background flex flex-col shadow-2xl ${
          isCartOpen ? 'open' : ''
        }`}
        role="dialog"
        aria-label="Shopping cart"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 sm:px-8 py-5 sm:py-6 border-b border-border">
          <div>
            <h2 className="font-display text-xl font-semibold italic">Your Bag</h2>
            <p className="text-[11px] tracking-[0.2em] uppercase text-muted-foreground mt-0.5">
              {totalItems} {totalItems === 1 ? 'item' : 'items'}
            </p>
          </div>
          <button
            onClick={closeCart}
            className="text-muted-foreground hover:text-foreground transition-colors p-2"
            aria-label="Close cart"
          >
            <Icon name="XMarkIcon" size={22} variant="outline" />
          </button>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto px-5 sm:px-8 py-5 sm:py-6 space-y-5 sm:space-y-6">
          {items?.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full gap-6 text-center">
              <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center">
                <Icon
                  name="ShoppingBagIcon"
                  size={32}
                  variant="outline"
                  className="text-muted-foreground"
                />
              </div>
              <div>
                <p className="font-display text-xl italic text-foreground">Your bag is empty</p>
                <p className="text-sm text-muted-foreground mt-2">Add something you love</p>
              </div>
              <button onClick={closeCart} className="btn-outline text-sm">
                Continue Shopping
              </button>
            </div>
          ) : (
            items?.map((item) => (
              <div key={`${item?.id}-${item?.size}`} className="flex gap-4">
                <div className="w-20 h-24 rounded-lg overflow-hidden flex-shrink-0 bg-secondary">
                  <AppImage
                    src={item?.image}
                    alt={`${item?.name} in ${item?.color}`}
                    width={80}
                    height={96}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-sm font-semibold text-foreground leading-tight">
                        {item?.name}
                      </h3>
                      <p className="text-[11px] tracking-wider uppercase text-muted-foreground mt-0.5">
                        {item?.color} · {item?.size}
                      </p>
                    </div>
                    <button
                      onClick={() => removeItem(item?.id, item?.size)}
                      className="text-muted-foreground hover:text-foreground transition-colors ml-2 flex-shrink-0"
                      aria-label={`Remove ${item?.name}`}
                    >
                      <Icon name="XMarkIcon" size={16} variant="outline" />
                    </button>
                  </div>
                  <div className="flex items-center justify-between mt-3">
                    <div className="flex items-center border border-border rounded">
                      <button
                        onClick={() => updateQuantity(item?.id, item?.size, item?.quantity - 1)}
                        className="w-8 h-8 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
                        aria-label="Decrease quantity"
                      >
                        <Icon name="MinusIcon" size={14} variant="outline" />
                      </button>
                      <span className="w-8 text-center text-sm font-semibold">
                        {item?.quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(item?.id, item?.size, item?.quantity + 1)}
                        className="w-8 h-8 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
                        aria-label="Increase quantity"
                      >
                        <Icon name="PlusIcon" size={14} variant="outline" />
                      </button>
                    </div>
                    <span className="price-tag">
                      {formatCurrency(item?.price * item?.quantity)}
                    </span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        {items?.length > 0 && (
          <div className="px-5 sm:px-8 py-5 sm:py-6 border-t border-border space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-[11px] tracking-[0.2em] uppercase text-muted-foreground">
                Subtotal
              </span>
              <span className="font-display text-xl italic font-semibold">
                {formatCurrency(subtotal)}
              </span>
            </div>
            <p className="text-[11px] text-muted-foreground">
              Shipping & taxes calculated at checkout
            </p>
            <Link
              href="/checkout"
              onClick={closeCart}
              className="btn-primary w-full justify-center rounded-sm"
            >
              Checkout
              <Icon name="ArrowRightIcon" size={16} variant="outline" />
            </Link>
            <button
              onClick={closeCart}
              className="w-full text-center text-[11px] tracking-[0.2em] uppercase text-muted-foreground hover:text-foreground transition-colors py-2"
            >
              Continue Shopping
            </button>
          </div>
        )}
      </div>
    </>
  );
}
