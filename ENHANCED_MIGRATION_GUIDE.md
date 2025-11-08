# Enhanced Schema Migration Guide

## Overview
This migration adds rich Schema.org metadata and AI-generated intelligent summaries to all business listings, enhancing search capabilities and RAG (Retrieval-Augmented Generation) for the AI chatbot.

## What's Included

### 1. Database Schema Updates (`enhanced-schema-migration.sql`)
- **intelligent_summary**: AI-generated concise business summaries
- **enhanced_schema**: Full Schema.org JSON-LD structured data
- **keywords**: Array of SEO and search keywords
- **service_type**: Array of services offered
- **amenities**: Array of features/amenities
- **payment_accepted**: Payment methods accepted
- **price_range**: Price indicator ($-$$$$)
- **area_served**: Geographic service area
- **founding_date**: Business founding date
- **number_of_employees**: Employee count range
- **slogan**: Business tagline
- **alternate_name**: DBA or alternative names

### 2. Data Migration Script (`migrate-enhanced-schemas.js`)
Imports all businesses from `organizations_enhanced_schemas.json` with full Schema.org metadata

### 3. Enhanced RAG Chat API (`src/app/api/chat/route.ts`)
Updated to use intelligent summaries and enhanced schema for better AI responses

### 4. TypeScript Types (`src/types/business.ts`)
Extended Business interface with all new enhanced fields

## Migration Steps

### Step 1: Apply SQL Schema Migration
```bash
# Connect to your Supabase database and run:
psql postgresql://postgres:hD5pqcHecBaNrQ4S@db.auprbgrzdeeopxnxkmae.supabase.co:5432/postgres -f scripts/enhanced-schema-migration.sql
```

Or via Supabase Dashboard:
1. Go to SQL Editor in your Supabase dashboard
2. Copy contents of `scripts/enhanced-schema-migration.sql`
3. Paste and execute

### Step 2: Run Data Migration
```bash
node scripts/migrate-enhanced-schemas.js
```

This will:
- Load all organizations from `organizations_enhanced_schemas.json`
- Extract and normalize enhanced schema data
- Upsert businesses to Supabase with full metadata
- Show progress and summary

### Step 3: Verify Migration
```bash
# Check that businesses have enhanced data
psql postgresql://postgres:hD5pqcHecBaNrQ4S@db.auprbgrzdeeopxnxkmae.supabase.co:5432/postgres -c "SELECT name, intelligent_summary, keywords, service_type FROM businesses LIMIT 5;"
```

Or via Supabase Dashboard:
1. Go to Table Editor → businesses
2. Verify new columns are populated

## Benefits

### For Search & Discovery
- **Better semantic search** using intelligent summaries
- **Keyword-based filtering** with extracted keywords
- **Service type filtering** for precise results
- **Full-text search** optimized with PostgreSQL indexes

### For AI Chat (RAG)
- **Richer context** from Schema.org metadata
- **Concise summaries** for faster processing
- **Structured data** for accurate responses
- **Enhanced recommendations** with detailed business info

### For SEO
- **Schema.org markup** ready for rich snippets
- **Structured data** for search engines
- **Meta descriptions** from intelligent summaries
- **Comprehensive keywords** for discoverability

## Data Source
- **Source File**: `data/organizations_enhanced_schemas.json`
- **Total Records**: ~29,086 lines (varies by organization count)
- **Schema Format**: Schema.org JSON-LD with custom extensions

## Rollback
If you need to rollback:
```sql
-- Remove new columns (destructive)
ALTER TABLE businesses
DROP COLUMN IF EXISTS intelligent_summary,
DROP COLUMN IF EXISTS enhanced_schema,
DROP COLUMN IF EXISTS keywords,
DROP COLUMN IF EXISTS service_type,
DROP COLUMN IF EXISTS amenities,
DROP COLUMN IF EXISTS payment_accepted,
DROP COLUMN IF EXISTS price_range,
DROP COLUMN IF EXISTS area_served,
DROP COLUMN IF EXISTS founding_date,
DROP COLUMN IF EXISTS number_of_employees,
DROP COLUMN IF EXISTS slogan,
DROP COLUMN IF EXISTS alternate_name;
```

## Support
For issues or questions, check the migration logs or contact the development team.
