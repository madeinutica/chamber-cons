require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

// Load the enriched data
const businesses = require('../data/organizations_enriched_full.json');

// Category mapping from raw categories to simplified categories
const categoryMapping = {
  'ATTORNEYS & LEGAL SERVICES': 'Legal Services',
  'ACCOUNTING': 'Financial Services',
  'FINANCIAL INSTITUTIONS & SERVICES': 'Financial Services',
  'HEALTHCARE': 'Healthcare',
  'FOOD & BEVERAGE(Restaurants': 'Restaurant',
  'FOOD & BEVERAGE': 'Restaurant',
  'RESTAURANTS': 'Restaurant',
  'Bars': 'Restaurant',
  'Breweries': 'Restaurant',
  'Wineries': 'Restaurant',
  'COFFEE': 'Coffee & Tea',
  'Cafes': 'Coffee & Tea',
  'BAKERY': 'Bakery',
  'Bakeries': 'Bakery',
  'HOME SERVICES': 'Home Services',
  'CONTRACTORS': 'Home Services',
  'PROFESSIONAL SERVICES': 'Professional Services',
  'CONSULTING & TRAINING': 'Professional Services',
  'Business': 'Professional Services',
  'Coaching': 'Professional Services',
  'HEALTH & FITNESS': 'Health & Wellness',
  'Gyms': 'Health & Wellness',
  'Wellness Centers': 'Health & Wellness',
  'EDUCATION': 'Education',
  'Institutions': 'Education',
  'Libraries': 'Education',
  'ARTS & CULTURE': 'Arts & Culture',
  'Museums': 'Arts & Culture',
  'Zoos': 'Arts & Culture',
  'Galleries': 'Arts & Culture',
  'COMMUNITY SERVICES': 'Community Services',
  'NON-PROFIT ORGANIZATIONS': 'Non-Profit',
  'HUMAN & SOCIAL SERVICES': 'Community Services',
  'ANIMAL SERVICES': 'Animal Welfare',
  'ENTERTAINMENT': 'Entertainment',
  'Sports': 'Entertainment',
  'Festivals': 'Entertainment',
  'Events': 'Event Services',
  'Entertainers': 'Entertainment',
  'RECREATION': 'Entertainment',
  'Camps': 'Entertainment',
  'Golf': 'Entertainment',
  'Indoor/Outdoor Activities': 'Entertainment',
  'AUTO': 'Automotive',
  'Dealers': 'Automotive',
  'Clubs': 'Automotive',
  'Recreational Vehicles': 'Automotive',
  'Repairs & Service': 'Automotive',
  'RETAIL': 'Retail',
  'BEAUTY': 'Beauty & Spa',
  'PERSONAL SERVICES & CARE': 'Beauty & Spa',
  'Salons': 'Beauty & Spa',
  'Spas': 'Beauty & Spa',
  'TECHNOLOGY SERVICES': 'Technology',
  'IT': 'Technology',
  'A/V Services': 'Technology',
  'Computers': 'Technology',
  'REAL ESTATE & PROPERTY SERVICES': 'Real Estate',
  'REAL ESTATE': 'Real Estate',
  'Brokers': 'Real Estate',
  'Agents': 'Real Estate',
  'INSURANCE': 'Insurance',
  'Adjusters': 'Insurance',
  'Disaster Relief': 'Insurance',
  'MANUFACTURING': 'Manufacturing',
  'LODGING': 'Lodging',
  'HOTEL': 'Lodging',
  'TELECOMMUNICATIONS': 'Technology',
  'ADVERTISING & MARKETING': 'Marketing & Advertising',
  'NEWS & MEDIA': 'Media & Publishing',
  'PUBLISHING': 'Media & Publishing',
  'TRANSPORTATION & TRAVEL & TOURISM': 'Transportation',
  'TRANSPORTATION': 'Transportation',
  'TRAVEL & TOURISM': 'Travel & Tourism',
  'EVENT VENUES & SERVICES': 'Event Services',
  'Banquet/Conference Facilities': 'Event Services',
  'Event Planners': 'Event Services',
  'PHOTOGRAPHY & VIDEO SERVICES': 'Photography & Video',
  'FILM PRODUCTION': 'Photography & Video',
  'PRINTING & MAILING SERVICES': 'Printing & Design',
  'PRINTING': 'Printing & Design',
  'DESIGN SERVICES': 'Design Services',
  'Architects': 'Design Services',
  'Interior Design': 'Design Services',
  'Graphic Design': 'Design Services',
  'ENGINEERING': 'Engineering',
  'ENERGY PRODUCTS & UTILITIES': 'Energy & Utilities',
  'ENERGY': 'Energy & Utilities',
  'GOVERNMENT': 'Government',
  'ASSOCIATIONS & TRADE ORGANIZATIONS': 'Associations',
  'ASSOCIATIONS': 'Associations',
  'EMPLOYMENT SERVICES': 'Employment Services',
  'FUNERAL SERVICES': 'Funeral Services',
  'MOVING & STORAGE': 'Moving & Storage',
  'SECURITY SERVICES': 'Security Services',
  'Investigative': 'Security Services',
  'Private Security': 'Security Services',
  'WASTE & RECYCLING MANAGEMENT': 'Waste Management',
  'AGRICULTURE & FARMING': 'Agriculture',
  'AGRICULTURE': 'Agriculture',
  'APPAREL': 'Retail',
  'Retail': 'Retail',
  'Custom': 'Retail',
  'Uniforms': 'Retail',
  'APPLIANCES': 'Retail',
  'OFFICE EQUIPMENT & SUPPLIES': 'Office Supplies',
  'OFFICE SPACE': 'Real Estate',
  'PAYROLL SERVICES': 'Financial Services',
  'PROMOTIONAL PRODUCTS & SIGNAGE': 'Marketing & Advertising',
  'Awards': 'Retail',
  'MATERIALS & EQUIPMENT & SUPPLIES': 'Retail',
  'CLEANING SERVICES': 'Home Services',
  'TRANSLATION SERVICES': 'Professional Services',
  'Interpreters': 'Professional Services',
  'VOLUNTARY BENEFITS': 'Insurance',
  'RESEARCH INSTITUTIONS': 'Education'
};

