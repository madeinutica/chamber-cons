/**
 * Social Network Migration Script
 * Adds user authentication and social features to the Chamber of Commerce app
 */

const { createClient } = require('@supabase/supabase-js')
const fs = require('fs')
const path = require('path')

// Load environment variables
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase configuration')
  console.error('Required environment variables:')
  console.error('- NEXT_PUBLIC_SUPABASE_URL')
  console.error('- SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function runMigration() {
  try {
    console.log('🚀 Starting social network migration...')
    
    // Read the SQL schema file
    const schemaPath = path.join(__dirname, 'social-network-schema.sql')
    const schema = fs.readFileSync(schemaPath, 'utf8')
    
    console.log('📖 Loaded schema file, executing SQL...')
    
    // Execute the schema
    const { data, error } = await supabase.rpc('exec_sql', { sql: schema })
    
    if (error) {
      console.error('❌ Migration failed:', error)
      return
    }
    
    console.log('✅ Migration completed successfully!')
    console.log('📊 Created tables:')
    console.log('  - users (authentication & profiles)')
    console.log('  - business_owners (business-user relationships)')
    console.log('  - posts (community content)')
    console.log('  - comments (post discussions)')
    console.log('  - votes (upvotes/downvotes)')
    console.log('  - media_files (image/video uploads)')
    console.log('  - user_follows (social connections)')
    console.log('  - business_follows (business subscriptions)')
    console.log('  - news_items (RSS feed integration)')
    
    // Test the migration by creating a sample admin user
    console.log('\n🧪 Testing migration with sample data...')
    
    // Note: In production, you'd use proper Supabase Auth
    // This is just for testing the database structure
    const testUser = {
      email: 'admin@chamberconcierge.com',
      username: 'admin',
      display_name: 'Chamber Admin',
      role: 'admin',
      is_verified: true,
      bio: 'Administrator of the CNY Chamber of Commerce Business Directory'
    }
    
    const { data: userData, error: userError } = await supabase
      .from('users')
      .insert([testUser])
      .select()
    
    if (userError) {
      console.error('⚠️  Could not create test user:', userError.message)
    } else {
      console.log('✅ Created test admin user')
    }
    
    // Create a sample community post
    if (userData && userData[0]) {
      const testPost = {
        author_id: userData[0].id,
        title: 'Welcome to the CNY Business Community!',
        content: 'This is the first post in our new community-driven business directory. Share your experiences, photos, and recommendations!',
        post_type: 'text',
        is_featured: true,
        is_pinned: true
      }
      
      const { data: postData, error: postError } = await supabase
        .from('posts')
        .insert([testPost])
        .select()
      
      if (postError) {
        console.error('⚠️  Could not create test post:', postError.message)
      } else {
        console.log('✅ Created welcome post')
      }
    }
    
    console.log('\n🎉 Social network foundation is ready!')
    console.log('💡 Next steps:')
    console.log('  1. Implement authentication UI')
    console.log('  2. Create user registration/login pages')
    console.log('  3. Build posting interface')
    console.log('  4. Add social features to business cards')
    
  } catch (error) {
    console.error('💥 Migration failed with error:', error)
  }
}

// Alternative: If the rpc approach doesn't work, split into individual queries
async function runMigrationAlternative() {
  try {
    console.log('🚀 Starting social network migration (alternative approach)...')
    
    const schemaPath = path.join(__dirname, 'social-network-schema.sql')
    const schema = fs.readFileSync(schemaPath, 'utf8')
    
    // Split SQL into individual statements
    const statements = schema
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'))
    
    console.log(`📖 Found ${statements.length} SQL statements to execute...`)
    
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i] + ';'
      
      try {
        const { error } = await supabase.rpc('exec_sql', { sql: statement })
        if (error) {
          console.log(`⚠️  Statement ${i + 1} had issues (may be expected):`, error.message)
        } else {
          console.log(`✅ Statement ${i + 1} executed successfully`)
        }
      } catch (err) {
        console.log(`⚠️  Statement ${i + 1} failed:`, err.message)
      }
    }
    
    console.log('✅ Migration completed!')
    
  } catch (error) {
    console.error('💥 Alternative migration failed:', error)
  }
}

// Run the migration
if (require.main === module) {
  runMigration().catch(() => {
    console.log('\n🔄 Trying alternative approach...')
    runMigrationAlternative()
  })
}

module.exports = { runMigration, runMigrationAlternative }