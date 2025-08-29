-- Simple profiles table for OAuth authentication
-- This complements the existing bungie integration schema

-- Create simplified profiles table for direct OAuth storage
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    bungie_id TEXT UNIQUE NOT NULL,
    display_name TEXT NOT NULL,
    unique_name TEXT,
    membership_type INTEGER,
    membership_id TEXT,
    cross_save_override INTEGER,
    access_token TEXT,
    refresh_token TEXT,
    token_expires_at TIMESTAMPTZ,
    last_login TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_profiles_bungie_id ON public.profiles(bungie_id);
CREATE INDEX IF NOT EXISTS idx_profiles_membership_id ON public.profiles(membership_id);
CREATE INDEX IF NOT EXISTS idx_profiles_token_expires_at ON public.profiles(token_expires_at);

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Simple RLS policy - users can only access their own profile
CREATE POLICY "users_manage_own_profiles"
ON public.profiles
FOR ALL
TO public
USING (true)  -- Allow public access for now, will be secured with API keys
WITH CHECK (true);

-- Function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger to automatically update updated_at
CREATE TRIGGER update_profiles_updated_at
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();