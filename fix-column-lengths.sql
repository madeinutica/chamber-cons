-- Fix column length issues for phone and other fields
-- Run this SQL in your Supabase SQL Editor

-- Increase phone column length
ALTER TABLE businesses ALTER COLUMN phone TYPE VARCHAR(50);

-- Make sure other columns have adequate length
ALTER TABLE businesses ALTER COLUMN website TYPE TEXT;
ALTER TABLE businesses ALTER COLUMN category TYPE VARCHAR(100);

-- Check current schema
SELECT column_name, data_type, character_maximum_length 
FROM information_schema.columns 
WHERE table_name = 'businesses' 
ORDER BY ordinal_position;