-- Drop existing policies
DROP POLICY IF EXISTS "Public can view limited user data" ON auth.users;
DROP POLICY IF EXISTS "Users can update their own data" ON auth.users;
DROP POLICY IF EXISTS "Admins have full access" ON auth.users;

-- Enable RLS
ALTER TABLE auth.users ENABLE ROW LEVEL SECURITY;

-- Create new policies with fixed admin check
CREATE POLICY "Public can view limited user data"
ON auth.users
FOR SELECT
USING (
  CASE 
    WHEN auth.jwt()->>'role' = 'admin' THEN true
    WHEN auth.uid() = id THEN true
    ELSE coalesce(raw_app_meta_data->>'public', 'true')::boolean
  END
);

CREATE POLICY "Users can update their own data"
ON auth.users
FOR UPDATE
USING (
  auth.uid() = id OR
  auth.jwt()->>'role' = 'admin'
)
WITH CHECK (
  auth.uid() = id OR
  auth.jwt()->>'role' = 'admin'
);

CREATE POLICY "Admins have full access"
ON auth.users
FOR ALL
USING (auth.jwt()->>'role' = 'admin')
WITH CHECK (auth.jwt()->>'role' = 'admin');

-- Grant necessary permissions
DO $$
BEGIN
  BEGIN
    GRANT SELECT ON auth.users TO authenticated;
  EXCEPTION WHEN OTHERS THEN NULL;
  END;
  
  BEGIN
    GRANT SELECT ON auth.users TO anon;
  EXCEPTION WHEN OTHERS THEN NULL;
  END;
  
  BEGIN
    GRANT UPDATE ON auth.users TO authenticated;
  EXCEPTION WHEN OTHERS THEN NULL;
  END;
END $$;

-- Add helpful comment
COMMENT ON TABLE auth.users IS 'Auth: Stores user data with proper access control';