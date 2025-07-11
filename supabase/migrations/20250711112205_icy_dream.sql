/*
  # Add location field to services

  1. Changes
    - Add `location` column to `mikegi_services` table
    - Allow null values for backward compatibility
    - Update existing records with default locations

  2. Notes
    - Location field is optional but recommended for better service details
    - Existing services will have null location initially
*/

-- Add location column to mikegi_services table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'mikegi_services' AND column_name = 'location'
  ) THEN
    ALTER TABLE mikegi_services ADD COLUMN location text;
  END IF;
END $$;