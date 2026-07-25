'use client';

import React, { useEffect, useRef, useState } from 'react';
import AppImage from '@/components/ui/AppImage';
import Icon from '@/components/ui/AppIcon';

const testimonials = [
  {
    id: 1,
    quote:
      "The Cotton Kurta is my everyday staple now. The fabric is so breathable and the fit is perfect. I've ordered three more in different colours — worth every rupee.",
    name: 'Priya Sharma',
    role: 'Teacher, Jaipur',
    avatar: 'https://i.pravatar.cc/100?u=priya_sharma',
    rating: 5,
    product: 'Cotton Kurta',
  },
  {
    id: 2,
    quote:
      "Finally found a brand that does authentic Banarasi sarees at a fair price. The silk quality is stunning and the zari work is exquisite. Wore it to my cousin's wedding — got so many compliments.",
    name: 'Ananya Iyer',
    role: 'Software Engineer, Bengaluru',
    avatar: 'https://i.pravatar.cc/100?u=ananya_iyer',
    rating: 5,
    product: 'Silk Saree',
  },
  {
    id: 3,
    quote:
      'The Anarkali Kurta is everything I wanted — flowy, beautifully embroidered, and the colour is even more vibrant in person. Shipping was fast and packaging was lovely.',
    name: 'Kavya Menon',
    role: 'Marketing Manager, Mumbai',
    avatar: 'https://i.pravatar.cc/100?u=kavya_menon',
    rating: 5,
    product: 'Anarkali Kurta',
  },
];

export default function TestimonialsSection() {
  const [active, setActive] = useState(0);
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const timer = setInterval(() => {
      setActive((prev) => (prev + 1) % testimonials?.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    async function initGSAP() {
      const { gsap } = await import('gsap');
      const { ScrollTrigger } = await import('gsap/ScrollTrigger');
      gsap?.registerPlugin(ScrollTrigger);

      gsap?.fromTo(
        sectionRef?.current,
        { opacity: 0, y: 50 },
        {
          opacity: 1,
          y: 0,
          duration: 1.2,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: sectionRef?.current,
            start: 'top 80%',
          },
        }
      );
    }
    initGSAP();
  }, []);

  const t = testimonials?.[active];

  return (
    <section ref={sectionRef} className="py-12 sm:py-20 px-4 sm:px-6 opacity-100">
      <div className="max-w-5xl mx-auto">
        <div className="bg-foreground text-primary-foreground rounded-[32px] sm:rounded-[48px] p-6 sm:p-10 md:p-16 relative overflow-hidden">
          {/* Diagonal rays overlay */}
          <div
            className="absolute inset-0 diagonal-rays opacity-100 rounded-[48px]"
            aria-hidden="true"
          />

          <div className="relative z-10 flex flex-col items-center text-center gap-8">
            {/* Quote icon */}
            <div className="w-12 h-12 rounded-full bg-accent/20 flex items-center justify-center">
              <Icon
                name="ChatBubbleLeftRightIcon"
                size={22}
                variant="outline"
                className="text-accent"
              />
            </div>

            {/* Stars */}
            <div className="flex star-rating gap-1">
              {[...Array(t?.rating)]?.map((_, i) => (
                <Icon key={i} name="StarIcon" size={16} variant="solid" />
              ))}
            </div>

            {/* Quote */}
            <blockquote className="font-display text-xl sm:text-2xl md:text-4xl font-light italic leading-tight max-w-3xl text-primary-foreground">
              &quot;{t?.quote}&quot;
            </blockquote>

            {/* Product tag */}
            <span className="text-[10px] tracking-[0.3em] uppercase text-accent font-semibold border border-accent/30 px-3 py-1 rounded-full">
              {t?.product}
            </span>

            {/* Author */}
            <div className="flex flex-col items-center gap-3">
              <div className="w-14 h-14 rounded-full border-2 border-primary-foreground/20 overflow-hidden">
                <AppImage
                  src={t?.avatar}
                  alt={`${t?.name}, satisfied Madhav Fashion Studio customer`}
                  width={56}
                  height={56}
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                <p className="text-base font-bold uppercase tracking-widest">{t?.name}</p>
                <p className="text-[11px] tracking-[0.2em] uppercase text-primary-foreground/40 mt-0.5">
                  {t?.role}
                </p>
              </div>
            </div>

            {/* Dots */}
            <div className="flex gap-2">
              {testimonials?.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setActive(i)}
                  className={`w-2 h-2 rounded-full transition-all duration-300 ${
                    i === active ? 'bg-accent w-6' : 'bg-primary-foreground/20'
                  }`}
                  aria-label={`View testimonial ${i + 1}`}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
