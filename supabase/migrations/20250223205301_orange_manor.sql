-- Drop existing policies
DROP POLICY IF EXISTS "Listings images are viewable by everyone" ON storage.objects;
DROP POLICY IF EXISTS "Users can upload listing images" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own listing images" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own listing images" ON storage.objects;

-- Make listings bucket public
UPDATE storage.buckets
SET public = true
WHERE id = 'listings';

-- Create new storage policies with proper permissions
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