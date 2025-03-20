/*
  # Fix signup database error

  1. Changes
    - Improve error handling in profile creation trigger
    - Add better validation for user metadata
    - Fix transaction handling
    - Add proper error messages
*/

-- Drop existing profile triggers and functions
DROP TRIGGER IF EXISTS create_profile_after_user_creation ON auth.users;
DROP FUNCTION IF EXISTS create_profile_for_user();

-- Create improved profile creation trigger with better error handling
CREATE OR REPLACE FUNCTION create_profile_for_user()
RETURNS TRIGGER AS $$
DECLARE
  username_base text;
  display_name text;
  phone_number text;
  username_attempt text;
  counter int := 0;
  max_attempts int := 100;
BEGIN
  -- Input validation
  IF NEW.id IS NULL THEN
    RAISE EXCEPTION 'User ID cannot be null';
  END IF;

  -- Get metadata values with validation
  BEGIN
    display_name := NEW.raw_user_meta_data->>'display_name';
    phone_number := NEW.raw_user_meta_data->>'phone_number';
  EXCEPTION WHEN OTHERS THEN
    -- If metadata is invalid, log error and continue with defaults
    RAISE WARNING 'Invalid metadata for user %: %', NEW.id, SQLERRM;
    display_name := NULL;
    phone_number := NULL;
  END;
  
  -- Get base username from metadata or email
  username_base := COALESCE(
    NEW.raw_user_meta_data->>'username',
    display_name,
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
      INSERT INTO public.profiles (
        user_id,
        username,
        display_name,
        phone_number,
        created_at,
        updated_at
      )
      VALUES (
        NEW.id,
        username_attempt,
        NULLIF(display_name, ''), -- Convert empty string to NULL
        NULLIF(phone_number, ''), -- Convert empty string to NULL
        now(),
        now()
      );
      
      -- Exit loop if insert succeeds
      EXIT;
      
    EXCEPTION 
      WHEN unique_violation THEN
        counter := counter + 1;
        IF counter >= max_attempts THEN
          -- Final fallback: use user ID
          username_attempt := 'user_' || substr(NEW.id::text, 1, 12);
          
          BEGIN
            INSERT INTO public.profiles (
              user_id,
              username,
              display_name,
              phone_number,
              created_at,
              updated_at
            )
            VALUES (
              NEW.id,
              username_attempt,
              NULLIF(display_name, ''),
              NULLIF(phone_number, ''),
              now(),
              now()
            );
            EXIT;
          EXCEPTION 
            WHEN unique_violation THEN
              -- If even the fallback fails, generate a truly unique username
              username_attempt := 'user_' || encode(gen_random_bytes(8), 'hex');
              INSERT INTO public.profiles (
                user_id,
                username,
                display_name,
                phone_number,
                created_at,
                updated_at
              )
              VALUES (
                NEW.id,
                username_attempt,
                NULLIF(display_name, ''),
                NULLIF(phone_number, ''),
                now(),
                now()
              );
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
        INSERT INTO public.profiles (
          user_id,
          username,
          display_name,
          phone_number,
          created_at,
          updated_at
        )
        VALUES (
          NEW.id,
          username_attempt,
          NULLIF(display_name, ''),
          NULLIF(phone_number, ''),
          now(),
          now()
        );
        EXIT;
    END;
  END LOOP;

  RETURN NEW;
EXCEPTION 
  WHEN others THEN
    -- Log error details
    RAISE WARNING 'Fatal error in create_profile_for_user: % %', SQLSTATE, SQLERRM;
    -- Re-raise the error with a more user-friendly message
    RAISE EXCEPTION 'Failed to create user profile. Please try again.';
END;
$$ LANGUAGE plpgsql;

-- Recreate trigger
CREATE TRIGGER create_profile_after_user_creation
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION create_profile_for_user();

-- Add helpful comments
COMMENT ON FUNCTION create_profile_for_user IS 'Creates a profile with unique username and metadata for new users';
COMMENT ON TRIGGER create_profile_after_user_creation ON auth.users IS 'Automatically creates profile when new user is created';