require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase configuration');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkDatabase() {
  console.log('🔍 Checking database tables...\n');
  
  const tables = ['users', 'posts', 'comments', 'votes', 'media_files', 'business_owners', 'businesses'];
  
  for (const table of tables) {
    try {
      const { data, error } = await supabase
        .from(table)
        .select('*')
        .limit(1);
        
      if (error) {
        if (error.code === 'PGRST106') {
          console.log(`❌ ${table}: Table does not exist`);
        } else {
          console.log(`⚠️  ${table}: ${error.message}`);
        }
      } else {
        console.log(`✅ ${table}: Table exists (${data?.length || 0} sample records)`);
      }
    } catch (err) {
      console.log(`💥 ${table}: Error - ${err.message}`);
    }
  }
  
  console.log('\n💡 Summary:');
  console.log('- If tables are missing, you need to create them manually in Supabase SQL Editor');
  console.log('- Copy the SQL from scripts/create-social-tables.sql');
  console.log('- Run it in your Supabase project dashboard');
}

checkDatabase();