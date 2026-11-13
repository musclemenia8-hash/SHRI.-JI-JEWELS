import React, { useState } from 'react';
import { X, MessageCircle, ShieldCheck, AlertCircle, ArrowRight, ExternalLink } from 'lucide-react';
import { useShop } from '../context/ShopContext';
import { CheckoutFormData } from '../types';

export const CheckoutModal: React.FC = () => {
  const {
    cart,
    cartSubtotal,
    isCheckoutOpen,
    setIsCheckoutOpen,
    selectedProduct,
    createWhatsAppOrderUrl,
  } = useShop();

  const [formData, setFormData] = useState<CheckoutFormData>({
    fullName: '',
    mobileNumber: '',
    address: '',
    city: '',
    state: '',
    pinCode: '',
    notes: '',
  });

  const [errors, setErrors] = useState<Partial<Record<keyof CheckoutFormData, string>>>({});
  const [hasOpenedWhatsApp, setHasOpenedWhatsApp] = useState(false);

  if (!isCheckoutOpen) return null;

  // Items to order (either selectedProduct if clicked Direct Buy Now, or entire cart)
  const isDirectBuy = !!selectedProduct && cart.length === 0;
  const itemsCount = isDirectBuy ? 1 : cart.reduce((sum, item) => sum + item.quantity, 0);
  const totalAmount = isDirectBuy ? selectedProduct.sellingPrice : cartSubtotal;

  const validate = (): boolean => {
    const newErrors: Partial<Record<keyof CheckoutFormData, string>> = {};

    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Full Name is required.';
    }
    if (!formData.mobileNumber.trim()) {
      newErrors.mobileNumber = 'Mobile number is required.';
    } else if (!/^[0-9]{10}$/.test(formData.mobileNumber.trim().replace(/[^0-9]/g, ''))) {
      newErrors.mobileNumber = 'Please enter a valid 10-digit mobile number.';
    }
    if (!formData.address.trim()) {
      newErrors.address = 'Complete delivery street address is required.';
    }
    if (!formData.city.trim()) {
      newErrors.city = 'City is required.';
    }
    if (!formData.state.trim()) {
      newErrors.state = 'State is required.';
    }
    if (!formData.pinCode.trim()) {
      newErrors.pinCode = 'PIN code is required.';
    } else if (!/^[0-9]{6}$/.test(formData.pinCode.trim())) {
      newErrors.pinCode = 'Please enter a valid 6-digit PIN code.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    // Generate verified WhatsApp order URL
    const url = createWhatsAppOrderUrl(formData, isDirectBuy ? selectedProduct : undefined);
    
    // Open WhatsApp in a new tab
    window.open(url, '_blank');
    setHasOpenedWhatsApp(true);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-[#241A15]/75 backdrop-blur-xs transition-opacity"
        onClick={() => setIsCheckoutOpen(false)}
      />

      {/* Modal Dialog */}
      <div className="relative w-full max-w-2xl bg-white rounded-lg shadow-2xl border border-[#C5A059]/40 z-10 overflow-hidden my-6">
        
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-[#C5A059]/20 bg-[#F5EFEB] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#241A15] text-[#DFCA9B] flex items-center justify-center">
              <MessageCircle className="w-5 h-5 text-[#25D366]" />
            </div>
            <div>
              <h3 className="font-royal text-lg font-bold text-[#241A15]">
                WhatsApp Direct Order Booking
              </h3>
              <p className="text-xs text-[#5A4A42]">
                SHRI JI JEWELS Verified Desk · +91 9315741495
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsCheckoutOpen(false)}
            className="p-1.5 text-[#5A4A42] hover:text-[#241A15] rounded-md transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="max-h-[80vh] overflow-y-auto p-5 sm:p-7 space-y-6">
          
          {/* Order Summary Box */}
          <div className="bg-[#FBF8F2] p-4 rounded-md border border-[#C5A059]/30 space-y-3">
            <div className="flex items-center justify-between text-xs text-[#5A4A42] border-b border-[#C5A059]/15 pb-2">
              <span className="font-semibold uppercase tracking-wider text-[#241A15]">
                Order Items ({itemsCount})
              </span>
              <span className="font-mono text-[#9E7D3B]">
                Desk: 9315741495
              </span>
            </div>

            {/* List items */}
            <div className="space-y-2 text-xs text-[#241A15] max-h-36 overflow-y-auto pr-1">
              {isDirectBuy ? (
                <div className="flex justify-between items-center py-1 border-b border-dashed border-[#C5A059]/20">
                  <span className="font-medium truncate max-w-xs">{selectedProduct.name} [ID: {selectedProduct.id}]</span>
                  <span className="font-bold tabular-nums">₹{selectedProduct.sellingPrice.toLocaleString('en-IN')}</span>
                </div>
              ) : (
                cart.map((item) => (
                  <div key={item.product.id} className="flex justify-between items-center py-1 border-b border-dashed border-[#C5A059]/20">
                    <span className="font-medium truncate max-w-xs">{item.quantity}x {item.product.name} [ID: {item.product.id}]</span>
                    <span className="font-bold tabular-nums">₹{(item.product.sellingPrice * item.quantity).toLocaleString('en-IN')}</span>
                  </div>
                ))
              )}
            </div>

            {/* Price Calculations & Advance */}
            <div className="pt-2 space-y-1.5 text-xs">
              <div className="flex justify-between text-[#5A4A42]">
                <span>Total Order Value:</span>
                <span className="font-semibold text-[#241A15] tabular-nums">
                  ₹{totalAmount.toLocaleString('en-IN')}
                </span>
              </div>
              <div className="flex justify-between font-bold text-[#9E7D3B]">
                <span>Required Advance Token (To Process):</span>
                <span className="tabular-nums">₹200</span>
              </div>
              <div className="flex justify-between text-[#5A4A42]">
                <span>Balance Payable on Tracking Confirmation:</span>
                <span className="font-semibold text-[#241A15] tabular-nums">
                  ₹{Math.max(0, totalAmount - 200).toLocaleString('en-IN')}
                </span>
              </div>
            </div>
          </div>

          {/* Policy Warning Banner */}
          <div className="p-3 bg-[#FFF9EB] border border-[#C5A059]/40 rounded-sm space-y-1 text-xs text-[#5A4A42]">
            <div className="flex items-center gap-1.5 font-bold text-[#9E7D3B] uppercase tracking-wider">
              <ShieldCheck className="w-4 h-4 text-[#9E7D3B]" />
              <span>Strict Order & Payment Policy</span>
            </div>
            <p className="text-[11px] leading-relaxed">
              1. <strong>₹200 advance payment</strong> is required to confirm booking. <br />
              2. <strong>Cash on Delivery (COD) is not available.</strong> <br />
              3. <strong>No returns, refunds, or exchanges</strong> are entertained. All pieces undergo strict quality inspection prior to packaging.
            </p>
          </div>

          {/* Customer Delivery Details Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <h4 className="font-royal text-sm font-bold text-[#241A15] uppercase tracking-wider">
              Recipient & Delivery Information
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              {/* Full Name */}
              <div>
                <label className="block text-[#5A4A42] font-semibold mb-1">
                  Full Name <span className="text-red-700">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g., Rajesh Singhania"
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  className="w-full px-3 py-2 border border-[#C5A059]/30 rounded-sm focus:outline-hidden focus:border-[#9E7D3B] bg-white text-[#241A15]"
                />
                {errors.fullName && <p className="text-red-600 text-[10px] mt-0.5">{errors.fullName}</p>}
              </div>

              {/* Mobile Number */}
              <div>
                <label className="block text-[#5A4A42] font-semibold mb-1">
                  Mobile Number (WhatsApp Preferred) <span className="text-red-700">*</span>
                </label>
                <input
                  type="tel"
                  placeholder="10-digit mobile number"
                  value={formData.mobileNumber}
                  onChange={(e) => setFormData({ ...formData, mobileNumber: e.target.value })}
                  className="w-full px-3 py-2 border border-[#C5A059]/30 rounded-sm focus:outline-hidden focus:border-[#9E7D3B] bg-white text-[#241A15]"
                />
                {errors.mobileNumber && <p className="text-red-600 text-[10px] mt-0.5">{errors.mobileNumber}</p>}
              </div>

              {/* Full Address */}
              <div className="sm:col-span-2">
                <label className="block text-[#5A4A42] font-semibold mb-1">
                  Complete Street Address <span className="text-red-700">*</span>
                </label>
                <input
                  type="text"
                  placeholder="House/Flat No, Landmark, Colony/Area"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="w-full px-3 py-2 border border-[#C5A059]/30 rounded-sm focus:outline-hidden focus:border-[#9E7D3B] bg-white text-[#241A15]"
                />
                {errors.address && <p className="text-red-600 text-[10px] mt-0.5">{errors.address}</p>}
              </div>

              {/* City */}
              <div>
                <label className="block text-[#5A4A42] font-semibold mb-1">
                  City <span className="text-red-700">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g., Jaipur"
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  className="w-full px-3 py-2 border border-[#C5A059]/30 rounded-sm focus:outline-hidden focus:border-[#9E7D3B] bg-white text-[#241A15]"
                />
                {errors.city && <p className="text-red-600 text-[10px] mt-0.5">{errors.city}</p>}
              </div>

              {/* State */}
              <div>
                <label className="block text-[#5A4A42] font-semibold mb-1">
                  State <span className="text-red-700">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g., Rajasthan"
                  value={formData.state}
                  onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                  className="w-full px-3 py-2 border border-[#C5A059]/30 rounded-sm focus:outline-hidden focus:border-[#9E7D3B] bg-white text-[#241A15]"
                />
                {errors.state && <p className="text-red-600 text-[10px] mt-0.5">{errors.state}</p>}
              </div>

              {/* PIN Code */}
              <div>
                <label className="block text-[#5A4A42] font-semibold mb-1">
                  PIN Code <span className="text-red-700">*</span>
                </label>
                <input
                  type="text"
                  maxLength={6}
                  placeholder="6-digit postal code"
                  value={formData.pinCode}
                  onChange={(e) => setFormData({ ...formData, pinCode: e.target.value })}
                  className="w-full px-3 py-2 border border-[#C5A059]/30 rounded-sm focus:outline-hidden focus:border-[#9E7D3B] bg-white text-[#241A15]"
                />
                {errors.pinCode && <p className="text-red-600 text-[10px] mt-0.5">{errors.pinCode}</p>}
              </div>

              {/* Optional Notes */}
              <div>
                <label className="block text-[#5A4A42] font-semibold mb-1">
                  Delivery Notes / Landmark (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g., Gift wrap in velvet box"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full px-3 py-2 border border-[#C5A059]/30 rounded-sm focus:outline-hidden focus:border-[#9E7D3B] bg-white text-[#241A15]"
                />
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-4 border-t border-[#C5A059]/20 space-y-3">
              <button
                type="submit"
                className="w-full py-3.5 px-6 bg-[#25D366] hover:bg-[#20bd5a] text-[#111B21] font-bold text-sm rounded-sm transition-all flex items-center justify-center gap-2 shadow-lg"
              >
                <MessageCircle className="w-5 h-5 fill-current" />
                <span>Send Order Details to WhatsApp Desk (+91 9315741495)</span>
              </button>

              {/* Important Phase 16 Notice: Opening WhatsApp does not mean order has been submitted. The customer must press Send. Do not display false order-success confirmations! */}
              <div className="p-3 bg-[#F5EFEB] rounded-sm text-[11px] text-[#5A4A42] space-y-1">
                <div className="flex items-center gap-1.5 font-bold text-[#241A15]">
                  <AlertCircle className="w-3.5 h-3.5 text-[#9E7D3B]" />
                  <span>Important Step After Opening WhatsApp:</span>
                </div>
                <p>
                  Clicking the button above will launch WhatsApp with your prefilled order slip. <strong>You must press the Send button in WhatsApp to submit your order to our executive.</strong> Opening WhatsApp does not finalize the order until you press send.
                </p>
              </div>

              {hasOpenedWhatsApp && (
                <div className="p-3 bg-emerald-50 border border-emerald-300 rounded-sm text-xs text-emerald-900 flex items-center justify-between">
                  <span>WhatsApp conversation opened! Please press Send in your WhatsApp app.</span>
                  <button
                    type="button"
                    onClick={() => setIsCheckoutOpen(false)}
                    className="font-bold underline text-emerald-950"
                  >
                    Done
                  </button>
                </div>
              )}
            </div>
          </form>

        </div>

      </div>
    </div>
  );
};