// Extract keywords from description and schema for better categorization
function extractKeywords(business) {
  const keywords = new Set();
  const text = `${business.Description} ${business.intelligent_summary}`.toLowerCase();
  
  // Legal keywords
  if (text.match(/\b(lawyer|attorney|legal|law firm|litigation|counsel)\b/)) {
    keywords.add('Legal Services');
  }
  
  // Healthcare keywords
  if (text.match(/\b(doctor|medical|health|clinic|hospital|dental|pharmacy|physician)\b/)) {
    keywords.add('Healthcare');
  }
  
  // Restaurant keywords
  if (text.match(/\b(restaurant|dining|food|menu|cuisine|cafe|eatery)\b/)) {
    keywords.add('Restaurant');
  }
  
  // Coffee keywords
  if (text.match(/\b(coffee|espresso|latte|cappuccino|barista)\b/)) {
    keywords.add('Coffee & Tea');
  }
  
  // Financial keywords
  if (text.match(/\b(bank|financial|investment|mortgage|loan|credit|accounting)\b/)) {
    keywords.add('Financial Services');
  }
  
  // Real estate keywords
  if (text.match(/\b(real estate|realtor|property|housing|homes)\b/)) {
    keywords.add('Real Estate');
  }
  
  // Technology keywords
  if (text.match(/\b(technology|software|computer|IT|digital|web)\b/)) {
    keywords.add('Technology');
  }
  
  // Non-profit keywords
  if (text.match(/\b(non-profit|nonprofit|charity|foundation|community service)\b/)) {
    keywords.add('Non-Profit');
  }
  
  // Insurance keywords
  if (text.match(/\b(insurance|coverage|policy|agent)\b/)) {
    keywords.add('Insurance');
  }
  
  // Education keywords
  if (text.match(/\b(school|education|university|college|learning|academy)\b/)) {
    keywords.add('Education');
  }
  
  return [...keywords];
}

