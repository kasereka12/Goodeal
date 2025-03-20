DO $$
DECLARE
  admin_id uuid;
BEGIN
  -- Drop existing admin user if exists
  DELETE FROM auth.users WHERE email = 'admin@goodeaal.com';

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
    'admin@goodeaal.com',
    crypt('123456*', gen_salt('bf')), -- Password: 123456*
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
      'email', 'admin@goodeaal.com'
    ),
    'email',
    'admin@goodeaal.com', -- This is critical for email/password login
    now(),
    now(),
    now()
  );

  -- Ensure email is confirmed
  UPDATE auth.users
  SET email_confirmed_at = now()
  WHERE id = admin_id;
END $$;