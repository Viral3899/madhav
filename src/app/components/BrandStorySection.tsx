'use client';

import React, { useEffect, useRef } from 'react';
import Link from 'next/link';
import Icon from '@/components/ui/AppIcon';

export default function BrandStorySection() {
  const sectionRef = useRef<HTMLElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    async function initGSAP() {
      const { gsap } = await import('gsap');
      const { ScrollTrigger } = await import('gsap/ScrollTrigger');
      gsap?.registerPlugin(ScrollTrigger);

      // Parallax image
      if (imageRef?.current) {
        gsap?.to(imageRef?.current, {
          scrollTrigger: {
            trigger: sectionRef?.current,
            start: 'top bottom',
            end: 'bottom top',
            scrub: true,
          },
          y: '-18%',
          ease: 'none',
        });
      }

      // Title reveal
      if (titleRef?.current) {
        gsap?.fromTo(
          titleRef?.current,
          { y: '100%' },
          {
            y: '0%',
            duration: 1.5,
            ease: 'power4.out',
            scrollTrigger: {
              trigger: sectionRef?.current,
              start: 'top 60%',
            },
          }
        );
      }

      // Content reveal
      if (contentRef?.current) {
        gsap?.fromTo(
          contentRef?.current,
          { y: 40, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 1.2,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: sectionRef?.current,
              start: 'top 55%',
            },
          }
        );
      }
    }

    initGSAP();
  }, []);

  return (
    <section
      ref={sectionRef}
      className="relative parallax-container min-h-[90vh] flex items-center py-20"
      aria-label="Brand story"
    >
      {/* Noise texture overlay */}
      <div
        className="absolute inset-0 z-10 opacity-[0.04] pointer-events-none"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 512 512' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='1'/%3E%3C/svg%3E\")",
        }}
        aria-hidden="true"
      />

      {/* Parallax Background Image */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          ref={imageRef}
          src="https://img.rocket.new/generatedImages/rocket_gen_img_1cb6b7c0c-1776022491521.png"
          alt="Fashion store interior with warm lighting, dark atmospheric setting, deep shadows, moody editorial environment"
          className="parallax-image brightness-[0.35] contrast-[1.1]"
        />
      </div>
      {/* Content */}
      <div className="relative z-20 max-w-7xl mx-auto px-4 sm:px-6 grid grid-cols-12 w-full">
        <div className="col-span-12 md:col-span-8 lg:col-span-7">
          <div className="overflow-hidden mb-6 sm:mb-8">
            <h2
              ref={titleRef}
              className="font-display text-white leading-[0.85]"
              style={{
                fontSize: 'clamp(2.5rem, 10vw, 8rem)',
                fontStyle: 'italic',
                fontWeight: 300,
              }}
            >
              Clothes that <br />
              <span className="not-italic" style={{ color: 'var(--accent)' }}>
                fit your life,
              </span>{' '}
              <br />
              not the other <br />
              way around.
            </h2>
          </div>

          <div ref={contentRef} className="opacity-100">
            <p className="text-base sm:text-lg font-light leading-relaxed max-w-xl text-white/70 border-l border-white/20 pl-4 sm:pl-6 mb-8 sm:mb-10">
              Madhav Fashion Studio was built on a simple belief: India&apos;s rich textile heritage
              deserves to be worn every day, not just on special occasions. We bring you authentic
              handcrafted apparel — from Banarasi silks to block-printed cottons — at prices that
              respect your budget.
            </p>

            <div className="flex flex-wrap items-center gap-4 sm:gap-6">
              <Link
                href="/products"
                className="group relative border border-white/30 px-10 py-4 text-[11px] font-bold uppercase tracking-[0.3em] text-white overflow-hidden transition-all hover:border-white flex items-center gap-3"
              >
                <span className="relative z-10 group-hover:text-foreground transition-colors duration-500">
                  Shop the Collection
                </span>
                <span className="relative z-10 group-hover:text-foreground transition-colors duration-500">
                  <Icon name="ArrowRightIcon" size={16} variant="outline" />
                </span>
                <div className="absolute inset-0 bg-white translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-out" />
              </Link>
              <span className="text-[10px] tracking-[0.4em] uppercase text-white/30">
                Est. 2021 · Mumbai, India
              </span>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 sm:gap-8 mt-10 sm:mt-14 pt-8 sm:pt-10 border-t border-white/10 max-w-lg">
              {[
                { value: '18K+', label: 'Happy customers' },
                { value: '₹2,499', label: 'Average order' },
                { value: '4.8★', label: 'Average rating' },
              ]?.map((stat) => (
                <div key={stat?.label}>
                  <p className="font-display text-2xl sm:text-3xl italic font-light text-white">
                    {stat?.value}
                  </p>
                  <p className="text-[9px] sm:text-[10px] tracking-[0.2em] sm:tracking-[0.25em] uppercase text-white/40 mt-1">
                    {stat?.label}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      {/* Vertical side label */}
      <div className="absolute right-8 bottom-20 z-20 hidden lg:block">
        <div className="vertical-text text-white/20 text-[9px] flex items-center gap-3">
          <span className="w-1 h-1 rounded-full bg-accent" />
          Festive 2026 · Madhav Fashion Studio Collection
        </div>
      </div>
    </section>
  );
}
