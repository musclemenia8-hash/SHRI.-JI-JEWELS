import React, { useState } from 'react';
import { ChevronDown, HelpCircle } from 'lucide-react';
import { useShop } from '../context/ShopContext';

export const FAQSection: React.FC = () => {
  const { faqs } = useShop();
  const [openId, setOpenId] = useState<string | null>(faqs[0]?.id || null);

  const toggle = (id: string) => {
    setOpenId((prev) => (prev === id ? null : id));
  };

  return (
    <section className="py-14 sm:py-18 bg-white" id="faq-section">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center mb-12 space-y-2">
          <div className="inline-flex items-center gap-1.5 text-xs uppercase tracking-widest text-[#9E7D3B] font-semibold">
            <HelpCircle className="w-3.5 h-3.5" />
            <span>Clarity & Transparency</span>
          </div>
          <h2 className="font-royal text-2xl sm:text-3xl lg:text-4xl font-bold text-[#241A15]">
            Frequently Asked Questions
          </h2>
          <p className="text-xs sm:text-sm text-[#5A4A42] font-light max-w-lg mx-auto">
            Everything you need to know about our booking process, ₹200 advance payment, parcel tracking, and order dispatch.
          </p>
        </div>

        {/* Accordions */}
        <div className="space-y-3">
          {faqs.map((faq) => {
            const isOpen = openId === faq.id;
            return (
              <div
                key={faq.id}
                className="border border-[#C5A059]/25 rounded-md overflow-hidden bg-[#FBF8F2] transition-colors"
              >
                <button
                  onClick={() => toggle(faq.id)}
                  className="w-full p-4 sm:p-5 text-left flex items-center justify-between gap-4 font-royal text-sm sm:text-base font-semibold text-[#241A15] hover:text-[#9E7D3B] transition-colors"
                  aria-expanded={isOpen}
                >
                  <span>{faq.question}</span>
                  <ChevronDown
                    className={`w-4 h-4 text-[#9E7D3B] transition-transform duration-300 shrink-0 ${
                      isOpen ? 'transform rotate-180' : ''
                    }`}
                  />
                </button>

                {isOpen && (
                  <div className="px-4 pb-5 sm:px-5 sm:pb-6 text-xs sm:text-sm text-[#5A4A42] font-light leading-relaxed border-t border-[#C5A059]/15 pt-3 bg-white">
                    {faq.answer}
                  </div>
                )}
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
};
