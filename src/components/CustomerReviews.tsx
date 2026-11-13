import React, { useState } from 'react';
import { Star, MessageSquarePlus, CheckCircle2 } from 'lucide-react';
import { useShop } from '../context/ShopContext';

export const CustomerReviews: React.FC = () => {
  const { reviews, addReview, isReviewModalOpen, setIsReviewModalOpen } = useShop();

  const [form, setForm] = useState({
    customerName: '',
    city: '',
    rating: 5,
    comment: '',
    productPurchased: '',
  });

  const [submitted, setSubmitted] = useState(false);

  // Show only approved reviews
  const approvedReviews = reviews.filter((r) => r.isApproved);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.customerName.trim() || !form.comment.trim()) return;

    addReview({
      customerName: form.customerName,
      city: form.city || 'India',
      rating: form.rating,
      comment: form.comment,
      productPurchased: form.productPurchased || 'Royal Jewellery Piece',
    });

    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      setIsReviewModalOpen(false);
      setForm({ customerName: '', city: '', rating: 5, comment: '', productPurchased: '' });
    }, 2500);
  };

  return (
    <section className="py-14 sm:py-18 bg-[#F5EFEB]" id="reviews-section">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 pb-3 border-b border-[#C5A059]/20 gap-4">
          <div className="space-y-1">
            <span className="text-xs uppercase tracking-widest text-[#9E7D3B] font-semibold">
              Patron Testimonials
            </span>
            <h2 className="font-royal text-2xl sm:text-3xl lg:text-4xl font-bold text-[#241A15]">
              Customer Experiences & Trust
            </h2>
            <p className="text-xs sm:text-sm text-[#5A4A42] font-light">
              Reflections from verified connoisseurs across India who experienced our royal finish.
            </p>
          </div>

          <button
            onClick={() => setIsReviewModalOpen(true)}
            className="px-4 py-2.5 bg-[#241A15] hover:bg-[#9E7D3B] text-white text-xs font-semibold uppercase tracking-wider rounded-sm transition-colors flex items-center gap-2 shadow-xs shrink-0"
          >
            <MessageSquarePlus className="w-4 h-4 text-[#DFCA9B]" />
            <span>Submit Your Review</span>
          </button>
        </div>

        {/* Reviews Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {approvedReviews.map((rev) => (
            <div
              key={rev.id}
              className="bg-white p-6 rounded-lg border border-[#C5A059]/25 shadow-xs flex flex-col justify-between space-y-4"
            >
              <div className="space-y-3">
                {/* Rating stars */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1 text-[#C5A059]">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        className={`w-4 h-4 ${
                          i < rev.rating ? 'fill-current text-[#C5A059]' : 'text-slate-300'
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-[10px] text-[#5A4A42] font-mono">{rev.date}</span>
                </div>

                {/* Comment quote */}
                <p className="font-luxury-serif text-base sm:text-lg text-[#241A15] italic leading-relaxed">
                  "{rev.comment}"
                </p>
              </div>

              {/* Author & Item */}
              <div className="pt-3 border-t border-[#F5EFEB] flex items-center justify-between text-xs">
                <div>
                  <h4 className="font-bold text-[#241A15]">{rev.customerName}</h4>
                  <span className="text-[#5A4A42] text-[11px]">{rev.city}</span>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-[#9E7D3B] uppercase tracking-wider block font-semibold">
                    Verified Purchase
                  </span>
                  <span className="text-[11px] text-[#5A4A42] truncate max-w-[180px] block">
                    {rev.productPurchased}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

      </div>

      {/* Submit Review Modal with Administrator Moderation Notice (Phase 19 requirement) */}
      {isReviewModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-[#241A15]/70 backdrop-blur-xs"
            onClick={() => setIsReviewModalOpen(false)}
          />

          <div className="relative w-full max-w-lg bg-white rounded-lg shadow-2xl border border-[#C5A059]/40 z-10 p-6 sm:p-7 space-y-4">
            <h3 className="font-royal text-lg font-bold text-[#241A15]">
              Share Your SHRI JI JEWELS Experience
            </h3>
            <p className="text-xs text-[#5A4A42]">
              All submissions are moderated by the brand administrator before publishing to ensure authentic customer reviews.
            </p>

            {submitted ? (
              <div className="p-6 bg-emerald-50 text-emerald-900 rounded-md text-center space-y-2 border border-emerald-200">
                <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto" />
                <h4 className="font-bold text-sm">Thank You For Your Review!</h4>
                <p className="text-xs">
                  Your review has been submitted to the administrator for moderation and will appear publicly once approved.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-3 text-xs">
                <div>
                  <label className="block text-[#5A4A42] font-semibold mb-1">
                    Your Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g., Harshit Saxena"
                    value={form.customerName}
                    onChange={(e) => setForm({ ...form, customerName: e.target.value })}
                    className="w-full px-3 py-2 border border-[#C5A059]/30 rounded-sm focus:border-[#9E7D3B] bg-white text-[#241A15]"
                  />
                </div>

                <div>
                  <label className="block text-[#5A4A42] font-semibold mb-1">
                    City / State *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g., Mumbai, Maharashtra"
                    value={form.city}
                    onChange={(e) => setForm({ ...form, city: e.target.value })}
                    className="w-full px-3 py-2 border border-[#C5A059]/30 rounded-sm focus:border-[#9E7D3B] bg-white text-[#241A15]"
                  />
                </div>

                <div>
                  <label className="block text-[#5A4A42] font-semibold mb-1">
                    Jewellery Piece Purchased
                  </label>
                  <input
                    type="text"
                    placeholder="e.g., Maharaja Byzantine & Ribbed Station Chain"
                    value={form.productPurchased}
                    onChange={(e) => setForm({ ...form, productPurchased: e.target.value })}
                    className="w-full px-3 py-2 border border-[#C5A059]/30 rounded-sm focus:border-[#9E7D3B] bg-white text-[#241A15]"
                  />
                </div>

                <div>
                  <label className="block text-[#5A4A42] font-semibold mb-1">
                    Rating (1 to 5 Stars)
                  </label>
                  <div className="flex items-center gap-2 py-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        type="button"
                        key={star}
                        onClick={() => setForm({ ...form, rating: star })}
                        className="p-1 focus:outline-hidden"
                      >
                        <Star
                          className={`w-5 h-5 ${
                            star <= form.rating ? 'fill-[#C5A059] text-[#C5A059]' : 'text-slate-300'
                          }`}
                        />
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-[#5A4A42] font-semibold mb-1">
                    Your Review *
                  </label>
                  <textarea
                    required
                    rows={3}
                    placeholder="Describe the polish, weight, comfort, and dispatch experience..."
                    value={form.comment}
                    onChange={(e) => setForm({ ...form, comment: e.target.value })}
                    className="w-full px-3 py-2 border border-[#C5A059]/30 rounded-sm focus:border-[#9E7D3B] bg-white text-[#241A15]"
                  />
                </div>

                <div className="pt-2 flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setIsReviewModalOpen(false)}
                    className="px-4 py-2 text-[#5A4A42] hover:text-[#241A15]"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-[#241A15] hover:bg-[#9E7D3B] text-white font-semibold rounded-sm transition-colors"
                  >
                    Submit for Approval
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </section>
  );
};
