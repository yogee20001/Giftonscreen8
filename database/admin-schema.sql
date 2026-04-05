-- Admin System Schema
-- Stores allowed admin users in the database

-- ============================================
-- ADMINS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS admins (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL UNIQUE,
    role TEXT NOT NULL DEFAULT 'admin' CHECK (role IN ('admin', 'superadmin')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES auth.users(id)
);

-- Enable RLS on admins
ALTER TABLE admins ENABLE ROW LEVEL SECURITY;

-- Allow admins to read the admins table
CREATE POLICY "Allow admins to read admins list"
    ON admins
    FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM admins a WHERE a.user_id = auth.uid()
        )
    );

-- Only superadmins can insert/update/delete admins
CREATE POLICY "Only superadmins can manage admins"
    ON admins
    FOR ALL
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM admins a WHERE a.user_id = auth.uid() AND a.role = 'superadmin'
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM admins a WHERE a.user_id = auth.uid() AND a.role = 'superadmin'
        )
    );

-- Allow public to check if email is admin (for login validation)
CREATE POLICY "Allow public to check admin status by email"
    ON admins
    FOR SELECT
    TO anon
    USING (false); -- Disabled for security - use function instead

-- ============================================
-- FUNCTIONS
-- ============================================

-- Function to check if a user is an admin
CREATE OR REPLACE FUNCTION is_admin(user_uuid UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM admins WHERE user_id = user_uuid
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if an email is an admin email
CREATE OR REPLACE FUNCTION is_admin_email(email_address TEXT)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM admins WHERE email = email_address
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get admin role
CREATE OR REPLACE FUNCTION get_admin_role(user_uuid UUID)
RETURNS TEXT AS $$
BEGIN
    RETURN (
        SELECT role FROM admins WHERE user_id = user_uuid
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- INDEXES
-- ============================================
CREATE INDEX IF NOT EXISTS idx_admins_user_id ON admins(user_id);
CREATE INDEX IF NOT EXISTS idx_admins_email ON admins(email);

-- ============================================
-- INITIAL ADMIN SETUP
-- ============================================
-- Note: Run this after creating the admin user in Supabase Auth
-- Replace 'admin@giftonscreen.com' with the actual admin email
-- and the UUID with the actual user UUID from auth.users

-- INSERT INTO admins (user_id, email, role)
-- VALUES (
--     '00000000-0000-0000-0000-000000000000', -- Replace with actual user UUID
--     'admin@giftonscreen.com',
--     'superadmin'
-- )
-- ON CONFLICT (email) DO NOTHING;