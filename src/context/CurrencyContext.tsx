'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';

export type CurrencyCode = 'INR' | 'USD' | 'EUR' | 'GBP' | 'AED';
const currencies: Record<CurrencyCode, { label: string; rate: number; locale: string }> = {
  INR: { label: '₹ INR', rate: 1, locale: 'en-IN' },
  USD: { label: '$ USD', rate: 0.012, locale: 'en-US' },
  EUR: { label: '€ EUR', rate: 0.011, locale: 'de-DE' },
  GBP: { label: '£ GBP', rate: 0.0094, locale: 'en-GB' },
  AED: { label: 'د.إ AED', rate: 0.044, locale: 'en-AE' },
};
const countries = { India: 'INR', 'United States': 'USD', Germany: 'EUR', 'United Kingdom': 'GBP', UAE: 'AED' } as const;
type Country = keyof typeof countries;

const CurrencyContext = createContext<{ currency: CurrencyCode; country: Country; setCurrency: (code: CurrencyCode) => void; setCountry: (country: Country) => void; formatCurrency: (amount: number) => string } | null>(null);

export function CurrencyProvider({ children }: { children: React.ReactNode }) {
  const [currency, setCurrency] = useState<CurrencyCode>('INR');
  const [country, setCountryState] = useState<Country>('India');
  useEffect(() => { const saved = localStorage.getItem('madhav_currency') as CurrencyCode | null; const savedCountry = localStorage.getItem('madhav_country') as Country | null; if (saved && currencies[saved]) setCurrency(saved); if (savedCountry && countries[savedCountry]) setCountryState(savedCountry); }, []);
  function changeCurrency(code: CurrencyCode) { setCurrency(code); localStorage.setItem('madhav_currency', code); }
  function changeCountry(value: Country) { setCountryState(value); changeCurrency(countries[value]); localStorage.setItem('madhav_country', value); }
  function formatCurrency(amount: number) { const item = currencies[currency]; return new Intl.NumberFormat(item.locale, { style: 'currency', currency, maximumFractionDigits: currency === 'INR' ? 0 : 2 }).format(amount * item.rate); }
  return <CurrencyContext.Provider value={{ currency, country, setCurrency: changeCurrency, setCountry: changeCountry, formatCurrency }}>{children}</CurrencyContext.Provider>;
}

export function useCurrency() { const context = useContext(CurrencyContext); if (!context) throw new Error('useCurrency must be used within CurrencyProvider'); return context; }

export const currencyOptions = Object.entries(currencies).map(([code, value]) => ({ code: code as CurrencyCode, label: value.label }));
export const countryOptions = Object.keys(countries) as Country[];
