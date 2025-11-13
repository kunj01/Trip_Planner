import axios from 'axios';

// Base URL for the backend API
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

// Create axios instance with default config
const authApi = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests if available
authApi.interceptors.request.use(
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

// Handle response errors
authApi.interceptors.response.use(
  (response) => response,
  (error) => {
    // Only clear storage on auth errors, but don't redirect automatically
    // Let the AuthContext handle redirects
    if (error.response?.status === 401) {
      // Token expired or invalid - clear storage
      // Don't redirect here, let the component handle it
      if (!window.location.pathname.includes('/login') && !window.location.pathname.includes('/signup')) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
    }
    return Promise.reject(error);
  }
);

// Auth Service
export const authService = {
  // Sign up
  signup: async (userData) => {
    try {
      const response = await authApi.post('/auth/signup', userData);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'An error occurred during signup' };
    }
  },

  // Login
  login: async (email, password) => {
    try {
      const response = await authApi.post('/auth/login', { email, password });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'An error occurred during login' };
    }
  },

  // Get current user
  getCurrentUser: async () => {
    try {
      const response = await authApi.get('/auth/me');
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'An error occurred while fetching user' };
    }
  },

  // Logout (client-side only)
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },
};

export default authService;

