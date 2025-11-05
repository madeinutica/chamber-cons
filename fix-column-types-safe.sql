-- Safe column type fixes - handle view dependencies
-- Run this SQL in your Supabase SQL Editor

-- First, let's see what views depend on the businesses table
SELECT schemaname, viewname, definition 
FROM pg_views 
WHERE definition LIKE '%businesses%';

-- Drop the nonprofits view temporarily (we'll recreate it)
DROP VIEW IF EXISTS nonprofits;

-- Now we can safely alter the column types
ALTER TABLE businesses ALTER COLUMN phone TYPE VARCHAR(50);
ALTER TABLE businesses ALTER COLUMN website TYPE TEXT;
ALTER TABLE businesses ALTER COLUMN category TYPE VARCHAR(100);

-- Recreate the nonprofits view (adjust this based on the original definition)
CREATE VIEW nonprofits AS 
SELECT * FROM businesses 
WHERE is_nonprofit = true;

-- Check the updated schema
SELECT column_name, data_type, character_maximum_length 
FROM information_schema.columns 
WHERE table_name = 'businesses' 
ORDER BY ordinal_position;