/*
  # Add listing verification system

  1. Changes
    - Add verification status to listings table
    - Update RLS policies for listing visibility
    - Add admin verification policies
    - Fix view security
*/

-- Drop the existing view first to avoid column conflicts
DROP VIEW IF EXISTS listings_with_users;

-- Add verification status to listings if it doesn't exist
ALTER TABLE listings
DROP CONSTRAINT IF EXISTS listings_status_check;

ALTER TABLE listings
ADD CONSTRAINT listings_status_check
CHECK (status IN ('pending', 'active', 'rejected', 'sold', 'archived'));

-- Update existing listings to pending status
UPDATE listings 
SET status = 'pending' 
WHERE status = 'active';

-- Update RLS policies
DROP POLICY IF EXISTS "Listings are viewable by everyone" ON listings;
DROP POLICY IF EXISTS "Users can insert their own listings" ON listings;
DROP POLICY IF EXISTS "Users can update their own listings" ON listings;
DROP POLICY IF EXISTS "Users can delete their own listings" ON listings;
DROP POLICY IF EXISTS "Admins can manage all listings" ON listings;

-- Create new policies
CREATE POLICY "Public can only view verified listings"
ON listings FOR SELECT
USING (
  status = 'active' OR -- Anyone can see active listings
  auth.uid() = user_id OR -- Users can see their own listings
  (SELECT is_admin() FROM auth.users WHERE id = auth.uid()) -- Admins can see all listings
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
TO authenticated
USING (is_admin())
WITH CHECK (is_admin());

-- Create secure view for listings with user data
CREATE VIEW listings_with_users AS
SELECT 
  l.*,
  get_user_data(l.user_id) as user_data
FROM listings l
WHERE 
  l.status = 'active' OR -- Public can see active listings
  auth.uid() = l.user_id OR -- Users can see their own
  (SELECT is_admin() FROM auth.users WHERE id = auth.uid()); -- Admins see all

-- Grant necessary permissions
GRANT SELECT ON listings_with_users TO authenticated, anon;

-- Add helpful comments
COMMENT ON TABLE listings IS 'Stores all listings with verification status';
COMMENT ON COLUMN listings.status IS 'Status of listing: pending (awaiting verification), active (verified), rejected, sold, or archived';
COMMENT ON VIEW listings_with_users IS 'Secure view of listings with user data';