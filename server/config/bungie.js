import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

// Bungie API configuration
export const BUNGIE_CONFIG = {
  baseURL: 'https://www.bungie.net/Platform',
  apiKey: process.env.BUNGIE_API_KEY,
  clientId: process.env.BUNGIE_CLIENT_ID,
  clientSecret: process.env.BUNGIE_CLIENT_SECRET,
  authURL: 'https://www.bungie.net/en/oauth/authorize',
  tokenURL: 'https://www.bungie.net/platform/app/oauth/token/',
};

// Create axios instance for Bungie API
export const bungieAPI = axios.create({
  baseURL: BUNGIE_CONFIG.baseURL,
  headers: {
    'X-API-Key': BUNGIE_CONFIG.apiKey,
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10 second timeout
});

// Request interceptor for logging
bungieAPI.interceptors.request.use(
  (config) => {
    console.log(`Bungie API Request: ${config.method?.toUpperCase()} ${config.url}`);
    return config;
  },
  (error) => {
    console.error('Bungie API Request Error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
bungieAPI.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    console.error('Bungie API Response Error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

// Test Bungie API connection
export const testBungieConnection = async () => {
  try {
    const response = await bungieAPI.get('/Destiny2/Manifest/');
    if (response.data.ErrorCode === 1) {
      console.log('✅ Bungie API connection successful');
      return true;
    }
    console.warn('Bungie API connection test failed:', response.data.Message);
    return false;
  } catch (error) {
    console.warn('Bungie API connection test error:', error.message);
    return false;
  }
};