// Map raw category string to simplified category
function mapCategory(rawCategory, description) {
  if (!rawCategory) {
    // Try keywords from description if no category
    const keywords = extractKeywords({ Description: description });
    if (keywords.length > 0) {
      return keywords[0];
    }
    return 'Professional Services'; // Default instead of Other
  }
  
  // Split multiple categories - try all of them in order
  const categoryList = rawCategory.split(',').map(c => c.trim());
  
  // Try to find best match from all categories
  for (const cat of categoryList) {
    // Remove parenthetical explanations
    const cleanCat = cat.replace(/\([^)]*\)/g, '').trim();
    
    // Check each mapping
    for (const [key, value] of Object.entries(categoryMapping)) {
      if (cleanCat.includes(key) || cat.includes(key)) {
        return value;
      }
    }
    
    // Also check individual words in the category
    const words = cleanCat.split(/[,&\s]+/);
    for (const word of words) {
      const wordUpper = word.toUpperCase();
      if (categoryMapping[wordUpper]) {
        return categoryMapping[wordUpper];
      }
    }
  }
  
  // Try keywords from description as fallback
  const keywords = extractKeywords({ Description: description });
  if (keywords.length > 0) {
    return keywords[0];
  }
  
  // Final fallback - use first word of first category
  const firstCategory = categoryList[0].toUpperCase();
  if (firstCategory.includes('FOOD')) return 'Restaurant';
  if (firstCategory.includes('BUSINESS')) return 'Professional Services';
  if (firstCategory.includes('SERVICE')) return 'Professional Services';
  if (firstCategory.includes('SHOP')) return 'Retail';
  if (firstCategory.includes('STORE')) return 'Retail';
  if (firstCategory.includes('BUILDING')) return 'Home Services';
  if (firstCategory.includes('REPAIR')) return 'Home Services';
  
  return 'Professional Services'; // Better default than Other
}

// Determine if business is non-profit
function isNonProfit(category, description) {
  const text = `${category} ${description}`.toLowerCase();
  return text.includes('non-profit') || 
         text.includes('nonprofit') ||
         text.includes('charity') ||
         text.includes('foundation') ||
         category.includes('NON-PROFIT');
}

// Determine if veteran owned
function isVeteranOwned(category) {
  return category.includes('Veteran-Owned');
}

async function updateBusinessCategories() {
  console.log('🚀 Starting category update for all businesses\n');
  
  let successCount = 0;
  let failCount = 0;
  
  for (let i = 0; i < businesses.length; i++) {
    const business = businesses[i];
    
    console.log(`[${i + 1}/${businesses.length}] Processing: ${business.Name}`);
    
    try {
      // Map category
      const category = mapCategory(business.Category, business.Description);
      const isNonprofit = isNonProfit(business.Category, business.Description);
      const veteranOwned = isVeteranOwned(business.Category);
      
      // Find business by name
      const { data: found, error: findError } = await supabase
        .from('businesses')
        .select('id')
        .ilike('name', business.Name)
        .single();
      
      if (findError || !found) {
        console.log(`   ❌ Not found in database`);
        failCount++;
        continue;
      }
      
      // Update category
      const { error: updateError } = await supabase
        .from('businesses')
        .update({
          category: category,
          is_nonprofit: isNonprofit,
          veteran_owned: veteranOwned
        })
        .eq('id', found.id);
      
      if (updateError) {
        console.log(`   ❌ Update failed: ${updateError.message}`);
        failCount++;
        continue;
      }
      
      console.log(`   ✅ Updated: ${category}${isNonprofit ? ' (Non-Profit)' : ''}${veteranOwned ? ' (Veteran-Owned)' : ''}`);
      successCount++;
      
    } catch (error) {
      console.log(`   ❌ Error: ${error.message}`);
      failCount++;
    }
  }
  
  console.log('\n============================================================');
  console.log('📊 CATEGORY UPDATE SUMMARY');
  console.log('============================================================');
  console.log(`✅ Successfully updated: ${successCount}`);
  console.log(`❌ Failed to update: ${failCount}`);
  console.log(`📈 Total processed: ${businesses.length}`);
  console.log('============================================================');
  
  // Generate category list
  const categorySet = new Set();
  businesses.forEach(b => {
    const cat = mapCategory(b.Category, b.Description);
    categorySet.add(cat);
  });
  
  console.log('\n📋 CATEGORIES FOUND:');
  [...categorySet].sort().forEach(cat => {
    const count = businesses.filter(b => 
      mapCategory(b.Category, b.Description) === cat
    ).length;
    console.log(`   ${cat}: ${count} businesses`);
  });
}

updateBusinessCategories().catch(console.error);
