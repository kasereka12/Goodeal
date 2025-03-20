-- Drop existing profile triggers
DROP TRIGGER IF EXISTS create_profile_after_user_creation ON auth.users;
DROP FUNCTION IF EXISTS create_profile_for_user();

-- Create improved profile creation trigger
CREATE OR REPLACE FUNCTION create_profile_for_user()
RETURNS TRIGGER AS $$
DECLARE
  username_base text;
  username_attempt text;
  counter int := 0;
BEGIN
  -- Get base username from metadata or generate one
  username_base := COALESCE(
    (NEW.raw_user_meta_data->>'username')::text,
    'user_' || substr(NEW.id::text, 1, 8)
  );
  
  -- Try username with increasing counter until unique
  LOOP
    IF counter = 0 THEN
      username_attempt := username_base;
    ELSE
      username_attempt := username_base || counter::text;
    END IF;
    
    BEGIN
      INSERT INTO public.profiles (user_id, username)
      VALUES (NEW.id, username_attempt);
      EXIT; -- Exit loop if insert succeeds
    EXCEPTION 
      WHEN unique_violation THEN
        counter := counter + 1;
        IF counter > 100 THEN
          RAISE EXCEPTION 'Could not generate unique username after 100 attempts';
        END IF;
        CONTINUE;
    END;
  END LOOP;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Recreate trigger
CREATE TRIGGER create_profile_after_user_creation
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION create_profile_for_user();

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS profiles_username_trgm_idx ON profiles USING gin (username gin_trgm_ops);