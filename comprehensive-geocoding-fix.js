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
      if (!enhancedAddress.match(/,\s*[A-Z]{2}\s*\d{5}/)) {
        enhancedAddress += ', NY';
      }
    }
    
    // Add "United States" for better disambiguation
    if (!enhancedAddress.toLowerCase().includes('united states') && !enhancedAddress.toLowerCase().includes('usa')) {
      enhancedAddress += ', United States';
    }

    const encodedAddress = encodeURIComponent(enhancedAddress);
    
    const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodedAddress}.json?` +
      `access_token=${process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN}&` +
      `limit=3&` + // Get more options
      `country=us&` +
      `proximity=-75.2321,43.1009&` + // Bias towards Utica, NY area
      `types=address,poi&` + // Prefer specific addresses and points of interest
      `language=en`;
    
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`Geocoding failed: ${response.statusText}`);
    }

    const data = await response.json();
    console.log(`    Geocoding \"${address}\" -> Enhanced: \"${enhancedAddress}\"`);

    if (data.features && data.features.length > 0) {
      // Filter results to Central NY area
      const centralNYResults = data.features.filter(feature => {
        const [lng, lat] = feature.center;
        return lat >= 42.5 && lat <= 44.0 && lng >= -76.0 && lng <= -74.5;
      });

      if (centralNYResults.length > 0) {
        const feature = centralNYResults[0]; // Use best Central NY result
        const [longitude, latitude] = feature.center;
        const confidence = feature.relevance;
        
        console.log(`    -> ${feature.place_name} (confidence: ${confidence})`);
        
        if (confidence > 0.6) {
          return {
            latitude,
            longitude,
            place_name: feature.place_name
          };
        } else {
          console.warn(`    -> Low confidence result: ${confidence}`);
          return null;
        }
      } else {
        console.warn(`    -> No results in Central NY area`);
        return null;
      }
    }

    console.warn(`    -> No geocoding results found`);
    return null;
  } catch (error) {
    console.error('    -> Error geocoding address:', error.message);
    return null;
  }
}

async function comprehensiveGeocodingFix() {
  console.log('🔍 Comprehensive geocoding fix starting...\n');

  const { data: businesses, error } = await supabase
    .from('businesses')
    .select('id, name, address, latitude, longitude');
  
  if (error) {
    console.error('Error fetching businesses:', error);
    return;
  }

  console.log(`Found ${businesses.length} total businesses\n`);

  let updated = 0;
  let failed = 0;
  let skipped = 0;

  // 1. Fix businesses with coordinates outside Central NY
  console.log('🌍 Step 1: Fixing businesses outside Central NY bounds...');
  const outsideBounds = businesses.filter(b => 
    b.latitude < 42.5 || b.latitude > 44.0 || b.longitude < -76.0 || b.longitude > -74.5
  );
  
  for (const business of outsideBounds) {
    if (!business.address || business.address.trim() === '') {
      console.log(`  ⏭️  Skipping ${business.name} - no address`);
      skipped++;
      continue;
    }

    console.log(`  🔄 ${business.name}: ${business.address}`);
    console.log(`    Current: (${business.latitude}, ${business.longitude})`);
    
    const result = await geocodeAddress(business.address);

    if (result) {
      const { error: updateError } = await supabase
        .from('businesses')
        .update({
          latitude: result.latitude,
          longitude: result.longitude
        })
        .eq('id', business.id);

      if (updateError) {
        console.error(`    ❌ Failed to update: ${updateError}`);
        failed++;
      } else {
        console.log(`    ✅ Updated to: (${result.latitude}, ${result.longitude})`);
        updated++;
      }
    } else {
      console.log(`    ❌ Failed to geocode`);
      failed++;
    }

    await new Promise(resolve => setTimeout(resolve, 500));
  }

  // 2. Fix businesses with default coordinates
  console.log('\n📍 Step 2: Fixing businesses with default coordinates...');
  const defaultCoords = businesses.filter(b => 
    Math.abs(b.latitude - 43.1009) < 0.001 && Math.abs(b.longitude - (-75.2321)) < 0.001
  );
  
  for (const business of defaultCoords) {
    if (!business.address || business.address.trim() === '') {
      console.log(`  ⏭️  Skipping ${business.name} - no address`);
      skipped++;
      continue;
    }

    console.log(`  🔄 ${business.name}: ${business.address}`);
    
    const result = await geocodeAddress(business.address);

    if (result) {
      const { error: updateError } = await supabase
        .from('businesses')
        .update({
          latitude: result.latitude,
          longitude: result.longitude
        })
        .eq('id', business.id);

      if (updateError) {
        console.error(`    ❌ Failed to update: ${updateError}`);
        failed++;
      } else {
        console.log(`    ✅ Updated to: (${result.latitude}, ${result.longitude})`);
        updated++;
      }
    } else {
      console.log(`    ❌ Failed to geocode`);
      failed++;
    }

    await new Promise(resolve => setTimeout(resolve, 500));
  }

  // 3. Fix remaining clusters of duplicate coordinates
  console.log('\n🔄 Step 3: Fixing remaining coordinate clusters...');
  
  // Refresh data after previous updates
  const { data: refreshedBusinesses } = await supabase
    .from('businesses')
    .select('id, name, address, latitude, longitude');

  const coordGroups = {};
  refreshedBusinesses.forEach(b => {
    const key = `${Math.round(b.latitude * 1000) / 1000},${Math.round(b.longitude * 1000) / 1000}`;
    if (!coordGroups[key]) coordGroups[key] = [];
    coordGroups[key].push(b);
  });

  const duplicateGroups = Object.values(coordGroups).filter(group => group.length > 1);
  
  for (const group of duplicateGroups) {
    console.log(`  📍 Cluster at ${group[0].latitude}, ${group[0].longitude} (${group.length} businesses):`);
    
    for (const business of group) {
      if (!business.address || business.address.trim() === '' || business.address === 'Utica, NY') {
        console.log(`    ⏭️  Skipping ${business.name} - poor address: "${business.address}"`);
        skipped++;
        continue;
      }

      console.log(`    🔄 ${business.name}: ${business.address}`);
      
      const result = await geocodeAddress(business.address);

      if (result && 
          (Math.abs(result.latitude - business.latitude) > 0.001 || 
           Math.abs(result.longitude - business.longitude) > 0.001)) {
        
        const { error: updateError } = await supabase
          .from('businesses')
          .update({
            latitude: result.latitude,
            longitude: result.longitude
          })
          .eq('id', business.id);

        if (updateError) {
          console.error(`      ❌ Failed to update: ${updateError}`);
          failed++;
        } else {
          console.log(`      ✅ Updated to: (${result.latitude}, ${result.longitude})`);
          updated++;
        }
      } else if (result) {
        console.log(`      ⚠️  Same coordinates returned - keeping original`);
        skipped++;
      } else {
        console.log(`      ❌ Failed to geocode`);
        failed++;
      }

      await new Promise(resolve => setTimeout(resolve, 500));
    }
    console.log('');
  }

  console.log('🎉 Comprehensive geocoding fix completed!');
  console.log(`📊 Results:`);
  console.log(`  - Updated: ${updated}`);
  console.log(`  - Skipped: ${skipped}`);
  console.log(`  - Failed: ${failed}`);
}

comprehensiveGeocodingFix();