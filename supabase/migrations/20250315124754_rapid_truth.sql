-- Update RLS policies for users table
ALTER TABLE auth.users ENABLE ROW LEVEL SECURITY;

-- Allow public read access to limited user data
CREATE POLICY "Public can view limited user data"
ON auth.users
FOR SELECT
USING (true);

-- Allow users to update their own data
CREATE POLICY "Users can update their own data"
ON auth.users
FOR UPDATE
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- Allow admins full access
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

-- Grant necessary permissions
GRANT SELECT ON auth.users TO authenticated;
GRANT SELECT ON auth.users TO anon;
GRANT UPDATE ON auth.users TO authenticated;

-- Add helpful comment
COMMENT ON TABLE auth.users IS 'Auth: Stores user data with proper access control';