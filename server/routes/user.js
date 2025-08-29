import express from 'express';
import { 
  profileHelpers, 
  loadoutHelpers, 
  communityHelpers, 
  commentHelpers, 
  favoriteHelpers, 
  activityHelpers,
  destinyItemHelpers 
} from '../config/supabase.js';
import { requireAuth } from '../middleware/index.js';

const router = express.Router();

// Middleware to extract user profile from token
const getUserProfile = async (req, res, next) => {
  try {
    // In a real implementation, you'd decode the JWT token
    // For now, we'll use a placeholder
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ error: 'Authentication required' });
    }
    
    // TODO: Implement proper JWT token validation
    // For now, we'll extract bungie_id from request body or headers
    req.userProfile = {
      bungie_id: req.headers['x-bungie-id'] || req.body.bungie_id
    };
    
    if (req.userProfile.bungie_id) {
      const profiles = await profileHelpers.findByBungieId(req.userProfile.bungie_id);
      if (profiles && profiles.length > 0) {
        req.userProfile = profiles[0];
      }
    }
    
    next();
  } catch (error) {
    res.status(500).json({ error: 'Failed to authenticate user' });
  }
};

// GET /api/user/profile
router.get('/profile', getUserProfile, async (req, res) => {
  try {
    if (!req.userProfile || !req.userProfile.id) {
      return res.status(404).json({ error: 'User profile not found' });
    }
    
    // Log activity
    await activityHelpers.logActivity(req.userProfile.id, 'profile_view');
    
    res.json({
      success: true,
      profile: {
        id: req.userProfile.id,
        bungie_id: req.userProfile.bungie_id,
        display_name: req.userProfile.display_name,
        membership_type: req.userProfile.membership_type,
        membership_id: req.userProfile.membership_id,
        last_login: req.userProfile.last_login,
        created_at: req.userProfile.created_at
      }
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ error: 'Failed to retrieve profile' });
  }
});

