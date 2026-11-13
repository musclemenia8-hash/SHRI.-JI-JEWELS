import React from 'react';
import { ShieldAlert, CheckCircle2, HeartHandshake, PhoneCall, FileText, Mail } from 'lucide-react';
import { useShop } from '../context/ShopContext';

export const OrderPoliciesSection: React.FC = () => {
  const { setIsTermsOpen } = useShop();

  const policies = [
    {
      num: '01',
      title: '₹200 Advance Payment Required',
      desc: 'A non-refundable ₹200 booking advance via UPI is required to confirm order processing and prepare artisan parcel dispatch.',
    },
    {
      num: '02',
      title: 'Cash on Delivery (COD) Not Available',
      desc: 'We operate exclusively on secure advance token booking with balance payment upon courier tracking docket generation.',
    },
    {
      num: '03',
      title: 'No Returns Or Refunds',
      desc: 'Due to the sacred and personal nature of royal handcrafted ornaments, all purchases are final. No refunds are issued.',
    },
    {
      num: '04',
      title: 'No Exchanges',
      desc: 'Each item is hand-polished specifically for the patron upon order receipt. Exchanges for alternate sizes or designs are not supported.',
    },
    {
      num: '05',
      title: 'Careful Product Review Advised',
      desc: 'Patrons are encouraged to inspect all high-definition product photographs, measurements, and descriptions thoroughly prior to placing an order.',
    },
    {
      num: '06',
      title: 'Processing Upon Payment Confirmation',
      desc: 'Parcel packaging and express courier scheduling proceed immediately once your ₹200 advance receipt is validated on WhatsApp.',
    },
    {
      num: '07',
      title: 'No Unauthorized Cancellations',
      desc: 'Once workshop dispatch packaging begins, orders cannot be cancelled or modified.',
    },
  ];

  return (
    <section className="py-14 sm:py-18 bg-[#FBF8F2]" id="policies-section">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-12 space-y-2">
          <div className="inline-flex items-center gap-1.5 text-xs uppercase tracking-widest text-[#9E7D3B] font-semibold">
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>Store Standards & Transparency</span>
          </div>
          <h2 className="font-royal text-2xl sm:text-3xl lg:text-4xl font-bold text-[#241A15]">
            Official Order Policies
          </h2>
          <p className="text-xs sm:text-sm text-[#5A4A42] font-light">
            We uphold strict ethical standards to deliver pristine, untouched heirloom ornaments to every customer.
          </p>
          
          <div className="pt-2">
            <button
              onClick={() => setIsTermsOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2 bg-[#493326] text-[#F7EFE1] hover:bg-[#342217] hover:text-[#C5A36A] rounded-md border border-[#C5A36A]/40 text-xs font-semibold uppercase tracking-wider transition-all shadow-xs cursor-pointer"
            >
              <FileText className="w-4 h-4 text-[#C5A36A]" />
              <span>Read Full Terms & Conditions (Official PDF)</span>
            </button>
          </div>
        </div>

        {/* 7 Core Policies Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {policies.map((pol) => (
            <div
              key={pol.num}
              className="bg-white p-5 rounded-lg border border-[#C5A059]/25 shadow-xs flex flex-col justify-between"
            >
              <div>
                <span className="font-mono text-xs font-bold text-[#9E7D3B] block mb-2">
                  Policy {pol.num}
                </span>
                <h3 className="font-royal text-sm font-bold text-[#241A15] mb-1.5">
                  {pol.title}
                </h3>
                <p className="text-xs text-[#5A4A42] font-light leading-relaxed">
                  {pol.desc}
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-[#F5EFEB] flex items-center gap-1.5 text-[11px] text-emerald-800 font-medium">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>Strict Quality Standard</span>
              </div>
            </div>
          ))}

          {/* Contact Card in the grid */}
          <div className="bg-gradient-to-br from-[#241A15] to-[#1A120E] text-[#FBF8F2] p-6 rounded-lg border border-[#C5A059]/40 shadow-md flex flex-col justify-between">
            <div className="space-y-2">
              <span className="font-mono text-xs text-[#DFCA9B] font-bold">
                Direct Helpdesk
              </span>
              <h3 className="font-royal text-base font-bold text-white">
                Have A Question Before Ordering?
              </h3>
              <p className="text-xs text-[#DFCA9B]/80 font-light leading-relaxed">
                Connect with our artisan concierge directly on WhatsApp or Email for additional video previews, close-up details, or delivery timeframes.
              </p>
            </div>
            <div className="space-y-2 mt-4">
              <a
                href="https://wa.me/919315741495"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full inline-flex items-center justify-center gap-2 py-2 px-4 bg-[#C5A059] text-black font-semibold text-xs rounded-sm hover:bg-[#9E7D3B] transition-colors"
              >
                <PhoneCall className="w-3.5 h-3.5" />
                <span>WhatsApp: +91 9315741495</span>
              </a>
              <a
                href="mailto:Shrijijewels2908@gmail.com"
                className="w-full inline-flex items-center justify-center gap-2 py-2 px-4 bg-white/10 text-[#DFCA9B] hover:text-white font-medium text-xs rounded-sm hover:bg-white/15 transition-colors border border-[#C5A059]/30"
              >
                <Mail className="w-3.5 h-3.5 text-[#C5A059]" />
                <span className="font-mono text-[11px]">Shrijijewels2908@gmail.com</span>
              </a>
            </div>
          </div>
        </div>

        {/* Thank You Note (Verbatim requirement from Phase 21) */}
        <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg border border-[#C5A059]/30 text-center shadow-xs space-y-2">
          <HeartHandshake className="w-8 h-8 text-[#9E7D3B] mx-auto" />
          <h3 className="font-royal text-lg font-bold text-[#241A15]">
            A Personal Note of Gratitude
          </h3>
          <p className="font-luxury-serif text-base sm:text-lg text-[#5A4A42] italic">
            "Thank you for choosing SHRI JI JEWELS. We truly appreciate your trust and support."
          </p>
          <p className="text-[11px] uppercase tracking-widest text-[#9E7D3B] font-semibold pt-1">
            DIVINE BY TRADITION · TIMELESS BY TRUST
          </p>
        </div>

      </div>
    </section>
  );
};
