/*
  # Fix authentication setup and permissions

  1. Changes
    - Drop and recreate policies with proper permissions
    - Create admin user with correct credentials
    - Fix view access control
*/

-- Drop existing policies and views
DROP POLICY IF EXISTS "Listings are viewable by everyone" ON listings;
DROP POLICY IF EXISTS "Users can create listings" ON listings;
DROP POLICY IF EXISTS "Users can update their own listings" ON listings;
DROP POLICY IF EXISTS "Users can delete their own listings" ON listings;
DROP VIEW IF EXISTS listings_with_users;

-- Enable RLS
ALTER TABLE listings ENABLE ROW LEVEL SECURITY;

-- Create basic policies
CREATE POLICY "Listings are viewable by everyone"
  ON listings
  FOR SELECT
  USING (true);

CREATE POLICY "Users can create listings"
  ON listings
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own listings"
  ON listings
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own listings"
  ON listings
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create view with basic user data
CREATE VIEW listings_with_users AS
SELECT 
  l.*,
  jsonb_build_object(
    'id', u.id,
    'email', u.email,
    'created_at', u.created_at,
    'user_metadata', u.raw_user_meta_data
  ) as user_data
FROM listings l
LEFT JOIN auth.users u ON u.id = l.user_id;

-- Grant permissions
GRANT SELECT ON listings_with_users TO authenticated;
GRANT SELECT ON listings_with_users TO anon;

-- Create admin user with new email
DO $$
DECLARE
  new_user_id uuid;
BEGIN
  -- Delete existing admin users
  DELETE FROM auth.users 
  WHERE email IN ('admin@goodeaal.com', 'contact@myfirst-property.com');
  
  -- Generate new UUID
  new_user_id := gen_random_uuid();
  
  -- Insert new admin user with updated email
  INSERT INTO auth.users (
    id,
    instance_id,
    email,
    encrypted_password,
    email_confirmed_at,
    aud,
    role,
    raw_app_meta_data,
    raw_user_meta_data,
    created_at,
    updated_at,
    confirmation_token,
    recovery_token
  ) VALUES (
    new_user_id,
    '00000000-0000-0000-0000-000000000000',
    'contact@myfirst-property.com',
    crypt('123456*', gen_salt('bf')),
    now(),
    'authenticated',
    'authenticated',
    jsonb_build_object(
      'provider', 'email',
      'providers', ARRAY['email']
    ),
    jsonb_build_object('role', 'admin'),
    now(),
    now(),
    encode(gen_random_bytes(32), 'base64'),
    encode(gen_random_bytes(32), 'base64')
  );

  -- Insert identity with new email
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
    new_user_id,
    jsonb_build_object(
      'sub', new_user_id::text,
      'email', 'contact@myfirst-property.com'
    ),
    'email',
    'contact@myfirst-property.com',
    now(),
    now(),
    now()
  );
END $$;

-- Add helpful comments
COMMENT ON TABLE listings IS 'Stores all listings';
COMMENT ON VIEW listings_with_users IS 'View of listings with user data';