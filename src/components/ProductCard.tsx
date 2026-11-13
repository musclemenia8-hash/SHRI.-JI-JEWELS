import React from 'react';
import { Heart, ShoppingBag, Eye, MessageCircle } from 'lucide-react';
import { Product } from '../types';
import { useShop } from '../context/ShopContext';
import { LuxuryImage } from './LuxuryImage';

interface ProductCardProps {
  product: Product;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const {
    isInWishlist,
    toggleWishlist,
    addToCart,
    setSelectedProduct,
    setIsCheckoutOpen,
  } = useShop();

  const isFavorite = isInWishlist(product.id);

  const handleQuickBuy = (e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedProduct(product);
    setIsCheckoutOpen(true);
  };

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    addToCart(product, 1);
  };

  return (
    <div
      onClick={() => setSelectedProduct(product)}
      className="group relative bg-white rounded-lg overflow-hidden border border-[#C5A059]/25 shadow-xs hover:shadow-xl transition-all duration-300 flex flex-col cursor-pointer"
    >
      {/* Product Image Area with LuxuryImage (Automatic Watermark Concealment) */}
      <div className="relative aspect-square w-full overflow-hidden bg-[#F5EFEB]">
        <LuxuryImage
          src={product.image}
          alt={product.name}
          aspectRatio="square"
          fit={product.primaryCategory === 'Rings' || product.primaryCategory === 'Chains' ? 'contain' : 'cover'}
          hideWatermark={true}
          className={
            product.primaryCategory === 'Rings' || product.primaryCategory === 'Chains'
              ? 'transition-transform duration-500 ease-out'
              : 'group-hover:scale-108 transition-transform duration-700 ease-out'
          }
        />

        {/* Wishlist Button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            toggleWishlist(product.id);
          }}
          className={`absolute top-3 right-3 p-2 rounded-full backdrop-blur-md transition-all z-10 cursor-pointer ${
            isFavorite
              ? 'bg-[#9E7D3B] text-white shadow-md'
              : 'bg-white/80 text-[#241A15] hover:bg-white hover:text-[#9E7D3B]'
          }`}
          aria-label={isFavorite ? 'Remove from Wishlist' : 'Add to Wishlist'}
        >
          <Heart className={`w-4 h-4 ${isFavorite ? 'fill-current' : ''}`} />
        </button>

        {/* Badges: only 1 subtle tag */}
        {product.isNewArrival && (
          <div className="absolute top-3 left-3 bg-[#241A15] text-[#DFCA9B] text-[10px] font-bold tracking-widest uppercase px-2 py-0.5 rounded-sm border border-[#C5A059]/40 z-10">
            New Arrival
          </div>
        )}
        {!product.isNewArrival && product.isBestseller && (
          <div className="absolute top-3 left-3 bg-[#9E7D3B] text-white text-[10px] font-bold tracking-widest uppercase px-2 py-0.5 rounded-sm z-10">
            Best Seller
          </div>
        )}


        {/* Quick View Hover Action */}
        <div className="absolute inset-0 bg-black/25 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 p-4 z-10">
          <span className="px-3.5 py-1.5 bg-white/95 text-[#241A15] text-xs font-semibold tracking-wider uppercase rounded-sm shadow-md flex items-center gap-1.5 hover:bg-white">
            <Eye className="w-3.5 h-3.5 text-[#9E7D3B]" />
            <span>Quick View</span>
          </span>
        </div>
      </div>

      {/* Card Details Area */}
      <div className="p-3 sm:p-4 flex flex-col flex-1 justify-between bg-white">
        <div>
          {/* Metadata line with typographic separators */}
          <div className="flex items-center gap-1.5 text-[11px] text-[#5A4A42] uppercase tracking-wider mb-1 flex-wrap">
            <span>{product.primaryCategory}</span>
            <span aria-hidden="true">·</span>
            <span>{product.audience}</span>
            <span aria-hidden="true">·</span>
            <span className="font-mono text-[10px] text-[#9E7D3B]">{product.id}</span>
          </div>

          {/* Product Title */}
          <h3 className="font-royal text-sm font-semibold text-[#241A15] group-hover:text-[#9E7D3B] transition-colors line-clamp-1">
            {product.name}
          </h3>

          {/* Sub-description snippet */}
          <p className="text-xs text-[#5A4A42] font-light mt-1 line-clamp-1">
            {product.description}
          </p>
        </div>

        {/* Pricing Baseline */}
        <div className="pt-3 mt-3 border-t border-[#F5EFEB] flex items-baseline justify-between">
          <div className="flex items-baseline gap-2">
            <span className="text-base font-bold text-[#241A15] tabular-nums">
              ₹{product.sellingPrice.toLocaleString('en-IN')}
            </span>
            {product.originalPrice && (
              <span className="text-xs text-[#5A4A42]/70 line-through tabular-nums">
                ₹{product.originalPrice.toLocaleString('en-IN')}
              </span>
            )}
            {product.discountPercent && (
              <span className="text-[10px] font-bold text-emerald-700 tabular-nums">
                {product.discountPercent}% OFF
              </span>
            )}
          </div>
          <span className="text-[10px] text-[#9E7D3B] font-medium uppercase tracking-wider">
            ₹200 Adv.
          </span>
        </div>

        {/* Action Buttons */}
        <div className="pt-3 mt-2 grid grid-cols-2 gap-2">
          <button
            onClick={handleAddToCart}
            className="w-full py-2 px-2 bg-[#F5EFEB] hover:bg-[#C5A059]/20 text-[#241A15] text-[11px] font-semibold uppercase tracking-wider rounded-sm transition-colors flex items-center justify-center gap-1"
          >
            <ShoppingBag className="w-3.5 h-3.5 text-[#9E7D3B]" />
            <span>Bag</span>
          </button>
          
          <button
            onClick={handleQuickBuy}
            className="w-full py-2 px-2 bg-[#241A15] hover:bg-[#9E7D3B] text-white text-[11px] font-semibold uppercase tracking-wider rounded-sm transition-colors flex items-center justify-center gap-1 shadow-xs"
          >
            <MessageCircle className="w-3.5 h-3.5 text-[#DFCA9B]" />
            <span>Buy Now</span>
          </button>
        </div>

      </div>
    </div>
  );
};
