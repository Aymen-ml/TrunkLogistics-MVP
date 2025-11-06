import React from 'react';

const TruckLogo = ({ className = "h-20 w-20", showFull = false, variant = "default" }) => {
  // Styling variants for different contexts
  const textStyles = {
    default: {
      fontSize: '38px',
      lineHeight: '80px',
      color: '#2C3E50',
      fontFamily: 'Nunito, Quicksand, Comfortaa, Varela Round, sans-serif'
    },
    footer: {
      fontSize: '20px',
      lineHeight: 'normal',
      color: '#FFFFFF',
      fontFamily: 'Nunito, Quicksand, Comfortaa, Varela Round, sans-serif'
    }
  };

  const gapClass = variant === 'footer' ? 'gap-2' : 'gap-0.5';
  const currentTextStyle = textStyles[variant] || textStyles.default;

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
        <span className="font-extrabold" style={currentTextStyle}>
          movelinker
        </span>
      )}
    </div>
  );
};

export default TruckLogo;
