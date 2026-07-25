'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { CartProvider, useCart } from '@/context/CartContext';
import { useCurrency } from '@/context/CurrencyContext';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Icon from '@/components/ui/AppIcon';
import { apiFetch, type ApiProduct } from '@/lib/api';

function ProductDetail() {
  const params = useParams<{ id: string }>();
  const { addItem } = useCart();
  const { formatCurrency } = useCurrency();
  const [product, setProduct] = useState<ApiProduct | null>(null);
  const [size, setSize] = useState('');
  const [color, setColor] = useState('');
  const [added, setAdded] = useState(false);
  const [error, setError] = useState('');
  useEffect(() => {
    apiFetch<ApiProduct>(`/products/${params.id}`)
      .then((item) => {
        setProduct(item);
        setSize(item.sizes[0] || 'One Size');
        setColor(item.colors[0] || 'Default');
      })
      .catch(() => setError('This fashion item is no longer available.'));
  }, [params.id]);
  if (error)
    return (
      <div className="catalog-empty">
        <h1>{error}</h1>
        <Link href="/products" className="market-button">
          Continue shopping
        </Link>
      </div>
    );
  if (!product) return <div className="catalog-empty">Loading product details...</div>;
  const image = product.images[0] || '/assets/images/no_image.png';
  const discount = product.original_price
    ? Math.round((1 - product.price / product.original_price) * 100)
    : 0;
  const item = product;
  function addToCart() {
    addItem({
      id: String(item.id),
      name: item.name,
      price: item.price,
      originalPrice: item.original_price || undefined,
      image,
      size,
      color,
      category: item.category,
    });
    setAdded(true);
  }
  return (
    <div className="product-detail">
      <div className="catalog-breadcrumb">
        <Link href="/">Home</Link>
        <Icon name="ChevronRightIcon" size={13} />
        <Link href="/products">Fashion</Link>
        <Icon name="ChevronRightIcon" size={13} />
        <span>{product.name}</span>
      </div>
      <div className="detail-grid">
        <div className="detail-image">
          <img src={image} alt={product.name} />
        </div>
        <div className="detail-copy">
          <p className="eyebrow">Madhav Fashion Studio / Fashion</p>
          <h1>{product.name}</h1>
          <div className="detail-rating">
            <span>★</span> {product.rating.toFixed(1)}{' '}
            <a href="#reviews">{product.review_count.toLocaleString()} ratings</a>
          </div>
          <hr />
          <p className="detail-price">
            {formatCurrency(product.price)}{' '}
            {discount > 0 && (
              <>
                <del>{formatCurrency(product.original_price || 0)}</del>
                <b>{discount}% off</b>
              </>
            )}
          </p>
          <p className="tax-note">Inclusive of all taxes</p>
          <p className="detail-description">{product.description}</p>
          {product.colors.length > 0 && (
            <div className="variant-group">
              <b>Colour: </b>
              {color}
              <div>
                {product.colors.map((item) => (
                  <button
                    className={color === item ? 'active' : ''}
                    key={item}
                    onClick={() => setColor(item)}
                  >
                    {item}
                  </button>
                ))}
              </div>
            </div>
          )}
          {product.sizes.length > 0 && (
            <div className="variant-group">
              <b>Size:</b>
              <div>
                {product.sizes.map((item) => (
                  <button
                    className={size === item ? 'active' : ''}
                    key={item}
                    onClick={() => setSize(item)}
                  >
                    {item}
                  </button>
                ))}
              </div>
            </div>
          )}
          <div className="detail-delivery">
            <Icon name="TruckIcon" size={21} />
            <div>
              <b>FREE delivery</b>
              <span>Order today. Delivery in 3-5 business days.</span>
            </div>
          </div>
          <button disabled={product.stock === 0} onClick={addToCart} className="detail-add">
            {added ? 'Added to cart' : 'Add to cart'} <Icon name="ShoppingCartIcon" size={17} />
          </button>
          {added && (
            <Link href="/checkout" className="detail-buy">
              Proceed to checkout
            </Link>
          )}
          <div className="detail-trust">
            <span>✓ Secure transaction</span>
            <span>✓ 7-day easy returns</span>
            <span>✓ In stock ({product.stock})</span>
          </div>
        </div>
      </div>
      <section id="reviews" className="detail-specs">
        <h2>About this fashion item</h2>
        <p>{product.description}</p>
        <div>
          {Object.entries(product.specs || {}).map(([key, value]) => (
            <span key={key}>
              <b>{key}</b>
              {value}
            </span>
          ))}
        </div>
      </section>
    </div>
  );
}

export default function ProductPage() {
  return (
    <CartProvider>
      <Header />
      <main className="pt-6">
        <ProductDetail />
      </main>
      <Footer />
    </CartProvider>
  );
}
