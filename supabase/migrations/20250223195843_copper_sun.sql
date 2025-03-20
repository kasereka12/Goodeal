/*
  # Create secure user data access

  1. Create a function to access user data securely
  2. Create a view for listings with user data
  3. Set up proper permissions and security
*/

-- Create a secure function to get user data
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

-- Create a secure view for listings with user data
CREATE OR REPLACE VIEW listings_with_users AS
SELECT 
  l.*,
  get_user_data(l.user_id) as user_data
FROM listings l;

-- Grant permissions
GRANT EXECUTE ON FUNCTION get_user_data TO authenticated;
GRANT SELECT ON listings_with_users TO authenticated;
GRANT SELECT ON listings_with_users TO anon;

COMMENT ON FUNCTION get_user_data IS 'Secure function to get user data based on role';
COMMENT ON VIEW listings_with_users IS 'Secure view of listings with user data';