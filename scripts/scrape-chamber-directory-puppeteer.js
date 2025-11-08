/**
 * Chamber Directory Scraper with Puppeteer
 * Uses a headless browser to scrape the dynamically-loaded directory
 */

const { createClient } = require('@supabase/supabase-js');
const puppeteer = require('puppeteer');
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
 * Scrape directory with Puppeteer
 */
async function scrapeDirectory() {
  console.log('🌐 Launching browser...');
  
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  try {
    const page = await browser.newPage();
    
    // Set a realistic user agent
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
    
    console.log('📄 Loading directory page...');
    await page.goto(DIRECTORY_URL, { 
      waitUntil: 'networkidle0',
      timeout: 60000 
    });

    // Wait for content to load (adjust selector based on actual page)
    console.log('⏳ Waiting for content to load...');
    await new Promise(resolve => setTimeout(resolve, 5000)); // Give it time to load

    // Try multiple possible selectors
    const possibleSelectors = [
      '.gz-list-card',
      '.directory-item',
      '.member-card',
      '[class*="card"]',
      '[class*="listing"]',
      '[class*="member"]'
    ];

    let businesses = [];
    
    // Extract all text content for debugging
    console.log('🔍 Extracting page content...');
    const pageContent = await page.evaluate(() => {
      return {
        bodyText: document.body.innerText.substring(0, 2000),
        html: document.body.innerHTML.substring(0, 5000),
        links: Array.from(document.querySelectorAll('a')).map(a => ({
          href: a.href,
          text: a.innerText
        })).slice(0, 20)
      };
    });

    // Save debug info
    const debugPath = path.join(__dirname, '..', 'data', 'scrape_debug.json');
    fs.writeFileSync(debugPath, JSON.stringify(pageContent, null, 2));
    console.log(`🔍 Debug info saved to: ${debugPath}`);

    // Try to extract businesses
    businesses = await page.evaluate(() => {
      const results = [];
      
      // Try different selectors
      const cards = document.querySelectorAll('[class*="card"], [class*="member"], [class*="listing"], [class*="directory"]');
      
      cards.forEach(card => {
        // Try to extract business info
        const nameEl = card.querySelector('[class*="name"], [class*="title"], h1, h2, h3, h4, strong, b');
        const addressEl = card.querySelector('[class*="address"], [class*="location"], [class*="street"]');
        const phoneEl = card.querySelector('[class*="phone"], [href*="tel:"]');
        const websiteEl = card.querySelector('[class*="website"], [href*="http"]:not([href*="facebook"]):not([href*="twitter"])');
        const emailEl = card.querySelector('[class*="email"], [href*="mailto:"]');

        if (nameEl && nameEl.innerText.trim()) {
          results.push({
            name: nameEl.innerText.trim(),
            address: addressEl ? addressEl.innerText.trim() : '',
            phone: phoneEl ? phoneEl.innerText.trim() || phoneEl.getAttribute('href')?.replace('tel:', '') : '',
            website: websiteEl ? websiteEl.getAttribute('href') : '',
            email: emailEl ? emailEl.getAttribute('href')?.replace('mailto:', '') : '',
            rawHtml: card.innerHTML.substring(0, 500)
          });
        }
      });

      return results;
    });

    console.log(`📊 Extracted ${businesses.length} potential business listings`);

    return businesses;

  } finally {
    await browser.close();
  }
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
  let { data } = await supabase
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

  if (scrapedData.address && scrapedData.address !== 'N/A') {
    updateData.address = scrapedData.address;
  }
  if (scrapedData.phone) {
    updateData.phone = scrapedData.phone;
  }
  if (scrapedData.website && scrapedData.website !== 'Not available' && scrapedData.website.startsWith('http')) {
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
 * Main process
 */
async function main() {
  console.log('🚀 Starting Puppeteer Chamber Directory Scraper\n');

  try {
    const scrapedBusinesses = await scrapeDirectory();

    // Save scraped data
    const scrapedDataPath = path.join(__dirname, '..', 'data', 'scraped_directory_puppeteer.json');
    fs.writeFileSync(scrapedDataPath, JSON.stringify(scrapedBusinesses, null, 2));
    console.log(`💾 Scraped data saved to: ${scrapedDataPath}\n`);

    if (scrapedBusinesses.length === 0) {
      console.log('⚠️  No businesses found. Check scrape_debug.json for page content.');
      return;
    }

    // Process each business
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
          console.log(`  ✅ Updated with: ${scraped.address || 'N/A'}`);
        } else {
          console.log(`  ⚠️  No new data to update`);
        }
      } else {
        notFound++;
        console.log(`  ❌ Not found in database`);
      }
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
    console.error(error.stack);
    process.exit(1);
  }
}

main();
