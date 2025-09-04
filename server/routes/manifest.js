const express = require('express');
const axios = require('axios');
const fs = require('fs').promises;
const path = require('path');
const router = express.Router();

// Bungie API configuration
const BUNGIE_CONFIG = {
  apiKey: process.env.BUNGIE_API_KEY,
  baseURL: 'https://www.bungie.net/Platform'
};

// Cache directory for manifest files
const CACHE_DIR = path.join(__dirname, '../cache/manifest');
const MANIFEST_CACHE_FILE = path.join(CACHE_DIR, 'manifest_info.json');
const MANIFEST_EXPIRY_HOURS = 24; // Cache manifest for 24 hours

// Ensure cache directory exists
const ensureCacheDir = async () => {
  try {
    await fs.mkdir(CACHE_DIR, { recursive: true });
  } catch (error) {
    console.error('Failed to create cache directory:', error);
  }
};

// Initialize cache directory
ensureCacheDir();

// Axios instance for Bungie API
const bungieAPI = axios.create({
  baseURL: BUNGIE_CONFIG.baseURL,
  headers: {
    'X-API-Key': BUNGIE_CONFIG.apiKey,
    'Content-Type': 'application/json'
  },
  timeout: 30000 // 30 second timeout for manifest downloads
});

// Middleware to validate API key
const validateApiKey = (req, res, next) => {
  if (!BUNGIE_CONFIG.apiKey) {
    return res.status(500).json({
      error: 'Server configuration error',
      message: 'Bungie API key not configured'
    });
  }
  next();
};

// Check if cached manifest is still valid
const isCacheValid = async () => {
  try {
    const cacheInfo = await fs.readFile(MANIFEST_CACHE_FILE, 'utf8');
    const { timestamp, version } = JSON.parse(cacheInfo);
    
    const cacheAge = Date.now() - new Date(timestamp).getTime();
    const maxAge = MANIFEST_EXPIRY_HOURS * 60 * 60 * 1000;
    
    return cacheAge < maxAge;
  } catch (error) {
    return false;
  }
};

// Get current manifest version from Bungie
const getCurrentManifestVersion = async () => {
  try {
    const response = await bungieAPI.get('/Destiny2/Manifest/');
    
    if (response.data.ErrorCode !== 1) {
      throw new Error(`Bungie API error: ${response.data.Message}`);
    }
    
    return response.data.Response;
  } catch (error) {
    console.error('Failed to get manifest version:', error);
    throw error;
  }
};

// Download and cache manifest data
const downloadManifest = async (manifestInfo) => {
  try {
    const { jsonWorldContentPaths } = manifestInfo;
    const englishPath = jsonWorldContentPaths.en;
    
    if (!englishPath) {
      throw new Error('English manifest path not found');
    }
    
    console.log('Downloading Destiny 2 manifest...');
    const manifestUrl = `https://www.bungie.net${englishPath}`;
    
    const response = await axios.get(manifestUrl, {
      timeout: 60000, // 60 second timeout for large manifest
      responseType: 'json'
    });
    
    // Save manifest data to cache
    const manifestFile = path.join(CACHE_DIR, 'manifest_data.json');
    await fs.writeFile(manifestFile, JSON.stringify(response.data, null, 2));
    
    // Save cache info
    const cacheInfo = {
      timestamp: new Date().toISOString(),
      version: manifestInfo.version,
      path: englishPath,
      size: JSON.stringify(response.data).length
    };
    
    await fs.writeFile(MANIFEST_CACHE_FILE, JSON.stringify(cacheInfo, null, 2));
    
    console.log('Manifest downloaded and cached successfully');
    return response.data;
  } catch (error) {
    console.error('Failed to download manifest:', error);
    throw error;
  }
};

