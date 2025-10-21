import React from 'react';
import { Truck } from 'lucide-react';

const TruckLogo = ({ className = "h-12 w-12", showFull = false }) => {
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <div className="relative flex items-center justify-center bg-gray-200 rounded-full p-3">
        <Truck className="text-accent-500" size={32} strokeWidth={2.5} />
      </div>
      
      {showFull && (
        <div className="flex flex-col">
          <span className="text-2xl font-bold text-primary-600">
            TruckLogistics
          </span>
          <span className="text-xs text-gray-500 -mt-1">
            Premium Fleet Solutions
          </span>
        </div>
      )}
    </div>
  );
};

export default TruckLogo;
