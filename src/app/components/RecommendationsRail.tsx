'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Icon from '@/components/ui/AppIcon';
import { apiFetch, type ApiProduct } from '@/lib/api';
import { useCart } from '@/context/CartContext';
import { useCurrency } from '@/context/CurrencyContext';

export default function RecommendationsRail() {
  const [products, setProducts] = useState<ApiProduct[]>([]);
  const { addItem } = useCart();
  const { formatCurrency } = useCurrency();
  useEffect(() => {
    apiFetch<ApiProduct[]>('/recommendations?limit=6')
      .then(setProducts)
      .catch(() => undefined);
  }, []);
  if (!products.length) return null;
  return (
    <section className="market-section recommendation-section">
      <div className="section-heading">
        <div>
          <p className="eyebrow">Smart fashion picks</p>
          <h2>Recommended for you</h2>
        </div>
        <span className="recommendation-note">
          <Icon name="SparklesIcon" size={14} /> Based on popular styles
        </span>
      </div>
      <div className="product-rail">
        {products.map((product) => (
          <article className="market-product" key={product.id}>
            <Link href={`/products/${product.id}`} className="market-product-image">
              <img
                src={product.images[0] || '/assets/images/no_image.png'}
                alt={product.name}
                loading="lazy"
              />
            </Link>
            <div className="market-rating">
              <span>★</span> {product.rating.toFixed(1)} <small>({product.review_count})</small>
            </div>
            <h3>{product.name}</h3>
            <p className="market-price">{formatCurrency(product.price)}</p>
            <button
              className="mini-add"
              onClick={() =>
                addItem({
                  id: String(product.id),
                  name: product.name,
                  price: product.price,
                  originalPrice: product.original_price || undefined,
                  image: product.images[0] || '/assets/images/no_image.png',
                  size: product.sizes[0] || 'One Size',
                  color: product.colors[0] || 'Default',
                  category: product.category,
                })
              }
            >
              Add to cart
            </button>
          </article>
        ))}
      </div>
    </section>
  );
}
