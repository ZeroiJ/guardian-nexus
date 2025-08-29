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

// Rate limiting configuration
const requestQueue = [];
const RATE_LIMIT = {
  requests: 25, // Max requests per window
  window: 10000, // 10 seconds
  lastReset: Date.now()
};

// Simple rate limiter
const rateLimiter = () => {
  const now = Date.now();
  
  // Reset window if needed
  if (now - RATE_LIMIT.lastReset >= RATE_LIMIT.window) {
    requestQueue.length = 0;
    RATE_LIMIT.lastReset = now;
  }
  
  // Check if we're over the limit
  if (requestQueue.length >= RATE_LIMIT.requests) {
    const oldestRequest = requestQueue[0];
    const timeToWait = RATE_LIMIT.window - (now - oldestRequest);
    
    if (timeToWait > 0) {
      throw new Error(`Rate limit exceeded. Try again in ${Math.ceil(timeToWait / 1000)} seconds.`);
    }
  }
  
  // Add current request to queue
  requestQueue.push(now);
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

// Request interceptor for rate limiting and logging
bungieAPI.interceptors.request.use(
  (config) => {
    try {
      rateLimiter();
      console.log(`Bungie API Request: ${config.method?.toUpperCase()} ${config.url}`);
      return config;
    } catch (error) {
      console.error('Rate limit error:', error.message);
      return Promise.reject(error);
    }
  },
  (error) => {
    console.error('Bungie API Request Error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor for error handling and data transformation
bungieAPI.interceptors.response.use(
  (response) => {
    // Check Bungie-specific error codes
    if (response.data && response.data.ErrorCode !== 1) {
      const error = new Error(response.data.Message || 'Bungie API error');
      error.bungieErrorCode = response.data.ErrorCode;
      error.response = response;
      throw error;
    }
    return response;
  },
  (error) => {
    // Enhanced error logging
    if (error.response) {
      console.error('Bungie API Response Error:', {
        status: error.response.status,
        statusText: error.response.statusText,
        data: error.response.data,
        url: error.config?.url
      });
    } else if (error.request) {
      console.error('Bungie API Request Failed:', error.message);
    } else {
      console.error('Bungie API Error:', error.message);
    }
    return Promise.reject(error);
  }
);

// Helper function to create authenticated requests
export const createAuthenticatedRequest = (accessToken) => {
  return axios.create({
    baseURL: BUNGIE_CONFIG.baseURL,
    headers: {
      'X-API-Key': BUNGIE_CONFIG.apiKey,
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    timeout: 10000,
  });
};

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

// Bungie component definitions for easier reference
export const BUNGIE_COMPONENTS = {
  // Profile components
  Profiles: 100,
  VendorReceipts: 101,
  ProfileInventories: 102,
  ProfileCurrencies: 103,
  ProfileProgression: 104,
  PlatformSilver: 105,
  
  // Character components
  Characters: 200,
  CharacterInventories: 201,
  CharacterProgressions: 202,
  CharacterRenderData: 203,
  CharacterActivities: 204,
  CharacterEquipment: 205,
  
  // Item components
  ItemInstances: 300,
  ItemObjectives: 301,
  ItemPerks: 302,
  ItemRenderData: 303,
  ItemStats: 304,
  ItemSockets: 305,
  ItemTalentGrids: 306,
  ItemCommonData: 307,
  ItemPlugStates: 308,
  ItemPlugObjectives: 309,
  ItemReusablePlugs: 310,
  
  // Vendor components
  Vendors: 400,
  VendorCategories: 401,
  VendorSales: 402,
};

// Helper to build component strings
export const buildComponentString = (components) => {
  if (Array.isArray(components)) {
    return components.join(',');
  }
  return components;
};