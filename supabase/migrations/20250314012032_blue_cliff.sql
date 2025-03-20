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
    split_part(NEW.email, '@', 1)
  );

  -- Sanitize username base (remove special characters and spaces)
  username_base := regexp_replace(
    lower(username_base), 
    '[^a-z0-9_-]', 
    '', 
    'g'
  );
  
  -- Ensure minimum length and handle empty username
  IF length(username_base) < 3 THEN
    username_base := 'user_' || substr(NEW.id::text, 1, 8);
  END IF;

  -- Try username with increasing counter until unique
  LOOP
    BEGIN
      -- Generate username attempt
      IF counter = 0 THEN
        username_attempt := username_base;
      ELSE
        username_attempt := username_base || counter::text;
      END IF;

      -- Validate username length
      IF length(username_attempt) > 20 THEN
        username_attempt := substr(username_base, 1, 16) || counter::text;
      END IF;
      
      -- Try to insert profile
      INSERT INTO public.profiles (user_id, username)
      VALUES (NEW.id, username_attempt);
      
      -- Exit loop if insert succeeds
      EXIT;
      
    EXCEPTION 
      WHEN unique_violation THEN
        counter := counter + 1;
        IF counter >= max_attempts THEN
          -- Final fallback: use user ID
          username_attempt := 'user_' || substr(NEW.id::text, 1, 12);
          
          BEGIN
            INSERT INTO public.profiles (user_id, username)
            VALUES (NEW.id, username_attempt);
            EXIT;
          EXCEPTION 
            WHEN unique_violation THEN
              -- If even the fallback fails, generate a truly unique username
              username_attempt := 'user_' || encode(gen_random_bytes(8), 'hex');
              INSERT INTO public.profiles (user_id, username)
              VALUES (NEW.id, username_attempt);
              EXIT;
          END;
        END IF;
      WHEN others THEN
        -- Log unexpected errors and try to continue
        RAISE WARNING 'Unexpected error in create_profile_for_user: % %', SQLSTATE, SQLERRM;
        -- Wait a bit before retrying
        PERFORM pg_sleep(0.1);
        CONTINUE WHEN counter < max_attempts;
        -- If max attempts reached, use final fallback
        username_attempt := 'user_' || encode(gen_random_bytes(8), 'hex');
        INSERT INTO public.profiles (user_id, username)
        VALUES (NEW.id, username_attempt);
        EXIT;
    END;
  END LOOP;

  RETURN NEW;
EXCEPTION 
  WHEN others THEN
    -- Log error details
    RAISE WARNING 'Fatal error in create_profile_for_user: % %', SQLSTATE, SQLERRM;
    -- Re-raise the error
    RAISE;
END;
$$ LANGUAGE plpgsql;

-- Recreate trigger
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