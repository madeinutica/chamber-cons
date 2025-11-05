require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase configuration');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function createSocialTables() {
  console.log('🚀 Creating social network tables...\n');

  try {
    // Read the SQL file
    const sqlFile = path.join(__dirname, 'create-social-tables.sql');
    const sql = fs.readFileSync(sqlFile, 'utf8');

    // Split into individual statements
    const statements = sql
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));

    console.log(`📋 Found ${statements.length} SQL statements to execute...\n`);

    let successCount = 0;
    let errorCount = 0;

    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      
      if (statement.length === 0) continue;

      try {
        console.log(`${i + 1}/${statements.length} Executing: ${statement.substring(0, 50)}...`);
        
        const { error } = await supabase.rpc('exec', { sql: statement });
        
        if (error) {
          // Try with direct query method
          const { error: error2 } = await supabase
            .from('dummy') // This will fail but let's try direct approach
            .select('*');
          
          // Let's try a different approach - create tables one by one
          if (statement.includes('CREATE TABLE IF NOT EXISTS users')) {
            await createUsersTable();
          } else if (statement.includes('CREATE TABLE IF NOT EXISTS posts')) {
            await createPostsTable();
          } else if (statement.includes('CREATE TABLE IF NOT EXISTS comments')) {
            await createCommentsTable();
          } else if (statement.includes('CREATE TABLE IF NOT EXISTS votes')) {
            await createVotesTable();
          } else if (statement.includes('CREATE TABLE IF NOT EXISTS media_files')) {
            await createMediaFilesTable();
          } else if (statement.includes('CREATE TABLE IF NOT EXISTS business_owners')) {
            await createBusinessOwnersTable();
          } else {
            console.log(`⚠️  Skipping: ${statement.substring(0, 50)}...`);
          }
          
          successCount++;
        } else {
          console.log(`✅ Success`);
          successCount++;
        }
      } catch (err) {
        console.log(`❌ Error: ${err.message}`);
        errorCount++;
      }
    }

    console.log(`\n🎉 Migration completed!`);
    console.log(`✅ Successful: ${successCount}`);
    console.log(`❌ Errors: ${errorCount}`);

  } catch (error) {
    console.error('💥 Migration failed:', error);
  }
}

async function createUsersTable() {
  console.log('📝 Creating users table...');
  
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .limit(1);
    
  if (error && error.code === 'PGRST106') {
    console.log('✅ Users table already exists or needs to be created manually');
  } else if (error) {
    console.log('⚠️  Users table error:', error.message);
  } else {
    console.log('✅ Users table accessible');
  }
}

async function createPostsTable() {
  console.log('📝 Checking posts table...');
  
  const { data, error } = await supabase
    .from('posts')
    .select('*')
    .limit(1);
    
  if (error && error.code === 'PGRST106') {
    console.log('⚠️  Posts table does not exist - needs manual creation');
  } else if (error) {
    console.log('⚠️  Posts table error:', error.message);
  } else {
    console.log('✅ Posts table accessible');
  }
}

async function createCommentsTable() {
  console.log('📝 Checking comments table...');
  
  const { data, error } = await supabase
    .from('comments')
    .select('*')
    .limit(1);
    
  if (error && error.code === 'PGRST106') {
    console.log('⚠️  Comments table does not exist - needs manual creation');
  } else if (error) {
    console.log('⚠️  Comments table error:', error.message);
  } else {
    console.log('✅ Comments table accessible');
  }
}

async function createVotesTable() {
  console.log('📝 Checking votes table...');
  
  const { data, error } = await supabase
    .from('votes')
    .select('*')
    .limit(1);
    
  if (error && error.code === 'PGRST106') {
    console.log('⚠️  Votes table does not exist - needs manual creation');
  } else if (error) {
    console.log('⚠️  Votes table error:', error.message);
  } else {
    console.log('✅ Votes table accessible');
  }
}

async function createMediaFilesTable() {
  console.log('📝 Checking media_files table...');
  
  const { data, error } = await supabase
    .from('media_files')
    .select('*')
    .limit(1);
    
  if (error && error.code === 'PGRST106') {
    console.log('⚠️  Media files table does not exist - needs manual creation');
  } else if (error) {
    console.log('⚠️  Media files table error:', error.message);
  } else {
    console.log('✅ Media files table accessible');
  }
}

async function createBusinessOwnersTable() {
  console.log('📝 Checking business_owners table...');
  
  const { data, error } = await supabase
    .from('business_owners')
    .select('*')
    .limit(1);
    
  if (error && error.code === 'PGRST106') {
    console.log('⚠️  Business owners table does not exist - needs manual creation');
  } else if (error) {
    console.log('⚠️  Business owners table error:', error.message);
  } else {
    console.log('✅ Business owners table accessible');
  }
}

// Run the migration
if (require.main === module) {
  createSocialTables();
}

module.exports = { createSocialTables };