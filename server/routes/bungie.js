import express from 'express';
import { bungieAPI } from '../config/bungie.js';

const router = express.Router();

// GET /api/bungie/manifest
router.get('/manifest', async (req, res) => {
  try {
    const response = await bungieAPI.get('/Destiny2/Manifest/');
    res.json({
      success: true,
      data: response.data
    });
  } catch (error) {
    console.error('Bungie manifest error:', error.response?.data || error.message);
    res.status(500).json({ 
      error: 'Failed to fetch Destiny 2 manifest',
      details: error.response?.data || error.message
    });
  }
});

// GET /api/bungie/profile/:membershipType/:membershipId
router.get('/profile/:membershipType/:membershipId', async (req, res) => {
  try {
    const { membershipType, membershipId } = req.params;
    const { components } = req.query; // Optional components parameter
    
    const componentsParam = components || '100,102,103,200,201,202,300,301,302,303,304,305,306,307,308,309,310';
    
    const response = await bungieAPI.get(
      `/Destiny2/${membershipType}/Profile/${membershipId}/?components=${componentsParam}`
    );
    
    res.json({
      success: true,
      data: response.data
    });
  } catch (error) {
    console.error('Bungie profile error:', error.response?.data || error.message);
    res.status(error.response?.status || 500).json({ 
      error: 'Failed to fetch user profile',
      details: error.response?.data || error.message
    });
  }
});

// GET /api/bungie/search/:displayName
router.get('/search/:displayName', async (req, res) => {
  try {
    const { displayName } = req.params;
    const { membershipType } = req.query; // Optional membership type filter
    
    const response = await bungieAPI.post('/Destiny2/SearchDestinyPlayer/All/', {
      displayName: displayName
    });
    
    res.json({
      success: true,
      data: response.data
    });
  } catch (error) {
    console.error('Bungie search error:', error.response?.data || error.message);
    res.status(error.response?.status || 500).json({ 
      error: 'Failed to search for player',
      details: error.response?.data || error.message
    });
  }
});

// GET /api/bungie/character/:membershipType/:membershipId/:characterId
router.get('/character/:membershipType/:membershipId/:characterId', async (req, res) => {
  try {
    const { membershipType, membershipId, characterId } = req.params;
    const { components } = req.query;
    
    const componentsParam = components || '200,201,202,203,204,205,300,301,302,303,304,305,306,307,308,309,310';
    
    const response = await bungieAPI.get(
      `/Destiny2/${membershipType}/Profile/${membershipId}/Character/${characterId}/?components=${componentsParam}`
    );
    
    res.json({
      success: true,
      data: response.data
    });
  } catch (error) {
    console.error('Bungie character error:', error.response?.data || error.message);
    res.status(error.response?.status || 500).json({ 
      error: 'Failed to fetch character data',
      details: error.response?.data || error.message
    });
  }
});

// GET /api/bungie/item/:itemHash
router.get('/item/:itemHash', async (req, res) => {
  try {
    const { itemHash } = req.params;
    
    const response = await bungieAPI.get(`/Destiny2/Manifest/DestinyInventoryItemDefinition/${itemHash}/`);
    
    res.json({
      success: true,
      data: response.data
    });
  } catch (error) {
    console.error('Bungie item error:', error.response?.data || error.message);
    res.status(error.response?.status || 500).json({ 
      error: 'Failed to fetch item definition',
      details: error.response?.data || error.message
    });
  }
});

// GET /api/bungie/vendors/:membershipType/:membershipId/:characterId
router.get('/vendors/:membershipType/:membershipId/:characterId', async (req, res) => {
  try {
    const { membershipType, membershipId, characterId } = req.params;
    const { components } = req.query;
    
    const componentsParam = components || '400,401,402';
    
    const response = await bungieAPI.get(
      `/Destiny2/${membershipType}/Profile/${membershipId}/Character/${characterId}/Vendors/?components=${componentsParam}`
    );
    
    res.json({
      success: true,
      data: response.data
    });
  } catch (error) {
    console.error('Bungie vendors error:', error.response?.data || error.message);
    res.status(error.response?.status || 500).json({ 
      error: 'Failed to fetch vendor data',
      details: error.response?.data || error.message
    });
  }
});

// GET /api/bungie/milestones
router.get('/milestones', async (req, res) => {
  try {
    const response = await bungieAPI.get('/Destiny2/Milestones/');
    
    res.json({
      success: true,
      data: response.data
    });
  } catch (error) {
    console.error('Bungie milestones error:', error.response?.data || error.message);
    res.status(error.response?.status || 500).json({ 
      error: 'Failed to fetch milestones',
      details: error.response?.data || error.message
    });
  }
});

export default router;