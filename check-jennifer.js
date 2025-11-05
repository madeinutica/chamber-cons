require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function checkJenniferBusiness() {
  console.log('🔍 Checking Jennifer DePasquale business...\n');
  
  const { data, error } = await supabase
    .from('businesses')
    .select('*')
    .ilike('name', '%Jennifer DePasquale%');
  
  if (error) {
    console.error('Error:', error);
    return;
  }
  
  if (data.length === 0) {
    console.log('No businesses found with name containing "Jennifer DePasquale"');
    
    // Try broader search
    const { data: allData } = await supabase
      .from('businesses')
      .select('name, address, latitude, longitude')
      .ilike('address', '%131 Genesee%');
    
    console.log('\nBusinesses at 131 Genesee Street:');
    allData?.forEach(b => {
      console.log(`- ${b.name}: ${b.address} (${b.latitude}, ${b.longitude})`);
    });
    
    return;
  }
  
  console.log(`Found ${data.length} business(es):`);
  data.forEach((b, i) => {
    console.log(`\nBusiness ${i + 1}:`);
    console.log(`  Name: ${b.name}`);
    console.log(`  Address: ${b.address}`);
    console.log(`  Category: ${b.category}`);
    console.log(`  Coordinates: (${b.latitude}, ${b.longitude})`);
    console.log(`  Description: ${b.description?.substring(0, 100)}...`);
  });
}

checkJenniferBusiness();