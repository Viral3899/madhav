'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import AppImage from '@/components/ui/AppImage';
import Icon from '@/components/ui/AppIcon';
import { useCurrency } from '@/context/CurrencyContext';
import AppLogo from '@/components/ui/AppLogo';
import { useCart } from '@/context/CartContext';
import { apiFetch } from '@/lib/api';
interface FormData {
  email: string;
  firstName: string;
  lastName: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  country: string;
  cardNumber: string;
  cardExpiry: string;
  cardCvc: string;
  cardName: string;
  paymentMethod: 'card' | 'upi' | 'cod';
}

const SHIPPING_THRESHOLD = 499;
const SHIPPING_COST = 40;

export default function CheckoutClient() {
  const { items, subtotal, clearCart } = useCart();
  const { formatCurrency } = useCurrency();
  const [step, setStep] = useState<'form' | 'success'>('form');
  const [form, setForm] = useState<FormData>({
    email: '',
    firstName: '',
    lastName: '',
    address: '',
    city: '',
    state: '',
    zip: '',
    country: 'India',
    cardNumber: '',
    cardExpiry: '',
    cardCvc: '',
    cardName: '',
    paymentMethod: 'card',
  });
  const [errors, setErrors] = useState<Partial<FormData>>({});
  const [isProcessing, setIsProcessing] = useState(false);
  const [submitError, setSubmitError] = useState('');

  const shippingFree = subtotal >= SHIPPING_THRESHOLD;
  const shipping = shippingFree ? 0 : items.length > 0 ? SHIPPING_COST : 0;
  const total = subtotal + shipping;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name as keyof FormData]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const validate = () => {
    const newErrors: Partial<FormData> = {};
    if (!form.email.includes('@')) newErrors.email = 'Valid email required';
    if (!form.firstName.trim()) newErrors.firstName = 'Required';
    if (!form.lastName.trim()) newErrors.lastName = 'Required';
    if (!form.address.trim()) newErrors.address = 'Required';
    if (!form.city.trim()) newErrors.city = 'Required';
    if (!form.state.trim()) newErrors.state = 'Required';
    if (!form.zip.trim()) newErrors.zip = 'Required';
    if (form.paymentMethod === 'card') {
      if (form.cardNumber.replace(/\s/g, '').length < 16)
        newErrors.cardNumber = 'Valid card number required';
      if (!form.cardExpiry.includes('/')) newErrors.cardExpiry = 'MM/YY format';
      if (form.cardCvc.length < 3) newErrors.cardCvc = 'Required';
      if (!form.cardName.trim()) newErrors.cardName = 'Required';
    }
    return newErrors;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors = validate();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    setIsProcessing(true);
    setSubmitError('');
    try {
      await apiFetch('/orders', {
        method: 'POST',
        body: JSON.stringify({
          email: form.email,
          first_name: form.firstName,
          last_name: form.lastName,
          address: form.address,
          city: form.city,
          state: form.state,
          zip_code: form.zip,
          country: form.country,
          items: items.map((item) => ({
            product_id: Number(item.id),
            quantity: item.quantity,
            color: item.color,
            size: item.size,
          })),
        }),
      });
      clearCart();
      setStep('success');
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : 'Unable to place the order');
    } finally {
      setIsProcessing(false);
    }
  };

  if (step === 'success') {
    return (
      <div className="max-w-2xl mx-auto px-6 py-24 text-center">
        <div className="w-20 h-20 rounded-full bg-accent/10 flex items-center justify-center mx-auto mb-8">
          <Icon name="CheckCircleIcon" size={40} variant="outline" className="text-accent" />
        </div>
        <h1 className="font-display text-5xl font-light italic text-foreground mb-4">
          Order Confirmed!
        </h1>
        <p className="text-muted-foreground text-base mb-3 max-w-md mx-auto">
          Thanks {form.firstName}! Your order is on its way. You&apos;ll receive a confirmation at{' '}
          <span className="text-foreground font-medium">{form.email}</span>.
        </p>
        <p className="text-[11px] tracking-[0.2em] uppercase text-muted-foreground mb-10">
          Estimated delivery: 3–5 business days
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/" className="btn-primary rounded-sm">
            Continue Shopping
          </Link>
          <Link href="/products" className="btn-outline rounded-sm">
            Browse New Arrivals
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 pb-16 sm:pb-24">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-[11px] tracking-[0.2em] uppercase text-muted-foreground mb-8 sm:mb-10">
        <Link href="/" className="hover:text-foreground transition-colors">
          Home
        </Link>
        <Icon name="ChevronRightIcon" size={12} variant="outline" />
        <Link href="/products" className="hover:text-foreground transition-colors">
          Shop
        </Link>
        <Icon name="ChevronRightIcon" size={12} variant="outline" />
        <span className="text-foreground">Checkout</span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 sm:gap-12">
        {/* Form Column */}
        <div className="lg:col-span-7">
          <div className="flex items-center gap-2 sm:gap-3 mb-8 sm:mb-10">
            <AppLogo href="/" size={24} />
            <span className="font-display text-lg sm:text-2xl font-semibold tracking-[0.1em] sm:tracking-[0.15em] uppercase text-foreground">
              Madhav Fashion Studio
            </span>
          </div>

          <form onSubmit={handleSubmit} noValidate>
            {/* Contact */}
            <div className="mb-8 sm:mb-10">
              <h2 className="font-display text-2xl italic font-light text-foreground mb-6">
                Contact
              </h2>
              <div className="space-y-6">
                <div>
                  <input
                    type="email"
                    name="email"
                    value={form.email}
                    onChange={handleChange}
                    placeholder="Email address"
                    className="checkout-input"
                    autoComplete="email"
                  />
                  {errors.email && <p className="text-red-500 text-[11px] mt-1">{errors.email}</p>}
                </div>
              </div>
            </div>

            {/* Shipping */}
            <div className="mb-8 sm:mb-10">
              <h2 className="font-display text-2xl italic font-light text-foreground mb-6">
                Shipping
              </h2>
              <div className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                  <div>
                    <input
                      type="text"
                      name="firstName"
                      value={form.firstName}
                      onChange={handleChange}
                      placeholder="First name"
                      className="checkout-input"
                      autoComplete="given-name"
                    />
                    {errors.firstName && (
                      <p className="text-red-500 text-[11px] mt-1">{errors.firstName}</p>
                    )}
                  </div>
                  <div>
                    <input
                      type="text"
                      name="lastName"
                      value={form.lastName}
                      onChange={handleChange}
                      placeholder="Last name"
                      className="checkout-input"
                      autoComplete="family-name"
                    />
                    {errors.lastName && (
                      <p className="text-red-500 text-[11px] mt-1">{errors.lastName}</p>
                    )}
                  </div>
                </div>
                <div>
                  <input
                    type="text"
                    name="address"
                    value={form.address}
                    onChange={handleChange}
                    placeholder="Street address"
                    className="checkout-input"
                    autoComplete="street-address"
                  />
                  {errors.address && (
                    <p className="text-red-500 text-[11px] mt-1">{errors.address}</p>
                  )}
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
                  <div className="col-span-2">
                    <input
                      type="text"
                      name="city"
                      value={form.city}
                      onChange={handleChange}
                      placeholder="City"
                      className="checkout-input"
                      autoComplete="address-level2"
                    />
                    {errors.city && <p className="text-red-500 text-[11px] mt-1">{errors.city}</p>}
                  </div>
                  <div>
                    <input
                      type="text"
                      name="state"
                      value={form.state}
                      onChange={handleChange}
                      placeholder="State"
                      className="checkout-input"
                      autoComplete="address-level1"
                    />
                    {errors.state && (
                      <p className="text-red-500 text-[11px] mt-1">{errors.state}</p>
                    )}
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                  <div>
                    <input
                      type="text"
                      name="zip"
                      value={form.zip}
                      onChange={handleChange}
                      placeholder="ZIP code"
                      className="checkout-input"
                      autoComplete="postal-code"
                    />
                    {errors.zip && <p className="text-red-500 text-[11px] mt-1">{errors.zip}</p>}
                  </div>
                  <div>
                    <select
                      name="country"
                      value={form.country}
                      onChange={handleChange}
                      className="checkout-input cursor-pointer"
                    >
                      <option>India</option>
                      <option>United States</option>
                      <option>Canada</option>
                      <option>United Kingdom</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {/* Payment */}
            <div className="mb-8 sm:mb-10">
              <h2 className="font-display text-2xl italic font-light text-foreground mb-6">
                Payment
              </h2>
              <div className="border border-border rounded-xl p-4 sm:p-6 space-y-4 sm:space-y-6">
                <select
                  name="paymentMethod"
                  value={form.paymentMethod}
                  onChange={handleChange}
                  className="checkout-input cursor-pointer"
                >
                  <option value="card">Credit / Debit card</option>
                  <option value="upi">UPI (demo)</option>
                  <option value="cod">Cash on delivery</option>
                </select>
                {form.paymentMethod !== 'card' && (
                  <p className="text-xs text-muted-foreground">
                    {form.paymentMethod === 'upi'
                      ? 'UPI checkout is ready for provider integration.'
                      : 'Cash on delivery will be collected at delivery.'}
                  </p>
                )}
                {form.paymentMethod === 'card' && (
                  <>
                    <div className="flex items-center gap-2 text-[11px] tracking-[0.2em] uppercase text-muted-foreground">
                      <Icon name="LockClosedIcon" size={13} variant="outline" />
                      SSL Secured · Mock Payment
                    </div>
                    <div>
                      <input
                        type="text"
                        name="cardNumber"
                        value={form.cardNumber}
                        onChange={(e) => {
                          const v = e.target.value.replace(/\D/g, '').slice(0, 16);
                          const formatted = v.replace(/(\d{4})(?=\d)/g, '$1 ');
                          setForm((prev) => ({ ...prev, cardNumber: formatted }));
                        }}
                        placeholder="Card number"
                        className="checkout-input"
                        autoComplete="cc-number"
                        maxLength={19}
                      />
                      {errors.cardNumber && (
                        <p className="text-red-500 text-[11px] mt-1">{errors.cardNumber}</p>
                      )}
                    </div>
                    <div className="grid grid-cols-2 gap-4 sm:gap-6">
                      <div>
                        <input
                          type="text"
                          name="cardExpiry"
                          value={form.cardExpiry}
                          onChange={(e) => {
                            let v = e.target.value.replace(/\D/g, '').slice(0, 4);
                            if (v.length >= 2) v = v.slice(0, 2) + '/' + v.slice(2);
                            setForm((prev) => ({ ...prev, cardExpiry: v }));
                          }}
                          placeholder="MM / YY"
                          className="checkout-input"
                          autoComplete="cc-exp"
                          maxLength={5}
                        />
                        {errors.cardExpiry && (
                          <p className="text-red-500 text-[11px] mt-1">{errors.cardExpiry}</p>
                        )}
                      </div>
                      <div>
                        <input
                          type="text"
                          name="cardCvc"
                          value={form.cardCvc}
                          onChange={(e) => {
                            const v = e.target.value.replace(/\D/g, '').slice(0, 4);
                            setForm((prev) => ({ ...prev, cardCvc: v }));
                          }}
                          placeholder="CVC"
                          className="checkout-input"
                          autoComplete="cc-csc"
                          maxLength={4}
                        />
                        {errors.cardCvc && (
                          <p className="text-red-500 text-[11px] mt-1">{errors.cardCvc}</p>
                        )}
                      </div>
                    </div>
                    <div>
                      <input
                        type="text"
                        name="cardName"
                        value={form.cardName}
                        onChange={handleChange}
                        placeholder="Name on card"
                        className="checkout-input"
                        autoComplete="cc-name"
                      />
                      {errors.cardName && (
                        <p className="text-red-500 text-[11px] mt-1">{errors.cardName}</p>
                      )}
                    </div>
                  </>
                )}
              </div>
            </div>

            <button
              type="submit"
              disabled={isProcessing || items.length === 0}
              className={`btn-primary w-full justify-center rounded-sm text-sm py-5 ${
                isProcessing || items.length === 0 ? 'opacity-60 cursor-not-allowed' : ''
              }`}
            >
              {isProcessing ? (
                <>
                  <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  Place Order · {formatCurrency(total)}
                  <Icon name="ArrowRightIcon" size={16} variant="outline" />
                </>
              )}
            </button>
            {submitError && <p className="text-red-500 text-sm text-center mt-3">{submitError}</p>}

            <p className="text-center text-[11px] text-muted-foreground mt-4">
              By placing your order you agree to Madhav Fashion Studio&apos;s{' '}
              <Link href="/" className="underline hover:text-foreground transition-colors">
                Terms
              </Link>{' '}
              and{' '}
              <Link href="/" className="underline hover:text-foreground transition-colors">
                Privacy Policy
              </Link>
              .
            </p>
          </form>
        </div>

        {/* Order Summary Column */}
        <div className="lg:col-span-5 order-first lg:order-last">
          <div className="lg:sticky lg:top-28">
            <h2 className="font-display text-2xl italic font-light text-foreground mb-6">
              Order Summary
            </h2>

            {/* Items */}
            <div className="space-y-4 mb-6 max-h-[360px] overflow-y-auto pr-2">
              {items.length === 0 ? (
                <div className="text-center py-12">
                  <p className="font-display text-lg italic text-muted-foreground">
                    Your bag is empty
                  </p>
                  <Link
                    href="/products"
                    className="text-[11px] tracking-[0.2em] uppercase text-accent hover:underline mt-3 inline-block"
                  >
                    Browse products
                  </Link>
                </div>
              ) : (
                items.map((item) => (
                  <div
                    key={`${item.id}-${item.size}`}
                    className="flex gap-4 pb-4 border-b border-border last:border-0"
                  >
                    <div className="relative w-16 h-20 rounded-lg overflow-hidden flex-shrink-0 bg-secondary">
                      <AppImage
                        src={item.image}
                        alt={`${item.name} order item`}
                        fill
                        className="object-cover"
                        sizes="64px"
                      />
                      {item.quantity > 1 && (
                        <span className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-foreground text-primary-foreground text-[10px] font-bold rounded-full flex items-center justify-center">
                          {item.quantity}
                        </span>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-semibold text-foreground leading-tight">
                        {item.name}
                      </h3>
                      <p className="text-[11px] tracking-wide uppercase text-muted-foreground mt-0.5">
                        {item.color} · {item.size}
                      </p>
                      <p className="price-tag mt-1">{formatCurrency(item.price * item.quantity)}</p>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Totals */}
            <div className="border-t border-border pt-6 space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Subtotal</span>
                <span className="font-medium">{formatCurrency(subtotal)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Shipping</span>
                <span className={`font-medium ${shippingFree ? 'text-green-600' : ''}`}>
                  {items.length === 0 ? '—' : shippingFree ? 'Free' : formatCurrency(SHIPPING_COST)}
                </span>
              </div>
              {!shippingFree && subtotal > 0 && (
                <p className="text-[11px] text-muted-foreground">
                  Add {formatCurrency(SHIPPING_THRESHOLD - subtotal)} more for free shipping
                </p>
              )}
              <div className="flex justify-between items-center pt-3 border-t border-border">
                <span className="text-base font-semibold text-foreground">Total</span>
                <span className="font-display text-2xl italic font-semibold">
                  {formatCurrency(total)}
                </span>
              </div>
            </div>

            {/* Trust badges */}
            <div className="mt-6 pt-6 border-t border-border grid grid-cols-3 gap-3">
              {[
                { icon: 'LockClosedIcon', label: 'Secure' },
                { icon: 'TruckIcon', label: 'Fast Ship' },
                { icon: 'ArrowPathIcon', label: 'Free Returns' },
              ].map((b) => (
                <div key={b.label} className="flex flex-col items-center gap-1.5 text-center">
                  <Icon
                    name={b.icon as Parameters<typeof Icon>[0]['name']}
                    size={16}
                    variant="outline"
                    className="text-muted-foreground"
                  />
                  <span className="text-[10px] tracking-[0.15em] uppercase text-muted-foreground">
                    {b.label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
