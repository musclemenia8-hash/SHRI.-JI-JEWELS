import React from 'react';
import { X, ArrowRight, Sparkles } from 'lucide-react';
import { useShop } from '../context/ShopContext';
import { CategoryType } from '../types';
import { LuxuryImage } from './LuxuryImage';


const CATEGORY_DETAILS: Record<
  CategoryType,
  { image: string; tag: string; priceGuide: string; description: string }
> = {
  Chains: {
    image: '/assets/aistudio/IMG_20261113_122954_49e29eb9.jpg',
    tag: 'Byzantine, Braided Wheat, Station & Capsule Links',
    priceGuide: 'Fine: ₹1,400–₹1,600 | Statement: ₹2,400–₹2,600',
    description: 'Precision handcrafted gold-tone link and station chains crafted for everyday grace and festive wear.',
  },
  Rings: {
    image: '/assets/aistudio/IMG_20261113_113958_f2e46c33.jpg',
    tag: 'Babbar Sher, Om Filigree, Signets & Bands',
    priceGuide: 'Approved: ₹1,400–₹1,500',
    description: 'Sovereign signet rings, fluted bands, and sculptural motifs in polished gold-tone finish.',
  },
  Kada: {
    image: '/assets/aistudio/IMG_20261113_075757_5aea3a2b.jpg',
    tag: 'Rajwada Mesh, Meenakari & Jaali Kada',
    priceGuide: 'Approved: Fixed ₹1,500',
    description: 'Heavy traditional kada pairs and royal statement cuffs with secure side-hinge clasps.',
  },
  'Ladies Sets': {
    image: '/assets/aistudio/IMG_20261113_100244_e8a65b49.jpg',
    tag: 'Royal Bridal Haars & Jhumka Sets',
    priceGuide: 'Approved: ₹2,800–₹3,200',
    description: 'Grand Rajputana and temple bridal jewellery sets with matching ornate statement earrings.',
  },
  Mangalsutra: {
    image: '/assets/aistudio/IMG_20261113_075631_53f93a92.jpg',
    tag: 'Sacred Beads, Ruby Kalash & Hearts',
    priceGuide: 'Approved: ₹1,400–₹1,500',
    description: 'Auspicious black crystal bead mangalsutras adorned with handcrafted 22K gold pendants.',
  },
  Earrings: {
    image: '/assets/aistudio/IMG_20261113_075512_c4448a0b.jpg',
    tag: 'Heart Drops, Swans, Floral Latkans',
    priceGuide: 'Approved: ₹1,400–₹1,500',
    description: 'Delicate swaying gold dangles and studs sparkling with brilliant cubic zirconia accents.',
  },
  Pendants: {
    image: '/assets/aistudio/IMG_20261113_104854_ccae4bc0.jpg',
    tag: 'Lion Medallions, Mahadev & Deity Motifs',
    priceGuide: 'Approved: ₹800–₹900',
    description: 'Deeply revered spiritual and cultural devotional pendants blessed with traditional motifs.',
  },
  Bracelets: {
    image: '/assets/aistudio/IMG_20261113_105710_2ad0e9b9.jpg',
    tag: 'Cuban Link & Stone Inset Bracelets',
    priceGuide: 'Approved: ₹1,500–₹1,600',
    description: 'Modern royal wristpieces featuring textured gold curb links and crystal embellishments.',
  },
};

