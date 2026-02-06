-- ============================================
-- SACC Doodles - Complete Database Schema
-- Run this in Supabase SQL Editor
-- ============================================

-- ============================================
-- DOGS TABLE (Parent dogs for breeding)
-- ============================================
CREATE TABLE IF NOT EXISTS dogs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    breed TEXT, -- 'Goldendoodle', 'Bernedoodle', etc.
    role TEXT, -- 'Dam' or 'Sire'
    color TEXT,
    weight_lbs INTEGER,
    age_years INTEGER,
    date_of_birth DATE,
    bio TEXT,
    image_url TEXT, -- URL to main photo

    -- Health testing
    health_tested BOOLEAN DEFAULT FALSE,
    health_tests JSONB DEFAULT '[]', -- [{test: 'OFA Hips', result: 'Good', date: '2024-01-01'}, ...]

    -- Status
    is_breeding BOOLEAN DEFAULT TRUE,
    is_public BOOLEAN DEFAULT TRUE, -- Show on public website
    status TEXT DEFAULT 'Active', -- 'Active', 'Retired', 'Guardian'
    display_order INTEGER DEFAULT 0,

    -- Guardian info (if guardian dog)
    is_guardian BOOLEAN DEFAULT FALSE,
    guardian_family JSONB, -- {name: '', photo: '', location: ''}

    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- LITTERS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS litters (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT, -- e.g., "Bella x Max Spring 2025"
    dam_id UUID REFERENCES dogs(id),
    sire_id UUID REFERENCES dogs(id),

    expected_date DATE,
    born_date DATE,
    puppy_count INTEGER,

    status TEXT DEFAULT 'Expected', -- 'Expected', 'Born', 'Available', 'Sold Out'
    notes TEXT,

    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- PUPPIES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS puppies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    litter_id UUID REFERENCES litters(id),

    name TEXT,
    breed TEXT, -- 'Goldendoodle', 'Bernedoodle', etc.
    gender TEXT, -- 'Male' or 'Female'
    color TEXT,
    markings TEXT,
    weight_lbs DECIMAL(5,2),
    expected_size TEXT, -- 'Mini', 'Medium', 'Standard'
    description TEXT,

    price DECIMAL(10,2),
    deposit_amount DECIMAL(10,2) DEFAULT 500,
    deposit_link TEXT, -- URL for payment (Stripe, PayPal, etc.)
    status TEXT DEFAULT 'Available', -- 'Available', 'Reserved', 'Sold', 'Keeping'

    -- Photos/media
    image_url TEXT, -- Main photo URL
    photos JSONB DEFAULT '[]', -- Additional photos [{url: '', caption: ''}]
    video_url TEXT,

    -- Personality & notes
    personality TEXT,
    notes TEXT,

    -- Health
    vet_checked BOOLEAN DEFAULT FALSE,
    vaccinations JSONB DEFAULT '[]',
    dewormed BOOLEAN DEFAULT FALSE,
    microchip_number TEXT,

    -- Dates
    birth_date DATE,
    go_home_date DATE,

    -- If sold/reserved
    customer_id UUID,

    -- Display on website
    is_public BOOLEAN DEFAULT TRUE,
    display_order INTEGER DEFAULT 0,

    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- CUSTOMERS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS customers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    email TEXT,
    phone TEXT,

    -- Address
    address TEXT,
    city TEXT,
    state TEXT,
    zip TEXT,

    -- Type
    type TEXT DEFAULT 'Buyer', -- 'Buyer', 'Guardian', 'Waitlist'

    -- If guardian
    guardian_photo TEXT,
    guardian_approved BOOLEAN DEFAULT FALSE,

    notes TEXT,

    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- WAITLIST TABLE (already exists, but ensuring schema)
-- ============================================
CREATE TABLE IF NOT EXISTS waitlist (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Contact info
    first_name TEXT,
    last_name TEXT,
    name TEXT, -- Full name (computed or stored)
    email TEXT NOT NULL,
    phone TEXT,

    -- Preferences
    selected_breeds JSONB DEFAULT '[]',
    gender_preference TEXT,
    color_preference TEXT,
    size_preference TEXT,

    -- Status
    status TEXT DEFAULT 'pending', -- 'pending', 'deposit_paid', 'matched', 'completed', 'cancelled'
    position INTEGER,
    deposit_paid BOOLEAN DEFAULT FALSE,
    deposit_amount DECIMAL(10,2),
    deposit_date DATE,

    -- Additional info
    notes JSONB, -- Stores additional form fields

    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- PURCHASES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS purchases (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id UUID REFERENCES customers(id),
    puppy_id UUID REFERENCES puppies(id),

    purchase_date DATE,
    total_amount DECIMAL(10,2),
    deposit_amount DECIMAL(10,2),
    balance_due DECIMAL(10,2),

    payment_method TEXT,
    payment_status TEXT DEFAULT 'Pending', -- 'Pending', 'Partial', 'Paid'

    contract_signed BOOLEAN DEFAULT FALSE,
    contract_date DATE,

    notes TEXT,

    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- EXPENSES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS expenses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    date DATE NOT NULL,
    category TEXT, -- 'Vet', 'Food', 'Supplies', 'Marketing', etc.
    description TEXT,
    amount DECIMAL(10,2) NOT NULL,

    -- Optional links
    dog_id UUID REFERENCES dogs(id),
    litter_id UUID REFERENCES litters(id),

    receipt_url TEXT,
    notes TEXT,

    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- VET RECORDS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS vet_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    dog_id UUID REFERENCES dogs(id),
    puppy_id UUID REFERENCES puppies(id),

    visit_date DATE NOT NULL,
    vet_name TEXT,
    reason TEXT,
    diagnosis TEXT,
    treatment TEXT,

    cost DECIMAL(10,2),
    document_url TEXT,
    notes TEXT,

    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- REMINDERS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS reminders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    title TEXT NOT NULL,
    description TEXT,
    date DATE NOT NULL,
    time TIME,

    -- Link to related item
    related_type TEXT, -- 'dog', 'puppy', 'litter', 'customer'
    related_id UUID,

    is_completed BOOLEAN DEFAULT FALSE,

    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- FILES TABLE (documents, etc.)
-- ============================================
CREATE TABLE IF NOT EXISTS files (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    name TEXT NOT NULL,
    url TEXT NOT NULL,
    type TEXT, -- 'document', 'image', 'contract', etc.

    -- Link to related item
    related_type TEXT,
    related_id UUID,

    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- TESTIMONIALS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS testimonials (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    family_name TEXT NOT NULL,
    puppy_name TEXT,
    content TEXT NOT NULL,
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),

    author_photo TEXT,
    puppy_photo TEXT,

    is_approved BOOLEAN DEFAULT FALSE,
    is_featured BOOLEAN DEFAULT FALSE,
    display_order INTEGER DEFAULT 0,

    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- GALLERY TABLE (Happy Families photos)
-- ============================================
CREATE TABLE IF NOT EXISTS gallery (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    photo_url TEXT NOT NULL,
    caption TEXT,
    family_name TEXT,
    puppy_name TEXT,

    is_approved BOOLEAN DEFAULT TRUE,
    display_order INTEGER DEFAULT 0,

    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- FAQ TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS faq (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    question TEXT NOT NULL,
    answer TEXT NOT NULL,
    category TEXT,

    is_published BOOLEAN DEFAULT TRUE,
    display_order INTEGER DEFAULT 0,

    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- SETTINGS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Business info
    business_name TEXT DEFAULT 'SACC Doodles',
    phone TEXT,
    email TEXT,
    address TEXT,

    -- Social links
    instagram_url TEXT,
    facebook_url TEXT,
    tiktok_url TEXT,

    -- Pricing defaults
    default_puppy_price DECIMAL(10,2),
    deposit_amount DECIMAL(10,2) DEFAULT 300,

    -- Content
    homepage_content JSONB,
    about_content JSONB,

    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert default settings row
INSERT INTO settings (business_name, phone, email)
VALUES ('SACC Doodles', '480-822-8443', 'mizzteachout@gmail.com')
ON CONFLICT DO NOTHING;

-- ============================================
-- ADD MISSING COLUMNS (for existing databases)
-- Run BEFORE policies to ensure columns exist
-- ============================================

-- Dogs table columns
ALTER TABLE dogs ADD COLUMN IF NOT EXISTS role TEXT;
ALTER TABLE dogs ADD COLUMN IF NOT EXISTS age_years INTEGER;
ALTER TABLE dogs ADD COLUMN IF NOT EXISTS image_url TEXT;
ALTER TABLE dogs ADD COLUMN IF NOT EXISTS health_tested BOOLEAN DEFAULT FALSE;
ALTER TABLE dogs ADD COLUMN IF NOT EXISTS display_order INTEGER DEFAULT 0;
ALTER TABLE dogs ADD COLUMN IF NOT EXISTS is_public BOOLEAN DEFAULT TRUE;

-- Puppies table columns
ALTER TABLE puppies ADD COLUMN IF NOT EXISTS breed TEXT;
ALTER TABLE puppies ADD COLUMN IF NOT EXISTS expected_size TEXT;
ALTER TABLE puppies ADD COLUMN IF NOT EXISTS description TEXT;
ALTER TABLE puppies ADD COLUMN IF NOT EXISTS deposit_amount DECIMAL(10,2) DEFAULT 500;
ALTER TABLE puppies ADD COLUMN IF NOT EXISTS deposit_link TEXT;
ALTER TABLE puppies ADD COLUMN IF NOT EXISTS image_url TEXT;
ALTER TABLE puppies ADD COLUMN IF NOT EXISTS is_public BOOLEAN DEFAULT TRUE;

-- Testimonials table columns
ALTER TABLE testimonials ADD COLUMN IF NOT EXISTS is_approved BOOLEAN DEFAULT FALSE;
ALTER TABLE testimonials ADD COLUMN IF NOT EXISTS is_featured BOOLEAN DEFAULT FALSE;
ALTER TABLE testimonials ADD COLUMN IF NOT EXISTS display_order INTEGER DEFAULT 0;

-- Gallery table columns
ALTER TABLE gallery ADD COLUMN IF NOT EXISTS is_approved BOOLEAN DEFAULT TRUE;
ALTER TABLE gallery ADD COLUMN IF NOT EXISTS display_order INTEGER DEFAULT 0;

-- FAQ table columns
ALTER TABLE faq ADD COLUMN IF NOT EXISTS is_published BOOLEAN DEFAULT TRUE;
ALTER TABLE faq ADD COLUMN IF NOT EXISTS display_order INTEGER DEFAULT 0;

-- Migrate photo to image_url for dogs (if photo column exists)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'dogs' AND column_name = 'photo') THEN
        UPDATE dogs SET image_url = photo WHERE image_url IS NULL AND photo IS NOT NULL;
    END IF;
END $$;

-- Migrate photo to image_url for puppies (if photo column exists)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'puppies' AND column_name = 'photo') THEN
        UPDATE puppies SET image_url = photo WHERE image_url IS NULL AND photo IS NOT NULL;
    END IF;
END $$;

-- ============================================
-- ROW LEVEL SECURITY POLICIES
-- ============================================

-- Enable RLS on all tables
ALTER TABLE dogs ENABLE ROW LEVEL SECURITY;
ALTER TABLE litters ENABLE ROW LEVEL SECURITY;
ALTER TABLE puppies ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE waitlist ENABLE ROW LEVEL SECURITY;
ALTER TABLE purchases ENABLE ROW LEVEL SECURITY;
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE vet_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE reminders ENABLE ROW LEVEL SECURITY;
ALTER TABLE files ENABLE ROW LEVEL SECURITY;
ALTER TABLE testimonials ENABLE ROW LEVEL SECURITY;
ALTER TABLE gallery ENABLE ROW LEVEL SECURITY;
ALTER TABLE faq ENABLE ROW LEVEL SECURITY;
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;

-- Drop existing policies first (in case running again)
DROP POLICY IF EXISTS "Public can view public dogs" ON dogs;
DROP POLICY IF EXISTS "Public can view public puppies" ON puppies;
DROP POLICY IF EXISTS "Public can view approved testimonials" ON testimonials;
DROP POLICY IF EXISTS "Public can view approved gallery" ON gallery;
DROP POLICY IF EXISTS "Public can view published faq" ON faq;
DROP POLICY IF EXISTS "Public can view litters" ON litters;
DROP POLICY IF EXISTS "Public can view settings" ON settings;
DROP POLICY IF EXISTS "Anyone can submit to waitlist" ON waitlist;
DROP POLICY IF EXISTS "Admin full access to dogs" ON dogs;
DROP POLICY IF EXISTS "Admin full access to litters" ON litters;
DROP POLICY IF EXISTS "Admin full access to puppies" ON puppies;
DROP POLICY IF EXISTS "Admin full access to customers" ON customers;
DROP POLICY IF EXISTS "Admin full access to waitlist" ON waitlist;
DROP POLICY IF EXISTS "Admin full access to purchases" ON purchases;
DROP POLICY IF EXISTS "Admin full access to expenses" ON expenses;
DROP POLICY IF EXISTS "Admin full access to vet_records" ON vet_records;
DROP POLICY IF EXISTS "Admin full access to reminders" ON reminders;
DROP POLICY IF EXISTS "Admin full access to files" ON files;
DROP POLICY IF EXISTS "Admin full access to testimonials" ON testimonials;
DROP POLICY IF EXISTS "Admin full access to gallery" ON gallery;
DROP POLICY IF EXISTS "Admin full access to faq" ON faq;
DROP POLICY IF EXISTS "Admin full access to settings" ON settings;

-- PUBLIC READ policies (for website visitors)
CREATE POLICY "Public can view public dogs" ON dogs FOR SELECT USING (is_public = true);
CREATE POLICY "Public can view public puppies" ON puppies FOR SELECT USING (is_public = true);
CREATE POLICY "Public can view approved testimonials" ON testimonials FOR SELECT USING (is_approved = true);
CREATE POLICY "Public can view approved gallery" ON gallery FOR SELECT USING (is_approved = true);
CREATE POLICY "Public can view published faq" ON faq FOR SELECT USING (is_published = true);
CREATE POLICY "Public can view litters" ON litters FOR SELECT USING (true);
CREATE POLICY "Public can view settings" ON settings FOR SELECT USING (true);

-- PUBLIC INSERT policies (for form submissions)
CREATE POLICY "Anyone can submit to waitlist" ON waitlist FOR INSERT WITH CHECK (true);

-- AUTHENTICATED (admin) full access policies
CREATE POLICY "Admin full access to dogs" ON dogs FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Admin full access to litters" ON litters FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Admin full access to puppies" ON puppies FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Admin full access to customers" ON customers FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Admin full access to waitlist" ON waitlist FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Admin full access to purchases" ON purchases FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Admin full access to expenses" ON expenses FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Admin full access to vet_records" ON vet_records FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Admin full access to reminders" ON reminders FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Admin full access to files" ON files FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Admin full access to testimonials" ON testimonials FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Admin full access to gallery" ON gallery FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Admin full access to faq" ON faq FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Admin full access to settings" ON settings FOR ALL USING (auth.role() = 'authenticated');

-- ============================================
-- INDEXES for performance
-- ============================================
CREATE INDEX IF NOT EXISTS idx_puppies_status ON puppies(status);
CREATE INDEX IF NOT EXISTS idx_puppies_is_public ON puppies(is_public);
CREATE INDEX IF NOT EXISTS idx_puppies_litter_id ON puppies(litter_id);
CREATE INDEX IF NOT EXISTS idx_dogs_is_public ON dogs(is_public);
CREATE INDEX IF NOT EXISTS idx_dogs_is_breeding ON dogs(is_breeding);
CREATE INDEX IF NOT EXISTS idx_waitlist_status ON waitlist(status);
CREATE INDEX IF NOT EXISTS idx_waitlist_created_at ON waitlist(created_at);
CREATE INDEX IF NOT EXISTS idx_litters_status ON litters(status);

-- ============================================
-- Done! Your database is ready.
-- ============================================
