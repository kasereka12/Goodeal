/*
  # Fix listing images

  1. Changes
    - Add default image URL for listings without images
    - Update existing listings with default images if needed
    - Add check constraint to ensure images array is not empty

  2. Security
    - No changes to RLS policies
*/

-- Add check constraint to ensure images array is not empty
ALTER TABLE listings
ADD CONSTRAINT listings_images_not_empty 
CHECK (array_length(images, 1) > 0);

-- Update listings with empty images array
UPDATE listings
SET images = ARRAY['https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=800']
WHERE array_length(images, 1) IS NULL OR array_length(images, 1) = 0;