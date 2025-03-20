/*
  # Create admin user and sample listings

  1. Admin User
    - Create admin user with email: admin@goodeaal.com and password: 123456*
    - Use auth.users table with proper constraints
  
  2. Sample Data
    - Create sample listings for different categories
    - Each listing includes detailed information and metadata
*/

-- Create admin user using auth.users table
DO $$
DECLARE
  admin_id uuid;
BEGIN
  -- First try to get existing admin user
  SELECT id INTO admin_id
  FROM auth.users
  WHERE email = 'admin@goodeaal.com';

  -- If admin doesn't exist, create it
  IF admin_id IS NULL THEN
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
      'admin@goodeaal.com',
      crypt('123456*', gen_salt('bf')),
      now(),
      '{"provider": "email", "providers": ["email"]}'::jsonb,
      '{"role": "admin"}'::jsonb,
      now(),
      now(),
      '',
      '',
      '',
      ''
    )
    RETURNING id INTO admin_id;
  END IF;

  -- Only insert sample data if we have an admin user
  IF admin_id IS NOT NULL THEN
    -- Electronics
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

    -- Real Estate
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

    -- Vehicles
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

    -- Crafts
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
  END IF;
END $$;