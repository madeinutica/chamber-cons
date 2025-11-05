require('dotenv').config({ path: '.env.local' })
const { createClient } = require('@supabase/supabase-js')
const fs = require('fs')
const path = require('path')

// Environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase environment variables')
  console.log('SUPABASE_URL:', !!supabaseUrl)
  console.log('SUPABASE_SERVICE_KEY:', !!supabaseServiceKey)
  process.exit(1)
}

// Create Supabase client with service role key for admin operations
const supabase = createClient(supabaseUrl, supabaseServiceKey)

// Try to read the enriched data from multiple possible locations
function loadEnrichedData() {
  const possiblePaths = [
    'c:\\Users\\ErickFlorez\\AppData\\Local\\Temp\\498b7535-9ba4-4248-8d12-ced5051a8c0c_Generate AI Summaries, Meta Tags, and Schema for Listings.zip.c0c\\organizations_enriched_full.json',
    path.join(__dirname, '..', 'data', 'organizations_enriched_full.json'),
    path.join(__dirname, '..', 'data', 'enriched_businesses.json')
  ]
  
  for (const filePath of possiblePaths) {
    try {
      if (fs.existsSync(filePath)) {
        console.log(`Loading data from: ${filePath}`)
        const rawData = fs.readFileSync(filePath, 'utf8')
        return JSON.parse(rawData)
      }
    } catch (error) {
      console.log(`Failed to load from ${filePath}:`, error.message)
    }
  }
  
  throw new Error('Could not find enriched business data file')
}

