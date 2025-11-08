/**
 * Chamber Directory Scraper
 * Scrapes business addresses from the Greater Utica Chamber of Commerce directory
 * and updates the database with real addresses and contact information
 */

const { createClient } = require('@supabase/supabase-js');
const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs');
const path = require('path');

// Load environment variables
require('dotenv').config({ path: path.join(__dirname, '..', '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase credentials. Check your .env.local file.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Directory URL
const DIRECTORY_URL = 'https://greateruticachamberofcommerce.growthzoneapp.com/directory';

/**
 * Fetch the directory page
 */
async function fetchDirectoryPage() {
  try {
    console.log('🌐 Fetching Chamber directory...');
    const response = await axios.get(DIRECTORY_URL, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    });
    return response.data;
  } catch (error) {
    console.error('❌ Error fetching directory:', error.message);
    throw error;
  }
}

/**
 * Parse business listings from HTML
 */
function parseBusinessListings(html) {
  const $ = cheerio.load(html);
  const businesses = [];

  // This selector will need to be adjusted based on the actual HTML structure
  // We'll need to inspect the page to find the right selectors
  $('.gz-list-card, .directory-item, .member-listing').each((i, element) => {
    const $el = $(element);
    
    const business = {
      name: $el.find('.gz-card-title, .business-name, h3, h2').first().text().trim(),
      address: $el.find('.gz-address, .address, [itemprop="address"]').text().trim(),
      city: $el.find('.gz-city, .city').text().trim(),
      state: $el.find('.gz-state, .state').text().trim(),
      zip: $el.find('.gz-zip, .zip, .postal-code').text().trim(),
      phone: $el.find('.gz-phone, .phone, [itemprop="telephone"]').text().trim(),
      website: $el.find('a[href*="http"]').first().attr('href'),
      email: $el.find('a[href^="mailto:"]').attr('href')?.replace('mailto:', ''),
    };

    if (business.name) {
      businesses.push(business);
    }
  });

  return businesses;
}

/**
 * Normalize business name for matching
 */
function normalizeName(name) {
  if (!name) return '';
  return name
    .toLowerCase()
    .replace(/[^\w\s]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Find matching business in database
 */
async function findBusinessByName(name) {
  const normalizedName = normalizeName(name);
  
  // Try exact match first
  let { data, error } = await supabase
    .from('businesses')
    .select('id, name, address')
    .ilike('name', name)
    .single();

  if (data) return data;

  // Try fuzzy match
  const { data: allBusinesses } = await supabase
    .from('businesses')
    .select('id, name, address');

  if (allBusinesses) {
    for (const business of allBusinesses) {
      const dbNormalized = normalizeName(business.name);
      if (dbNormalized.includes(normalizedName) || normalizedName.includes(dbNormalized)) {
        return business;
      }
    }
  }

  return null;
}

/**
 * Update business with scraped data
 */
async function updateBusiness(businessId, scrapedData) {
  const updateData = {};

  // Build full address
  let fullAddress = '';
  if (scrapedData.address) {
    fullAddress = scrapedData.address;
    if (scrapedData.city) fullAddress += `, ${scrapedData.city}`;
    if (scrapedData.state) fullAddress += `, ${scrapedData.state}`;
    if (scrapedData.zip) fullAddress += ` ${scrapedData.zip}`;
  }

  if (fullAddress) updateData.address = fullAddress;
  if (scrapedData.phone) updateData.phone = scrapedData.phone;
  if (scrapedData.website && scrapedData.website !== 'Not available') {
    updateData.website = scrapedData.website;
  }
  if (scrapedData.email && scrapedData.email !== 'Not available') {
    updateData.email = scrapedData.email;
  }

  if (Object.keys(updateData).length === 0) {
    return false;
  }

  const { error } = await supabase
    .from('businesses')
    .update(updateData)
    .eq('id', businessId);

  if (error) {
    console.error(`❌ Error updating business ${businessId}:`, error.message);
    return false;
  }

  return true;
}

/**
 * Main scraping and update process
 */
async function main() {
  console.log('🚀 Starting Chamber Directory Scraper\n');

  try {
    // Fetch and parse directory
    const html = await fetchDirectoryPage();
    const scrapedBusinesses = parseBusinessListings(html);

    console.log(`📊 Found ${scrapedBusinesses.length} businesses in directory\n`);

    // Save scraped data for inspection
    const scrapedDataPath = path.join(__dirname, '..', 'data', 'scraped_directory.json');
    fs.writeFileSync(scrapedDataPath, JSON.stringify(scrapedBusinesses, null, 2));
    console.log(`💾 Scraped data saved to: ${scrapedDataPath}\n`);

    // Process each scraped business
    let matched = 0;
    let updated = 0;
    let notFound = 0;

    for (let i = 0; i < scrapedBusinesses.length; i++) {
      const scraped = scrapedBusinesses[i];
      console.log(`[${i + 1}/${scrapedBusinesses.length}] Processing: ${scraped.name}`);

      const dbBusiness = await findBusinessByName(scraped.name);

      if (dbBusiness) {
        matched++;
        const success = await updateBusiness(dbBusiness.id, scraped);
        if (success) {
          updated++;
          console.log(`  ✅ Updated with address: ${scraped.address || 'N/A'}`);
        } else {
          console.log(`  ⚠️  No new data to update`);
        }
      } else {
        notFound++;
        console.log(`  ❌ Not found in database`);
      }

      // Rate limiting
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    console.log('\n============================================================');
    console.log('📊 SCRAPING SUMMARY');
    console.log('============================================================');
    console.log(`✅ Businesses matched: ${matched}`);
    console.log(`✅ Businesses updated: ${updated}`);
    console.log(`❌ Businesses not found: ${notFound}`);
    console.log(`📈 Total processed: ${scrapedBusinesses.length}`);
    console.log('============================================================\n');

  } catch (error) {
    console.error('❌ Scraping failed:', error.message);
    process.exit(1);
  }
}

// Run the scraper
main();
