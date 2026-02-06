-- ============================================
-- SACC Doodles Database Schema
-- Run this in Supabase SQL Editor
-- ============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- DOGS TABLE
-- ============================================
CREATE TABLE dogs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    breed VARCHAR(100),
    gender VARCHAR(20),
    birthday DATE,
    color VARCHAR(100),
    weight DECIMAL(5,2),
    is_breeding BOOLEAN DEFAULT false,
    is_public BOOLEAN DEFAULT false,
    location VARCHAR(50) DEFAULT 'home', -- 'home' or 'guardian'
    guardian_id UUID, -- links to customers if in guardian home
    photo_url TEXT,
    notes TEXT,
    health_tests JSONB DEFAULT '[]',
    last_heat_date DATE,
    heat_cycle_days INTEGER DEFAULT 180,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- LITTERS TABLE
-- ============================================
CREATE TABLE litters (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255),
    mother_id UUID REFERENCES dogs(id) ON DELETE SET NULL,
    father_id UUID REFERENCES dogs(id) ON DELETE SET NULL,
    breed VARCHAR(100),
    expected_date DATE,
    birth_date DATE,
    puppy_count INTEGER,
    is_public BOOLEAN DEFAULT false,
    status VARCHAR(50) DEFAULT 'upcoming', -- 'upcoming', 'born', 'available', 'sold_out'
    photo_url TEXT,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- CUSTOMERS TABLE
-- ============================================
CREATE TABLE customers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255),
    phone VARCHAR(50),
    address TEXT,
    city VARCHAR(100),
    state VARCHAR(50),
    zip VARCHAR(20),
    is_guardian BOOLEAN DEFAULT false,
    show_on_website BOOLEAN DEFAULT false,
    photo_url TEXT,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add foreign key for guardian after customers table exists
ALTER TABLE dogs ADD CONSTRAINT fk_dogs_guardian
    FOREIGN KEY (guardian_id) REFERENCES customers(id) ON DELETE SET NULL;

-- ============================================
-- PUPPIES TABLE
-- ============================================
CREATE TABLE puppies (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255),
    litter_id UUID REFERENCES litters(id) ON DELETE SET NULL,
    gender VARCHAR(20),
    color VARCHAR(100),
    weight DECIMAL(5,2),
    birthday DATE,
    status VARCHAR(50) DEFAULT 'available', -- 'available', 'reserved', 'sold'
    price DECIMAL(10,2),
    customer_id UUID REFERENCES customers(id) ON DELETE SET NULL,
    is_public BOOLEAN DEFAULT false,
    photo_url TEXT,
    notes TEXT,
    collar_color VARCHAR(50),
    personality TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- PURCHASES TABLE
