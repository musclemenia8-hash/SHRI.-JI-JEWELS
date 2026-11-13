import React, { useRef, useState } from 'react';
import { Volume2, VolumeX, Sparkles, ArrowRight } from 'lucide-react';
import { useShop } from '../context/ShopContext';

export const SecondaryVideoSection: React.FC = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isMuted, setIsMuted] = useState(true);
  const { setSelectedCategory } = useShop();

  const toggleSound = () => {
    if (videoRef.current) {
      videoRef.current.muted = !videoRef.current.muted;
      setIsMuted(videoRef.current.muted);
    }
  };

  const handleExplore = () => {
    setSelectedCategory('Chains');
    const el = document.getElementById('catalog-section');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section className="relative w-full bg-[#1A130F] text-[#FBF8F2] overflow-hidden border-b border-[#C5A059]/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          
          {/* Left Column: Brand Story & Craftsmanship Quote */}
          <div className="lg:col-span-5 space-y-4 sm:space-y-6 text-center lg:text-left order-2 lg:order-1">
            <div className="inline-flex items-center gap-2 text-xs uppercase tracking-widest text-[#DFCA9B]">
              <Sparkles className="w-3.5 h-3.5 text-[#C5A059]" />
              <span>Cinematic Heritage Showcase</span>
            </div>

            <h1 className="font-royal text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-[#FBF8F2] leading-tight">
              Crafted For Kings, <br />
              <span className="gold-gradient-text">Cherished For Generations</span>
            </h1>

            <p className="text-sm sm:text-base text-[#DFCA9B]/85 font-light leading-relaxed max-w-xl mx-auto lg:mx-0">
              Immerse yourself in the majestic radiance of SHRI JI JEWELS. Each heavyweight chain and sovereign kada is forged with timeless Indian goldsmithing techniques, delivering heirloom luxury at honest, direct artisan pricing.
            </p>

            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
              <button
                onClick={handleExplore}
                className="w-full sm:w-auto px-6 py-3 bg-gradient-to-r from-[#9E7D3B] to-[#C5A059] text-[#1A130F] font-semibold text-xs uppercase tracking-widest rounded-sm hover:brightness-110 transition-all flex items-center justify-center gap-2 shadow-lg"
              >
                <span>Explore Royal Chains</span>
                <ArrowRight className="w-4 h-4" />
              </button>
              
              <div className="flex items-center gap-2 text-xs text-[#DFCA9B]/70">
                <span className="w-2 h-2 rounded-full bg-[#C5A059]" />
                <span>₹200 Advance Dispatch Nationwide</span>
              </div>
            </div>
          </div>

          {/* Right Column: High-Definition Secondary Video Player */}
          <div className="lg:col-span-7 relative order-1 lg:order-2 flex justify-center">
            <div className="relative w-full max-w-md sm:max-w-lg lg:max-w-none aspect-[9/16] sm:aspect-[4/5] max-h-[580px] rounded-lg overflow-hidden border-2 border-[#C5A059]/40 shadow-2xl bg-black">
              <video
                ref={videoRef}
                src="/assets/aistudio/920593765_1794402616073100_9ff8a292.mp4"
                autoPlay
                muted
                loop
                playsInline
                preload="metadata"
                className="w-full h-full object-cover object-center"
              />
              
              {/* Subtle gold vignette overlay */}
              <div className="absolute inset-0 pointer-events-none bg-gradient-to-t from-black/80 via-transparent to-black/20" />

              {/* Sound Toggle Button */}
              <button
                onClick={toggleSound}
                className="absolute bottom-4 right-4 z-10 p-2.5 bg-black/60 backdrop-blur-md text-[#DFCA9B] rounded-full border border-[#C5A059]/40 hover:bg-black/90 transition-all"
                aria-label={isMuted ? 'Unmute video' : 'Mute video'}
                title={isMuted ? 'Enable Sound' : 'Mute Sound'}
              >
                {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
              </button>

              {/* Caption Overlay */}
              <div className="absolute bottom-4 left-4 z-10 text-left pointer-events-none">
                <p className="text-[10px] uppercase tracking-widest text-[#DFCA9B] font-semibold">
                  Heritage Collection
                </p>
                <p className="font-royal text-sm text-white font-medium">
                  Solid Sovereign Cuban Chain
                </p>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};
