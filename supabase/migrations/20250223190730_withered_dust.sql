/*
  # Storage setup for listings and assets

  1. Create Buckets
    - listings: For listing images
    - assets: For static assets (logos, banners, etc)

  2. Security
    - Enable public access for assets bucket
    - Enable authenticated access for listings bucket
    - Set up RLS policies for both buckets
*/

-- Create storage buckets
INSERT INTO storage.buckets (id, name, public)
VALUES 
  ('listings', 'listings', false),
  ('assets', 'assets', true)
ON CONFLICT (id) DO NOTHING;

-- Policies for listings bucket
CREATE POLICY "Listings images are viewable by everyone"
ON storage.objects FOR SELECT
USING (bucket_id = 'listings');

CREATE POLICY "Users can upload listing images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'listings' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Users can update their own listing images"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'listings' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Users can delete their own listing images"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'listings' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Policies for assets bucket
CREATE POLICY "Assets are viewable by everyone"
ON storage.objects FOR SELECT
USING (bucket_id = 'assets');

CREATE POLICY "Only authenticated users can manage assets"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'assets');

CREATE POLICY "Only authenticated users can update assets"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'assets');

CREATE POLICY "Only authenticated users can delete assets"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'assets');