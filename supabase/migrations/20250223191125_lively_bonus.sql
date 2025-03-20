/*
  # Add cities table and data

  1. New Tables
    - `cities`
      - `id` (uuid, primary key)
      - `name` (text, unique)
      - `region` (text)
      - `population` (integer, nullable)
      - `latitude` (numeric)
      - `longitude` (numeric)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS on `cities` table
    - Add policy for public read access
    - Add policy for admin write access

  3. Data
    - Insert Moroccan cities data
*/

-- Create cities table
CREATE TABLE IF NOT EXISTS cities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text UNIQUE NOT NULL,
  region text NOT NULL,
  population integer,
  latitude numeric NOT NULL,
  longitude numeric NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE cities ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Cities are viewable by everyone"
  ON cities
  FOR SELECT
  USING (true);

CREATE POLICY "Only admins can modify cities"
  ON cities
  USING (auth.jwt() ->> 'role' = 'admin');

-- Create indexes
CREATE INDEX IF NOT EXISTS cities_name_idx ON cities (name);
CREATE INDEX IF NOT EXISTS cities_region_idx ON cities (region);

-- Insert cities data
INSERT INTO cities (name, region, population, latitude, longitude) VALUES
  ('Casablanca', 'Casablanca-Settat', 3359818, 33.5731, -7.5898),
  ('Rabat', 'Rabat-Salé-Kénitra', 577827, 34.0209, -6.8416),
  ('Fès', 'Fès-Meknès', 1112072, 34.0333, -5.0000),
  ('Marrakech', 'Marrakech-Safi', 928850, 31.6295, -7.9811),
  ('Tanger', 'Tanger-Tétouan-Al Hoceïma', 947952, 35.7595, -5.8340),
  ('Meknès', 'Fès-Meknès', 632079, 33.8935, -5.5547),
  ('Oujda', 'Oriental', 494252, 34.6867, -1.9114),
  ('Kénitra', 'Rabat-Salé-Kénitra', 431282, 34.2610, -6.5802),
  ('Agadir', 'Souss-Massa', 421844, 30.4278, -9.5981),
  ('Tétouan', 'Tanger-Tétouan-Al Hoceïma', 380787, 35.5789, -5.3626),
  ('Safi', 'Marrakech-Safi', 308508, 32.2994, -9.2372),
  ('Mohammedia', 'Casablanca-Settat', 208612, 33.6866, -7.3830),
  ('El Jadida', 'Casablanca-Settat', 194934, 33.2316, -8.5007),
  ('Béni Mellal', 'Béni Mellal-Khénifra', 192676, 32.3373, -6.3498),
  ('Nador', 'Oriental', 161726, 35.1667, -2.9333),
  ('Chefchaouen', 'Tanger-Tétouan-Al Hoceïma', 42786, 35.1688, -5.2636),
  ('Essaouira', 'Marrakech-Safi', 77966, 31.5085, -9.7595),
  ('Ouarzazate', 'Drâa-Tafilalet', 71067, 30.9335, -6.8956),
  ('Merzouga', 'Drâa-Tafilalet', NULL, 31.0819, -4.0088),
  ('Ifrane', 'Fès-Meknès', 73782, 33.5333, -5.1000),
  ('Al Hoceima', 'Tanger-Tétouan-Al Hoceïma', 55357, 35.2517, -3.9372),
  ('Asilah', 'Tanger-Tétouan-Al Hoceïma', 31147, 35.4667, -6.0333),
  ('Larache', 'Tanger-Tétouan-Al Hoceïma', 125008, 35.1933, -6.1562),
  ('Dakhla', 'Dakhla-Oued Ed-Dahab', 106277, 23.7148, -15.9362),
  ('Taroudant', 'Souss-Massa', 80149, 30.4703, -8.8766),
  ('Taza', 'Fès-Meknès', 139686, 34.2167, -4.0167),
  ('Khemisset', 'Rabat-Salé-Kénitra', 131542, 33.8242, -6.0658),
  ('Tiznit', 'Souss-Massa', 74699, 29.7000, -9.7333),
  ('Salé', 'Rabat-Salé-Kénitra', 890403, 34.0333, -6.8000),
  ('Khouribga', 'Béni Mellal-Khénifra', 196196, 32.8811, -6.9063),
  ('Settat', 'Casablanca-Settat', 142250, 33.0000, -7.6167),
  ('Berrechid', 'Casablanca-Settat', 136634, 33.2653, -7.5877),
  ('Khénifra', 'Béni Mellal-Khénifra', 117510, 32.9333, -5.6667),
  ('Taourirt', 'Oriental', 80024, 34.4000, -2.8833)
ON CONFLICT (name) DO UPDATE SET
  region = EXCLUDED.region,
  population = EXCLUDED.population,
  latitude = EXCLUDED.latitude,
  longitude = EXCLUDED.longitude,
  updated_at = now();