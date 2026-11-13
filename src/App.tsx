import React from 'react';
import { ShopProvider } from './context/ShopContext';
import { Navbar } from './components/Navbar';
import { IntroductoryBanner } from './components/IntroductoryBanner';
import { HeroSlider } from './components/HeroSlider';
import { DedicatedVideoSection } from './components/DedicatedVideoSection';
import { PromotionalBanner } from './components/PromotionalBanner';
import { CollageSlider } from './components/CollageSlider';
import { ShopByCategory } from './components/ShopByCategory';
import { NewArrivals } from './components/NewArrivals';
import { BestSellers } from './components/BestSellers';
import { ProductCatalog } from './components/ProductCatalog';
import { BrandBanner } from './components/BrandBanner';
import { CustomerReviews } from './components/CustomerReviews';
import { FAQSection } from './components/FAQSection';
import { OrderPoliciesSection } from './components/OrderPoliciesSection';
import { Footer } from './components/Footer';

// Modals & Overlays
import { ProductDetailModal } from './components/ProductDetailModal';
import { CartDrawer } from './components/CartDrawer';
import { CheckoutModal } from './components/CheckoutModal';
import { WishlistDrawer } from './components/WishlistDrawer';
import { SearchModal } from './components/SearchModal';
import { AdminPanel } from './components/AdminPanel';
import { TermsModal } from './components/TermsModal';
import { AllCategoriesModal } from './components/AllCategoriesModal';

export default function App() {
  return (
    <ShopProvider>
      <div className="min-h-screen flex flex-col bg-[#FBF8F2] text-[#241A15]">
        {/* Top Announcement Bar & Navigation Bar (Correction 01 & 02) */}
        <Navbar />

        <main className="flex-1">
          {/* 1. Luxury Introductory Brand Banner (Correction 04) */}
          <IntroductoryBanner />

          {/* 2. Main Hero Slider with opening video & photo transitions (Correction 05) */}
          <HeroSlider />

          {/* 3. Dedicated Video Section (Correction 06: placed below Hero Slider @ 65% width) */}
          <DedicatedVideoSection />

          {/* 4. Promotional Banner */}
          <PromotionalBanner />

          {/* 5. Premium 4-Photo 2x2 Square Collage Slider (SYSTEM 6) */}
          <CollageSlider />

          {/* 6. Shop By Verified Category (Correction 12) */}
          <ShopByCategory />

          {/* 7. New Arrivals: strictly 2 cards per row (Correction 11 & 14) */}
          <NewArrivals />

          {/* 8. Best Sellers: strictly 2 cards per row (Correction 11 & 14) */}
          <BestSellers />

          {/* 9. Complete Verified Catalogue: strictly 2 cards per row (Correction 11) */}
          <ProductCatalog />

          {/* 10. Large Brand Statement Banner (Correction 17) */}
          <BrandBanner />

          {/* 11. Customer Reviews & Submissions */}
          <CustomerReviews />

          {/* 12. Frequently Asked Questions */}
          <FAQSection />

          {/* 13. Order Policies & Advance Terms */}
          <OrderPoliciesSection />
        </main>

        {/* Premium Espresso & Gold Footer (Correction 18) */}
        <Footer />

        {/* Overlay Modals & Drawers */}
        <ProductDetailModal />
        <CartDrawer />
        <CheckoutModal />
        <WishlistDrawer />
        <SearchModal />
        <AdminPanel />
        <TermsModal />
        <AllCategoriesModal />
      </div>
    </ShopProvider>
  );
}
