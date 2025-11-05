require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function analyzeGeocodingQuality() {
  console.log('🔍 Final geocoding quality analysis...\n');

  const { data: businesses, error } = await supabase
    .from('businesses')
    .select('id, name, address, latitude, longitude');
  
  if (error) {
    console.error('Error fetching businesses:', error);
    return;
  }

  console.log(`📊 Total businesses: ${businesses.length}\n`);

  // Check for businesses still using default coordinates
  const defaultCoords = businesses.filter(b => 
    Math.abs(b.latitude - 43.1009) < 0.001 && Math.abs(b.longitude - (-75.2321)) < 0.001
  );
  console.log(`📍 Businesses with default coordinates: ${defaultCoords.length}`);
  defaultCoords.forEach(b => console.log(`  - ${b.name}: ${b.address}`));

  // Check for businesses outside Central NY bounds
  const outsideBounds = businesses.filter(b => 
    b.latitude < 42.5 || b.latitude > 44.0 || b.longitude < -76.0 || b.longitude > -74.5
  );
  console.log(`\n🌍 Businesses outside Central NY bounds: ${outsideBounds.length}`);
  outsideBounds.forEach(b => 
    console.log(`  - ${b.name}: (${b.latitude}, ${b.longitude}) - ${b.address}`)
  );

  // Check for coordinate clusters (duplicates)
  const coordGroups = {};
  businesses.forEach(b => {
    const key = `${Math.round(b.latitude * 1000) / 1000},${Math.round(b.longitude * 1000) / 1000}`;
    if (!coordGroups[key]) coordGroups[key] = [];
    coordGroups[key].push(b);
  });

  const duplicateGroups = Object.values(coordGroups).filter(group => group.length > 1);
  console.log(`\n🔄 Remaining coordinate clusters: ${duplicateGroups.length}`);
  duplicateGroups.forEach(group => {
    console.log(`  📍 ${group[0].latitude}, ${group[0].longitude} (${group.length} businesses):`);
    group.forEach(b => console.log(`    - ${b.name}`));
  });

  // Check for poor addresses
  const poorAddresses = businesses.filter(b => 
    !b.address || 
    b.address.trim() === '' || 
    b.address === 'Utica, NY' || 
    b.address.length < 10
  );
  console.log(`\n⚠️  Businesses with poor/missing addresses: ${poorAddresses.length}`);
  poorAddresses.forEach(b => console.log(`  - ${b.name}: "${b.address}"`));

  console.log(`\n✅ Analysis complete!`);
  console.log(`📈 Quality improvements:`);
  console.log(`  - Businesses with unique coordinates: ${businesses.length - duplicateGroups.reduce((sum, group) => sum + group.length, 0) + duplicateGroups.length}`);
  console.log(`  - Businesses properly geocoded: ${businesses.length - defaultCoords.length - outsideBounds.length}`);
}

analyzeGeocodingQuality();