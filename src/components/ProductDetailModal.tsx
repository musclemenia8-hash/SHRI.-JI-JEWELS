import React, { useState, useEffect } from 'react';
import { X, Heart, ShoppingBag, ShieldCheck, Truck, Check, Share2, MessageCircle } from 'lucide-react';
import { useShop } from '../context/ShopContext';
import { LuxuryImage } from './LuxuryImage';

export const ProductDetailModal: React.FC = () => {
  const {
    selectedProduct,
    setSelectedProduct,
    addToCart,
    isInWishlist,
    toggleWishlist,
    setIsCheckoutOpen,
  } = useShop();

  const [activeImageIdx, setActiveImageIdx] = useState(0);

  useEffect(() => {
    setActiveImageIdx(0);
  }, [selectedProduct?.id]);

  if (!selectedProduct) return null;

  const galleryImages = [
    selectedProduct.image,
    ...(selectedProduct.additionalImages || []),
  ].filter(Boolean);
  const currentImage = galleryImages[activeImageIdx] || selectedProduct.image;

  const isFavorite = isInWishlist(selectedProduct.id);

  const handleBuyNow = () => {
    setIsCheckoutOpen(true);
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: `${selectedProduct.name} | SHRI JI JEWELS`,
        text: `Check out this royal handcrafted ${selectedProduct.name} at SHRI JI JEWELS!`,
        url: window.location.href,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert('Product link copied to clipboard!');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-[#241A15]/70 backdrop-blur-xs transition-opacity"
        onClick={() => setSelectedProduct(null)}
      />

      {/* Modal Dialog */}
      <div className="relative w-full max-w-4xl bg-white rounded-lg shadow-2xl border border-[#C5A059]/40 z-10 overflow-hidden my-8">
        
        {/* Close Button */}
        <button
          onClick={() => setSelectedProduct(null)}
          className="absolute top-4 right-4 z-20 p-2 rounded-full bg-white/80 hover:bg-white text-[#241A15] border border-[#C5A059]/30 transition-colors shadow-xs"
          aria-label="Close details"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="grid grid-cols-1 md:grid-cols-12 max-h-[85vh] overflow-y-auto">
          
          {/* Left Column: Product Photography & Gallery with AI Cropping */}
          <div className="md:col-span-6 bg-[#F5EFEB] relative flex flex-col items-center justify-center p-6 gap-4 border-b md:border-b-0 md:border-r border-[#C5A059]/20">
            <div className="relative w-full aspect-square max-w-md rounded-md overflow-hidden bg-white shadow-md border border-[#C5A059]/20">
              <LuxuryImage
                src={currentImage}
                alt={selectedProduct.name}
                aspectRatio="square"
                fit={selectedProduct.primaryCategory === 'Rings' || selectedProduct.primaryCategory === 'Chains' ? 'contain' : 'cover'}
                priority={true}
                className={
                  selectedProduct.primaryCategory === 'Rings' || selectedProduct.primaryCategory === 'Chains'
                    ? 'w-full h-full object-contain object-center transition-transform duration-500 ease-out'
                    : 'w-full h-full object-cover object-center transform hover:scale-108 transition-transform duration-500 ease-out cursor-zoom-in'
                }
              />
              <div className="absolute bottom-2 right-2 bg-black/60 text-[10px] text-white px-2 py-0.5 rounded-sm backdrop-blur-xs z-10">
                AI Processed HD
              </div>
            </div>

            {galleryImages.length > 1 && (
              <div className="flex items-center justify-center gap-2.5 w-full max-w-md">
                {galleryImages.map((imgUrl, idx) => (
                  <button
                    key={`${selectedProduct.id}-gal-${idx}`}
                    type="button"
                    onClick={() => setActiveImageIdx(idx)}
                    className={`w-16 h-16 rounded-md overflow-hidden border-2 transition-all cursor-pointer bg-white ${
                      idx === activeImageIdx
                        ? 'border-[#C5A059] ring-2 ring-[#C5A059]/30 shadow-sm'
                        : 'border-[#C5A059]/20 opacity-75 hover:opacity-100'
                    }`}
                    aria-label={`View gallery photo ${idx + 1}`}
                  >
                    <LuxuryImage
                      src={imgUrl}
                      alt={`${selectedProduct.name} view ${idx + 1}`}
                      aspectRatio="square"
                      fit={selectedProduct.primaryCategory === 'Rings' || selectedProduct.primaryCategory === 'Chains' ? 'contain' : 'cover'}
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right Column: Contiguous Purchase Module (Mandatory per Reference §2.A) */}
          <div className="md:col-span-6 p-6 sm:p-8 flex flex-col justify-between space-y-6 bg-[#FBF8F2]">
            
            <div className="space-y-4">
              {/* Category & Status breadcrumb */}
              <div className="flex items-center justify-between text-xs text-[#5A4A42]">
                <div className="flex items-center gap-1.5 uppercase tracking-wider font-semibold">
                  <span className="text-[#9E7D3B]">{selectedProduct.primaryCategory}</span>
                  <span>·</span>
                  <span>{selectedProduct.audience}</span>
                  <span>·</span>
                  <span className="font-mono text-[11px]">{selectedProduct.id}</span>
                </div>
                
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleShare}
                    className="p-1.5 text-[#5A4A42] hover:text-[#241A15]"
                    title="Share piece"
                  >
                    <Share2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => toggleWishlist(selectedProduct.id)}
                    className={`p-1.5 rounded-full transition-colors ${
                      isFavorite ? 'text-red-600' : 'text-[#5A4A42] hover:text-[#241A15]'
                    }`}
                    title="Save to Wishlist"
                  >
                    <Heart className={`w-4 h-4 ${isFavorite ? 'fill-current' : ''}`} />
                  </button>
                </div>
              </div>

              {/* Title */}
              <h2 className="font-royal text-xl sm:text-2xl font-bold text-[#241A15] leading-tight">
                {selectedProduct.name}
              </h2>

              {/* Pricing Display */}
              <div className="p-3 bg-white rounded-md border border-[#C5A059]/25 flex items-baseline justify-between">
                <div>
                  <span className="text-xs text-[#5A4A42] block uppercase tracking-wider">
                    Verified Selling Price
                  </span>
                  <div className="flex items-baseline gap-2.5 mt-0.5">
                    <span className="text-2xl font-bold text-[#241A15] tabular-nums">
                      ₹{selectedProduct.sellingPrice.toLocaleString('en-IN')}
                    </span>
                    {selectedProduct.originalPrice && (
                      <span className="text-sm text-[#5A4A42]/70 line-through tabular-nums">
                        ₹{selectedProduct.originalPrice.toLocaleString('en-IN')}
                      </span>
                    )}
                    {selectedProduct.discountPercent && (
                      <span className="text-xs font-bold text-emerald-700 tabular-nums">
                        Save {selectedProduct.discountPercent}%
                      </span>
                    )}
                  </div>
                </div>

                <div className="text-right">
                  <span className="inline-block px-2 py-0.5 bg-emerald-50 text-emerald-800 text-[11px] font-bold rounded-sm border border-emerald-200">
                    {selectedProduct.availability}
                  </span>
                </div>
              </div>

              {/* Crucial ₹200 Advance Notice Requirement (Phase 14 & 21) */}
              <div className="p-3.5 bg-[#FFF9EB] border border-[#C5A059]/40 rounded-md space-y-1">
                <div className="flex items-center gap-1.5 text-xs font-bold text-[#9E7D3B] uppercase tracking-wider">
                  <ShieldCheck className="w-4 h-4 text-[#9E7D3B]" />
                  <span>₹200 Advance Payment Required</span>
                </div>
                <p className="text-[11px] text-[#5A4A42] leading-relaxed">
                  To confirm genuine booking and reserve artisan packaging, a ₹200 advance payment is required via UPI. The remaining ₹{Math.max(0, selectedProduct.sellingPrice - 200).toLocaleString('en-IN')} is paid upon tracking confirmation. Cash on Delivery is not available.
                </p>
              </div>

              {/* Description */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#241A15] mb-1">
                  Craftsmanship & Design
                </h4>
                <p className="text-xs text-[#5A4A42] leading-relaxed font-light">
                  {selectedProduct.description}
                </p>
              </div>

              {/* Features List */}
              {selectedProduct.features && selectedProduct.features.length > 0 && (
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-[#241A15] mb-1.5">
                    Royal Highlights
                  </h4>
                  <ul className="space-y-1 text-xs text-[#5A4A42]">
                    {selectedProduct.features.map((feat, idx) => (
                      <li key={idx} className="flex items-center gap-2">
                        <Check className="w-3.5 h-3.5 text-[#9E7D3B] shrink-0" />
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* Bottom Actions: Add to Bag and Buy Now */}
            <div className="pt-4 border-t border-[#C5A059]/25 space-y-2">
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => addToCart(selectedProduct, 1)}
                  className="w-full py-3 px-4 bg-white hover:bg-[#F5EFEB] border border-[#C5A059] text-[#241A15] font-semibold text-xs uppercase tracking-widest rounded-sm transition-colors flex items-center justify-center gap-2"
                >
                  <ShoppingBag className="w-4 h-4 text-[#9E7D3B]" />
                  <span>Add To Bag</span>
                </button>

                <button
                  onClick={handleBuyNow}
                  className="w-full py-3 px-4 bg-[#241A15] hover:bg-[#9E7D3B] text-white font-semibold text-xs uppercase tracking-widest rounded-sm transition-colors flex items-center justify-center gap-2 shadow-md"
                >
                  <MessageCircle className="w-4 h-4 text-[#DFCA9B]" />
                  <span>Buy Now</span>
                </button>
              </div>

              <div className="flex items-center justify-center gap-2 text-[10px] text-[#5A4A42]">
                <Truck className="w-3 h-3 text-[#9E7D3B]" />
                <span>Pan-India Secure Express Courier · Signature Box Included</span>
              </div>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
};
