import React from 'react';
import { Eye, Sparkles } from 'lucide-react';
import { useShop } from '../context/ShopContext';
import { LuxuryImage } from './LuxuryImage';

interface CollageItem {
  id: string;
  name: string;
  category: string;
  price: number;
  image: string;
  tagline: string;
}

const COLLAGE_ITEMS: CollageItem[] = [
  {
    id: 'SJJ-KD-15',
    name: 'Kada Greek Key Jaali Openwork Pair',
    category: 'Kada',
    price: 1500,
    image: '/assets/aistudio/IMG_20261113_095141_48654387.jpg',
    tagline: 'Openwork Greek Key & Perforated Jaali'
  },
  {
    id: 'SJJ-CH-30',
    name: 'Surya S-Scroll Braided Wheat Collar Chain',
    category: 'Chains',
    price: 2440,
    image: '/assets/aistudio/IMG_20261113_122801_60bdd5af.jpg',
    tagline: 'Interlocking S-Scroll & Beaded Rope Border'
  },
  {
    id: 'SJJ-PD-06',
    name: 'Kesari Lion Greek Key Medallion Pendant',
    category: 'Pendants',
    price: 850,
    image: '/assets/aistudio/IMG_20261113_104854_ccae4bc0.jpg',
    tagline: 'Carved Greek Key & Lion Relief'
  },
  {
    id: 'SJJ-RG-41',
    name: 'Tarang Tri-Loop Sphere Cuff Ring',
    category: 'Rings',
    price: 1460,
    image: '/assets/aistudio/IMG_20261113_113339_6636a191.jpg',
    tagline: 'Triple-Strand Sphere Open Contour'
  }
];

