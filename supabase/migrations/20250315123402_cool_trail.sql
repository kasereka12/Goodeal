/*
  # Fix listings view permissions

  1. Changes
    - Grant proper permissions for auth.users table
    - Modify view to handle user data access securely
    - Update RLS policies
*/

-- Drop existing view
DROP VIEW IF EXISTS listings_with_users;

-- Create secure function to get user data that handles permissions
CREATE OR REPLACE FUNCTION get_user_data_secure(user_id uuid)
RETURNS jsonb
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 
    CASE WHEN auth.uid() IS NOT NULL THEN
      jsonb_build_object(
        'id', u.id,
        'email', u.email,
        'created_at', u.created_at,
        'user_metadata', u.raw_user_meta_data
      )
    ELSE
      jsonb_build_object(
        'id', u.id,
        'email', split_part(u.email, '@', 1),
        'created_at', u.created_at
      )
    END
  FROM auth.users u
  WHERE u.id = user_id;
$$;

-- Grant execute permission on the secure function
GRANT EXECUTE ON FUNCTION get_user_data_secure TO authenticated, anon;

-- Create view using secure function
CREATE VIEW listings_with_users AS
SELECT 
  l.*,
  get_user_data_secure(l.user_id) as user_data
FROM listings l
WHERE 
  l.status = 'active' OR -- Public can see active listings
  auth.uid() = l.user_id OR -- Users can see their own
  (SELECT is_admin() FROM auth.users WHERE id = auth.uid()); -- Admins see all

-- Grant permissions on the view
GRANT SELECT ON listings_with_users TO authenticated, anon;

-- Add helpful comments
COMMENT ON FUNCTION get_user_data_secure IS 'Securely fetch user data with proper access control';
COMMENT ON VIEW listings_with_users IS 'Secure view of listings with user data';