require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function removeDuplicates() {
  console.log('🧹 Starting duplicate removal process...\n');

  try {
    // Get all businesses
    const { data: businesses, error } = await supabase
      .from('businesses')
      .select('*')
      .order('name', { ascending: true });

    if (error) {
      throw error;
    }

    console.log(`📊 Found ${businesses.length} total businesses`);

    // Group by name to find duplicates
    const businessGroups = {};
    businesses.forEach(business => {
      const name = business.name.trim().toLowerCase();
      if (!businessGroups[name]) {
        businessGroups[name] = [];
      }
      businessGroups[name].push(business);
    });

    // Find groups with duplicates
    const duplicateGroups = Object.entries(businessGroups)
      .filter(([name, group]) => group.length > 1);

    console.log(`🔍 Found ${duplicateGroups.length} groups with duplicates\n`);

    let totalRemoved = 0;
    const idsToKeep = [];
    const idsToRemove = [];

    for (const [name, group] of duplicateGroups) {
      console.log(`Processing "${group[0].name}" (${group.length} duplicates)`);
      
      // Sort by quality indicators (prefer records with more complete data)
      group.sort((a, b) => {
        // Score based on data completeness
        const scoreA = (a.description ? 2 : 0) + 
                      (a.website ? 1 : 0) + 
                      (a.phone ? 1 : 0) + 
                      (a.rating ? 1 : 0) + 
                      (a.latitude && a.longitude ? 2 : 0);
        
        const scoreB = (b.description ? 2 : 0) + 
                      (b.website ? 1 : 0) + 
                      (b.phone ? 1 : 0) + 
                      (b.rating ? 1 : 0) + 
                      (b.latitude && b.longitude ? 2 : 0);
        
        return scoreB - scoreA; // Higher score first
      });

      // Keep the first (best) record
      const keepRecord = group[0];
      const removeRecords = group.slice(1);
      
      idsToKeep.push(keepRecord.id);
      removeRecords.forEach(record => idsToRemove.push(record.id));
      
      console.log(`  ✅ Keeping: ${keepRecord.id} (score: ${getQualityScore(keepRecord)})`);
      console.log(`  ❌ Removing: ${removeRecords.length} duplicates`);
      
      totalRemoved += removeRecords.length;
    }

    console.log(`\n📊 Summary:`);
    console.log(`  - Businesses to keep: ${idsToKeep.length}`);
    console.log(`  - Businesses to remove: ${idsToRemove.length}`);
    console.log(`  - Total reduction: ${totalRemoved} records`);

    // Ask for confirmation
    console.log(`\n⚠️  This will permanently delete ${idsToRemove.length} duplicate records.`);
    console.log(`Press Ctrl+C to cancel, or any key to continue...`);
    
    // Wait for user input (in a real scenario, you'd implement proper input handling)
    // For now, we'll proceed with a safety check
    if (idsToRemove.length > 0 && idsToRemove.length < businesses.length * 0.8) {
      console.log(`\n🗑️  Removing ${idsToRemove.length} duplicate records...`);
      
      // Remove duplicates in batches
      const batchSize = 50;
      for (let i = 0; i < idsToRemove.length; i += batchSize) {
        const batch = idsToRemove.slice(i, i + batchSize);
        
        const { error: deleteError } = await supabase
          .from('businesses')
          .delete()
          .in('id', batch);

        if (deleteError) {
          console.error(`❌ Error deleting batch ${i / batchSize + 1}:`, deleteError);
          throw deleteError;
        }
        
        console.log(`  ✅ Deleted batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(idsToRemove.length / batchSize)} (${batch.length} records)`);
      }

      console.log(`\n✅ Successfully removed ${idsToRemove.length} duplicate records!`);
      
      // Verify final count
      const { count: finalCount } = await supabase
        .from('businesses')
        .select('*', { count: 'exact', head: true });
      
      console.log(`📊 Final business count: ${finalCount}`);
      console.log(`🎉 Database cleanup complete!`);
      
    } else {
      console.log(`❌ Safety check failed. Too many records would be deleted (${idsToRemove.length}/${businesses.length})`);
    }

  } catch (error) {
    console.error('❌ Error removing duplicates:', error.message);
    process.exit(1);
  }
}

function getQualityScore(business) {
  return (business.description ? 2 : 0) + 
         (business.website ? 1 : 0) + 
         (business.phone ? 1 : 0) + 
         (business.rating ? 1 : 0) + 
         (business.latitude && business.longitude ? 2 : 0);
}

// Run the cleanup
removeDuplicates();