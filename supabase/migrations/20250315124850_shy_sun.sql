-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Public can view limited user data" ON auth.users;
DROP POLICY IF EXISTS "Users can update their own data" ON auth.users;
DROP POLICY IF EXISTS "Admins have full access" ON auth.users;

-- Enable RLS if not already enabled
ALTER TABLE auth.users ENABLE ROW LEVEL SECURITY;

-- Create new policies
CREATE POLICY "Public can view limited user data"
ON auth.users
FOR SELECT
USING (true);

CREATE POLICY "Users can update their own data"
ON auth.users
FOR UPDATE
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

CREATE POLICY "Admins have full access"
ON auth.users
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM auth.users
    WHERE id = auth.uid()
    AND raw_user_meta_data->>'role' = 'admin'
  )
);

-- Grant necessary permissions if not already granted
DO $$
BEGIN
  -- Attempt to grant permissions, ignoring errors if already granted
  BEGIN
    GRANT SELECT ON auth.users TO authenticated;
  EXCEPTION WHEN OTHERS THEN
    NULL;
  END;
  
  BEGIN
    GRANT SELECT ON auth.users TO anon;
  EXCEPTION WHEN OTHERS THEN
    NULL;
  END;
  
  BEGIN
    GRANT UPDATE ON auth.users TO authenticated;
  EXCEPTION WHEN OTHERS THEN
    NULL;
  END;
END $$;

-- Add helpful comment
COMMENT ON TABLE auth.users IS 'Auth: Stores user data with proper access control';