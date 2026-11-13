import React, { useState, useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight, Sparkles } from 'lucide-react';
import { useShop } from '../context/ShopContext';
import { LuxuryImage } from './LuxuryImage';

interface HeroSlide {
  id: string;
  type: 'video' | 'image';
  src: string;
  title: string;
  subtitle: string;
  tagline: string;
  categoryLink?: string;
  duration?: number; // duration in ms
}

const HERO_SLIDES: HeroSlide[] = [
  {
    id: 'hero-vid-1',
    type: 'video',
    src: '/assets/aistudio/1027650614_1794402913611040_0848f80e.mp4',
    title: 'Divine By Tradition',
    subtitle: 'Timeless By Trust',
    tagline: 'Mughal Heritage · 22K Royal Lustre Finish',
    duration: 3500 // 3.5 seconds before auto sliding to photos per Phase 7
  },
  {
    id: 'hero-img-1',
    type: 'image',
    src: '/assets/aistudio/IMG_20261113_104854_ccae4bc0.jpg',
    title: 'Sacred Medallions',
    subtitle: 'Kesari Lion Greek Key Medallion Pendant',
    tagline: 'Devotional & Lion Medallions · ₹850'
  },
  {
    id: 'hero-img-2',
    type: 'image',
    src: '/assets/aistudio/IMG_20261113_105111_e3e6cbb8.jpg',
    title: 'Imperial Kada & Bangles',
    subtitle: 'Kada Two-Tone Circular Medallion Hinged Pair',
    tagline: 'Traditional Royal Kada · ₹1,500 Pair'
  },
  {
    id: 'hero-img-3',
    type: 'image',
    src: '/assets/aistudio/IMG_20261113_113958_f2e46c33.jpg',
    title: 'Sovereign Royal Bands',
    subtitle: 'Nizam Cushion Halo Signet Ring',
    tagline: 'Solitaires, Signets & Bands · ₹1,400–₹1,500'
  },
  {
    id: 'hero-img-4',
    type: 'image',
    src: '/assets/aistudio/IMG_20261113_105710_2ad0e9b9.jpg',
    title: 'Pavé Luxury Bracelets',
    subtitle: 'Shahanshah Pavé Cuban Link Bracelet',
    tagline: 'Curb & Station Links · ₹1,580'
  }
];

export const HeroSlider: React.FC = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const videoRef = useRef<HTMLVideoElement>(null);
  const { setSelectedCategory } = useShop();

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % HERO_SLIDES.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + HERO_SLIDES.length) % HERO_SLIDES.length);
  };

  // Handle timer
  useEffect(() => {
    if (!isPlaying) return;

    const activeSlide = HERO_SLIDES[currentSlide];
    const duration = activeSlide.duration || 5000;

    const timer = setTimeout(() => {
      nextSlide();
    }, duration);

    return () => clearTimeout(timer);
  }, [currentSlide, isPlaying]);

  // Handle video element play
  useEffect(() => {
    if (HERO_SLIDES[currentSlide].type === 'video' && videoRef.current) {
      videoRef.current.currentTime = 0;
      videoRef.current.play().catch(() => {});
    }
  }, [currentSlide]);

  const handleExplore = () => {
    const el = document.getElementById('catalog-section');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section 
      className="relative w-full bg-[#1F1714] overflow-hidden select-none border-b border-[#C5A059]/20"
      onMouseEnter={() => setIsPlaying(false)}
      onMouseLeave={() => setIsPlaying(true)}
    >
      {/* Slider viewport */}
      <div className="relative h-[480px] sm:h-[560px] lg:h-[640px] w-full overflow-hidden">
        {HERO_SLIDES.map((slide, idx) => {
          const isActive = idx === currentSlide;
          return (
            <div
              key={slide.id}
              className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
                isActive ? 'opacity-100 z-10 pointer-events-auto' : 'opacity-0 z-0 pointer-events-none'
              }`}
            >
              {slide.type === 'video' ? (
                <div className="relative w-full h-full">
                  <video
                    ref={videoRef}
                    src={slide.src}
                    autoPlay
                    muted
                    loop
                    playsInline
                    className="w-full h-full object-cover object-top sm:object-center"
                  />
                  <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/50 to-transparent" />
                  <div className="absolute inset-0 bg-radial-at-c from-transparent via-black/30 to-black/80" />
                </div>
              ) : (
                <div className="relative w-full h-full">
                  <LuxuryImage
                    src={slide.src}
                    alt={slide.title}
                    aspectRatio="none"
                    priority={true}
                    containerClassName="w-full h-full"
                    className="transform scale-100 transition-transform duration-7000 ease-out hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/45 to-transparent pointer-events-none" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-transparent to-black/30 pointer-events-none" />
                </div>
              )}

              {/* Text & CTAs Content Overlay */}
              <div className="absolute inset-0 flex items-center">
                <div className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-16 w-full">
                  <div className="max-w-2xl space-y-3 sm:space-y-4">
                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-black/40 backdrop-blur-md rounded-full border border-[#C5A059]/40 text-[#DFCA9B] text-xs font-medium tracking-widest uppercase">
                      <Sparkles className="w-3.5 h-3.5 text-[#C5A059]" />
                      <span>{slide.tagline}</span>
                    </div>

                    <h2 className="font-royal text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#FBF8F2] tracking-wide leading-tight">
                      {slide.title}
                    </h2>

                    <p className="font-luxury-serif text-xl sm:text-2xl text-[#DFCA9B] italic">
                      {slide.subtitle}
                    </p>

                    <div className="pt-4 flex flex-wrap items-center gap-4">
                      <button
                        onClick={handleExplore}
                        className="px-6 py-3 bg-[#C5A059] hover:bg-[#9E7D3B] text-[#1A130F] font-semibold text-xs tracking-widest uppercase rounded-sm shadow-xl transition-all"
                      >
                        Explore Collection
                      </button>
                      <button
                        onClick={() => {
                          setSelectedCategory('Rings');
                          handleExplore();
                        }}
                        className="px-6 py-3 border border-[#DFCA9B]/50 hover:border-[#DFCA9B] text-[#DFCA9B] hover:text-white text-xs tracking-widest uppercase rounded-sm backdrop-blur-xs transition-all"
                      >
                        Explore Rings Collection
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}

        {/* Manual Left / Right Navigation Arrows */}
        <button
          onClick={prevSlide}
          className="absolute left-4 top-1/2 -translate-y-1/2 z-20 p-2 sm:p-3 rounded-full bg-black/40 hover:bg-black/70 text-[#DFCA9B] border border-[#C5A059]/30 transition-all focus-visible:outline-[#C5A059]"
          aria-label="Previous Slide"
        >
          <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6" />
        </button>

        <button
          onClick={nextSlide}
          className="absolute right-4 top-1/2 -translate-y-1/2 z-20 p-2 sm:p-3 rounded-full bg-black/40 hover:bg-black/70 text-[#DFCA9B] border border-[#C5A059]/30 transition-all focus-visible:outline-[#C5A059]"
          aria-label="Next Slide"
        >
          <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6" />
        </button>

        {/* Pagination Dots Indicators */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2.5">
          {HERO_SLIDES.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrentSlide(i)}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                i === currentSlide
                  ? 'w-8 bg-[#C5A059]'
                  : 'w-2 bg-white/40 hover:bg-white/70'
              }`}
              aria-label={`Go to slide ${i + 1}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
};
