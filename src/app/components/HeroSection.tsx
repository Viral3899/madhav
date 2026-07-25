'use client';

import React, { useEffect, useRef } from 'react';
import Link from 'next/link';
import AppImage from '@/components/ui/AppImage';
import Icon from '@/components/ui/AppIcon';

export default function HeroSection() {
  const overlayRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const scrollLineRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    let gsap: typeof import('gsap').gsap;

    async function initGSAP() {
      const gsapModule = await import('gsap');
      const stModule = await import('gsap/ScrollTrigger');
      gsap = gsapModule.gsap;
      const ScrollTrigger = stModule.ScrollTrigger;
      gsap.registerPlugin(ScrollTrigger);

      // Scroll line bounce
      if (scrollLineRef.current) {
        gsap.to(scrollLineRef.current, {
          yPercent: 200,
          repeat: -1,
          duration: 1.5,
          ease: 'power1.inOut',
        });
      }

      // Image reveal on load
      if (overlayRef.current && imageRef.current) {
        const tl = gsap.timeline({ delay: 0.3 });
        tl.to(overlayRef.current, {
          xPercent: 101,
          duration: 1.6,
          ease: 'power4.inOut',
        }).to(imageRef.current, { scale: 1, duration: 1.6, ease: 'power4.out' }, '-=1.6');
      }

      // Hero text reveal
      if (titleRef.current) {
        gsap.from(titleRef.current, {
          y: 60,
          opacity: 0,
          duration: 1.4,
          ease: 'power4.out',
          delay: 0.8,
        });
      }

      if (contentRef.current) {
        gsap.from(contentRef.current, {
          y: 40,
          opacity: 0,
          duration: 1.2,
          ease: 'power3.out',
          delay: 1.1,
        });
      }

      // Parallax on scroll
      if (imageRef.current) {
        gsap.to(imageRef.current, {
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top top',
            end: 'bottom top',
            scrub: true,
          },
          y: '-12%',
          ease: 'none',
        });
      }
    }

    initGSAP();
  }, []);

  return (
    <section
      ref={sectionRef}
      className="relative min-h-screen flex items-center pt-16 sm:pt-20 px-4 sm:px-6 overflow-hidden"
    >
      {/* Warm background blob */}
      <div
        className="absolute top-1/4 right-1/4 w-48 sm:w-96 h-48 sm:h-96 blob-accent pointer-events-none"
        aria-hidden="true"
      />

      <div className="max-w-7xl mx-auto w-full grid grid-cols-12 gap-4 sm:gap-6 lg:gap-10 items-center py-8 sm:py-0">
        {/* Text Column */}
        <div className="col-span-12 lg:col-span-5 order-2 lg:order-1 mt-6 lg:mt-0">
          <span className="text-[10px] sm:text-[11px] font-semibold tracking-[0.3em] sm:tracking-[0.4em] uppercase text-accent mb-4 sm:mb-6 block opacity-100">
            New Collection · Festive 2026
          </span>

          <h1
            ref={titleRef}
            className="hero-title font-display font-light text-foreground mb-6 sm:mb-8 opacity-100"
          >
            Indian <br />
            <em className="italic text-accent">elegance,</em> <br />
            redefined.
          </h1>

          <div ref={contentRef} className="opacity-100">
            <p className="max-w-sm text-sm sm:text-base leading-relaxed text-muted-foreground mb-8 sm:mb-10">
              Handcrafted Indian apparel — from everyday kurtas to festive lehengas. Authentic
              fabrics, timeless silhouettes, all at honest prices.
            </p>

            <div className="flex items-center gap-4 sm:gap-6 flex-wrap">
              <Link href="/products" className="btn-primary rounded-sm">
                Shop Now
                <Icon name="ArrowRightIcon" size={16} variant="outline" />
              </Link>
              <div className="flex items-center gap-3">
                <div className="w-8 sm:w-12 h-px bg-border" />
                <span className="text-[10px] sm:text-[11px] tracking-[0.2em] sm:tracking-[0.3em] uppercase text-muted-foreground">
                  Free shipping ₹999+
                </span>
              </div>
            </div>

            {/* Social proof mini */}
            <div className="flex items-center gap-3 mt-8 sm:mt-10 pt-6 sm:pt-8 border-t border-border">
              <div className="flex -space-x-2">
                {[
                  'https://i.pravatar.cc/40?u=priya',
                  'https://i.pravatar.cc/40?u=ananya',
                  'https://i.pravatar.cc/40?u=kavya',
                ].map((src, i) => (
                  <div
                    key={i}
                    className="w-8 h-8 rounded-full border-2 border-background overflow-hidden"
                  >
                    <AppImage
                      src={src}
                      alt="Happy Madhav Fashion Studio customer"
                      width={32}
                      height={32}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ))}
              </div>
              <div>
                <div className="flex star-rating">
                  {[...Array(5)].map((_, i) => (
                    <Icon key={i} name="StarIcon" size={12} variant="solid" />
                  ))}
                </div>
                <p className="text-[11px] text-muted-foreground mt-0.5">
                  Loved by 18,000+ customers
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Image Column */}
        <div className="col-span-12 lg:col-span-7 order-1 lg:order-2">
          <div className="relative w-full aspect-[4/3] sm:aspect-[4/4] md:aspect-[3/4] lg:aspect-[4/5] overflow-hidden image-reveal rounded-2xl">
            <div ref={overlayRef} className="reveal-overlay rounded-2xl" />
            <AppImage
              src="https://img.rocket.new/generatedImages/rocket_gen_img_181cf5db1-1772439835431.png"
              alt="Woman in vibrant Indian Anarkali kurta, warm golden light, festive traditional Indian fashion editorial"
              fill
              priority
              sizes="(max-width: 768px) 100vw, 58vw"
              className="object-cover"
              // @ts-ignore - ref for GSAP
              ref={imageRef}
            />

            {/* Subtle bottom gradient for label */}
            <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-foreground/20 to-transparent z-20 rounded-b-2xl" />

            {/* Floating label */}
            <div className="absolute bottom-6 left-6 z-30">
              <span className="text-[10px] tracking-[0.4em] uppercase text-white/80 font-medium">
                Festive 2026 Editorial
              </span>
            </div>

            {/* Price badge */}
            <div className="absolute top-6 right-6 z-30 bg-background/90 backdrop-blur-sm px-4 py-2 rounded-full border border-border">
              <span className="text-[11px] font-semibold tracking-wider text-foreground">
                From ₹999
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-6 sm:bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-3 opacity-40">
        <span className="text-[9px] tracking-[0.5em] uppercase text-muted-foreground">Scroll</span>
        <div className="w-px h-10 bg-border relative overflow-hidden">
          <div
            ref={scrollLineRef}
            className="absolute top-0 left-0 w-full h-full bg-foreground -translate-y-full"
          />
        </div>
      </div>
    </section>
  );
}
