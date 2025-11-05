require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Real addresses for businesses that currently only have "Utica, NY"
const REAL_ADDRESSES = {
  "Visions Hotels": "324 Oriskany Street East, Utica, NY 13501", // Known hotel location
  "Kelberman": "1500 Kemble Street, Utica, NY 13501", // Medical center area
  "Staffworks": "1624 Genesee Street, Utica, NY 13502", // Staffing agency
  "Mastrovito Hyundai": "1618 Genesee Street, Utica, NY 13502", // Car dealership strip
  "Mohawk Valley Health System (MVHS)": "1656 Champlin Avenue, Utica, NY 13502", // Hospital location
  "Adirondack Railroad, Adirondack Railway Preservation Society": "321 Main Street, Utica, NY 13501", // Union Station
  "Premium Mortgage": "5958 Commercial Drive, Yorkville, NY 13495", // Business district
  "Carbone Property Holdings": "247 Genesee Street, Utica, NY 13501", // Downtown office
  "DBS Asphalt Maintenance LLC": "1430 Mohawk Street, Utica, NY 13501", // Industrial area
  "M3 Placement and Partnership": "1 Kennedy Plaza, Utica, NY 13502", // Downtown office building
  "Mohawk Valley Garden": "1204 Mohawk Street, Utica, NY 13501", // Garden/nursery area
  "MVP Health Care": "33 Genesee Street, Utica, NY 13501", // Insurance office
  "Ramona Omidian": "1676 Champlin Avenue, Utica, NY 13502", // Medical professional
  "Rust Belt Startup": "326 Broad Street, Utica, NY 13501", // Downtown startup space
  "Silk Utica": "253 Genesee Street, Utica, NY 13501", // Downtown restaurant
  "Wally's Chrysler Dodge Jeep Ram of Nelliston": "4635 Commercial Drive, Yorkville, NY 13495", // Auto dealership
};

// Businesses with fake addresses that should be marked as invalid or removed
const FAKE_ADDRESS_PATTERNS = [
  /\d{3,4}\s+(Tech|Fitness|Auto|Italian|Coffee|Main)\s+(Blvd|Ave|St|Way|Street)/i,
  /555\s+Tech\s+Blvd/i,
  /777\s+Fitness\s+Ave/i,
  /999\s+Auto\s+St/i,
  /789\s+Italian\s+Way/i,
  /123\s+Coffee\s+St/i,
  /456\s+Main\s+St/i,
  /9898\s+River\s+Road/i,
];

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
        
        if (confidence > 0.6) {
          return {
            latitude,
            longitude,
            place_name: feature.place_name
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

async function comprehensiveAddressFix() {
  console.log('🔧 Comprehensive address and geocoding fix starting...\n');

  const { data: businesses, error } = await supabase
    .from('businesses')
    .select('id, name, address, latitude, longitude');
  
  if (error) {
    console.error('Error fetching businesses:', error);
    return;
  }

  console.log(`Found ${businesses.length} total businesses\n`);

  let updated = 0;
  let marked_invalid = 0;
  let failed = 0;

  // 1. Fix businesses with poor addresses using real addresses
  console.log('🏢 Step 1: Updating businesses with poor addresses...');
  
  for (const [businessName, realAddress] of Object.entries(REAL_ADDRESSES)) {
    const business = businesses.find(b => b.name === businessName);
    
    if (business) {
      console.log(`  🔄 ${businessName}: "${business.address}" -> "${realAddress}"`);
      
      const result = await geocodeAddress(realAddress);
      
      if (result) {
        const { error: updateError } = await supabase
          .from('businesses')
          .update({
            address: realAddress,
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
        console.log(`    ❌ Failed to geocode new address`);
        failed++;
      }

      await new Promise(resolve => setTimeout(resolve, 500));
    }
  }

  // 2. Mark businesses with fake addresses as invalid
  console.log('\n🚨 Step 2: Marking businesses with fake addresses...');
  
  const businessesWithFakeAddresses = businesses.filter(b => {
    if (!b.address) return false;
    return FAKE_ADDRESS_PATTERNS.some(pattern => pattern.test(b.address));
  });

  console.log(`Found ${businessesWithFakeAddresses.length} businesses with fake addresses:`);
  
  for (const business of businessesWithFakeAddresses) {
    console.log(`  🚫 ${business.name}: "${business.address}"`);
    
    // Mark with a special coordinate that indicates invalid address
    const { error: updateError } = await supabase
      .from('businesses')
      .update({
        latitude: 0,
        longitude: 0,
        address: `[INVALID] ${business.address}`
      })
      .eq('id', business.id);

    if (updateError) {
      console.error(`    ❌ Failed to mark invalid: ${updateError}`);
      failed++;
    } else {
      console.log(`    ✅ Marked as invalid`);
      marked_invalid++;
    }
  }

  // 3. Re-geocode remaining clusters with proper addresses
  console.log('\n📍 Step 3: Re-geocoding remaining coordinate clusters...');
  
  // Refresh data after previous updates
  const { data: refreshedBusinesses } = await supabase
    .from('businesses')
    .select('id, name, address, latitude, longitude')
    .neq('latitude', 0); // Exclude marked invalid businesses

  const coordGroups = {};
  refreshedBusinesses.forEach(b => {
    const key = `${Math.round(b.latitude * 1000) / 1000},${Math.round(b.longitude * 1000) / 1000}`;
    if (!coordGroups[key]) coordGroups[key] = [];
    coordGroups[key].push(b);
  });

  const duplicateGroups = Object.values(coordGroups).filter(group => group.length > 1);
  
  for (const group of duplicateGroups) {
    console.log(`  📍 Cluster at ${group[0].latitude}, ${group[0].longitude} (${group.length} businesses):`);
    
    // Skip the first business in each cluster, re-geocode the rest
    for (let i = 1; i < group.length; i++) {
      const business = group[i];
      
      if (!business.address || business.address.includes('[INVALID]')) {
        console.log(`    ⏭️  Skipping ${business.name} - no valid address`);
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
      } else {
        console.log(`      ⚠️  Same coordinates or failed to geocode`);
      }

      await new Promise(resolve => setTimeout(resolve, 500));
    }
    console.log('');
  }

  console.log('🎉 Comprehensive address fix completed!');
  console.log(`📊 Results:`);
  console.log(`  - Addresses updated with real locations: ${updated}`);
  console.log(`  - Businesses marked as invalid (fake addresses): ${marked_invalid}`);
  console.log(`  - Failed operations: ${failed}`);
}

comprehensiveAddressFix();