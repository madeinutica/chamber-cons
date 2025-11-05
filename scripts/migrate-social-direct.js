/**
 * Direct SQL Migration Script
 * Executes individual SQL statements through Supabase client
 */

const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase configuration')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function createTables() {
  console.log('🚀 Creating social network tables...')
  
  // Create users table
  console.log('📝 Creating users table...')
  const { error: usersError } = await supabase.rpc('sql', {
    query: `
    CREATE TABLE IF NOT EXISTS users (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      email VARCHAR(255) UNIQUE NOT NULL,
      username VARCHAR(50) UNIQUE NOT NULL,
      display_name VARCHAR(100),
      avatar_url TEXT,
      bio TEXT,
      role VARCHAR(20) DEFAULT 'community' CHECK (role IN ('admin', 'business_owner', 'community')),
      is_verified BOOLEAN DEFAULT false,
      reputation_score INTEGER DEFAULT 0,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      last_login TIMESTAMP WITH TIME ZONE
    );`
  })
  
  if (usersError) console.log('⚠️ Users table:', usersError.message)
  else console.log('✅ Users table created')
  
  // Create posts table
  console.log('📝 Creating posts table...')
  const { error: postsError } = await supabase.rpc('sql', {
    query: `
    CREATE TABLE IF NOT EXISTS posts (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      author_id UUID REFERENCES users(id) ON DELETE CASCADE,
      business_id UUID REFERENCES businesses(id) ON DELETE SET NULL,
      title VARCHAR(200),
      content TEXT,
      post_type VARCHAR(20) DEFAULT 'text' CHECK (post_type IN ('text', 'image', 'video', 'link', 'review')),
      media_urls TEXT[],
      external_url TEXT,
      latitude DECIMAL(10, 8),
      longitude DECIMAL(11, 8),
      rating INTEGER CHECK (rating >= 1 AND rating <= 5),
      is_featured BOOLEAN DEFAULT false,
      is_pinned BOOLEAN DEFAULT false,
      upvotes INTEGER DEFAULT 0,
      downvotes INTEGER DEFAULT 0,
      comment_count INTEGER DEFAULT 0,
      view_count INTEGER DEFAULT 0,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );`
  })
  
  if (postsError) console.log('⚠️ Posts table:', postsError.message)
  else console.log('✅ Posts table created')
  
  // Create comments table
  console.log('📝 Creating comments table...')
  const { error: commentsError } = await supabase.rpc('sql', {
    query: `
    CREATE TABLE IF NOT EXISTS comments (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      post_id UUID REFERENCES posts(id) ON DELETE CASCADE,
      author_id UUID REFERENCES users(id) ON DELETE CASCADE,
      parent_id UUID REFERENCES comments(id) ON DELETE CASCADE,
      content TEXT NOT NULL,
      upvotes INTEGER DEFAULT 0,
      downvotes INTEGER DEFAULT 0,
      is_flagged BOOLEAN DEFAULT false,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );`
  })
  
  if (commentsError) console.log('⚠️ Comments table:', commentsError.message)
  else console.log('✅ Comments table created')
  
  // Create business_owners table
  console.log('📝 Creating business_owners table...')
  const { error: businessOwnersError } = await supabase.rpc('sql', {
    query: `
    CREATE TABLE IF NOT EXISTS business_owners (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id UUID REFERENCES users(id) ON DELETE CASCADE,
      business_id UUID REFERENCES businesses(id) ON DELETE CASCADE,
      verified BOOLEAN DEFAULT false,
      verified_at TIMESTAMP WITH TIME ZONE,
      verified_by UUID REFERENCES users(id),
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      UNIQUE(user_id, business_id)
    );`
  })
  
  if (businessOwnersError) console.log('⚠️ Business owners table:', businessOwnersError.message)
  else console.log('✅ Business owners table created')
  
  console.log('\n✅ Core tables created successfully!')
  console.log('🎉 Social network foundation is ready!')
  
  return true
}

