import { useEffect } from 'react';

/**
 * Custom hook to set the page title dynamically
 * @param {string} title - The title to set for the page
 * @param {string} suffix - Optional suffix (defaults to "TruckLogistics")
 */
export const usePageTitle = (title, suffix = 'TruckLogistics') => {
  useEffect(() => {
    const previousTitle = document.title;
    document.title = title ? `${title} | ${suffix}` : suffix;
    
    return () => {
      document.title = previousTitle;
    };
  }, [title, suffix]);
};

export default usePageTitle;
