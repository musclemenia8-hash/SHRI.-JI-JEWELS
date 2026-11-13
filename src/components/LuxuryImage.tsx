import React, { useState, useEffect } from 'react';
import { imageQueueService } from '../services/imageQueueService';
import { ProcessedImageRecord } from '../types/imagePipeline';

interface LuxuryImageProps {
  src: string;
  alt: string;
  className?: string;
  containerClassName?: string;
  aspectRatio?: 'square' | 'portrait' | 'landscape' | 'none';
  fit?: 'cover' | 'contain';
  hideWatermark?: boolean;
  priority?: boolean;
  useProcessed?: boolean;
}

/**
 * LuxuryImage handles:
 * 1. Automatic integration with the centralized backend AI Image Processing Pipeline.
 * 2. Renders independently calculated, subject-safe horizontal & vertical cropped HD JPEGs from /assets/processed/.
 * 3. Safe automatic fallback to the untouched original asset in /assets/aistudio/ or /assets/uploads/ on error.
 * 4. Subtle protective corner mask only for assets flagged as requiring an authorized clean source.
 */
export const LuxuryImage: React.FC<LuxuryImageProps> = ({
  src,
  alt,
  className = '',
  containerClassName = '',
  aspectRatio = 'square',
  fit,
  hideWatermark = true,
  priority = false,
  useProcessed = true,
}) => {
  const [hasError, setHasError] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [record, setRecord] = useState<ProcessedImageRecord | undefined>(() =>
    imageQueueService.getRecord(src)
  );

  useEffect(() => {
    setHasError(false);
    setRecord(imageQueueService.getRecord(src));

    const unsubscribe = imageQueueService.subscribe((records) => {
      if (records[src]) {
        setRecord(records[src]);
      }
    });

    return () => unsubscribe();
  }, [src]);

  const aspectClass =
    aspectRatio === 'square'
      ? 'aspect-square'
      : aspectRatio === 'portrait'
      ? 'aspect-[3/4]'
      : aspectRatio === 'landscape'
      ? 'aspect-[4/3]'
      : 'h-full';

  // Prefer backend-cropped optimized image; gracefully fallback to untouched original if errored or unavailable
  const displaySrc =
    useProcessed && record?.processedUrl && !hasError
      ? record.processedUrl
      : src;

  const objectPosition = record?.cropBox
    ? 'center'
    : 'center';

  const resolvedFit: 'cover' | 'contain' =
    fit || (className.includes('object-contain') ? 'contain' : 'cover');
  const fitClass = resolvedFit === 'contain' ? 'object-contain object-center' : 'object-cover';

  const shouldMaskWatermark =
    hideWatermark && record?.cleanSourceStatus === 'needs_clean_source';

  return (
    <div
      className={`relative ${aspectClass} w-full overflow-hidden bg-[#F5EFEB] select-none ${containerClassName}`}
    >
      {/* Subtle Skeleton / Shimmer before load */}
      {!isLoaded && !hasError && (
        <div className="absolute inset-0 bg-gradient-to-r from-[#F5EFEB] via-[#EAE1D7] to-[#F5EFEB] animate-pulse" />
      )}

      <img
        src={hasError ? src : displaySrc}
        alt={alt}
        loading={priority ? 'eager' : 'lazy'}
        decoding="async"
        onLoad={() => setIsLoaded(true)}
        onError={() => {
          // Always fallback cleanly to untouched original source
          if (!hasError && displaySrc !== src) {
            setHasError(true);
          } else {
            setIsLoaded(true);
          }
        }}
        style={{
          objectFit: resolvedFit,
          objectPosition,
          imageRendering: 'auto',
        }}
        className={`w-full h-full ${fitClass} transition-opacity duration-500 ease-out ${
          isLoaded ? 'opacity-100' : 'opacity-0'
        } ${className}`}
      />

      {/* Non-destructive subtle corner shading only when source is flagged for clean replacement */}
      {shouldMaskWatermark && (
        <div
          className="absolute bottom-0 right-0 w-7 h-7 pointer-events-none"
          style={{
            background:
              'radial-gradient(circle at bottom right, rgba(26,18,11,0.18) 0%, transparent 72%)',
          }}
          aria-hidden="true"
        />
      )}
    </div>
  );
};
