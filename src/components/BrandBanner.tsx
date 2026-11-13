import React from 'react';
import { Sparkles, MessageCircle } from 'lucide-react';
import { useShop } from '../context/ShopContext';
import { LogoSquare } from './LogoSquare';

export const BrandBanner: React.FC = () => {
  const { setSelectedCategory } = useShop();

  const handleShopNow = () => {
    setSelectedCategory('All');
    const el = document.getElementById('catalog-section');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section className="relative w-full py-16 sm:py-24 bg-gradient-to-b from-[#241A15] via-[#2A1E18] to-[#1E140F] text-[#FBF8F2] overflow-hidden border-y border-[#C5A059]/40">
      
      {/* Background ambient gold glow */}
      <div className="absolute inset-0 bg-radial-at-c from-[#C5A059]/10 via-transparent to-transparent pointer-events-none" />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center space-y-6 sm:space-y-8">
        
        {/* Original Logo Preserved Exactly in 100% Square Container */}
        <div className="flex justify-center">
          <LogoSquare size="xl" className="shadow-2xl border-2 border-[#C5A059]/50" />
        </div>

        {/* Motifs & Titles */}
        <div className="space-y-3 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.25em] text-[#C5A059] font-medium">
            <Sparkles className="w-3.5 h-3.5 text-[#C5A059]" />
            <span>The Royal Sanctuary of Sacred Indian Craft</span>
            <Sparkles className="w-3.5 h-3.5 text-[#C5A059]" />
          </div>

          <h2 className="font-royal text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-wider text-white">
            DIVINE BY TRADITION
            <span className="block gold-gradient-text text-2xl sm:text-3xl lg:text-4xl font-normal mt-1">
              TIMELESS BY TRUST
            </span>
          </h2>

          <p className="text-xs sm:text-sm text-[#DFCA9B]/85 font-light leading-relaxed max-w-2xl mx-auto">
            At SHRI JI JEWELS, we bridge centuries of Indian goldsmithing heritage with modern sovereign dignity. Every necklace, kada, signet ring, and sacred medallion is hand-finished with meticulous devotion, delivering ceremonial magnificence directly to your doorstep.
          </p>
        </div>

        {/* Action buttons */}
        <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-4">
          <button
            onClick={handleShopNow}
            className="w-full sm:w-auto px-8 py-3.5 bg-gradient-to-r from-[#C5A059] to-[#9E7D3B] text-[#1A130F] font-bold text-xs uppercase tracking-widest rounded-sm hover:brightness-110 shadow-xl transition-all"
          >
            Explore Royal Vault
          </button>
          
          <a
            href="https://wa.me/919315741495"
            target="_blank"
            rel="noopener noreferrer"
            className="w-full sm:w-auto px-8 py-3.5 border border-[#C5A059]/60 hover:border-[#C5A059] text-[#DFCA9B] hover:text-white font-semibold text-xs uppercase tracking-widest rounded-sm backdrop-blur-xs transition-all flex items-center justify-center gap-2"
          >
            <MessageCircle className="w-4 h-4 text-[#25D366]" />
            <span>WhatsApp Concierge: 9315741495</span>
          </a>
        </div>

        {/* Brand values trio */}
        <div className="pt-6 grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-3xl mx-auto text-xs text-[#DFCA9B]/70 border-t border-[#C5A059]/20">
          <div>
            <strong className="block text-white font-royal tracking-wider mb-0.5">22K Royal Polish</strong>
            High-lustre heirloom mirror finish with protective coating.
          </div>
          <div>
            <strong className="block text-white font-royal tracking-wider mb-0.5">₹200 Token Dispatch</strong>
            Verified advance booking with rapid parcel dispatch nationwide.
          </div>
          <div>
            <strong className="block text-white font-royal tracking-wider mb-0.5">Artisan Direct Pricing</strong>
            Honest wholesale rates verified directly by the workshop master.
          </div>
        </div>

      </div>
    </section>
  );
};
