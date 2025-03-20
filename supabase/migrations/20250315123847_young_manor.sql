/*
  # Fix admin user creation and login

  1. Changes
    - Properly create admin user with correct password hash
    - Ensure proper provider_id for authentication
    - Set confirmed email status
*/

-- Drop and recreate admin user to ensure clean state
DO $$
DECLARE
  admin_id uuid;
  admin_email text := 'admin@goodeaal.com';
  admin_password text := '123456*';
BEGIN
  -- Delete existing admin user if exists
  DELETE FROM auth.users WHERE email = admin_email;
  
  -- Create new admin user with proper credentials
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
    recovery_token
  ) VALUES (
    '00000000-0000-0000-0000-000000000000',
    gen_random_uuid(),
    'authenticated',
    'authenticated',
    admin_email,
    crypt(admin_password, gen_salt('bf')),
    now(), -- Email confirmed
    jsonb_build_object(
      'provider', 'email',
      'providers', ARRAY['email']
    ),
    jsonb_build_object('role', 'admin'),
    now(),
    now(),
    encode(gen_random_bytes(32), 'base64'),
    encode(gen_random_bytes(32), 'base64')
  )
  RETURNING id INTO admin_id;

  -- Create identity with proper provider_id
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
    admin_email, -- This is critical for email/password login
    now(),
    now(),
    now()
  );

  -- Ensure email is confirmed
  UPDATE auth.users
  SET email_confirmed_at = now()
  WHERE id = admin_id;
END $$;