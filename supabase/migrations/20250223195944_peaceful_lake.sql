/*
  # Create secure user data access functions

  1. Create function to get total users count
  2. Create function to get user data securely
  3. Create view for listings with user data
*/

-- Create function to get total users count
CREATE OR REPLACE FUNCTION get_total_users_count()
RETURNS int
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COUNT(*)::int
  FROM auth.users;
$$;

-- Create function to get user data
CREATE OR REPLACE FUNCTION get_user_data(user_id uuid)
RETURNS jsonb
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 
    CASE WHEN auth.role() = 'authenticated' THEN
      jsonb_build_object(
        'id', u.id,
        'email', u.email,
        'created_at', u.created_at,
        'user_metadata', u.raw_user_meta_data
      )
    ELSE
      jsonb_build_object(
        'id', u.id,
        'email', u.email,
        'created_at', u.created_at
      )
    END
  FROM auth.users u
  WHERE u.id = user_id;
$$;

-- Create view for listings with user data
CREATE OR REPLACE VIEW listings_with_users AS
SELECT 
  l.*,
  get_user_data(l.user_id) as user_data
FROM listings l;

-- Grant permissions
GRANT EXECUTE ON FUNCTION get_total_users_count TO authenticated;
GRANT EXECUTE ON FUNCTION get_user_data TO authenticated;
GRANT SELECT ON listings_with_users TO authenticated;
GRANT SELECT ON listings_with_users TO anon;

-- Add helpful comments
COMMENT ON FUNCTION get_total_users_count IS 'Get total number of users';
COMMENT ON FUNCTION get_user_data IS 'Get user data securely based on role';
COMMENT ON VIEW listings_with_users IS 'Secure view of listings with user data';