import React, { useState, useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight, Eye, Sparkles } from 'lucide-react';
import { useShop } from '../context/ShopContext';
import { LuxuryImage } from './LuxuryImage';

interface CollageProduct {
  id: string;
  name: string;
  category: string;
  price: number;
  image: string;
}

interface CollageSlide {
  id: string;
  themeTitle: string;
  themeSubtitle: string;
  description: string;
  products: [CollageProduct, CollageProduct, CollageProduct, CollageProduct]; // Exactly 4 square items
}

const COLLAGE_SLIDES: CollageSlide[] = [
  {
    id: 'collage-1',
    themeTitle: 'The Royal Heritage Ensemble',
    themeSubtitle: 'Bridal Kada, Parallel Curb Chain, Devotional Lion & Sphere Ring',
    description: 'An integrated composition celebrating classic Indian goldsmithing with warm 22K lustre finish.',
    products: [
      {
        id: 'SJJ-KD-15',
        name: 'Kada Greek Key Jaali Openwork Pair',
        category: 'Kada',
        price: 1500,
        image: '/assets/aistudio/IMG_20261113_095141_48654387.jpg',
      },
      {
        id: 'SJJ-CH-29',
        name: 'Rajwada Double-Loop Parallel Curb Chain',
        category: 'Chains',
        price: 2480,
        image: '/assets/aistudio/IMG_20261113_122438_cdf53a39.jpg',
      },
      {
        id: 'SJJ-PD-06',
        name: 'Kesari Lion Greek Key Medallion Pendant',
        category: 'Pendants',
        price: 850,
        image: '/assets/aistudio/IMG_20261113_104854_ccae4bc0.jpg',
      },
      {
        id: 'SJJ-RG-41',
        name: 'Tarang Tri-Loop Sphere Cuff Ring',
        category: 'Rings',
        price: 1460,
        image: '/assets/aistudio/IMG_20261113_113339_6636a191.jpg',
      },
    ],
  },
  {
    id: 'collage-2',
    themeTitle: 'Sovereign Links & Devotion',
    themeSubtitle: 'Braided Collar Chain, Greek Kada, Om Dome Ring & Heart Drop Earrings',
    description: 'Structured chains and protective traditional symbols forged with meticulous detail.',
    products: [
      {
        id: 'SJJ-CH-30',
        name: 'Surya S-Scroll Braided Wheat Collar Chain',
        category: 'Chains',
        price: 2440,
        image: '/assets/aistudio/IMG_20261113_122801_60bdd5af.jpg',
      },
      {
        id: 'SJJ-KD-22',
        name: 'Kada Two-Tone Circular Medallion Hinged Pair',
        category: 'Kada',
        price: 1500,
        image: '/assets/aistudio/IMG_20261113_105111_e3e6cbb8.jpg',
      },
      {
        id: 'SJJ-RG-33',
        name: 'Pavitra Om Jaali Filigree Dome Ring',
        category: 'Rings',
        price: 1490,
        image: '/assets/aistudio/IMG_20261113_113940_140fca60.jpg',
      },
      {
        id: 'SJJ-ER-02',
        name: 'Noorani Twin Heart Drop Gold Earrings',
        category: 'Earrings',
        price: 1450,
        image: '/assets/aistudio/IMG_20261113_075512_c4448a0b.jpg',
      },
    ],
  },
  {
    id: 'collage-3',
    themeTitle: 'Rajputana Splendor & Pavé',
    themeSubtitle: 'Byzantine Chain, Ruby Kada, Pavé Bracelet & Hanuman Ji Pendant',
    description: 'Vibrant ruby stone inlays, intricate Byzantine weave, and sacred Gada icon.',
    products: [
      {
        id: 'SJJ-CH-34',
        name: 'Maharaja Byzantine & Ribbed Station Chain',
        category: 'Chains',
        price: 2560,
        image: '/assets/aistudio/IMG_20261113_122954_49e29eb9.jpg',
      },
      {
        id: 'SJJ-KD-23',
        name: 'Kada Deep Red Oval Filigree Wide Pair',
        category: 'Kada',
        price: 1500,
        image: '/assets/aistudio/IMG_20261113_105046_2e1fe345.jpg',
      },
      {
        id: 'SJJ-BR-07',
        name: 'Shahanshah Pavé Cuban Link Bracelet',
        category: 'Bracelets',
        price: 1580,
        image: '/assets/aistudio/IMG_20261113_105710_2ad0e9b9.jpg',
      },
      {
        id: 'SJJ-PD-10',
        name: 'Veer Bajrangbali Standing Gada Pendant',
        category: 'Pendants',
        price: 890,
        image: '/assets/aistudio/IMG_20261113_104936_7fa5ab98.jpg',
      },
    ],
  },
];