// Get cached manifest data
const getCachedManifest = async () => {
  try {
    const manifestFile = path.join(CACHE_DIR, 'manifest_data.json');
    const data = await fs.readFile(manifestFile, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    return null;
  }
};

// Get manifest info endpoint
router.get('/info', validateApiKey, async (req, res) => {
  try {
    const manifestInfo = await getCurrentManifestVersion();
    
    // Check if we have cached info
    let cacheInfo = null;
    try {
      const cacheData = await fs.readFile(MANIFEST_CACHE_FILE, 'utf8');
      cacheInfo = JSON.parse(cacheData);
    } catch (error) {
      // No cache info available
    }
    
    res.json({
      current: {
        version: manifestInfo.version,
        lastUpdated: manifestInfo.jsonWorldContentPaths?.en ? new Date().toISOString() : null
      },
      cached: cacheInfo ? {
        version: cacheInfo.version,
        timestamp: cacheInfo.timestamp,
        isValid: await isCacheValid()
      } : null
    });
  } catch (error) {
    console.error('Get manifest info error:', error);
    res.status(500).json({
      error: 'Server Error',
      message: 'Failed to get manifest information'
    });
  }
});

// Get full manifest data
router.get('/data', validateApiKey, async (req, res) => {
  try {
    let manifestData = null;
    
    // Check if cache is valid
    if (await isCacheValid()) {
      manifestData = await getCachedManifest();
    }
    
    // If no valid cache, download fresh manifest
    if (!manifestData) {
      const manifestInfo = await getCurrentManifestVersion();
      manifestData = await downloadManifest(manifestInfo);
    }
    
    if (!manifestData) {
      return res.status(500).json({
        error: 'Server Error',
        message: 'Failed to retrieve manifest data'
      });
    }
    
    res.json(manifestData);
  } catch (error) {
    console.error('Get manifest data error:', error);
    res.status(500).json({
      error: 'Server Error',
      message: 'Failed to get manifest data'
    });
  }
});

// Get specific manifest table
router.get('/table/:tableName', validateApiKey, async (req, res) => {
  try {
    const { tableName } = req.params;
    
    let manifestData = null;
    
    // Check if cache is valid
    if (await isCacheValid()) {
      manifestData = await getCachedManifest();
    }
    
    // If no valid cache, download fresh manifest
    if (!manifestData) {
      const manifestInfo = await getCurrentManifestVersion();
      manifestData = await downloadManifest(manifestInfo);
    }
    
    if (!manifestData || !manifestData[tableName]) {
      return res.status(404).json({
        error: 'Not Found',
        message: `Manifest table '${tableName}' not found`
      });
    }
    
    res.json(manifestData[tableName]);
  } catch (error) {
    console.error('Get manifest table error:', error);
    res.status(500).json({
      error: 'Server Error',
      message: 'Failed to get manifest table'
    });
  }
});

// Get specific item definition
router.get('/definition/:tableName/:hash', validateApiKey, async (req, res) => {
  try {
    const { tableName, hash } = req.params;
    
    let manifestData = null;
    
    // Check if cache is valid
    if (await isCacheValid()) {
      manifestData = await getCachedManifest();
    }
    
    // If no valid cache, download fresh manifest
    if (!manifestData) {
      const manifestInfo = await getCurrentManifestVersion();
      manifestData = await downloadManifest(manifestInfo);
    }
    
    if (!manifestData || !manifestData[tableName]) {
      return res.status(404).json({
        error: 'Not Found',
        message: `Manifest table '${tableName}' not found`
      });
    }
    
    const definition = manifestData[tableName][hash];
    if (!definition) {
      return res.status(404).json({
        error: 'Not Found',
        message: `Definition with hash '${hash}' not found in table '${tableName}'`
      });
    }
    
    res.json(definition);
  } catch (error) {
    console.error('Get definition error:', error);
    res.status(500).json({
      error: 'Server Error',
      message: 'Failed to get definition'
    });
  }
});

// Force refresh manifest cache
router.post('/refresh', validateApiKey, async (req, res) => {
  try {
    console.log('Force refreshing manifest cache...');
    
    const manifestInfo = await getCurrentManifestVersion();
    const manifestData = await downloadManifest(manifestInfo);
    
    res.json({
      success: true,
      message: 'Manifest cache refreshed successfully',
      version: manifestInfo.version,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Refresh manifest error:', error);
    res.status(500).json({
      error: 'Server Error',
      message: 'Failed to refresh manifest cache'
    });
  }
});

// Clear manifest cache
router.delete('/cache', validateApiKey, async (req, res) => {
  try {
    const manifestFile = path.join(CACHE_DIR, 'manifest_data.json');
    
    try {
      await fs.unlink(manifestFile);
      await fs.unlink(MANIFEST_CACHE_FILE);
    } catch (error) {
      // Files might not exist, which is fine
    }
    
    res.json({
      success: true,
      message: 'Manifest cache cleared successfully'
    });
  } catch (error) {
    console.error('Clear cache error:', error);
    res.status(500).json({
      error: 'Server Error',
      message: 'Failed to clear manifest cache'
    });
  }
});

module.exports = router;