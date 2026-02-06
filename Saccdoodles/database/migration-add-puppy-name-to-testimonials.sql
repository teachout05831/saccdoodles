-- ============================================
-- Migration: Add puppy_name to testimonials table
-- Run this in Supabase SQL Editor if you've already created the testimonials table
-- ============================================

-- Add puppy_name column to testimonials table
ALTER TABLE testimonials
ADD COLUMN IF NOT EXISTS puppy_name VARCHAR(255);

-- Add comment to explain the field
COMMENT ON COLUMN testimonials.puppy_name IS 'Optional puppy name to display with testimonial (e.g., "Proud owner of Cooper")';
