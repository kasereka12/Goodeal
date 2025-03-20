/*
  # Fix user relation for listings

  1. Changes
    - Create a view for listings with user data
    - Update foreign key constraint
    - Recreate RLS policies
    
  2. Security
    - Enable RLS
    - Add policies for CRUD operations
    - Ensure proper user data access
*/

-- Drop existing view if exists
DROP VIEW IF EXISTS listings_with_users;

-- Create view to join listings with user data
CREATE OR REPLACE VIEW listings_with_users AS
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

-- Update foreign key constraint
ALTER TABLE listings 
  DROP CONSTRAINT IF EXISTS listings_user_id_fkey,
  ADD CONSTRAINT listings_user_id_fkey 
    FOREIGN KEY (user_id) 
    REFERENCES auth.users(id) 
    ON DELETE CASCADE;

-- Enable RLS
ALTER TABLE listings ENABLE ROW LEVEL SECURITY;

-- Recreate RLS policies
DROP POLICY IF EXISTS "Listings are viewable by everyone" ON listings;
DROP POLICY IF EXISTS "Users can insert their own listings" ON listings;
DROP POLICY IF EXISTS "Users can update their own listings" ON listings;
DROP POLICY IF EXISTS "Users can delete their own listings" ON listings;

CREATE POLICY "Listings are viewable by everyone"
  ON listings
  FOR SELECT
  USING (true);

CREATE POLICY "Users can insert their own listings"
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

-- Create indexes
CREATE INDEX IF NOT EXISTS listings_user_id_idx ON listings (user_id);
CREATE INDEX IF NOT EXISTS listings_category_idx ON listings (category);
CREATE INDEX IF NOT EXISTS listings_city_idx ON listings (city);
CREATE INDEX IF NOT EXISTS listings_price_idx ON listings (price);
CREATE INDEX IF NOT EXISTS listings_status_idx ON listings (status);
CREATE INDEX IF NOT EXISTS listings_created_at_idx ON listings (created_at DESC);