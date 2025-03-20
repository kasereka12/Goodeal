-- Drop existing function if it exists
DROP FUNCTION IF EXISTS exec_sql(text);

-- Create function to execute SQL with proper permissions
CREATE OR REPLACE FUNCTION exec_sql(sql text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  -- Only allow admins to execute SQL
  IF NOT EXISTS (
    SELECT 1 FROM auth.users 
    WHERE id = auth.uid() 
    AND raw_user_meta_data->>'role' = 'admin'
  ) THEN
    RAISE EXCEPTION 'Permission denied';
  END IF;

  EXECUTE sql;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION exec_sql TO authenticated;

-- Add helpful comment
COMMENT ON FUNCTION exec_sql IS 'Execurely executes SQL statements for migrations (admin only)';