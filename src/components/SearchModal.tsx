import React, { useState, useEffect, useRef } from 'react';
import { X, Search, ArrowRight } from 'lucide-react';
import { useShop } from '../context/ShopContext';
import { LuxuryImage } from './LuxuryImage';

export const SearchModal: React.FC = () => {
  const {
    products,
    isSearchOpen,
    setIsSearchOpen,
    setSelectedProduct,
    setSelectedCategory,
  } = useShop();

  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isSearchOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery('');
    }
  }, [isSearchOpen]);

  if (!isSearchOpen) return null;

  const results = query.trim()
    ? products.filter((p) => {
        const q = query.toLowerCase().trim();
        return (
          p.name.toLowerCase().includes(q) ||
          p.primaryCategory.toLowerCase().includes(q) ||
          p.productType.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q) ||
          p.id.toLowerCase().includes(q) ||
          p.audience.toLowerCase().includes(q)
        );
      })
    : [];

  const handleSelectProduct = (product: any) => {
    setIsSearchOpen(false);
    setSelectedProduct(product);
  };

  const handleQuickKeyword = (kw: string) => {
    setQuery(kw);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center p-4 sm:p-6 pt-16 sm:pt-24">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-[#241A15]/75 backdrop-blur-xs transition-opacity"
        onClick={() => setIsSearchOpen(false)}
      />

      {/* Modal Content */}
      <div className="relative w-full max-w-2xl bg-white rounded-lg shadow-2xl border border-[#C5A059]/40 z-10 overflow-hidden">
        
        {/* Search input bar */}
        <div className="p-4 sm:p-5 border-b border-[#C5A059]/20 flex items-center gap-3 bg-[#FBF8F2]">
          <Search className="w-5 h-5 text-[#9E7D3B]" />
          <input
            ref={inputRef}
            type="text"
            placeholder="Search chains, signet rings, kada, devotional pendants..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="flex-1 bg-transparent border-none text-sm text-[#241A15] placeholder-[#5A4A42]/60 focus:outline-hidden font-medium"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="text-xs text-[#5A4A42] hover:text-[#241A15]"
            >
              Clear
            </button>
          )}
          <button
            onClick={() => setIsSearchOpen(false)}
            className="p-1 text-[#5A4A42] hover:text-[#241A15] rounded-md"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Popular Searches & Suggestions */}
        {!query.trim() && (
          <div className="p-5 space-y-3 bg-white">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#9E7D3B]">
              Popular Royal Searches
            </span>
            <div className="flex flex-wrap gap-2 text-xs">
              {['Byzantine Chain', 'Greek Key Kada', 'Hanuman Ji Pendant', 'Signet Ring', 'Sacred Om', 'Maa Medallion', 'Satellite Chain'].map((tag) => (
                <button
                  key={tag}
                  onClick={() => handleQuickKeyword(tag)}
                  className="px-3 py-1 bg-[#F5EFEB] hover:bg-[#C5A059]/20 text-[#241A15] rounded-sm transition-colors border border-[#C5A059]/20"
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Results Container */}
        {query.trim() && (
          <div className="max-h-[60vh] overflow-y-auto p-4 space-y-2 bg-white">
            <div className="text-[11px] text-[#5A4A42] uppercase tracking-wider px-2 pb-1 border-b border-[#F5EFEB]">
              Found <strong className="text-[#241A15]">{results.length}</strong> matching masterpieces
            </div>

            {results.length > 0 ? (
              results.map((product) => (
                <div
                  key={product.id}
                  onClick={() => handleSelectProduct(product)}
                  className="p-3 hover:bg-[#FBF8F2] rounded-md transition-colors flex items-center justify-between gap-3 cursor-pointer border border-transparent hover:border-[#C5A059]/20"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <LuxuryImage
                      src={product.image}
                      alt={product.name}
                      aspectRatio="square"
                      fit={product.primaryCategory === 'Rings' || product.primaryCategory === 'Chains' ? 'contain' : 'cover'}
                      containerClassName="!w-12 !h-12 rounded-md border border-[#C5A059]/20 shrink-0"
                    />
                    <div className="min-w-0">
                      <h4 className="font-royal text-xs sm:text-sm font-semibold text-[#241A15] truncate">
                        {product.name}
                      </h4>
                      <p className="text-[10px] text-[#5A4A42] truncate">
                        {product.primaryCategory} · {product.productType} · ID: {product.id}
                      </p>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <span className="text-xs font-bold text-[#241A15] tabular-nums">
                      ₹{product.sellingPrice.toLocaleString('en-IN')}
                    </span>
                    <span className="block text-[10px] text-[#9E7D3B]">
                      View Details →
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-12 text-[#5A4A42] space-y-2">
                <p className="text-xs">No items found matching "{query}"</p>
                <p className="text-[11px] text-[#9E7D3B]">
                  Try searching for 'Chain', 'Kada', 'Ring', 'Pendant', or 'Om'
                </p>
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
};
