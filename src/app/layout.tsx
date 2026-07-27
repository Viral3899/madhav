import React from 'react';
import type { Metadata, Viewport } from 'next';
import { DM_Sans, Fraunces } from 'next/font/google';
import '../styles/tailwind.css';
import '../styles/marketplace-overrides.css';
import { AuthProvider } from '@/context/AuthContext';
import { CurrencyProvider } from '@/context/CurrencyContext';
import { WishlistProvider } from '@/context/WishlistContext';

const dmSans = DM_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-sans',
  display: 'swap',
});

const fraunces = Fraunces({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700', '900'],
  style: ['normal', 'italic'],
  variable: '--font-display',
  display: 'swap',
});

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
};

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'),
  title: 'Madhav Fashion Studio | Find more. Live better.',
  description:
    'Shop fashion, home essentials, gifts and more at Madhav Fashion Studio. Great finds, honest prices, delivered to your door.',
  icons: {
    icon: [{ url: '/madhav-favicon.svg', type: 'image/svg+xml' }],
  },
  openGraph: {
    title: 'Madhav Fashion Studio | Everyday shopping, made easy',
    description: 'Great finds, honest prices, delivered to your door.',
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${dmSans.variable} ${fraunces.variable}`}>
      <body className={dmSans.className}>
        <AuthProvider>
          <CurrencyProvider>
            <WishlistProvider>{children}</WishlistProvider>
          </CurrencyProvider>
        </AuthProvider>

        <script
          type="module"
          async
          src="https://static.rocket.new/rocket-web.js?_cfg=https%3A%2F%2Fbech8765back.builtwithrocket.new&_be=https%3A%2F%2Fappanalytics.rocket.new&_v=0.1.19"
        />
        <script type="module" defer src="https://static.rocket.new/rocket-shot.js?v=0.0.2" />
      </body>
    </html>
  );
}
