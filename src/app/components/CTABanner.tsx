'use client';

import React, { useEffect, useRef } from 'react';
import Link from 'next/link';
import Icon from '@/components/ui/AppIcon';

const perks = [
  { icon: 'TruckIcon', label: 'Free shipping', sub: 'Orders over $50' },
  { icon: 'ArrowPathIcon', label: 'Free returns', sub: '30-day policy' },
  { icon: 'ShieldCheckIcon', label: 'Secure checkout', sub: 'SSL encrypted' },
  { icon: 'SparklesIcon', label: 'Quality guarantee', sub: 'Or money back' },
];

export default function CTABanner() {
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    async function init() {
      const { gsap } = await import('gsap');
      const { ScrollTrigger } = await import('gsap/ScrollTrigger');
      gsap.registerPlugin(ScrollTrigger);

      const cards = sectionRef.current?.querySelectorAll('.perk-card');
      if (cards) {
        gsap.fromTo(
          cards,
          { y: 30, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.8,
            ease: 'power3.out',
            stagger: 0.1,
            scrollTrigger: {
              trigger: sectionRef.current,
              start: 'top 80%',
            },
          }
        );
      }
    }
    init();
  }, []);

  return (
    <section ref={sectionRef} className="pt-8 sm:pt-12 pb-12 sm:pb-20 px-4 sm:px-6">
      <div className="max-w-7xl mx-auto">
        {/* Perks Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 mb-10 sm:mb-16">
          {perks.map((perk) => (
            <div
              key={perk.label}
              className="perk-card opacity-100 flex flex-col items-center text-center gap-2 sm:gap-3 p-4 sm:p-6 rounded-2xl bg-secondary border border-border hover:border-accent/40 transition-colors"
            >
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-accent/10 flex items-center justify-center">
                <Icon
                  name={perk.icon as Parameters<typeof Icon>[0]['name']}
                  size={18}
                  variant="outline"
                  className="text-accent"
                />
              </div>
              <div>
                <p className="text-xs sm:text-sm font-semibold text-foreground">{perk.label}</p>
                <p className="text-[10px] sm:text-[11px] tracking-wide text-muted-foreground mt-0.5">
                  {perk.sub}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Main CTA */}
        <div className="bg-accent rounded-2xl sm:rounded-3xl p-6 sm:p-10 md:p-16 flex flex-col md:flex-row items-center justify-between gap-6 sm:gap-8 relative overflow-hidden">
          {/* Background blob */}
          <div
            className="absolute right-0 top-0 w-48 sm:w-64 h-48 sm:h-64 rounded-full bg-white/10 -translate-y-1/2 translate-x-1/4 pointer-events-none"
            aria-hidden="true"
          />
          <div
            className="absolute left-1/2 bottom-0 w-36 sm:w-48 h-36 sm:h-48 rounded-full bg-white/5 translate-y-1/2 pointer-events-none"
            aria-hidden="true"
          />

          <div className="relative z-10 text-center md:text-left">
            <span className="text-[10px] sm:text-[11px] font-semibold tracking-[0.3em] uppercase text-accent-foreground/70 mb-3 block">
              Festive Season Sale
            </span>
            <h2 className="font-display text-3xl sm:text-4xl md:text-6xl font-light italic text-accent-foreground leading-tight">
              Up to 40% off <br />
              <span className="not-italic font-semibold">Festive Styles</span>
            </h2>
            <p className="text-accent-foreground/80 mt-3 text-sm max-w-sm">
              Sarees, lehengas, kurtas and more — all marked down for the festive season. Stock is
              limited.
            </p>
          </div>

          <div className="relative z-10 flex flex-col items-center gap-4">
            <Link
              href="/products"
              className="bg-accent-foreground text-accent px-8 sm:px-10 py-4 sm:py-5 text-[11px] font-bold uppercase tracking-[0.3em] hover:bg-background transition-colors rounded-sm flex items-center gap-3 whitespace-nowrap"
            >
              Shop Sale
              <Icon name="ArrowRightIcon" size={16} variant="outline" />
            </Link>
            <span className="text-[10px] tracking-[0.25em] uppercase text-accent-foreground/50">
              Ends October 31
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
