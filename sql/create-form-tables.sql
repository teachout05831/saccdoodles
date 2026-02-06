-- =============================================
-- SACC Doodles - Form Submission Tables
-- Run this in Supabase SQL Editor
-- =============================================

-- Contact Submissions Table
CREATE TABLE IF NOT EXISTS contact_submissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT,
    subject TEXT,
    message TEXT NOT NULL,
    read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Guardian Applications Table
CREATE TABLE IF NOT EXISTS guardian_applications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT,
    address TEXT,
    home_type TEXT,
    yard_fenced BOOLEAN,
    gender_preference TEXT,
    breed_preference TEXT,
    why_interested TEXT,
    status TEXT DEFAULT 'Pending',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- Row Level Security (RLS) Policies
-- =============================================

-- Enable RLS on tables
ALTER TABLE contact_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE guardian_applications ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (safe to re-run)
DROP POLICY IF EXISTS "Allow anonymous inserts on contact_submissions" ON contact_submissions;
DROP POLICY IF EXISTS "Allow anonymous inserts on guardian_applications" ON guardian_applications;
DROP POLICY IF EXISTS "Allow authenticated full access on contact_submissions" ON contact_submissions;
DROP POLICY IF EXISTS "Allow authenticated full access on guardian_applications" ON guardian_applications;

-- Allow anonymous inserts (for public form submissions)
CREATE POLICY "Allow anonymous inserts on contact_submissions"
    ON contact_submissions
    FOR INSERT
    TO anon
    WITH CHECK (true);

CREATE POLICY "Allow anonymous inserts on guardian_applications"
    ON guardian_applications
    FOR INSERT
    TO anon
    WITH CHECK (true);

-- Allow authenticated users full access (for admin)
CREATE POLICY "Allow authenticated full access on contact_submissions"
    ON contact_submissions
    FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);

CREATE POLICY "Allow authenticated full access on guardian_applications"
    ON guardian_applications
    FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);

-- =============================================
-- Indexes for better query performance
-- =============================================

CREATE INDEX IF NOT EXISTS idx_contact_submissions_created_at
    ON contact_submissions(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_contact_submissions_read
    ON contact_submissions(read);

CREATE INDEX IF NOT EXISTS idx_guardian_applications_created_at
    ON guardian_applications(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_guardian_applications_status
    ON guardian_applications(status);
