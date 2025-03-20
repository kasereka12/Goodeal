-- Insert vehicle brands and models data
DO $$
DECLARE
  brand_id uuid;
BEGIN
  -- Audi
  INSERT INTO vehicle_brands (name, slug, country)
  VALUES ('Audi', 'audi', 'Allemagne')
  RETURNING id INTO brand_id;

  INSERT INTO vehicle_models (brand_id, name, slug, start_year, end_year) VALUES
    (brand_id, 'A1', 'a1', 2010, NULL),
    (brand_id, 'A3', 'a3', 1996, NULL),
    (brand_id, 'A4', 'a4', 1994, NULL),
    (brand_id, 'A5', 'a5', 2007, NULL),
    (brand_id, 'A6', 'a6', 1994, NULL),
    (brand_id, 'A7', 'a7', 2010, NULL),
    (brand_id, 'A8', 'a8', 1994, NULL),
    (brand_id, 'Q2', 'q2', 2016, NULL),
    (brand_id, 'Q3', 'q3', 2011, NULL),
    (brand_id, 'Q5', 'q5', 2008, NULL),
    (brand_id, 'Q7', 'q7', 2005, NULL),
    (brand_id, 'Q8', 'q8', 2018, NULL);

  -- BMW
  INSERT INTO vehicle_brands (name, slug, country)
  VALUES ('BMW', 'bmw', 'Allemagne')
  RETURNING id INTO brand_id;

  INSERT INTO vehicle_models (brand_id, name, slug, start_year, end_year) VALUES
    (brand_id, 'Série 1', 'serie-1', 2004, NULL),
    (brand_id, 'Série 2', 'serie-2', 2014, NULL),
    (brand_id, 'Série 3', 'serie-3', 1975, NULL),
    (brand_id, 'Série 4', 'serie-4', 2013, NULL),
    (brand_id, 'Série 5', 'serie-5', 1972, NULL),
    (brand_id, 'Série 7', 'serie-7', 1977, NULL),
    (brand_id, 'X1', 'x1', 2009, NULL),
    (brand_id, 'X2', 'x2', 2018, NULL),
    (brand_id, 'X3', 'x3', 2003, NULL),
    (brand_id, 'X4', 'x4', 2014, NULL),
    (brand_id, 'X5', 'x5', 1999, NULL),
    (brand_id, 'X6', 'x6', 2008, NULL),
    (brand_id, 'X7', 'x7', 2019, NULL);

  -- Mercedes-Benz
  INSERT INTO vehicle_brands (name, slug, country)
  VALUES ('Mercedes-Benz', 'mercedes-benz', 'Allemagne')
  RETURNING id INTO brand_id;

  INSERT INTO vehicle_models (brand_id, name, slug, start_year, end_year) VALUES
    (brand_id, 'Classe A', 'classe-a', 1997, NULL),
    (brand_id, 'Classe B', 'classe-b', 2005, NULL),
    (brand_id, 'Classe C', 'classe-c', 1993, NULL),
    (brand_id, 'Classe E', 'classe-e', 1993, NULL),
    (brand_id, 'Classe S', 'classe-s', 1972, NULL),
    (brand_id, 'GLA', 'gla', 2013, NULL),
    (brand_id, 'GLB', 'glb', 2019, NULL),
    (brand_id, 'GLC', 'glc', 2015, NULL),
    (brand_id, 'GLE', 'gle', 2015, NULL),
    (brand_id, 'GLS', 'gls', 2015, NULL);

  -- Volkswagen
  INSERT INTO vehicle_brands (name, slug, country)
  VALUES ('Volkswagen', 'volkswagen', 'Allemagne')
  RETURNING id INTO brand_id;

  INSERT INTO vehicle_models (brand_id, name, slug, start_year, end_year) VALUES
    (brand_id, 'Polo', 'polo', 1975, NULL),
    (brand_id, 'Golf', 'golf', 1974, NULL),
    (brand_id, 'Passat', 'passat', 1973, NULL),
    (brand_id, 'T-Roc', 't-roc', 2017, NULL),
    (brand_id, 'Tiguan', 'tiguan', 2007, NULL),
    (brand_id, 'Touareg', 'touareg', 2002, NULL);

  -- Peugeot
  INSERT INTO vehicle_brands (name, slug, country)
  VALUES ('Peugeot', 'peugeot', 'France')
  RETURNING id INTO brand_id;

  INSERT INTO vehicle_models (brand_id, name, slug, start_year, end_year) VALUES
    (brand_id, '208', '208', 2012, NULL),
    (brand_id, '308', '308', 2007, NULL),
    (brand_id, '2008', '2008', 2013, NULL),
    (brand_id, '3008', '3008', 2009, NULL),
    (brand_id, '5008', '5008', 2009, NULL);

  -- Renault
  INSERT INTO vehicle_brands (name, slug, country)
  VALUES ('Renault', 'renault', 'France')
  RETURNING id INTO brand_id;

  INSERT INTO vehicle_models (brand_id, name, slug, start_year, end_year) VALUES
    (brand_id, 'Clio', 'clio', 1990, NULL),
    (brand_id, 'Captur', 'captur', 2013, NULL),
    (brand_id, 'Megane', 'megane', 1995, NULL),
    (brand_id, 'Arkana', 'arkana', 2019, NULL),
    (brand_id, 'Scenic', 'scenic', 1996, NULL),
    (brand_id, 'Kadjar', 'kadjar', 2015, NULL);

  -- Toyota
  INSERT INTO vehicle_brands (name, slug, country)
  VALUES ('Toyota', 'toyota', 'Japon')
  RETURNING id INTO brand_id;

  INSERT INTO vehicle_models (brand_id, name, slug, start_year, end_year) VALUES
    (brand_id, 'Yaris', 'yaris', 1999, NULL),
    (brand_id, 'Corolla', 'corolla', 1966, NULL),
    (brand_id, 'C-HR', 'c-hr', 2016, NULL),
    (brand_id, 'RAV4', 'rav4', 1994, NULL),
    (brand_id, 'Camry', 'camry', 1982, NULL),
    (brand_id, 'Land Cruiser', 'land-cruiser', 1951, NULL);

  -- Honda
  INSERT INTO vehicle_brands (name, slug, country)
  VALUES ('Honda', 'honda', 'Japon')
  RETURNING id INTO brand_id;

  INSERT INTO vehicle_models (brand_id, name, slug, start_year, end_year) VALUES
    (brand_id, 'Civic', 'civic', 1972, NULL),
    (brand_id, 'CR-V', 'cr-v', 1995, NULL),
    (brand_id, 'HR-V', 'hr-v', 1998, NULL),
    (brand_id, 'Jazz', 'jazz', 2001, NULL);

  -- Hyundai
  INSERT INTO vehicle_brands (name, slug, country)
  VALUES ('Hyundai', 'hyundai', 'Corée du Sud')
  RETURNING id INTO brand_id;

  INSERT INTO vehicle_models (brand_id, name, slug, start_year, end_year) VALUES
    (brand_id, 'i10', 'i10', 2007, NULL),
    (brand_id, 'i20', 'i20', 2008, NULL),
    (brand_id, 'i30', 'i30', 2007, NULL),
    (brand_id, 'Kona', 'kona', 2017, NULL),
    (brand_id, 'Tucson', 'tucson', 2004, NULL),
    (brand_id, 'Santa Fe', 'santa-fe', 2000, NULL);

  -- Kia
  INSERT INTO vehicle_brands (name, slug, country)
  VALUES ('Kia', 'kia', 'Corée du Sud')
  RETURNING id INTO brand_id;

  INSERT INTO vehicle_models (brand_id, name, slug, start_year, end_year) VALUES
    (brand_id, 'Picanto', 'picanto', 2004, NULL),
    (brand_id, 'Rio', 'rio', 2000, NULL),
    (brand_id, 'Ceed', 'ceed', 2006, NULL),
    (brand_id, 'Sportage', 'sportage', 1993, NULL),
    (brand_id, 'Sorento', 'sorento', 2002, NULL),
    (brand_id, 'EV6', 'ev6', 2021, NULL);

END $$;