-- Destiny 2 Game Data and Community Features Schema
-- This extends the simple profiles table with comprehensive game data storage

-- Create destiny_items table for storing game items
CREATE TABLE IF NOT EXISTS public.destiny_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    item_hash BIGINT UNIQUE NOT NULL,
    item_type INTEGER NOT NULL,
    item_sub_type INTEGER,
    item_name TEXT NOT NULL,
    item_description TEXT,
    tier_type INTEGER, -- 1=Basic, 2=Common, 3=Rare, 4=Legendary, 5=Exotic
    class_type INTEGER, -- 0=Titan, 1=Hunter, 2=Warlock, 3=Any
    icon_path TEXT,
    screenshot_path TEXT,
    item_data JSONB,
    stats JSONB,
    perks JSONB,
    sockets JSONB,
    is_cached BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Create user_loadouts table for storing custom builds
CREATE TABLE IF NOT EXISTS public.user_loadouts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    profile_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    loadout_name TEXT NOT NULL,
    character_class INTEGER NOT NULL, -- 0=Titan, 1=Hunter, 2=Warlock
    subclass_hash BIGINT,
    kinetic_weapon_hash BIGINT,
    energy_weapon_hash BIGINT,
    power_weapon_hash BIGINT,
    helmet_hash BIGINT,
    gauntlets_hash BIGINT,
    chest_armor_hash BIGINT,
    leg_armor_hash BIGINT,
    class_item_hash BIGINT,
    mods JSONB,
    stats_distribution JSONB,
    notes TEXT,
    is_public BOOLEAN DEFAULT false,
    tags TEXT[],
    likes_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Create community_posts table for user-generated content
CREATE TABLE IF NOT EXISTS public.community_posts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    profile_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    post_type TEXT NOT NULL CHECK (post_type IN ('build', 'guide', 'discussion', 'showcase')),
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    loadout_id UUID REFERENCES public.user_loadouts(id) ON DELETE SET NULL,
    tags TEXT[],
    upvotes INTEGER DEFAULT 0,
    downvotes INTEGER DEFAULT 0,
    views_count INTEGER DEFAULT 0,
    is_featured BOOLEAN DEFAULT false,
    is_moderated BOOLEAN DEFAULT false,
    moderation_reason TEXT,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Create comments table for post interactions
