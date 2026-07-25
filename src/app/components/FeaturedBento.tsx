'use client';

import React, { useEffect, useRef } from 'react';
import Link from 'next/link';
import AppImage from '@/components/ui/AppImage';
import Icon from '@/components/ui/AppIcon';
import { useCart } from '@/context/CartContext';
import { getFeaturedProducts } from '@/data/products';

// BENTO GRID AUDIT:
// Array has 6 cards: [HeroCard(p1), TrendingCard(p2), NewArrivalCard(p3), SaleCard(p4), StyleCard(p5), EssentialsCard(p6)]
// Row 1: [col-1-2: HeroCard cs-2 rs-2] [col-3: TrendingCard cs-1 rs-1]
// Row 2: [col-1-2: HeroCard (cont)]    [col-3: NewArrivalCard cs-1 rs-1]
// Row 3: [col-1: SaleCard cs-1]        [col-2: StyleCard cs-1]           [col-3: EssentialsCard cs-1]
// Placed 6/6 cards ✓

export default function FeaturedBento() {
  const featured = getFeaturedProducts();
  const { addItem } = useCart();
  const sectionRef = useRef<HTMLElement>(null);

  const [heroCard, trendingCard, newArrivalCard, saleCard, styleCard, essentialsCard] = featured;

  useEffect(() => {
    async function initReveal() {
      const { gsap } = await import('gsap');
      const { ScrollTrigger } = await import('gsap/ScrollTrigger');
      gsap.registerPlugin(ScrollTrigger);

      const containers = sectionRef.current?.querySelectorAll('.image-reveal');
      containers?.forEach((container) => {
        const image = container.querySelector('img');
        const overlay = container.querySelector('.reveal-overlay');
        if (!image || !overlay) return;

        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: container,
            start: 'top 85%',
          },
        });

        tl.to(overlay, { xPercent: 101, duration: 1.4, ease: 'power4.inOut' }).to(
          image,
          { scale: 1, duration: 1.4, ease: 'power4.out' },
          '-=1.4'
        );
      });
    }

    initReveal();
  }, []);

  const handleQuickAdd = (product: (typeof featured)[0]) => {
    addItem({
      id: product.id,
      name: product.name,
      price: product.price,
      originalPrice: product.originalPrice,
      image: product.image,
      size: product.sizes[2] || product.sizes[0],
      color: product.colors[0],
      category: product.category,
    });
  };

  return (
    <section ref={sectionRef} className="py-12 sm:py-20 px-4 sm:px-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 sm:mb-14 gap-4 sm:gap-6">
          <div>
            <span className="text-[11px] font-semibold tracking-[0.4em] uppercase text-accent mb-3 block">
              Curated For You
            </span>
            <h2 className="font-display section-title font-light text-foreground">The Edit</h2>
          </div>
          <Link
            href="/products"
            className="flex items-center gap-2 text-[11px] font-semibold tracking-[0.25em] uppercase text-muted-foreground hover:text-foreground transition-colors pb-1 border-b border-border"
          >
            View All
            <Icon name="ArrowRightIcon" size={14} variant="outline" />
          </Link>
        </div>

        {/* Bento Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4 auto-rows-[240px] sm:auto-rows-[280px] md:auto-rows-[320px]">
          {/* Card 1: HeroCard — col-span-2, row-span-2 */}
          <div className="sm:col-span-2 md:col-span-2 md:row-span-2 group relative rounded-2xl overflow-hidden bg-secondary product-card-hover cursor-pointer image-reveal">
            <div className="reveal-overlay rounded-2xl" />
            <AppImage
              src={heroCard.image}
              alt={`${heroCard.name} — well-lit bright studio, clean white background, airy natural light`}
              fill
              priority
              sizes="(max-width: 768px) 100vw, 66vw"
              className="object-cover"
            />
            {/* Scrim */}
            <div className="absolute inset-0 bg-gradient-to-t from-foreground/50 via-transparent to-transparent" />
            {/* Content */}
            <div className="absolute bottom-0 left-0 right-0 p-6 z-20">
              <div className="flex items-end justify-between">
                <div>
                  {heroCard.isNew && <span className="sale-badge mb-2 inline-block">New</span>}
                  <h3 className="font-display text-2xl font-semibold italic text-white">
                    {heroCard.name}
                  </h3>
                  <p className="text-sm text-white/70 mt-1">${heroCard.price}</p>
                </div>
                <button
                  onClick={() => handleQuickAdd(heroCard)}
                  className="w-11 h-11 rounded-full bg-background/90 backdrop-blur-sm flex items-center justify-center text-foreground hover:bg-accent hover:text-accent-foreground transition-all shadow-lg"
                  aria-label={`Quick add ${heroCard.name} to cart`}
                >
                  <Icon name="PlusIcon" size={18} variant="outline" />
                </button>
              </div>
            </div>
          </div>

          {/* Card 2: TrendingCard — col-span-1, row-span-1 */}
          <div className="group relative rounded-2xl overflow-hidden bg-secondary product-card-hover cursor-pointer image-reveal">
            <div className="reveal-overlay rounded-2xl" />
            <AppImage
              src={trendingCard.image}
              alt={`${trendingCard.name} — bright natural daylight, clean airy setting`}
              fill
              sizes="(max-width: 768px) 100vw, 33vw"
              className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-foreground/50 via-transparent to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-4 z-20">
              <div className="flex items-end justify-between">
                <div>
                  {trendingCard.isNew && <span className="sale-badge mb-1 inline-block">New</span>}
                  <h3 className="font-display text-lg font-semibold italic text-white leading-tight">
                    {trendingCard.name}
                  </h3>
                  <p className="text-sm text-white/70">${trendingCard.price}</p>
                </div>
                <button
                  onClick={() => handleQuickAdd(trendingCard)}
                  className="w-9 h-9 rounded-full bg-background/90 backdrop-blur-sm flex items-center justify-center text-foreground hover:bg-accent hover:text-accent-foreground transition-all"
                  aria-label={`Quick add ${trendingCard.name} to cart`}
                >
                  <Icon name="PlusIcon" size={16} variant="outline" />
                </button>
              </div>
            </div>
          </div>

          {/* Card 3: NewArrivalCard — col-span-1, row-span-1 */}
          <div className="group relative rounded-2xl overflow-hidden bg-secondary product-card-hover cursor-pointer image-reveal">
            <div className="reveal-overlay rounded-2xl" />
            <AppImage
              src={newArrivalCard.image}
              alt={`${newArrivalCard.name} — warm cozy indoor setting, soft natural window light`}
              fill
              sizes="(max-width: 768px) 100vw, 33vw"
              className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-foreground/50 via-transparent to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-4 z-20">
              <div className="flex items-end justify-between">
                <div>
                  {newArrivalCard.badge && (
                    <span className="sale-badge mb-1 inline-block">{newArrivalCard.badge}</span>
                  )}
                  <h3 className="font-display text-lg font-semibold italic text-white leading-tight">
                    {newArrivalCard.name}
                  </h3>
                  <div className="flex items-center gap-2">
                    <p className="text-sm text-white/70">${newArrivalCard.price}</p>
                    {newArrivalCard.originalPrice && (
                      <p className="text-sm text-white/40 line-through">
                        ${newArrivalCard.originalPrice}
                      </p>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => handleQuickAdd(newArrivalCard)}
                  className="w-9 h-9 rounded-full bg-background/90 backdrop-blur-sm flex items-center justify-center text-foreground hover:bg-accent hover:text-accent-foreground transition-all"
                  aria-label={`Quick add ${newArrivalCard.name} to cart`}
                >
                  <Icon name="PlusIcon" size={16} variant="outline" />
                </button>
              </div>
            </div>
          </div>

          {/* Card 4: SaleCard — col-span-1, row-span-1 */}
          <div className="group relative rounded-2xl overflow-hidden bg-secondary product-card-hover cursor-pointer image-reveal">
            <div className="reveal-overlay rounded-2xl" />
            <AppImage
              src={saleCard.image}
              alt={`${saleCard.name} — bright outdoor environment, sunny open setting`}
              fill
              sizes="(max-width: 768px) 100vw, 33vw"
              className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-foreground/50 via-transparent to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-4 z-20">
              <div className="flex items-end justify-between">
                <div>
                  {saleCard.isNew && <span className="sale-badge mb-1 inline-block">New</span>}
                  <h3 className="font-display text-lg font-semibold italic text-white leading-tight">
                    {saleCard.name}
                  </h3>
                  <p className="text-sm text-white/70">${saleCard.price}</p>
                </div>
                <button
                  onClick={() => handleQuickAdd(saleCard)}
                  className="w-9 h-9 rounded-full bg-background/90 backdrop-blur-sm flex items-center justify-center text-foreground hover:bg-accent hover:text-accent-foreground transition-all"
                  aria-label={`Quick add ${saleCard.name} to cart`}
                >
                  <Icon name="PlusIcon" size={16} variant="outline" />
                </button>
              </div>
            </div>
          </div>

          {/* Card 5: StyleCard — col-span-1, row-span-1 */}
          <div className="group relative rounded-2xl overflow-hidden bg-secondary product-card-hover cursor-pointer image-reveal">
            <div className="reveal-overlay rounded-2xl" />
            <AppImage
              src={styleCard.image}
              alt={`${styleCard.name} — clean bright studio, white walls, natural light`}
              fill
              sizes="(max-width: 768px) 100vw, 33vw"
              className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-foreground/50 via-transparent to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-4 z-20">
              <div className="flex items-end justify-between">
                <div>
                  <h3 className="font-display text-lg font-semibold italic text-white leading-tight">
                    {styleCard.name}
                  </h3>
                  <p className="text-sm text-white/70">${styleCard.price}</p>
                </div>
                <button
                  onClick={() => handleQuickAdd(styleCard)}
                  className="w-9 h-9 rounded-full bg-background/90 backdrop-blur-sm flex items-center justify-center text-foreground hover:bg-accent hover:text-accent-foreground transition-all"
                  aria-label={`Quick add ${styleCard.name} to cart`}
                >
                  <Icon name="PlusIcon" size={16} variant="outline" />
                </button>
              </div>
            </div>
          </div>

          {/* Card 6: EssentialsCard — col-span-1, row-span-1 */}
          <div className="group relative rounded-2xl overflow-hidden bg-secondary product-card-hover cursor-pointer image-reveal">
            <div className="reveal-overlay rounded-2xl" />
            <AppImage
              src={essentialsCard.image}
              alt={`${essentialsCard.name} — clean minimal background, soft diffused light, airy atmosphere`}
              fill
              sizes="(max-width: 768px) 100vw, 33vw"
              className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-foreground/50 via-transparent to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-4 z-20">
              <div className="flex items-end justify-between">
                <div>
                  {essentialsCard.isNew && (
                    <span className="sale-badge mb-1 inline-block">New</span>
                  )}
                  <h3 className="font-display text-lg font-semibold italic text-white leading-tight">
                    {essentialsCard.name}
                  </h3>
                  <p className="text-sm text-white/70">${essentialsCard.price}</p>
                </div>
                <button
                  onClick={() => handleQuickAdd(essentialsCard)}
                  className="w-9 h-9 rounded-full bg-background/90 backdrop-blur-sm flex items-center justify-center text-foreground hover:bg-accent hover:text-accent-foreground transition-all"
                  aria-label={`Quick add ${essentialsCard.name} to cart`}
                >
                  <Icon name="PlusIcon" size={16} variant="outline" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