export const EditorialCollage: React.FC = () => {
  const { products, setSelectedProduct } = useShop();

  const handleOpenProduct = (id: string) => {
    const found = products.find((p) => p.id === id);
    if (found) {
      setSelectedProduct(found);
    }
  };

  const [featuredItem, item2, item3, item4] = COLLAGE_ITEMS;

  return (
    <section className="py-14 sm:py-20 bg-[#F5EFEB] border-b border-[#C5A059]/25" id="editorial-collage-section">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Editorial Section Heading */}
        <div className="text-center max-w-2xl mx-auto mb-10 space-y-2">
          <div className="inline-flex items-center gap-1.5 text-xs uppercase tracking-widest text-[#9E7D3B] font-semibold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Curated Heritage Composition</span>
            <Sparkles className="w-3.5 h-3.5" />
          </div>
          <h2 className="font-royal text-2xl sm:text-3xl lg:text-4xl font-bold text-[#241A15]">
            The Sovereign Ensemble
          </h2>
          <p className="text-xs sm:text-sm text-[#5A4A42] font-light">
            A unified magazine composition celebrating authentic Indian goldsmithing across bridal kada, fluid chains, devotional pendants, and royal signet rings.
          </p>
        </div>

        {/* ONE Single Integrated Composition with Thin Gold Divider Lines (Correction 07) */}
        <div className="rounded-lg overflow-hidden border border-[#C5A059]/40 bg-[#241A15] shadow-xl">
          <div className="grid grid-cols-1 lg:grid-cols-12 divide-y lg:divide-y-0 lg:divide-x divide-[#C5A059]/30">
            
            {/* Left Dominant Feature (Spans 7 cols on lg) */}
            <div 
              onClick={() => handleOpenProduct(featuredItem.id)}
              className="lg:col-span-7 group relative bg-[#1E140F] cursor-pointer overflow-hidden min-h-[380px] sm:min-h-[460px] lg:min-h-[560px] flex flex-col justify-end p-6 sm:p-8"
            >
              {/* Image */}
              <LuxuryImage
                src={featuredItem.image}
                alt={featuredItem.name}
                aspectRatio="none"
                containerClassName="!absolute inset-0 w-full h-full"
                className="transition-transform duration-700 ease-out group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-black/10 pointer-events-none" />

              {/* Tag / Category */}
              <div className="relative z-10 space-y-2 max-w-md">
                <div className="inline-flex items-center gap-2 px-2.5 py-1 bg-black/60 backdrop-blur-md rounded-xs border border-[#C5A059]/40 text-[#DFCA9B] text-[10px] font-semibold tracking-widest uppercase">
                  <span>{featuredItem.category}</span>
                  <span>·</span>
                  <span>Featured Centerpiece</span>
                </div>

                <h3 className="font-royal text-xl sm:text-2xl lg:text-3xl font-bold text-white leading-tight drop-shadow-md">
                  {featuredItem.name}
                </h3>

                <p className="text-xs sm:text-sm text-[#DFCA9B] font-light drop-shadow-xs">
                  {featuredItem.tagline}
                </p>

                <div className="pt-2 flex items-center justify-between">
                  <div className="flex items-baseline gap-2">
                    <span className="text-xl sm:text-2xl font-bold text-white tabular-nums">
                      ₹{featuredItem.price.toLocaleString('en-IN')}
                    </span>
                    <span className="text-xs text-[#DFCA9B]/70 uppercase tracking-wider">
                      (Set Price)
                    </span>
                  </div>

                  <span className="px-3 py-1.5 bg-[#C5A059] text-[#1A130F] font-semibold text-xs uppercase tracking-wider rounded-xs flex items-center gap-1.5 group-hover:brightness-110 transition-all shadow-md">
                    <Eye className="w-3.5 h-3.5" />
                    <span>Inspect</span>
                  </span>
                </div>
              </div>
            </div>

            {/* Right Companion Trio (Spans 5 cols on lg) */}
            <div className="lg:col-span-5 flex flex-col divide-y divide-[#C5A059]/30 bg-[#1E140F]">
              
              {/* Item 2: Braided Wheat Collar Chain */}
              <div 
                onClick={() => handleOpenProduct(item2.id)}
                className="group relative flex-1 min-h-[170px] sm:min-h-[180px] p-5 cursor-pointer overflow-hidden flex flex-col justify-end"
              >
                <LuxuryImage
                  src={item2.image}
                  alt={item2.name}
                  aspectRatio="none"
                  fit={item2.category === 'Chains' || item2.category === 'Rings' ? 'contain' : 'cover'}
                  containerClassName="!absolute inset-0 w-full h-full"
                  className="transition-transform duration-500 ease-out"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-transparent pointer-events-none" />

                <div className="relative z-10 flex items-end justify-between gap-4">
                  <div>
                    <span className="text-[10px] uppercase tracking-widest text-[#DFCA9B] font-semibold">
                      {item2.category}
                    </span>
                    <h4 className="font-royal text-sm sm:text-base font-bold text-white leading-snug">
                      {item2.name}
                    </h4>
                    <p className="text-[11px] text-[#DFCA9B]/80 font-light truncate">
                      {item2.tagline}
                    </p>
                  </div>

                  <div className="text-right shrink-0">
                    <span className="block text-sm sm:text-base font-bold text-white tabular-nums">
                      ₹{item2.price.toLocaleString('en-IN')}
                    </span>
                    <span className="text-[10px] text-[#DFCA9B] underline uppercase tracking-wider">
                      View
                    </span>
                  </div>
                </div>
              </div>

              {/* Lower split row: Item 3 & Item 4 with thin hairline divider */}
              <div className="grid grid-cols-1 sm:grid-cols-2 divide-y sm:divide-y-0 sm:divide-x divide-[#C5A059]/30 flex-1">
                
                {/* Item 3: Devotional Sanskrit Medallion */}
                <div 
                  onClick={() => handleOpenProduct(item3.id)}
                  className="group relative min-h-[170px] p-4 cursor-pointer overflow-hidden flex flex-col justify-end"
                >
                  <LuxuryImage
                    src={item3.image}
                    alt={item3.name}
                    aspectRatio="none"
                    containerClassName="!absolute inset-0 w-full h-full"
                    className="transition-transform duration-700 ease-out group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-transparent pointer-events-none" />

                  <div className="relative z-10 space-y-1">
                    <span className="text-[9px] uppercase tracking-widest text-[#DFCA9B] font-semibold">
                      {item3.category}
                    </span>
                    <h5 className="font-royal text-xs sm:text-sm font-bold text-white line-clamp-1">
                      {item3.name}
                    </h5>
                    <div className="flex items-center justify-between pt-1">
                      <span className="text-xs font-bold text-white tabular-nums">
                        ₹{item3.price.toLocaleString('en-IN')}
                      </span>
                      <span className="text-[10px] text-[#C5A059] font-medium">
                        Explore →
                      </span>
                    </div>
                  </div>
                </div>

                {/* Item 4: Triple Sphere Ring */}
                <div 
                  onClick={() => handleOpenProduct(item4.id)}
                  className="group relative min-h-[170px] p-4 cursor-pointer overflow-hidden flex flex-col justify-end"
                >
                  <LuxuryImage
                    src={item4.image}
                    alt={item4.name}
                    aspectRatio="none"
                    fit={item4.category === 'Chains' || item4.category === 'Rings' ? 'contain' : 'cover'}
                    containerClassName="!absolute inset-0 w-full h-full"
                    className="transition-transform duration-500 ease-out"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-transparent pointer-events-none" />

                  <div className="relative z-10 space-y-1">
                    <span className="text-[9px] uppercase tracking-widest text-[#DFCA9B] font-semibold">
                      {item4.category}
                    </span>
                    <h5 className="font-royal text-xs sm:text-sm font-bold text-white line-clamp-1">
                      {item4.name}
                    </h5>
                    <div className="flex items-center justify-between pt-1">
                      <span className="text-xs font-bold text-white tabular-nums">
                        ₹{item4.price.toLocaleString('en-IN')}
                      </span>
                      <span className="text-[10px] text-[#C5A059] font-medium">
                        Explore →
                      </span>
                    </div>
                  </div>
                </div>

              </div>

            </div>

          </div>
        </div>

      </div>
    </section>
  );
};
