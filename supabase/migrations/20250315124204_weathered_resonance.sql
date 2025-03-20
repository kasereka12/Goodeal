/*
  # Set all existing listings as verified

  1. Changes
    - Update all existing listings to active status
    - Ensure proper status values
*/

-- Update all existing listings to active status
UPDATE listings 
SET 
  status = 'active',
  updated_at = now()
WHERE status = 'pending';

-- Add helpful comment
COMMENT ON TABLE listings IS 'Stores all listings with verification status';