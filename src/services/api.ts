import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    console.log('🌐 API REQUEST ===');
    console.log('🌐 URL:', config.url);
    console.log('🌐 Method:', config.method);
    console.log('🌐 Token available:', !!token);
    console.log('🌐 Token preview:', token ? `${token.substring(0, 20)}...` : 'none');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log('🌐 Authorization header set');
    } else {
      console.log('🌐 No token found - no Authorization header');
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => {
    console.log('✅ API RESPONSE SUCCESS:', response.status, response.config.url);
    return response;
  },
  (error) => {
    console.log('❌ API RESPONSE ERROR ===');
    console.log('❌ Status:', error.response?.status);
    console.log('❌ URL:', error.config?.url);
    console.log('❌ Error message:', error.response?.data?.message);
    console.log('❌ Full error:', error.response?.data);
    
    // Create a more user-friendly error message
    let errorMessage = 'An unexpected error occurred';
    
    if (error.response?.data?.message) {
      errorMessage = error.response.data.message;
    } else if (error.response?.status === 401) {
      errorMessage = 'Invalid email or password';
    } else if (error.response?.status === 404) {
      errorMessage = 'Service not found';
    } else if (error.response?.status === 500) {
      errorMessage = 'Server error. Please try again later';
    } else if (error.code === 'NETWORK_ERROR' || error.code === 'ECONNABORTED') {
      errorMessage = 'Network error. Please check your connection';
    }
    
    // Create a custom error with the user-friendly message
    const customError = new Error(errorMessage);
    (customError as any).originalError = error;
    (customError as any).status = error.response?.status;
    
    // Only redirect to login for 401 errors on protected routes
    // Don't redirect for public routes or auth endpoints
    if (error.response?.status === 401 && 
        !error.config?.url?.includes('/auth/login') && 
        !error.config?.url?.includes('/auth/register') &&
        !error.config?.url?.includes('/auth/me')) {
      console.log('❌ 401 Unauthorized - clearing token and redirecting');
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      // Only redirect if we're not already on a public page
      const currentPath = window.location.pathname;
      const publicPaths = ['/', '/browse', '/exhibitions', '/virtual-exhibitions', '/artists', '/login', '/register'];
      if (!publicPaths.includes(currentPath) && !currentPath.startsWith('/artwork/') && !currentPath.startsWith('/artists/') && !currentPath.startsWith('/exhibitions/')) {
        window.location.href = '/login';
      }
    }
    
    return Promise.reject(customError);
  }
);

export default api;