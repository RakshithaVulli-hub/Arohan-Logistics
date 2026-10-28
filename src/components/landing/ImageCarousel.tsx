import React, { useState, useEffect, useCallback, useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface Slide {
  id: number;
  image: string;
  fallbackImage: string;
  heading: string;
  description: string;
  alt: string;
  tag: string;
}

const SLIDES: Slide[] = [
  {
    id: 1,
    image: '/slide-fields.jpg',
    fallbackImage: 'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?auto=format&fit=crop&w=1600&q=80',
    heading: 'From Farms to Fresh Markets',
    description: 'Supporting farmers with smarter storage and logistics solutions.',
    alt: 'Green agricultural crop fields and fresh produce harvesting',
    tag: 'Agricultural Crop Fields'
  },
  {
    id: 2,
    image: '/slide-transport.jpg',
    fallbackImage: 'https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?auto=format&fit=crop&w=1600&q=80',
    heading: 'Reliable Cold-Chain Transport',
    description: 'Connecting farms, storage facilities, and markets through efficient transportation.',
    alt: 'Refrigerated transport vehicles and temperature-controlled logistics',
    tag: 'Refrigerated Transport'
  },
  {
    id: 3,
    image: '/slide-coldstorage.jpg',
    fallbackImage: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=1600&q=80',
    heading: 'Preserving Freshness',
    description: 'Helping protect harvested produce through suitable storage and temperature monitoring.',
    alt: 'Modern cold storage warehouse and temperature-controlled storage chambers',
    tag: 'Modern Cold Storage'
  },
  {
    id: 4,
    image: '/slide-produce.jpg',
    fallbackImage: 'https://images.unsplash.com/photo-1610348725531-843dff563e2c?auto=format&fit=crop&w=1600&q=80',
    heading: 'Better Logistics for Farmers',
    description: 'Reducing post-harvest losses through coordinated cold-chain services.',
    alt: 'Fresh harvested vegetables, fruits, and agricultural produce in crates',
    tag: 'Fresh Produce & Farmers'
  }
];

const AUTO_SLIDE_INTERVAL_MS = 5000;

export const ImageCarousel: React.FC = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const timerRef = useRef<number | null>(null);

  const goToNext = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % SLIDES.length);
  }, []);

  const goToPrev = useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + SLIDES.length) % SLIDES.length);
  }, []);

  const goToSlide = (index: number) => {
    setCurrentIndex(index);
  };

  // Handle automatic timer with pause support and cleanup
  useEffect(() => {
    // Check if user prefers reduced motion
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion || isPaused) {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }

    timerRef.current = window.setInterval(() => {
      goToNext();
    }, AUTO_SLIDE_INTERVAL_MS);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [goToNext, isPaused]);

  // Handle keyboard navigation when focused
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowLeft') {
      goToPrev();
    } else if (e.key === 'ArrowRight') {
      goToNext();
    }
  };

  return (
    <section 
      aria-label="Agricultural Cold-Chain Highlights Carousel"
      className="relative w-full bg-slate-950 overflow-hidden select-none"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onFocus={() => setIsPaused(true)}
      onBlur={() => setIsPaused(false)}
      onKeyDown={handleKeyDown}
      tabIndex={0}
    >
      {/* Banner Height Container */}
      <div className="relative w-full h-[280px] sm:h-[380px] md:h-[440px] lg:h-[480px]">
        
        {/* Slides */}
        {SLIDES.map((slide, index) => {
          const isActive = index === currentIndex;
          return (
            <div
              key={slide.id}
              aria-hidden={!isActive}
              className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${
                isActive ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'
              }`}
            >
              {/* Slide Background Image */}
              <img
                src={slide.image}
                alt={slide.alt}
                loading={index === 0 ? 'eager' : 'lazy'}
                className="w-full h-full object-cover object-center"
                onError={(e) => {
                  if (e.currentTarget.src !== slide.fallbackImage) {
                    e.currentTarget.src = slide.fallbackImage;
                  }
                }}
              />

              {/* Legibility Dark Gradient Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/45 to-slate-950/20" />

              {/* Text Content Overlay */}
              <div className="absolute inset-0 flex items-end">
                <div className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pb-12 sm:pb-14 lg:pb-16">
                  <div className="max-w-2xl space-y-2 sm:space-y-3 text-white">
                    <span className="inline-block text-[11px] sm:text-xs font-bold uppercase tracking-wider text-emerald-300 bg-emerald-950/80 px-2.5 py-1 rounded-md border border-emerald-500/30 backdrop-blur-xs">
                      {slide.tag}
                    </span>
                    <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-extrabold tracking-tight font-display drop-shadow-sm leading-tight text-white">
                      {slide.heading}
                    </h2>
                    <p className="text-xs sm:text-sm md:text-base text-slate-200 leading-relaxed max-w-xl font-normal drop-shadow-xs">
                      {slide.description}
                    </p>
                  </div>
                </div>
              </div>

            </div>
          );
        })}

        {/* Previous Arrow Button */}
        <button
          type="button"
          onClick={goToPrev}
          aria-label="Previous slide"
          className="absolute left-3 sm:left-6 top-1/2 -translate-y-1/2 z-20 w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-slate-900/60 hover:bg-slate-900/90 text-white flex items-center justify-center border border-white/20 backdrop-blur-xs transition-colors shadow-md focus:outline-hidden focus:ring-2 focus:ring-emerald-400"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>

        {/* Next Arrow Button */}
        <button
          type="button"
          onClick={goToNext}
          aria-label="Next slide"
          className="absolute right-3 sm:right-6 top-1/2 -translate-y-1/2 z-20 w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-slate-900/60 hover:bg-slate-900/90 text-white flex items-center justify-center border border-white/20 backdrop-blur-xs transition-colors shadow-md focus:outline-hidden focus:ring-2 focus:ring-emerald-400"
        >
          <ChevronRight className="w-6 h-6" />
        </button>

        {/* Clickable Slide Indicator Dots */}
        <div 
          className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-950/60 backdrop-blur-xs border border-white/10"
          role="tablist"
          aria-label="Slides"
        >
          {SLIDES.map((slide, index) => {
            const isActive = index === currentIndex;
            return (
              <button
                key={slide.id}
                type="button"
                role="tab"
                aria-selected={isActive}
                aria-label={`Go to slide ${index + 1}: ${slide.heading}`}
                onClick={() => goToSlide(index)}
                className={`transition-all duration-300 rounded-full focus:outline-hidden ${
                  isActive
                    ? 'w-6 h-2 bg-emerald-400 shadow-xs'
                    : 'w-2 h-2 bg-white/50 hover:bg-white/80'
                }`}
              />
            );
          })}
        </div>

      </div>
    </section>
  );
};
