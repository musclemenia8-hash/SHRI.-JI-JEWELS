import React from 'react';
import { Sparkles } from 'lucide-react';

export const IntroductoryBanner: React.FC = () => {
  return (
    <section className="w-full bg-[#EFE3CE] border-b border-[#C5A059]/30 py-5 sm:py-6 px-4">
      <div className="max-w-4xl mx-auto text-center space-y-1.5 sm:space-y-2">
        <div className="inline-flex items-center justify-center gap-2 text-[10px] sm:text-xs uppercase tracking-[0.25em] text-[#9E7D3B] font-semibold">
          <Sparkles className="w-3 h-3 text-[#C5A059]" />
          <span>Divine By Tradition · Timeless By Trust</span>
          <Sparkles className="w-3 h-3 text-[#C5A059]" />
        </div>

        <h1 className="font-royal text-xl sm:text-2xl md:text-3xl font-bold tracking-wide text-[#241A15]">
          SHRI JI JEWELS
        </h1>

        <p className="font-luxury-serif text-sm sm:text-base md:text-lg text-[#3C2D24] italic tracking-wide">
          Timeless Jewellery. Traditional Elegance.
        </p>

        <p className="text-[11px] sm:text-xs text-[#5A4A42] max-w-xl mx-auto font-light pt-0.5">
          Handcrafted royal ornaments and classic jewellery designs created with authentic Indian goldsmithing tradition.
        </p>
      </div>
    </section>
  );
};
