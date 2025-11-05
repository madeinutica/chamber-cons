require('dotenv').config({ path: '.env.local' })
const { createClient } = require('@supabase/supabase-js')
const fs = require('fs')

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function findDuplicates() {
  console.log('🔍 Checking for duplicate businesses...\n')
  
  try {
    // 1. Check duplicates in JSON file
    console.log('📄 Analyzing JSON file duplicates...')
    const jsonData = JSON.parse(fs.readFileSync('data/organizations_enriched_full.json', 'utf8'))
    
    const nameCounts = {}
    const duplicatesInJson = []
    
    jsonData.forEach((business, index) => {
      const name = business.Name
      if (nameCounts[name]) {
        nameCounts[name].count++
        nameCounts[name].indexes.push(index)
      } else {
        nameCounts[name] = { count: 1, indexes: [index] }
      }
    })
    
    Object.entries(nameCounts).forEach(([name, data]) => {
      if (data.count > 1) {
        duplicatesInJson.push({ name, count: data.count, indexes: data.indexes })
      }
    })
    
    console.log(`Found ${duplicatesInJson.length} duplicate business names in JSON:`)
    duplicatesInJson.forEach(dup => {
      console.log(`- "${dup.name}" appears ${dup.count} times (indexes: ${dup.indexes.join(', ')})`)
    })
    
    // 2. Check duplicates in database
    console.log('\n🗄️ Analyzing database duplicates...')
    const { data: businesses, error } = await supabase
      .from('businesses')
      .select('id, name')
      .order('name')
    
    if (error) {
      console.error('Error fetching businesses:', error)
      return
    }
    
    const dbNameCounts = {}
    const duplicatesInDb = []
    
    businesses.forEach(business => {
      const name = business.name
      if (dbNameCounts[name]) {
        dbNameCounts[name].count++
        dbNameCounts[name].ids.push(business.id)
      } else {
        dbNameCounts[name] = { count: 1, ids: [business.id] }
      }
    })
    
    Object.entries(dbNameCounts).forEach(([name, data]) => {
      if (data.count > 1) {
        duplicatesInDb.push({ name, count: data.count, ids: data.ids })
      }
    })
    
    console.log(`Found ${duplicatesInDb.length} duplicate business names in database:`)
    duplicatesInDb.forEach(dup => {
      console.log(`- "${dup.name}" appears ${dup.count} times (IDs: ${dup.ids.join(', ')})`)
    })
    
    // 3. Summary
    console.log('\n📊 SUMMARY:')
    console.log(`- Total businesses in JSON: ${jsonData.length}`)
    console.log(`- Total businesses in database: ${businesses.length}`)
    console.log(`- Duplicates in JSON: ${duplicatesInJson.length}`)
    console.log(`- Duplicates in database: ${duplicatesInDb.length}`)
    
    if (duplicatesInDb.length > 0) {
      console.log('\n🧹 Would you like to clean up the duplicates?')
      console.log('Run: node remove-duplicates.js')
    }
    
  } catch (error) {
    console.error('Error:', error)
  }
}

findDuplicates()