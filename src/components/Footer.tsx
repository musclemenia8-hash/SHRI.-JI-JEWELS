import React from 'react';
import { Phone, MessageCircle, Instagram, Facebook, ShieldCheck, Mail, FileText } from 'lucide-react';
import { useShop } from '../context/ShopContext';
import { CategoryType } from '../types';
import { LogoSquare } from './LogoSquare';

export const Footer: React.FC = () => {
  const { categories, setSelectedCategory, setIsAdminOpen, setIsTermsOpen } = useShop();

  const handleCategoryClick = (cat: CategoryType | 'All') => {
    setSelectedCategory(cat);
    const el = document.getElementById('catalog-section');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <footer className="bg-[#1E140F] text-[#FBF8F2] border-t-2 border-[#C5A059]/40 pt-16 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* 4 Sections Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-8 pb-12 border-b border-[#C5A059]/20">
          
          {/* Section 1: Brand */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <LogoSquare size="md" className="border border-[#C5A059]/40" />
              <div>
                <h3 className="font-royal text-base font-bold text-white tracking-widest">
                  SHRI JI JEWELS
                </h3>
                <p className="text-[10px] uppercase tracking-widest text-[#C5A059] font-medium">
                  Divine By Tradition
                </p>
                <p className="text-[10px] uppercase tracking-widest text-[#DFCA9B]/70 font-medium">
                  Timeless By Trust
                </p>
              </div>
            </div>

            <p className="text-xs text-[#DFCA9B]/80 font-light leading-relaxed">
              Curating sovereign Indian jewellery artistry with authentic 22K radiant gold polish. Heirloom royal chains, kada, and sacred devotional ornaments crafted for kings and queens.
            </p>

            <div className="text-[11px] text-[#DFCA9B]/60">
              ₹200 Advance Dispatch Nationwide · COD Not Available
            </div>
          </div>

          {/* Section 2: Quick Links */}
          <div className="space-y-3">
            <h4 className="font-royal text-xs font-bold uppercase tracking-widest text-[#C5A059]">
              Quick Links
            </h4>
            <ul className="space-y-2 text-xs text-[#DFCA9B]/80">
              <li>
                <button
                  onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  Home
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleCategoryClick('All')}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  Shop All (76 Masterpieces)
                </button>
              </li>
              {categories.map((cat) => (
                <li key={cat.name}>
                  <button
                    onClick={() => handleCategoryClick(cat.name)}
                    className="hover:text-white transition-colors flex items-center justify-between w-full pr-6 cursor-pointer"
                  >
                    <span>{cat.name}</span>
                    <span className="text-[10px] text-[#C5A059] tabular-nums font-mono">
                      {cat.count}
                    </span>
                  </button>
                </li>
              ))}
              <li>
                <button
                  onClick={() => scrollTo('new-arrivals-section')}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  New Arrivals
                </button>
              </li>
              <li>
                <button
                  onClick={() => scrollTo('bestsellers-section')}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  Best Sellers
                </button>
              </li>
            </ul>
          </div>

          {/* Section 3: Customer Support (Correction 6 & 9) */}
          <div className="space-y-3">
            <h4 className="font-royal text-xs font-bold uppercase tracking-widest text-[#C5A059]">
              Customer Support & Legal
            </h4>
            <ul className="space-y-2 text-xs text-[#DFCA9B]/80">
              <li>
                <button
                  onClick={() => setIsTermsOpen(true)}
                  className="hover:text-white transition-colors font-semibold text-[#DFCA9B] flex items-center gap-1.5 cursor-pointer"
                >
                  <FileText className="w-3.5 h-3.5 text-[#C5A059]" />
                  <span>Terms & Conditions (Official PDF)</span>
                </button>
              </li>
              <li>
                <button
                  onClick={() => scrollTo('policies-section')}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  Order Policies & Advance Terms
                </button>
              </li>
              <li>
                <button
                  onClick={() => scrollTo('faq-section')}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  Frequently Asked Questions
                </button>
              </li>
              <li>
                <button
                  onClick={() => scrollTo('reviews-section')}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  Verified Patron Reviews
                </button>
              </li>
              <li className="pt-2 space-y-1.5">
                <span className="block text-[11px] text-[#C5A059] uppercase tracking-wider font-semibold">
                  Official Helpdesk:
                </span>
                <a
                  href="mailto:Shrijijewels2908@gmail.com"
                  className="flex items-center gap-2 hover:text-white transition-colors text-xs font-mono font-bold"
                >
                  <Mail className="w-3.5 h-3.5 text-[#C5A059] shrink-0" />
                  <span>Shrijijewels2908@gmail.com</span>
                </a>
                <a
                  href="tel:9315741495"
                  className="flex items-center gap-2 hover:text-white transition-colors text-xs font-mono font-bold"
                >
                  <Phone className="w-3.5 h-3.5 text-[#C5A059] shrink-0" />
                  <span>Call: +91 9315741495</span>
                </a>
                <a
                  href="https://wa.me/919315741495"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 hover:text-white transition-colors text-xs font-mono font-bold"
                >
                  <MessageCircle className="w-3.5 h-3.5 text-[#25D366] shrink-0" />
                  <span>WhatsApp: +91 9315741495</span>
                </a>
              </li>
            </ul>
          </div>

          {/* Section 4: Social Media & Official Verification */}
          <div className="space-y-4">
            <h4 className="font-royal text-xs font-bold uppercase tracking-widest text-[#C5A059]">
              Social Media & Community
            </h4>
            <p className="text-xs text-[#DFCA9B]/80 font-light">
              Follow our daily workshop creations, dispatch videos, and new design releases on our official social channels.
            </p>

            <div className="space-y-2 text-xs">
              <a
                href="https://instagram.com/shrijijewalsofficial"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2.5 p-2 rounded-sm bg-white/5 hover:bg-white/10 text-[#DFCA9B] hover:text-white transition-colors border border-[#C5A059]/20"
              >
                <Instagram className="w-4 h-4 text-[#C5A059]" />
                <div>
                  <span className="block font-medium">Instagram</span>
                  <span className="text-[10px] text-[#DFCA9B]/60">@shrijijewalsofficial</span>
                </div>
              </a>

              <a
                href="https://facebook.com/ShriJiJewelsOfficial"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2.5 p-2 rounded-sm bg-white/5 hover:bg-white/10 text-[#DFCA9B] hover:text-white transition-colors border border-[#C5A059]/20"
              >
                <Facebook className="w-4 h-4 text-[#C5A059]" />
                <div>
                  <span className="block font-medium">Facebook</span>
                  <span className="text-[10px] text-[#DFCA9B]/60">Shri Ji Jewels Official</span>
                </div>
              </a>
            </div>

            <div className="pt-2 flex items-center gap-1.5 text-[11px] text-[#DFCA9B]/60">
              <ShieldCheck className="w-3.5 h-3.5 text-[#C5A059]" />
              <span>100% Verified Merchant Profiles</span>
            </div>
          </div>

        </div>

        {/* Bottom Bar: Copyright & Admin link */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-[#DFCA9B]/60 gap-4">
          <p className="font-mono text-center sm:text-left flex items-center gap-2 flex-wrap justify-center sm:justify-start">
            <span>© SHRI JI JEWELS. All Rights Reserved.</span>
            <span>•</span>
            <button
              onClick={() => setIsTermsOpen(true)}
              className="text-[#DFCA9B] hover:text-[#C5A059] underline underline-offset-2 transition-colors cursor-pointer"
            >
              Terms & Conditions (PDF)
            </button>
          </p>

          <div className="flex items-center gap-6">
            <span className="text-[11px] hidden md:inline">DIVINE BY TRADITION · TIMELESS BY TRUST</span>
            <button
              onClick={() => setIsAdminOpen(true)}
              className="text-[11px] text-[#C5A059] hover:text-white transition-colors uppercase tracking-wider font-semibold cursor-pointer"
            >
              Admin Suite
            </button>
          </div>
        </div>

      </div>
    </footer>
  );
};
