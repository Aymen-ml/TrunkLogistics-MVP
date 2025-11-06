import React from 'react';

const TruckLogo = ({ className = "h-20 w-20", showFull = false, variant = "default" }) => {
  // Styling variants for different contexts - now using Tailwind classes for dark mode support
  const textClasses = {
    default: 'text-[38px] leading-[80px] text-gray-800 dark:text-gray-100',
    footer: 'text-[20px] leading-normal text-white'
  };

  const gapClass = variant === 'footer' ? 'gap-2' : 'gap-0.5';
  const currentTextClass = textClasses[variant] || textClasses.default;

  return (
    <div className={`flex items-center ${gapClass}`}>
      {/* Logo - movelinker Logo */}
      <div className="flex-shrink-0 flex items-center justify-center">
        <img 
          src="/move-logo2.png" 
          alt="movelinker Logo" 
          className={className}
          style={{ objectFit: 'contain' }}
        />
      </div>
      
      {showFull && (
        <span 
          className={`font-extrabold ${currentTextClass}`}
          style={{ fontFamily: 'Nunito, Quicksand, Comfortaa, Varela Round, sans-serif' }}
        >
          movelinker
        </span>
      )}
    </div>
  );
};

export default TruckLogo;
