-- ============================================
-- SACC Doodles - Test Data
-- Run this in Supabase SQL Editor after create-all-tables.sql
-- ============================================

-- ============================================
-- ADD MISSING COLUMNS FIRST
-- ============================================
ALTER TABLE dogs ADD COLUMN IF NOT EXISTS weight_lbs INTEGER;
ALTER TABLE dogs ADD COLUMN IF NOT EXISTS age_years INTEGER;
ALTER TABLE dogs ADD COLUMN IF NOT EXISTS role TEXT;
ALTER TABLE dogs ADD COLUMN IF NOT EXISTS image_url TEXT;
ALTER TABLE dogs ADD COLUMN IF NOT EXISTS health_tested BOOLEAN DEFAULT FALSE;
ALTER TABLE dogs ADD COLUMN IF NOT EXISTS health_tests JSONB DEFAULT '[]';
ALTER TABLE dogs ADD COLUMN IF NOT EXISTS display_order INTEGER DEFAULT 0;
ALTER TABLE dogs ADD COLUMN IF NOT EXISTS is_public BOOLEAN DEFAULT TRUE;
ALTER TABLE dogs ADD COLUMN IF NOT EXISTS bio TEXT;
ALTER TABLE dogs ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'Active';

ALTER TABLE puppies ADD COLUMN IF NOT EXISTS breed TEXT;
ALTER TABLE puppies ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'Available';
ALTER TABLE puppies ADD COLUMN IF NOT EXISTS expected_size TEXT;
ALTER TABLE puppies ADD COLUMN IF NOT EXISTS description TEXT;
ALTER TABLE puppies ADD COLUMN IF NOT EXISTS deposit_amount DECIMAL(10,2) DEFAULT 500;
ALTER TABLE puppies ADD COLUMN IF NOT EXISTS image_url TEXT;
ALTER TABLE puppies ADD COLUMN IF NOT EXISTS is_public BOOLEAN DEFAULT TRUE;
ALTER TABLE puppies ADD COLUMN IF NOT EXISTS display_order INTEGER DEFAULT 0;
ALTER TABLE puppies ADD COLUMN IF NOT EXISTS weight_lbs DECIMAL(5,2);
ALTER TABLE puppies ADD COLUMN IF NOT EXISTS birth_date DATE;
ALTER TABLE puppies ADD COLUMN IF NOT EXISTS price DECIMAL(10,2);
ALTER TABLE puppies ADD COLUMN IF NOT EXISTS gender TEXT;
ALTER TABLE puppies ADD COLUMN IF NOT EXISTS color TEXT;
ALTER TABLE puppies ADD COLUMN IF NOT EXISTS name TEXT;
ALTER TABLE puppies ADD COLUMN IF NOT EXISTS litter_id UUID;

ALTER TABLE litters ADD COLUMN IF NOT EXISTS name TEXT;
ALTER TABLE litters ADD COLUMN IF NOT EXISTS dam_id UUID;
ALTER TABLE litters ADD COLUMN IF NOT EXISTS sire_id UUID;
ALTER TABLE litters ADD COLUMN IF NOT EXISTS expected_date DATE;
ALTER TABLE litters ADD COLUMN IF NOT EXISTS born_date DATE;
ALTER TABLE litters ADD COLUMN IF NOT EXISTS puppy_count INTEGER;
ALTER TABLE litters ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'Expected';
ALTER TABLE litters ADD COLUMN IF NOT EXISTS notes TEXT;

ALTER TABLE customers ADD COLUMN IF NOT EXISTS name TEXT;
ALTER TABLE customers ADD COLUMN IF NOT EXISTS email TEXT;
ALTER TABLE customers ADD COLUMN IF NOT EXISTS phone TEXT;
ALTER TABLE customers ADD COLUMN IF NOT EXISTS address TEXT;
ALTER TABLE customers ADD COLUMN IF NOT EXISTS city TEXT;
ALTER TABLE customers ADD COLUMN IF NOT EXISTS state TEXT;
ALTER TABLE customers ADD COLUMN IF NOT EXISTS zip TEXT;
ALTER TABLE customers ADD COLUMN IF NOT EXISTS type TEXT DEFAULT 'Buyer';
ALTER TABLE customers ADD COLUMN IF NOT EXISTS notes TEXT;

