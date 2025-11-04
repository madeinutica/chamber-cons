-- Chamber of Commerce Database Update Script
-- Run this SQL in your Supabase SQL Editor
-- This script handles existing tables and updates the schema

-- Drop existing tables if they exist (in correct order due to foreign key constraints)
DROP TABLE IF EXISTS reviews CASCADE;
DROP TABLE IF EXISTS businesses CASCADE;
DROP TABLE IF EXISTS categories CASCADE;

-- Create businesses table (includes both for-profit businesses and non-profits)
CREATE TABLE businesses (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  category VARCHAR(100) NOT NULL,
  description TEXT,
  address TEXT NOT NULL,
  phone VARCHAR(20),
  website VARCHAR(255),
  rating DECIMAL(2,1) DEFAULT 0 CHECK (rating >= 0 AND rating <= 5),
  featured BOOLEAN DEFAULT false,
  sponsored BOOLEAN DEFAULT false,
  veteran_owned BOOLEAN DEFAULT false,
  is_nonprofit BOOLEAN DEFAULT false,
  latitude DECIMAL(10,8) NOT NULL,
  longitude DECIMAL(11,8) NOT NULL,
  meta_description TEXT,
  schema_json JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create categories table
CREATE TABLE categories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(100) NOT NULL UNIQUE,
  icon VARCHAR(50),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create reviews table
CREATE TABLE reviews (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  business_id UUID REFERENCES businesses(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  author VARCHAR(255),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert sample categories
INSERT INTO categories (name, icon) VALUES
('Home Services', '🏠'),
('Restaurant', '🍽️'),
('Coffee & Tea', '☕'),
('Bakery', '🥖'),
('Retail', '🛍️'),
('Professional Services', '💼'),
('Health & Wellness', '🏥'),
('Automotive', '🚗'),
('Entertainment', '🎭'),
('Beauty & Spa', '💅'),
('Non-Profit', '🤝'),
('Education', '🎓'),
('Community Services', '🏛️'),
('Arts & Culture', '🎨'),
('Animal Welfare', '🐾'),
('Youth Services', '👶'),
('Senior Services', '👴'),
('Emergency Services', '🚑'),
('Religious Organizations', '⛪'),
('Sports & Recreation', '⚽');

-- Insert sample businesses
INSERT INTO businesses (name, category, description, address, phone, website, rating, featured, sponsored, veteran_owned, is_nonprofit, latitude, longitude) VALUES
('New York Sash', 'Home Services', 'Central New York''s premier window and door installation company. Expert installation, energy-efficient solutions, and exceptional customer service.', '1662 Sunset Ave, Utica, NY', '(315) 624-3420', 'newyorksash.com', 4.8, true, true, true, false, 43.1009, -75.2321),
('Utica Coffee Roasting Co', 'Coffee & Tea', 'Locally roasted coffee beans and specialty drinks in the heart of Utica.', '123 Coffee St, Utica, NY', '(315) 624-2970', 'uticacoffee.com', 4.5, false, true, false, false, 43.1009, -75.2321),
('The Tailor and the Cook', 'Restaurant', 'Fine dining restaurant featuring locally sourced ingredients and creative cuisine.', '456 Main St, Utica, NY', '(315) 507-8797', 'tailorandcook.com', 4.7, false, true, false, false, 43.1009, -75.2321),
('Aqua Vino', 'Restaurant', 'Italian-inspired restaurant with fresh pasta and extensive wine selection.', '789 Italian Way, Utica, NY', '(315) 732-9284', 'aquavino.com', 4.6, false, true, false, false, 43.1009, -75.2321),
('Caruso''s Pastry Shoppe', 'Bakery', 'Traditional Italian bakery serving fresh pastries, cakes, and desserts since 1948.', '321 Pastry Lane, Utica, NY', '(315) 732-9641', 'carusospastry.com', 4.9, false, true, false, false, 43.1009, -75.2321),
('Tech Solutions CNY', 'Professional Services', 'Full-service IT consulting and computer repair for businesses and individuals.', '555 Tech Blvd, Utica, NY', '(315) 555-0123', 'techsolutionscny.com', 4.3, false, false, false, false, 43.1050, -75.2350),
('Mohawk Valley Fitness', 'Health & Wellness', 'State-of-the-art fitness facility with personal training and group classes.', '777 Fitness Ave, Utica, NY', '(315) 555-0456', 'mvfitness.com', 4.4, true, false, false, false, 43.0980, -75.2290),
('Central NY Auto Repair', 'Automotive', 'Trusted automotive service and repair shop serving the community for over 20 years.', '999 Auto St, Utica, NY', '(315) 555-0789', 'cnyautorepair.com', 4.2, false, false, true, false, 43.1040, -75.2310);

-- Insert Non-Profit Organizations - Rome Area
INSERT INTO businesses (name, category, description, address, phone, website, rating, featured, sponsored, veteran_owned, is_nonprofit, latitude, longitude, meta_description) VALUES
('Connected Community Schools', 'Education', 'A non-profit in Rome, NY, connecting schools with community resources to support students and families, removing barriers to learning.', '207 N James Street, Rome, NY 13440', '(315) 272-7498', 'connectedcommunityschools.org', 4.5, false, false, false, true, 43.2128, -75.4557, 'A non-profit in Rome, NY, connecting schools with community resources to support students and families, removing barriers to learning.'),
('Copper City Community Connection', 'Community Services', 'A non-profit community center in Rome, NY, providing social, recreational, and educational programs for seniors and adults.', '305 E Locust Street, Rome, NY 13440', '(315) 337-8230', 'coppercitycommunityconnection.com', 4.3, false, false, false, true, 43.2128, -75.4557, 'A non-profit community center in Rome, NY, providing social, recreational, and educational programs for seniors and adults.'),
('Griffiss Institute', 'Professional Services', 'A non-profit in Rome, NY, fostering a technology ecosystem. We support STEM education, innovation, and defense-related research.', '592 Hangar Rd, STE 200, Rome, NY 13441', '(315) 838-1696', 'griffissinstitute.org', 4.6, true, false, false, true, 43.2336, -75.4064, 'A non-profit in Rome, NY, fostering a technology ecosystem. We support STEM education, innovation, and defense-related research.'),
('Humane Society of Rome, NY Inc.', 'Animal Welfare', 'Non-profit animal shelter in Rome, NY. We provide animal welfare services, care for homeless pets, and facilitate adoptions.', '6247 Lamphear Road, Rome, NY 13440', '(315) 336-7070', 'humanesocietyrome.com', 4.7, false, false, false, true, 43.2128, -75.4557, 'Non-profit animal shelter in Rome, NY. We provide animal welfare services, care for homeless pets, and facilitate adoptions.'),
('Jervis Public Library', 'Education', 'The official public library for Rome, NY. A non-profit providing free access to books, media, educational programs, and community events.', '613 N Washington Street, Rome, NY 13440', '(315) 336-4570', 'jervislibrary.org', 4.5, false, false, false, true, 43.2128, -75.4557, 'The official public library for Rome, NY. A non-profit providing free access to books, media, educational programs, and community events.'),
('Rome Art and Community Center', 'Arts & Culture', 'A non-profit arts and cultural center in Rome, NY. We offer art classes, gallery exhibitions, and community events for all ages.', '308 W Bloomfield Street, Rome, NY 13440', '(315) 336-1040', 'romeart.org', 4.4, false, false, false, true, 43.2128, -75.4557, 'A non-profit arts and cultural center in Rome, NY. We offer art classes, gallery exhibitions, and community events for all ages.'),
('Rome Capitol Theatre', 'Entertainment', 'A non-profit historic theatre in Rome, NY, dedicated to presenting films, live performances, and cultural events.', '220 W. Dominick St, Rome, NY 13440', '(315) 337-6277', 'romecapitol.com', 4.6, true, false, false, true, 43.2128, -75.4557, 'A non-profit historic theatre in Rome, NY, dedicated to presenting films, live performances, and cultural events.'),
('Rome Historical Society', 'Arts & Culture', 'A non-profit museum and research center in Rome, NY, dedicated to preserving and sharing the rich history of the Rome area.', '200 Church Street, Rome, NY 13440', '(315) 336-5870', 'romehistoricalsociety.org', 4.5, false, false, false, true, 43.2128, -75.4557, 'A non-profit museum and research center in Rome, NY, dedicated to preserving and sharing the rich history of the Rome area.'),
('Rome Rescue Mission', 'Community Services', 'A non-profit in Rome, NY, providing food, shelter, and hope to the homeless and those in need.', '413 East Dominick Street, Rome, NY 13440', '(315) 337-2516', 'romemission.org', 4.4, false, false, false, true, 43.2128, -75.4557, 'A non-profit in Rome, NY, providing food, shelter, and hope to the homeless and those in need.'),
('The Salvation Army of Rome', 'Community Services', 'A non-profit faith-based organization in Rome, NY, providing social services, food pantry, and emergency assistance to those in need.', '410 West Dominick Street, Rome, NY 13440', '(315) 336-4260', 'easternusa.salvationarmy.org/empire/rome', 4.3, false, false, false, true, 43.2128, -75.4557, 'A non-profit faith-based organization in Rome, NY, providing social services, food pantry, and emergency assistance to those in need.');

-- Insert Non-Profit Organizations - Utica Area  
INSERT INTO businesses (name, category, description, address, phone, website, rating, featured, sponsored, veteran_owned, is_nonprofit, latitude, longitude, meta_description) VALUES
('Anita''s Stevens Swan Humane Society', 'Animal Welfare', 'A non-profit animal shelter in Utica, NY, providing compassionate care, adoption services, and pet population control for Oneida County.', '5664 Horatio Street, Utica, NY 13502', '(315) 738-4357', 'anitas-sshs.org', 4.6, false, false, false, true, 43.1009, -75.2321, 'A non-profit animal shelter in Utica, NY, providing compassionate care, adoption services, and pet population control for Oneida County.'),
('Helio Health', 'Health & Wellness', 'A non-profit in Utica, NY, providing comprehensive addiction, mental health, and housing services to promote recovery and wellness.', '500 Whiteboro Street, Utica, NY 13502', '(315) 724-5168', 'helio.health', 4.5, false, false, false, true, 43.1009, -75.2321, 'A non-profit in Utica, NY, providing comprehensive addiction, mental health, and housing services to promote recovery and wellness.'),
('Mohawk Valley Community Action Agency, Inc.', 'Community Services', 'A non-profit in Utica, NY, dedicated to fighting poverty by providing services like Head Start, health, and housing assistance.', '9882 River Road, Utica, NY 13502', '(315) 624-9930', 'mvcaa.com', 4.4, false, false, false, true, 43.1009, -75.2321, 'A non-profit in Utica, NY, dedicated to fighting poverty by providing services like Head Start, health, and housing assistance.'),
('Mother Marianne''s West Side Kitchen', 'Community Services', 'A non-profit soup kitchen in Utica, NY, providing free, nutritious meals and clothing to anyone in need with dignity and respect.', '702 Columbia Street, Utica, NY 13502', '(315) 735-3289', 'mmwsk.org', 4.7, true, false, false, true, 43.1009, -75.2321, 'A non-profit soup kitchen in Utica, NY, providing free, nutritious meals and clothing to anyone in need with dignity and respect.'),
('Sculpture Space, Inc.', 'Arts & Culture', 'A non-profit artist residency in Utica, NY, providing studio space and support for professional sculptors from around the world.', '12 Gates Street, Utica, NY 13502', '(315) 724-8381', 'sculpturespace.org', 4.5, false, false, false, true, 43.1009, -75.2321, 'A non-profit artist residency in Utica, NY, providing studio space and support for professional sculptors from around the world.'),
('The House of the Good Shepherd', 'Youth Services', 'A non-profit in Utica, NY, providing foster care, behavioral health, and educational services to children and families in need.', '1550 Champlin Avenue, Utica, NY 13502', '(315) 235-7600', 'hgs-utica.com', 4.4, false, false, false, true, 43.1009, -75.2321, 'A non-profit in Utica, NY, providing foster care, behavioral health, and educational services to children and families in need.'),
('Thea Bowman House, Inc.', 'Community Services', 'A non-profit multicultural center in Utica, NY, providing childcare, education, and family support services.', '731 Lafayette Street, Utica, NY 13502', '(315) 797-0748', 'theabowmanhouse.org', 4.3, false, false, false, true, 43.1009, -75.2321, 'A non-profit multicultural center in Utica, NY, providing childcare, education, and family support services.');

-- Insert Non-Profit Organizations - Clinton Area
INSERT INTO businesses (name, category, description, address, phone, website, rating, featured, sponsored, veteran_owned, is_nonprofit, latitude, longitude, meta_description) VALUES
('Clinton Historical Society', 'Arts & Culture', 'A non-profit in Clinton, NY, preserving and sharing the history of the Village of Clinton and the Town of Kirkland.', '1 Fountain Street, Clinton, NY 13323', '(315) 859-1392', 'clintonhistorical.org', 4.4, false, false, false, true, 43.0481, -75.3785, 'A non-profit in Clinton, NY, preserving and sharing the history of the Village of Clinton and the Town of Kirkland.'),
('Kirkland Art Center', 'Arts & Culture', 'A non-profit arts center in Clinton, NY, offering art classes, exhibitions, and performances to inspire creativity in the community.', '9 1/2 East Park Row, Clinton, NY 13323', '(315) 853-8871', 'kacny.org', 4.5, false, false, false, true, 43.0481, -75.3785, 'A non-profit arts center in Clinton, NY, offering art classes, exhibitions, and performances to inspire creativity in the community.'),
('Kirkland Town Library', 'Education', 'The public library for Clinton, NY. A non-profit resource for books, media, digital learning, and community programs for all ages.', '55 1/2 College St, Clinton, NY 13323', '(315) 853-2038', 'kirklandtownlibrary.org', 4.6, false, false, false, true, 43.0481, -75.3785, 'The public library for Clinton, NY. A non-profit resource for books, media, digital learning, and community programs for all ages.');

-- Insert sample reviews
INSERT INTO reviews (business_id, rating, comment, author) VALUES
((SELECT id FROM businesses WHERE name = 'New York Sash'), 5, 'Excellent service and quality work. Highly recommend!', 'John Smith'),
((SELECT id FROM businesses WHERE name = 'New York Sash'), 5, 'Professional installation and great customer service.', 'Mary Johnson'),
((SELECT id FROM businesses WHERE name = 'Utica Coffee Roasting Co'), 4, 'Great coffee and friendly atmosphere.', 'Coffee Lover'),
((SELECT id FROM businesses WHERE name = 'The Tailor and the Cook'), 5, 'Amazing food and excellent service. Perfect for special occasions.', 'Food Critic'),
((SELECT id FROM businesses WHERE name = 'Caruso''s Pastry Shoppe'), 5, 'Best cannoli in Central New York!', 'Sweet Tooth'),
((SELECT id FROM businesses WHERE name = 'Mother Marianne''s West Side Kitchen'), 5, 'Amazing community service. They truly care about helping people in need.', 'Community Volunteer'),
((SELECT id FROM businesses WHERE name = 'Rome Capitol Theatre'), 5, 'Beautiful historic venue with excellent programming. A true community treasure!', 'Arts Lover');

-- Create indexes for better performance
CREATE INDEX idx_businesses_category ON businesses(category);
CREATE INDEX idx_businesses_featured ON businesses(featured);
CREATE INDEX idx_businesses_rating ON businesses(rating);
CREATE INDEX idx_businesses_nonprofit ON businesses(is_nonprofit);
CREATE INDEX idx_reviews_business_id ON reviews(business_id);

-- Create a view for easier querying of nonprofits
CREATE VIEW nonprofits AS 
SELECT * FROM businesses WHERE is_nonprofit = true;

-- Create a view for easier querying of for-profit businesses
CREATE VIEW for_profit_businesses AS 
SELECT * FROM businesses WHERE is_nonprofit = false;

-- Enable Row Level Security (optional - can be configured later)
-- ALTER TABLE businesses ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

-- Create policies for public read access (uncomment if using RLS)
-- CREATE POLICY "Public read access for businesses" ON businesses FOR SELECT USING (true);
-- CREATE POLICY "Public read access for categories" ON categories FOR SELECT USING (true);
-- CREATE POLICY "Public read access for reviews" ON reviews FOR SELECT USING (true);