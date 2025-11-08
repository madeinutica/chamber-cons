-- Enhanced Schema Migration for Chamber of Commerce Database
-- This adds support for rich Schema.org metadata and AI intelligence summaries

-- Add new columns to businesses table for enhanced data
ALTER TABLE businesses
ADD COLUMN IF NOT EXISTS intelligent_summary TEXT,
ADD COLUMN IF NOT EXISTS enhanced_schema JSONB,
ADD COLUMN IF NOT EXISTS keywords TEXT[],
ADD COLUMN IF NOT EXISTS service_type TEXT[],
ADD COLUMN IF NOT EXISTS amenities TEXT[],
ADD COLUMN IF NOT EXISTS payment_accepted TEXT[],
ADD COLUMN IF NOT EXISTS price_range VARCHAR(10),
ADD COLUMN IF NOT EXISTS area_served TEXT,
ADD COLUMN IF NOT EXISTS founding_date DATE,
ADD COLUMN IF NOT EXISTS number_of_employees VARCHAR(50),
ADD COLUMN IF NOT EXISTS slogan TEXT,
ADD COLUMN IF NOT EXISTS alternate_name VARCHAR(255);

-- Add indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_businesses_keywords ON businesses USING GIN(keywords);
CREATE INDEX IF NOT EXISTS idx_businesses_service_type ON businesses USING GIN(service_type);
CREATE INDEX IF NOT EXISTS idx_businesses_enhanced_schema ON businesses USING GIN(enhanced_schema);
CREATE INDEX IF NOT EXISTS idx_businesses_intelligent_summary ON businesses USING GIN(to_tsvector('english', intelligent_summary));

-- Add full-text search index on intelligent_summary for better semantic search
CREATE INDEX IF NOT EXISTS idx_businesses_intelligent_summary_fts 
ON businesses USING GIN(to_tsvector('english', COALESCE(intelligent_summary, '') || ' ' || COALESCE(description, '')));

-- Update existing businesses to have empty arrays where NULL
UPDATE businesses 
SET keywords = '{}' 
WHERE keywords IS NULL;

UPDATE businesses 
SET service_type = '{}' 
WHERE service_type IS NULL;

UPDATE businesses 
SET amenities = '{}' 
WHERE amenities IS NULL;

UPDATE businesses 
SET payment_accepted = '{}' 
WHERE payment_accepted IS NULL;

-- Create a function to extract keywords from enhanced_schema JSONB
CREATE OR REPLACE FUNCTION extract_schema_keywords(schema JSONB)
RETURNS TEXT[] AS $$
BEGIN
  RETURN ARRAY(
    SELECT DISTINCT jsonb_array_elements_text(schema->'keywords')
    WHERE schema ? 'keywords' AND jsonb_typeof(schema->'keywords') = 'array'
  );
EXCEPTION WHEN OTHERS THEN
  RETURN '{}';
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Create a function to extract service types from enhanced_schema JSONB
CREATE OR REPLACE FUNCTION extract_service_types(schema JSONB)
RETURNS TEXT[] AS $$
BEGIN
  RETURN ARRAY(
    SELECT DISTINCT jsonb_array_elements_text(schema->'serviceType')
    WHERE schema ? 'serviceType' AND jsonb_typeof(schema->'serviceType') = 'array'
  );
EXCEPTION WHEN OTHERS THEN
  RETURN '{}';
END;
$$ LANGUAGE plpgsql IMMUTABLE;

COMMENT ON COLUMN businesses.intelligent_summary IS 'AI-generated concise summary of the business';
COMMENT ON COLUMN businesses.enhanced_schema IS 'Schema.org structured data in JSON-LD format';
COMMENT ON COLUMN businesses.keywords IS 'Array of keywords for search optimization';
COMMENT ON COLUMN businesses.service_type IS 'Array of service types offered';
COMMENT ON COLUMN businesses.amenities IS 'Array of amenities/features available';
COMMENT ON COLUMN businesses.payment_accepted IS 'Array of accepted payment methods';
COMMENT ON COLUMN businesses.price_range IS 'Price range indicator ($, $$, $$$, $$$$)';
COMMENT ON COLUMN businesses.area_served IS 'Geographic area served by the business';
COMMENT ON COLUMN businesses.founding_date IS 'Date the business was founded';
COMMENT ON COLUMN businesses.number_of_employees IS 'Employee count range';
COMMENT ON COLUMN businesses.slogan IS 'Business slogan or tagline';
COMMENT ON COLUMN businesses.alternate_name IS 'Alternative name or DBA';
