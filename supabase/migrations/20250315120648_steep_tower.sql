-- Create admin user with proper credentials
DO $$
DECLARE
  admin_id uuid;
  admin_email text := 'admin@goodeaal.com';
  admin_password text := '123456*';
BEGIN
  -- Check if admin user already exists
  SELECT id INTO admin_id
  FROM auth.users
  WHERE email = admin_email;

  IF admin_id IS NULL THEN
    -- Create admin user
    INSERT INTO auth.users (
      instance_id,
      id,
      aud,
      role,
      email,
      encrypted_password,
      email_confirmed_at,
      raw_app_meta_data,
      raw_user_meta_data,
      created_at,
      updated_at,
      confirmation_token,
      email_change,
      email_change_token_new,
      recovery_token
    ) VALUES (
      '00000000-0000-0000-0000-000000000000',
      gen_random_uuid(),
      'authenticated',
      'authenticated',
      admin_email,
      crypt(admin_password, gen_salt('bf')),
      now(),
      jsonb_build_object(
        'provider', 'email',
        'providers', ARRAY['email']
      ),
      jsonb_build_object(
        'role', 'admin'
      ),
      now(),
      now(),
      encode(gen_random_bytes(32), 'base64'),
      '',
      encode(gen_random_bytes(32), 'base64'),
      encode(gen_random_bytes(32), 'base64')
    )
    RETURNING id INTO admin_id;

    -- Create identity for admin
    INSERT INTO auth.identities (
      id,
      user_id,
      identity_data,
      provider,
      provider_id,
      last_sign_in_at,
      created_at,
      updated_at
    ) VALUES (
      gen_random_uuid(),
      admin_id,
      jsonb_build_object(
        'sub', admin_id::text,
        'email', admin_email
      ),
      'email',
      admin_email,
      now(),
      now(),
      now()
    );
  ELSE
    -- Update existing admin password
    UPDATE auth.users
    SET 
      encrypted_password = crypt(admin_password, gen_salt('bf')),
      raw_user_meta_data = jsonb_build_object('role', 'admin'),
      updated_at = now(),
      email_confirmed_at = now()
    WHERE id = admin_id;
  END IF;
END $$;

-- Set session parameters for better timeout handling
SET statement_timeout = '120s';
SET idle_in_transaction_session_timeout = '120s';

-- Add index for better login performance
CREATE INDEX IF NOT EXISTS users_email_idx ON auth.users (email);

-- Add helpful comment
COMMENT ON TABLE auth.users IS 'Auth: Stores user login credentials and metadata';