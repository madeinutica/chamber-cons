require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function investigateRemainingIssues() {
  console.log('🔍 Investigating remaining geocoding issues...\n');

  const { data: businesses, error } = await supabase
    .from('businesses')
    .select('id, name, address, latitude, longitude, category');
  
  if (error) {
    console.error('Error fetching businesses:', error);
    return;
  }

  console.log(`📊 Total businesses: ${businesses.length}\n`);

  // 1. Businesses with poor addresses that need research
  console.log('🏢 BUSINESSES WITH POOR ADDRESSES (need real addresses):');
  const poorAddresses = businesses.filter(b => 
    !b.address || 
    b.address.trim() === '' || 
    b.address === 'Utica, NY' || 
    b.address === 'NY' ||
    b.address.length < 10
  );
  
  poorAddresses.forEach((b, i) => {
    console.log(`${i + 1}. ${b.name}`);
    console.log(`   Address: "${b.address}"`);
    console.log(`   Category: ${b.category}`);
    console.log(`   Current coords: (${b.latitude}, ${b.longitude})`);
    console.log('');
  });

  // 2. Check the remaining clusters in detail
  console.log('\n📍 REMAINING COORDINATE CLUSTERS:');
  const coordGroups = {};
  businesses.forEach(b => {
    const key = `${Math.round(b.latitude * 1000) / 1000},${Math.round(b.longitude * 1000) / 1000}`;
    if (!coordGroups[key]) coordGroups[key] = [];
    coordGroups[key].push(b);
  });

  const duplicateGroups = Object.values(coordGroups).filter(group => group.length > 1);
  
  duplicateGroups.forEach((group, i) => {
    console.log(`\nCluster ${i + 1}: ${group[0].latitude}, ${group[0].longitude}`);
    group.forEach(b => {
      console.log(`  - ${b.name}: "${b.address}" [${b.category}]`);
    });
  });

  // 3. Check businesses that might be in wrong locations (suspicious patterns)
  console.log('\n🚨 POTENTIALLY SUSPICIOUS LOCATIONS:');
  
  // Check for businesses that might be at city center instead of actual location
  const cityCenter = { lat: 43.1009, lng: -75.2321 }; // Utica center
  const nearCityCenter = businesses.filter(b => {
    const distance = Math.sqrt(
      Math.pow(b.latitude - cityCenter.lat, 2) + 
      Math.pow(b.longitude - cityCenter.lng, 2)
    );
    return distance < 0.02 && b.address !== 'Utica, NY'; // Within ~2km but has specific address
  });

  console.log(`Businesses very close to city center (${nearCityCenter.length}):`);
  nearCityCenter.forEach(b => {
    console.log(`  - ${b.name}: "${b.address}" at (${b.latitude}, ${b.longitude})`);
  });

  console.log('\n📋 SUMMARY:');
  console.log(`- Businesses with poor addresses: ${poorAddresses.length}`);
  console.log(`- Coordinate clusters: ${duplicateGroups.length}`);
  console.log(`- Near city center: ${nearCityCenter.length}`);
}

investigateRemainingIssues();