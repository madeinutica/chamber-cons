require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN;

// Rate limiting
const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

async function geocodeBusiness(business) {
  try {
    // Build search query from available info
    const searchParts = [];
    
    if (business.name) searchParts.push(business.name);
    
    // Add location context - Utica, NY area
    searchParts.push('Utica NY');
    
    const searchQuery = searchParts.join(' ');
    
    console.log(`🔍 Geocoding: ${business.name}`);
    console.log(`   Search query: ${searchQuery}`);
    
    // Use Mapbox Geocoding API
    const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(searchQuery)}.json?access_token=${MAPBOX_TOKEN}&limit=1&proximity=-75.2326,43.1009&country=US`;
    
    const response = await fetch(url);
    const data = await response.json();
    
    if (data.features && data.features.length > 0) {
      const result = data.features[0];
      
      // Extract address components
      const address = result.place_name;
      const [longitude, latitude] = result.center;
      
      console.log(`   ✅ Found: ${address}`);
      console.log(`   📍 Coordinates: ${latitude}, ${longitude}`);
      
      return {
        address,
        latitude,
        longitude,
        geocoded: true
      };
    } else {
      console.log(`   ❌ No results found`);
      return null;
    }
  } catch (error) {
    console.error(`   ❌ Error geocoding ${business.name}:`, error.message);
    return null;
  }
}

async function updateBusinessLocation(businessId, locationData) {
  try {
    const { error } = await supabase
      .from('businesses')
      .update({
        address: locationData.address,
        latitude: locationData.latitude,
        longitude: locationData.longitude
      })
      .eq('id', businessId);
    
    if (error) throw error;
    return true;
  } catch (error) {
    console.error(`   ❌ Error updating business ${businessId}:`, error.message);
    return false;
  }
}

async function main() {
  console.log('🚀 Starting Business Geocoding\n');
  
  if (!MAPBOX_TOKEN) {
    console.error('❌ NEXT_PUBLIC_MAPBOX_TOKEN not found in environment variables');
    process.exit(1);
  }
  
  // Fetch all businesses (we'll geocode all of them to ensure accurate locations)
  console.log('📊 Fetching businesses from database...\n');
  
  const { data: businesses, error } = await supabase
    .from('businesses')
    .select('id, name, website, phone, address, latitude, longitude');
  
  if (error) {
    console.error('❌ Error fetching businesses:', error);
    process.exit(1);
  }
  
  console.log(`📈 Found ${businesses.length} businesses needing geocoding\n`);
  console.log('============================================================\n');
  
  let successCount = 0;
  let failCount = 0;
  let updateCount = 0;
  
  for (let i = 0; i < businesses.length; i++) {
    const business = businesses[i];
    
    console.log(`[${i + 1}/${businesses.length}] Processing: ${business.name}`);
    
    // Geocode the business
    const locationData = await geocodeBusiness(business);
    
    if (locationData) {
      // Update in database
      const updated = await updateBusinessLocation(business.id, locationData);
      
      if (updated) {
        successCount++;
        updateCount++;
        console.log(`   💾 Database updated\n`);
      } else {
        failCount++;
        console.log(`   ❌ Failed to update database\n`);
      }
    } else {
      failCount++;
      console.log('');
    }
    
    // Rate limiting - wait 200ms between requests (Mapbox allows 600 req/min)
    await delay(200);
  }
  
  console.log('============================================================');
  console.log('📊 GEOCODING SUMMARY');
  console.log('============================================================');
  console.log(`✅ Successfully geocoded: ${successCount}`);
  console.log(`💾 Database records updated: ${updateCount}`);
  console.log(`❌ Failed to geocode: ${failCount}`);
  console.log(`📈 Total processed: ${businesses.length}`);
  console.log('============================================================');
}

main().catch(console.error);
