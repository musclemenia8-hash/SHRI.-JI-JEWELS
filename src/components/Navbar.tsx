import React, { useState } from 'react';
import { Menu, X, Heart, ShoppingBag, Search, ShieldCheck } from 'lucide-react';
import { useShop } from '../context/ShopContext';
import { CategoryType } from '../types';
import { LogoSquare } from './LogoSquare';

export const Navbar: React.FC = () => {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const {
    products,
    cartCount,
    wishlist,
    categories,
    setSelectedCategory,
    setIsCartOpen,
    setIsWishlistOpen,
    setIsSearchOpen,
    setIsAdminOpen,
    setIsTermsOpen,
  } = useShop();

  const handleNavClick = (cat?: CategoryType | 'All') => {
    if (cat !== undefined) {
      setSelectedCategory(cat);
      const catalogEl = document.getElementById('catalog-section');
      if (catalogEl) {
        catalogEl.scrollIntoView({ behavior: 'smooth' });
      }
    }
    setIsDrawerOpen(false);
  };

  const scrollToSection = (id: string) => {
    setIsDrawerOpen(false);
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <>
      <header className="sticky top-0 z-40 bg-[#493326] border-b border-[#C5A36A]/30 shadow-md transition-colors">
        {/* Top Luxury Double-Strip Synchronized Running Announcement */}
        <div
          className="flex flex-col gap-[2px] bg-[#180E0A] border-b border-[#D4B072]/25 select-none overflow-hidden"
          role="region"
          aria-label="Store Announcements"
        >
          <span className="sr-only">
            Handcrafted Royal 22k Luxury Polish. 200 advance for order confirmation.
          </span>

          {/* Strip 1 */}
          <div className="announcement-strip-surface h-8 sm:h-9 flex items-center overflow-hidden">
            <div className="announcement-marquee-viewport">
              <div className="announcement-track">
                {[0, 1].map((halfIdx) => (
                  <div key={halfIdx} className="flex items-center shrink-0">
                    {[0, 1, 2, 3, 4, 5, 6].map((repeatIdx) => (
                      <span
                        key={repeatIdx}
                        aria-hidden={halfIdx !== 0 || repeatIdx !== 0}
                        className="w-[370px] sm:w-[460px] shrink-0 flex items-center justify-center whitespace-nowrap font-luxury-serif font-semibold text-[14.5px] sm:text-[16px] tracking-[0.12em] leading-none"
                      >
                        <span className="announcement-gold-shimmer">
                          Handcrafted Royal 22k Luxury Polish
                        </span>
                      </span>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Strip 2 */}
          <div className="announcement-strip-surface h-8 sm:h-9 flex items-center overflow-hidden">
            <div className="announcement-marquee-viewport">
              <div className="announcement-track">
                {[0, 1].map((halfIdx) => (
                  <div key={halfIdx} className="flex items-center shrink-0">
                    {[0, 1, 2, 3, 4, 5, 6].map((repeatIdx) => (
                      <span
                        key={repeatIdx}
                        aria-hidden={halfIdx !== 0 || repeatIdx !== 0}
                        className="w-[370px] sm:w-[460px] shrink-0 flex items-center justify-center whitespace-nowrap font-luxury-serif font-semibold text-[14.5px] sm:text-[16px] tracking-[0.12em] leading-none"
                      >
                        <span className="announcement-gold-shimmer">
                          200 advance for order confirmation
                        </span>
                      </span>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Main Royal Navigation Bar:
            Left to right:
            1. Hamburger Menu
            2. Original HD Logo inside Square Container
            3. SHRI JI JEWELS Wordmark immediately to the right
            4. Wishlist Icon
            5. Shopping Bag Icon
            6. Search Icon */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 sm:h-20 flex items-center justify-between">
          
          {/* Left Zone: 1. Hamburger Menu + 2. Square Logo + 3. SHRI JI JEWELS wordmark */}
          <div className="flex items-center gap-3 sm:gap-4">
            {/* 1. Three horizontal-line hamburger menu */}
            <button
              onClick={() => setIsDrawerOpen(true)}
              className="p-2 -ml-2 text-[#F7EFE1] hover:text-[#C5A36A] hover:bg-[#5C3E2D]/60 rounded-md transition-colors focus-visible:outline-[#C5A36A] cursor-pointer"
              aria-label="Open Navigation Drawer"
            >
              <Menu className="w-6 h-6 stroke-[2]" />
            </button>

            {/* Brand Lockup: 2. Square Logo container + 3. SHRI JI JEWELS wordmark directly beside */}
            <a
              href="#"
              onClick={(e) => {
                e.preventDefault();
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="flex items-center gap-2.5 sm:gap-3.5 group py-1"
            >
              {/* 2. Original HD Logo inside Square Container with 1:1 Aspect Ratio */}
              <LogoSquare
                size="sm"
                className="w-12 h-12 sm:w-14 sm:h-14 transition-transform duration-300 group-hover:scale-105"
              />

              {/* 3. SHRI JI JEWELS wordmark immediately beside the logo */}
              <div className="flex flex-col justify-center">
                <span className="font-royal text-base sm:text-xl font-bold tracking-[0.15em] text-[#F7EFE1] group-hover:text-[#C5A36A] transition-colors whitespace-nowrap leading-tight uppercase">
                  SHRI JI JEWELS
                </span>
                <span className="text-[9px] sm:text-[10px] font-luxury-serif tracking-[0.24em] text-[#C5A36A] uppercase hidden xs:block">
                  Divine By Tradition
                </span>
              </div>
            </a>
          </div>

          {/* Right Zone: 4. Wishlist | 5. Shopping Bag | 6. Search */}
          <div className="flex items-center gap-1 sm:gap-2.5">
            {/* 4. Wishlist heart icon with counter */}
            <button
              onClick={() => setIsWishlistOpen(true)}
              className="relative p-2 text-[#F7EFE1] hover:text-[#C5A36A] hover:bg-[#5C3E2D]/60 rounded-full transition-colors cursor-pointer"
              aria-label="View Wishlist"
              title="Saved Pieces"
            >
              <Heart className="w-5 h-5 sm:w-6 sm:h-6 stroke-[1.85]" />
              {wishlist.length > 0 && (
                <span className="absolute top-1 right-1 bg-[#C5A36A] text-[#241A15] text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center tabular-nums shadow-xs">
                  {wishlist.length}
                </span>
              )}
            </button>

            {/* 5. Shopping bag/cart icon with counter */}
            <button
              onClick={() => setIsCartOpen(true)}
              className="relative p-2 text-[#F7EFE1] hover:text-[#C5A36A] hover:bg-[#5C3E2D]/60 rounded-full transition-colors cursor-pointer"
              aria-label="View Shopping Bag"
              title="Shopping Bag"
            >
              <ShoppingBag className="w-5 h-5 sm:w-6 sm:h-6 stroke-[1.85]" />
              {cartCount > 0 && (
                <span className="absolute top-1 right-1 bg-[#C5A36A] text-[#241A15] text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center tabular-nums shadow-xs">
                  {cartCount}
                </span>
              )}
            </button>

            {/* 6. Search icon */}
            <button
              onClick={() => setIsSearchOpen(true)}
              className="p-2 text-[#F7EFE1] hover:text-[#C5A36A] hover:bg-[#5C3E2D]/60 rounded-full transition-colors cursor-pointer"
              aria-label="Search Catalogue"
              title="Search"
            >
              <Search className="w-5 h-5 sm:w-6 sm:h-6 stroke-[1.85]" />
            </button>
          </div>
        </div>
      </header>

      {/* Side Navigation Drawer */}
      {isDrawerOpen && (
        <div className="fixed inset-0 z-50 flex">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-[#241A15]/75 backdrop-blur-xs transition-opacity"
            onClick={() => setIsDrawerOpen(false)}
          />

          {/* Drawer content */}
          <div className="relative w-full max-w-xs sm:max-w-sm bg-[#F7F2E9] h-full shadow-2xl flex flex-col border-r border-[#C5A36A]/40 z-10 overflow-y-auto">
            {/* Drawer Header in Deep Espresso */}
            <div className="p-5 flex items-center justify-between border-b border-[#C5A36A]/30 bg-[#493326] text-[#F7EFE1]">
              <div className="flex items-center gap-3">
                <LogoSquare size="sm" className="w-12 h-12" />
                <div>
                  <h3 className="font-royal text-sm font-bold text-[#F7EFE1] tracking-wider uppercase">
                    SHRI JI JEWELS
                  </h3>
                  <p className="text-[10px] uppercase tracking-widest text-[#C5A36A]">
                    Divine By Tradition
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsDrawerOpen(false)}
                className="p-1.5 text-[#E8D4B2] hover:text-white rounded-md transition-colors cursor-pointer"
                aria-label="Close drawer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Navigation Links */}
            <div className="py-4 px-5 space-y-6 flex-1">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-widest text-[#9E7D3B] mb-2">
                  Navigation
                </p>
                <ul className="space-y-1.5 text-sm font-medium text-[#241A15]">
                  <li>
                    <button
                      onClick={() => handleNavClick('All')}
                      className="w-full text-left py-2 px-3 rounded-md hover:bg-[#EFE3CE] hover:text-[#9E7D3B] transition-colors"
                    >
                      Home
                    </button>
                  </li>
                  <li>
                    <button
                      onClick={() => handleNavClick('All')}
                      className="w-full text-left py-2 px-3 rounded-md hover:bg-[#EFE3CE] hover:text-[#9E7D3B] transition-colors cursor-pointer"
                    >
                      Shop All ({products.length} Masterpieces)
                    </button>
                  </li>
                  <li>
                    <button
                      onClick={() => scrollToSection('new-arrivals-section')}
                      className="w-full text-left py-2 px-3 rounded-md hover:bg-[#EFE3CE] hover:text-[#9E7D3B] transition-colors cursor-pointer"
                    >
                      New Arrivals
                    </button>
                  </li>
                  <li>
                    <button
                      onClick={() => scrollToSection('bestsellers-section')}
                      className="w-full text-left py-2 px-3 rounded-md hover:bg-[#EFE3CE] hover:text-[#9E7D3B] transition-colors cursor-pointer"
                    >
                      Best Sellers
                    </button>
                  </li>
                </ul>
              </div>

              {/* Dynamic Categories */}
              <div>
                <p className="text-[11px] font-bold uppercase tracking-widest text-[#9E7D3B] mb-2">
                  Collections by Category
                </p>
                <ul className="space-y-1 text-sm text-[#241A15]">
                  {categories.map((cat) => (
                    <li key={cat.name}>
                      <button
                        onClick={() => handleNavClick(cat.name)}
                        className="w-full flex items-center justify-between py-2 px-3 rounded-md hover:bg-[#EFE3CE] hover:text-[#9E7D3B] transition-colors cursor-pointer"
                      >
                        <span>{cat.name}</span>
                        <span className="text-xs text-[#5A4A42] bg-[#EFE3CE] px-2 py-0.5 rounded-sm tabular-nums">
                          {cat.count}
                        </span>
                      </button>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Information & Policies */}
              <div>
                <p className="text-[11px] font-bold uppercase tracking-widest text-[#9E7D3B] mb-2">
                  Customer Assistance & Legal
                </p>
                <ul className="space-y-1.5 text-sm text-[#5A4A42]">
                  <li>
                    <button
                      onClick={() => {
                        setIsDrawerOpen(false);
                        setIsTermsOpen(true);
                      }}
                      className="w-full text-left py-1.5 px-3 hover:text-[#241A15] font-semibold text-[#9E7D3B] cursor-pointer"
                    >
                      Terms & Conditions (Official PDF)
                    </button>
                  </li>
                  <li>
                    <button
                      onClick={() => scrollToSection('policies-section')}
                      className="w-full text-left py-1.5 px-3 hover:text-[#241A15] cursor-pointer"
                    >
                      Order Policies (₹200 Advance & Dispatch)
                    </button>
                  </li>
                  <li>
                    <button
                      onClick={() => scrollToSection('faq-section')}
                      className="w-full text-left py-1.5 px-3 hover:text-[#241A15] cursor-pointer"
                    >
                      Frequently Asked Questions
                    </button>
                  </li>
                  <li>
                    <button
                      onClick={() => scrollToSection('reviews-section')}
                      className="w-full text-left py-1.5 px-3 hover:text-[#241A15] cursor-pointer"
                    >
                      Customer Reviews
                    </button>
                  </li>
                </ul>
              </div>

              {/* Direct WhatsApp Concierge Button */}
              <div className="pt-2">
                <a
                  href="https://wa.me/919315741495"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-2.5 px-4 bg-[#25D366] hover:bg-[#20ba59] text-white font-semibold text-xs rounded-sm transition-colors flex items-center justify-center gap-2 shadow-sm"
                >
                  <span>Chat On WhatsApp</span>
                </a>
              </div>
            </div>

            {/* Drawer Footer */}
            <div className="p-4 bg-[#EFE3CE] border-t border-[#C5A36A]/20 text-[11px] text-[#5A4A42] flex items-center justify-between">
              <span>SHRI JI JEWELS Official</span>
              <button
                onClick={() => {
                  setIsDrawerOpen(false);
                  setIsAdminOpen(true);
                }}
                className="text-[#9E7D3B] hover:text-[#241A15] font-semibold"
              >
                Admin Suite
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
