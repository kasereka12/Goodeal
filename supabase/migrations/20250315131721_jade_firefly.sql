-- Create function to validate listing images
CREATE OR REPLACE FUNCTION validate_listing_images()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  -- Validate file path format
  IF NOT regexp_like(NEW.name, '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/listings/[a-z_]+/[0-9a-zA-Z-_.]+$') THEN
    RAISE EXCEPTION 'Invalid image path format';
  END IF;

  -- Validate file size (max 5MB)
  IF NEW.metadata->>'size' IS NOT NULL AND (NEW.metadata->>'size')::bigint > 5242880 THEN
    RAISE EXCEPTION 'Image size exceeds 5MB limit';
  END IF;

  -- Validate content type
  IF NEW.metadata->>'mimetype' NOT IN ('image/jpeg', 'image/png', 'image/gif') THEN
    RAISE EXCEPTION 'Invalid image type. Allowed types: JPEG, PNG, GIF';
  END IF;

  RETURN NEW;
END;
$$;

-- Create trigger for image validation
DROP TRIGGER IF EXISTS validate_listing_images_trigger ON storage.objects;
CREATE TRIGGER validate_listing_images_trigger
  BEFORE INSERT OR UPDATE ON storage.objects
  FOR EACH ROW
  WHEN (NEW.bucket_id = 'listings')
  EXECUTE FUNCTION validate_listing_images();

-- Update storage policies
DROP POLICY IF EXISTS "Listings images are viewable by everyone" ON storage.objects;
DROP POLICY IF EXISTS "Users can upload listing images" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own listing images" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own listing images" ON storage.objects;

-- Create new storage policies
CREATE POLICY "Listings images are viewable by everyone"
ON storage.objects FOR SELECT
USING (bucket_id = 'listings');

CREATE POLICY "Users can upload listing images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'listings' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can update their own listing images"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'listings' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can delete their own listing images"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'listings' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Add helpful comments
COMMENT ON FUNCTION validate_listing_images IS 'Trigger function to ensure listing images are valid';