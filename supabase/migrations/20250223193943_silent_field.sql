/*
  # Add foreign key constraint to listings table

  1. Changes
    - Add foreign key constraint between listings.user_id and auth.users.id
    - Update RLS policies to use auth.uid()
*/

-- Add foreign key constraint
ALTER TABLE listings
DROP CONSTRAINT IF EXISTS listings_user_id_fkey,
ADD CONSTRAINT listings_user_id_fkey
  FOREIGN KEY (user_id)
  REFERENCES auth.users(id)
  ON DELETE CASCADE;

-- Update RLS policies to use auth.uid()
DROP POLICY IF EXISTS "Users can insert their own listings" ON listings;
DROP POLICY IF EXISTS "Users can update their own listings" ON listings;
DROP POLICY IF EXISTS "Users can delete their own listings" ON listings;

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