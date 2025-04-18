/*
  # Fix permissions and authentication issues

  1. Changes
    - Grant proper permissions to public roles
    - Fix user data access in listings view
    - Update RLS policies
    - Ensure admin user has correct permissions
*/

-- Drop existing function and view
DROP VIEW IF EXISTS listings_with_users;
DROP FUNCTION IF EXISTS get_user_data_secure;

-- Create secure function to get user data
CREATE OR REPLACE FUNCTION get_user_data_secure(user_id uuid)
RETURNS jsonb
LANGUAGE sql
SECURITY DEFINER
SET search_path = public, auth
AS $$
  SELECT 
    CASE 
      WHEN auth.uid() = user_id OR EXISTS (
        SELECT 1 FROM auth.users u 
        WHERE u.id = auth.uid() AND u.raw_user_meta_data->>'role' = 'admin'
      ) THEN
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
GRANT EXECUTE ON FUNCTION get_user_data_secure TO authenticated;
GRANT EXECUTE ON FUNCTION get_user_data_secure TO anon;

-- Create view using secure function
CREATE VIEW listings_with_users AS
SELECT 
  l.*,
  get_user_data_secure(l.user_id) as user_data
FROM listings l
WHERE 
  l.status = 'active' OR -- Public can see active listings
  (auth.uid() IS NOT NULL AND auth.uid() = l.user_id) OR -- Users can see their own
  (
    auth.uid() IS NOT NULL AND 
    EXISTS (
      SELECT 1 FROM auth.users u 
      WHERE u.id = auth.uid() 
      AND u.raw_user_meta_data->>'role' = 'admin'
    )
  ); -- Admins can see all

-- Grant permissions on the view
GRANT SELECT ON listings_with_users TO authenticated;
GRANT SELECT ON listings_with_users TO anon;

-- Update RLS policies for listings table
ALTER TABLE listings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can only view verified listings" ON listings;
DROP POLICY IF EXISTS "Users can create listings as pending" ON listings;
DROP POLICY IF EXISTS "Users can update their pending or rejected listings" ON listings;
DROP POLICY IF EXISTS "Users can delete their own listings" ON listings;
DROP POLICY IF EXISTS "Admins can manage all listings" ON listings;

-- Create new policies
CREATE POLICY "Public can only view verified listings"
ON listings FOR SELECT
USING (
  status = 'active' OR 
  (auth.uid() IS NOT NULL AND auth.uid() = user_id) OR
  (
    auth.uid() IS NOT NULL AND 
    EXISTS (
      SELECT 1 FROM auth.users u 
      WHERE u.id = auth.uid() 
      AND u.raw_user_meta_data->>'role' = 'admin'
    )
  )
);

CREATE POLICY "Users can create listings as pending"
ON listings FOR INSERT
TO authenticated
WITH CHECK (
  auth.uid() = user_id AND
  status = 'pending'
);

CREATE POLICY "Users can update their pending or rejected listings"
ON listings FOR UPDATE
TO authenticated
USING (
  auth.uid() = user_id AND
  status IN ('pending', 'rejected')
)
WITH CHECK (
  auth.uid() = user_id AND
  status IN ('pending', 'rejected')
);

CREATE POLICY "Users can delete their own listings"
ON listings FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all listings"
ON listings
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM auth.users u 
    WHERE u.id = auth.uid() 
    AND u.raw_user_meta_data->>'role' = 'admin'
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM auth.users u 
    WHERE u.id = auth.uid() 
    AND u.raw_user_meta_data->>'role' = 'admin'
  )
);

-- Ensure admin user exists with correct credentials
DO $$
DECLARE
  admin_id uuid;
BEGIN
  -- Check if admin exists
  SELECT id INTO admin_id
  FROM auth.users
  WHERE email = 'admin@goodeaal.com';

  IF admin_id IS NULL THEN
    -- Create admin user if doesn't exist
    INSERT INTO auth.users (
      instance_id,
      id,
      aud,
      role,
      email,
      encrypted_password,
      email_confirmed_at,
      raw_app_meta_data,
      raw_user_meta_data,
      created_at,
      updated_at
    ) VALUES (
      '00000000-0000-0000-0000-000000000000',
      gen_random_uuid(),
      'authenticated',
      'authenticated',
      'admin@goodeaal.com',
      crypt('123456*', gen_salt('bf')),
      now(),
      jsonb_build_object(
        'provider', 'email',
        'providers', ARRAY['email']
      ),
      jsonb_build_object('role', 'admin'),
      now(),
      now()
    )
    RETURNING id INTO admin_id;

    -- Create identity for admin
    INSERT INTO auth.identities (
      id,
      user_id,
      identity_data,
      provider,
      provider_id,
      last_sign_in_at,
      created_at,
      updated_at
    ) VALUES (
      gen_random_uuid(),
      admin_id,
      jsonb_build_object(
        'sub', admin_id::text,
        'email', 'admin@goodeaal.com'
      ),
      'email',
      'admin@goodeaal.com',
      now(),
      now(),
      now()
    );
  ELSE
    -- Update existing admin password and role
    UPDATE auth.users
    SET 
      encrypted_password = crypt('123456*', gen_salt('bf')),
      raw_user_meta_data = jsonb_build_object('role', 'admin'),
      email_confirmed_at = now(),
      updated_at = now()
    WHERE id = admin_id;
  END IF;
END $$;

-- Add helpful comments
COMMENT ON FUNCTION get_user_data_secure IS 'Securely fetch user data with proper access control';
COMMENT ON VIEW listings_with_users IS 'Secure view of listings with user data';