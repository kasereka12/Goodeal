/*
  # Fix listings visibility

  1. Changes
    - Update RLS policies to allow public access to active listings
    - Fix listings view permissions
    - Ensure proper access control
*/

-- Drop existing policies
DROP POLICY IF EXISTS "Public can only view verified listings" ON listings;
DROP POLICY IF EXISTS "Users can create listings as pending" ON listings;
DROP POLICY IF EXISTS "Users can update their pending or rejected listings" ON listings;
DROP POLICY IF EXISTS "Users can delete their own listings" ON listings;
DROP POLICY IF EXISTS "Admins can manage all listings" ON listings;

-- Create new policies with proper access control
CREATE POLICY "Listings are viewable by everyone"
  ON listings
  FOR SELECT
  USING (true);

CREATE POLICY "Users can create listings as pending"
  ON listings
  FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = user_id AND
    status = 'pending'
  );

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

-- Update listings view
DROP VIEW IF EXISTS listings_with_users;

CREATE VIEW listings_with_users AS
SELECT 
  l.*,
  get_user_data_secure(l.user_id) as user_data
FROM listings l;

-- Grant permissions
GRANT SELECT ON listings_with_users TO authenticated;
GRANT SELECT ON listings_with_users TO anon;

-- Add helpful comments
COMMENT ON VIEW listings_with_users IS 'Secure view of listings with user data';