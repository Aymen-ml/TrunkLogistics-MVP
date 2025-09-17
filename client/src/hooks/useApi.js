import { useState, useCallback } from 'react';
import { api } from '../utils/apiClient';
import { useErrorHandler } from './useErrorHandler';
import { useToast } from '../contexts/ToastContext';

export const useApi = () => {
  const [loading, setLoading] = useState(false);
  const { handleError } = useErrorHandler();
  const { showSuccess } = useToast();

  const execute = useCallback(async (apiCall, options = {}) => {
    const { 
      showSuccessMessage = false, 
      successMessage = 'Operation completed successfully',
      errorMessage = null,
      onSuccess = null,
      onError = null
    } = options;

    try {
      setLoading(true);
      const response = await apiCall();
      
      if (showSuccessMessage) {
        showSuccess(successMessage);
      }
      
      if (onSuccess) {
        onSuccess(response.data);
      }
      
      return response.data;
    } catch (error) {
      const message = handleError(error, errorMessage);
      
      if (onError) {
        onError(error, message);
      }
      
      throw error;
    } finally {
      setLoading(false);
    }
  }, [handleError, showSuccess]);

  return {
    loading,
    execute
  };
};

export default useApi;
