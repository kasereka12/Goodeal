-- Create requests table
CREATE TABLE IF NOT EXISTS requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text NOT NULL,
  category text NOT NULL,
  urgency text NOT NULL CHECK (urgency IN ('low', 'medium', 'high')),
  budget numeric,
  city text,
  filters jsonb DEFAULT '{}'::jsonb,
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'closed', 'expired')),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE requests ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Requests are viewable by everyone"
  ON requests
  FOR SELECT
  USING (true);

CREATE POLICY "Users can create their own requests"
  ON requests
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own requests"
  ON requests
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own requests"
  ON requests
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create indexes
CREATE INDEX requests_user_id_idx ON requests (user_id);
CREATE INDEX requests_category_idx ON requests (category);
CREATE INDEX requests_city_idx ON requests (city);
CREATE INDEX requests_status_idx ON requests (status);
CREATE INDEX requests_created_at_idx ON requests (created_at DESC);

-- Create view with user data
CREATE OR REPLACE VIEW requests_with_users AS
SELECT 
  r.*,
  get_user_data(r.user_id) as user_data
FROM requests r;

-- Grant permissions
GRANT SELECT ON requests_with_users TO authenticated;
GRANT SELECT ON requests_with_users TO anon;