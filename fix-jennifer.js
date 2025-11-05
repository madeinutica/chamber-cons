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
        
        if (confidence > 0.6) {
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

async function fixJenniferDePasquale() {
  console.log('🔧 Fixing Jennifer DePasquale geocoding...\n');
  
  const address = "131 Genesee Street, Utica, NY 13503";
  console.log(`Geocoding: "${address}"`);
  
  const result = await geocodeAddress(address);
  
  if (result) {
    console.log(`✅ Geocoded successfully:`);
    console.log(`  Location: ${result.place_name}`);
    console.log(`  Coordinates: (${result.latitude}, ${result.longitude})`);
    console.log(`  Confidence: ${result.confidence}`);
    
    // Update the business
    const { error } = await supabase
      .from('businesses')
      .update({
        latitude: result.latitude,
        longitude: result.longitude
      })
      .eq('name', 'Jennifer DePasquale');
    
    if (error) {
      console.error('❌ Failed to update:', error);
    } else {
      console.log('✅ Successfully updated Jennifer DePasquale coordinates!');
    }
  } else {
    console.log('❌ Failed to geocode address');
  }
}

fixJenniferDePasquale();