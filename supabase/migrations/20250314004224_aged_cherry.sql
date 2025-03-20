/*
  # Fix signup trigger and profile creation

  1. Changes
    - Improve error handling in profile creation trigger
    - Add transaction control
    - Add better username generation
    - Add validation checks
*/

-- Drop existing profile triggers
DROP TRIGGER IF EXISTS create_profile_after_user_creation ON auth.users;
DROP FUNCTION IF EXISTS create_profile_for_user();

-- Create improved profile creation trigger with better error handling
CREATE OR REPLACE FUNCTION create_profile_for_user()
RETURNS TRIGGER AS $$
DECLARE
  username_base text;
  username_attempt text;
  counter int := 0;
  max_attempts int := 100;
BEGIN
  -- Input validation
  IF NEW.id IS NULL THEN
    RAISE EXCEPTION 'User ID cannot be null';
  END IF;

  -- Get base username from metadata or email
  username_base := COALESCE(
    (NEW.raw_user_meta_data->>'username')::text,
    split_part(NEW.email, '@', 1),
    'user_' || substr(NEW.id::text, 1, 8)
  );

  -- Sanitize username base (remove special characters)
  username_base := regexp_replace(username_base, '[^a-zA-Z0-9_-]', '', 'g');
  
  -- Ensure minimum length
  IF length(username_base) < 3 THEN
    username_base := username_base || substr(NEW.id::text, 1, 3);
  END IF;

  -- Try username with increasing counter until unique
  LOOP
    BEGIN
      IF counter = 0 THEN
        username_attempt := username_base;
      ELSE
        username_attempt := username_base || counter::text;
      END IF;

      -- Validate username length
      IF length(username_attempt) > 20 THEN
        username_attempt := substr(username_attempt, 1, 17) || counter::text;
      END IF;
      
      INSERT INTO public.profiles (user_id, username)
      VALUES (NEW.id, username_attempt);
      
      EXIT; -- Exit loop if insert succeeds
      
    EXCEPTION WHEN unique_violation THEN
      counter := counter + 1;
      IF counter >= max_attempts THEN
        -- If all attempts fail, use user ID as fallback
        BEGIN
          INSERT INTO public.profiles (user_id, username)
          VALUES (NEW.id, 'user_' || NEW.id::text);
          EXIT;
        EXCEPTION WHEN others THEN
          RAISE EXCEPTION 'Failed to create profile after % attempts', max_attempts;
        END;
      END IF;
    END;
  END LOOP;

  RETURN NEW;
EXCEPTION WHEN others THEN
  -- Log error and re-raise
  RAISE WARNING 'Error in create_profile_for_user: %', SQLERRM;
  RAISE;
END;
$$ LANGUAGE plpgsql;

-- Recreate trigger with error handling
CREATE TRIGGER create_profile_after_user_creation
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION create_profile_for_user();

-- Ensure indexes exist
CREATE INDEX IF NOT EXISTS profiles_username_idx ON profiles (username);
CREATE INDEX IF NOT EXISTS profiles_user_id_idx ON profiles (user_id);
CREATE INDEX IF NOT EXISTS profiles_username_trgm_idx ON profiles USING gin (username gin_trgm_ops);

-- Add helpful comments
COMMENT ON FUNCTION create_profile_for_user IS 'Creates a profile with unique username for new users';
COMMENT ON TRIGGER create_profile_after_user_creation ON auth.users IS 'Automatically creates profile when new user is created';