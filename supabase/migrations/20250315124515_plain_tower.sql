-- Create function to execute SQL if it doesn't exist
CREATE OR REPLACE FUNCTION exec_sql(sql text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $func$
DECLARE
BEGIN
  EXECUTE sql;
END;
$func$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION exec_sql TO authenticated;

-- Add helpful comment
COMMENT ON FUNCTION exec_sql IS 'Executes SQL statements for migrations';