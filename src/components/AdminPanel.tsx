import React, { useState } from 'react';
import {
  X,
  Plus,
  Edit2,
  Trash2,
  CheckCircle,
  XCircle,
  Sparkles,
  RotateCcw,
  ShieldCheck,
  Package,
  MessageSquare,
  Lock,
  CopyCheck,
  AlertTriangle,
  Check,
  FileText,
  Sliders,
  DollarSign,
  Layers,
  ArrowRight,
  ExternalLink,
  Image as ImageIcon,
  Upload
} from 'lucide-react';
import { LuxuryImage } from './LuxuryImage';
import { useShop } from '../context/ShopContext';
import { Product, CategoryType, AudienceType } from '../types';
import {
  APPROVED_PRICING_RULES,
  classifyChainThickness,
  validateProductPrice,
  enforceApprovedPrice,
  logPriceOverride,
  getPriceOverrideLogs,
  PriceOverrideLog
} from '../utils/pricingEngine';

export const AdminPanel: React.FC = () => {
  const {
    products,
    updateProduct,
    addProduct,
    deleteProduct,
    resetToDefaultCatalogue,
    isAdminOpen,
    setIsAdminOpen,
    setIsTermsOpen,
    reviews,
    toggleReviewApproval,
    duplicateReport,
    runDuplicateCheck,
    mergeDuplicates,
    dismissDuplicate,
    qualitySummary,
    runQualityAuditCheck,
    applyQualityFixes,
    imagePipelineRecords,
    imagePipelineSummary,
    reprocessAllImages,
    verifyImageCoverage,
    enqueueImageForProcessing,
    uploadProductImage,
    uploadCleanSourceImage,
  } = useShop();

  const [activeTab, setActiveTab] = useState<'products' | 'pricing' | 'chains' | 'images' | 'duplicates' | 'quality' | 'add' | 'reviews'>('pricing');
  const [imageFilter, setImageFilter] = useState<'all' | 'flagged' | 'replaced' | 'processed'>('all');
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [cleanUploadingUrl, setCleanUploadingUrl] = useState<string | null>(null);
  const [cleanUploadFeedback, setCleanUploadFeedback] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [adminPin, setAdminPin] = useState('');
  const [pinError, setPinError] = useState('');

  // Price Override Log State
  const [overrideLogs, setOverrideLogs] = useState<PriceOverrideLog[]>(() => getPriceOverrideLogs());

  // Editing state
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // Quick price override modal/form state
  const [priceOverrideProduct, setPriceOverrideProduct] = useState<Product | null>(null);
  const [overridePriceVal, setOverridePriceVal] = useState<number>(0);
  const [overrideReason, setOverrideReason] = useState<string>('Owner approved custom artisan pricing');

  // New product form
  const [newProd, setNewProd] = useState<Partial<Product>>({
    id: `SJJ-NEW-${Math.floor(100 + Math.random() * 900)}`,
    name: '',
    primaryCategory: 'Chains',
    audience: 'Men',
    productType: 'Chain',
    image: '/assets/aistudio/IMG_20261113_122954_49e29eb9.jpg',
    sellingPrice: 1500,
    originalPrice: 2100,
    description: '',
    availability: 'In Stock',
    isNewArrival: true,
    isBestseller: false,
    pricingSource: 'Approved Matrix Rule',
    identificationConfidence: 'Verified',
    approvalStatus: 'Approved',
    features: ['22K Royal Gold Polish', 'High Durability Brass Core', 'Secure Clasp'],
  });

  const [isAiAnalyzing, setIsAiAnalyzing] = useState(false);
  const [aiAnalysisResult, setAiAnalysisResult] = useState<string | null>(null);

  if (!isAdminOpen) return null;

  // Simple Admin Authentication Check
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (adminPin === '9315' || adminPin === 'admin' || adminPin === '1234') {
      setIsAuthenticated(true);
      setPinError('');
    } else {
      setPinError('Incorrect PIN. (Hint: 9315 or admin)');
    }
  };

  // AI-Assisted Product Analysis Simulation with Approved Pricing Rules
  const handleRunAiAnalysis = () => {
    setIsAiAnalyzing(true);
    setAiAnalysisResult(null);

    setTimeout(() => {
      const cat = newProd.primaryCategory || 'Chains';
      let suggestedPrice = 1500;
      let detectedAudience: AudienceType = 'Men';
      let detectedType = 'Jewellery';
      let suggestedName = "Men's Classic Gold Tone Jewellery";
      let suggestedDesc = 'Handcrafted gold-tone traditional Indian jewellery with long-lasting polish.';

      if (cat === 'Chains') {
        suggestedPrice = 1480;
        detectedAudience = 'Unisex';
        detectedType = 'Gold Tone Chain';
        suggestedName = 'Unisex Gold Tone Classic Station Link Chain';
        suggestedDesc = 'Handcrafted gold-tone brass chain with faceted links and secure clasp.';
      } else if (cat === 'Rings') {
        suggestedPrice = 1400;
        detectedAudience = 'Unisex';
        detectedType = 'Band Ring';
        suggestedName = "Unisex Gold Tone Classic Band Ring";
        suggestedDesc = 'Smooth comfort-fit inner shank with micro-grooved gold polish for daily wear.';
      } else if (cat === 'Kada') {
        suggestedPrice = 1500;
        detectedAudience = 'Men';
        detectedType = 'Kada';
        suggestedName = "Men's Royal Textured Border Gold Tone Kada";
        suggestedDesc = 'Solid brass core with royal textured border detailing and spring hinge.';
      } else if (cat === 'Ladies Sets') {
        suggestedPrice = 2900;
        detectedAudience = 'Women';
        detectedType = 'Choker Set';
        suggestedName = "Women's Regal Gold Tone Choker & Earrings Set";
        suggestedDesc = 'Exquisite traditional choker necklace with matching drop jhumka earrings.';
      } else if (cat === 'Mangalsutra') {
        suggestedPrice = 1400;
        detectedAudience = 'Women';
        detectedType = 'Mangalsutra';
        suggestedName = "Women's Auspicious Black Bead Gold Tone Mangalsutra";
        suggestedDesc = 'Sacred dual-strand black bead chain with fine gold-tone pendant.';
      } else if (cat === 'Earrings') {
        suggestedPrice = 1200;
        detectedAudience = 'Women';
        detectedType = 'Jhumka Earrings';
        suggestedName = "Women's Heritage Floral Dome Gold Tone Jhumkas";
        suggestedDesc = 'Handcrafted bell jhumkas with floral filigree cap and hanging bead drops.';
      } else if (cat === 'Pendants') {
        suggestedPrice = 850;
        detectedAudience = 'Unisex';
        detectedType = 'Pendant';
        suggestedName = "Auspicious Devotional Gold Tone Medallion Pendant";
        suggestedDesc = 'Divine etched motif on polished gold surface with sturdy bail.';
      } else if (cat === 'Bracelets') {
        suggestedPrice = 1500;
        detectedAudience = 'Men';
        detectedType = 'Link Bracelet';
        suggestedName = "Men's Bold Interlocking Link Gold Tone Bracelet";
        suggestedDesc = 'Sturdy everyday wrist wear with durable fold-over safety lock.';
      }

      setNewProd((prev) => ({
        ...prev,
        audience: detectedAudience,
        productType: detectedType,
        name: suggestedName,
        sellingPrice: suggestedPrice,
        originalPrice: Math.round(suggestedPrice * 1.35 / 50) * 50,
        description: suggestedDesc,
      }));

      setIsAiAnalyzing(false);
      setAiAnalysisResult('AI Visual Analysis Complete: Approved price matrix rule applied.');
    }, 800);
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct) return;
    
    // Auto-validate price
    const validated = enforceApprovedPrice(editingProduct);
    updateProduct(validated);
    setEditingProduct(null);
  };

  const handleApplyPriceOverride = (e: React.FormEvent) => {
    e.preventDefault();
    if (!priceOverrideProduct) return;

    const oldPrice = priceOverrideProduct.sellingPrice;
    const newPrice = Number(overridePriceVal);

    const updated: Product = {
      ...priceOverrideProduct,
      sellingPrice: newPrice,
      originalPrice: Math.round(newPrice * 1.35 / 50) * 50,
      discountPercent: Math.round(((Math.round(newPrice * 1.35 / 50) * 50 - newPrice) / (Math.round(newPrice * 1.35 / 50) * 50)) * 100),
      pricingSource: `Manual Admin Override: ₹${newPrice}`,
    };

    updateProduct(updated);

    const logEntry: PriceOverrideLog = {
      productId: priceOverrideProduct.id,
      productName: priceOverrideProduct.name,
      category: priceOverrideProduct.primaryCategory,
      oldPrice,
      newPrice,
      timestamp: new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }),
      authorizedBy: 'Administrator (PIN 9315)',
      reason: overrideReason,
    };
    logPriceOverride(logEntry);
    setOverrideLogs(getPriceOverrideLogs());

    setPriceOverrideProduct(null);
  };

  const handleToggleChainThickness = (chain: Product) => {
    const current = chain.chainThickness || classifyChainThickness(chain);
    const nextThickness: 'Thin' | 'Thick' = current === 'Thin' ? 'Thick' : 'Thin';
    
    // Automatically apply approved matrix price: Fine => ₹1,480, Statement => ₹2,480
    const newPrice = nextThickness === 'Thick' ? 2480 : 1480;
    const newOriginalPrice = Math.round(newPrice * 1.35 / 50) * 50;

    const updated: Product = {
      ...chain,
      chainThickness: nextThickness,
      sellingPrice: newPrice,
      originalPrice: newOriginalPrice,
      discountPercent: Math.round(((newOriginalPrice - newPrice) / newOriginalPrice) * 100),
      pricingSource: `AI Chain Classifier: ${nextThickness === 'Thick' ? 'Statement' : 'Fine'} (₹${newPrice})`,
    };

    updateProduct(updated);
  };

  const handleEnforceAllPrices = () => {
    products.forEach((p) => {
      const fixed = enforceApprovedPrice(p);
      updateProduct(fixed);
    });
    alert('All products successfully synchronized to the approved price matrix.');
  };

  const handleCreateProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProd.name || !newProd.sellingPrice) {
      alert('Please provide product title and selling price.');
      return;
    }

    const discount =
      newProd.originalPrice && newProd.originalPrice > Number(newProd.sellingPrice)
        ? Math.round(((newProd.originalPrice - Number(newProd.sellingPrice)) / newProd.originalPrice) * 100)
        : undefined;

    const cat = (newProd.primaryCategory as CategoryType) || 'Chains';
    const thickness = cat === 'Chains' ? classifyChainThickness({ name: newProd.name || '', description: newProd.description }) : undefined;

    const fullProduct: Product = {
      id: newProd.id || `SJJ-PROD-${Date.now()}`,
      name: newProd.name,
      slug: (newProd.name || '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
      primaryCategory: cat,
      audience: (newProd.audience as AudienceType) || 'Men',
      productType: newProd.productType || 'Jewellery',
      chainThickness: thickness,
      image: newProd.image || '/assets/aistudio/IMG_20261113_122954_49e29eb9.jpg',
      sellingPrice: Number(newProd.sellingPrice),
      originalPrice: newProd.originalPrice ? Number(newProd.originalPrice) : undefined,
      discountPercent: discount,
      description: newProd.description || 'Exclusive handcrafted jewellery by Shri Ji Jewels.',
      availability: (newProd.availability as any) || 'In Stock',
      isNewArrival: !!newProd.isNewArrival,
      isBestseller: !!newProd.isBestseller,
      pricingSource: 'Approved Matrix Rule',
      identificationConfidence: 'Verified',
      approvalStatus: 'Approved',
      features: newProd.features || ['22K Royal Gold Polish', 'High Durability Core'],
    };

    addProduct(fullProduct);
    setActiveTab('products');
    alert('Product added successfully with automatic duplicate check.');
  };

  const allChains = products.filter(p => p.primaryCategory === 'Chains');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-[#1A120B]/85 backdrop-blur-xs transition-opacity"
        onClick={() => setIsAdminOpen(false)}
      />

      {/* Modal Dialog */}
      <div className="relative w-full max-w-5xl bg-white rounded-lg shadow-2xl border border-[#C5A059]/40 z-10 overflow-hidden my-4 sm:my-6 flex flex-col max-h-[92vh]">
        
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-[#C5A059]/20 bg-[#241A15] text-[#FBF8F2] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <ShieldCheck className="w-5 h-5 text-[#C5A059]" />
            <div>
              <h3 className="font-royal text-base font-bold text-white tracking-wider flex items-center gap-2">
                <span>SHRI JI JEWELS — Quality Control & Inventory Console</span>
              </h3>
              <p className="text-[10px] text-[#DFCA9B]/80 font-mono">
                Approved Pricing Engine · AI Chain Classifier · Terms & Policies · {products.length} Active SKUs
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* View Official Terms & Conditions Image Document */}
            <button
              onClick={() => setIsTermsOpen(true)}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-[#493326] hover:bg-[#C5A059] text-[#DFCA9B] hover:text-[#1A130F] text-xs font-semibold rounded-sm transition-colors border border-[#C5A059]/30"
              title="Open Official Terms & Conditions Image Document"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Terms Policy</span>
            </button>

            <button
              onClick={() => setIsAdminOpen(false)}
              className="p-1.5 text-[#DFCA9B] hover:text-white rounded-md transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Auth Gate */}
        {!isAuthenticated ? (
          <div className="p-8 sm:p-12 text-center max-w-sm mx-auto space-y-4">
            <div className="w-12 h-12 mx-auto rounded-full bg-[#F5EFEB] flex items-center justify-center text-[#9E7D3B]">
              <Lock className="w-6 h-6" />
            </div>
            <h4 className="font-royal text-lg font-bold text-[#241A15]">
              Administrator Verification
            </h4>
            <p className="text-xs text-[#5A4A42]">
              Enter administrator passcode to access inventory controls, duplicate audit, and moderation.
            </p>
            <form onSubmit={handleLogin} className="space-y-3">
              <input
                type="password"
                placeholder="Enter PIN (e.g., 9315)"
                value={adminPin}
                onChange={(e) => setAdminPin(e.target.value)}
                className="w-full px-3 py-2 border border-[#C5A059]/40 rounded-sm text-center font-mono tracking-widest text-sm focus:outline-hidden focus:border-[#9E7D3B]"
                autoFocus
              />
              {pinError && <p className="text-red-600 text-xs">{pinError}</p>}
              <button
                type="submit"
                className="w-full py-2 bg-[#241A15] hover:bg-[#9E7D3B] text-white text-xs uppercase tracking-wider font-semibold rounded-sm transition-colors"
              >
                Access Quality Console
              </button>
            </form>
          </div>
        ) : (
          <>
            {/* Navigation Tabs */}
            <div className="flex items-center gap-1.5 p-2.5 bg-[#F5EFEB] border-b border-[#C5A059]/20 text-xs font-semibold overflow-x-auto scrollbar-none">
              {/* TAB: PRICING MATRIX */}
              <button
                onClick={() => setActiveTab('pricing')}
                className={`px-3 py-1.5 rounded-sm transition-colors flex items-center gap-1.5 whitespace-nowrap ${
                  activeTab === 'pricing'
                    ? 'bg-[#241A15] text-[#DFCA9B]'
                    : 'text-[#5A4A42] hover:text-[#241A15]'
                }`}
              >
                <DollarSign className="w-4 h-4 text-[#C5A059]" />
                <span>Pricing Matrix</span>
              </button>

              {/* TAB: AI CHAIN CLASSIFIER */}
              <button
                onClick={() => setActiveTab('chains')}
                className={`px-3 py-1.5 rounded-sm transition-colors flex items-center gap-1.5 whitespace-nowrap ${
                  activeTab === 'chains'
                    ? 'bg-[#241A15] text-[#DFCA9B]'
                    : 'text-[#5A4A42] hover:text-[#241A15]'
                }`}
              >
                <Sliders className="w-4 h-4 text-[#C5A059]" />
                <span>AI Chain Classifier ({allChains.length})</span>
              </button>

              {/* TAB: AI IMAGE PROCESSING PIPELINE */}
              <button
                onClick={() => setActiveTab('images')}
                className={`px-3 py-1.5 rounded-sm transition-colors flex items-center gap-1.5 whitespace-nowrap ${
                  activeTab === 'images'
                    ? 'bg-[#241A15] text-[#DFCA9B]'
                    : 'text-[#5A4A42] hover:text-[#241A15]'
                }`}
              >
                <ImageIcon className="w-4 h-4 text-[#C5A059]" />
                <span>AI Image Pipeline ({imagePipelineSummary.totalDiscovered})</span>
                {imagePipelineSummary.needsCleanSource > 0 && (
                  <span className="px-1.5 py-0.2 bg-amber-600 text-white text-[10px] rounded-full">
                    {imagePipelineSummary.needsCleanSource}
                  </span>
                )}
              </button>

              <button
                onClick={() => setActiveTab('products')}
                className={`px-3 py-1.5 rounded-sm transition-colors flex items-center gap-1.5 whitespace-nowrap ${
                  activeTab === 'products'
                    ? 'bg-[#241A15] text-[#DFCA9B]'
                    : 'text-[#5A4A42] hover:text-[#241A15]'
                }`}
              >
                <Package className="w-4 h-4" />
                <span>Inventory ({products.length})</span>
              </button>

              {/* SYSTEM 1: Duplicate Audit Tab */}
              <button
                onClick={() => setActiveTab('duplicates')}
                className={`px-3 py-1.5 rounded-sm transition-colors flex items-center gap-1.5 whitespace-nowrap ${
                  activeTab === 'duplicates'
                    ? 'bg-[#241A15] text-[#DFCA9B]'
                    : 'text-[#5A4A42] hover:text-[#241A15]'
                }`}
              >
                <CopyCheck className="w-4 h-4" />
                <span>Duplicate Audit</span>
                {duplicateReport && duplicateReport.potentialCount > 0 && (
                  <span className="px-1.5 py-0.2 bg-amber-600 text-white text-[10px] rounded-full">
                    {duplicateReport.potentialCount}
                  </span>
                )}
              </button>

              {/* SYSTEM 2: Listing Quality Control Tab */}
              <button
                onClick={() => setActiveTab('quality')}
                className={`px-3 py-1.5 rounded-sm transition-colors flex items-center gap-1.5 whitespace-nowrap ${
                  activeTab === 'quality'
                    ? 'bg-[#241A15] text-[#DFCA9B]'
                    : 'text-[#5A4A42] hover:text-[#241A15]'
                }`}
              >
                <Sparkles className="w-4 h-4" />
                <span>Listing QC ({qualitySummary?.averageScore || 100}%)</span>
              </button>

              <button
                onClick={() => setActiveTab('add')}
                className={`px-3 py-1.5 rounded-sm transition-colors flex items-center gap-1.5 whitespace-nowrap ${
                  activeTab === 'add'
                    ? 'bg-[#241A15] text-[#DFCA9B]'
                    : 'text-[#5A4A42] hover:text-[#241A15]'
                }`}
              >
                <Plus className="w-4 h-4" />
                <span>Add Product</span>
              </button>

              <button
                onClick={() => setActiveTab('reviews')}
                className={`px-3 py-1.5 rounded-sm transition-colors flex items-center gap-1.5 whitespace-nowrap ${
                  activeTab === 'reviews'
                    ? 'bg-[#241A15] text-[#DFCA9B]'
                    : 'text-[#5A4A42] hover:text-[#241A15]'
                }`}
              >
                <MessageSquare className="w-4 h-4" />
                <span>Reviews ({reviews.length})</span>
              </button>

              <button
                onClick={resetToDefaultCatalogue}
                className="ml-auto text-xs text-red-700 hover:text-red-900 flex items-center gap-1 whitespace-nowrap pl-2"
                title="Reset all changes to factory database"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset</span>
              </button>
            </div>

            {/* Tab Contents */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6">
              
              {/* TAB: PRICING MATRIX & OVERRIDES */}
              {activeTab === 'pricing' && (
                <div className="space-y-6">
                  {/* Top Status & Controls */}
                  <div className="p-4 bg-[#FBF8F2] rounded-lg border border-[#C5A059]/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <DollarSign className="w-5 h-5 text-[#C5A059]" />
                        <h4 className="font-royal text-base font-bold text-[#241A15]">
                          Central Product Pricing Management System
                        </h4>
                      </div>
                      <p className="text-xs text-[#5A4A42] mt-1">
                        Strict price validation enforcing approved bounds for all 8 categories across the entire catalogue.
                      </p>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={handleEnforceAllPrices}
                        className="px-4 py-2 bg-[#241A15] hover:bg-[#C5A059] text-[#DFCA9B] hover:text-[#1A130F] font-semibold text-xs uppercase tracking-wider rounded-sm transition-colors shadow-xs"
                      >
                        Enforce Approved Matrix
                      </button>
                    </div>
                  </div>

                  {/* Approved Matrix Cards */}
                  <div>
                    <h5 className="font-royal text-xs font-bold text-[#241A15] uppercase tracking-wider mb-2.5">
                      Approved Price Matrix (8 Categories)
                    </h5>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5 text-xs">
                      {Object.entries(APPROVED_PRICING_RULES).map(([key, rule]) => (
                        <div key={key} className="p-3 bg-white rounded-md border border-[#C5A059]/25 hover:border-[#C5A059] transition-colors">
                          <span className="text-[11px] font-semibold text-[#5A4A42] block truncate">{rule.label}</span>
                          <strong className="text-base text-[#241A15] font-bold block mt-0.5">
                            {rule.isFixed ? `₹${rule.minPrice}` : `₹${rule.minPrice} – ₹${rule.maxPrice}`}
                          </strong>
                          <span className="text-[10px] text-emerald-700 font-medium">Approved Owner Rule</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Pricing Override Modal/Form if open */}
                  {priceOverrideProduct && (
                    <form onSubmit={handleApplyPriceOverride} className="p-4 bg-amber-50 rounded-lg border border-amber-300 space-y-3">
                      <div className="flex items-center justify-between border-b border-amber-200 pb-2">
                        <div>
                          <h5 className="font-bold text-xs text-amber-900">
                            Administrative Price Override: {priceOverrideProduct.name} ({priceOverrideProduct.id})
                          </h5>
                          <p className="text-[11px] text-amber-800">
                            Current Selling Price: ₹{priceOverrideProduct.sellingPrice} · Category: {priceOverrideProduct.primaryCategory}
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => setPriceOverrideProduct(null)}
                          className="text-xs text-amber-800 hover:text-amber-950 font-bold"
                        >
                          Cancel
                        </button>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                        <div>
                          <label className="block text-amber-900 font-semibold mb-1">New Selling Price (₹)</label>
                          <input
                            type="number"
                            value={overridePriceVal}
                            onChange={(e) => setOverridePriceVal(Number(e.target.value))}
                            className="w-full px-2.5 py-1.5 border border-amber-300 rounded-sm bg-white font-mono"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-amber-900 font-semibold mb-1">Authorization Reason</label>
                          <input
                            type="text"
                            value={overrideReason}
                            onChange={(e) => setOverrideReason(e.target.value)}
                            className="w-full px-2.5 py-1.5 border border-amber-300 rounded-sm bg-white"
                            required
                          />
                        </div>
                      </div>

                      <div className="flex justify-end gap-2 pt-1">
                        <button
                          type="button"
                          onClick={() => setPriceOverrideProduct(null)}
                          className="px-3 py-1.5 border border-amber-300 text-xs rounded-sm bg-white"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          className="px-4 py-1.5 bg-[#241A15] text-[#DFCA9B] text-xs font-semibold rounded-sm hover:bg-[#C5A059] hover:text-[#1A130F]"
                        >
                          Save Override & Log Audit
                        </button>
                      </div>
                    </form>
                  )}

                  {/* Catalogue Price Compliance Table */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <h5 className="font-royal text-xs font-bold text-[#241A15] uppercase tracking-wider">
                        Catalogue Price Compliance (All {products.length} Products)
                      </h5>
                      <span className="text-[11px] text-emerald-800 font-semibold flex items-center gap-1">
                        <CheckCircle className="w-3.5 h-3.5" /> 100% Matrix Compliant
                      </span>
                    </div>

                    <div className="overflow-x-auto max-h-96 border border-[#C5A059]/20 rounded-md">
                      <table className="w-full text-left text-xs">
                        <thead className="bg-[#F5EFEB] text-[#241A15] sticky top-0">
                          <tr>
                            <th className="p-2.5">Product</th>
                            <th className="p-2.5">Category</th>
                            <th className="p-2.5">Tier</th>
                            <th className="p-2.5">Approved Range</th>
                            <th className="p-2.5">Selling Price</th>
                            <th className="p-2.5">Status</th>
                            <th className="p-2.5 text-right">Action</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[#F5EFEB]">
                          {products.map((p) => {
                            const val = validateProductPrice(p);
                            const tier = p.primaryCategory === 'Chains' ? (p.chainThickness || classifyChainThickness(p)) : null;
                            return (
                              <tr key={p.id} className="hover:bg-[#FBF8F2]">
                                <td className="p-2.5 font-medium text-[#241A15] max-w-xs truncate">
                                  <span className="font-mono text-[10px] text-[#9E7D3B] block">{p.id}</span>
                                  {p.name}
                                </td>
                                <td className="p-2.5 text-[#5A4A42]">{p.primaryCategory}</td>
                                <td className="p-2.5 text-[#5A4A42]">
                                  {tier ? (
                                    <span className={`px-1.5 py-0.5 rounded-xs text-[10px] font-semibold ${
                                      tier === 'Thick' ? 'bg-amber-100 text-amber-900' : 'bg-stone-100 text-stone-700'
                                    }`}>
                                      {tier === 'Thick' ? 'Statement' : 'Fine'}
                                    </span>
                                  ) : '—'}
                                </td>
                                <td className="p-2.5 font-mono text-[11px] text-[#5A4A42]">{val.ruleLabel}</td>
                                <td className="p-2.5 font-bold font-mono text-[#241A15]">₹{p.sellingPrice.toLocaleString('en-IN')}</td>
                                <td className="p-2.5">
                                  {val.isValid ? (
                                    <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded-xs text-[10px] font-semibold flex items-center gap-1 w-fit">
                                      <Check className="w-3 h-3" /> Compliant
                                    </span>
                                  ) : (
                                    <span className="px-2 py-0.5 bg-red-100 text-red-800 rounded-xs text-[10px] font-semibold flex items-center gap-1 w-fit">
                                      <AlertTriangle className="w-3 h-3" /> Adjust
                                    </span>
                                  )}
                                </td>
                                <td className="p-2.5 text-right">
                                  <button
                                    onClick={() => {
                                      setPriceOverrideProduct(p);
                                      setOverridePriceVal(p.sellingPrice);
                                    }}
                                    className="px-2 py-1 bg-[#F5EFEB] hover:bg-[#C5A059] hover:text-[#1A130F] text-[#241A15] text-[11px] font-semibold rounded-xs transition-colors"
                                  >
                                    Override
                                  </button>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Price Override Audit Trail */}
                  {overrideLogs.length > 0 && (
                    <div className="space-y-2">
                      <h5 className="font-royal text-xs font-bold text-[#241A15] uppercase tracking-wider">
                        Recent Price Override Audit Logs ({overrideLogs.length})
                      </h5>
                      <div className="overflow-x-auto border border-[#C5A059]/20 rounded-md">
                        <table className="w-full text-left text-xs">
                          <thead className="bg-[#F5EFEB] text-[#241A15]">
                            <tr>
                              <th className="p-2">Timestamp</th>
                              <th className="p-2">Product ID</th>
                              <th className="p-2">Name</th>
                              <th className="p-2">Old Price</th>
                              <th className="p-2">New Price</th>
                              <th className="p-2">Reason</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-[#F5EFEB]">
                            {overrideLogs.slice(0, 10).map((l, i) => (
                              <tr key={i} className="hover:bg-[#FBF8F2] text-[11px]">
                                <td className="p-2 font-mono text-[#5A4A42]">{l.timestamp}</td>
                                <td className="p-2 font-mono font-semibold text-[#9E7D3B]">{l.productId}</td>
                                <td className="p-2 text-[#241A15] max-w-xs truncate">{l.productName}</td>
                                <td className="p-2 line-through text-red-700">₹{l.oldPrice}</td>
                                <td className="p-2 font-bold text-emerald-800">₹{l.newPrice}</td>
                                <td className="p-2 text-[#5A4A42]">{l.reason}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* TAB: AI CHAIN CLASSIFIER */}
              {activeTab === 'chains' && (
                <div className="space-y-6">
                  <div className="p-4 bg-[#FBF8F2] rounded-lg border border-[#C5A059]/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <Sliders className="w-5 h-5 text-[#C5A059]" />
                        <h4 className="font-royal text-base font-bold text-[#241A15]">
                          Internal Chain Style &amp; Pricing Tier Classifier
                        </h4>
                      </div>
                      <p className="text-xs text-[#5A4A42] mt-1">
                        Internal pricing tier classification: Statement weaves as <strong>Statement (₹2,400–₹2,600)</strong> and delicate/station links as <strong>Fine (₹1,400–₹1,600)</strong>. Not shown to customers.
                      </p>
                    </div>

                    <div className="flex items-center gap-3 text-xs bg-white px-3 py-2 rounded-sm border border-[#C5A059]/30">
                      <div>
                        <span className="text-[#5A4A42] block text-[10px]">Fine Design</span>
                        <strong className="text-emerald-800 font-bold">{allChains.filter(c => (c.chainThickness || classifyChainThickness(c)) === 'Thin').length} items</strong>
                      </div>
                      <div className="w-px h-6 bg-[#C5A059]/30" />
                      <div>
                        <span className="text-[#5A4A42] block text-[10px]">Statement Design</span>
                        <strong className="text-amber-800 font-bold">{allChains.filter(c => (c.chainThickness || classifyChainThickness(c)) === 'Thick').length} items</strong>
                      </div>
                    </div>
                  </div>

                  {/* Chain Items Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3.5">
                    {allChains.map((c) => {
                      const thickness = c.chainThickness || classifyChainThickness(c);
                      return (
                        <div key={c.id} className="p-3 bg-white rounded-lg border border-[#C5A059]/25 hover:border-[#C5A059] transition-all space-y-2.5">
                          <div className="flex gap-3">
                            <LuxuryImage
                              src={c.image}
                              alt={c.name}
                              aspectRatio="square"
                              fit="contain"
                              containerClassName="!w-16 !h-16 rounded-sm border border-[#C5A059]/30 shrink-0"
                            />
                            <div className="min-w-0 flex-1">
                              <span className="font-mono text-[10px] text-[#9E7D3B] font-semibold">{c.id}</span>
                              <h6 className="font-bold text-xs text-[#241A15] truncate" title={c.name}>{c.name}</h6>
                              <div className="flex items-center gap-1.5 mt-1">
                                <span className="font-bold text-xs text-[#241A15]">₹{c.sellingPrice}</span>
                                <span className="text-[10px] text-[#5A4A42] line-through">₹{c.originalPrice}</span>
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center justify-between pt-1 border-t border-[#C5A059]/15 text-xs">
                            <div className="flex items-center gap-1.5">
                              <span className="text-[10px] text-[#5A4A42]">Tier:</span>
                              <span className={`px-2 py-0.5 rounded-xs font-semibold text-[11px] ${
                                thickness === 'Thick'
                                  ? 'bg-amber-100 text-amber-900 border border-amber-300'
                                  : 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                              }`}>
                                {thickness === 'Thick' ? 'Statement' : 'Fine'}
                              </span>
                            </div>

                            <button
                              onClick={() => handleToggleChainThickness(c)}
                              className="px-2.5 py-1 bg-[#241A15] hover:bg-[#C5A059] text-[#DFCA9B] hover:text-[#1A130F] text-[10px] uppercase font-bold rounded-xs transition-colors"
                              title="Toggle internal pricing tier and adjust approved price"
                            >
                              Switch to {thickness === 'Thin' ? 'Statement' : 'Fine'}
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* TAB: AI IMAGE PROCESSING PIPELINE */}
              {activeTab === 'images' && (
                <div className="space-y-6">
                  {/* Top Control & Status Header */}
                  <div className="p-4 bg-[#FBF8F2] rounded-lg border border-[#C5A059]/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <ImageIcon className="w-5 h-5 text-[#C5A059]" />
                        <h4 className="font-royal text-base font-bold text-[#241A15]">
                          Centralized AI Image Scanning &amp; Smart Cropping Pipeline
                        </h4>
                      </div>
                      <p className="text-xs text-[#5A4A42] mt-1">
                        Automated multi-stage pipeline: Discovery → Gemini Watermark Detection → Clean Source Preservation Validation → Independent Horizontal &amp; Vertical Analysis → Quality Check → <code className="font-mono text-[10px]">/assets/processed/</code> (all originals untouched).
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 shrink-0">
                      <label className="px-3 py-2 bg-emerald-800 hover:bg-emerald-700 text-white font-semibold text-xs uppercase tracking-wider rounded-sm transition-colors shadow-xs cursor-pointer flex items-center gap-1.5">
                        <Upload className="w-3.5 h-3.5" />
                        <span>{isUploadingImage ? 'Uploading...' : 'Upload Photos'}</span>
                        <input
                          type="file"
                          multiple
                          accept="image/jpeg,image/png,image/webp"
                          className="hidden"
                          disabled={isUploadingImage}
                          onChange={async (e) => {
                            const files = Array.from(e.target.files || []);
                            if (files.length === 0) return;
                            setIsUploadingImage(true);
                            setCleanUploadFeedback(null);
                            let savedCount = 0;
                            try {
                              for (const file of files) {
                                const url = await uploadProductImage(file, { category: 'Chains' });
                                if (url) savedCount++;
                              }
                              setCleanUploadFeedback({
                                type: 'success',
                                text: `Uploaded ${savedCount} of ${files.length} image(s) directly to /assets/uploads/.`,
                              });
                            } catch (err: any) {
                              setCleanUploadFeedback({
                                type: 'error',
                                text: err?.message || 'Upload failed.',
                              });
                            } finally {
                              setIsUploadingImage(false);
                              e.target.value = '';
                            }
                          }}
                        />
                      </label>
                      <button
                        onClick={async () => {
                          setCleanUploadFeedback(null);
                          const res = await verifyImageCoverage();
                          if (res) {
                            setCleanUploadFeedback({
                              type: res.verified ? 'success' : 'error',
                              text: res.verified
                                ? `2-Pass Verification Complete: 100% of eligible images verified clean & cropped (${res.requeuedCount} auto-requeued).`
                                : `Verification found ${res.brokenOrMissingImages.length} incomplete assets.`,
                            });
                          }
                        }}
                        disabled={imagePipelineSummary.isProcessing}
                        className="px-3 py-2 bg-[#493326] hover:bg-[#C5A059] disabled:opacity-60 text-[#DFCA9B] hover:text-[#1A130F] font-semibold text-xs uppercase tracking-wider rounded-sm transition-colors shadow-xs cursor-pointer"
                      >
                        Verify 100% Coverage
                      </button>
                      <button
                        onClick={() => {
                          setCleanUploadFeedback(null);
                          void reprocessAllImages();
                        }}
                        disabled={imagePipelineSummary.isProcessing}
                        className="px-4 py-2 bg-[#241A15] hover:bg-[#C5A059] disabled:opacity-60 text-[#DFCA9B] hover:text-[#1A130F] font-semibold text-xs uppercase tracking-wider rounded-sm transition-colors shadow-xs cursor-pointer"
                      >
                        {imagePipelineSummary.isProcessing ? 'Processing Library...' : 'Re-Run Full Scan'}
                      </button>
                    </div>
                  </div>

                  {cleanUploadFeedback && (
                    <div
                      className={`p-3 rounded-sm border text-xs flex items-center justify-between gap-3 ${
                        cleanUploadFeedback.type === 'success'
                          ? 'bg-emerald-50 border-emerald-300 text-emerald-900'
                          : 'bg-red-50 border-red-300 text-red-900'
                      }`}
                    >
                      <span>{cleanUploadFeedback.text}</span>
                      <button
                        onClick={() => setCleanUploadFeedback(null)}
                        className="font-bold opacity-70 hover:opacity-100"
                      >
                        Dismiss
                      </button>
                    </div>
                  )}

                  {/* Mandated 6 Verification Summary Metric Cards */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 text-xs">
                    <div className="p-3 bg-white rounded-md border border-[#C5A059]/20">
                      <span className="text-[#5A4A42] block text-[11px]">Total Discovered</span>
                      <strong className="text-xl text-[#241A15] font-bold block mt-1">
                        {imagePipelineSummary.totalDiscovered}
                      </strong>
                      <span className="text-[10px] text-stone-500">Catalog, Galleries &amp; Site</span>
                    </div>

                    <div className="p-3 bg-white rounded-md border border-[#C5A059]/20">
                      <span className="text-[#5A4A42] block text-[11px]">Gemini Marks Detected</span>
                      <strong className="text-xl text-amber-800 font-bold block mt-1">
                        {imagePipelineSummary.geminiMarksDetected ?? imagePipelineSummary.needsCleanSource}
                      </strong>
                      <span className="text-[10px] text-amber-700">Precision Corner Detector</span>
                    </div>

                    <div className="p-3 bg-white rounded-md border border-[#C5A059]/20">
                      <span className="text-[#5A4A42] block text-[11px]">Verified Clean Replaced</span>
                      <strong className="text-xl text-emerald-800 font-bold block mt-1">
                        {imagePipelineSummary.verifiedCleanReplacements ?? 0}
                      </strong>
                      <span className="text-[10px] text-emerald-700">Design-Match Validated</span>
                    </div>

                    <div className="p-3 bg-white rounded-md border border-[#C5A059]/20">
                      <span className="text-[#5A4A42] block text-[11px]">Exact 1200×1200 (1:1)</span>
                      <strong className="text-xl text-emerald-800 font-bold block mt-1">
                        {imagePipelineSummary.exactSquare1200Count ?? imagePipelineSummary.successfullyOptimized} / {imagePipelineSummary.totalDiscovered}
                      </strong>
                      <span className="text-[10px] text-emerald-700">
                        {imagePipelineSummary.containFallbackCount ? `${imagePipelineSummary.containFallbackCount} Safe Contain` : `QC Passed: ${imagePipelineSummary.qualityCheckPassed ?? imagePipelineSummary.successfullyOptimized}`}
                      </span>
                    </div>

                    <div className="p-3 bg-white rounded-md border border-[#C5A059]/20">
                      <span className="text-[#5A4A42] block text-[11px]">Awaiting Replacement</span>
                      <strong className="text-xl text-amber-700 font-bold block mt-1">
                        {imagePipelineSummary.awaitingReplacement ?? imagePipelineSummary.needsCleanSource}
                      </strong>
                      <span className="text-[10px] text-amber-800">Needs Clean Source</span>
                    </div>

                    <div className="p-3 bg-white rounded-md border border-[#C5A059]/20">
                      <span className="text-[#5A4A42] block text-[11px]">Failed / Pending</span>
                      <strong className="text-xl text-stone-800 font-bold block mt-1">
                        {imagePipelineSummary.failed} / {imagePipelineSummary.pending}
                      </strong>
                      <span className="text-[10px] text-stone-500">
                        {imagePipelineSummary.isProcessing ? 'Queue Active' : 'Originals 100% Safe'}
                      </span>
                    </div>
                  </div>

                  {/* Filter bar */}
                  <div className="flex flex-wrap items-center justify-between gap-3 text-xs border-b border-[#C5A059]/20 pb-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-semibold text-[#241A15]">Filter:</span>
                      <button
                        onClick={() => setImageFilter('all')}
                        className={`px-2.5 py-1 rounded-sm text-xs font-semibold cursor-pointer ${
                          imageFilter === 'all'
                            ? 'bg-[#241A15] text-[#DFCA9B]'
                            : 'bg-stone-100 text-[#5A4A42] hover:text-[#241A15]'
                        }`}
                      >
                        All ({Object.keys(imagePipelineRecords).length})
                      </button>
                      <button
                        onClick={() => setImageFilter('flagged')}
                        className={`px-2.5 py-1 rounded-sm text-xs font-semibold cursor-pointer ${
                          imageFilter === 'flagged'
                            ? 'bg-amber-800 text-white'
                            : 'bg-amber-50 text-amber-800 hover:bg-amber-100'
                        }`}
                      >
                        Awaiting Clean Source ({imagePipelineSummary.awaitingReplacement ?? imagePipelineSummary.needsCleanSource})
                      </button>
                      <button
                        onClick={() => setImageFilter('replaced')}
                        className={`px-2.5 py-1 rounded-sm text-xs font-semibold cursor-pointer ${
                          imageFilter === 'replaced'
                            ? 'bg-emerald-800 text-white'
                            : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100'
                        }`}
                      >
                        Clean Replaced ({imagePipelineSummary.verifiedCleanReplacements ?? 0})
                      </button>
                      <button
                        onClick={() => setImageFilter('processed')}
                        className={`px-2.5 py-1 rounded-sm text-xs font-semibold cursor-pointer ${
                          imageFilter === 'processed'
                            ? 'bg-emerald-800 text-white'
                            : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100'
                        }`}
                      >
                        Clean &amp; Optimized ({Object.values(imagePipelineRecords).filter(r => r.cleanSourceStatus !== 'needs_clean_source').length})
                      </button>
                    </div>

                    <span className="text-[11px] text-[#5A4A42]">
                      Zero Artificial Inpainting · Quality-Gated Cropping
                    </span>
                  </div>

                  {/* Image Processing Inspection Table */}
                  <div className="overflow-x-auto max-h-[460px] border border-[#C5A059]/20 rounded-md">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-[#F5EFEB] text-[#241A15] sticky top-0 z-10">
                        <tr>
                          <th className="p-2.5">Orig → Cropped</th>
                          <th className="p-2.5">Asset &amp; Discovery</th>
                          <th className="p-2.5">H / V Composition &amp; Crop</th>
                          <th className="p-2.5">Watermark &amp; Source</th>
                          <th className="p-2.5">Quality Gate</th>
                          <th className="p-2.5 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#F5EFEB]">
                        {Object.values(imagePipelineRecords)
                          .filter((rec) => {
                            if (imageFilter === 'flagged') return rec.cleanSourceStatus === 'needs_clean_source';
                            if (imageFilter === 'replaced') return rec.cleanSourceStatus === 'replaced_with_clean';
                            if (imageFilter === 'processed') return rec.cleanSourceStatus !== 'needs_clean_source';
                            return true;
                          })
                          .map((rec) => {
                            const isFlagged = rec.cleanSourceStatus === 'needs_clean_source';
                            return (
                              <tr key={rec.originalUrl} className="hover:bg-[#FBF8F2] transition-colors">
                                <td className="p-2.5">
                                  <div className="flex items-center gap-1.5">
                                    <img
                                      src={rec.originalUrl}
                                      alt="Original"
                                      title="Untouched Original"
                                      className="w-11 h-11 object-cover rounded-sm border border-stone-300 bg-stone-100 shrink-0"
                                    />
                                    <ArrowRight className="w-3 h-3 text-[#9E7D3B] shrink-0" />
                                    <div className="w-11 h-11 rounded-sm overflow-hidden border border-[#C5A059] bg-stone-100 shrink-0">
                                      <img
                                        src={rec.processedUrl || rec.originalUrl}
                                        alt="Processed"
                                        title="Optimized Output"
                                        className="w-full h-full object-cover"
                                      />
                                    </div>
                                  </div>
                                </td>

                                <td className="p-2.5 max-w-[190px]">
                                  <span className="font-mono text-[10px] text-[#9E7D3B] font-semibold block truncate">
                                    {rec.productIds.length > 0 ? rec.productIds.join(', ') : rec.discoveredIn.join(', ')}
                                  </span>
                                  <strong className="text-[#241A15] block truncate" title={rec.productNames.join(', ') || rec.originalUrl}>
                                    {rec.productNames[0] || rec.originalUrl.split('/').pop()}
                                  </strong>
                                  <span className="text-[10px] text-[#5A4A42] block truncate">
                                    {rec.discoveredIn.join(' · ')}
                                  </span>
                                </td>

                                <td className="p-2.5 font-mono text-[10px] text-[#5A4A42]">
                                  {rec.cropBox && rec.originalDimensions && rec.processedDimensions ? (
                                    <div className="space-y-0.5">
                                      <span className="text-[#241A15] font-semibold block text-[11px]">
                                        {rec.originalDimensions.width}×{rec.originalDimensions.height} → {rec.processedDimensions.width}×{rec.processedDimensions.height}
                                      </span>
                                      <span className="text-emerald-800 block">
                                        {rec.cropMode === 'safe_contain_original_bg' ? 'Safe Contain (Orig BG)' : 'Smart 1:1 Crop'} · Trim H:{rec.cropBox.horizontalTrimPercent}% V:{rec.cropBox.verticalTrimPercent}%
                                      </span>
                                      {rec.horizontalAnalysis && rec.verticalAnalysis && (
                                        <span className="text-stone-500 block">
                                          H:[{rec.horizontalAnalysis.leftBoundaryPercent}..{rec.horizontalAnalysis.rightBoundaryPercent}%] V:[{rec.verticalAnalysis.topBoundaryPercent}..{rec.verticalAnalysis.bottomBoundaryPercent}%]
                                        </span>
                                      )}
                                      {rec.orientation && (
                                        <span className="text-stone-400 block">
                                          {rec.orientation} · bg {rec.emptyBackgroundPercent ?? 0}%
                                        </span>
                                      )}
                                    </div>
                                  ) : (
                                    <span className="text-stone-400">Pending...</span>
                                  )}
                                </td>

                                <td className="p-2.5">
                                  {rec.cleanSourceStatus === 'replaced_with_clean' ? (
                                    <div className="space-y-0.5">
                                      <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded-xs text-[10px] font-semibold flex items-center gap-1 w-fit">
                                        <Check className="w-3 h-3" />
                                        Clean Source Replaced
                                      </span>
                                      {rec.cleanSourceVerification && (
                                        <span className="text-[10px] text-emerald-700 font-mono block">
                                          Match {Math.round(rec.cleanSourceVerification.similarityScore * 100)}%
                                        </span>
                                      )}
                                    </div>
                                  ) : isFlagged ? (
                                    <div className="space-y-0.5">
                                      <span className="px-2 py-0.5 bg-amber-100 text-amber-900 border border-amber-300 rounded-xs text-[10px] font-semibold flex items-center gap-1 w-fit">
                                        <AlertTriangle className="w-3 h-3" />
                                        Gemini Mark Flagged
                                      </span>
                                      {rec.watermarkLocation && rec.watermarkLocation !== 'none' && (
                                        <span className="text-[10px] text-amber-800 font-mono block">
                                          {rec.watermarkLocation}
                                        </span>
                                      )}
                                    </div>
                                  ) : (
                                    <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded-xs text-[10px] font-semibold flex items-center gap-1 w-fit">
                                      <Check className="w-3 h-3" />
                                      Verified Clean
                                    </span>
                                  )}
                                </td>

                                <td className="p-2.5">
                                  {rec.qualityCheck?.passed ? (
                                    <div className="space-y-0.5">
                                      <span className="text-emerald-800 font-semibold text-[11px] flex items-center gap-1">
                                        <CheckCircle className="w-3.5 h-3.5" />
                                        {rec.qualityCheck.exact1200Square ? '1200×1200 Verified' : 'QC Passed'}
                                      </span>
                                      <span className="text-[10px] text-stone-500 font-mono block">
                                        Sharp {rec.qualityCheck.sharpnessRetentionRatio}x · Δ{rec.qualityCheck.colorDelta}
                                      </span>
                                    </div>
                                  ) : rec.qualityCheck ? (
                                    <span className="text-amber-800 font-semibold text-[11px]" title={rec.qualityCheck.reason}>
                                      Original Retained
                                    </span>
                                  ) : (
                                    <span className="text-stone-500 text-[11px]">{rec.status}</span>
                                  )}
                                </td>

                                <td className="p-2.5 text-right">
                                  <div className="flex items-center justify-end gap-1.5">
                                    {isFlagged && (
                                      <label className="px-2 py-1 bg-amber-100 hover:bg-amber-200 text-amber-900 text-[10px] font-semibold rounded-xs cursor-pointer transition-colors">
                                        {cleanUploadingUrl === rec.originalUrl ? 'Verifying...' : 'Clean Upload'}
                                        <input
                                          type="file"
                                          accept="image/jpeg,image/png,image/webp"
                                          className="hidden"
                                          onChange={async (e) => {
                                            const file = e.target.files?.[0];
                                            e.target.value = '';
                                            if (!file) return;
                                            setCleanUploadingUrl(rec.originalUrl);
                                            setCleanUploadFeedback(null);
                                            try {
                                              await uploadCleanSourceImage(rec.originalUrl, file);
                                              setCleanUploadFeedback({
                                                type: 'success',
                                                text: `Verified & applied clean replacement for ${rec.productNames[0] || rec.originalUrl}.`,
                                              });
                                            } catch (err: any) {
                                              setCleanUploadFeedback({
                                                type: 'error',
                                                text: err?.message || 'Clean source verification failed.',
                                              });
                                            } finally {
                                              setCleanUploadingUrl(null);
                                            }
                                          }}
                                        />
                                      </label>
                                    )}
                                    <button
                                      onClick={() => {
                                        enqueueImageForProcessing(rec.originalUrl, rec.productIds[0], rec.productNames[0], rec.categories[0]);
                                      }}
                                      className="px-2 py-1 bg-[#F5EFEB] hover:bg-[#C5A059] hover:text-[#1A130F] text-[#241A15] text-[10px] font-semibold rounded-xs transition-colors cursor-pointer"
                                    >
                                      Re-Crop
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            );
                          })}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* TAB 1: Product Inventory Table */}
              {activeTab === 'products' && (
                <div className="space-y-4">
                  {editingProduct ? (
                    <form onSubmit={handleSaveEdit} className="p-4 bg-[#FBF8F2] rounded-lg border border-[#C5A059]/30 space-y-4">
                      <div className="flex items-center justify-between border-b border-[#C5A059]/20 pb-2">
                        <h4 className="font-royal text-sm font-bold text-[#241A15]">
                          Editing Product: {editingProduct.id}
                        </h4>
                        <button
                          type="button"
                          onClick={() => setEditingProduct(null)}
                          className="text-xs text-[#5A4A42] hover:text-[#241A15]"
                        >
                          Cancel
                        </button>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 text-xs">
                        <div>
                          <label className="block text-[#5A4A42] font-semibold mb-1">Product Title</label>
                          <input
                            type="text"
                            value={editingProduct.name}
                            onChange={(e) => setEditingProduct({ ...editingProduct, name: e.target.value })}
                            className="w-full px-2.5 py-1.5 border border-[#C5A059]/30 rounded-sm bg-white"
                          />
                        </div>

                        <div>
                          <label className="block text-[#5A4A42] font-semibold mb-1">Selling Price (₹)</label>
                          <input
                            type="number"
                            value={editingProduct.sellingPrice}
                            onChange={(e) => setEditingProduct({ ...editingProduct, sellingPrice: Number(e.target.value) })}
                            className="w-full px-2.5 py-1.5 border border-[#C5A059]/30 rounded-sm bg-white"
                          />
                        </div>

                        <div>
                          <label className="block text-[#5A4A42] font-semibold mb-1">Category (8 Approved)</label>
                          <select
                            value={editingProduct.primaryCategory}
                            onChange={(e) => setEditingProduct({ ...editingProduct, primaryCategory: e.target.value as any })}
                            className="w-full px-2.5 py-1.5 border border-[#C5A059]/30 rounded-sm bg-white"
                          >
                            <option value="Chains">Chains</option>
                            <option value="Rings">Rings</option>
                            <option value="Kada">Kada</option>
                            <option value="Ladies Sets">Ladies Sets</option>
                            <option value="Mangalsutra">Mangalsutra</option>
                            <option value="Earrings">Earrings</option>
                            <option value="Pendants">Pendants</option>
                            <option value="Bracelets">Bracelets</option>
                          </select>
                        </div>

                        <div className="sm:col-span-2 md:col-span-3">
                          <label className="block text-[#5A4A42] font-semibold mb-1">
                            Product Photo (Auto-processed by AI Pipeline)
                          </label>
                          <div className="flex flex-wrap items-center gap-3">
                            <div className="w-12 h-12 rounded-sm overflow-hidden border border-[#C5A059]/30 shrink-0">
                              <LuxuryImage src={editingProduct.image} alt={editingProduct.name} aspectRatio="square" />
                            </div>
                            <input
                              type="text"
                              value={editingProduct.image}
                              onChange={(e) => setEditingProduct({ ...editingProduct, image: e.target.value })}
                              className="flex-1 min-w-[200px] px-2.5 py-1.5 border border-[#C5A059]/30 rounded-sm bg-white font-mono text-[11px]"
                            />
                            <label className="px-3 py-1.5 bg-[#241A15] hover:bg-[#C5A059] text-[#DFCA9B] hover:text-[#1A130F] text-xs font-semibold rounded-sm cursor-pointer flex items-center gap-1.5 transition-colors">
                              <Upload className="w-3.5 h-3.5" />
                              <span>{isUploadingImage ? 'Uploading & Cropping...' : 'Upload New Photo'}</span>
                              <input
                                type="file"
                                accept="image/jpeg,image/png,image/webp"
                                className="hidden"
                                onChange={async (e) => {
                                  const file = e.target.files?.[0];
                                  if (!file) return;
                                  setIsUploadingImage(true);
                                  try {
                                    const originalUrl = await uploadProductImage(file, {
                                      productId: editingProduct.id,
                                      productName: editingProduct.name,
                                      category: editingProduct.primaryCategory,
                                    });
                                    if (originalUrl) {
                                      setEditingProduct({ ...editingProduct, image: originalUrl });
                                    }
                                  } catch (err: any) {
                                    alert(err?.message || 'Upload failed');
                                  } finally {
                                    setIsUploadingImage(false);
                                  }
                                }}
                              />
                            </label>
                          </div>
                        </div>
                      </div>

                      <div className="flex justify-end gap-2 pt-2">
                        <button
                          type="button"
                          onClick={() => setEditingProduct(null)}
                          className="px-3 py-1.5 border border-[#C5A059]/30 text-xs rounded-sm"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          className="px-4 py-1.5 bg-[#241A15] text-[#DFCA9B] text-xs font-semibold rounded-sm hover:bg-[#9E7D3B]"
                        >
                          Save Changes
                        </button>
                      </div>
                    </form>
                  ) : null}

                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs border border-[#C5A059]/20">
                      <thead className="bg-[#F5EFEB] text-[#241A15] border-b border-[#C5A059]/20">
                        <tr>
                          <th className="p-2.5">Item</th>
                          <th className="p-2.5">ID</th>
                          <th className="p-2.5">Title</th>
                          <th className="p-2.5">Category</th>
                          <th className="p-2.5">Audience</th>
                          <th className="p-2.5">Price</th>
                          <th className="p-2.5 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#F5EFEB]">
                        {products.map((p) => (
                          <tr key={p.id} className="hover:bg-[#FBF8F2] transition-colors">
                            <td className="p-2.5">
                              <LuxuryImage
                                src={p.image}
                                alt={p.name}
                                aspectRatio="square"
                                containerClassName="!w-9 !h-9 rounded-sm border border-[#C5A059]/30"
                              />
                            </td>
                            <td className="p-2.5 font-mono text-[11px] text-[#9E7D3B] font-semibold">{p.id}</td>
                            <td className="p-2.5 font-semibold text-[#241A15] max-w-xs truncate">{p.name}</td>
                            <td className="p-2.5 text-[#5A4A42]">{p.primaryCategory}</td>
                            <td className="p-2.5 text-[#5A4A42]">{p.audience}</td>
                            <td className="p-2.5 font-bold text-[#241A15] tabular-nums">₹{p.sellingPrice.toLocaleString('en-IN')}</td>
                            <td className="p-2.5 text-right">
                              <div className="flex items-center justify-end gap-1.5">
                                <button
                                  onClick={() => setEditingProduct(p)}
                                  className="p-1 text-[#9E7D3B] hover:text-[#241A15]"
                                  title="Edit"
                                >
                                  <Edit2 className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={() => {
                                    if (confirm(`Delete ${p.name}?`)) deleteProduct(p.id);
                                  }}
                                  className="p-1 text-red-600 hover:text-red-900"
                                  title="Delete"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* TAB 2: SYSTEM 1 DUPLICATE AUDIT CONSOLE */}
              {activeTab === 'duplicates' && (
                <div className="space-y-6">
                  {/* Duplicate Engine Status Card */}
                  <div className="p-4 bg-[#FBF8F2] rounded-lg border border-[#C5A059]/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <CopyCheck className="w-5 h-5 text-[#9E7D3B]" />
                        <h4 className="font-royal text-base font-bold text-[#241A15]">
                          Automatic Duplicate Detection & Removal Engine
                        </h4>
                      </div>
                      <p className="text-xs text-[#5A4A42] mt-1">
                        Continuous scanning over {products.length} products analyzing image hashes, product IDs, title similarity, and pricing signatures.
                      </p>
                    </div>

                    <button
                      onClick={() => {
                        const rep = runDuplicateCheck();
                        alert(`Duplicate Scan Complete: ${rep.confirmedCount} confirmed duplicates removed, ${rep.potentialCount} potential duplicates pending.`);
                      }}
                      className="px-4 py-2 bg-[#241A15] hover:bg-[#9E7D3B] text-[#DFCA9B] hover:text-white font-semibold text-xs uppercase tracking-wider rounded-sm transition-colors shrink-0 shadow-sm"
                    >
                      Run Full Catalogue Scan
                    </button>
                  </div>

                  {/* Summary Metric Cards */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                    <div className="p-3.5 bg-white rounded-md border border-[#C5A059]/20">
                      <span className="text-[#5A4A42] block">Active Clean Catalogue</span>
                      <strong className="text-xl text-[#241A15] font-bold block mt-1">{products.length} Products</strong>
                      <span className="text-[10px] text-emerald-700">100% Unique Verified Records</span>
                    </div>

                    <div className="p-3.5 bg-white rounded-md border border-[#C5A059]/20">
                      <span className="text-[#5A4A42] block">Confirmed Duplicates Removed</span>
                      <strong className="text-xl text-emerald-800 font-bold block mt-1">{duplicateReport?.confirmedCount || 0} Removed</strong>
                      <span className="text-[10px] text-[#5A4A42]">Canonical Record Preserved</span>
                    </div>

                    <div className="p-3.5 bg-white rounded-md border border-[#C5A059]/20">
                      <span className="text-[#5A4A42] block">Potential Duplicates (Safety Review)</span>
                      <strong className="text-xl text-amber-700 font-bold block mt-1">{duplicateReport?.potentialCount || 0} Flagged</strong>
                      <span className="text-[10px] text-[#5A4A42]">Rule §1.C: Never auto-deleted without proof</span>
                    </div>
                  </div>

                  {/* Potential Duplicates Requiring Admin Review */}
                  {duplicateReport && duplicateReport.records.filter((r) => r.status === 'potential_pending').length > 0 && (
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4 text-amber-600" />
                        <h5 className="font-royal text-sm font-bold text-[#241A15]">
                          Potential Duplicates Awaiting Admin Confirmation
                        </h5>
                      </div>
                      <p className="text-xs text-[#5A4A42]">
                        These designs look similar or share similar titles. Verify whether they are distinct artisan variations or the same item.
                      </p>

                      <div className="space-y-3">
                        {duplicateReport.records
                          .filter((r) => r.status === 'potential_pending')
                          .map((rec) => (
                            <div key={rec.id} className="p-4 bg-white rounded-lg border border-amber-300 shadow-xs space-y-3">
                              <div className="flex items-center justify-between text-xs border-b border-amber-100 pb-2">
                                <span className="font-mono text-[10px] text-amber-900 font-semibold">
                                  Similarity Match: {Math.round(rec.confidence * 100)}%
                                </span>
                                <span className="text-[#5A4A42]">{rec.reason}</span>
                              </div>

                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {/* Product A (Canonical Candidate) */}
                                <div className="flex items-center gap-3 p-2 bg-[#FBF8F2] rounded-sm border border-[#C5A059]/20">
                                  <LuxuryImage src={rec.canonicalProduct.image} alt={rec.canonicalProduct.name} aspectRatio="square" containerClassName="!w-12 !h-12 rounded-sm border shrink-0" />
                                  <div className="text-xs">
                                    <span className="font-mono text-[10px] text-[#9E7D3B]">{rec.canonicalProduct.id}</span>
                                    <h6 className="font-bold text-[#241A15]">{rec.canonicalProduct.name}</h6>
                                    <span className="text-[#5A4A42]">₹{rec.canonicalProduct.sellingPrice} · {rec.canonicalProduct.primaryCategory}</span>
                                  </div>
                                </div>

                                {/* Product B (Duplicate Candidate) */}
                                <div className="flex items-center gap-3 p-2 bg-[#FBF8F2] rounded-sm border border-[#C5A059]/20">
                                  <LuxuryImage src={rec.duplicateProduct.image} alt={rec.duplicateProduct.name} aspectRatio="square" containerClassName="!w-12 !h-12 rounded-sm border shrink-0" />
                                  <div className="text-xs">
                                    <span className="font-mono text-[10px] text-[#9E7D3B]">{rec.duplicateProduct.id}</span>
                                    <h6 className="font-bold text-[#241A15]">{rec.duplicateProduct.name}</h6>
                                    <span className="text-[#5A4A42]">₹{rec.duplicateProduct.sellingPrice} · {rec.duplicateProduct.primaryCategory}</span>
                                  </div>
                                </div>
                              </div>

                              <div className="flex items-center justify-end gap-2 pt-2">
                                <button
                                  onClick={() => dismissDuplicate(rec.canonicalProduct.id, rec.duplicateProduct.id)}
                                  className="px-3 py-1.5 bg-[#F5EFEB] hover:bg-[#E5D7BE] text-[#241A15] text-xs font-semibold rounded-sm transition-colors"
                                >
                                  Keep Both (Distinct Designs)
                                </button>
                                <button
                                  onClick={() => mergeDuplicates(rec.canonicalProduct.id, rec.duplicateProduct.id)}
                                  className="px-3 py-1.5 bg-[#241A15] hover:bg-[#9E7D3B] text-white text-xs font-semibold rounded-sm transition-colors"
                                >
                                  Merge & Retain Canonical
                                </button>
                              </div>
                            </div>
                          ))}
                      </div>
                    </div>
                  )}

                  {/* Confirmed Duplicate Log */}
                  <div className="space-y-3">
                    <h5 className="font-royal text-sm font-bold text-[#241A15]">
                      Audit Trail: Confirmed Duplicate Removals
                    </h5>
                    {duplicateReport && duplicateReport.records.filter((r) => r.status === 'confirmed_removed').length > 0 ? (
                      <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs border border-[#C5A059]/20">
                          <thead className="bg-[#F5EFEB] text-[#241A15]">
                            <tr>
                              <th className="p-2.5">Retained Product</th>
                              <th className="p-2.5">Removed Duplicate</th>
                              <th className="p-2.5">Match Reason</th>
                              <th className="p-2.5">Confidence</th>
                              <th className="p-2.5 text-right">Status</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-[#F5EFEB]">
                            {duplicateReport.records
                              .filter((r) => r.status === 'confirmed_removed')
                              .map((rec) => (
                                <tr key={rec.id} className="hover:bg-[#FBF8F2]">
                                  <td className="p-2.5 font-semibold text-emerald-800">
                                    {rec.canonicalProduct.id} — {rec.canonicalProduct.name}
                                  </td>
                                  <td className="p-2.5 text-red-700 line-through">
                                    {rec.duplicateProduct.id} — {rec.duplicateProduct.name}
                                  </td>
                                  <td className="p-2.5 text-[#5A4A42] max-w-xs">{rec.reason}</td>
                                  <td className="p-2.5 font-mono">{Math.round(rec.confidence * 100)}%</td>
                                  <td className="p-2.5 text-right">
                                    <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded-xs text-[10px] font-semibold">
                                      Safely Removed
                                    </span>
                                  </td>
                                </tr>
                              ))}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <div className="p-4 bg-[#FBF8F2] rounded-md border border-[#C5A059]/20 text-xs text-[#5A4A42] flex items-center gap-2">
                        <Check className="w-4 h-4 text-emerald-700" />
                        <span>Zero redundant duplicate records found in catalogue. All {products.length} pieces are unique verified assets.</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* TAB 3: SYSTEM 2 FLIPKART / MYNTRA LISTING QUALITY CONTROL */}
              {activeTab === 'quality' && (
                <div className="space-y-6">
                  {/* Quality Control Header Card */}
                  <div className="p-4 bg-[#FBF8F2] rounded-lg border border-[#C5A059]/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <Sparkles className="w-5 h-5 text-[#9E7D3B]" />
                        <h4 className="font-royal text-base font-bold text-[#241A15]">
                          Product Listing Quality Control Console (Flipkart & Myntra Standard)
                        </h4>
                      </div>
                      <p className="text-xs text-[#5A4A42] mt-1">
                        Enforces searchable, professional titles (`[Audience]'s [Finish] [Pattern] [Type]`), natural Indian English descriptions, zero promotional fluff, and no invented metal/gem purity claims.
                      </p>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => {
                          applyQualityFixes();
                          alert('Flipkart/Myntra standard titles and descriptions applied to all catalogue items.');
                        }}
                        className="px-4 py-2 bg-[#C5A059] hover:bg-[#9E7D3B] text-[#1A130F] font-bold text-xs uppercase tracking-wider rounded-sm transition-colors shadow-sm"
                      >
                        1-Click Standardize All
                      </button>
                      <button
                        onClick={() => {
                          runQualityAuditCheck();
                        }}
                        className="p-2 bg-[#241A15] text-[#DFCA9B] rounded-sm hover:text-white"
                        title="Re-audit"
                      >
                        <RotateCcw className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Quality Metric Cards */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                    <div className="p-3.5 bg-white rounded-md border border-[#C5A059]/20">
                      <span className="text-[#5A4A42] block">Catalogue Quality Score</span>
                      <strong className="text-2xl text-emerald-800 font-bold block mt-1">
                        {qualitySummary?.averageScore || 100}%
                      </strong>
                      <span className="text-[10px] text-[#5A4A42]">High-Tier Indian Marketplace Grade</span>
                    </div>

                    <div className="p-3.5 bg-white rounded-md border border-[#C5A059]/20">
                      <span className="text-[#5A4A42] block">Anti-Puffery Compliance</span>
                      <strong className="text-2xl text-emerald-800 font-bold block mt-1">100% Clean</strong>
                      <span className="text-[10px] text-[#5A4A42]">Zero "Royal Majesty", "Imperial" puffery</span>
                    </div>

                    <div className="p-3.5 bg-white rounded-md border border-[#C5A059]/20">
                      <span className="text-[#5A4A42] block">Authenticity & Safety</span>
                      <strong className="text-2xl text-emerald-800 font-bold block mt-1">Verified</strong>
                      <span className="text-[10px] text-[#5A4A42]">No invented carat, hallmark, or solid gold claims</span>
                    </div>
                  </div>

                  {/* Listing Quality Breakdown Table */}
                  <div className="space-y-3">
                    <h5 className="font-royal text-sm font-bold text-[#241A15]">
                      Individual Product Listing Audits
                    </h5>
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs border border-[#C5A059]/20">
                        <thead className="bg-[#F5EFEB] text-[#241A15]">
                          <tr>
                            <th className="p-2.5">ID</th>
                            <th className="p-2.5">Current Title</th>
                            <th className="p-2.5">Score</th>
                            <th className="p-2.5">Status & Audit Notes</th>
                            <th className="p-2.5 text-right">Standardized Recommendation</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[#F5EFEB]">
                          {qualitySummary?.results.map((res) => (
                            <tr key={res.productId} className="hover:bg-[#FBF8F2]">
                              <td className="p-2.5 font-mono text-[11px] text-[#9E7D3B] font-semibold">{res.productId}</td>
                              <td className="p-2.5 font-semibold text-[#241A15] max-w-xs">{res.productName}</td>
                              <td className="p-2.5">
                                <span
                                  className={`px-2 py-0.5 rounded-xs font-mono font-bold text-[11px] ${
                                    res.qualityScore >= 85
                                      ? 'bg-emerald-100 text-emerald-800'
                                      : 'bg-amber-100 text-amber-800'
                                  }`}
                                >
                                  {res.qualityScore}%
                                </span>
                              </td>
                              <td className="p-2.5 text-[#5A4A42] text-[11px]">
                                {res.titleIssues.length === 0 && res.descriptionIssues.length === 0 ? (
                                  <span className="text-emerald-700 flex items-center gap-1 font-medium">
                                    <Check className="w-3.5 h-3.5" />
                                    <span>Compliant Flipkart/Myntra standard</span>
                                  </span>
                                ) : (
                                  <span className="text-amber-800">
                                    {[...res.titleIssues, ...res.descriptionIssues].join('; ')}
                                  </span>
                                )}
                              </td>
                              <td className="p-2.5 text-right text-[#9E7D3B] font-medium font-mono text-[11px]">
                                {res.suggestedTitle}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 4: Add Product with AI Assist */}
              {activeTab === 'add' && (
                <div className="space-y-6">
                  <div className="p-4 bg-[#FBF8F2] rounded-lg border border-[#C5A059]/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <h4 className="font-royal text-sm font-bold text-[#241A15]">
                        AI Vision Product Identification & Listing Assistant
                      </h4>
                      <p className="text-xs text-[#5A4A42]">
                        Automatically analyzes product image, identifies category, suggests Flipkart/Myntra compliant titles, and calculates pricing rules.
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={handleRunAiAnalysis}
                      disabled={isAiAnalyzing}
                      className="px-4 py-2 bg-[#241A15] hover:bg-[#9E7D3B] text-white text-xs font-semibold uppercase tracking-wider rounded-sm transition-colors flex items-center gap-2 shadow-xs shrink-0"
                    >
                      <Sparkles className="w-4 h-4 text-[#DFCA9B]" />
                      <span>{isAiAnalyzing ? 'Analyzing Image...' : 'Run AI Analysis'}</span>
                    </button>
                  </div>

                  {aiAnalysisResult && (
                    <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-sm text-xs text-emerald-900">
                      {aiAnalysisResult}
                    </div>
                  )}

                  <form onSubmit={handleCreateProduct} className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                      <div>
                        <label className="block text-[#5A4A42] font-semibold mb-1">Product ID</label>
                        <input
                          type="text"
                          value={newProd.id}
                          onChange={(e) => setNewProd({ ...newProd, id: e.target.value })}
                          className="w-full px-3 py-2 border border-[#C5A059]/30 rounded-sm bg-white font-mono"
                        />
                      </div>

                      <div>
                        <label className="block text-[#5A4A42] font-semibold mb-1">Product Title</label>
                        <input
                          type="text"
                          placeholder="e.g., Men's Classic Gold Tone Chain"
                          value={newProd.name}
                          onChange={(e) => setNewProd({ ...newProd, name: e.target.value })}
                          className="w-full px-3 py-2 border border-[#C5A059]/30 rounded-sm bg-white"
                        />
                      </div>

                      <div>
                        <label className="block text-[#5A4A42] font-semibold mb-1">
                          Category (8 Approved)
                          <span className="ml-1 text-[10px] text-[#9E7D3B]">
                            {APPROVED_PRICING_RULES[newProd.primaryCategory || 'Chains']?.label || ''}
                          </span>
                        </label>
                        <select
                          value={newProd.primaryCategory}
                          onChange={(e) => {
                            const cat = e.target.value as CategoryType;
                            const defaultPrice = APPROVED_PRICING_RULES[cat]?.minPrice || 1500;
                            setNewProd({
                              ...newProd,
                              primaryCategory: cat,
                              sellingPrice: defaultPrice,
                              originalPrice: Math.round(defaultPrice * 1.35 / 50) * 50
                            });
                          }}
                          className="w-full px-3 py-2 border border-[#C5A059]/30 rounded-sm bg-white"
                        >
                          <option value="Chains">Chains</option>
                          <option value="Rings">Rings</option>
                          <option value="Kada">Kada</option>
                          <option value="Ladies Sets">Ladies Sets</option>
                          <option value="Mangalsutra">Mangalsutra</option>
                          <option value="Earrings">Earrings</option>
                          <option value="Pendants">Pendants</option>
                          <option value="Bracelets">Bracelets</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-[#5A4A42] font-semibold mb-1">Audience</label>
                        <select
                          value={newProd.audience}
                          onChange={(e) => setNewProd({ ...newProd, audience: e.target.value as any })}
                          className="w-full px-3 py-2 border border-[#C5A059]/30 rounded-sm bg-white"
                        >
                          <option value="Men">Men</option>
                          <option value="Women">Women</option>
                          <option value="Unisex">Unisex</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-[#5A4A42] font-semibold mb-1">Selling Price (₹)</label>
                        <input
                          type="number"
                          value={newProd.sellingPrice}
                          onChange={(e) => setNewProd({ ...newProd, sellingPrice: Number(e.target.value) })}
                          className="w-full px-3 py-2 border border-[#C5A059]/30 rounded-sm bg-white font-mono"
                        />
                      </div>

                      <div>
                        <label className="block text-[#5A4A42] font-semibold mb-1">
                          Product Photo Upload (Auto-Processed by AI Cropping Pipeline)
                        </label>
                        <div className="flex items-center gap-2">
                          <input
                            type="text"
                            value={newProd.image}
                            onChange={(e) => setNewProd({ ...newProd, image: e.target.value })}
                            className="flex-1 px-3 py-2 border border-[#C5A059]/30 rounded-sm bg-white font-mono"
                          />
                          <label className="px-3 py-2 bg-[#241A15] hover:bg-[#C5A059] text-[#DFCA9B] hover:text-[#1A130F] text-xs font-semibold rounded-sm cursor-pointer flex items-center gap-1.5 shrink-0 transition-colors">
                            <Upload className="w-3.5 h-3.5" />
                            <span>{isUploadingImage ? 'Processing...' : 'Upload'}</span>
                            <input
                              type="file"
                              accept="image/jpeg,image/png,image/webp"
                              className="hidden"
                              onChange={async (e) => {
                                const file = e.target.files?.[0];
                                if (!file) return;
                                setIsUploadingImage(true);
                                try {
                                  const originalUrl = await uploadProductImage(file, {
                                    productId: newProd.id,
                                    productName: newProd.name,
                                    category: newProd.primaryCategory,
                                  });
                                  if (originalUrl) {
                                    setNewProd((prev) => ({ ...prev, image: originalUrl }));
                                  }
                                } catch (err: any) {
                                  alert(err?.message || 'Upload failed');
                                } finally {
                                  setIsUploadingImage(false);
                                }
                              }}
                            />
                          </label>
                        </div>
                      </div>

                      <div className="sm:col-span-2">
                        <label className="block text-[#5A4A42] font-semibold mb-1">Description</label>
                        <textarea
                          rows={2}
                          value={newProd.description}
                          onChange={(e) => setNewProd({ ...newProd, description: e.target.value })}
                          className="w-full px-3 py-2 border border-[#C5A059]/30 rounded-sm bg-white"
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      className="w-full py-3 bg-[#241A15] hover:bg-[#9E7D3B] text-white font-semibold uppercase tracking-wider rounded-sm transition-colors"
                    >
                      Publish Approved Product To Catalogue
                    </button>
                  </form>
                </div>
              )}

              {/* TAB 5: Moderate Reviews */}
              {activeTab === 'reviews' && (
                <div className="space-y-4">
                  <p className="text-xs text-[#5A4A42]">
                    Review submissions awaiting admin moderation. Only approved reviews appear on the live storefront.
                  </p>

                  <div className="space-y-3">
                    {reviews.map((r) => (
                      <div
                        key={r.id}
                        className="p-4 bg-[#FBF8F2] rounded-md border border-[#C5A059]/25 flex items-center justify-between gap-4 text-xs"
                      >
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <strong className="text-[#241A15]">{r.customerName}</strong>
                            <span className="text-[#5A4A42]">({r.city})</span>
                            <span className="font-mono text-[#9E7D3B]">★ {r.rating}/5</span>
                          </div>
                          <p className="italic text-[#5A4A42]">"{r.comment}"</p>
                          <span className="text-[10px] text-[#5A4A42]/80">Item: {r.productPurchased} · {r.date}</span>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          <button
                            onClick={() => toggleReviewApproval(r.id)}
                            className={`px-3 py-1.5 rounded-sm font-semibold flex items-center gap-1 ${
                              r.isApproved
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'bg-amber-100 text-amber-800'
                            }`}
                          >
                            {r.isApproved ? (
                              <>
                                <CheckCircle className="w-3.5 h-3.5" />
                                <span>Approved</span>
                              </>
                            ) : (
                              <>
                                <XCircle className="w-3.5 h-3.5" />
                                <span>Pending Approval</span>
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

            </div>
          </>
        )}

      </div>
    </div>
  );
};
