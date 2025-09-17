// Utility for handling retry logic with exponential backoff
export const retryWithBackoff = async (
  fn, 
  maxRetries = 3, 
  baseDelay = 1000, 
  shouldRetry = null
) => {
  let lastError;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      
      // Don't retry on the last attempt
      if (attempt === maxRetries) {
        break;
      }
      
      // Check if we should retry this error
      if (shouldRetry && !shouldRetry(error)) {
        break;
      }
      
      // Default retry conditions for network and timeout errors
      const shouldRetryDefault = 
        error.code === 'NETWORK_ERROR' ||
        error.code === 'ECONNRESET' ||
        error.code === 'ECONNABORTED' ||
        error.message?.includes('timeout') ||
        error.message?.includes('Network error') ||
        (error.response?.status >= 500);
      
      if (!shouldRetryDefault) {
        break;
      }
      
      // Exponential backoff with jitter
      const delay = baseDelay * Math.pow(2, attempt) + Math.random() * 1000;
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  
  throw lastError;
};

// Specialized retry function for file uploads
export const retryFileUpload = async (uploadFunction, options = {}) => {
  const {
    maxRetries = 2,
    baseDelay = 2000,
    onRetry = () => {},
    onProgress = () => {}
  } = options;

  return retryWithBackoff(
    uploadFunction,
    maxRetries,
    baseDelay,
    (error) => {
      // Only retry on network errors, timeouts, or 5xx errors
      const shouldRetry = 
        error.message?.includes('Network error') ||
        error.message?.includes('timeout') ||
        error.code === 'ECONNRESET' ||
        error.code === 'ECONNABORTED' ||
        (error.response?.status >= 500);
      
      if (shouldRetry) {
        onRetry(error);
        return true;
      }
      
      return false;
    }
  );
};

// Enhanced error messages for different failure scenarios
export const getUploadErrorMessage = (error) => {
  if (error.message?.includes('timeout')) {
    return 'Upload timed out. This may be due to a slow connection or large files. Please try again with a faster connection.';
  }
  
  if (error.message?.includes('Network error')) {
    return 'Network connection failed. Please check your internet connection and try again.';
  }
  
  if (error.code === 'ECONNRESET' || error.code === 'ECONNABORTED') {
    return 'Connection was interrupted. Please check your network stability and try again.';
  }
  
  if (error.response?.status === 413) {
    return 'File is too large. Please reduce file size or try uploading fewer files at once.';
  }
  
  if (error.response?.status === 422) {
    return 'Invalid file format. Please check that your files meet the requirements and try again.';
  }
  
  if (error.response?.status >= 500) {
    return 'Server error occurred. Please try again in a few moments.';
  }
  
  // Return original error message if it's a validation or other known error
  return error.message || 'Upload failed. Please try again.';
};
