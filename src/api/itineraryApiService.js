import axios from 'axios';

// Base URL for the backend API
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

// Create axios instance with default config
const itineraryApi = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests if available
itineraryApi.interceptors.request.use(
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

// Itinerary API Service
export const itineraryApiService = {
  // Get sample itineraries (public)
  getSampleItineraries: async () => {
    try {
      const response = await itineraryApi.get('/itineraries/samples');
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'An error occurred while fetching sample itineraries' };
    }
  },

  // Get user's saved itineraries
  getUserItineraries: async () => {
    try {
      const response = await itineraryApi.get('/itineraries');
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'An error occurred while fetching your itineraries' };
    }
  },

  // Save/bookmark an itinerary
  saveItinerary: async (itineraryData) => {
    try {
      const response = await itineraryApi.post('/itineraries', itineraryData);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'An error occurred while saving the itinerary' };
    }
  },

  // Delete a saved itinerary
  deleteItinerary: async (itineraryId) => {
    try {
      const response = await itineraryApi.delete(`/itineraries/${itineraryId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'An error occurred while deleting the itinerary' };
    }
  },

  // Get a specific itinerary
  getItinerary: async (itineraryId) => {
    try {
      const response = await itineraryApi.get(`/itineraries/${itineraryId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'An error occurred while fetching the itinerary' };
    }
  },

  // Alias for getItinerary
  getItineraryById: async (itineraryId) => {
    return itineraryApiService.getItinerary(itineraryId);
  },
};

export default itineraryApiService;

