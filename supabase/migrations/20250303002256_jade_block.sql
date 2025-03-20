/*
  # Add Artisanat category and sample data

  1. New Data
    - Add sample listings for the new "artisanat" category
  
  2. Changes
    - Insert sample artisanat listings with appropriate filters
*/

-- Insert sample artisanat listings
DO $$
DECLARE
  admin_id uuid;
BEGIN
  -- Get admin user ID
  SELECT id INTO admin_id
  FROM auth.users
  WHERE email = 'contact@myfirst-property.com'
  LIMIT 1;

  -- Only insert data if we have an admin user
  IF admin_id IS NOT NULL THEN
    -- Artisanat listings
    INSERT INTO listings (
      title, 
      description, 
      price, 
      category, 
      subcategory, 
      city, 
      region, 
      images, 
      filters, 
      user_id
    ) VALUES
    (
      'Tapis berbère authentique',
      'Magnifique tapis berbère fait main en laine naturelle. Motifs traditionnels de l''Atlas. Dimensions: 200x150cm.',
      3500,
      'artisanat',
      'tapis',
      'Marrakech',
      'Marrakech-Safi',
      ARRAY['https://images.unsplash.com/photo-1600166898405-da9535204843?w=800'],
      '{"type": "tapis", "matiere": "laine", "origine": "maroc", "fait_main": true, "authentique": true, "dimensions": "grand"}'::jsonb,
      admin_id
    ),
    (
      'Poterie traditionnelle de Safi',
      'Belle poterie traditionnelle de Safi, entièrement faite et peinte à la main. Parfaite pour la décoration ou comme cadeau souvenir.',
      850,
      'artisanat',
      'poterie',
      'Safi',
      'Marrakech-Safi',
      ARRAY['https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?w=800'],
      '{"type": "poterie", "matiere": "ceramique", "origine": "maroc", "fait_main": true, "authentique": true, "dimensions": "moyen"}'::jsonb,
      admin_id
    ),
    (
      'Lanterne marocaine en métal ciselé',
      'Superbe lanterne marocaine en métal ciselé à la main. Projette de magnifiques motifs lumineux. Parfaite pour créer une ambiance chaleureuse.',
      1200,
      'artisanat',
      'decoration',
      'Fès',
      'Fès-Meknès',
      ARRAY['https://images.unsplash.com/photo-1596397249129-c7a8f8718873?w=800'],
      '{"type": "decoration", "matiere": "metal", "origine": "maroc", "fait_main": true, "authentique": true, "dimensions": "moyen"}'::jsonb,
      admin_id
    ),
    (
      'Poufs en cuir véritable',
      'Lot de 2 poufs marocains en cuir véritable, cousus et brodés à la main. Confortables et décoratifs.',
      1800,
      'artisanat',
      'decoration',
      'Casablanca',
      'Casablanca-Settat',
      ARRAY['https://images.unsplash.com/photo-1583847268964-b28dc8f51f92?w=800'],
      '{"type": "decoration", "matiere": "cuir", "origine": "maroc", "fait_main": true, "authentique": true, "dimensions": "moyen"}'::jsonb,
      admin_id
    ),
    (
      'Bijoux berbères en argent',
      'Collection de bijoux berbères authentiques en argent. Comprend un bracelet, un collier et des boucles d''oreille.',
      2500,
      'artisanat',
      'bijoux',
      'Agadir',
      'Souss-Massa',
      ARRAY['https://images.unsplash.com/photo-1602173574767-37ac01994b2a?w=800'],
      '{"type": "bijoux", "matiere": "metal", "origine": "maroc", "fait_main": true, "authentique": true, "ancien": true}'::jsonb,
      admin_id
    ),
    (
      'Tableau art moderne inspiré du Maroc',
      'Tableau d''art moderne aux couleurs vives, inspiré des paysages et de la culture marocaine. Pièce unique signée par l''artiste.',
      4200,
      'artisanat',
      'tableaux',
      'Rabat',
      'Rabat-Salé-Kénitra',
      ARRAY['https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?w=800'],
      '{"type": "tableaux", "matiere": "autre", "origine": "maroc", "fait_main": true, "authentique": true, "dimensions": "grand"}'::jsonb,
      admin_id
    );
  END IF;
END $$;