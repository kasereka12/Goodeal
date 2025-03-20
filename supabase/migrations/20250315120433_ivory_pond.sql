/*
  # Configure auth settings and timeouts
  
  1. Changes
    - Create auth settings table
    - Add email configuration
    - Set default timeouts
    - Disable email confirmation
*/

-- Create auth settings table if it doesn't exist
CREATE TABLE IF NOT EXISTS auth.settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  value jsonb NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create function to update auth settings
CREATE OR REPLACE FUNCTION auth.update_settings(
  setting_name text,
  setting_value jsonb
)
RETURNS void AS $$
BEGIN
  INSERT INTO auth.settings (name, value)
  VALUES (setting_name, setting_value)
  ON CONFLICT (name) DO UPDATE
  SET 
    value = setting_value,
    updated_at = now();
END;
$$ LANGUAGE plpgsql;

-- Update auth settings
SELECT auth.update_settings(
  'email_provider',
  jsonb_build_object(
    'email_confirm_required', false,
    'enable_signup', true,
    'mailer_autoconfirm', true,
    'external_email_enabled', false,
    'request_timeout', 120,
    'max_retries', 3,
    'smtp_admin_email', 'admin@example.com',
    'smtp_host', 'smtp.example.com',
    'smtp_port', '587',
    'smtp_user', 'smtp_user',
    'smtp_pass', 'smtp_pass',
    'smtp_max_frequency', 60,
    'mailer_templates', jsonb_build_object(
      'confirmation', jsonb_build_object(
        'subject', 'Confirmez votre email',
        'content_html', '
          <h2>Confirmez votre email</h2>
          <p>Suivez ce lien pour confirmer votre email :</p>
          <p><a href="{{ .ConfirmationURL }}">Confirmer mon email</a></p>
          <p>Ce lien expirera dans 1 heure.</p>
        ',
        'content_text', '
          Confirmez votre email
          Suivez ce lien pour confirmer votre email : {{ .ConfirmationURL }}
          Ce lien expirera dans 1 heure.
        '
      ),
      'recovery', jsonb_build_object(
        'subject', 'Réinitialisation de mot de passe',
        'content_html', '
          <h2>Réinitialisation de mot de passe</h2>
          <p>Suivez ce lien pour réinitialiser votre mot de passe :</p>
          <p><a href="{{ .ConfirmationURL }}">Réinitialiser mon mot de passe</a></p>
          <p>Ce lien expirera dans 1 heure.</p>
        ',
        'content_text', '
          Réinitialisation de mot de passe
          Suivez ce lien pour réinitialiser votre mot de passe : {{ .ConfirmationURL }}
          Ce lien expirera dans 1 heure.
        '
      ),
      'magic_link', jsonb_build_object(
        'subject', 'Votre lien de connexion',
        'content_html', '
          <h2>Votre lien de connexion</h2>
          <p>Suivez ce lien pour vous connecter :</p>
          <p><a href="{{ .ConfirmationURL }}">Se connecter</a></p>
          <p>Ce lien expirera dans 1 heure.</p>
        ',
        'content_text', '
          Votre lien de connexion
          Suivez ce lien pour vous connecter : {{ .ConfirmationURL }}
          Ce lien expirera dans 1 heure.
        '
      )
    )
  )
);

-- Set statement timeout in the database configuration
DO $$
BEGIN
  -- Set session timeout for current connection
  SET statement_timeout = '120s';
  SET idle_in_transaction_session_timeout = '120s';
END $$;

-- Add helpful comments
COMMENT ON TABLE auth.settings IS 'Stores authentication settings and configurations';
COMMENT ON FUNCTION auth.update_settings IS 'Updates authentication settings safely';