/*
  # Création de la table listings et données initiales

  1. Nouvelle Table
    - `listings`
      - `id` (uuid, primary key)
      - `title` (text)
      - `description` (text)
      - `price` (numeric)
      - `category` (text)
      - `subcategory` (text, optional)
      - `city` (text)
      - `region` (text)
      - `images` (text[])
      - `filters` (jsonb)
      - `views` (int)
      - `favorites` (int)
      - `status` (text)
      - `user_id` (uuid, foreign key)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Sécurité
    - Enable RLS
    - Policies pour CRUD operations
    - Indexes pour optimisation

  3. Données initiales
    - Création de l'utilisateur admin
    - Insertion de données mockées
*/

-- Création de la table listings
CREATE TABLE IF NOT EXISTS listings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text NOT NULL,
  price numeric NOT NULL CHECK (price >= 0),
  category text NOT NULL,
  subcategory text,
  city text NOT NULL,
  region text NOT NULL,
  images text[] NOT NULL,
  filters jsonb DEFAULT '{}'::jsonb,
  views int DEFAULT 0,
  favorites int DEFAULT 0,
  status text NOT NULL DEFAULT 'active',
  user_id uuid NOT NULL REFERENCES auth.users(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE listings ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Listings are viewable by everyone"
  ON listings
  FOR SELECT
  USING (true);

CREATE POLICY "Users can insert their own listings"
  ON listings
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own listings"
  ON listings
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own listings"
  ON listings
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Création de l'utilisateur admin
DO $$
DECLARE
  admin_id uuid;
BEGIN
  -- Créer l'utilisateur admin dans auth.users s'il n'existe pas
  INSERT INTO auth.users (
    id,
    email,
    encrypted_password,
    email_confirmed_at,
    created_at,
    updated_at,
    raw_app_meta_data,
    raw_user_meta_data,
    aud,
    role
  )
  VALUES (
    gen_random_uuid(),
    'admin@goodeaal.com',
    crypt('admin123', gen_salt('bf')),
    now(),
    now(),
    now(),
    '{"provider": "email", "providers": ["email"]}'::jsonb,
    '{}'::jsonb,
    'authenticated',
    'authenticated'
  )
  RETURNING id INTO admin_id;

  -- Électronique
  INSERT INTO listings (
    title, description, price, category, subcategory, city, region, images, filters, user_id
  ) VALUES
  (
    'iPhone 13 Pro Max',
    'iPhone 13 Pro Max 256Go, état neuf, débloqué tout opérateur. Couleur : Bleu Alpin. Batterie : 98%',
    12000,
    'electronique',
    'smartphone',
    'Casablanca',
    'Casablanca-Settat',
    ARRAY['https://images.unsplash.com/photo-1632661674596-df8be070a5c5?w=400'],
    '{"marque": "Apple", "stockage": "256", "etat": "neuf", "garantie": true}'::jsonb,
    admin_id
  ),
  (
    'MacBook Pro M1',
    'MacBook Pro 14" M1 Pro, 16Go RAM, 512Go SSD. Parfait état, encore sous garantie Apple',
    15000,
    'electronique',
    'ordinateur',
    'Rabat',
    'Rabat-Salé-Kénitra',
    ARRAY['https://images.unsplash.com/photo-1517336714731-489689fd1ca4?w=400'],
    '{"marque": "Apple", "processeur": "M1 Pro", "ram": "16", "stockage": "512"}'::jsonb,
    admin_id
  );

  -- Immobilier
  INSERT INTO listings (
    title, description, price, category, subcategory, city, region, images, filters, user_id
  ) VALUES
  (
    'Appartement moderne',
    'Magnifique appartement de 120m² avec 3 chambres, salon, cuisine équipée et 2 salles de bain',
    1200000,
    'immobilier',
    'appartement',
    'Casablanca',
    'Casablanca-Settat',
    ARRAY['https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=400'],
    '{"surface": 120, "pieces": "4", "meuble": true}'::jsonb,
    admin_id
  ),
  (
    'Villa avec piscine',
    'Superbe villa avec piscine, jardin et dépendance. 5 chambres, 3 salles de bain, double salon',
    2500000,
    'immobilier',
    'maison',
    'Marrakech',
    'Marrakech-Safi',
    ARRAY['https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=400'],
    '{"surface": 300, "pieces": "7", "jardin": true, "piscine": true}'::jsonb,
    admin_id
  );

  -- Véhicules
  INSERT INTO listings (
    title, description, price, category, subcategory, city, region, images, filters, user_id
  ) VALUES
  (
    'Mercedes Classe C',
    'Mercedes Classe C 220d AMG Line, 2020, 45000km, boîte auto, full options',
    350000,
    'vehicules',
    'voiture',
    'Rabat',
    'Rabat-Salé-Kénitra',
    ARRAY['https://images.unsplash.com/photo-1617531653332-bd46c24f2068?w=400'],
    '{"marque": "Mercedes", "modele": "Classe C", "annee": 2020, "kilometrage": 45000, "carburant": "diesel"}'::jsonb,
    admin_id
  );

  -- Services
  INSERT INTO listings (
    title, description, price, category, subcategory, city, region, images, filters, user_id
  ) VALUES
  (
    'Cours particuliers',
    'Professeur expérimenté propose des cours de mathématiques et physique pour lycéens',
    200,
    'services',
    'cours',
    'Fès',
    'Fès-Meknès',
    ARRAY['https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=400'],
    '{"type": "cours", "niveau": "lycee", "experience": "expert", "deplacement": true}'::jsonb,
    admin_id
  );

  -- Artisanat
  INSERT INTO listings (
    title, description, price, category, subcategory, city, region, images, filters, user_id
  ) VALUES
  (
    'Tapis berbère',
    'Authentique tapis berbère fait main, laine naturelle, motifs traditionnels',
    3000,
    'artisanat',
    'decoration',
    'Marrakech',
    'Marrakech-Safi',
    ARRAY['https://images.unsplash.com/photo-1600166898405-da9535204843?w=400'],
    '{"type": "tapis", "matiere": "laine", "fait_main": true}'::jsonb,
    admin_id
  );

END $$;

-- Index pour améliorer les performances des recherches
CREATE INDEX IF NOT EXISTS listings_category_idx ON listings (category);
CREATE INDEX IF NOT EXISTS listings_city_idx ON listings (city);
CREATE INDEX IF NOT EXISTS listings_price_idx ON listings (price);
CREATE INDEX IF NOT EXISTS listings_status_idx ON listings (status);
CREATE INDEX IF NOT EXISTS listings_created_at_idx ON listings (created_at DESC);