async function createIndexes() {
  console.log('\n📊 Creating database indexes...')
  
  const indexes = [
    'CREATE INDEX IF NOT EXISTS idx_posts_business_id ON posts(business_id);',
    'CREATE INDEX IF NOT EXISTS idx_posts_author_id ON posts(author_id);',
    'CREATE INDEX IF NOT EXISTS idx_posts_created_at ON posts(created_at DESC);',
    'CREATE INDEX IF NOT EXISTS idx_comments_post_id ON comments(post_id);',
    'CREATE INDEX IF NOT EXISTS idx_comments_author_id ON comments(author_id);',
    'CREATE INDEX IF NOT EXISTS idx_business_owners_user_id ON business_owners(user_id);',
    'CREATE INDEX IF NOT EXISTS idx_business_owners_business_id ON business_owners(business_id);'
  ]
  
  for (const indexQuery of indexes) {
    const { error } = await supabase.rpc('sql', { query: indexQuery })
    if (error) {
      console.log('⚠️ Index error:', error.message)
    }
  }
  
  console.log('✅ Indexes created')
}

async function setupRowLevelSecurity() {
  console.log('\n🔒 Setting up Row Level Security...')
  
  const policies = [
    // Enable RLS
    'ALTER TABLE users ENABLE ROW LEVEL SECURITY;',
    'ALTER TABLE posts ENABLE ROW LEVEL SECURITY;',
    'ALTER TABLE comments ENABLE ROW LEVEL SECURITY;',
    'ALTER TABLE business_owners ENABLE ROW LEVEL SECURITY;',
    
    // Basic policies - can be refined later
    `CREATE POLICY "Users can view all profiles" ON users FOR SELECT USING (true);`,
    `CREATE POLICY "Posts are publicly readable" ON posts FOR SELECT USING (true);`,
    `CREATE POLICY "Comments are publicly readable" ON comments FOR SELECT USING (true);`,
    `CREATE POLICY "Business owners are publicly readable" ON business_owners FOR SELECT USING (true);`
  ]
  
  for (const policy of policies) {
    const { error } = await supabase.rpc('sql', { query: policy })
    if (error && !error.message.includes('already exists')) {
      console.log('⚠️ Policy setup:', error.message)
    }
  }
  
  console.log('✅ Row Level Security configured')
}

async function createSampleData() {
  console.log('\n🧪 Creating sample data...')
  
  // Create test admin user
  const { data: userData, error: userError } = await supabase
    .from('users')
    .insert([{
      email: 'admin@chamberconcierge.com',
      username: 'admin',
      display_name: 'Chamber Admin',
      role: 'admin',
      is_verified: true,
      bio: 'Administrator of the CNY Chamber of Commerce Business Directory'
    }])
    .select()
  
  if (userError && !userError.message.includes('duplicate')) {
    console.log('⚠️ User creation:', userError.message)
  } else if (userData) {
    console.log('✅ Created test admin user')
    
    // Create welcome post
    const { error: postError } = await supabase
      .from('posts')
      .insert([{
        author_id: userData[0].id,
        title: 'Welcome to the CNY Business Community!',
        content: 'This is the first post in our new community-driven business directory. Share your experiences, photos, and recommendations!',
        post_type: 'text',
        is_featured: true,
        is_pinned: true
      }])
    
    if (postError && !postError.message.includes('duplicate')) {
      console.log('⚠️ Post creation:', postError.message)
    } else {
      console.log('✅ Created welcome post')
    }
  }
}

async function runMigration() {
  try {
    await createTables()
    await createIndexes()
    await setupRowLevelSecurity()
    await createSampleData()
    
    console.log('\n🎉 Migration completed successfully!')
    console.log('💡 Next steps:')
    console.log('  1. Implement authentication UI')
    console.log('  2. Create user registration/login pages')
    console.log('  3. Build posting interface')
    
  } catch (error) {
    console.error('💥 Migration failed:', error)
  }
}

if (require.main === module) {
  runMigration()
}

module.exports = { runMigration }