CREATE TABLE IF NOT EXISTS public.comments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    post_id UUID REFERENCES public.community_posts(id) ON DELETE CASCADE,
    profile_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    parent_comment_id UUID REFERENCES public.comments(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    upvotes INTEGER DEFAULT 0,
    downvotes INTEGER DEFAULT 0,
    is_moderated BOOLEAN DEFAULT false,
    moderation_reason TEXT,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Create user_favorites table for saved content
CREATE TABLE IF NOT EXISTS public.user_favorites (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    profile_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    favorite_type TEXT NOT NULL CHECK (favorite_type IN ('loadout', 'post', 'item')),
    favorite_id UUID NOT NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(profile_id, favorite_type, favorite_id)
);

-- Create user_activity table for tracking engagement
CREATE TABLE IF NOT EXISTS public.user_activity (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    profile_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    activity_type TEXT NOT NULL,
    activity_data JSONB,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Performance indexes
CREATE INDEX IF NOT EXISTS idx_destiny_items_hash ON public.destiny_items(item_hash);
CREATE INDEX IF NOT EXISTS idx_destiny_items_type ON public.destiny_items(item_type);
CREATE INDEX IF NOT EXISTS idx_destiny_items_tier ON public.destiny_items(tier_type);
CREATE INDEX IF NOT EXISTS idx_destiny_items_class ON public.destiny_items(class_type);

CREATE INDEX IF NOT EXISTS idx_user_loadouts_profile ON public.user_loadouts(profile_id);
CREATE INDEX IF NOT EXISTS idx_user_loadouts_class ON public.user_loadouts(character_class);
CREATE INDEX IF NOT EXISTS idx_user_loadouts_public ON public.user_loadouts(is_public);
CREATE INDEX IF NOT EXISTS idx_user_loadouts_created ON public.user_loadouts(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_community_posts_profile ON public.community_posts(profile_id);
CREATE INDEX IF NOT EXISTS idx_community_posts_type ON public.community_posts(post_type);
CREATE INDEX IF NOT EXISTS idx_community_posts_featured ON public.community_posts(is_featured);
CREATE INDEX IF NOT EXISTS idx_community_posts_created ON public.community_posts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_community_posts_upvotes ON public.community_posts(upvotes DESC);

CREATE INDEX IF NOT EXISTS idx_comments_post ON public.comments(post_id);
CREATE INDEX IF NOT EXISTS idx_comments_profile ON public.comments(profile_id);
CREATE INDEX IF NOT EXISTS idx_comments_parent ON public.comments(parent_comment_id);

CREATE INDEX IF NOT EXISTS idx_user_favorites_profile ON public.user_favorites(profile_id);
CREATE INDEX IF NOT EXISTS idx_user_favorites_type ON public.user_favorites(favorite_type);

CREATE INDEX IF NOT EXISTS idx_user_activity_profile ON public.user_activity(profile_id);
CREATE INDEX IF NOT EXISTS idx_user_activity_type ON public.user_activity(activity_type);
CREATE INDEX IF NOT EXISTS idx_user_activity_created ON public.user_activity(created_at DESC);

-- Enable RLS on all tables
ALTER TABLE public.destiny_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_loadouts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.community_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_activity ENABLE ROW LEVEL SECURITY;

-- RLS Policies

-- Destiny items are public (read-only for most users)
CREATE POLICY "destiny_items_read_all" ON public.destiny_items FOR SELECT TO public USING (true);
CREATE POLICY "destiny_items_insert_authenticated" ON public.destiny_items FOR INSERT TO public WITH CHECK (true);
CREATE POLICY "destiny_items_update_authenticated" ON public.destiny_items FOR UPDATE TO public USING (true);

-- User loadouts - users can manage their own, public ones are readable by all
CREATE POLICY "user_loadouts_own_all" ON public.user_loadouts 
FOR ALL TO public USING (
    profile_id IN (SELECT id FROM public.profiles WHERE bungie_id = current_setting('app.current_user_bungie_id', true))
);
CREATE POLICY "user_loadouts_read_public" ON public.user_loadouts 
FOR SELECT TO public USING (is_public = true);

-- Community posts - users can manage their own, all can read public posts
CREATE POLICY "community_posts_own_all" ON public.community_posts 
FOR ALL TO public USING (
    profile_id IN (SELECT id FROM public.profiles WHERE bungie_id = current_setting('app.current_user_bungie_id', true))
);
CREATE POLICY "community_posts_read_all" ON public.community_posts FOR SELECT TO public USING (true);

-- Comments - users can manage their own, all can read
CREATE POLICY "comments_own_all" ON public.comments 
FOR ALL TO public USING (
    profile_id IN (SELECT id FROM public.profiles WHERE bungie_id = current_setting('app.current_user_bungie_id', true))
);
CREATE POLICY "comments_read_all" ON public.comments FOR SELECT TO public USING (true);

-- User favorites - users can only access their own
CREATE POLICY "user_favorites_own_all" ON public.user_favorites 
FOR ALL TO public USING (
    profile_id IN (SELECT id FROM public.profiles WHERE bungie_id = current_setting('app.current_user_bungie_id', true))
);

-- User activity - users can only access their own
CREATE POLICY "user_activity_own_all" ON public.user_activity 
FOR ALL TO public USING (
    profile_id IN (SELECT id FROM public.profiles WHERE bungie_id = current_setting('app.current_user_bungie_id', true))
);

-- Functions for updating timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for updated_at
CREATE TRIGGER update_destiny_items_updated_at BEFORE UPDATE ON public.destiny_items FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_user_loadouts_updated_at BEFORE UPDATE ON public.user_loadouts FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_community_posts_updated_at BEFORE UPDATE ON public.community_posts FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_comments_updated_at BEFORE UPDATE ON public.comments FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();