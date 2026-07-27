'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { CartProvider, useCart } from '@/context/CartContext';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Icon from '@/components/ui/AppIcon';
import { apiFetch, type ApiProduct } from '@/lib/api';
import { useCurrency } from '@/context/CurrencyContext';
import RecommendationsRail from '@/app/components/RecommendationsRail';

const categories = [
  {
    title: "Women's fashion",
    label: 'Dresses, kurtis & more',
    image: 'https://img.rocket.new/generatedImages/rocket_gen_img_16d412437-1772087467125.png',
  },
  {
    title: "Men's fashion",
    label: 'Shirts, jeans & jackets',
    image: 'https://img.rocket.new/generatedImages/rocket_gen_img_1d7201a0d-1772719966359.png',
  },
  {
    title: 'Kids wear',
    label: 'Bright styles for little ones',
    image: 'https://img.rocket.new/generatedImages/rocket_gen_img_17e4fd043-1764672691592.png',
  },
  {
    title: 'Footwear & accessories',
    label: 'Finish every look',
    image: 'https://img.rocket.new/generatedImages/rocket_gen_img_15e283771-1772279772045.png',
  },
];

function ProductRail() {
  const { addItem } = useCart();
  const { formatCurrency } = useCurrency();
  const [products, setProducts] = useState<ApiProduct[]>([]);

  useEffect(() => {
    apiFetch<ApiProduct[]>('/products?limit=100&category=fashion&sort=rating')
      .then((items) =>
        setProducts(items.slice(0, 12).map((item) => ({ ...item, reviewCount: item.review_count })))
      )
      .catch(() => setProducts([]));
  }, []);
  return (
    <section className="market-section">
      <div className="section-heading">
        <div>
          <p className="eyebrow">Handpicked for you</p>
          <h2>Top picks for your day</h2>
        </div>
        <Link href="/products" className="see-all">
          Explore all <Icon name="ArrowRightIcon" size={15} />
        </Link>
      </div>
      <div className="product-rail">
        {products.map((product) => {
          const image = product.images[0] || '/assets/images/no_image.png';
          return (
            <article className="market-product" key={product.id}>
              <Link href={`/products/${product.id}`} className="market-product-image">
                <img src={image} alt={product.name} loading="lazy" />
                {product.badge && <span>{product.badge}</span>}
              </Link>
              <div className="market-rating">
                <span>★</span> {product.rating} <small>({product.reviewCount})</small>
              </div>
              <h3>{product.name}</h3>
              <p className="market-price">
                {formatCurrency(product.price)}{' '}
                <del>{product.original_price ? formatCurrency(product.original_price) : ''}</del>
              </p>
              <button
                className="mini-add"
                onClick={() =>
                  addItem({
                    id: String(product.id),
                    name: product.name,
                    price: product.price,
                    originalPrice: product.original_price || undefined,
                    image,
                    size: product.sizes[0] || 'One Size',
                    color: product.colors[0] || 'Default',
                    category: product.category,
                  })
                }
              >
                Add to cart
              </button>
            </article>
          );
        })}
      </div>
    </section>
  );
}

function HomeContent() {
  return (
    <>
      <Header />
      <main id="top">
        <section className="market-hero">
          <div className="hero-copy">
            <p className="eyebrow">The everyday fashion destination</p>
            <h1>
              Find your fit.
              <br />
              <em>Wear it well.</em>
            </h1>
            <p className="hero-subtitle">
              Discover fashion for every mood, moment, and member of the family. From everyday
              essentials to festive favourites.
            </p>
            <Link href="/products" className="market-button">
              Shop today&apos;s fashion <Icon name="ArrowRightIcon" size={17} />
            </Link>
            <div className="hero-note">
              <span>✓</span> Easy returns &nbsp; <span>✓</span> Secure checkout
            </div>
          </div>
          <div className="hero-art">
            <div className="hero-art-label">New season / 2026</div>
            <img
              src="https://img.rocket.new/generatedImages/rocket_gen_img_181cf5db1-1772439835431.png"
              alt="New season products"
            />
            <div className="hero-price">
              Up to
              <br />
              <strong>50% off</strong>
            </div>
          </div>
        </section>
        <div className="trust-strip">
          <div>
            <Icon name="TruckIcon" size={23} />
            <span>
              <b>Fast fashion delivery</b>
              <small>Across India</small>
            </span>
          </div>
          <div>
            <Icon name="ShieldCheckIcon" size={23} />
            <span>
              <b>Authentic fashion</b>
              <small>Secure payments</small>
            </span>
          </div>
          <div>
            <Icon name="ArrowPathIcon" size={23} />
            <span>
              <b>Simple returns</b>
              <small>Easy size exchanges</small>
            </span>
          </div>
          <div>
            <Icon name="ChatBubbleLeftRightIcon" size={23} />
            <span>
              <b>Style support</b>
              <small>We are here to help</small>
            </span>
          </div>
        </div>
        <section className="market-section">
          <div className="section-heading">
            <div>
              <p className="eyebrow">Browse by department</p>
              <h2>What are you looking for?</h2>
            </div>
            <Link href="/products" className="see-all">
              See all departments <Icon name="ArrowRightIcon" size={15} />
            </Link>
          </div>
          <div className="category-grid">
            {categories.map((category) => (
              <Link href="/products" className="category-card" key={category.title}>
                <img src={category.image} alt="" />
                <div>
                  <h3>{category.title}</h3>
                  <p>{category.label}</p>
                  <span>
                    Shop now <Icon name="ArrowRightIcon" size={13} />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </section>
        <ProductRail />
        <section className="deal-banner">
          <div>
            <p className="eyebrow">Limited-time offer</p>
            <h2>
              Small prices.
              <br />
              <em>Big everyday wins.</em>
            </h2>
            <p>Save more on customer favourites while stocks last.</p>
            <Link href="/products" className="light-button">
              See all deals <Icon name="ArrowRightIcon" size={16} />
            </Link>
          </div>
          <div className="deal-orbit">
            <span>DEAL</span>
            <strong>50%</strong>
            <small>OFF</small>
          </div>
        </section>
        <RecommendationsRail />
      </main>
      <Footer />
    </>
  );
}

export default function HomePage() {
  return (
    <CartProvider>
      <HomeContent />
    </CartProvider>
  );
}
