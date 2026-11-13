import React from 'react';

interface LogoSquareProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  showBorder?: boolean;
}

// User-supplied HD circular logo asset (852x852 circular PNG)
export const ORIGINAL_LOGO_PATH = '/assets/aistudio/cropped_circle_image__15__dc7fdd33.png';

const SIZE_CLASSES = {
  xs: 'w-9 h-9',
  sm: 'w-12 h-12 sm:w-14 sm:h-14',
  md: 'w-16 h-16 sm:w-20 sm:h-20',
  lg: 'w-24 h-24 sm:w-28 sm:h-28',
  xl: 'w-36 h-36 sm:w-44 sm:h-44',
};

/**
 * LogoSquare:
 * Renders the official SHRI JI JEWELS circular HD logo.
 * Precision-fitted edge-to-edge inside the circular presentation area
 * with zero awkward margins, 100% original proportions and crystal HD clarity.
 */
export const LogoSquare: React.FC<LogoSquareProps> = ({
  size = 'sm',
  className = '',
  showBorder = true,
}) => {
  return (
    <div
      className={`relative aspect-square shrink-0 rounded-full overflow-hidden flex items-center justify-center bg-transparent ${
        showBorder ? 'border border-[#C5A36A]/60 ring-1 ring-[#C5A36A]/30 shadow-xs' : ''
      } ${SIZE_CLASSES[size]} ${className}`}
      title="SHRI JI JEWELS — Divine By Tradition, Timeless By Trust"
    >
      <img
        src={ORIGINAL_LOGO_PATH}
        alt="SHRI JI JEWELS — Divine By Tradition, Timeless By Trust"
        className="w-full h-full object-contain object-center select-none block"
        loading="eager"
        decoding="async"
        style={{
          imageRendering: 'auto',
        }}
      />
    </div>
  );
};

export const LogoCircle = LogoSquare;