ALTER TABLE waitlist ADD COLUMN IF NOT EXISTS first_name TEXT;
ALTER TABLE waitlist ADD COLUMN IF NOT EXISTS last_name TEXT;
ALTER TABLE waitlist ADD COLUMN IF NOT EXISTS name TEXT;
ALTER TABLE waitlist ADD COLUMN IF NOT EXISTS email TEXT;
ALTER TABLE waitlist ADD COLUMN IF NOT EXISTS phone TEXT;
ALTER TABLE waitlist ADD COLUMN IF NOT EXISTS selected_breeds JSONB DEFAULT '[]';
ALTER TABLE waitlist ADD COLUMN IF NOT EXISTS gender_preference TEXT;
ALTER TABLE waitlist ADD COLUMN IF NOT EXISTS color_preference TEXT;
ALTER TABLE waitlist ADD COLUMN IF NOT EXISTS size_preference TEXT;
ALTER TABLE waitlist ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'pending';
ALTER TABLE waitlist ADD COLUMN IF NOT EXISTS position INTEGER;
ALTER TABLE waitlist ADD COLUMN IF NOT EXISTS notes JSONB;

ALTER TABLE testimonials ADD COLUMN IF NOT EXISTS family_name TEXT;
ALTER TABLE testimonials ADD COLUMN IF NOT EXISTS puppy_name TEXT;
ALTER TABLE testimonials ADD COLUMN IF NOT EXISTS content TEXT;
ALTER TABLE testimonials ADD COLUMN IF NOT EXISTS rating INTEGER;
ALTER TABLE testimonials ADD COLUMN IF NOT EXISTS is_approved BOOLEAN DEFAULT FALSE;
ALTER TABLE testimonials ADD COLUMN IF NOT EXISTS is_featured BOOLEAN DEFAULT FALSE;
ALTER TABLE testimonials ADD COLUMN IF NOT EXISTS display_order INTEGER DEFAULT 0;

ALTER TABLE faq ADD COLUMN IF NOT EXISTS question TEXT;
ALTER TABLE faq ADD COLUMN IF NOT EXISTS answer TEXT;
ALTER TABLE faq ADD COLUMN IF NOT EXISTS category TEXT;
ALTER TABLE faq ADD COLUMN IF NOT EXISTS is_published BOOLEAN DEFAULT TRUE;
ALTER TABLE faq ADD COLUMN IF NOT EXISTS display_order INTEGER DEFAULT 0;

ALTER TABLE gallery ADD COLUMN IF NOT EXISTS image_url TEXT;
ALTER TABLE gallery ADD COLUMN IF NOT EXISTS caption TEXT;
ALTER TABLE gallery ADD COLUMN IF NOT EXISTS family_name TEXT;
ALTER TABLE gallery ADD COLUMN IF NOT EXISTS puppy_name TEXT;
ALTER TABLE gallery ADD COLUMN IF NOT EXISTS is_approved BOOLEAN DEFAULT TRUE;
ALTER TABLE gallery ADD COLUMN IF NOT EXISTS display_order INTEGER DEFAULT 0;

ALTER TABLE vet_records ADD COLUMN IF NOT EXISTS dog_id UUID;
ALTER TABLE vet_records ADD COLUMN IF NOT EXISTS puppy_id UUID;
ALTER TABLE vet_records ADD COLUMN IF NOT EXISTS visit_date DATE;
ALTER TABLE vet_records ADD COLUMN IF NOT EXISTS vet_name TEXT;
ALTER TABLE vet_records ADD COLUMN IF NOT EXISTS type TEXT;
ALTER TABLE vet_records ADD COLUMN IF NOT EXISTS reason TEXT;
ALTER TABLE vet_records ADD COLUMN IF NOT EXISTS diagnosis TEXT;
ALTER TABLE vet_records ADD COLUMN IF NOT EXISTS treatment TEXT;
ALTER TABLE vet_records ADD COLUMN IF NOT EXISTS cost DECIMAL(10,2);
ALTER TABLE vet_records ADD COLUMN IF NOT EXISTS document_url TEXT;
ALTER TABLE vet_records ADD COLUMN IF NOT EXISTS notes TEXT;

ALTER TABLE expenses ADD COLUMN IF NOT EXISTS date DATE;
ALTER TABLE expenses ADD COLUMN IF NOT EXISTS category TEXT;
ALTER TABLE expenses ADD COLUMN IF NOT EXISTS description TEXT;
ALTER TABLE expenses ADD COLUMN IF NOT EXISTS amount DECIMAL(10,2);
ALTER TABLE expenses ADD COLUMN IF NOT EXISTS dog_id UUID;
ALTER TABLE expenses ADD COLUMN IF NOT EXISTS litter_id UUID;
ALTER TABLE expenses ADD COLUMN IF NOT EXISTS receipt_url TEXT;
ALTER TABLE expenses ADD COLUMN IF NOT EXISTS notes TEXT;

