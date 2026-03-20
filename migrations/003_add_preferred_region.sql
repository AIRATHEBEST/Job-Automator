/*
  # Add Preferred Region to Profiles

  1. Changes
    - Add `preferred_region` column to profiles table
    - Default to 'us' for existing users
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'preferred_region'
  ) THEN
    ALTER TABLE profiles ADD COLUMN preferred_region TEXT DEFAULT 'us';
  END IF;
END $$;
