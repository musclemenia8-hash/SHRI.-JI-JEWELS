import React, { useMemo } from 'react';
import { Filter, SlidersHorizontal, RotateCcw } from 'lucide-react';
import { useShop } from '../context/ShopContext';
import { ProductCard } from './ProductCard';
import { CategoryType, AudienceType } from '../types';

export const ProductCatalog: React.FC = () => {
  const {
    products,
    categories,
    selectedCategory,
    setSelectedCategory,
    selectedAudience,
    setSelectedAudience,
    searchQuery,
    setSearchQuery,
    sortBy,
    setSortBy,
  } = useShop();

  // Filter & Sort
  const filteredProducts = useMemo(() => {
    return products
      .filter((p) => {
        // Category filter
        if (selectedCategory !== 'All' && p.primaryCategory !== selectedCategory) {
          return false;
        }
        // Audience filter
        if (selectedAudience !== 'All' && p.audience !== selectedAudience) {
          return false;
        }
        // Search filter
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase().trim();
          const matchTitle = p.name.toLowerCase().includes(q);
          const matchCat = p.primaryCategory.toLowerCase().includes(q);
          const matchType = p.productType.toLowerCase().includes(q);
          const matchDesc = p.description.toLowerCase().includes(q);
          const matchId = p.id.toLowerCase().includes(q);
          if (!matchTitle && !matchCat && !matchType && !matchDesc && !matchId) {
            return false;
          }
        }
        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'price-low') {
          return a.sellingPrice - b.sellingPrice;
        }
        if (sortBy === 'price-high') {
          return b.sellingPrice - a.sellingPrice;
        }
        if (sortBy === 'newest') {
          return (b.isNewArrival ? 1 : 0) - (a.isNewArrival ? 1 : 0);
        }
        return 0; // default order
      });
  }, [products, selectedCategory, selectedAudience, searchQuery, sortBy]);

  const resetFilters = () => {
    setSelectedCategory('All');
    setSelectedAudience('All');
    setSearchQuery('');
    setSortBy('featured');
  };

  const hasActiveFilters =
    selectedCategory !== 'All' ||
    selectedAudience !== 'All' ||
    searchQuery.trim() !== '' ||
    sortBy !== 'featured';

  return (
    <section className="py-14 sm:py-18 bg-white" id="catalog-section">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Title */}
        <div className="text-center max-w-2xl mx-auto mb-10 space-y-2">
          <span className="text-xs uppercase tracking-widest text-[#9E7D3B] font-semibold">
            The Complete Vault
          </span>
          <h2 className="font-royal text-2xl sm:text-3xl lg:text-4xl font-bold text-[#241A15]">
            Handcrafted Royal Jewellery Catalogue
          </h2>
          <p className="text-xs sm:text-sm text-[#5A4A42] font-light">
            Every piece is cast in durable brass-copper core with 22K radiant gold polish. Direct artisan prices following approved matrix: ₹800 to ₹3,200.
          </p>
        </div>

        {/* Filters Toolbar */}
        <div className="bg-[#FBF8F2] rounded-lg p-4 sm:p-5 border border-[#C5A059]/25 shadow-xs mb-8 space-y-4">
          
          {/* Top Row: Category Tabs */}
          <div className="flex items-center justify-between flex-wrap gap-2 pb-3 border-b border-[#C5A059]/15">
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-full scrollbar-none">
              <button
                onClick={() => setSelectedCategory('All')}
                className={`px-3 py-1.5 text-xs font-semibold rounded-sm whitespace-nowrap transition-colors ${
                  selectedCategory === 'All'
                    ? 'bg-[#241A15] text-[#DFCA9B]'
                    : 'bg-white text-[#5A4A42] hover:text-[#241A15] border border-[#C5A059]/20'
                }`}
              >
                All Masterpieces ({products.length})
              </button>
              {categories.map((cat) => (
                <button
                  key={cat.name}
                  onClick={() => setSelectedCategory(cat.name)}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-sm whitespace-nowrap transition-colors ${
                    selectedCategory === cat.name
                      ? 'bg-[#241A15] text-[#DFCA9B]'
                      : 'bg-white text-[#5A4A42] hover:text-[#241A15] border border-[#C5A059]/20'
                  }`}
                >
                  {cat.name} ({cat.count})
                </button>
              ))}
            </div>

            {hasActiveFilters && (
              <button
                onClick={resetFilters}
                className="text-xs text-[#9E7D3B] hover:text-[#241A15] font-semibold flex items-center gap-1 transition-colors ml-auto sm:ml-0 cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset Filters</span>
              </button>
            )}
          </div>

          {/* Bottom Row: Audience & Sorting */}
          <div className="flex flex-wrap items-center justify-between gap-4 text-xs">
            {/* Audience Segmented Controls */}
            <div className="flex items-center gap-2">
              <span className="text-[#5A4A42] font-medium flex items-center gap-1">
                <Filter className="w-3.5 h-3.5 text-[#9E7D3B]" />
                <span>Audience:</span>
              </span>
              <div className="flex items-center gap-1">
                {(['All', 'Men', 'Women', 'Unisex'] as (AudienceType | 'All')[]).map((aud) => (
                  <button
                    key={aud}
                    onClick={() => setSelectedAudience(aud)}
                    className={`px-2.5 py-1 rounded-sm font-medium transition-colors cursor-pointer ${
                      selectedAudience === aud
                        ? 'bg-[#9E7D3B] text-white'
                        : 'bg-white text-[#5A4A42] hover:text-[#241A15] border border-[#C5A059]/20'
                    }`}
                  >
                    {aud}
                  </button>
                ))}
              </div>
            </div>

            {/* Sort Dropdown */}
            <div className="flex items-center gap-2 ml-auto">
              <span className="text-[#5A4A42] font-medium flex items-center gap-1">
                <SlidersHorizontal className="w-3.5 h-3.5 text-[#9E7D3B]" />
                <span>Sort By:</span>
              </span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="bg-white border border-[#C5A059]/30 text-[#241A15] px-2.5 py-1 rounded-sm focus:outline-hidden focus:border-[#9E7D3B]"
              >
                <option value="featured">Royal Featured</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="newest">Newest First</option>
              </select>
            </div>
          </div>

          {/* Search Indicator badge if search is active */}
          {searchQuery && (
            <div className="pt-2 flex items-center gap-2 text-xs text-[#5A4A42]">
              <span>Active Search:</span>
              <span className="font-semibold text-[#241A15]">"{searchQuery}"</span>
              <button
                onClick={() => setSearchQuery('')}
                className="text-red-700 hover:underline ml-1"
              >
                Clear
              </button>
            </div>
          )}
        </div>

        {/* Product Count Status */}
        <div className="flex items-center justify-between mb-6 text-xs text-[#5A4A42]">
          <span>
            Showing <strong className="text-[#241A15] tabular-nums">{filteredProducts.length}</strong> of{' '}
            <span className="tabular-nums">{products.length}</span> verified pieces
          </span>
          <span className="hidden sm:inline text-[#9E7D3B]">
            All prices verified against WhatsApp merchant catalog
          </span>
        </div>

        {/* Product Grid: strictly 2 cards per row per Correction 11 */}
        {filteredProducts.length > 0 ? (
          <div className="grid grid-cols-2 gap-3 sm:gap-6 max-w-4xl sm:max-w-5xl mx-auto">
            {filteredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16 bg-[#FBF8F2] rounded-lg border border-[#C5A059]/20 p-8 space-y-4">
            <div className="w-12 h-12 mx-auto rounded-full bg-[#F5EFEB] flex items-center justify-center text-[#9E7D3B]">
              <Filter className="w-6 h-6" />
            </div>
            <h3 className="font-royal text-lg font-bold text-[#241A15]">
              No Masterpieces Match Your Selection
            </h3>
            <p className="text-xs text-[#5A4A42] max-w-sm mx-auto">
              We could not find any items matching your active category or search query.
            </p>
            <button
              onClick={resetFilters}
              className="px-4 py-2 bg-[#241A15] text-[#DFCA9B] text-xs uppercase tracking-wider font-semibold rounded-sm hover:bg-[#9E7D3B] transition-colors"
            >
              Reset All Filters
            </button>
          </div>
        )}

      </div>
    </section>
  );
};
