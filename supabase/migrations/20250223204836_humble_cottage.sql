/*
  # Fix listing images URLs

  1. Changes
    - Add functions to validate image URLs
    - Update existing listings with invalid images
    - Add trigger-based validation for new/updated listings

  2. Security
    - Maintains existing security constraints
    - Uses triggers instead of CHECK constraints for complex validation
*/

-- Function to validate image URL
CREATE OR REPLACE FUNCTION is_valid_image_url(url text)
RETURNS boolean
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN (
    url ~ '^https?://'
    AND (
      -- Valid Supabase storage URL
      url ~ '^https://[a-zA-Z0-9-]+\.supabase\.co/storage/v1/object/public/(listings|assets)/'
      OR
      -- Valid Unsplash URL
      url ~ '^https://images\.unsplash\.com/.*(\?.*)?$'
    )
  );
END;
$$;

-- Function to validate array of URLs
CREATE OR REPLACE FUNCTION validate_image_urls(urls text[])
RETURNS boolean
LANGUAGE plpgsql
AS $$
DECLARE
  url text;
BEGIN
  IF array_length(urls, 1) = 0 THEN
    RETURN false;
  END IF;
  
  FOREACH url IN ARRAY urls
  LOOP
    IF NOT is_valid_image_url(url) THEN
      RETURN false;
    END IF;
  END LOOP;
  
  RETURN true;
END;
$$;

-- Update listings with invalid image URLs
WITH valid_images AS (
  SELECT id, ARRAY_AGG(url) as valid_urls
  FROM (
    SELECT id, unnest(images) as url
    FROM listings
  ) subq
  WHERE is_valid_image_url(url)
  GROUP BY id
)
UPDATE listings l
SET images = COALESCE(
  v.valid_urls,
  ARRAY['https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=800']
)
FROM valid_images v
WHERE l.id = v.id
  AND NOT validate_image_urls(l.images);

-- Set default image for listings with no valid images
UPDATE listings
SET images = ARRAY['https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=800']
WHERE array_length(images, 1) = 0 OR images IS NULL;

-- Create function to validate image URLs before insert/update
CREATE OR REPLACE FUNCTION validate_listing_images()
RETURNS trigger
LANGUAGE plpgsql
AS $$
DECLARE
  valid_urls text[];
  url text;
BEGIN
  -- Initialize valid URLs array
  valid_urls := ARRAY[]::text[];
  
  -- Collect valid URLs
  FOREACH url IN ARRAY NEW.images
  LOOP
    IF is_valid_image_url(url) THEN
      valid_urls := array_append(valid_urls, url);
    END IF;
  END LOOP;
  
  -- If no valid URLs, use default
  IF array_length(valid_urls, 1) = 0 THEN
    valid_urls := ARRAY['https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=800'];
  END IF;
  
  -- Update images array
  NEW.images := valid_urls;
  
  RETURN NEW;
END;
$$;

-- Create trigger to validate images on insert/update
DROP TRIGGER IF EXISTS validate_listing_images_trigger ON listings;
CREATE TRIGGER validate_listing_images_trigger
  BEFORE INSERT OR UPDATE ON listings
  FOR EACH ROW
  EXECUTE FUNCTION validate_listing_images();

-- Add simple constraint for non-empty images array
ALTER TABLE listings
DROP CONSTRAINT IF EXISTS listings_images_not_empty;

ALTER TABLE listings
ADD CONSTRAINT listings_images_not_empty
CHECK (array_length(images, 1) > 0);

-- Add helpful comments
COMMENT ON FUNCTION is_valid_image_url IS 'Validates if a URL is a valid image URL from allowed sources';
COMMENT ON FUNCTION validate_image_urls IS 'Validates an array of image URLs';
COMMENT ON FUNCTION validate_listing_images IS 'Trigger function to ensure listing images are valid';