interface AllCategoriesModalProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export const AllCategoriesModal: React.FC<AllCategoriesModalProps> = ({
  isOpen: propIsOpen,
  onClose: propOnClose,
}) => {
  const { categories, setSelectedCategory, isAllCategoriesOpen, setIsAllCategoriesOpen } = useShop();

  const isOpen = propIsOpen !== undefined ? propIsOpen : isAllCategoriesOpen;
  const onClose = propOnClose || (() => setIsAllCategoriesOpen(false));

  if (!isOpen) return null;

  const handleSelect = (categoryName: CategoryType) => {
    setSelectedCategory(categoryName);
    onClose();
    const el = document.getElementById('catalog-section');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-4xl max-h-[90vh] flex flex-col bg-[#FAF7F2] rounded-xl shadow-2xl border border-[#C5A36A]/50 overflow-hidden">
        
        {/* Header */}
        <div className="bg-[#493326] text-[#F7EFE1] px-5 sm:px-6 py-4 flex items-center justify-between border-b border-[#C5A36A]/40 shrink-0">
          <div>
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#C5A36A]" />
              <h3 className="font-royal text-base sm:text-xl font-bold tracking-wide text-white">
                ALL JEWELLERY CATEGORIES
              </h3>
            </div>
            <p className="text-xs text-[#DFCA9B] font-light mt-0.5">
              Explore our complete sovereign collection of {categories.length} traditional jewellery categories
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-[#DFCA9B] hover:text-white hover:bg-white/10 rounded-full transition-colors cursor-pointer"
            aria-label="Close All Categories Modal"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* 2-Column Grid of All Categories */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {categories.map((cat) => {
              const details = CATEGORY_DETAILS[cat.name] || {
                image: '/assets/aistudio/IMG_20261112_144610_4413d601.jpg',
                tag: 'Handcrafted Sovereign Jewellery',
                priceGuide: 'Approved Direct Artisan Pricing',
                description: 'Authentic 22K gold polish heirloom craftsmanship.',
              };

              return (
                <div
                  key={cat.name}
                  onClick={() => handleSelect(cat.name)}
                  className="group flex gap-3 p-3 bg-white hover:bg-[#FDFBF7] rounded-lg border border-[#C5A36A]/30 hover:border-[#C5A36A] shadow-xs hover:shadow-md transition-all cursor-pointer"
                >
                  <div className="relative w-24 h-24 shrink-0 rounded-md overflow-hidden bg-[#F5EFEB] border border-[#C5A36A]/20">
                    <LuxuryImage
                      src={details.image}
                      alt={cat.name}
                      aspectRatio="square"
                      fit={cat.name === 'Chains' || cat.name === 'Rings' ? 'contain' : 'cover'}
                      className={
                        cat.name === 'Chains' || cat.name === 'Rings'
                          ? 'transition-transform duration-500'
                          : 'group-hover:scale-108 transition-transform duration-500'
                      }
                    />
                    <span className="absolute bottom-1 right-1 text-[9px] font-mono bg-black/70 text-white px-1.5 py-0.5 rounded-xs z-10">
                      {cat.count} Designs
                    </span>
                  </div>

                  <div className="flex-1 flex flex-col justify-between min-w-0">
                    <div>
                      <div className="flex items-center justify-between gap-1">
                        <h4 className="font-royal text-sm sm:text-base font-bold text-[#241A15] group-hover:text-[#9E7D3B] transition-colors truncate">
                          {cat.name}
                        </h4>
                        <span className="p-1 rounded-full bg-[#FAF7F2] text-[#9E7D3B] group-hover:bg-[#C5A36A] group-hover:text-black transition-colors shrink-0">
                          <ArrowRight className="w-3.5 h-3.5" />
                        </span>
                      </div>
                      <p className="text-[11px] font-medium text-[#C5A36A] mt-0.5 truncate">
                        {details.priceGuide}
                      </p>
                      <p className="text-[11px] text-[#6A5A52] font-light line-clamp-2 mt-1">
                        {details.description}
                      </p>
                    </div>

                    <div className="text-[10px] text-[#9E7D3B] font-semibold uppercase tracking-wider pt-1 flex items-center gap-1">
                      <span>Explore Collection</span>
                      <span>→</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="bg-[#EFE7DC] px-6 py-3 border-t border-[#C5A36A]/30 flex items-center justify-between text-xs text-[#5C3E2D] shrink-0">
          <span className="font-medium">
            SHRI JI JEWELS · Divine By Tradition · Timeless By Trust
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-[#493326] text-[#F7EFE1] hover:bg-[#342217] rounded-sm font-semibold transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
};