// Function to extract category from category string
function extractPrimaryCategory(categoryString) {
  if (!categoryString) return 'Other'
  
  // Extract the first category before any parentheses or commas
  const match = categoryString.match(/^([^(,]+)/)
  if (match) {
    return match[1].trim()
  }
  
  return categoryString.split(',')[0].trim() || 'Other'
}

// Function to extract special attributes from category and name
function extractAttributes(categoryString, name) {
  const lowerCategory = (categoryString || '').toLowerCase()
  const lowerName = (name || '').toLowerCase()
  
  return {
    veteranOwned: lowerCategory.includes('veteran-owned') || lowerCategory.includes('veteran owned'),
    womanOwned: lowerCategory.includes('woman-owned') || lowerCategory.includes('woman owned'),
    minorityOwned: lowerCategory.includes('minority owned') || lowerCategory.includes('minority-owned'),
    isNonprofit: lowerCategory.includes('non-profit') || lowerCategory.includes('nonprofit') || 
                 lowerName.includes('association') || lowerName.includes('society') || 
                 lowerName.includes('foundation')
  }
}

// Function to clean phone number
function formatPhone(phone) {
  if (!phone || phone === 'N/A') return ''
  
  // Remove all non-digit characters
  const digits = phone.replace(/\D/g, '')
  
  // Format as (XXX) XXX-XXXX
  if (digits.length === 10) {
    return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`
  } else if (digits.length === 11 && digits[0] === '1') {
    return `(${digits.slice(1, 4)}) ${digits.slice(4, 7)}-${digits.slice(7)}`
  }
  
  return phone
}

// Function to generate website URL if not provided
function generateWebsite(business) {
  // If website is already provided and valid, use it
  if (business.website && business.website !== 'Not available' && business.website.includes('http')) {
    return business.website
  }
  
  // Generate website based on business name
  const cleanName = business.Name.toLowerCase()
    .replace(/[^a-z0-9\s]/g, '')
    .replace(/\s+/g, '')
    .replace(/inc|llc|corp|company|corporation|ltd/g, '')
  
  return `https://${cleanName}.com`
}

// Function to generate email if not provided
function generateEmail(business) {
  // If email is already provided and valid, use it
  if (business.email && business.email !== 'Not available' && business.email.includes('@')) {
    return business.email
  }
  
  // Generate email based on website
  const website = generateWebsite(business)
  const domain = website.replace('https://', '').replace('http://', '')
  return `info@${domain}`
}

// Function to get coordinates for Utica area
function getDefaultCoordinates() {
  // Default to Utica, NY coordinates with small random offset
  const baseLatitude = 43.1009
  const baseLongitude = -75.2321
  
  return {
    latitude: baseLatitude + (Math.random() - 0.5) * 0.1,
    longitude: baseLongitude + (Math.random() - 0.5) * 0.1
  }
}

// Main migration function
async function migrateEnrichedBusinesses() {
  console.log('Starting full enriched business data migration...')
  
  try {
    // Load the enriched data
    const enrichedBusinesses = loadEnrichedData()
    console.log(`Found ${enrichedBusinesses.length} businesses to import`)
    
    // Clear existing businesses (optional - remove this if you want to keep existing data)
    console.log('Clearing existing businesses...')
    const { error: deleteError } = await supabase
      .from('businesses')
      .delete()
      .gte('id', 1)
    
    if (deleteError) {
      console.warn('Warning: Could not clear existing businesses:', deleteError)
    }
    
    // Process and insert enriched businesses
    const businessesToInsert = enrichedBusinesses.map((business, index) => {
      const attributes = extractAttributes(business.Category, business.Name)
      const coords = getDefaultCoordinates()
      
      return {
        name: business.Name,
        category: extractPrimaryCategory(business.Category),
        description: business.Description,
        meta_description: business.intelligent_summary || 
          (business.Description.length > 160 ? 
            business.Description.substring(0, 157) + '...' : 
            business.Description),
        address: business.Address && business.Address !== 'N/A' ? business.Address : 'Utica, NY',
        phone: formatPhone(business.Phone),
        website: generateWebsite(business),
        email: generateEmail(business),
        rating: Math.round((Math.random() * 1.5 + 3.5) * 10) / 10, // Random rating between 3.5-5.0
        featured: index < 20, // Make first 20 businesses featured
        sponsored: index < 30, // Make first 30 businesses sponsored
        veteran_owned: attributes.veteranOwned,
        woman_owned: attributes.womanOwned,
        minority_owned: attributes.minorityOwned,
        is_nonprofit: attributes.isNonprofit,
        latitude: coords.latitude,
        longitude: coords.longitude,
        full_category: business.Category,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    })
    
    console.log(`Inserting ${businessesToInsert.length} businesses...`)
    
    // Insert in batches to avoid potential limits
    const batchSize = 100
    let insertedCount = 0
    
    for (let i = 0; i < businessesToInsert.length; i += batchSize) {
      const batch = businessesToInsert.slice(i, i + batchSize)
      const batchNumber = Math.floor(i/batchSize) + 1
      const totalBatches = Math.ceil(businessesToInsert.length/batchSize)
      
      console.log(`Inserting batch ${batchNumber}/${totalBatches} (${batch.length} businesses)`)
      
      const { data, error } = await supabase
        .from('businesses')
        .insert(batch)
      
      if (error) {
        console.error(`Error inserting batch ${batchNumber}:`, error)
        throw error
      }
      
      insertedCount += batch.length
      console.log(`✅ Batch ${batchNumber} inserted successfully (${insertedCount}/${businessesToInsert.length} total)`)
      
      // Small delay to avoid overwhelming the database
      await new Promise(resolve => setTimeout(resolve, 100))
    }
    
    console.log('\n🎉 Migration completed successfully!')
    console.log(`📊 Imported ${insertedCount} businesses`)
    console.log(`🏆 Featured: ${businessesToInsert.filter(b => b.featured).length}`)
    console.log(`⭐ Sponsored: ${businessesToInsert.filter(b => b.sponsored).length}`)
    console.log(`🎖️ Veteran-owned: ${businessesToInsert.filter(b => b.veteran_owned).length}`)
    console.log(`👩 Woman-owned: ${businessesToInsert.filter(b => b.woman_owned).length}`)
    console.log(`🤝 Minority-owned: ${businessesToInsert.filter(b => b.minority_owned).length}`)
    console.log(`🏛️ Non-profits: ${businessesToInsert.filter(b => b.is_nonprofit).length}`)
    
  } catch (error) {
    console.error('❌ Migration failed:', error)
    throw error
  }
}

// Run migration
migrateEnrichedBusinesses()
  .then(() => {
    console.log('\n✅ Migration script completed successfully')
    process.exit(0)
  })
  .catch((error) => {
    console.error('\n❌ Migration script failed:', error)
    process.exit(1)
  })