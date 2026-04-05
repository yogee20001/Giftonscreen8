-- ============================================
-- ADMIN & SUPERADMIN SETUP GUIDE
-- GiftOnScreen Admin Role Management
-- ============================================

/*
OVERVIEW:
=========
This system uses Supabase app_metadata to manage admin roles.
Two role levels exist:
1. ADMIN - Can manage activation requests and gifts
2. SUPERADMIN - Full control including user management

IMPORTANT:
- app_metadata is server-only and cannot be edited by users
- raw_app_meta_data stores JSON with role information
- Changes require SQL execution or Supabase Dashboard access
*/

-- ============================================
-- OPTION 1: Create New Admin User with SQL
-- ============================================

-- Step 1: Create the user (password will need to be set via Dashboard or password reset)
-- Note: You cannot set passwords directly via SQL for security reasons

-- First, create the user via Supabase Dashboard:
-- 1. Go to: https://supabase.com/dashboard/project/znkptkfipmqjotmikflt/auth/users
-- 2. Click "Add User"
-- 3. Enter email and password
-- 4. Then run the SQL below to set their role

-- ============================================
-- OPTION 2: Set Admin Role for Existing User
-- ============================================

-- Set ADMIN role for a user
UPDATE auth.users
SET raw_app_meta_data = jsonb_build_object(
    'role', 'admin',
    'created_at', NOW(),
    'created_by', 'system'
)
WHERE email = 'admin@yourdomain.com';

-- Set SUPERADMIN role for a user
UPDATE auth.users
SET raw_app_meta_data = jsonb_build_object(
    'role', 'superadmin',
    'created_at', NOW(),
    'created_by', 'system'
)
WHERE email = 'superadmin@yourdomain.com';

-- ============================================
-- OPTION 3: Bulk Set Multiple Admins
-- ============================================

-- Set multiple users as admins
UPDATE auth.users
SET raw_app_meta_data = jsonb_build_object(
    'role', 'admin',
    'created_at', NOW()
)
WHERE email IN (
    'admin1@yourdomain.com',
    'admin2@yourdomain.com',
    'admin3@yourdomain.com'
);

-- ============================================
-- VERIFY ADMIN USERS
-- ============================================

-- List all admin users
SELECT 
    id,
    email,
    raw_app_meta_data->>'role' as role,
    created_at,
    last_sign_in_at
FROM auth.users
WHERE raw_app_meta_data->>'role' IN ('admin', 'superadmin')
ORDER BY created_at DESC;

-- ============================================
-- REMOVE ADMIN ROLE
-- ============================================

-- Remove admin role from a user (set back to regular user)
UPDATE auth.users
SET raw_app_meta_data = '{}'::jsonb
WHERE email = 'admin@yourdomain.com';

-- ============================================
-- ROLE DESCRIPTIONS & PERMISSIONS
-- ============================================

/*
ADMIN ROLE:
===========
Permissions:
- View all activation requests
- Activate/deactivate gifts
- Mark requests as processed
- View gift statistics
- Access admin dashboard

Responsibilities:
- Process user activation requests
- Manage gift lifecycle (activate/deactivate)
- Monitor platform activity
- Handle user support requests related to gifts

SUPERADMIN ROLE:
================
Permissions:
- ALL admin permissions PLUS:
- Manage other admin users
- Access to all user data
- System configuration access
- Database management capabilities

Responsibilities:
- Platform administration
- User management (add/remove users)
- Admin user management
- System settings configuration
- Security oversight

*/

-- ============================================
-- CREATE ADMIN SETUP FUNCTION (Optional)
-- ============================================

-- Function to easily add new admins (run as superadmin)
CREATE OR REPLACE FUNCTION add_admin(admin_email TEXT, admin_role TEXT DEFAULT 'admin')
RETURNS VOID AS $$
BEGIN
    -- Validate role
    IF admin_role NOT IN ('admin', 'superadmin') THEN
        RAISE EXCEPTION 'Invalid role. Must be admin or superadmin';
    END IF;
    
    -- Update user metadata
    UPDATE auth.users
    SET raw_app_meta_data = jsonb_build_object(
        'role', admin_role,
        'created_at', NOW(),
        'created_by', auth.uid()
    )
    WHERE email = admin_email;
    
    IF NOT FOUND THEN
        RAISE EXCEPTION 'User with email % not found', admin_email;
    END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Usage: SELECT add_admin('newadmin@example.com', 'admin');

-- ============================================
-- CHECK CURRENT USER'S ROLE
-- ============================================

-- Function to check if current user is admin
CREATE OR REPLACE FUNCTION is_current_user_admin()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM auth.users 
        WHERE id = auth.uid() 
        AND raw_app_meta_data->>'role' IN ('admin', 'superadmin')
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Usage: SELECT is_current_user_admin();

-- ============================================
-- SETUP INSTRUCTIONS
-- ============================================

/*
QUICK START:
============

1. Create admin user:
   - Go to Supabase Dashboard → Authentication → Users
   - Click "Add User"
   - Enter admin email and password
   - Save

2. Set admin role (run this SQL):
   
   UPDATE auth.users
   SET raw_app_meta_data = '{"role": "admin"}'::jsonb
   WHERE email = 'your-admin@example.com';

3. Verify admin role:
   
   SELECT email, raw_app_meta_data->>'role' as role
   FROM auth.users
   WHERE email = 'your-admin@example.com';

4. Login at: https://giftonscreen.shop/public/admin-login.html

*/

-- ============================================
-- DEFAULT ADMIN SETUP (Optional)
-- ============================================

-- Uncomment and modify to create default admin on setup
-- Make sure to change the email before running!

/*
DO $$
BEGIN
    -- Check if admin already exists
    IF NOT EXISTS (
        SELECT 1 FROM auth.users 
        WHERE raw_app_meta_data->>'role' = 'superadmin'
    ) THEN
        -- Create default superadmin (must already exist in auth.users)
        UPDATE auth.users
        SET raw_app_meta_data = jsonb_build_object(
            'role', 'superadmin',
            'created_at', NOW(),
            'is_default', true
        )
        WHERE email = 'admin@giftonscreen.com'; -- CHANGE THIS EMAIL
        
        RAISE NOTICE 'Default superadmin created. Please change the password immediately.';
    END IF;
END $$;
*/

-- ============================================
-- SECURITY NOTES
-- ============================================

/*
SECURITY BEST PRACTICES:
========================

1. Use app_metadata (not user_metadata):
   - app_metadata is server-only and secure
   - user_metadata can be edited by the user

2. Limit superadmin accounts:
   - Only 1-2 superadmins recommended
   - Use regular admin for daily operations

3. Strong passwords:
   - Require strong passwords for admin accounts
   - Enable 2FA if possible

4. Audit logging:
   - All admin actions are logged
   - Review logs regularly

5. Regular review:
   - Periodically review admin list
   - Remove unused admin access

*/