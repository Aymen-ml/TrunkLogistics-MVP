import { useEffect } from 'react';

/**
 * Custom hook to set the page title dynamically
 * @param {string} title - The title to set for the page
 * @param {string} suffix - Optional suffix (defaults to "TrunkLogistics")
 */
export const usePageTitle = (title, suffix = 'TrunkLogistics') => {
  useEffect(() => {
    const previousTitle = document.title;
    document.title = title ? `${title} | ${suffix}` : suffix;
    
    return () => {
      document.title = previousTitle;
    };
  }, [title, suffix]);
};

export default usePageTitle;
