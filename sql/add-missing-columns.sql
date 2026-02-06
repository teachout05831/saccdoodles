-- Add missing columns to puppies table
-- Run this in Supabase SQL Editor

-- Add video_featured column
ALTER TABLE puppies ADD COLUMN IF NOT EXISTS video_featured BOOLEAN DEFAULT FALSE;

-- Add best_suited_for column
ALTER TABLE puppies ADD COLUMN IF NOT EXISTS best_suited_for TEXT;

-- Ensure photos column exists (JSONB for array of URLs)
ALTER TABLE puppies ADD COLUMN IF NOT EXISTS photos JSONB DEFAULT '[]';

-- Ensure video_url column exists
ALTER TABLE puppies ADD COLUMN IF NOT EXISTS video_url TEXT;

-- Ensure description column exists
ALTER TABLE puppies ADD COLUMN IF NOT EXISTS description TEXT;

-- Verify columns exist
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'puppies'
ORDER BY ordinal_position;