-- ============================================
-- DOGS (Parent Dogs)
-- ============================================
INSERT INTO dogs (name, breed, role, color, weight_lbs, age_years, bio, image_url, health_tested, health_tests, status, is_public, display_order) VALUES
(
    'Bella',
    'Goldendoodle',
    'Dam',
    'Apricot',
    45,
    3,
    'Bella is our sweetest Goldendoodle with the most gentle temperament. She loves cuddles and produces the most beautiful puppies with wonderful personalities.',
    'pictures/dog-1.jpeg',
    true,
    '[{"test": "OFA Hips", "result": "Excellent"}, {"test": "OFA Elbows", "result": "Normal"}, {"test": "OFA Heart", "result": "Normal"}, {"test": "Genetic Panel", "result": "Clear"}]'::jsonb,
    'Active',
    true,
    1
),
(
    'Luna',
    'Bernedoodle',
    'Dam',
    'Tri-Color',
    55,
    2,
    'Luna is our stunning Bernedoodle with classic tri-color markings. She has a playful yet calm demeanor and is an amazing mother to her puppies.',
    'pictures/dog-2.jpeg',
    true,
    '[{"test": "OFA Hips", "result": "Good"}, {"test": "OFA Elbows", "result": "Normal"}, {"test": "OFA Heart", "result": "Normal"}, {"test": "Genetic Panel", "result": "Clear"}]'::jsonb,
    'Active',
    true,
    2
),
(
    'Max',
    'Goldendoodle',
    'Sire',
    'Golden',
    60,
    3,
    'Max is our handsome Goldendoodle sire with an incredibly friendly and playful personality. He passes on his beautiful coat, intelligence, and loving temperament to all of his puppies.',
    'pictures/dog-3.jpeg',
    true,
    '[{"test": "OFA Hips", "result": "Excellent"}, {"test": "OFA Elbows", "result": "Normal"}, {"test": "OFA Heart", "result": "Normal"}, {"test": "Genetic Panel", "result": "Clear"}]'::jsonb,
    'Active',
    true,
    3
),
(
    'Daisy',
    'Bernedoodle',
    'Dam',
    'Tri-Color',
    50,
    2,
    'Daisy is our sweet Bernedoodle with the most beautiful markings. She has a calm, nurturing personality that makes her an exceptional mother.',
    'pictures/dog-4.jpeg',
    true,
    '[{"test": "OFA Hips", "result": "Good"}, {"test": "OFA Elbows", "result": "Normal"}, {"test": "OFA Heart", "result": "Normal"}, {"test": "Genetic Panel", "result": "Clear"}]'::jsonb,
    'Active',
    true,
    4
);

-- ============================================
-- LITTERS
-- ============================================
INSERT INTO litters (name, dam_id, sire_id, expected_date, born_date, puppy_count, status, notes)
SELECT
    'Bella x Max Spring 2025',
    (SELECT id FROM dogs WHERE name = 'Bella'),
    (SELECT id FROM dogs WHERE name = 'Max'),
    '2025-03-15',
    '2025-03-12',
    4,
    'Available',
    'Beautiful litter of Goldendoodles! All puppies are healthy and thriving.'
WHERE EXISTS (SELECT 1 FROM dogs WHERE name = 'Bella')
  AND EXISTS (SELECT 1 FROM dogs WHERE name = 'Max');

INSERT INTO litters (name, dam_id, sire_id, expected_date, born_date, puppy_count, status, notes)
SELECT
    'Luna x Max Winter 2025',
    (SELECT id FROM dogs WHERE name = 'Luna'),
    (SELECT id FROM dogs WHERE name = 'Max'),
    '2025-02-20',
    '2025-02-18',
    3,
    'Available',
    'Gorgeous litter of F1B Goldendoodles with Luna''s beautiful coloring!'
WHERE EXISTS (SELECT 1 FROM dogs WHERE name = 'Luna')
  AND EXISTS (SELECT 1 FROM dogs WHERE name = 'Max');

