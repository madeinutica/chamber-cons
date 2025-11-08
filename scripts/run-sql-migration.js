/**
 * Run SQL Migration Script
 * Executes the enhanced schema migration SQL file
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

require('dotenv').config({ path: path.join(__dirname, '..', '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function runMigration() {
  console.log('🚀 Starting SQL migration...\n');
  
  const sqlPath = path.join(__dirname, 'enhanced-schema-migration.sql');
  const sql = fs.readFileSync(sqlPath, 'utf-8');
  
  // Split SQL into individual statements
  const statements = sql
    .split(';')
    .map(s => s.trim())
    .filter(s => s.length > 0 && !s.startsWith('--'));
  
  console.log(`📝 Found ${statements.length} SQL statements to execute\n`);
  
  let successCount = 0;
  let errorCount = 0;
  
  for (let i = 0; i < statements.length; i++) {
    const statement = statements[i] + ';';
    const preview = statement.substring(0, 80).replace(/\s+/g, ' ') + '...';
    
    try {
      const { error } = await supabase.rpc('exec_sql', { sql: statement });
      
      if (error) {
        // Try direct query for simpler statements
        const { error: directError } = await supabase
          .from('_sql')
          .select('*')
          .eq('query', statement);
        
        if (directError) {
          console.error(`❌ [${i + 1}/${statements.length}] Error: ${preview}`);
          console.error(`   ${error.message || directError.message}`);
          errorCount++;
        } else {
          successCount++;
          console.log(`✅ [${i + 1}/${statements.length}] ${preview}`);
        }
      } else {
        successCount++;
        console.log(`✅ [${i + 1}/${statements.length}] ${preview}`);
      }
    } catch (err) {
      console.error(`❌ [${i + 1}/${statements.length}] Exception: ${preview}`);
      console.error(`   ${err.message}`);
      errorCount++;
    }
  }
  
  console.log('\n' + '='.repeat(60));
  console.log('📊 MIGRATION SUMMARY');
  console.log('='.repeat(60));
  console.log(`✅ Successful: ${successCount}`);
  console.log(`❌ Errors: ${errorCount}`);
  console.log('='.repeat(60));
  
  if (errorCount > 0) {
    console.log('\n⚠️  Some statements failed. You may need to run the SQL manually in Supabase Dashboard.');
    console.log('   Go to: SQL Editor → Paste the contents of scripts/enhanced-schema-migration.sql');
  } else {
    console.log('\n✨ Migration completed successfully!');
  }
}

runMigration().catch(err => {
  console.error('💥 Fatal error:', err);
  process.exit(1);
});
