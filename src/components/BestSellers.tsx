import React from 'react';
import { Award, ArrowRight } from 'lucide-react';
import { useShop } from '../context/ShopContext';
import { ProductCard } from './ProductCard';

export const BestSellers: React.FC = () => {
  const { products, setSelectedCategory } = useShop();

  // Filter verified bestsellers
  const bestSellers = products.filter((p) => p.isBestseller).slice(0, 6);

  const handleViewAll = () => {
    setSelectedCategory('All');
    const el = document.getElementById('catalog-section');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section className="py-14 sm:py-18 bg-[#FBF8F2]" id="bestsellers-section">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 pb-3 border-b border-[#C5A059]/20 gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 text-xs uppercase tracking-widest text-[#9E7D3B] font-semibold">
              <Award className="w-3.5 h-3.5" />
              <span>Connoisseur Favorites</span>
            </div>
            <h2 className="font-royal text-2xl sm:text-3xl lg:text-4xl font-bold text-[#241A15]">
              Most Cherished Masterpieces
            </h2>
            <p className="text-xs sm:text-sm text-[#5A4A42] font-light">
              Our highest-requested chains, royal bridal kada, and sovereign signet bands.
            </p>
          </div>

          <button
            onClick={handleViewAll}
            className="text-xs uppercase tracking-widest font-bold text-[#9E7D3B] hover:text-[#241A15] flex items-center gap-1 transition-colors group"
          >
            <span>Explore All Pieces</span>
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </button>
        </div>

        {/* Product Grid: strictly 2 cards per row per Correction 11 & 14 */}
        <div className="grid grid-cols-2 gap-3 sm:gap-6 max-w-4xl mx-auto">
          {bestSellers.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>

      </div>
    </section>
  );
};
