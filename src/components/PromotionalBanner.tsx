import React from 'react';
import { Sparkles, MessageCircle, ShieldCheck } from 'lucide-react';
import { useShop } from '../context/ShopContext';

export const PromotionalBanner: React.FC = () => {
  const { setSelectedCategory } = useShop();

  const handleShopRings = () => {
    setSelectedCategory('Rings');
    const el = document.getElementById('catalog-section');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  const handleShopKada = () => {
    setSelectedCategory('Kada');
    const el = document.getElementById('catalog-section');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section className="bg-gradient-to-r from-[#2C211B] via-[#241A15] to-[#1A120E] text-[#FBF8F2] border-y border-[#C5A059]/30 py-6 sm:py-8 px-4 sm:px-6">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
        
        {/* Left: Campaign Title & Royal Assurance */}
        <div className="space-y-1.5 text-center md:text-left">
          <div className="flex items-center justify-center md:justify-start gap-2 text-xs uppercase tracking-widest text-[#C5A059] font-medium">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Artisan Direct Advantage</span>
          </div>
          <h2 className="font-royal text-xl sm:text-2xl font-bold tracking-wide text-white">
            Approved Price Architecture
          </h2>
          <p className="text-xs sm:text-sm text-[#DFCA9B]/80 font-light max-w-xl">
            All handcrafted Kada fixed at <span className="text-white font-semibold">₹1,500</span> · Signet Rings at <span className="text-white font-semibold">₹1,400–₹1,500</span> · Royal Chains from <span className="text-white font-semibold">₹1,500</span>
          </p>
        </div>

        {/* Center / Right: Quick Badges & Actions */}
        <div className="flex flex-wrap items-center justify-center gap-3 shrink-0">
          <button
            onClick={handleShopRings}
            className="px-4 py-2 bg-[#F5EFEB]/10 hover:bg-[#F5EFEB]/20 border border-[#C5A059]/40 text-[#DFCA9B] rounded-sm text-xs font-semibold uppercase tracking-wider transition-colors cursor-pointer"
          >
            Shop Rings @ ₹1,400–₹1,500
          </button>
          <button
            onClick={handleShopKada}
            className="px-4 py-2 bg-[#F5EFEB]/10 hover:bg-[#F5EFEB]/20 border border-[#C5A059]/40 text-[#DFCA9B] rounded-sm text-xs font-semibold uppercase tracking-wider transition-colors cursor-pointer"
          >
            Shop Royal Kada @ ₹1,500
          </button>
          <a
            href="https://wa.me/919315741495"
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2 bg-[#C5A059] hover:bg-[#9E7D3B] text-[#1A130F] rounded-sm text-xs font-bold uppercase tracking-wider transition-colors flex items-center gap-1.5 shadow-md"
          >
            <MessageCircle className="w-3.5 h-3.5" />
            <span>Order On WhatsApp</span>
          </a>
        </div>

      </div>

      {/* Trust pill strip */}
      <div className="max-w-7xl mx-auto mt-4 pt-4 border-t border-[#C5A059]/15 flex flex-wrap items-center justify-center md:justify-between text-[11px] text-[#DFCA9B]/70 gap-y-2 gap-x-6">
        <span className="flex items-center gap-1.5">
          <ShieldCheck className="w-3.5 h-3.5 text-[#C5A059]" />
          <span>₹200 Advance Token Secures Priority Dispatch</span>
        </span>
        <span>·</span>
        <span>Strict Zero-Imitation Standard</span>
        <span>·</span>
        <span>Signature Royal Velvet Box Packaging Included</span>
        <span>·</span>
        <span>Direct WhatsApp Support: 9315741495</span>
      </div>
    </section>
  );
};
