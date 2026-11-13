import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Download,
  ExternalLink,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  ShieldCheck,
  Maximize2,
  FileCheck,
  Mail,
  Phone,
  MessageCircle,
} from 'lucide-react';
import { useShop } from '../context/ShopContext';

interface TermsModalProps {
  isOpen?: boolean;
  onClose?: () => void;
}

// User-supplied Terms & Conditions image
export const TERMS_IMAGE_PATH = '/assets/aistudio/IMG_20261112_232020_890e4a0a.jpg';

/**
 * TermsModal:
 * Dedicated professional HD Image Viewer for the official SHRI JI JEWELS
 * Terms and Conditions document image. Supports responsive fit, progressive zoom
 * (50% to 250%), fit-to-width, keyboard Escape dismissal, backdrop click closing,
 * and high-resolution image preservation.
 */
export const TermsModal: React.FC<TermsModalProps> = ({
  isOpen: propIsOpen,
  onClose: propOnClose,
}) => {
  const { isTermsOpen, setIsTermsOpen } = useShop();
  const isOpen = propIsOpen !== undefined ? propIsOpen : isTermsOpen;
  const onClose = propOnClose || (() => setIsTermsOpen(false));

  const [zoomLevel, setZoomLevel] = useState<number>(100);
  const [imageLoaded, setImageLoaded] = useState<boolean>(false);
  const [imageError, setImageError] = useState<boolean>(false);
  const viewportRef = useRef<HTMLDivElement>(null);

  // Close on Escape key press
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Reset zoom on open
  useEffect(() => {
    if (isOpen) {
      setZoomLevel(100);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleZoomIn = () => setZoomLevel((prev) => Math.min(prev + 25, 250));
  const handleZoomOut = () => setZoomLevel((prev) => Math.max(prev - 25, 50));
  const handleZoomReset = () => {
    setZoomLevel(100);
    if (viewportRef.current) {
      viewportRef.current.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
    }
  };
  const handleFitWidth = () => {
    setZoomLevel(135);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/85 backdrop-blur-md animate-fade-in"
      onClick={(e) => {
        // Close if clicked on outer backdrop
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="terms-title"
    >
      <div className="relative w-full max-w-4xl h-[94vh] flex flex-col bg-[#FAF7F2] rounded-xl shadow-2xl border border-[#C5A36A]/50 overflow-hidden">
        
        {/* Header Bar */}
        <div className="bg-[#493326] text-[#F7EFE1] px-4 sm:px-6 py-3.5 flex items-center justify-between border-b border-[#C5A36A]/40 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#F2E7D5] p-1 border border-[#C5A36A]/60 flex items-center justify-center shrink-0">
              <FileCheck className="w-5 h-5 text-[#493326]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 id="terms-title" className="font-royal text-base sm:text-lg font-bold text-white tracking-wide">
                  SHRI JI JEWELS
                </h3>
                <span className="text-[10px] bg-[#C5A36A] text-[#1E140F] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                  Official Terms
                </span>
              </div>
              <p className="text-[11px] text-[#DFCA9B] font-light">
                Terms & Conditions · Order Confirmation, Shipping & Care Policies
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="p-2 text-[#DFCA9B] hover:text-white hover:bg-white/10 rounded-full transition-colors cursor-pointer"
              aria-label="Close Terms & Conditions Viewer"
              title="Close (Esc)"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Interactive Viewer Toolbar */}
        <div className="bg-[#EFE7DC] px-3 sm:px-6 py-2 flex flex-wrap items-center justify-between gap-2 border-b border-[#C5A36A]/30 text-xs text-[#493326] shrink-0">
          {/* Zoom controls */}
          <div className="flex items-center gap-1 sm:gap-2">
            <span className="font-semibold text-[11px] uppercase tracking-wider text-[#5C3E2D] hidden sm:inline">
              Viewer Controls:
            </span>

            <button
              onClick={handleZoomOut}
              disabled={zoomLevel <= 50}
              className="p-1.5 hover:bg-[#DFCA9B]/60 disabled:opacity-40 rounded transition-colors cursor-pointer"
              title="Zoom Out"
              aria-label="Zoom Out"
            >
              <ZoomOut className="w-4 h-4" />
            </button>

            <span className="font-mono text-[11px] w-12 text-center font-bold text-[#493326]">
              {zoomLevel}%
            </span>

            <button
              onClick={handleZoomIn}
              disabled={zoomLevel >= 250}
              className="p-1.5 hover:bg-[#DFCA9B]/60 disabled:opacity-40 rounded transition-colors cursor-pointer"
              title="Zoom In"
              aria-label="Zoom In"
            >
              <ZoomIn className="w-4 h-4" />
            </button>

            <div className="w-px h-4 bg-[#C5A36A]/40 mx-1" />

            <button
              onClick={handleZoomReset}
              className="px-2 py-1 text-[11px] font-semibold hover:bg-[#DFCA9B]/60 rounded transition-colors flex items-center gap-1 cursor-pointer"
              title="Reset Zoom to 100%"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">100%</span>
            </button>

            <button
              onClick={handleFitWidth}
              className="px-2 py-1 text-[11px] font-semibold hover:bg-[#DFCA9B]/60 rounded transition-colors flex items-center gap-1 cursor-pointer"
              title="Fit Document to Width"
            >
              <Maximize2 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Fit Width</span>
            </button>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2">
            <a
              href={TERMS_IMAGE_PATH}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#493326] text-[#F7EFE1] hover:bg-[#342217] rounded-md transition-colors font-medium text-xs shadow-xs"
              title="Open full image in new browser tab"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span className="hidden xs:inline">Open Full Image</span>
            </a>

            <a
              href={TERMS_IMAGE_PATH}
              download="SHRI_JI_JEWELS_Terms_and_Conditions.jpg"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#C5A36A] hover:bg-[#9E7D3B] text-[#1E140F] rounded-md transition-colors font-bold text-xs shadow-xs"
              title="Download Terms image"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download</span>
            </a>
          </div>
        </div>

        {/* Document Image Viewport */}
        <div
          ref={viewportRef}
          className="flex-1 overflow-auto bg-[#2B201A] p-3 sm:p-6 flex items-start justify-center cursor-grab active:cursor-grabbing"
          onClick={(e) => {
            // Clicking background closes modal
            if (e.target === e.currentTarget) {
              onClose();
            }
          }}
        >
          <div
            className="transition-transform duration-200 ease-out origin-top flex items-center justify-center my-auto"
            style={{
              transform: `scale(${zoomLevel / 100})`,
              transformOrigin: 'top center',
            }}
          >
            {/* Loading state skeleton */}
            {!imageLoaded && !imageError && (
              <div className="w-[340px] sm:w-[600px] h-[800px] bg-[#3B2C24] animate-pulse rounded-lg flex items-center justify-center text-[#DFCA9B] text-xs">
                Loading Official Terms & Conditions Image...
              </div>
            )}

            {/* Error state fallback */}
            {imageError && (
              <div className="p-8 text-center text-[#DFCA9B] space-y-3 bg-[#3B2C24] rounded-lg border border-red-500/40">
                <p className="text-sm font-semibold text-red-300">
                  Unable to load Terms image directly.
                </p>
                <a
                  href={TERMS_IMAGE_PATH}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block px-4 py-2 bg-[#C5A36A] text-[#1E140F] font-bold rounded-sm text-xs"
                >
                  Click Here To Open Document
                </a>
              </div>
            )}

            {/* The Actual Supplied Terms & Conditions Image */}
            <img
              src={TERMS_IMAGE_PATH}
              alt="SHRI JI JEWELS Official Terms and Conditions — Payment & COD, No Return & Exchange, Order Confirmation, Shipping & Delivery, Product & Care, Damaged/Incorrect Item"
              className={`max-w-[92vw] sm:max-w-2xl w-auto h-auto rounded-lg shadow-2xl border border-[#C5A36A]/40 select-none block transition-opacity duration-300 ${
                imageLoaded ? 'opacity-100' : 'opacity-0'
              }`}
              loading="eager"
              decoding="async"
              onLoad={() => setImageLoaded(true)}
              onError={() => setImageError(true)}
              style={{
                imageRendering: 'auto',
              }}
            />
          </div>
        </div>

        {/* Footer Info Strip */}
        <div className="bg-[#493326] px-4 sm:px-6 py-2.5 flex flex-col sm:flex-row items-center justify-between text-[11px] text-[#DFCA9B] border-t border-[#C5A36A]/30 shrink-0 gap-2">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-[#C5A36A]" />
            <span className="font-medium">
              Official Consumer Protection Policies · SHRI JI JEWELS
            </span>
          </div>

          <div className="flex items-center gap-3">
            <a
              href="mailto:Shrijijewels2908@gmail.com"
              className="hover:text-white transition-colors underline flex items-center gap-1"
            >
              <Mail className="w-3 h-3 text-[#C5A36A]" />
              <span>Shrijijewels2908@gmail.com</span>
            </a>
            <span>•</span>
            <a
              href="https://wa.me/919315741495"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-[#25D366] transition-colors flex items-center gap-1 font-mono"
            >
              <MessageCircle className="w-3 h-3 text-[#25D366]" />
              <span>WhatsApp: +91 9315741495</span>
            </a>
          </div>
        </div>

      </div>
    </div>
  );
};
