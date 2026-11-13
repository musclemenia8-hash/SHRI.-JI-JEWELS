import React, { useRef, useState } from 'react';
import { Volume2, VolumeX, Play, Pause, Sparkles, MessageCircle } from 'lucide-react';
import { useShop } from '../context/ShopContext';

export const DedicatedVideoSection: React.FC = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isMuted, setIsMuted] = useState(true);
  const [isPlaying, setIsPlaying] = useState(true);
  const { setSelectedCategory } = useShop();

  const toggleSound = () => {
    if (videoRef.current) {
      videoRef.current.muted = !videoRef.current.muted;
      setIsMuted(videoRef.current.muted);
    }
  };

  const togglePlay = () => {
    if (videoRef.current) {
      if (videoRef.current.paused) {
        videoRef.current.play();
        setIsPlaying(true);
      } else {
        videoRef.current.pause();
        setIsPlaying(false);
      }
    }
  };

  const handleExploreChains = () => {
    setSelectedCategory('Chains');
    const el = document.getElementById('catalog-section');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section className="relative w-full py-12 sm:py-16 bg-[#241A15] text-[#FBF8F2] overflow-hidden border-b border-[#C5A059]/30">
      {/* Background ambient radial glow */}
      <div className="absolute inset-0 bg-radial-at-c from-[#C5A059]/10 via-transparent to-transparent pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-8 sm:mb-10 space-y-2">
          <div className="inline-flex items-center gap-2 text-xs uppercase tracking-widest text-[#DFCA9B]">
            <Sparkles className="w-3.5 h-3.5 text-[#C5A059]" />
            <span>Cinematic Craft Showcase</span>
            <Sparkles className="w-3.5 h-3.5 text-[#C5A059]" />
          </div>
          <h2 className="font-royal text-2xl sm:text-3xl lg:text-4xl font-bold tracking-wide text-white">
            The Sovereign Cuban Link
          </h2>
          <p className="text-xs sm:text-sm text-[#DFCA9B]/80 font-light max-w-xl mx-auto">
            Experience the weighted grandeur and immaculate 22K mirror finish of our signature royal chain in motion.
          </p>
        </div>

        {/* Video Player Box: Centered, reduced desktop width to ~65% per Correction 06 */}
        <div className="w-full lg:w-[65%] mx-auto">
          <div className="relative rounded-xl overflow-hidden border-2 border-[#C5A059]/40 shadow-2xl bg-black aspect-[16/10] sm:aspect-[16/9] max-h-[520px]">
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

            {/* Subtle Vignette Gradient Overlay */}
            <div className="absolute inset-0 pointer-events-none bg-gradient-to-t from-black/85 via-transparent to-black/30" />

            {/* Top Right Controls: Play/Pause and Mute/Unmute */}
            <div className="absolute top-4 right-4 z-20 flex items-center gap-2">
              <button
                onClick={togglePlay}
                className="p-2.5 bg-black/60 hover:bg-black/85 backdrop-blur-md text-[#DFCA9B] rounded-full border border-[#C5A059]/40 transition-all cursor-pointer"
                aria-label={isPlaying ? 'Pause video' : 'Play video'}
                title={isPlaying ? 'Pause' : 'Play'}
              >
                {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-current" />}
              </button>
              
              <button
                onClick={toggleSound}
                className="p-2.5 bg-black/60 hover:bg-black/85 backdrop-blur-md text-[#DFCA9B] rounded-full border border-[#C5A059]/40 transition-all cursor-pointer"
                aria-label={isMuted ? 'Unmute video' : 'Mute video'}
                title={isMuted ? 'Enable Sound' : 'Mute Sound'}
              >
                {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
              </button>
            </div>

            {/* Bottom Caption Overlay */}
            <div className="absolute bottom-4 left-4 right-4 z-20 flex flex-col sm:flex-row sm:items-end justify-between gap-3 pointer-events-none">
              <div>
                <span className="text-[10px] uppercase tracking-widest text-[#DFCA9B] font-semibold bg-black/50 px-2 py-0.5 rounded-xs border border-[#C5A059]/30">
                  SHRI JI JEWELS Heritage Vault
                </span>
                <p className="font-royal text-base sm:text-lg text-white font-bold mt-1 drop-shadow-md">
                  Solid Cuban Curb Link Chain · 22K Royal Lustre
                </p>
                <p className="text-xs text-[#DFCA9B]/90 font-light drop-shadow-xs">
                  Hand-linked brass core with high-radiance gold polish & heavy security clasp
                </p>
              </div>

              {/* Action Button inside player on desktop, accessible via pointer-events-auto */}
              <div className="pointer-events-auto flex items-center gap-2">
                <button
                  onClick={handleExploreChains}
                  className="px-4 py-2 bg-[#C5A059] hover:bg-[#9E7D3B] text-[#1A130F] font-bold text-xs uppercase tracking-wider rounded-sm shadow-lg transition-all cursor-pointer whitespace-nowrap"
                >
                  View Chains
                </button>
                <a
                  href="https://wa.me/919315741495?text=Hello%20Shri%20Ji%20Jewels,%20I%20am%20interested%20in%20the%20Solid%20Cuban%20Curb%20Link%20Chain%20shown%20in%20your%20video."
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 bg-[#25D366] hover:bg-[#20ba59] text-white rounded-sm transition-all cursor-pointer"
                  title="Inquire on WhatsApp"
                  aria-label="Inquire on WhatsApp"
                >
                  <MessageCircle className="w-4 h-4" />
                </a>
              </div>
            </div>
          </div>

          {/* Under-video trust note */}
          <div className="mt-3 text-center text-xs text-[#DFCA9B]/70 flex items-center justify-center gap-4">
            <span>Direct Video from Workshop Master</span>
            <span>·</span>
            <span>₹200 Advance Dispatch</span>
            <span>·</span>
            <span>WhatsApp: 9315741495</span>
          </div>
        </div>

      </div>
    </section>
  );
};
