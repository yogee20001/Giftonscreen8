-- GiftOnScreen Database Schema
-- Run this in Supabase SQL Editor

-- ============================================
-- TEMPLATES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS templates (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    thumbnail_url TEXT,
    category TEXT,
    is_premium BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    github_path TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on templates
ALTER TABLE templates ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to read templates
CREATE POLICY "Allow authenticated users to read templates"
    ON templates
    FOR SELECT
    TO authenticated
    USING (true);

-- ============================================
-- GIFTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS gifts (
    id TEXT PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    template_id TEXT NOT NULL REFERENCES templates(id),
    status TEXT NOT NULL CHECK (status IN ('inactive', 'active')),
    data JSONB NOT NULL DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL
);

-- Enable RLS on gifts
ALTER TABLE gifts ENABLE ROW LEVEL SECURITY;

-- Allow users to insert only their own gifts
CREATE POLICY "Allow users to insert their own gifts"
    ON gifts
    FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = user_id);

-- Allow users to select only their own gifts
CREATE POLICY "Allow users to read their own gifts"
    ON gifts
    FOR SELECT
    TO authenticated
    USING (auth.uid() = user_id);

-- Allow users to update only their own gifts
CREATE POLICY "Allow users to update their own gifts"
    ON gifts
    FOR UPDATE
    TO authenticated
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Allow users to delete only their own gifts
CREATE POLICY "Allow users to delete their own gifts"
    ON gifts
    FOR DELETE
    TO authenticated
    USING (auth.uid() = user_id);

-- ============================================
-- ACTIVATION REQUESTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS activation_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    gift_id TEXT NOT NULL REFERENCES gifts(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    message TEXT,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processed')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on activation_requests
ALTER TABLE activation_requests ENABLE ROW LEVEL SECURITY;

-- Allow users to insert only their own activation requests
CREATE POLICY "Allow users to insert their own activation requests"
    ON activation_requests
    FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = user_id);

-- Allow users to read only their own activation requests
CREATE POLICY "Allow users to read their own activation requests"
    ON activation_requests
    FOR SELECT
    TO authenticated
    USING (auth.uid() = user_id);

-- ============================================
-- INDEXES
-- ============================================
CREATE INDEX IF NOT EXISTS idx_gifts_user_id ON gifts(user_id);
CREATE INDEX IF NOT EXISTS idx_gifts_template_id ON gifts(template_id);
CREATE INDEX IF NOT EXISTS idx_gifts_status ON gifts(status);
CREATE INDEX IF NOT EXISTS idx_activation_requests_user_id ON activation_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_activation_requests_gift_id ON activation_requests(gift_id);
CREATE INDEX IF NOT EXISTS idx_templates_category ON templates(category);
CREATE INDEX IF NOT EXISTS idx_templates_is_active ON templates(is_active);

-- ============================================
-- SAMPLE DATA (Optional - for testing)
-- ============================================
-- Uncomment to insert sample template
-- INSERT INTO templates (id, name, description, thumbnail_url, category, github_path)
-- VALUES (
--     'birthday-v1',
--     'Birthday Celebration',
--     'A beautiful birthday template with balloons and confetti',
--     'https://example.com/birthday-thumb.jpg',
--     'birthday',
--     'templates/birthday/v1/index.html'
-- ) ON CONFLICT (id) DO NOTHING;
