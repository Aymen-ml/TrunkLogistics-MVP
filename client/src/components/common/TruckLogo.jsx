import React from 'react';
import { Truck } from 'lucide-react';

const TruckLogo = ({ className = "h-12 w-12", showFull = false }) => {
  return (
    <div className="flex items-center gap-3">
      {/* Logo - Grey circle with orange truck icon */}
      <div className="flex-shrink-0 flex items-center justify-center bg-gray-100 dark:bg-gray-700 rounded-full p-2.5 ring-2 ring-gray-200 dark:ring-gray-600">
        <Truck className="text-accent-500 dark:text-accent-400" size={24} strokeWidth={2.5} />
      </div>
      
      {showFull && (
        <div className="flex flex-col">
          <span className="text-2xl font-bold text-primary-600 dark:text-primary-400">
            TruckLogistics
          </span>
          <span className="text-xs text-gray-500 dark:text-gray-400 -mt-1">
            Premium Fleet Solutions
          </span>
        </div>
      )}
    </div>
  );
};

export default TruckLogo;
