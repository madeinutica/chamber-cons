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
    let enhancedAddress = address.trim();
    
    if (!enhancedAddress.toLowerCase().includes('new york') && !enhancedAddress.toLowerCase().includes(' ny')) {
      if (!enhancedAddress.match(/,\s*[A-Z]{2}\s*\d{5}/)) {
        enhancedAddress += ', NY';
      }
    }
    
    if (!enhancedAddress.toLowerCase().includes('united states') && !enhancedAddress.toLowerCase().includes('usa')) {
      enhancedAddress += ', United States';
    }

    const encodedAddress = encodeURIComponent(enhancedAddress);
    
    const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodedAddress}.json?` +
      `access_token=${process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN}&` +
      `limit=3&` +
      `country=us&` +
      `proximity=-75.2321,43.1009&` +
      `types=address,poi&` +
      `language=en`;
    
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`Geocoding failed: ${response.statusText}`);
    }

    const data = await response.json();

    if (data.features && data.features.length > 0) {
      const centralNYResults = data.features.filter(feature => {
        const [lng, lat] = feature.center;
        return lat >= 42.5 && lat <= 44.0 && lng >= -76.0 && lng <= -74.5;
      });

      if (centralNYResults.length > 0) {
        const feature = centralNYResults[0];
        const [longitude, latitude] = feature.center;
        const confidence = feature.relevance;
        
        if (confidence > 0.7) { // Higher confidence threshold
          return {
            latitude,
            longitude,
            place_name: feature.place_name,
            confidence
          };
        }
      }
    }

    return null;
  } catch (error) {
    console.error('Error geocoding address:', error.message);
    return null;
  }
}

// Function to estimate distance between two coordinates (rough approximation)
function getDistance(lat1, lng1, lat2, lng2) {
  const R = 6371; // Earth's radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLng/2) * Math.sin(dLng/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c; // Distance in km
}

async function fixAllGeocodingIssues() {
  console.log('🔍 Finding all businesses with potential geocoding issues...\n');

  const { data: businesses, error } = await supabase
    .from('businesses')
    .select('id, name, address, latitude, longitude')
    .neq('latitude', 0)
    .neq('longitude', 0)
    .not('address', 'like', '%[INVALID]%');
  
  if (error) {
    console.error('Error fetching businesses:', error);
    return;
  }

  console.log(`Found ${businesses.length} businesses to check\n`);

  let checked = 0;
  let updated = 0;
  let failed = 0;
  let skipped = 0;

  // Check businesses in batches to avoid rate limiting
  for (let i = 0; i < businesses.length; i++) {
    const business = businesses[i];
    
    // Skip businesses with poor addresses
    if (!business.address || 
        business.address.length < 10 || 
        business.address === 'Utica, NY' ||
        business.address === 'NY') {
      skipped++;
      continue;
    }

    console.log(`\n${checked + 1}/${businesses.length - skipped} 🔄 Checking: ${business.name}`);
    console.log(`  Address: ${business.address}`);
    console.log(`  Current: (${business.latitude}, ${business.longitude})`);

    const correctCoords = await geocodeAddress(business.address);
    
    if (correctCoords) {
      const distance = getDistance(
        business.latitude, business.longitude,
        correctCoords.latitude, correctCoords.longitude
      );

      console.log(`  Geocoded: (${correctCoords.latitude}, ${correctCoords.longitude})`);
      console.log(`  Distance: ${distance.toFixed(2)} km`);
      console.log(`  Confidence: ${correctCoords.confidence}`);

      // If the new coordinates are significantly different (more than 0.5km away)
      if (distance > 0.5) {
        console.log(`  ⚠️  SIGNIFICANT DIFFERENCE - Updating coordinates`);
        
        const { error: updateError } = await supabase
          .from('businesses')
          .update({
            latitude: correctCoords.latitude,
            longitude: correctCoords.longitude
          })
          .eq('id', business.id);

        if (updateError) {
          console.log(`  ❌ Failed to update: ${updateError.message}`);
          failed++;
        } else {
          console.log(`  ✅ Updated successfully`);
          updated++;
        }
      } else {
        console.log(`  ✓ Coordinates look correct (within 0.5km)`);
      }
    } else {
      console.log(`  ❌ Failed to geocode`);
      failed++;
    }

    checked++;

    // Rate limiting - pause between requests
    await new Promise(resolve => setTimeout(resolve, 600));

    // Progress update every 10 businesses
    if (checked % 10 === 0) {
      console.log(`\n📊 Progress: ${checked}/${businesses.length - skipped} checked, ${updated} updated, ${failed} failed\n`);
    }
  }

  console.log('\n🎉 Geocoding fix completed!');
  console.log(`📊 Final Results:`);
  console.log(`  - Businesses checked: ${checked}`);
  console.log(`  - Coordinates updated: ${updated}`);
  console.log(`  - Failed geocoding: ${failed}`);
  console.log(`  - Skipped (poor addresses): ${skipped}`);
}

fixAllGeocodingIssues();