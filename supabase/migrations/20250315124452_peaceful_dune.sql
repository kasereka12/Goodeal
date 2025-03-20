-- Check if function exists before creating
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_proc 
    WHERE proname = 'exec_sql' 
    AND pronamespace = 'public'::regnamespace
  ) THEN
    -- Create function to execute SQL
    CREATE OR REPLACE FUNCTION exec_sql(sql text)
    RETURNS void
    LANGUAGE plpgsql
    SECURITY DEFINER
    SET search_path = public
    AS $$
    BEGIN
      EXECUTE sql;
    END;
    $$;

    -- Grant execute permission to authenticated users
    GRANT EXECUTE ON FUNCTION exec_sql TO authenticated;

    -- Add helpful comment
    COMMENT ON FUNCTION exec_sql IS 'Executes SQL statements for migrations';
  END IF;
END $$;