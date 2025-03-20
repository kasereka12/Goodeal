/*
  # Add transaction_type field to listings table
  
  1. Changes
     - Add transaction_type field to listings table
     - Update existing listings with default values
  
  2. Purpose
     - Allow users to specify if a listing is for sale or rent
     - Improve filtering capabilities for real estate and vehicle listings
*/

-- Add transaction_type column to listings table if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'listings' AND column_name = 'transaction_type'
  ) THEN
    ALTER TABLE listings ADD COLUMN transaction_type text;
    
    -- Set default values based on category
    UPDATE listings 
    SET transaction_type = 
      CASE 
        WHEN category = 'immobilier' THEN 'achat'
        WHEN category = 'vehicules' THEN 'achat'
        ELSE NULL
      END
    WHERE category IN ('immobilier', 'vehicules');
    
    -- Add comment to the column
    COMMENT ON COLUMN listings.transaction_type IS 'Type of transaction: achat (buy) or location (rent)';
  END IF;
END $$;

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS listings_transaction_type_idx ON listings (transaction_type);

-- Update sample data with transaction types
UPDATE listings
SET transaction_type = 'achat'
WHERE category IN ('immobilier', 'vehicules') 
AND transaction_type IS NULL;

-- Add some rental listings for variety
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
  user_id,
  transaction_type
)
SELECT
  CASE 
    WHEN category = 'immobilier' THEN 'Appartement à louer - Centre ville'
    WHEN category = 'vehicules' THEN 'Location voiture - ' || title
  END,
  CASE 
    WHEN category = 'immobilier' THEN 'Bel appartement à louer au centre ville, entièrement meublé et équipé.'
    WHEN category = 'vehicules' THEN 'Location de véhicule disponible à la journée, semaine ou mois. Kilométrage limité.'
  END,
  CASE 
    WHEN category = 'immobilier' THEN price / 200 -- Monthly rent
    WHEN category = 'vehicules' THEN price / 30 -- Daily rent
  END,
  category,
  subcategory,
  city,
  region,
  images,
  jsonb_set(
    filters, 
    '{transaction_type}', 
    '"location"'
  ),
  user_id,
  'location'
FROM listings
WHERE category IN ('immobilier', 'vehicules')
AND transaction_type = 'achat'
LIMIT 2;