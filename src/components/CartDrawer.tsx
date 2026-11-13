import React from 'react';
import { X, Trash2, Plus, Minus, ShoppingBag, ArrowRight, ShieldCheck } from 'lucide-react';
import { useShop } from '../context/ShopContext';
import { LuxuryImage } from './LuxuryImage';

export const CartDrawer: React.FC = () => {
  const {
    cart,
    isCartOpen,
    setIsCartOpen,
    updateQuantity,
    removeFromCart,
    clearCart,
    cartSubtotal,
    cartCount,
    setIsCheckoutOpen,
  } = useShop();

  if (!isCartOpen) return null;

  const handleProceedToCheckout = () => {
    setIsCartOpen(false);
    setIsCheckoutOpen(true);
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-[#241A15]/60 backdrop-blur-xs transition-opacity"
        onClick={() => setIsCartOpen(false)}
      />

      {/* Drawer */}
      <div className="relative w-full max-w-md bg-[#FBF8F2] h-full shadow-2xl flex flex-col z-10 border-l border-[#C5A059]/30">
        
        {/* Header */}
        <div className="p-5 border-b border-[#C5A059]/20 bg-[#F5EFEB] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-[#9E7D3B]" />
            <h3 className="font-royal text-base font-bold text-[#241A15]">
              Royal Shopping Bag
            </h3>
            <span className="text-xs bg-[#241A15] text-[#DFCA9B] px-2 py-0.5 rounded-full font-mono font-bold tabular-nums">
              {cartCount}
            </span>
          </div>

          <button
            onClick={() => setIsCartOpen(false)}
            className="p-1.5 text-[#5A4A42] hover:text-[#241A15] rounded-md transition-colors"
            aria-label="Close cart"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Cart Items List */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
          {cart.length > 0 ? (
            cart.map((item) => (
              <div
                key={item.product.id}
                className="bg-white p-3.5 rounded-lg border border-[#C5A059]/20 shadow-xs flex gap-3.5 items-center"
              >
                {/* Product Thumbnail */}
                <div className="w-20 h-20 rounded-md overflow-hidden bg-[#F5EFEB] shrink-0 border border-[#C5A059]/15">
                  <LuxuryImage
                    src={item.product.image}
                    alt={item.product.name}
                    aspectRatio="square"
                    fit={item.product.primaryCategory === 'Rings' || item.product.primaryCategory === 'Chains' ? 'contain' : 'cover'}
                  />
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0 space-y-1">
                  <div className="flex items-start justify-between gap-1">
                    <h4 className="font-royal text-xs sm:text-sm font-semibold text-[#241A15] truncate">
                      {item.product.name}
                    </h4>
                    <button
                      onClick={() => removeFromCart(item.product.id)}
                      className="text-[#5A4A42] hover:text-red-700 p-1"
                      title="Remove item"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <p className="text-[10px] text-[#9E7D3B] font-mono">
                    ID: {item.product.id} · {item.product.primaryCategory}
                  </p>

                  <div className="flex items-center justify-between pt-1">
                    <span className="text-xs font-bold text-[#241A15] tabular-nums">
                      ₹{item.product.sellingPrice.toLocaleString('en-IN')}
                    </span>

                    {/* Quantity Stepper */}
                    <div className="flex items-center border border-[#C5A059]/30 rounded-sm bg-[#FBF8F2]">
                      <button
                        onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                        className="p-1 hover:bg-[#F5EFEB] text-[#241A15]"
                        aria-label="Decrease quantity"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="px-2 text-xs font-mono font-medium text-[#241A15] tabular-nums">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                        className="p-1 hover:bg-[#F5EFEB] text-[#241A15]"
                        aria-label="Increase quantity"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-16 space-y-3">
              <div className="w-12 h-12 mx-auto rounded-full bg-[#F5EFEB] flex items-center justify-center text-[#9E7D3B]">
                <ShoppingBag className="w-6 h-6" />
              </div>
              <h4 className="font-royal text-sm font-bold text-[#241A15]">
                Your Bag Is Empty
              </h4>
              <p className="text-xs text-[#5A4A42] max-w-xs mx-auto">
                Discover our royal selection of chains, rings, and designer kada to begin your order.
              </p>
              <button
                onClick={() => setIsCartOpen(false)}
                className="mt-2 px-4 py-2 bg-[#241A15] text-[#DFCA9B] text-xs font-semibold uppercase tracking-wider rounded-sm hover:bg-[#9E7D3B] transition-colors"
              >
                Start Exploring
              </button>
            </div>
          )}
        </div>

        {/* Footer Summary & Advance Rule */}
        {cart.length > 0 && (
          <div className="p-5 border-t border-[#C5A059]/20 bg-[#F5EFEB] space-y-4">
            
            {/* Advance Notice strip */}
            <div className="p-2.5 bg-[#FFF9EB] border border-[#C5A059]/30 rounded-sm flex items-start gap-2 text-[11px] text-[#5A4A42]">
              <ShieldCheck className="w-4 h-4 text-[#9E7D3B] shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-[#241A15]">₹200 Advance Required: </span>
                Payable via UPI to book parcel. Remaining balance payable upon tracking docket receipt.
              </div>
            </div>

            {/* Subtotal calculation */}
            <div className="space-y-1.5 text-xs text-[#5A4A42]">
              <div className="flex justify-between">
                <span>Order Total:</span>
                <span className="font-semibold text-[#241A15] tabular-nums">
                  ₹{cartSubtotal.toLocaleString('en-IN')}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Required Advance Token:</span>
                <span className="font-bold text-[#9E7D3B] tabular-nums">
                  ₹200
                </span>
              </div>
              <div className="flex justify-between">
                <span>Balance on Tracking:</span>
                <span className="font-semibold text-[#241A15] tabular-nums">
                  ₹{Math.max(0, cartSubtotal - 200).toLocaleString('en-IN')}
                </span>
              </div>
              <div className="flex justify-between border-t border-[#C5A059]/20 pt-2 text-sm font-bold text-[#241A15]">
                <span>Total Value:</span>
                <span className="text-base tabular-nums">
                  ₹{cartSubtotal.toLocaleString('en-IN')}
                </span>
              </div>
            </div>

            {/* Buttons */}
            <div className="space-y-2">
              <button
                onClick={handleProceedToCheckout}
                className="w-full py-3 px-4 bg-[#241A15] hover:bg-[#9E7D3B] text-white font-semibold text-xs uppercase tracking-widest rounded-sm transition-colors flex items-center justify-center gap-2 shadow-md"
              >
                <span>Proceed To WhatsApp Booking</span>
                <ArrowRight className="w-4 h-4 text-[#DFCA9B]" />
              </button>

              <div className="flex items-center justify-between text-xs">
                <button
                  onClick={() => setIsCartOpen(false)}
                  className="text-[#5A4A42] hover:text-[#241A15] underline"
                >
                  Continue Shopping
                </button>
                <button
                  onClick={clearCart}
                  className="text-red-700 hover:text-red-900"
                >
                  Empty Bag
                </button>
              </div>
            </div>

          </div>
        )}

      </div>
    </div>
  );
};
