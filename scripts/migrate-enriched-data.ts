import { createClient } from '@supabase/supabase-js'
import enrichedBusinesses from '../data/enriched_businesses.json'

// Environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error('Missing Supabase environment variables')
}

// Create Supabase client with service role key for admin operations
const supabase = createClient(supabaseUrl, supabaseServiceKey)

// Function to extract category from category string
function extractPrimaryCategory(categoryString: string): string {
  if (!categoryString) return 'Other'
  
  // Extract the first category before any parentheses or commas
  const match = categoryString.match(/^([^(,]+)/)
  if (match) {
    return match[1].trim()
  }
  
  return categoryString.split(',')[0].trim() || 'Other'
}

// Function to extract special attributes
function extractAttributes(categoryString: string, name: string) {
  const lowerCategory = categoryString.toLowerCase()
  const lowerName = name.toLowerCase()
  
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
function formatPhone(phone: string): string {
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

// Function to generate website URL
function generateWebsite(name: string): string {
  // Basic website generation based on business name
  const cleanName = name.toLowerCase()
    .replace(/[^a-z0-9\s]/g, '')
    .replace(/\s+/g, '')
    .replace(/inc|llc|corp|company|corporation|ltd/g, '')
  
  return `https://${cleanName}.com`
}

// Function to get coordinates for Utica area (placeholder - you can enhance with real geocoding)
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
  console.log('Starting business data migration...')
  
  try {
    // Clear existing businesses (optional - remove if you want to keep existing data)
    console.log('Clearing existing businesses...')
    const { error: deleteError } = await supabase
      .from('businesses')
      .delete()
      .neq('id', 0) // Delete all rows
    
    if (deleteError) {
      console.warn('Note: Could not clear existing businesses:', deleteError.message)
    }
    
    // Process and insert enriched businesses
    const businessesToInsert = enrichedBusinesses.map((business, index) => {
      const attributes = extractAttributes(business.Category, business.Name)
      const coords = getDefaultCoordinates()
      
      return {
        name: business.Name,
        category: extractPrimaryCategory(business.Category),
        description: business.Description,
        meta_description: business.Description.length > 160 ? 
          business.Description.substring(0, 157) + '...' : 
          business.Description,
        address: business.Address && business.Address !== 'N/A' ? business.Address : 'Utica, NY',
        phone: formatPhone(business.Phone),
        website: generateWebsite(business.Name),
        email: `info@${generateWebsite(business.Name).replace('https://', '')}`,
        rating: Math.round((Math.random() * 1.5 + 3.5) * 10) / 10, // Random rating between 3.5-5.0
        featured: index < 10, // Make first 10 businesses featured
        sponsored: index < 20, // Make first 20 businesses sponsored
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
    const batchSize = 50
    for (let i = 0; i < businessesToInsert.length; i += batchSize) {
      const batch = businessesToInsert.slice(i, i + batchSize)
      
      const { data, error } = await supabase
        .from('businesses')
        .insert(batch)
      
      if (error) {
        console.error(`Error inserting batch ${i}-${i + batch.length}:`, error)
        throw error
      }
      
      console.log(`Inserted batch ${Math.floor(i/batchSize) + 1}/${Math.ceil(businessesToInsert.length/batchSize)}`)
    }
    
    console.log('✅ Migration completed successfully!')
    console.log(`📊 Imported ${businessesToInsert.length} businesses`)
    console.log(`🏆 Featured: ${businessesToInsert.filter(b => b.featured).length}`)
    console.log(`🎖️ Veteran-owned: ${businessesToInsert.filter(b => b.veteran_owned).length}`)
    console.log(`👩 Woman-owned: ${businessesToInsert.filter(b => b.woman_owned).length}`)
    console.log(`🤝 Non-profits: ${businessesToInsert.filter(b => b.is_nonprofit).length}`)
    
  } catch (error) {
    console.error('❌ Migration failed:', error)
    throw error
  }
}

// Run migration if called directly
if (require.main === module) {
  migrateEnrichedBusinesses()
    .then(() => {
      console.log('Migration script completed')
      process.exit(0)
    })
    .catch((error) => {
      console.error('Migration script failed:', error)
      process.exit(1)
    })
}

export { migrateEnrichedBusinesses }