-- ============================================
-- PUPPIES
-- ============================================
-- Bella x Max litter puppies
INSERT INTO puppies (litter_id, name, breed, gender, color, weight_lbs, expected_size, description, price, deposit_amount, status, image_url, birth_date, is_public, display_order)
SELECT
    (SELECT id FROM litters WHERE name = 'Bella x Max Spring 2025'),
    'Cooper',
    'Goldendoodle',
    'Male',
    'Apricot',
    8.5,
    'Medium',
    'Cooper is the adventurous one of the litter! He loves to explore and is always the first to investigate new toys. He would do great with an active family.',
    2500.00,
    500.00,
    'Available',
    'https://placedog.net/500/400?id=1',
    '2025-03-12',
    true,
    1
WHERE EXISTS (SELECT 1 FROM litters WHERE name = 'Bella x Max Spring 2025');

INSERT INTO puppies (litter_id, name, breed, gender, color, weight_lbs, expected_size, description, price, deposit_amount, status, image_url, birth_date, is_public, display_order)
SELECT
    (SELECT id FROM litters WHERE name = 'Bella x Max Spring 2025'),
    'Rosie',
    'Goldendoodle',
    'Female',
    'Cream',
    7.2,
    'Medium',
    'Rosie is the sweetest girl with the softest fleece coat. She loves snuggles and would make the perfect family companion.',
    2800.00,
    500.00,
    'Available',
    'https://placedog.net/500/400?id=2',
    '2025-03-12',
    true,
    2
WHERE EXISTS (SELECT 1 FROM litters WHERE name = 'Bella x Max Spring 2025');

INSERT INTO puppies (litter_id, name, breed, gender, color, weight_lbs, expected_size, description, price, deposit_amount, status, image_url, birth_date, is_public, display_order)
SELECT
    (SELECT id FROM litters WHERE name = 'Bella x Max Spring 2025'),
    'Teddy',
    'Goldendoodle',
    'Male',
    'Golden',
    9.0,
    'Standard',
    'Teddy is a big cuddle bear! He has the classic golden color and loves to play fetch already. He''ll be a great hiking buddy.',
    2500.00,
    500.00,
    'Reserved',
    'https://placedog.net/500/400?id=3',
    '2025-03-12',
    true,
    3
WHERE EXISTS (SELECT 1 FROM litters WHERE name = 'Bella x Max Spring 2025');

-- Luna x Max litter puppies
INSERT INTO puppies (litter_id, name, breed, gender, color, weight_lbs, expected_size, description, price, deposit_amount, status, image_url, birth_date, is_public, display_order)
SELECT
    (SELECT id FROM litters WHERE name = 'Luna x Max Winter 2025'),
    'Oakley',
    'Goldendoodle',
    'Male',
    'Parti (Black & White)',
    10.5,
    'Standard',
    'Oakley has stunning parti coloring inherited from Luna! He''s confident, playful, and has the best temperament.',
    3000.00,
    500.00,
    'Available',
    'https://placedog.net/500/400?id=4',
    '2025-02-18',
    true,
    4
WHERE EXISTS (SELECT 1 FROM litters WHERE name = 'Luna x Max Winter 2025');

INSERT INTO puppies (litter_id, name, breed, gender, color, weight_lbs, expected_size, description, price, deposit_amount, status, image_url, birth_date, is_public, display_order)
SELECT
    (SELECT id FROM litters WHERE name = 'Luna x Max Winter 2025'),
    'Willow',
    'Goldendoodle',
    'Female',
    'Sable',
    8.0,
    'Medium',
    'Willow is absolutely gorgeous with her sable coloring. She''s gentle, sweet, and loves to be held.',
    3200.00,
    500.00,
    'Available',
    'https://placedog.net/500/400?id=5',
    '2025-02-18',
    true,
    5
WHERE EXISTS (SELECT 1 FROM litters WHERE name = 'Luna x Max Winter 2025');

INSERT INTO puppies (litter_id, name, breed, gender, color, weight_lbs, expected_size, description, price, deposit_amount, status, image_url, birth_date, is_public, display_order)
SELECT
    (SELECT id FROM litters WHERE name = 'Luna x Max Winter 2025'),
    'Finn',
    'Goldendoodle',
    'Male',
    'Cream with Tan Points',
    9.5,
    'Standard',
    'Finn is the playful clown of the litter! He keeps everyone entertained and would thrive in a home with kids.',
    2800.00,
    500.00,
    'Reserved',
    'https://placedog.net/500/400?id=6',
    '2025-02-18',
    true,
    6
WHERE EXISTS (SELECT 1 FROM litters WHERE name = 'Luna x Max Winter 2025');

