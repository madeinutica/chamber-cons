require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function geocodeAddress(address) {
  if (!process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN) {
    console.error('Mapbox token not found');
    return null;
  }

  try {
    // Clean and enhance the address for better geocoding
    let enhancedAddress = address.trim();
    
    // Add "New York" if not present
    if (!enhancedAddress.toLowerCase().includes('new york') && !enhancedAddress.toLowerCase().includes(' ny')) {
      // Check if it already has a state abbreviation
      if (!enhancedAddress.match(/,\s*[A-Z]{2}\s*\d{5}/)) {
        enhancedAddress += ', NY';
      }
    }
    
    // Add "United States" for better disambiguation
    if (!enhancedAddress.toLowerCase().includes('united states') && !enhancedAddress.toLowerCase().includes('usa')) {
      enhancedAddress += ', United States';
    }

    const encodedAddress = encodeURIComponent(enhancedAddress);
    
    // Use proximity bias towards Central NY (Utica coordinates) and more specific geocoding
    const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodedAddress}.json?` +
      `access_token=${process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN}&` +
      `limit=1&` +
      `country=us&` +
      `proximity=-75.2321,43.1009&` + // Bias towards Utica, NY area
      `types=address,poi&` + // Prefer specific addresses and points of interest
      `language=en`;
    
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`Geocoding failed: ${response.statusText}`);
    }

    const data = await response.json();
    console.log(`Geocoding "${address}" -> Enhanced: "${enhancedAddress}"`);

    if (data.features && data.features.length > 0) {
      const feature = data.features[0];
      const [longitude, latitude] = feature.center;

      // Validate that we got a reasonably specific result
      const confidence = feature.relevance;
      
      console.log(`  -> ${feature.place_name} (confidence: ${confidence})`);
      
      // Accept results with reasonable confidence
      if (confidence > 0.6) {
        return {
          latitude,
          longitude,
          place_name: feature.place_name
        };
      } else {
        console.warn(`  -> Low confidence result: ${confidence}`);
        return null;
      }
    }

    console.warn(`  -> No geocoding results found`);
    return null;
  } catch (error) {
    console.error('  -> Error geocoding address:', error.message);
    return null;
  }
}

async function fixDuplicateCoordinates() {
  console.log('🔍 Finding businesses with duplicate coordinates...\n');

  const { data: businesses, error } = await supabase
    .from('businesses')
    .select('id, name, address, latitude, longitude');
  
  if (error) {
    console.error('Error fetching businesses:', error);
    return;
  }

  // Group by coordinates to find duplicates
  const coordGroups = {};
  businesses.forEach(b => {
    const key = `${b.latitude},${b.longitude}`;
    if (!coordGroups[key]) coordGroups[key] = [];
    coordGroups[key].push(b);
  });

  // Find groups with duplicates
  const duplicateGroups = Object.values(coordGroups).filter(group => group.length > 1);
  
  console.log(`Found ${duplicateGroups.length} coordinate groups with duplicates:`);
  duplicateGroups.forEach(group => {
    console.log(`  - ${group[0].latitude}, ${group[0].longitude}: ${group.length} businesses`);
  });
  console.log('');

  let updated = 0;
  let failed = 0;
  let skipped = 0;

  // Re-geocode businesses in duplicate groups
  for (const group of duplicateGroups) {
    console.log(`📍 Re-geocoding ${group.length} businesses at ${group[0].latitude}, ${group[0].longitude}:`);
    
    for (const business of group) {
      if (!business.address || business.address.trim() === '') {
        console.log(`  ⏭️  Skipping ${business.name} - no address`);
        skipped++;
        continue;
      }

      console.log(`  🔄 ${business.name}: ${business.address}`);
      
      const result = await geocodeAddress(business.address);

      if (result && 
          (Math.abs(result.latitude - business.latitude) > 0.001 || 
           Math.abs(result.longitude - business.longitude) > 0.001)) {
        
        // Update the business with new coordinates
        const { error: updateError } = await supabase
          .from('businesses')
          .update({
            latitude: result.latitude,
            longitude: result.longitude
          })
          .eq('id', business.id);

        if (updateError) {
          console.error(`  ❌ Failed to update ${business.name}:`, updateError);
          failed++;
        } else {
          console.log(`  ✅ Updated to: ${result.latitude}, ${result.longitude}`);
          updated++;
        }
      } else if (result) {
        console.log(`  ⚠️  Same coordinates returned - keeping original`);
        skipped++;
      } else {
        console.log(`  ❌ Failed to geocode`);
        failed++;
      }

      // Rate limiting - wait 500ms between requests
      await new Promise(resolve => setTimeout(resolve, 500));
    }
    console.log('');
  }

  console.log('🎉 Geocoding fix completed!');
  console.log(`📊 Results:`);
  console.log(`  - Updated: ${updated}`);
  console.log(`  - Skipped: ${skipped}`);
  console.log(`  - Failed: ${failed}`);
}

fixDuplicateCoordinates();