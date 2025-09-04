-- Location: supabase/migrations/20250128161908_bungie_integration.sql
-- Schema Analysis: No existing schema detected - creating from scratch
-- Integration Type: Bungie.net OAuth integration with user profiles
-- Dependencies: Supabase auth.users table

-- 1. Create user_profiles table (intermediary for PostgREST compatibility)
CREATE TABLE public.user_profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id),
    email TEXT NOT NULL UNIQUE,
    full_name TEXT,
    avatar_url TEXT,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 2. Create bungie_connections table for OAuth tokens and profile data
CREATE TABLE public.bungie_connections (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    bungie_user_id TEXT NOT NULL,
    display_name TEXT NOT NULL,
    access_token TEXT NOT NULL,
    refresh_token TEXT NOT NULL,
    expires_at TIMESTAMPTZ NOT NULL,
    profile_data JSONB,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 3. Create destiny_memberships table for platform-specific data
CREATE TABLE public.destiny_memberships (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    bungie_connection_id UUID REFERENCES public.bungie_connections(id) ON DELETE CASCADE,
    membership_type INTEGER NOT NULL, -- 1=Xbox, 2=PSN, 3=Steam, etc.
    membership_id TEXT NOT NULL,
    display_name TEXT NOT NULL,
    is_primary BOOLEAN DEFAULT false,
    cross_save_override INTEGER,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 4. Create destiny_characters table for character data
CREATE TABLE public.destiny_characters (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    membership_id UUID REFERENCES public.destiny_memberships(id) ON DELETE CASCADE,
    character_id TEXT NOT NULL,
    class_type INTEGER NOT NULL, -- 0=Titan, 1=Hunter, 2=Warlock
    race_type INTEGER NOT NULL,
    gender_type INTEGER NOT NULL,
    power_level INTEGER,
    light_level INTEGER,
    emblem_path TEXT,
    emblem_background_path TEXT,
    character_data JSONB,
    last_played TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 5. Essential Indexes
CREATE INDEX idx_user_profiles_email ON public.user_profiles(email);
CREATE INDEX idx_bungie_connections_user_id ON public.bungie_connections(user_id);
CREATE INDEX idx_bungie_connections_bungie_user_id ON public.bungie_connections(bungie_user_id);
CREATE INDEX idx_bungie_connections_is_active ON public.bungie_connections(is_active);
CREATE INDEX idx_destiny_memberships_bungie_connection_id ON public.destiny_memberships(bungie_connection_id);
CREATE INDEX idx_destiny_memberships_membership_type ON public.destiny_memberships(membership_type);
CREATE INDEX idx_destiny_characters_membership_id ON public.destiny_characters(membership_id);
CREATE INDEX idx_destiny_characters_character_id ON public.destiny_characters(character_id);
CREATE INDEX idx_destiny_characters_class_type ON public.destiny_characters(class_type);

-- 6. Enable RLS on all tables
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bungie_connections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.destiny_memberships ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.destiny_characters ENABLE ROW LEVEL SECURITY;

-- 7. RLS Policies

-- Pattern 1: Core user table (user_profiles) - Simple only
CREATE POLICY "users_manage_own_user_profiles"
ON public.user_profiles
FOR ALL
TO authenticated
USING (id = auth.uid())
WITH CHECK (id = auth.uid());

-- Pattern 2: Simple user ownership for bungie_connections
CREATE POLICY "users_manage_own_bungie_connections"
ON public.bungie_connections
FOR ALL
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- Pattern 7: Complex relationship for destiny_memberships (via bungie_connections)
CREATE OR REPLACE FUNCTION public.can_access_destiny_membership(membership_uuid UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
SELECT EXISTS (
    SELECT 1 FROM public.bungie_connections bc
    JOIN public.destiny_memberships dm ON bc.id = dm.bungie_connection_id
    WHERE dm.id = membership_uuid 
    AND bc.user_id = auth.uid()
    AND bc.is_active = true
)
$$;

CREATE POLICY "users_access_own_destiny_memberships"
ON public.destiny_memberships
FOR ALL
TO authenticated
USING (public.can_access_destiny_membership(id))
WITH CHECK (public.can_access_destiny_membership(id));

-- Pattern 7: Complex relationship for destiny_characters (via memberships)
CREATE OR REPLACE FUNCTION public.can_access_destiny_character(character_uuid UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
SELECT EXISTS (
    SELECT 1 FROM public.bungie_connections bc
    JOIN public.destiny_memberships dm ON bc.id = dm.bungie_connection_id
    JOIN public.destiny_characters dc ON dm.id = dc.membership_id
    WHERE dc.id = character_uuid 
    AND bc.user_id = auth.uid()
    AND bc.is_active = true
)
$$;

CREATE POLICY "users_access_own_destiny_characters"
ON public.destiny_characters
FOR ALL
TO authenticated
USING (public.can_access_destiny_character(id))
WITH CHECK (public.can_access_destiny_character(id));

-- 8. Automatic user profile creation function
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
SECURITY DEFINER
LANGUAGE plpgsql
AS $$
BEGIN
  INSERT INTO public.user_profiles (id, email, full_name, avatar_url)
  VALUES (
    NEW.id, 
    NEW.email, 
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$;

-- 9. Trigger for new user creation
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 10. Mock Data for Development
DO $$
DECLARE
    test_user_id UUID := gen_random_uuid();
    bungie_conn_id UUID := gen_random_uuid();
    destiny_membership_id UUID := gen_random_uuid();
BEGIN
    -- Create test auth user
    INSERT INTO auth.users (
        id, instance_id, aud, role, email, encrypted_password, email_confirmed_at,
        created_at, updated_at, raw_user_meta_data, raw_app_meta_data,
        is_sso_user, is_anonymous, confirmation_token, confirmation_sent_at,
        recovery_token, recovery_sent_at, email_change_token_new, email_change,
        email_change_sent_at, email_change_token_current, email_change_confirm_status,
        reauthentication_token, reauthentication_sent_at, phone, phone_change,
        phone_change_token, phone_change_sent_at
    ) VALUES (
        test_user_id, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
        'guardian@example.com', crypt('testpassword', gen_salt('bf', 10)), now(), now(), now(),
        '{"full_name": "Test Guardian"}'::jsonb, '{"provider": "email", "providers": ["email"]}'::jsonb,
        false, false, '', null, '', null, '', '', null, '', 0, '', null, null, '', '', null
    );

    -- Create test bungie connection
    INSERT INTO public.bungie_connections (
        id, user_id, bungie_user_id, display_name, access_token, refresh_token, 
        expires_at, profile_data, is_active
    ) VALUES (
        bungie_conn_id, test_user_id, '12345678', 'TestGuardian#1234',
        'test_access_token', 'test_refresh_token', 
        now() + interval '1 hour',
        '{"membershipId": "12345678", "uniqueName": "TestGuardian#1234"}'::jsonb,
        true
    );

    -- Create test destiny membership
    INSERT INTO public.destiny_memberships (
        id, bungie_connection_id, membership_type, membership_id, 
        display_name, is_primary, cross_save_override
    ) VALUES (
        destiny_membership_id, bungie_conn_id, 3, '4611686018488888888',
        'TestGuardian', true, 3
    );

    -- Create test characters
    INSERT INTO public.destiny_characters (
        membership_id, character_id, class_type, race_type, gender_type,
        power_level, light_level, emblem_path, emblem_background_path,
        character_data, last_played
    ) VALUES 
    (
        destiny_membership_id, '2305843009504575555', 0, 0, 1, -- Titan
        1850, 1845, '/common/destiny2_content/icons/emblem1.jpg', 
        '/common/destiny2_content/icons/emblem1_bg.jpg',
        '{"stats": {"mobility": 50, "resilience": 100, "recovery": 60}}'::jsonb,
        now() - interval '2 hours'
    ),
    (
        destiny_membership_id, '2305843009504575556', 1, 1, 0, -- Hunter
        1840, 1835, '/common/destiny2_content/icons/emblem2.jpg',
        '/common/destiny2_content/icons/emblem2_bg.jpg',
        '{"stats": {"mobility": 100, "resilience": 40, "recovery": 80}}'::jsonb,
        now() - interval '1 day'
    ),
    (
        destiny_membership_id, '2305843009504575557', 2, 2, 1, -- Warlock
        1860, 1855, '/common/destiny2_content/icons/emblem3.jpg',
        '/common/destiny2_content/icons/emblem3_bg.jpg',
        '{"stats": {"mobility": 30, "resilience": 60, "recovery": 100}}'::jsonb,
        now() - interval '3 days'
    );

EXCEPTION
    WHEN unique_violation THEN
        RAISE NOTICE 'Test data already exists, skipping...';
    WHEN foreign_key_violation THEN
        RAISE NOTICE 'Foreign key error in test data: %', SQLERRM;
    WHEN OTHERS THEN
        RAISE NOTICE 'Error creating test data: %', SQLERRM;
END $$;