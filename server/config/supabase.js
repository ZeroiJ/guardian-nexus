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