export const CollageSlider: React.FC = () => {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const { products, setSelectedProduct } = useShop();

  // Touch swipe support for mobile
  const touchStartX = useRef<number>(0);
  const touchEndX = useRef<number>(0);

  const handleOpenProduct = (id: string) => {
    const found = products.find((p) => p.id === id);
    if (found) {
      setSelectedProduct(found);
    }
  };

  const nextCollage = () => {
    setCurrentIdx((prev) => (prev + 1) % COLLAGE_SLIDES.length);
  };

  const prevCollage = () => {
    setCurrentIdx((prev) => (prev - 1 + COLLAGE_SLIDES.length) % COLLAGE_SLIDES.length);
  };

  // Optional gentle autoplay that pauses on hover (7 seconds)
  useEffect(() => {
    if (isPaused) return;
    const timer = setInterval(() => {
      nextCollage();
    }, 7000);
    return () => clearInterval(timer);
  }, [isPaused, currentIdx]);

  // Touch handlers
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.targetTouches[0].clientX;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.targetTouches[0].clientX;
  };

  const handleTouchEnd = () => {
    const diff = touchStartX.current - touchEndX.current;
    if (Math.abs(diff) > 50) {
      if (diff > 0) {
        nextCollage(); // Swiped left -> next
      } else {
        prevCollage(); // Swiped right -> prev
      }
    }
  };

  const current = COLLAGE_SLIDES[currentIdx];

  return (
    <section
      className="py-12 sm:py-16 bg-[#F5EFEB] select-none"
      id="collage-slider-section"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Editorial Section Heading */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-6 pb-3 border-b border-[#C5A059]/25 gap-3">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs uppercase tracking-widest text-[#9E7D3B] font-semibold">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Curated 4-Photo Editorial Collage</span>
            </div>
            <h2 className="font-royal text-xl sm:text-2xl lg:text-3xl font-bold text-[#241A15] mt-0.5">
              {current.themeTitle}
            </h2>
            <p className="text-xs text-[#5A4A42] font-light mt-0.5">
              {current.themeSubtitle}
            </p>
          </div>

          {/* Controls: Slide Counter & Prev/Next Arrows */}
          <div className="flex items-center gap-3 shrink-0">
            <span className="text-xs font-mono tabular-nums text-[#5A4A42]">
              0{currentIdx + 1} / 0{COLLAGE_SLIDES.length}
            </span>
            <div className="flex items-center gap-1.5">
              <button
                onClick={prevCollage}
                className="p-2 rounded-full border border-[#C5A059]/40 bg-white hover:bg-[#FBF8F2] text-[#241A15] transition-colors cursor-pointer"
                aria-label="Previous Collage"
                title="Previous Collage"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={nextCollage}
                className="p-2 rounded-full border border-[#C5A059]/40 bg-white hover:bg-[#FBF8F2] text-[#241A15] transition-colors cursor-pointer"
                aria-label="Next Collage"
                title="Next Collage"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* SYSTEM 6: Single Integrated 2 × 2 Square Photo Collage Composition */}
        <div className="relative rounded-lg overflow-hidden border border-[#C5A059]/35 bg-[#241A15] shadow-xl">
          <div
            key={current.id}
            className="grid grid-cols-2 divide-x divide-y divide-[#C5A059]/30 transition-opacity duration-500 ease-out"
          >
            {current.products.map((item, idx) => (
              <div
                key={item.id}
                onClick={() => handleOpenProduct(item.id)}
                className="group relative aspect-square bg-[#1E140F] overflow-hidden cursor-pointer flex flex-col justify-end p-3 sm:p-5"
              >
                {/* 100% Square Photograph processed through centralized AI pipeline */}
                <LuxuryImage
                  src={item.image}
                  alt={item.name}
                  aspectRatio="none"
                  fit={item.category === 'Chains' || item.category === 'Rings' ? 'contain' : 'cover'}
                  containerClassName="!absolute inset-0 w-full h-full"
                  className={
                    item.category === 'Chains' || item.category === 'Rings'
                      ? 'transition-transform duration-500 ease-out'
                      : 'transition-transform duration-700 ease-out group-hover:scale-108'
                  }
                />

                {/* Subtle vignette gradient */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-transparent opacity-90 group-hover:opacity-95 transition-opacity pointer-events-none" />

                {/* Details Overlay */}
                <div className="relative z-10 flex flex-col justify-end">
                  <span className="text-[9px] sm:text-[10px] uppercase tracking-widest text-[#DFCA9B] font-semibold truncate">
                    {item.category}
                  </span>
                  
                  <h3 className="font-royal text-xs sm:text-sm md:text-base font-bold text-white line-clamp-1 leading-tight group-hover:text-[#DFCA9B] transition-colors">
                    {item.name}
                  </h3>

                  <div className="pt-1 flex items-center justify-between">
                    <span className="text-xs sm:text-sm font-bold text-white tabular-nums">
                      ₹{item.price.toLocaleString('en-IN')}
                    </span>
                    
                    <span className="p-1 sm:p-1.5 rounded-full bg-white/20 backdrop-blur-md text-white group-hover:bg-[#C5A059] group-hover:text-black transition-all">
                      <Eye className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Pagination Dots Indicators */}
        <div className="mt-4 flex items-center justify-center gap-2">
          {COLLAGE_SLIDES.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrentIdx(i)}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                i === currentIdx ? 'w-6 bg-[#C5A059]' : 'w-2 bg-[#C5A059]/30 hover:bg-[#C5A059]/60'
              }`}
              aria-label={`Go to Collage ${i + 1}`}
            />
          ))}
        </div>

      </div>
    </section>
  );
};