-- ============================================
-- CUSTOMERS
-- ============================================
INSERT INTO customers (name, email, phone, address, city, state, zip, type, notes) VALUES
(
    'Sarah Johnson',
    'sarah.johnson@email.com',
    '480-555-1234',
    '123 Desert Rose Lane',
    'Gilbert',
    'AZ',
    '85234',
    'Buyer',
    'Reserved Teddy from Bella x Max litter. Deposit paid 2/15/2025.'
),
(
    'Michael Chen',
    'mchen@email.com',
    '602-555-5678',
    '456 Saguaro Court',
    'Scottsdale',
    'AZ',
    '85260',
    'Buyer',
    'Reserved Finn from Luna x Max litter. Very excited first-time doodle owner!'
),
(
    'The Williams Family',
    'williams.family@email.com',
    '623-555-9012',
    '789 Cactus Drive',
    'Phoenix',
    'AZ',
    '85021',
    'Guardian',
    'Interested in guardian home program. Have a large backyard and work from home.'
);

-- ============================================
-- WAITLIST
-- ============================================
INSERT INTO waitlist (first_name, last_name, name, email, phone, selected_breeds, gender_preference, color_preference, size_preference, status, position, notes) VALUES
(
    'Emily',
    'Davis',
    'Emily Davis',
    'emily.davis@email.com',
    '480-555-3456',
    '["Goldendoodle"]'::jsonb,
    'Female',
    'Apricot or Cream',
    'Medium',
    'pending',
    1,
    '{"timeline": "Spring 2025", "experience": "Had a goldendoodle growing up", "living_situation": "House with large yard"}'::jsonb
),
(
    'James',
    'Miller',
    'James Miller',
    'jmiller@email.com',
    '602-555-7890',
    '["Goldendoodle", "Bernedoodle"]'::jsonb,
    'Male',
    'Any',
    'Standard',
    'pending',
    2,
    '{"timeline": "Flexible", "experience": "First doodle, had labs before", "living_situation": "Apartment with dog park nearby"}'::jsonb
),
(
    'Lisa',
    'Thompson',
    'Lisa Thompson',
    'lisa.t@email.com',
    '623-555-2345',
    '["Bernedoodle"]'::jsonb,
    'No preference',
    'Tri-color',
    'Medium',
    'deposit_paid',
    3,
    '{"timeline": "Summer 2025", "experience": "Experienced dog owner", "living_situation": "House, stay-at-home mom"}'::jsonb
);

-- ============================================
-- TESTIMONIALS
-- ============================================
INSERT INTO testimonials (family_name, puppy_name, content, rating, is_approved, is_featured, display_order) VALUES
(
    'The Martinez Family',
    'Charlie',
    'We couldn''t be happier with our puppy from SACC Doodles! Charlie has been the perfect addition to our family. Angela was wonderful throughout the entire process - from answering all our questions to providing updates and photos. Highly recommend!',
    5,
    true,
    true,
    1
),
(
    'Jennifer & Tom',
    'Biscuit',
    'Our Bernedoodle Biscuit is everything we hoped for and more. The health testing and care that goes into these puppies really shows. Biscuit is healthy, smart, and has the best temperament. Thank you SACC Doodles!',
    5,
    true,
    true,
    2
),
(
    'The Patel Family',
    'Mochi',
    'Second puppy from SACC Doodles and we''re just as impressed as the first time. Angela truly cares about her dogs and the families they go to. Mochi and her big sister are best friends!',
    5,
    true,
    false,
    3
);

-- ============================================
-- FAQ
-- ============================================
INSERT INTO faq (question, answer, category, is_published, display_order) VALUES
(
    'What is the deposit amount and is it refundable?',
    'Our deposit is $500, which goes toward the total price of your puppy. Deposits are non-refundable but can be transferred to a future litter if your circumstances change.',
    'Purchasing',
    true,
    1
),
(
    'When can I take my puppy home?',
    'Puppies go home at 8 weeks of age. This gives them proper time to socialize with their littermates and mom, which is crucial for their development.',
    'Purchasing',
    true,
    2
),
(
    'What health testing do you do on your parent dogs?',
    'All of our parent dogs undergo comprehensive health testing including OFA hip and elbow evaluations, cardiac exams, eye certifications, and genetic panel testing for breed-specific conditions.',
    'Health',
    true,
    3
),
(
    'Do you offer a health guarantee?',
    'Yes! We offer a 2-year health guarantee against genetic conditions. Your puppy also comes with their first vaccinations, deworming, and a vet health check.',
    'Health',
    true,
    4
),
(
    'What is a guardian home?',
    'A guardian home is a wonderful arrangement where a family gets to raise one of our breeding dogs as their own pet. The dog lives with you full-time, and we retain breeding rights for a limited number of litters. Contact us to learn more!',
    'Guardian Program',
    true,
    5
);

