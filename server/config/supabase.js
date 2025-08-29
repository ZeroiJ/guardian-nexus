import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

// Supabase configuration
const supabaseConfig = {
  auth: {
    autoRefreshToken: true,
    persistSession: false, // Server-side doesn't need persistent sessions
    detectSessionInUrl: false
  },
  global: {
    headers: {
      'x-application-name': 'guardian-nexus-backend'
    }
  }
};

// Initialize Supabase client with service role for backend operations
export const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  supabaseConfig
);

// Initialize Supabase client with anon key for public operations
export const supabaseAnon = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY,
  supabaseConfig
);

// Database helper functions
export const dbHelpers = {
  // Generic CRUD operations
  async findById(table, id) {
    const { data, error } = await supabase
      .from(table)
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) throw error;
    return data;
  },

  async findByField(table, field, value) {
    const { data, error } = await supabase
      .from(table)
      .select('*')
      .eq(field, value);
    
    if (error) throw error;
    return data;
  },

  async create(table, data) {
    const { data: result, error } = await supabase
      .from(table)
      .insert(data)
      .select()
      .single();
    
    if (error) throw error;
    return result;
  },

  async update(table, id, data) {
    const { data: result, error } = await supabase
      .from(table)
      .update(data)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return result;
  },

  async delete(table, id) {
    const { error } = await supabase
      .from(table)
      .delete()
      .eq('id', id);
    
    if (error) throw error;
    return true;
  },

  // Pagination helper
  async paginate(table, { page = 1, limit = 10, orderBy = 'created_at', ascending = false, filters = {} }) {
    let query = supabase
      .from(table)
      .select('*', { count: 'exact' })
      .order(orderBy, { ascending })
      .range((page - 1) * limit, page * limit - 1);

    // Apply filters
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        query = query.eq(key, value);
      }
    });

    const { data, error, count } = await query;
    
    if (error) throw error;
    
    return {
      data,
      pagination: {
        page,
        limit,
        total: count,
        totalPages: Math.ceil(count / limit),
        hasNextPage: page * limit < count,
        hasPrevPage: page > 1
      }
    };
  }
};

// Profile-specific database operations
export const profileHelpers = {
  async findByBungieId(bungieId) {
    return dbHelpers.findByField('profiles', 'bungie_id', bungieId);
  },

  async createOrUpdateProfile(profileData) {
    const existingProfile = await this.findByBungieId(profileData.bungie_id);
    
    if (existingProfile && existingProfile.length > 0) {
      return dbHelpers.update('profiles', existingProfile[0].id, {
        ...profileData,
        updated_at: new Date().toISOString()
      });
    } else {
      return dbHelpers.create('profiles', profileData);
    }
  },

  async updateTokens(bungieId, tokenData) {
    const profiles = await this.findByBungieId(bungieId);
    if (!profiles || profiles.length === 0) {
      throw new Error('Profile not found');
    }

    return dbHelpers.update('profiles', profiles[0].id, {
      access_token: tokenData.access_token,
      refresh_token: tokenData.refresh_token,
      token_expires_at: new Date(Date.now() + (tokenData.expires_in * 1000)).toISOString(),
      last_login: new Date().toISOString()
    });
  },

  async clearTokens(userId) {
    return dbHelpers.update('profiles', userId, {
      access_token: null,
      refresh_token: null,
      token_expires_at: null
    });
  }
};

// Destiny Items database operations
export const destinyItemHelpers = {
  async cacheItem(itemData) {
    const existingItem = await dbHelpers.findByField('destiny_items', 'item_hash', itemData.item_hash);
    
    if (existingItem && existingItem.length > 0) {
      return dbHelpers.update('destiny_items', existingItem[0].id, {
        ...itemData,
        updated_at: new Date().toISOString()
      });
    } else {
      return dbHelpers.create('destiny_items', itemData);
    }
  },

  async getItemByHash(itemHash) {
    const items = await dbHelpers.findByField('destiny_items', 'item_hash', itemHash);
    return items && items.length > 0 ? items[0] : null;
  },

  async searchItems(filters = {}) {
    let query = supabase.from('destiny_items').select('*');
    
    if (filters.item_type) query = query.eq('item_type', filters.item_type);
    if (filters.tier_type) query = query.eq('tier_type', filters.tier_type);
    if (filters.class_type !== undefined) query = query.eq('class_type', filters.class_type);
    if (filters.search) query = query.ilike('item_name', `%${filters.search}%`);
    
    query = query.order('item_name', { ascending: true });
    
    const { data, error } = await query;
    if (error) throw error;
    return data;
  },

  async getPopularItems(limit = 50) {
    // Get items that are frequently used in loadouts
    const { data, error } = await supabase
      .from('destiny_items')
      .select('*')
      .order('tier_type', { ascending: false })
      .order('item_name', { ascending: true })
      .limit(limit);
    
    if (error) throw error;
    return data;
  }
};

