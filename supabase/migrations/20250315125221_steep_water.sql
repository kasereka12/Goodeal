-- Drop all existing policies to start fresh
DROP POLICY IF EXISTS "Listings are viewable by everyone" ON listings;
DROP POLICY IF EXISTS "Users can create listings" ON listings;
DROP POLICY IF EXISTS "Users can create listings as pending" ON listings;
DROP POLICY IF EXISTS "Users can update their own listings" ON listings;
DROP POLICY IF EXISTS "Users can delete their own listings" ON listings;
DROP POLICY IF EXISTS "Admins can manage all listings" ON listings;
DROP POLICY IF EXISTS "Public can only view verified listings" ON listings;
DROP POLICY IF EXISTS "Users can update their pending or rejected listings" ON listings;

-- Create simplified policies with proper access control
CREATE POLICY "Anyone can view active listings"
  ON listings
  FOR SELECT
  USING (
    status = 'active' OR -- Public can see active listings
    auth.uid() = user_id OR -- Users can see their own listings
    auth.jwt()->>'role' = 'admin' -- Admins can see all listings
  );

CREATE POLICY "Authenticated users can create listings"
  ON listings
  FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = user_id AND -- Must be the owner
    (
      status = 'pending' OR -- Regular users can only create pending listings
      auth.jwt()->>'role' = 'admin' -- Admins can create any status
    )
  );

CREATE POLICY "Users can update own listings"
  ON listings
  FOR UPDATE
  TO authenticated
  USING (
    auth.uid() = user_id OR -- Must be the owner
    auth.jwt()->>'role' = 'admin' -- Or an admin
  )
  WITH CHECK (
    auth.uid() = user_id OR -- Must be the owner
    auth.jwt()->>'role' = 'admin' -- Or an admin
  );

CREATE POLICY "Users can delete own listings"
  ON listings
  FOR DELETE
  TO authenticated
  USING (
    auth.uid() = user_id OR -- Must be the owner
    auth.jwt()->>'role' = 'admin' -- Or an admin
  );

-- Recreate the view with proper access control
DROP VIEW IF EXISTS listings_with_users;

CREATE VIEW listings_with_users AS
SELECT 
  l.*,
  get_user_data_secure(l.user_id) as user_data
FROM listings l
WHERE 
  status = 'active' OR -- Public can see active listings
  auth.uid() = l.user_id OR -- Users can see their own listings
  auth.jwt()->>'role' = 'admin'; -- Admins can see all listings

-- Grant permissions
GRANT SELECT ON listings_with_users TO authenticated;
GRANT SELECT ON listings_with_users TO anon;

-- Add helpful comments
COMMENT ON TABLE listings IS 'Stores all listings with verification status';
COMMENT ON VIEW listings_with_users IS 'Secure view of listings with user data';