-- ============================================
-- GALLERY (Happy Families)
-- ============================================
INSERT INTO gallery (image_url, caption, family_name, puppy_name, is_approved, display_order) VALUES
(
    'https://placedog.net/600/400?id=10',
    'Charlie loving his first beach trip!',
    'The Martinez Family',
    'Charlie',
    true,
    1
),
(
    'https://placedog.net/600/400?id=11',
    'Biscuit on her 1st birthday',
    'Jennifer & Tom',
    'Biscuit',
    true,
    2
),
(
    'https://placedog.net/600/400?id=12',
    'Best hiking buddy ever!',
    'The Anderson Family',
    'Scout',
    true,
    3
);

-- ============================================
-- VET RECORDS
-- ============================================
INSERT INTO vet_records (dog_id, visit_date, vet_name, type, reason, treatment, cost, notes)
SELECT
    (SELECT id FROM dogs WHERE name = 'Bella'),
    '2025-01-15',
    'Gilbert Animal Hospital',
    'Wellness',
    'Annual Wellness Exam',
    'Rabies vaccine, DHPP booster, heartworm test',
    285.00,
    'All vaccinations up to date. Healthy weight.'
WHERE EXISTS (SELECT 1 FROM dogs WHERE name = 'Bella');

INSERT INTO vet_records (dog_id, visit_date, vet_name, type, reason, treatment, cost, notes)
SELECT
    (SELECT id FROM dogs WHERE name = 'Luna'),
    '2025-01-20',
    'Gilbert Animal Hospital',
    'Wellness',
    'Annual Wellness Exam',
    'Rabies vaccine, DHPP booster, heartworm test',
    285.00,
    'All clear. Beautiful coat condition.'
WHERE EXISTS (SELECT 1 FROM dogs WHERE name = 'Luna');

INSERT INTO vet_records (dog_id, visit_date, vet_name, type, reason, treatment, cost, notes)
SELECT
    (SELECT id FROM dogs WHERE name = 'Max'),
    '2024-12-10',
    'Chandler Veterinary Clinic',
    'Checkup',
    'Routine Checkup',
    'Bordetella vaccine, nail trim',
    125.00,
    'Healthy and energetic. Weight on track.'
WHERE EXISTS (SELECT 1 FROM dogs WHERE name = 'Max');

-- ============================================
-- EXPENSES
-- ============================================
INSERT INTO expenses (date, category, description, amount, notes)
VALUES
(
    '2025-01-05',
    'Food',
    'Premium dog food (50lb bag x 3)',
    245.00,
    'Monthly food supply for all dogs'
),
(
    '2025-01-10',
    'Supplies',
    'Puppy pads, toys, bedding',
    189.50,
    'Whelping supplies for upcoming litter'
),
(
    '2025-01-15',
    'Vet',
    'Bella wellness exam and vaccines',
    285.00,
    'Annual checkup'
),
(
    '2025-01-20',
    'Marketing',
    'Facebook & Instagram ads',
    150.00,
    'January ad spend'
),
(
    '2025-02-01',
    'Supplies',
    'Grooming supplies and shampoo',
    78.25,
    'Monthly grooming supplies'
);

-- ============================================
-- Done! Test data has been inserted.
-- ============================================
SELECT 'Test data inserted successfully!' as status;
SELECT 'Dogs: ' || COUNT(*) FROM dogs;
SELECT 'Litters: ' || COUNT(*) FROM litters;
SELECT 'Puppies: ' || COUNT(*) FROM puppies;
SELECT 'Customers: ' || COUNT(*) FROM customers;
SELECT 'Waitlist: ' || COUNT(*) FROM waitlist;
SELECT 'Testimonials: ' || COUNT(*) FROM testimonials;
SELECT 'FAQ: ' || COUNT(*) FROM faq;
SELECT 'Gallery: ' || COUNT(*) FROM gallery;
SELECT 'Vet Records: ' || COUNT(*) FROM vet_records;
SELECT 'Expenses: ' || COUNT(*) FROM expenses;
