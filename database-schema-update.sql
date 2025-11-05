-- Add missing columns to businesses table for enriched data
-- Run this SQL in your Supabase SQL Editor

-- Add email column
ALTER TABLE businesses ADD COLUMN IF NOT EXISTS email VARCHAR(255);

-- Add woman_owned column  
ALTER TABLE businesses ADD COLUMN IF NOT EXISTS woman_owned BOOLEAN DEFAULT false;

-- Add minority_owned column
ALTER TABLE businesses ADD COLUMN IF NOT EXISTS minority_owned BOOLEAN DEFAULT false;

-- Add full_category column for storing complete category information
ALTER TABLE businesses ADD COLUMN IF NOT EXISTS full_category TEXT;

-- Create indexes on new columns
CREATE INDEX IF NOT EXISTS idx_businesses_woman_owned ON businesses(woman_owned);
CREATE INDEX IF NOT EXISTS idx_businesses_minority_owned ON businesses(minority_owned);
CREATE INDEX IF NOT EXISTS idx_businesses_veteran_owned ON businesses(veteran_owned);
CREATE INDEX IF NOT EXISTS idx_businesses_is_nonprofit ON businesses(is_nonprofit);

-- Update existing businesses with some email addresses (optional)
UPDATE businesses SET email = 'info@' || LOWER(REPLACE(REPLACE(website, 'https://', ''), 'http://', '')) WHERE email IS NULL AND website IS NOT NULL;