// User Loadouts database operations
export const loadoutHelpers = {
  async createLoadout(profileId, loadoutData) {
    return dbHelpers.create('user_loadouts', {
      profile_id: profileId,
      ...loadoutData
    });
  },

  async getUserLoadouts(profileId, includePrivate = true) {
    let query = supabase
      .from('user_loadouts')
      .select('*')
      .eq('profile_id', profileId)
      .order('created_at', { ascending: false });
    
    if (!includePrivate) {
      query = query.eq('is_public', true);
    }
    
    const { data, error } = await query;
    if (error) throw error;
    return data;
  },

  async getPublicLoadouts(filters = {}, page = 1, limit = 20) {
    let query = supabase
      .from('user_loadouts')
      .select(`
        *,
        profile:profiles(display_name, bungie_id)
      `)
      .eq('is_public', true);
    
    if (filters.character_class !== undefined) {
      query = query.eq('character_class', filters.character_class);
    }
    if (filters.tags && filters.tags.length > 0) {
      query = query.contains('tags', filters.tags);
    }
    
    query = query
      .order('likes_count', { ascending: false })
      .order('created_at', { ascending: false })
      .range((page - 1) * limit, page * limit - 1);
    
    const { data, error } = await query;
    if (error) throw error;
    return data;
  },

  async likeLoadout(loadoutId) {
    const { data, error } = await supabase.rpc('increment_loadout_likes', {
      loadout_id: loadoutId
    });
    
    if (error) throw error;
    return data;
  },

  async updateLoadout(loadoutId, updates) {
    return dbHelpers.update('user_loadouts', loadoutId, updates);
  },

  async deleteLoadout(loadoutId) {
    return dbHelpers.delete('user_loadouts', loadoutId);
  }
};

// Community Posts database operations
export const communityHelpers = {
  async createPost(profileId, postData) {
    return dbHelpers.create('community_posts', {
      profile_id: profileId,
      ...postData
    });
  },

  async getPosts(filters = {}, page = 1, limit = 20) {
    let query = supabase
      .from('community_posts')
      .select(`
        *,
        profile:profiles(display_name, bungie_id),
        loadout:user_loadouts(*)
      `);
    
    if (filters.post_type) query = query.eq('post_type', filters.post_type);
    if (filters.featured) query = query.eq('is_featured', true);
    if (filters.tags && filters.tags.length > 0) {
      query = query.contains('tags', filters.tags);
    }
    
    query = query
      .eq('is_moderated', false)
      .order('upvotes', { ascending: false })
      .order('created_at', { ascending: false })
      .range((page - 1) * limit, page * limit - 1);
    
    const { data, error } = await query;
    if (error) throw error;
    return data;
  },

  async getPostById(postId) {
    const { data, error } = await supabase
      .from('community_posts')
      .select(`
        *,
        profile:profiles(display_name, bungie_id),
        loadout:user_loadouts(*)
      `)
      .eq('id', postId)
      .single();
    
    if (error) throw error;
    return data;
  },

  async upvotePost(postId) {
    const { data, error } = await supabase.rpc('increment_post_upvotes', {
      post_id: postId
    });
    
    if (error) throw error;
    return data;
  },

  async incrementViews(postId) {
    const { data, error } = await supabase.rpc('increment_post_views', {
      post_id: postId
    });
    
    if (error) throw error;
    return data;
  },

  async updatePost(postId, updates) {
    return dbHelpers.update('community_posts', postId, updates);
  },

  async deletePost(postId) {
    return dbHelpers.delete('community_posts', postId);
  }
};

