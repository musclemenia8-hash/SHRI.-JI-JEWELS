import React from 'react';
import { X, Heart, Trash2, ShoppingBag, ArrowRight } from 'lucide-react';
import { useShop } from '../context/ShopContext';
import { LuxuryImage } from './LuxuryImage';

export const WishlistDrawer: React.FC = () => {
  const {
    products,
    wishlist,
    isWishlistOpen,
    setIsWishlistOpen,
    toggleWishlist,
    addToCart,
    setSelectedProduct,
  } = useShop();

  if (!isWishlistOpen) return null;

  const savedProducts = products.filter((p) => wishlist.includes(p.id));

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-[#241A15]/60 backdrop-blur-xs transition-opacity"
        onClick={() => setIsWishlistOpen(false)}
      />

      {/* Drawer */}
      <div className="relative w-full max-w-md bg-[#FBF8F2] h-full shadow-2xl flex flex-col z-10 border-l border-[#C5A059]/30">
        
        {/* Header */}
        <div className="p-5 border-b border-[#C5A059]/20 bg-[#F5EFEB] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Heart className="w-5 h-5 text-red-600 fill-red-600" />
            <h3 className="font-royal text-base font-bold text-[#241A15]">
              Saved Masterpieces
            </h3>
            <span className="text-xs bg-[#241A15] text-[#DFCA9B] px-2 py-0.5 rounded-full font-mono font-bold tabular-nums">
              {savedProducts.length}
            </span>
          </div>

          <button
            onClick={() => setIsWishlistOpen(false)}
            className="p-1.5 text-[#5A4A42] hover:text-[#241A15] rounded-md transition-colors"
            aria-label="Close wishlist"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
          {savedProducts.length > 0 ? (
            savedProducts.map((product) => (
              <div
                key={product.id}
                className="bg-white p-3.5 rounded-lg border border-[#C5A059]/20 shadow-xs flex gap-3.5 items-center"
              >
                <div
                  onClick={() => {
                    setIsWishlistOpen(false);
                    setSelectedProduct(product);
                  }}
                  className="w-20 h-20 rounded-md overflow-hidden bg-[#F5EFEB] shrink-0 border border-[#C5A059]/15 cursor-pointer"
                >
                  <LuxuryImage
                    src={product.image}
                    alt={product.name}
                    aspectRatio="square"
                    fit={product.primaryCategory === 'Rings' || product.primaryCategory === 'Chains' ? 'contain' : 'cover'}
                  />
                </div>

                <div className="flex-1 min-w-0 space-y-1">
                  <div className="flex items-start justify-between gap-1">
                    <h4
                      onClick={() => {
                        setIsWishlistOpen(false);
                        setSelectedProduct(product);
                      }}
                      className="font-royal text-xs sm:text-sm font-semibold text-[#241A15] truncate cursor-pointer hover:text-[#9E7D3B]"
                    >
                      {product.name}
                    </h4>
                    <button
                      onClick={() => toggleWishlist(product.id)}
                      className="text-[#5A4A42] hover:text-red-700 p-1"
                      title="Remove from wishlist"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <p className="text-[10px] text-[#9E7D3B] font-mono">
                    ID: {product.id} · {product.primaryCategory}
                  </p>

                  <div className="flex items-center justify-between pt-1">
                    <span className="text-xs font-bold text-[#241A15] tabular-nums">
                      ₹{product.sellingPrice.toLocaleString('en-IN')}
                    </span>

                    <button
                      onClick={() => {
                        addToCart(product, 1);
                      }}
                      className="px-2.5 py-1 bg-[#241A15] hover:bg-[#9E7D3B] text-white text-[10px] font-semibold uppercase tracking-wider rounded-sm transition-colors flex items-center gap-1"
                    >
                      <ShoppingBag className="w-3 h-3 text-[#DFCA9B]" />
                      <span>Move To Bag</span>
                    </button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-16 space-y-3">
              <div className="w-12 h-12 mx-auto rounded-full bg-[#F5EFEB] flex items-center justify-center text-[#9E7D3B]">
                <Heart className="w-6 h-6" />
              </div>
              <h4 className="font-royal text-sm font-bold text-[#241A15]">
                Your Wishlist Is Empty
              </h4>
              <p className="text-xs text-[#5A4A42] max-w-xs mx-auto">
                Save your favorite royal jewellery pieces to easily view or purchase them later.
              </p>
              <button
                onClick={() => setIsWishlistOpen(false)}
                className="mt-2 px-4 py-2 bg-[#241A15] text-[#DFCA9B] text-xs font-semibold uppercase tracking-wider rounded-sm hover:bg-[#9E7D3B] transition-colors"
              >
                Browse Collections
              </button>
            </div>
          )}
        </div>

        {/* Footer */}
        {savedProducts.length > 0 && (
          <div className="p-4 border-t border-[#C5A059]/20 bg-[#F5EFEB]">
            <button
              onClick={() => {
                savedProducts.forEach((p) => addToCart(p, 1));
                setIsWishlistOpen(false);
              }}
              className="w-full py-3 px-4 bg-[#241A15] hover:bg-[#9E7D3B] text-white font-semibold text-xs uppercase tracking-widest rounded-sm transition-colors flex items-center justify-center gap-2 shadow-md"
            >
              <span>Add All To Shopping Bag</span>
              <ArrowRight className="w-4 h-4 text-[#DFCA9B]" />
            </button>
          </div>
        )}

      </div>
    </div>
  );
};
