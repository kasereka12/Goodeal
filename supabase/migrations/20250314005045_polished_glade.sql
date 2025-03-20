/*
  # Fix document upload functionality

  1. Changes
    - Create documents bucket if not exists
    - Set proper permissions and policies
    - Add validation trigger for document uploads
    - Update storage policies
*/

-- Create documents bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('documents', 'documents', false)
ON CONFLICT (id) DO NOTHING;

-- Create function to validate document uploads
CREATE OR REPLACE FUNCTION validate_document_upload()
RETURNS trigger AS $$
BEGIN
  -- Validate file path format
  IF NOT regexp_like(NEW.name, '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/documents/[a-z_]+/[0-9a-zA-Z-_.]+$') THEN
    RAISE EXCEPTION 'Invalid document path format';
  END IF;

  -- Validate file size (max 10MB)
  IF NEW.metadata->>'size' IS NOT NULL AND (NEW.metadata->>'size')::bigint > 10485760 THEN
    RAISE EXCEPTION 'Document size exceeds 10MB limit';
  END IF;

  -- Validate content type
  IF NEW.metadata->>'mimetype' NOT IN ('application/pdf', 'image/jpeg', 'image/png') THEN
    RAISE EXCEPTION 'Invalid document type. Allowed types: PDF, JPEG, PNG';
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for document validation
DROP TRIGGER IF EXISTS validate_document_upload_trigger ON storage.objects;
CREATE TRIGGER validate_document_upload_trigger
  BEFORE INSERT OR UPDATE ON storage.objects
  FOR EACH ROW
  WHEN (NEW.bucket_id = 'documents')
  EXECUTE FUNCTION validate_document_upload();

-- Update storage policies
DROP POLICY IF EXISTS "Documents are viewable by everyone" ON storage.objects;
DROP POLICY IF EXISTS "Users can upload documents" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own documents" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own documents" ON storage.objects;

-- Create new policies with proper checks
CREATE POLICY "Documents are viewable by everyone"
ON storage.objects FOR SELECT
USING (bucket_id = 'documents');

CREATE POLICY "Users can upload documents"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'documents' AND
  auth.uid()::text = (storage.foldername(name))[1] AND
  (storage.foldername(name))[2] = 'documents'
);

CREATE POLICY "Users can update their own documents"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'documents' AND
  auth.uid()::text = (storage.foldername(name))[1] AND
  (storage.foldername(name))[2] = 'documents'
);

CREATE POLICY "Users can delete their own documents"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'documents' AND
  auth.uid()::text = (storage.foldername(name))[1] AND
  (storage.foldername(name))[2] = 'documents'
);

-- Add helpful comments
COMMENT ON FUNCTION validate_document_upload IS 'Trigger function to ensure document uploads are valid';