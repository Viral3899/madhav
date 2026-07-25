'use client';

import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import Icon from '@/components/ui/AppIcon';
import { useCart } from '@/context/CartContext';
import { apiFetch, type ApiProduct } from '@/lib/api';
import { useCurrency } from '@/context/CurrencyContext';
import { useWishlist } from '@/context/WishlistContext';

type Department = 'all' | 'women' | 'men' | 'kids';

function ProductCard({ product }: { product: ApiProduct }) {
  const { addItem } = useCart();
  const { formatCurrency } = useCurrency();
  const { isSaved, toggle } = useWishlist();
  const [selectedSize, setSelectedSize] = useState(product.sizes[0] || 'One Size');
  const [added, setAdded] = useState(false);
  const image = product.images[0] || '/assets/images/no_image.png';
  const discount = product.original_price
    ? Math.round((1 - product.price / product.original_price) * 100)
    : 0;

  function addToCart() {
    addItem({
      id: String(product.id),
      name: product.name,
      price: product.price,
      originalPrice: product.original_price || undefined,
      image,
      size: selectedSize,
      color: product.colors[0] || 'Default',
      category: product.category,
    });
    setAdded(true);
    window.setTimeout(() => setAdded(false), 1400);
  }

  return (
    <article className="catalog-card">
      <Link href={`/products/${product.id}`} className="catalog-image">
        <img src={image} alt={product.name} loading="lazy" />
        {product.badge && <span className="catalog-badge">{product.badge}</span>}
        {product.stock === 0 && <span className="catalog-sold">Currently unavailable</span>}
      </Link>
      <button
        className={`catalog-wishlist ${isSaved(String(product.id)) ? 'saved' : ''}`}
        aria-label={isSaved(String(product.id)) ? 'Remove from wishlist' : 'Add to wishlist'}
        onClick={() =>
          toggle({
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
        ♥
      </button>
      <div className="catalog-info">
        <div className="catalog-rating">
          <span>★</span> {product.rating.toFixed(1)}{' '}
          <small>({product.review_count.toLocaleString()})</small>
        </div>
        <Link href={`/products/${product.id}`}>
          <h2>{product.name}</h2>
        </Link>
        <p className="catalog-price">
          {formatCurrency(product.price)}{' '}
          {discount > 0 && (
            <>
              <del>{formatCurrency(product.original_price || 0)}</del>
              <b>{discount}% off</b>
            </>
          )}
        </p>
        <p className="catalog-delivery">FREE delivery on your first order</p>
        <div className="catalog-options">
          {product.sizes.slice(0, 5).map((size) => (
            <button
              key={size}
              className={selectedSize === size ? 'selected' : ''}
              onClick={() => setSelectedSize(size)}
            >
              {size}
            </button>
          ))}
        </div>
        <button disabled={product.stock === 0} onClick={addToCart} className="catalog-add">
          {added ? 'Added to cart' : 'Add to cart'}
        </button>
      </div>
    </article>
  );
}

export default function ProductsClient() {
  const [products, setProducts] = useState<ApiProduct[]>([]);
  const [department, setDepartment] = useState<Department>('all');
  const [sortBy, setSortBy] = useState('featured');
  const [query, setQuery] = useState('');
  const [maxPrice, setMaxPrice] = useState(2500);
  const [size, setSize] = useState('all');
  const [color, setColor] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    setLoading(true);
    setError('');
    const params = new URLSearchParams({ limit: '100', sort: sortBy, category: 'fashion' });
    if (query.trim()) params.set('q', query.trim());
    apiFetch<ApiProduct[]>(`/products?${params}`)
      .then(setProducts)
      .catch(() => setError('Connect the Madhav Fashion Studio API to load the live catalogue.'))
      .finally(() => setLoading(false));
  }, [sortBy, query]);

  const colors = useMemo(
    () => Array.from(new Set(products.flatMap((product) => product.colors))).sort(),
    [products]
  );
  const sizes = useMemo(
    () => Array.from(new Set(products.flatMap((product) => product.sizes))).sort(),
    [products]
  );
  const visibleProducts = useMemo(
    () =>
      products.filter((product) => {
        const gender = (
          product.specs?.Gender || (product.name.toLowerCase().includes('girls') ? 'Kids' : '')
        ).toLowerCase();
        return (
          (department === 'all' || gender === department) &&
          product.price <= maxPrice &&
          (size === 'all' || product.sizes.includes(size)) &&
          (color === 'all' || product.colors.includes(color))
        );
      }),
    [products, department, maxPrice, size, color]
  );

  return (
    <div className="catalog-page">
      <div className="catalog-breadcrumb">
        <Link href="/">Home</Link>
        <Icon name="ChevronRightIcon" size={13} />
        <span>Fashion</span>
      </div>
      <div className="catalog-header">
        <div>
          <p className="eyebrow">Madhav Fashion Studio marketplace</p>
          <h1>Fashion store</h1>
          <p className="catalog-count">{visibleProducts.length} results for your style</p>
        </div>
        <label className="catalog-search">
          <Icon name="MagnifyingGlassIcon" size={17} />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search dresses, kurtis, jeans..."
          />
        </label>
      </div>
      <div className="catalog-layout">
        <aside className="catalog-filters">
          <div className="filter-top">
            <b>Filters</b>
            <button
              onClick={() => {
                setDepartment('all');
                setMaxPrice(2500);
                setSize('all');
                setColor('all');
              }}
            >
              Clear all
            </button>
          </div>
          <fieldset>
            <legend>Department</legend>
            {(['all', 'women', 'men', 'kids'] as Department[]).map((item) => (
              <label key={item}>
                <input
                  type="radio"
                  checked={department === item}
                  onChange={() => setDepartment(item)}
                />{' '}
                {item === 'all' ? 'All fashion' : item[0].toUpperCase() + item.slice(1)}
              </label>
            ))}
          </fieldset>
          <fieldset>
            <legend>Price</legend>
            <input
              type="range"
              min="0"
              max="2500"
              step="100"
              value={maxPrice}
              onChange={(e) => setMaxPrice(Number(e.target.value))}
            />
            <div className="range-label">
              <span>₹0</span>
              <span>Up to ₹{maxPrice}</span>
            </div>
          </fieldset>
          <fieldset>
            <legend>Size</legend>
            <select value={size} onChange={(e) => setSize(e.target.value)}>
              <option value="all">All sizes</option>
              {sizes.map((item) => (
                <option key={item}>{item}</option>
              ))}
            </select>
          </fieldset>
          <fieldset>
            <legend>Colour</legend>
            <select value={color} onChange={(e) => setColor(e.target.value)}>
              <option value="all">All colours</option>
              {colors.map((item) => (
                <option key={item}>{item}</option>
              ))}
            </select>
          </fieldset>
          <div className="filter-promise">
            ✓ Only fashion products
            <br />✓ Secure checkout
            <br />✓ Easy returns
          </div>
        </aside>
        <section className="catalog-results">
          <div className="results-toolbar">
            <span>{loading ? 'Loading products...' : `${visibleProducts.length} results`}</span>
            <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
              <option value="featured">Sort: Featured</option>
              <option value="rating">Customer rating</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
              <option value="discount">Biggest discount</option>
            </select>
          </div>
          {error ? (
            <div className="catalog-empty">
              {error}
              <small>
                Start the backend with <code>uvicorn main:app --reload --port 8010</code>.
              </small>
            </div>
          ) : loading ? (
            <div className="catalog-empty">Finding your next favourite look...</div>
          ) : visibleProducts.length === 0 ? (
            <div className="catalog-empty">
              <h2>No products match those filters</h2>
              <button
                onClick={() => {
                  setDepartment('all');
                  setMaxPrice(2500);
                  setSize('all');
                  setColor('all');
                }}
              >
                Reset filters
              </button>
            </div>
          ) : (
            <div className="catalog-grid">
              {visibleProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
