-- ============================================
-- Add missing columns to dogs and puppies tables
-- Run this in Supabase SQL Editor
-- Safe to run multiple times (uses IF NOT EXISTS)
-- ============================================

-- ============================================
-- DOGS TABLE - Missing columns
-- ============================================

-- Photos array (multiple photos support)
ALTER TABLE dogs ADD COLUMN IF NOT EXISTS photos JSONB DEFAULT '[]';

-- Registration number
ALTER TABLE dogs ADD COLUMN IF NOT EXISTS registration_number VARCHAR(255);

-- Microchip number
ALTER TABLE dogs ADD COLUMN IF NOT EXISTS microchip VARCHAR(255);

-- Description (public-facing bio)
ALTER TABLE dogs ADD COLUMN IF NOT EXISTS description TEXT;

-- Guardian family info (JSON object with name, photo, location, notes)
ALTER TABLE dogs ADD COLUMN IF NOT EXISTS guardian_family JSONB;

-- ============================================
-- PUPPIES TABLE - Missing columns
-- ============================================

-- Photos array (multiple photos support)
ALTER TABLE puppies ADD COLUMN IF NOT EXISTS photos JSONB DEFAULT '[]';

-- Description (public-facing)
ALTER TABLE puppies ADD COLUMN IF NOT EXISTS description TEXT;

-- Best suited for text
ALTER TABLE puppies ADD COLUMN IF NOT EXISTS best_suited_for TEXT;

-- Video URL
ALTER TABLE puppies ADD COLUMN IF NOT EXISTS video_url TEXT;

-- Video featured flag
ALTER TABLE puppies ADD COLUMN IF NOT EXISTS video_featured BOOLEAN DEFAULT FALSE;

-- ============================================
-- Verify columns exist
-- ============================================
SELECT 'dogs' as table_name, column_name, data_type
FROM information_schema.columns
WHERE table_name = 'dogs'
ORDER BY ordinal_position;

SELECT 'puppies' as table_name, column_name, data_type
FROM information_schema.columns
WHERE table_name = 'puppies'
ORDER BY ordinal_position;
