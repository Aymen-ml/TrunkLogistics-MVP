import { useCallback } from 'react';
import { useToast } from '../contexts/ToastContext';

export const useErrorHandler = () => {
  const { showError, showWarning } = useToast();

  const handleError = useCallback((error, customMessage = null) => {
    console.error('Error caught by error handler:', error);

    let message = customMessage;
    
    if (!message) {
      if (error.response?.data?.error) {
        message = error.response.data.error;
      } else if (error.message) {
        message = error.message;
      } else {
        message = 'An unexpected error occurred';
      }
    }

    // Show different toast types based on error status
    if (error.response?.status === 429) {
      showWarning(message);
    } else {
      showError(message);
    }

    return message;
  }, [showError, showWarning]);

  const handleAsyncError = useCallback((asyncFn, customMessage = null) => {
    return async (...args) => {
      try {
        return await asyncFn(...args);
      } catch (error) {
        handleError(error, customMessage);
        throw error;
      }
    };
  }, [handleError]);

  return {
    handleError,
    handleAsyncError
  };
};

export default useErrorHandler;
