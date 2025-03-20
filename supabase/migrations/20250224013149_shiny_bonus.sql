/*
  # Vehicle Database Schema

  1. New Tables
    - `vehicle_brands`: Marques de véhicules
    - `vehicle_models`: Modèles par marque
    - `vehicle_generations`: Générations de modèles
    - `vehicle_trims`: Finitions par génération
    - `vehicle_engines`: Motorisations disponibles
    - `vehicle_transmissions`: Types de transmission
    - `vehicle_body_types`: Types de carrosserie
    - `vehicle_colors`: Couleurs disponibles
    - `vehicle_features`: Équipements disponibles
    - `vehicle_listings`: Annonces de véhicules

  2. Security
    - Enable RLS on all tables
    - Add policies for data access
    - Add validation constraints

  3. Indexes
    - Optimized indexes for common queries
    - B-tree indexes for exact matches
    - Text search capabilities
*/

-- Enable pg_trgm extension for text search
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- Create vehicle_brands table
CREATE TABLE vehicle_brands (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text NOT NULL UNIQUE,
  country text,
  logo_url text,
  active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create vehicle_models table
CREATE TABLE vehicle_models (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  brand_id uuid NOT NULL REFERENCES vehicle_brands(id),
  name text NOT NULL,
  slug text NOT NULL,
  start_year int NOT NULL,
  end_year int,
  active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(brand_id, slug)
);

-- Create vehicle_generations table
CREATE TABLE vehicle_generations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  model_id uuid NOT NULL REFERENCES vehicle_models(id),
  name text NOT NULL,
  start_year int NOT NULL,
  end_year int,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create vehicle_trims table
CREATE TABLE vehicle_trims (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  generation_id uuid NOT NULL REFERENCES vehicle_generations(id),
  name text NOT NULL,
  start_year int NOT NULL,
  end_year int,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create vehicle_engines table
CREATE TABLE vehicle_engines (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  fuel_type text NOT NULL,
  displacement numeric,
  power int,
  torque int,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  CHECK (fuel_type IN ('essence', 'diesel', 'hybride', 'electrique', 'gpl'))
);

-- Create vehicle_transmissions table
CREATE TABLE vehicle_transmissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  type text NOT NULL,
  gears int,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  CHECK (type IN ('manuelle', 'automatique', 'semi-automatique', 'cvt'))
);

-- Create vehicle_body_types table
CREATE TABLE vehicle_body_types (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text NOT NULL UNIQUE,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create vehicle_colors table
CREATE TABLE vehicle_colors (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  hex_code text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create vehicle_features table
CREATE TABLE vehicle_features (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  category text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  CHECK (category IN ('securite', 'confort', 'multimedia', 'performance', 'autre'))
);

-- Create vehicle_listings table
CREATE TABLE vehicle_listings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id),
  brand_id uuid NOT NULL REFERENCES vehicle_brands(id),
  model_id uuid NOT NULL REFERENCES vehicle_models(id),
  generation_id uuid REFERENCES vehicle_generations(id),
  trim_id uuid REFERENCES vehicle_trims(id),
  engine_id uuid REFERENCES vehicle_engines(id),
  transmission_id uuid REFERENCES vehicle_transmissions(id),
  body_type_id uuid REFERENCES vehicle_body_types(id),
  color_id uuid REFERENCES vehicle_colors(id),
  year int NOT NULL,
  mileage int NOT NULL,
  price numeric NOT NULL,
  description text NOT NULL,
  features jsonb DEFAULT '[]'::jsonb,
  images text[] NOT NULL,
  city text NOT NULL,
  region text NOT NULL,
  status text NOT NULL DEFAULT 'active',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  CHECK (year BETWEEN 1900 AND EXTRACT(YEAR FROM now())),
  CHECK (mileage >= 0),
  CHECK (price >= 0),
  CHECK (status IN ('active', 'pending', 'sold', 'archived'))
);

-- Create text search indexes using pg_trgm
CREATE INDEX vehicle_brands_name_trgm_idx ON vehicle_brands USING gin(name gin_trgm_ops);
CREATE INDEX vehicle_models_name_trgm_idx ON vehicle_models USING gin(name gin_trgm_ops);

-- Create B-tree indexes for common queries
CREATE INDEX vehicle_listings_brand_id_idx ON vehicle_listings(brand_id);
CREATE INDEX vehicle_listings_model_id_idx ON vehicle_listings(model_id);
CREATE INDEX vehicle_listings_year_idx ON vehicle_listings(year);
CREATE INDEX vehicle_listings_price_idx ON vehicle_listings(price);
CREATE INDEX vehicle_listings_city_idx ON vehicle_listings(city);
CREATE INDEX vehicle_listings_status_idx ON vehicle_listings(status);
CREATE INDEX vehicle_listings_created_at_idx ON vehicle_listings(created_at DESC);

-- Enable RLS
ALTER TABLE vehicle_brands ENABLE ROW LEVEL SECURITY;
ALTER TABLE vehicle_models ENABLE ROW LEVEL SECURITY;
ALTER TABLE vehicle_generations ENABLE ROW LEVEL SECURITY;
ALTER TABLE vehicle_trims ENABLE ROW LEVEL SECURITY;
ALTER TABLE vehicle_engines ENABLE ROW LEVEL SECURITY;
ALTER TABLE vehicle_transmissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE vehicle_body_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE vehicle_colors ENABLE ROW LEVEL SECURITY;
ALTER TABLE vehicle_features ENABLE ROW LEVEL SECURITY;
ALTER TABLE vehicle_listings ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Public read access"
  ON vehicle_brands FOR SELECT
  USING (true);

CREATE POLICY "Public read access"
  ON vehicle_models FOR SELECT
  USING (true);

CREATE POLICY "Public read access"
  ON vehicle_generations FOR SELECT
  USING (true);

CREATE POLICY "Public read access"
  ON vehicle_trims FOR SELECT
  USING (true);

CREATE POLICY "Public read access"
  ON vehicle_engines FOR SELECT
  USING (true);

CREATE POLICY "Public read access"
  ON vehicle_transmissions FOR SELECT
  USING (true);

CREATE POLICY "Public read access"
  ON vehicle_body_types FOR SELECT
  USING (true);

CREATE POLICY "Public read access"
  ON vehicle_colors FOR SELECT
  USING (true);

CREATE POLICY "Public read access"
  ON vehicle_features FOR SELECT
  USING (true);

-- Policies for vehicle_listings
CREATE POLICY "Public read access for active listings"
  ON vehicle_listings FOR SELECT
  USING (status = 'active' OR auth.uid() = user_id);

CREATE POLICY "Users can create their own listings"
  ON vehicle_listings FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own listings"
  ON vehicle_listings FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own listings"
  ON vehicle_listings FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create functions for validation and suggestions
CREATE OR REPLACE FUNCTION validate_vehicle_year(
  brand_id uuid,
  model_id uuid,
  year int
) RETURNS boolean
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM vehicle_models
    WHERE id = model_id
    AND brand_id = brand_id
    AND year BETWEEN start_year AND COALESCE(end_year, EXTRACT(YEAR FROM now()))
  );
END;
$$;

-- Create view for listings with related data
CREATE OR REPLACE VIEW vehicle_listings_with_details AS
SELECT 
  l.*,
  b.name as brand_name,
  m.name as model_name,
  g.name as generation_name,
  t.name as trim_name,
  e.name as engine_name,
  tr.name as transmission_name,
  bt.name as body_type_name,
  c.name as color_name,
  get_user_data(l.user_id) as user_data
FROM vehicle_listings l
LEFT JOIN vehicle_brands b ON b.id = l.brand_id
LEFT JOIN vehicle_models m ON m.id = l.model_id
LEFT JOIN vehicle_generations g ON g.id = l.generation_id
LEFT JOIN vehicle_trims t ON t.id = l.trim_id
LEFT JOIN vehicle_engines e ON e.id = l.engine_id
LEFT JOIN vehicle_transmissions tr ON tr.id = l.transmission_id
LEFT JOIN vehicle_body_types bt ON bt.id = l.body_type_id
LEFT JOIN vehicle_colors c ON c.id = l.color_id;

-- Grant permissions
GRANT SELECT ON vehicle_listings_with_details TO authenticated;
GRANT SELECT ON vehicle_listings_with_details TO anon;