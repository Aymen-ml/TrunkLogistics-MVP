import axios from 'axios';

// Safely get environment variable with fallback for browser
const getEnv = (key, defaultValue) => {
  if (typeof process !== 'undefined' && process.env && process.env[key]) {
    return process.env[key];
  }
  return import.meta.env?.[`VITE_${key}`] || defaultValue;
};

// Create axios instance with default config
const apiClient = axios.create({
  baseURL: getEnv('API_URL', 'http://localhost:5000/api'),
  timeout: 120000, // 2 minutes for file uploads
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request interceptor to add auth token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Handle common errors
    if (error.response) {
      const { status, data } = error.response;
      
      // Handle authentication errors
      if (status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
        // Create custom error but preserve response for debugging
        const authError = new Error('Session expired. Please log in again.');
        authError.response = error.response;
        return Promise.reject(authError);
      }
      
      // Handle authorization errors
      if (status === 403) {
        const authzError = new Error('You do not have permission to perform this action.');
        authzError.response = error.response;
        return Promise.reject(authzError);
      }
      
      // For validation errors and other 400 errors, preserve the original error
      // This allows the calling code to access error.response.data.details
      if (status === 400) {
        // Keep the original axios error structure intact
        return Promise.reject(error);
      }
      
      // Handle rate limiting
      if (status === 429) {
        const rateLimitError = new Error('Too many requests. Please try again later.');
        rateLimitError.response = error.response;
        return Promise.reject(rateLimitError);
      }
      
      // Handle server errors
      if (status >= 500) {
        const serverError = new Error('Server error. Please try again later.');
        serverError.response = error.response;
        return Promise.reject(serverError);
      }
      
      // For other client errors, preserve the original error
      return Promise.reject(error);
    }
    
    // Handle network errors
    if (error.request) {
      const networkError = new Error('Network error. Please check your connection.');
      networkError.request = error.request;
      return Promise.reject(networkError);
    }
    
    // Handle other errors
    return Promise.reject(error);
  }
);

// API methods
const api = {
  // Authentication
  auth: {
    login: (credentials) => apiClient.post('/auth/login', credentials),
    register: (userData) => apiClient.post('/auth/register', userData),
    logout: () => apiClient.post('/auth/logout'),
    getProfile: () => apiClient.get('/auth/profile'),
    updateProfile: (data) => apiClient.put('/auth/profile', data)
  },

  // Users
  users: {
    getAll: (params) => apiClient.get('/users', { params }),
    getById: (id) => apiClient.get(`/users/${id}`),
    update: (id, data) => apiClient.put(`/users/${id}`, data),
    toggleStatus: (id) => apiClient.patch(`/users/${id}/status`),
    verifyProvider: (id, data) => apiClient.patch(`/users/${id}/verify`, data)
  },

  // Trucks
  trucks: {
    getAll: (params) => apiClient.get('/trucks', { params }),
    search: (params) => apiClient.get('/trucks/search', { params }),
    getById: (id) => apiClient.get(`/trucks/${id}`),
    create: (data) => apiClient.post('/trucks', data, {
      headers: { 'Content-Type': 'multipart/form-data' },
      timeout: 180000 // 3 minutes for file uploads
    }),
    update: (id, data) => apiClient.put(`/trucks/${id}`, data),
    remove: (id) => apiClient.delete(`/trucks/${id}`)
  },

  // Truck Documents
  truckDocuments: {
    getDocuments: (truckId) => apiClient.get(`/truck-documents/${truckId}`),
    uploadDocument: (truckId, formData) => apiClient.post(`/truck-documents/${truckId}/upload`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      timeout: 180000 // 3 minutes for file uploads
    }),
    updateDocuments: (truckId, formData) => apiClient.put(`/truck-documents/${truckId}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      timeout: 180000 // 3 minutes for file uploads
    }),
    updateImages: (truckId, formData) => apiClient.put(`/truck-documents/${truckId}/images`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      timeout: 180000 // 3 minutes for file uploads
    }),
    removeDocument: (documentId) => apiClient.delete(`/truck-documents/${documentId}`)
  },

  // Bookings
  bookings: {
    getAll: (params) => apiClient.get('/bookings', { params }),
    getById: (id) => apiClient.get(`/bookings/${id}`),
    create: (data) => apiClient.post('/bookings', data),
    update: (id, data) => apiClient.put(`/bookings/${id}`, data),
    updateStatus: (id, status) => apiClient.patch(`/bookings/${id}/status`, { status }),
    remove: (id) => apiClient.delete(`/bookings/${id}`)
  },

  // Documents
  documents: {
    upload: (formData) => apiClient.post('/documents/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    }),
    getByEntity: (entityType, entityId) => apiClient.get(`/documents/${entityType}/${entityId}`),
    getById: (id) => apiClient.get(`/documents/file/${id}`),
    verify: (id, data) => apiClient.patch(`/documents/${id}/verify`, data),
    remove: (id) => apiClient.delete(`/documents/${id}`),
    download: (id) => apiClient.get(`/documents/${id}/download`, { responseType: 'blob' }),
    getPending: () => apiClient.get('/documents/pending'),
    getStats: () => apiClient.get('/documents/stats')
  },

  // Notifications
  notifications: {
    getAll: (params) => apiClient.get('/notifications', { params }),
    markAsRead: (id) => apiClient.patch(`/notifications/${id}/read`),
    markAllAsRead: () => apiClient.patch('/notifications/read-all'),
    remove: (id) => apiClient.delete(`/notifications/${id}`),
    getStats: () => apiClient.get('/notifications/stats')
  }
};

// Add the API methods to the axios instance
Object.assign(apiClient, api);

// Export both the structured API and the raw axios client
export { apiClient };
export default api;
