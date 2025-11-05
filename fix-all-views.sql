-- Comprehensive fix for all view dependencies
-- Run this SQL in your Supabase SQL Editor

-- Step 1: Find and drop all views that depend on businesses table
DROP VIEW IF EXISTS nonprofits CASCADE;
DROP VIEW IF EXISTS for_profit_businesses CASCADE;
DROP VIEW IF EXISTS veteran_owned_businesses CASCADE;
DROP VIEW IF EXISTS woman_owned_businesses CASCADE;
DROP VIEW IF EXISTS minority_owned_businesses CASCADE;

-- Step 2: Now safely alter the column types
ALTER TABLE businesses ALTER COLUMN phone TYPE VARCHAR(50);
ALTER TABLE businesses ALTER COLUMN website TYPE TEXT;
ALTER TABLE businesses ALTER COLUMN category TYPE VARCHAR(100);

-- Step 3: Recreate all the views with proper definitions
CREATE VIEW nonprofits AS 
SELECT * FROM businesses 
WHERE is_nonprofit = true;

CREATE VIEW for_profit_businesses AS 
SELECT * FROM businesses 
WHERE is_nonprofit = false OR is_nonprofit IS NULL;

CREATE VIEW veteran_owned_businesses AS 
SELECT * FROM businesses 
WHERE veteran_owned = true;

CREATE VIEW woman_owned_businesses AS 
SELECT * FROM businesses 
WHERE woman_owned = true;

CREATE VIEW minority_owned_businesses AS 
SELECT * FROM businesses 
WHERE minority_owned = true;

-- Step 4: Verify the changes
SELECT 'businesses table schema:' as info;
SELECT column_name, data_type, character_maximum_length 
FROM information_schema.columns 
WHERE table_name = 'businesses' 
ORDER BY ordinal_position;

SELECT 'views recreated:' as info;
SELECT schemaname, viewname 
FROM pg_views 
WHERE viewname LIKE '%business%' OR viewname = 'nonprofits';