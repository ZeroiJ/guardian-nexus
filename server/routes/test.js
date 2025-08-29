import express from 'express';
import { 
  testSupabaseConnection, 
  runMigrations, 
  profileHelpers, 
  destinyItemHelpers,
  loadoutHelpers,
  communityHelpers,
  commentHelpers,
  favoriteHelpers,
  activityHelpers 
} from '../config/supabase.js';

const router = express.Router();

// GET /api/test/connection
router.get('/connection', async (req, res) => {
  try {
    const isConnected = await testSupabaseConnection();
    const migrationsOk = await runMigrations();
    
    res.json({
      success: true,
      supabase: {
        connected: isConnected,
        migrations: migrationsOk
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Database connection test error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// GET /api/test/database
router.get('/database', async (req, res) => {
  try {
    const results = {
      tests: [],
      success: true,
      errors: []
    };
    
    // Test 1: Create a test profile
    try {
      const testProfile = await profileHelpers.createOrUpdateProfile({
        bungie_id: 'test_' + Date.now(),
        display_name: 'Test Guardian',
        membership_type: 3,
        membership_id: '12345678901234567890'
      });
      results.tests.push({ test: 'create_profile', status: 'passed', data: testProfile });
    } catch (error) {
      results.tests.push({ test: 'create_profile', status: 'failed', error: error.message });
      results.errors.push('Profile creation failed');
    }
    
    // Test 2: Cache a test item
    try {
      const testItem = await destinyItemHelpers.cacheItem({
        item_hash: 123456789,
        item_name: 'Test Weapon',
        item_type: 'Weapon',
        tier_type: 6,
        class_type: 3,
        item_data: { stats: { impact: 80, range: 60 } }
      });
      results.tests.push({ test: 'cache_item', status: 'passed', data: testItem });
    } catch (error) {
      results.tests.push({ test: 'cache_item', status: 'failed', error: error.message });
      results.errors.push('Item caching failed');
    }
    
    // Test 3: Search items
    try {
      const items = await destinyItemHelpers.searchItems({ item_type: 'Weapon' });
      results.tests.push({ test: 'search_items', status: 'passed', count: items.length });
    } catch (error) {
      results.tests.push({ test: 'search_items', status: 'failed', error: error.message });
      results.errors.push('Item search failed');
    }
    
    // Set overall success status
    results.success = results.errors.length === 0;
    
    res.json(results);
  } catch (error) {
    console.error('Database test error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// POST /api/test/sample-data
router.post('/sample-data', async (req, res) => {
  try {
    const results = {
      created: [],
      errors: []
    };
    
    // Create sample profile
    const sampleProfile = await profileHelpers.createOrUpdateProfile({
      bungie_id: 'sample_guardian_' + Date.now(),
      display_name: 'Sample Guardian',
      membership_type: 3,
      membership_id: '1234567890123456789'
    });
    results.created.push({ type: 'profile', id: sampleProfile.id });
    
    // Create sample loadout
    const sampleLoadout = await loadoutHelpers.createLoadout(sampleProfile.id, {
      loadout_name: 'Sample PvP Build',
      character_class: 1, // Hunter
      description: 'A sample loadout for testing',
      loadout_data: {
        weapons: {
          kinetic: { itemHash: 1234567890, name: 'Test Kinetic' },
          energy: { itemHash: 1234567891, name: 'Test Energy' },
          power: { itemHash: 1234567892, name: 'Test Power' }
        },
        armor: {
          helmet: { itemHash: 1234567893, name: 'Test Helmet' },
          gauntlets: { itemHash: 1234567894, name: 'Test Gauntlets' },
          chest: { itemHash: 1234567895, name: 'Test Chest' },
          legs: { itemHash: 1234567896, name: 'Test Legs' },
          classItem: { itemHash: 1234567897, name: 'Test Class Item' }
        }
      },
      tags: ['pvp', 'hunter', 'sample'],
      is_public: true
    });
    results.created.push({ type: 'loadout', id: sampleLoadout.id });
    
    // Create sample community post
    const samplePost = await communityHelpers.createPost(sampleProfile.id, {
      title: 'Sample Build Guide',
      content: 'This is a sample post for testing the community features.',
      post_type: 'build',
      loadout_id: sampleLoadout.id,
      tags: ['guide', 'pvp', 'hunter']
    });
    results.created.push({ type: 'post', id: samplePost.id });
    
    // Create sample comment
    const sampleComment = await commentHelpers.createComment(
      sampleProfile.id,
      samplePost.id,
      'Great build! Thanks for sharing.'
    );
    results.created.push({ type: 'comment', id: sampleComment.id });
    
    // Log activity
    await activityHelpers.logActivity(sampleProfile.id, 'sample_data_created', {
      items_created: results.created.length
    });
    
    res.json({
      success: true,
      message: 'Sample data created successfully',
      data: results
    });
  } catch (error) {
    console.error('Sample data creation error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// GET /api/test/stats
router.get('/stats', async (req, res) => {
  try {
    const { supabase } = await import('../config/supabase.js');
    
    // Get table counts
    const tables = ['profiles', 'destiny_items', 'user_loadouts', 'community_posts', 'comments', 'user_favorites', 'user_activity'];
    const stats = {};
    
    for (const table of tables) {
      try {
        const { count, error } = await supabase
          .from(table)
          .select('*', { count: 'exact', head: true });
        
        if (error) {
          stats[table] = { error: error.message };
        } else {
          stats[table] = { count };
        }
      } catch (error) {
        stats[table] = { error: error.message };
      }
    }
    
    res.json({
      success: true,
      database_stats: stats,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Stats error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

export default router;