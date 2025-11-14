import axios from 'axios';

// Base URL for the backend API
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

// Create axios instance with default config
const bucketListApi = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests if available
bucketListApi.interceptors.request.use(
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

// Bucket List API Service
export const bucketListService = {
  // Get user's bucket list items
  getBucketList: async (completed = null) => {
    try {
      const params = completed !== null ? { completed: completed.toString() } : {};
      const response = await bucketListApi.get('/bucketlist', { params });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'An error occurred while fetching bucket list' };
    }
  },

  // Add item to bucket list
  addItem: async (itemData) => {
    try {
      const response = await bucketListApi.post('/bucketlist', itemData);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'An error occurred while adding item to bucket list' };
    }
  },

  // Update bucket list item
  updateItem: async (itemId, itemData) => {
    try {
      const response = await bucketListApi.put(`/bucketlist/${itemId}`, itemData);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'An error occurred while updating bucket list item' };
    }
  },

  // Delete bucket list item
  deleteItem: async (itemId) => {
    try {
      const response = await bucketListApi.delete(`/bucketlist/${itemId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'An error occurred while deleting bucket list item' };
    }
  },
};

export default bucketListService;

