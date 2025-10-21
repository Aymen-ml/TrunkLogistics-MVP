import React from 'react';

/**
 * TruckLogistics Logo Component
 * Professional B2B logo showing connection between companies
 * Colors: Navy Blue (#1E3A8A) and Orange (#F97316)
 */
const TruckLogo = ({ className = "h-8 w-8", showFull = false }) => {
  if (showFull) {
    // Full logo with connection visualization
    return (
      <svg 
        xmlns="http://www.w3.org/2000/svg" 
        viewBox="0 0 200 60" 
        className={className}
        aria-label="TruckLogistics Logo"
      >
        {/* Left building icon (Client company) */}
        <g transform="translate(10, 20)">
          <rect x="0" y="5" width="15" height="20" rx="1" fill="#1E3A8A" opacity="0.2"/>
          <rect x="2" y="7" width="11" height="3" fill="#1E3A8A" opacity="0.6"/>
          <rect x="2" y="12" width="4" height="4" fill="#1E3A8A"/>
          <rect x="9" y="12" width="4" height="4" fill="#1E3A8A"/>
          <rect x="2" y="18" width="4" height="4" fill="#1E3A8A"/>
          <rect x="9" y="18" width="4" height="4" fill="#1E3A8A"/>
        </g>

        {/* Connection line with arrows */}
        <line x1="30" y1="30" x2="75" y2="30" stroke="#F97316" strokeWidth="2" strokeDasharray="4,2"/>
        <polygon points="73,28 78,30 73,32" fill="#F97316"/>
        <polygon points="32,28 27,30 32,32" fill="#F97316"/>

        {/* Central truck icon */}
        <g transform="translate(55, 30)">
          <rect x="-10" y="-6" width="14" height="8" rx="1" fill="#F97316"/>
          <rect x="-11" y="-7" width="5" height="9" rx="0.5" fill="#F97316"/>
          <rect x="-10" y="-5" width="2" height="3" rx="0.3" fill="white" opacity="0.9"/>
          <circle cx="-8" cy="3" r="2" fill="#1E3A8A"/>
          <circle cx="-8" cy="3" r="1" fill="#E5E7EB"/>
          <circle cx="-1" cy="3" r="2" fill="#1E3A8A"/>
          <circle cx="-1" cy="3" r="1" fill="#E5E7EB"/>
          <rect x="-7" y="-5" width="1" height="7" fill="white" opacity="0.2"/>
          <rect x="-3" y="-5" width="1" height="7" fill="white" opacity="0.2"/>
        </g>

        {/* Right building icon (Logistics company) */}
        <g transform="translate(85, 20)">
          <rect x="0" y="5" width="15" height="20" rx="1" fill="#1E3A8A" opacity="0.2"/>
          <rect x="2" y="7" width="11" height="3" fill="#1E3A8A" opacity="0.6"/>
          <rect x="2" y="12" width="4" height="4" fill="#1E3A8A"/>
          <rect x="9" y="12" width="4" height="4" fill="#1E3A8A"/>
          <rect x="2" y="18" width="4" height="4" fill="#1E3A8A"/>
          <rect x="9" y="18" width="4" height="4" fill="#1E3A8A"/>
        </g>

        {/* Text: TruckLogistics */}
        <text x="115" y="35" fontFamily="Arial, sans-serif" fontSize="18" fontWeight="700" fill="#1E3A8A">
          TruckLogistics
        </text>
      </svg>
    );
  }

  // Simple truck icon for navbar/compact view
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      viewBox="0 0 40 40" 
      className={className}
      aria-label="TruckLogistics Icon"
    >
      {/* Background circle */}
      <circle cx="20" cy="20" r="18" fill="#1E3A8A" opacity="0.1"/>
      
      {/* Connection dots */}
      <circle cx="8" cy="20" r="2.5" fill="#F97316" opacity="0.6"/>
      <circle cx="32" cy="20" r="2.5" fill="#F97316" opacity="0.6"/>
      
      {/* Connection line */}
      <line x1="11" y1="20" x2="29" y2="20" stroke="#F97316" strokeWidth="1.5" strokeDasharray="3,2"/>
      
      {/* Central truck */}
      <g transform="translate(20, 20)">
        <rect x="-7" y="-4" width="10" height="6" rx="1" fill="#1E3A8A"/>
        <rect x="-8" y="-5" width="4" height="7" rx="0.5" fill="#1E3A8A"/>
        <rect x="-7" y="-3" width="2" height="2" rx="0.3" fill="white" opacity="0.8"/>
        <circle cx="-5" cy="3" r="1.5" fill="#F97316"/>
        <circle cx="-1" cy="3" r="1.5" fill="#F97316"/>
        <rect x="-5" y="-3" width="0.8" height="5" fill="white" opacity="0.2"/>
        <rect x="-2" y="-3" width="0.8" height="5" fill="white" opacity="0.2"/>
      </g>
    </svg>
  );
};

export default TruckLogo;