// Comments database operations
export const commentHelpers = {
  async createComment(profileId, postId, content, parentCommentId = null) {
    return dbHelpers.create('comments', {
      profile_id: profileId,
      post_id: postId,
      content,
      parent_comment_id: parentCommentId
    });
  },

  async getPostComments(postId) {
    const { data, error } = await supabase
      .from('comments')
      .select(`
        *,
        profile:profiles(display_name, bungie_id)
      `)
      .eq('post_id', postId)
      .eq('is_moderated', false)
      .order('created_at', { ascending: true });
    
    if (error) throw error;
    return data;
  },

  async upvoteComment(commentId) {
    const { data, error } = await supabase.rpc('increment_comment_upvotes', {
      comment_id: commentId
    });
    
    if (error) throw error;
    return data;
  },

  async updateComment(commentId, updates) {
    return dbHelpers.update('comments', commentId, updates);
  },

  async deleteComment(commentId) {
    return dbHelpers.delete('comments', commentId);
  }
};

// User Favorites database operations
export const favoriteHelpers = {
  async addFavorite(profileId, favoriteType, favoriteId) {
    return dbHelpers.create('user_favorites', {
      profile_id: profileId,
      favorite_type: favoriteType,
      favorite_id: favoriteId
    });
  },

  async removeFavorite(profileId, favoriteType, favoriteId) {
    const { error } = await supabase
      .from('user_favorites')
      .delete()
      .eq('profile_id', profileId)
      .eq('favorite_type', favoriteType)
      .eq('favorite_id', favoriteId);
    
    if (error) throw error;
    return true;
  },

  async getUserFavorites(profileId, favoriteType = null) {
    let query = supabase
      .from('user_favorites')
      .select('*')
      .eq('profile_id', profileId)
      .order('created_at', { ascending: false });
    
    if (favoriteType) {
      query = query.eq('favorite_type', favoriteType);
    }
    
    const { data, error } = await query;
    if (error) throw error;
    return data;
  },

  async isFavorite(profileId, favoriteType, favoriteId) {
    const { data, error } = await supabase
      .from('user_favorites')
      .select('id')
      .eq('profile_id', profileId)
      .eq('favorite_type', favoriteType)
      .eq('favorite_id', favoriteId)
      .single();
    
    return !error && data;
  }
};

// User Activity tracking
export const activityHelpers = {
  async logActivity(profileId, activityType, activityData = {}) {
    return dbHelpers.create('user_activity', {
      profile_id: profileId,
      activity_type: activityType,
      activity_data: activityData
    });
  },

  async getUserActivity(profileId, limit = 50) {
    return dbHelpers.paginate('user_activity', {
      page: 1,
      limit,
      orderBy: 'created_at',
      ascending: false,
      filters: { profile_id: profileId }
    });
  },

  async getActivityStats(profileId) {
    const { data, error } = await supabase
      .from('user_activity')
      .select('activity_type')
      .eq('profile_id', profileId);
    
    if (error) throw error;
    
    // Count activities by type
    const stats = data.reduce((acc, activity) => {
      acc[activity.activity_type] = (acc[activity.activity_type] || 0) + 1;
      return acc;
    }, {});
    
    return stats;
  }
};

// Connection health check and diagnostics
export const testSupabaseConnection = async () => {
  try {
    console.log('🔍 Testing Supabase connection...');
    
    // Test basic connectivity
    const { data, error } = await supabase.from('profiles').select('count').limit(1);
    
    if (error) {
      console.error('❌ Supabase connection failed:', error.message);
      return false;
    }
    
    // Test database schema
    const { data: tables, error: schemaError } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public');
    
    if (schemaError) {
      console.warn('⚠️ Schema check failed (this is normal if tables don\'t exist yet):', schemaError.message);
    } else {
      console.log('📋 Available tables:', tables?.map(t => t.table_name) || []);
    }
    
    console.log('✅ Supabase connection successful');
    return true;
  } catch (error) {
    console.error('❌ Supabase connection test error:', error.message);
    return false;
  }
};

// Database migration helper
export const runMigrations = async () => {
  try {
    console.log('🔧 Checking database migrations...');
    
    // Check if profiles table exists
    const { data: profilesTable } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public')
      .eq('table_name', 'profiles');
    
    if (!profilesTable || profilesTable.length === 0) {
      console.log('⚠️ Profiles table not found. Please run the migration:');
      console.log('1. Go to your Supabase dashboard');
      console.log('2. Navigate to SQL Editor');
      console.log('3. Run the migration file: supabase/migrations/20250829000000_simple_profiles.sql');
      return false;
    }
    
    console.log('✅ Database schema is up to date');
    return true;
  } catch (error) {
    console.error('❌ Migration check failed:', error.message);
    return false;
  }
};

// Export configuration for use in other modules
export const supabaseConfigExport = {
  url: process.env.SUPABASE_URL,
  anonKey: process.env.SUPABASE_ANON_KEY,
  serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY
};