-- ============================================
CREATE TABLE purchases (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    customer_id UUID REFERENCES customers(id) ON DELETE SET NULL,
    puppy_id UUID REFERENCES puppies(id) ON DELETE SET NULL,
    amount DECIMAL(10,2),
    deposit_amount DECIMAL(10,2),
    purchase_date DATE,
    payment_method VARCHAR(50),
    payment_status VARCHAR(50) DEFAULT 'pending', -- 'pending', 'partial', 'paid'
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- WAITLIST TABLE
-- ============================================
CREATE TABLE waitlist (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    email VARCHAR(255),
    phone VARCHAR(50),
    status VARCHAR(50) DEFAULT 'pending', -- 'pending', 'active', 'fulfilled', 'cancelled'
    selected_breeds JSONB DEFAULT '[]',
    selected_parents JSONB DEFAULT '[]',
    gender_preference VARCHAR(20),
    color_preference VARCHAR(100),
    assigned_litter_id UUID REFERENCES litters(id) ON DELETE SET NULL,
    deposit_paid BOOLEAN DEFAULT false,
    deposit_amount DECIMAL(10,2),
    deposit_payment_method VARCHAR(50),
    deposit_paid_date DATE,
    deposit_transfers JSONB DEFAULT '[]',
    puppy_id UUID REFERENCES puppies(id) ON DELETE SET NULL,
    fulfilled_date DATE,
    cancelled_date DATE,
    cancellation_reason TEXT,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- EXPENSES TABLE
-- ============================================
CREATE TABLE expenses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    category VARCHAR(100) NOT NULL,
    description TEXT,
    amount DECIMAL(10,2) NOT NULL,
    date DATE NOT NULL,
    dog_id UUID REFERENCES dogs(id) ON DELETE SET NULL,
    vendor VARCHAR(255),
    receipt_url TEXT,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- VET RECORDS TABLE
-- ============================================
CREATE TABLE vet_records (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    dog_id UUID REFERENCES dogs(id) ON DELETE CASCADE,
    type VARCHAR(100) NOT NULL, -- 'checkup', 'vaccination', 'rabies', 'surgery', etc.
    visit_date DATE NOT NULL,
    description TEXT,
    vet_name VARCHAR(255),
    cost DECIMAL(10,2),
    expiration_date DATE, -- for vaccinations
    document_url TEXT,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- REMINDERS TABLE
-- ============================================
CREATE TABLE reminders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    date DATE NOT NULL,
    type VARCHAR(50), -- 'vet', 'breeding', 'general', etc.
    entity_type VARCHAR(50), -- 'dog', 'puppy', 'litter', etc.
    entity_id UUID,
    completed BOOLEAN DEFAULT false,
    completed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- FILES TABLE
-- ============================================
CREATE TABLE files (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    entity_type VARCHAR(50) NOT NULL, -- 'dog', 'puppy', 'customer', etc.
    entity_id UUID NOT NULL,
    file_name VARCHAR(255) NOT NULL,
    file_url TEXT NOT NULL,
    file_type VARCHAR(100),
    file_size INTEGER,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- TESTIMONIALS TABLE
-- ============================================
CREATE TABLE testimonials (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    customer_id UUID REFERENCES customers(id) ON DELETE SET NULL,
    puppy_id UUID REFERENCES puppies(id) ON DELETE SET NULL,
    customer_name VARCHAR(255), -- fallback if no customer linked
    puppy_name VARCHAR(255), -- optional puppy name for display
    content TEXT NOT NULL,
    rating INTEGER,
    is_public BOOLEAN DEFAULT false,
    is_featured BOOLEAN DEFAULT false,
    display_order INTEGER DEFAULT 0,
    photo_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- GALLERY (HAPPY FAMILIES) TABLE
-- ============================================
CREATE TABLE gallery (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    customer_id UUID REFERENCES customers(id) ON DELETE SET NULL,
    puppy_id UUID REFERENCES puppies(id) ON DELETE SET NULL,
    title VARCHAR(255),
    description TEXT,
    image_url TEXT NOT NULL,
    is_public BOOLEAN DEFAULT true,
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- FAQ TABLE
-- ============================================
CREATE TABLE faq (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    question TEXT NOT NULL,
    answer TEXT NOT NULL,
    category VARCHAR(100),
    display_order INTEGER DEFAULT 0,
    is_public BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- SETTINGS TABLE (single row)
-- ============================================
CREATE TABLE settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    business_name VARCHAR(255) DEFAULT 'SACC Doodles',
    phone VARCHAR(50),
    email VARCHAR(255),
    address TEXT,
    instagram VARCHAR(255),
    tiktok VARCHAR(255),
    facebook VARCHAR(255),
    site_content JSONB DEFAULT '{}',
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert default settings row
INSERT INTO settings (business_name, phone, email)
VALUES ('SACC Doodles', '480-822-8443', 'mizzteachout@gmail.com');

-- ============================================
-- INDEXES FOR PERFORMANCE
-- ============================================
CREATE INDEX idx_puppies_litter ON puppies(litter_id);
CREATE INDEX idx_puppies_status ON puppies(status);
CREATE INDEX idx_puppies_customer ON puppies(customer_id);
CREATE INDEX idx_litters_mother ON litters(mother_id);
CREATE INDEX idx_litters_father ON litters(father_id);
CREATE INDEX idx_vet_records_dog ON vet_records(dog_id);
CREATE INDEX idx_expenses_dog ON expenses(dog_id);
CREATE INDEX idx_expenses_date ON expenses(date);
CREATE INDEX idx_waitlist_status ON waitlist(status);
CREATE INDEX idx_reminders_date ON reminders(date);
CREATE INDEX idx_reminders_completed ON reminders(completed);
CREATE INDEX idx_files_entity ON files(entity_type, entity_id);

-- ============================================
-- UPDATED_AT TRIGGER FUNCTION
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply trigger to all tables with updated_at
CREATE TRIGGER update_dogs_updated_at BEFORE UPDATE ON dogs FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_litters_updated_at BEFORE UPDATE ON litters FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_puppies_updated_at BEFORE UPDATE ON puppies FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_customers_updated_at BEFORE UPDATE ON customers FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_purchases_updated_at BEFORE UPDATE ON purchases FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_waitlist_updated_at BEFORE UPDATE ON waitlist FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_expenses_updated_at BEFORE UPDATE ON expenses FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_vet_records_updated_at BEFORE UPDATE ON vet_records FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_reminders_updated_at BEFORE UPDATE ON reminders FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_testimonials_updated_at BEFORE UPDATE ON testimonials FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_gallery_updated_at BEFORE UPDATE ON gallery FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_faq_updated_at BEFORE UPDATE ON faq FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_settings_updated_at BEFORE UPDATE ON settings FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- For now, we'll keep it simple - admin only access
-- When you add customer portal, we'll add policies
-- ============================================

-- Enable RLS on all tables
ALTER TABLE dogs ENABLE ROW LEVEL SECURITY;
ALTER TABLE litters ENABLE ROW LEVEL SECURITY;
ALTER TABLE puppies ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE purchases ENABLE ROW LEVEL SECURITY;
ALTER TABLE waitlist ENABLE ROW LEVEL SECURITY;
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE vet_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE reminders ENABLE ROW LEVEL SECURITY;
ALTER TABLE files ENABLE ROW LEVEL SECURITY;
ALTER TABLE testimonials ENABLE ROW LEVEL SECURITY;
ALTER TABLE gallery ENABLE ROW LEVEL SECURITY;
ALTER TABLE faq ENABLE ROW LEVEL SECURITY;
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;

-- For now: Allow all operations for authenticated users (admin)
-- This is a simple policy - you and Angela will be the only auth users
CREATE POLICY "Allow all for authenticated users" ON dogs FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Allow all for authenticated users" ON litters FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Allow all for authenticated users" ON puppies FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Allow all for authenticated users" ON customers FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Allow all for authenticated users" ON purchases FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Allow all for authenticated users" ON waitlist FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Allow all for authenticated users" ON expenses FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Allow all for authenticated users" ON vet_records FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Allow all for authenticated users" ON reminders FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Allow all for authenticated users" ON files FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Allow all for authenticated users" ON testimonials FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Allow all for authenticated users" ON gallery FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Allow all for authenticated users" ON faq FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Allow all for authenticated users" ON settings FOR ALL USING (auth.role() = 'authenticated');

-- Public read access for public content (website visitors)
CREATE POLICY "Public can view public dogs" ON dogs FOR SELECT USING (is_public = true);
CREATE POLICY "Public can view public litters" ON litters FOR SELECT USING (is_public = true);
CREATE POLICY "Public can view public puppies" ON puppies FOR SELECT USING (is_public = true);
CREATE POLICY "Public can view public testimonials" ON testimonials FOR SELECT USING (is_public = true);
CREATE POLICY "Public can view public gallery" ON gallery FOR SELECT USING (is_public = true);
CREATE POLICY "Public can view public faq" ON faq FOR SELECT USING (is_public = true);
CREATE POLICY "Public can view settings" ON settings FOR SELECT USING (true);
CREATE POLICY "Public can view guardian customers" ON customers FOR SELECT USING (is_guardian = true AND show_on_website = true);
