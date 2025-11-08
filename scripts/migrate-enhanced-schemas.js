/**
 * Enhanced Schema Migration Script
 * Migrates business data from organizations_enhanced_schemas.json to Supabase
 * with full Schema.org metadata and AI intelligence summaries
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Load environment variables
require('dotenv').config({ path: path.join(__dirname, '..', '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase credentials. Check your .env.local file.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Load the enhanced schema data
const dataPath = path.join(__dirname, '..', 'data', 'organizations_enhanced_schemas.json');
const organizations = JSON.parse(fs.readFileSync(dataPath, 'utf-8'));

console.log(`📊 Loaded ${organizations.length} organizations from enhanced schema file\n`);

/**
 * Extract and normalize data from enhanced schema
 */
function extractEnhancedData(org) {
  const schema = org.enhanced_schema || {};
  
  // Extract keywords (handle both string and array formats)
  let keywords = [];
  if (schema.keywords) {
    if (typeof schema.keywords === 'string') {
      keywords = schema.keywords.split(',').map(k => k.trim());
    } else if (Array.isArray(schema.keywords)) {
      keywords = schema.keywords;
    }
  }
  
  // Extract service types
  let serviceTypes = [];
  if (schema.serviceType) {
    serviceTypes = Array.isArray(schema.serviceType) ? schema.serviceType : [schema.serviceType];
  }
  
  // Extract amenities/features
  let amenities = [];
  if (schema.amenityFeature) {
    if (Array.isArray(schema.amenityFeature)) {
      amenities = schema.amenityFeature.map(a => {
        if (typeof a === 'string') return a;
        if (a.name) return a.name;
        return JSON.stringify(a);
      });
    }
  }
  
  // Extract payment methods
  let paymentAccepted = [];
  if (schema.paymentAccepted) {
    paymentAccepted = Array.isArray(schema.paymentAccepted) 
      ? schema.paymentAccepted 
      : [schema.paymentAccepted];
  }
  
  // Extract address information
  let addressObj = schema.address || {};
  let fullAddress = 'N/A';
  if (org.Address && org.Address !== 'N/A') {
    fullAddress = org.Address;
  } else if (addressObj.streetAddress) {
    fullAddress = [
      addressObj.streetAddress,
      addressObj.addressLocality,
      addressObj.addressRegion,
      addressObj.postalCode
    ].filter(Boolean).join(', ');
  }
  
  // Parse categories - handle both string and array
  let categories = [];
  if (org.Category) {
    if (typeof org.Category === 'string') {
      categories = org.Category.split(',').map(c => c.trim());
    } else if (Array.isArray(org.Category)) {
      categories = org.Category;
    }
  }
  
  // Check for designations
  const categoryStr = org.Category || '';
  const veteranOwned = categoryStr.toLowerCase().includes('veteran-owned');
  const womanOwned = categoryStr.toLowerCase().includes('woman-owned') || 
                      categoryStr.toLowerCase().includes('mwbe');
  const minorityOwned = categoryStr.toLowerCase().includes('minority-owned') || 
                        categoryStr.toLowerCase().includes('mbe');
  const isNonprofit = categoryStr.toLowerCase().includes('non-profit') ||
                      schema['@type'] === 'NonprofitOrganization';
  
  return {
    name: org.Name,
    category: categories[0] || 'General',
    description: org.Description || '',
    intelligent_summary: org.intelligent_summary || org.Description || '',
    address: fullAddress,
    phone: org.Phone || '',
    website: org.website && org.website !== 'Not available' ? org.website : null,
    email: org.email && org.email !== 'Not available' ? org.email : null,
    enhanced_schema: schema,
    keywords: keywords,
    service_type: serviceTypes,
    amenities: amenities,
    payment_accepted: paymentAccepted,
    price_range: schema.priceRange || null,
    area_served: schema.areaServed || 'Mohawk Valley, NY',
    founding_date: schema.foundingDate || null,
    number_of_employees: schema.numberOfEmployees || null,
    slogan: schema.slogan || null,
    alternate_name: schema.alternateName || null,
    veteran_owned: veteranOwned,
    woman_owned: womanOwned,
    minority_owned: minorityOwned,
    is_nonprofit: isNonprofit,
    rating: 4.5, // Default rating
    featured: false
  };
}

/**
 * Insert or update business data to Supabase
 */
async function upsertBusiness(businessData) {
  try {
    // First, try to find existing business by name
    const { data: existing } = await supabase
      .from('businesses')
      .select('id')
      .eq('name', businessData.name)
      .single();
    
    let data, error;
    
    if (existing) {
      // Update existing business
      const result = await supabase
        .from('businesses')
        .update(businessData)
        .eq('id', existing.id)
        .select();
      data = result.data;
      error = result.error;
    } else {
      // Insert new business
      const result = await supabase
        .from('businesses')
        .insert(businessData)
        .select();
      data = result.data;
      error = result.error;
    }
    
    if (error) {
      console.error(`❌ Error upserting ${businessData.name}:`, error.message);
      return { success: false, error: error.message };
    }
    
    return { success: true, data };
  } catch (err) {
    console.error(`❌ Exception upserting ${businessData.name}:`, err.message);
    return { success: false, error: err.message };
  }
}

/**
 * Main migration function
 */
async function migrateEnhancedData() {
  console.log('🚀 Starting enhanced schema migration...\n');
  
  let successCount = 0;
  let failCount = 0;
  const errors = [];
  
  // Process in batches of 10 to avoid rate limits
  const batchSize = 10;
  
  for (let i = 0; i < organizations.length; i += batchSize) {
    const batch = organizations.slice(i, i + batchSize);
    const promises = batch.map(org => {
      const businessData = extractEnhancedData(org);
      return upsertBusiness(businessData);
    });
    
    const results = await Promise.all(promises);
    
    results.forEach((result, idx) => {
      const org = batch[idx];
      if (result.success) {
        successCount++;
        console.log(`✅ [${i + idx + 1}/${organizations.length}] ${org.Name}`);
      } else {
        failCount++;
        errors.push({ name: org.Name, error: result.error });
        console.error(`❌ [${i + idx + 1}/${organizations.length}] ${org.Name}: ${result.error}`);
      }
    });
    
    // Small delay between batches
    if (i + batchSize < organizations.length) {
      await new Promise(resolve => setTimeout(resolve, 100));
    }
  }
  
  console.log('\n' + '='.repeat(60));
  console.log('📊 MIGRATION SUMMARY');
  console.log('='.repeat(60));
  console.log(`✅ Successfully migrated: ${successCount}`);
  console.log(`❌ Failed: ${failCount}`);
  console.log(`📈 Total processed: ${organizations.length}`);
  console.log('='.repeat(60));
  
  if (errors.length > 0) {
    console.log('\n❌ ERRORS:');
    errors.forEach(err => {
      console.log(`  - ${err.name}: ${err.error}`);
    });
  }
  
  console.log('\n✨ Migration complete!');
}

// Run the migration
migrateEnhancedData().catch(err => {
  console.error('💥 Fatal error during migration:', err);
  process.exit(1);
});
