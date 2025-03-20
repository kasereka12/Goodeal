/*
  # Add user metadata handling and profile improvements

  1. Changes
    - Add trigger to sync user metadata with profiles
    - Add phone number validation
    - Improve profile creation with metadata sync
    - Add indexes for better performance

  2. Security
    - Maintain existing RLS policies
    - Add validation for phone numbers
*/

-- Drop existing profile triggers and functions
DROP TRIGGER IF EXISTS create_profile_after_user_creation ON auth.users;
DROP FUNCTION IF EXISTS create_profile_for_user();

-- Create improved profile creation trigger
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
  -- Get metadata values
  display_name := NEW.raw_user_meta_data->>'display_name';
  phone_number := NEW.raw_user_meta_data->>'phone_number';
  
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
  
  -- Ensure minimum length
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
      
      -- Insert profile with all metadata
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
        display_name,
        phone_number,
        now(),
        now()
      );
      
      EXIT; -- Exit loop if insert succeeds
      
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
              display_name,
              phone_number,
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
                display_name,
                phone_number,
                now(),
                now()
              );
              EXIT;
          END;
        END IF;
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

-- Add display_name and phone_number columns to profiles if they don't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'display_name'
  ) THEN
    ALTER TABLE profiles ADD COLUMN display_name text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'phone_number'
  ) THEN
    ALTER TABLE profiles ADD COLUMN phone_number text;
  END IF;
END $$;

-- Create function to validate phone number format
CREATE OR REPLACE FUNCTION is_valid_phone_number(phone text)
RETURNS boolean AS $$
BEGIN
  RETURN phone ~ '^\+[1-9]\d{1,14}$';
END;
$$ LANGUAGE plpgsql;

-- Add phone number constraint
ALTER TABLE profiles
DROP CONSTRAINT IF EXISTS valid_phone_number;

ALTER TABLE profiles
ADD CONSTRAINT valid_phone_number
CHECK (
  phone_number IS NULL OR 
  is_valid_phone_number(phone_number)
);

-- Create function to sync profile with user metadata
CREATE OR REPLACE FUNCTION sync_profile_with_metadata()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.profiles
  SET
    display_name = NEW.raw_user_meta_data->>'display_name',
    phone_number = NEW.raw_user_meta_data->>'phone_number',
    updated_at = now()
  WHERE user_id = NEW.id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to sync profile when user metadata changes
DROP TRIGGER IF EXISTS sync_profile_metadata ON auth.users;
CREATE TRIGGER sync_profile_metadata
  AFTER UPDATE OF raw_user_meta_data ON auth.users
  FOR EACH ROW
  WHEN (OLD.raw_user_meta_data IS DISTINCT FROM NEW.raw_user_meta_data)
  EXECUTE FUNCTION sync_profile_with_metadata();

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS profiles_display_name_idx ON profiles (display_name);
CREATE INDEX IF NOT EXISTS profiles_phone_number_idx ON profiles (phone_number);

-- Add helpful comments
COMMENT ON FUNCTION create_profile_for_user IS 'Creates a profile with unique username and metadata for new users';
COMMENT ON FUNCTION is_valid_phone_number IS 'Validates international phone number format';
COMMENT ON FUNCTION sync_profile_with_metadata IS 'Syncs profile data when user metadata changes';