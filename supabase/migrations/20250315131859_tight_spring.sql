-- Drop existing trigger and policies
DROP TRIGGER IF EXISTS validate_listing_images_trigger ON storage.objects;
DROP POLICY IF EXISTS "Listings images are viewable by everyone" ON storage.objects;
DROP POLICY IF EXISTS "Users can upload listing images" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own listing images" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own listing images" ON storage.objects;

-- Create storage bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('listings', 'listings', true)
ON CONFLICT (id) DO NOTHING;

-- Create simplified storage policies without regex validation
CREATE POLICY "Listings images are viewable by everyone"
ON storage.objects FOR SELECT
USING (bucket_id = 'listings');

CREATE POLICY "Users can upload listing images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'listings' AND
  auth.uid()::text = split_part(name, '/', 1)
);

CREATE POLICY "Users can update their own listing images"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'listings' AND
  auth.uid()::text = split_part(name, '/', 1)
);

CREATE POLICY "Users can delete their own listing images"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'listings' AND
  auth.uid()::text = split_part(name, '/', 1)
);

-- Add helpful comments
COMMENT ON TABLE storage.objects IS 'Stores uploaded files and their metadata';