// PUT /api/user/profile
router.put('/profile', getUserProfile, async (req, res) => {
  try {
    if (!req.userProfile || !req.userProfile.id) {
      return res.status(404).json({ error: 'User profile not found' });
    }
    
    const { display_name } = req.body;
    const updates = {};
    
    if (display_name) updates.display_name = display_name;
    
    const updatedProfile = await profileHelpers.createOrUpdateProfile({
      ...req.userProfile,
      ...updates
    });
    
    await activityHelpers.logActivity(req.userProfile.id, 'profile_update', updates);
    
    res.json({
      success: true,
      profile: updatedProfile
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

// GET /api/user/loadouts
router.get('/loadouts', getUserProfile, async (req, res) => {
  try {
    if (!req.userProfile || !req.userProfile.id) {
      return res.status(404).json({ error: 'User profile not found' });
    }
    
    const loadouts = await loadoutHelpers.getUserLoadouts(req.userProfile.id);
    
    res.json({
      success: true,
      loadouts
    });
  } catch (error) {
    console.error('Get loadouts error:', error);
    res.status(500).json({ error: 'Failed to retrieve loadouts' });
  }
});

// POST /api/user/loadouts
router.post('/loadouts', getUserProfile, async (req, res) => {
  try {
    if (!req.userProfile || !req.userProfile.id) {
      return res.status(404).json({ error: 'User profile not found' });
    }
    
    const loadoutData = req.body;
    
    // Validate required fields
    if (!loadoutData.loadout_name || loadoutData.character_class === undefined) {
      return res.status(400).json({ 
        error: 'Missing required fields: loadout_name, character_class' 
      });
    }
    
    const newLoadout = await loadoutHelpers.createLoadout(req.userProfile.id, loadoutData);
    
    await activityHelpers.logActivity(req.userProfile.id, 'loadout_create', {
      loadout_id: newLoadout.id,
      loadout_name: newLoadout.loadout_name
    });
    
    res.json({
      success: true,
      loadout: newLoadout
    });
  } catch (error) {
    console.error('Create loadout error:', error);
    res.status(500).json({ error: 'Failed to create loadout' });
  }
});

// PUT /api/user/loadouts/:id
router.put('/loadouts/:id', getUserProfile, async (req, res) => {
  try {
    if (!req.userProfile || !req.userProfile.id) {
      return res.status(404).json({ error: 'User profile not found' });
    }
    
    const { id } = req.params;
    const updates = req.body;
    
    const updatedLoadout = await loadoutHelpers.updateLoadout(id, updates);
    
    await activityHelpers.logActivity(req.userProfile.id, 'loadout_update', {
      loadout_id: id
    });
    
    res.json({
      success: true,
      loadout: updatedLoadout
    });
  } catch (error) {
    console.error('Update loadout error:', error);
    res.status(500).json({ error: 'Failed to update loadout' });
  }
});

// DELETE /api/user/loadouts/:id
router.delete('/loadouts/:id', getUserProfile, async (req, res) => {
  try {
    if (!req.userProfile || !req.userProfile.id) {
      return res.status(404).json({ error: 'User profile not found' });
    }
    
    const { id } = req.params;
    
    await loadoutHelpers.deleteLoadout(id);
    
    await activityHelpers.logActivity(req.userProfile.id, 'loadout_delete', {
      loadout_id: id
    });
    
    res.json({
      success: true,
      message: 'Loadout deleted successfully'
    });
  } catch (error) {
    console.error('Delete loadout error:', error);
    res.status(500).json({ error: 'Failed to delete loadout' });
  }
});

// GET /api/user/favorites
router.get('/favorites', getUserProfile, async (req, res) => {
  try {
    if (!req.userProfile || !req.userProfile.id) {
      return res.status(404).json({ error: 'User profile not found' });
    }
    
    const { type } = req.query;
    const favorites = await favoriteHelpers.getUserFavorites(req.userProfile.id, type);
    
    res.json({
      success: true,
      favorites
    });
  } catch (error) {
    console.error('Get favorites error:', error);
    res.status(500).json({ error: 'Failed to retrieve favorites' });
  }
});

// POST /api/user/favorites
router.post('/favorites', getUserProfile, async (req, res) => {
  try {
    if (!req.userProfile || !req.userProfile.id) {
      return res.status(404).json({ error: 'User profile not found' });
    }
    
    const { favorite_type, favorite_id } = req.body;
    
    if (!favorite_type || !favorite_id) {
      return res.status(400).json({ 
        error: 'Missing required fields: favorite_type, favorite_id' 
      });
    }
    
    const favorite = await favoriteHelpers.addFavorite(
      req.userProfile.id, 
      favorite_type, 
      favorite_id
    );
    
    await activityHelpers.logActivity(req.userProfile.id, 'favorite_add', {
      favorite_type,
      favorite_id
    });
    
    res.json({
      success: true,
      favorite
    });
  } catch (error) {
    console.error('Add favorite error:', error);
    res.status(500).json({ error: 'Failed to add favorite' });
  }
});

// DELETE /api/user/favorites
router.delete('/favorites', getUserProfile, async (req, res) => {
  try {
    if (!req.userProfile || !req.userProfile.id) {
      return res.status(404).json({ error: 'User profile not found' });
    }
    
    const { favorite_type, favorite_id } = req.body;
    
    await favoriteHelpers.removeFavorite(
      req.userProfile.id, 
      favorite_type, 
      favorite_id
    );
    
    await activityHelpers.logActivity(req.userProfile.id, 'favorite_remove', {
      favorite_type,
      favorite_id
    });
    
    res.json({
      success: true,
      message: 'Favorite removed successfully'
    });
  } catch (error) {
    console.error('Remove favorite error:', error);
    res.status(500).json({ error: 'Failed to remove favorite' });
  }
});

// GET /api/user/activity
router.get('/activity', getUserProfile, async (req, res) => {
  try {
    if (!req.userProfile || !req.userProfile.id) {
      return res.status(404).json({ error: 'User profile not found' });
    }
    
    const { limit = 50 } = req.query;
    const activity = await activityHelpers.getUserActivity(req.userProfile.id, parseInt(limit));
    
    res.json({
      success: true,
      activity: activity.data,
      pagination: activity.pagination
    });
  } catch (error) {
    console.error('Get activity error:', error);
    res.status(500).json({ error: 'Failed to retrieve activity' });
  }
});

// GET /api/user/stats
router.get('/stats', getUserProfile, async (req, res) => {
  try {
    if (!req.userProfile || !req.userProfile.id) {
      return res.status(404).json({ error: 'User profile not found' });
    }
    
    const stats = await activityHelpers.getActivityStats(req.userProfile.id);
    
    // Get additional stats
    const loadouts = await loadoutHelpers.getUserLoadouts(req.userProfile.id);
    const favorites = await favoriteHelpers.getUserFavorites(req.userProfile.id);
    
    res.json({
      success: true,
      stats: {
        ...stats,
        total_loadouts: loadouts.length,
        public_loadouts: loadouts.filter(l => l.is_public).length,
        total_favorites: favorites.length,
        member_since: req.userProfile.created_at
      }
    });
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({ error: 'Failed to retrieve stats' });
  }
});

export default router;