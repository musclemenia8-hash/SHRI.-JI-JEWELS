import React from 'react';
import { ArrowUpRight, ArrowRight, Sparkles, LayoutGrid } from 'lucide-react';
import { useShop } from '../context/ShopContext';
import { CategoryType } from '../types';
import { LuxuryImage } from './LuxuryImage';

export const ShopByCategory: React.FC = () => {
  const { products, categories, setSelectedCategory, setIsAllCategoriesOpen } = useShop();

  // Curated representative photos for each genuine category
  const categoryImages: Record<CategoryType, string> = {
    Chains: '/assets/aistudio/IMG_20261113_122954_49e29eb9.jpg',
    Rings: '/assets/aistudio/IMG_20261113_113958_f2e46c33.jpg',
    Kada: '/assets/aistudio/IMG_20261113_075757_5aea3a2b.jpg',
    'Ladies Sets': '/assets/aistudio/IMG_20261113_100244_e8a65b49.jpg',
    Mangalsutra: '/assets/aistudio/IMG_20261113_075631_53f93a92.jpg',
    Earrings: '/assets/aistudio/IMG_20261113_075512_c4448a0b.jpg',
    Pendants: '/assets/aistudio/IMG_20261113_104854_ccae4bc0.jpg',
    Bracelets: '/assets/aistudio/IMG_20261113_105710_2ad0e9b9.jpg',
  };

  const categorySubtitles: Record<CategoryType, string> = {
    Chains: 'Fine & Statement Handcrafted Links (₹1,400–₹2,600)',
    Rings: 'Solitaires, Babbar Sher & Bands (₹1,400–₹1,500)',
    Kada: 'Rajwada Mesh & Traditional Kada (Fixed ₹1,500)',
    'Ladies Sets': 'Royal Bridal Haars & Jhumka Sets (₹2,800–₹3,200)',
    Mangalsutra: 'Auspicious Kalash & Ruby Motifs (₹1,400–₹1,500)',
    Earrings: 'Swans, Hearts & Floral Latkans (₹1,400–₹1,500)',
    Pendants: 'Lion Medallions, Shiva & Hanuman Gada (₹800–₹900)',
    Bracelets: 'Royal Cuban & Stone Link Pieces (₹1,500–₹1,600)',
  };

  const handleSelectCategory = (categoryName: CategoryType | 'All') => {
    setSelectedCategory(categoryName);
    const catalogEl = document.getElementById('catalog-section');
    if (catalogEl) {
      catalogEl.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // CORRECTION 8: Homepage displays exactly the first 6 categories in 2 columns (3 rows of 2 cards)
  const homepageCategories = categories.slice(0, 6);

  return (
    <section className="py-12 sm:py-16 bg-[#FBF8F2]" id="categories-section">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-8 sm:mb-12 space-y-2">
          <div className="inline-flex items-center gap-1.5 text-xs uppercase tracking-widest text-[#9E7D3B] font-semibold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Curated Sovereign Collections</span>
            <Sparkles className="w-3.5 h-3.5" />
          </div>
          <h2 className="font-royal text-2xl sm:text-3xl lg:text-4xl font-bold text-[#241A15]">
            Shop By Category
          </h2>
          <p className="text-xs sm:text-sm text-[#5A4A42] font-light">
            Explore our verified collection across royal categories with direct artisan pricing and 22K gold micro-polish.
          </p>
        </div>

        {/* CORRECTION 8: Exactly Two Category Cards Per Row across all screens (3 rows of 2 cards = 6 cards) */}
        <div className="grid grid-cols-2 gap-3.5 sm:gap-6 max-w-4xl mx-auto">
          {homepageCategories.map((cat) => {
            const imgSrc = categoryImages[cat.name] || '/assets/aistudio/IMG_20261112_144610_4413d601.jpg';
            const subtitle = categorySubtitles[cat.name] || 'Handcrafted Quality';

            return (
              <div
                key={cat.name}
                onClick={() => handleSelectCategory(cat.name)}
                className="group relative rounded-lg overflow-hidden bg-white border border-[#C5A059]/30 shadow-xs hover:shadow-xl transition-all duration-300 cursor-pointer flex flex-col"
              >
                {/* Image Container with exact 1200x1200 (1:1) AI-cropped HD photo */}
                <div className="relative aspect-square w-full overflow-hidden bg-[#F5EFEB]">
                  <LuxuryImage
                    src={imgSrc}
                    alt={cat.name}
                    aspectRatio="square"
                    fit={cat.name === 'Chains' || cat.name === 'Rings' ? 'contain' : 'cover'}
                    className={
                      cat.name === 'Chains' || cat.name === 'Rings'
                        ? 'transition-transform duration-500 ease-out'
                        : 'group-hover:scale-108 transition-transform duration-700 ease-out'
                    }
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-transparent pointer-events-none" />
                  
                  {/* Item Count Tag */}
                  <div className="absolute top-2 right-2 sm:top-3 sm:right-3 text-[10px] sm:text-[11px] font-mono font-medium tracking-wide text-white bg-black/60 backdrop-blur-md px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-sm border border-white/20 tabular-nums">
                    {cat.count} Designs
                  </div>

                  {/* Corner Accent Arrow */}
                  <div className="absolute bottom-2 right-2 sm:bottom-3 sm:right-3 p-1.5 sm:p-2 rounded-full bg-white/20 backdrop-blur-md text-white group-hover:bg-[#C5A059] group-hover:text-black transition-all">
                    <ArrowUpRight className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  </div>

                  {/* Title overlay */}
                  <div className="absolute bottom-2 left-2.5 right-10 sm:bottom-3 sm:left-4 sm:right-12 text-white">
                    <h3 className="font-royal text-sm sm:text-lg font-bold text-white tracking-wide truncate">
                      {cat.name}
                    </h3>
                    <p className="text-[10px] sm:text-xs text-[#DFCA9B] font-light truncate">
                      {subtitle}
                    </p>
                  </div>
                </div>

                {/* Bottom link strip */}
                <div className="p-2.5 sm:p-3 bg-white flex items-center justify-between text-[11px] sm:text-xs font-semibold text-[#241A15] group-hover:text-[#9E7D3B] transition-colors border-t border-[#F5EFEB]">
                  <span className="uppercase tracking-wider">Explore {cat.name}</span>
                  <span className="text-[#9E7D3B] hidden sm:inline">View Collection →</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* CORRECTION 8: Prominent "VIEW ALL CATEGORIES" button below the 6th card */}
        <div className="max-w-4xl mx-auto mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
          <button
            onClick={() => setIsAllCategoriesOpen(true)}
            className="w-full sm:w-auto px-8 py-3.5 bg-[#493326] text-[#F7EFE1] hover:bg-[#342217] hover:text-[#C5A36A] border border-[#C5A36A]/50 rounded-md font-royal text-xs sm:text-sm font-bold tracking-[0.16em] uppercase transition-all shadow-md hover:shadow-xl flex items-center justify-center gap-2.5 cursor-pointer"
          >
            <LayoutGrid className="w-4 h-4 text-[#C5A36A]" />
            <span>VIEW ALL CATEGORIES ({categories.length} COLLECTIONS)</span>
            <ArrowRight className="w-4 h-4 text-[#C5A36A]" />
          </button>
        </div>

        {/* Full-width "Browse All Masterpieces" Banner beneath */}
        <div className="max-w-4xl mx-auto mt-6">
          <div
            onClick={() => handleSelectCategory('All')}
            className="group relative rounded-lg overflow-hidden bg-gradient-to-r from-[#241A15] via-[#2D1F17] to-[#1E140F] text-[#FBF8F2] border border-[#C5A059]/40 p-4 sm:p-6 cursor-pointer shadow-md hover:shadow-xl transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
          >
            <div>
              <span className="text-[10px] uppercase tracking-widest text-[#C5A059] font-bold block mb-1">
                Complete Sovereign Catalogue
              </span>
              <h3 className="font-royal text-base sm:text-xl font-bold text-white">
                Explore All {products.length} Masterpieces
              </h3>
              <p className="text-xs text-[#DFCA9B]/80 font-light mt-0.5">
                Chains, kada pairs, signet rings, bridal sets, mangalsutras, pendants & earrings.
              </p>
            </div>

            <button
              onClick={(e) => {
                e.stopPropagation();
                handleSelectCategory('All');
              }}
              className="px-5 py-2.5 bg-[#C5A059] hover:bg-[#9E7D3B] text-[#1A130F] font-bold text-xs uppercase tracking-wider rounded-sm transition-colors flex items-center justify-center gap-2 shrink-0 shadow-sm cursor-pointer"
            >
              <span>Browse All</span>
              <ArrowUpRight className="w-4 h-4" />
            </button>
          </div>
        </div>

      </div>
    </section>
  );
};
