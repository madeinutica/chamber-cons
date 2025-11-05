require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase configuration');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function setupStorage() {
  console.log('🗂️  Setting up Supabase Storage...\n');

  try {
    // Check if media bucket exists
    const { data: buckets, error: listError } = await supabase
      .storage
      .listBuckets();

    if (listError) {
      console.error('Error listing buckets:', listError.message);
      return;
    }

    const mediaBucket = buckets?.find(bucket => bucket.name === 'media');

    if (mediaBucket) {
      console.log('✅ Media bucket already exists');
      console.log(`   ID: ${mediaBucket.id}`);
      console.log(`   Public: ${mediaBucket.public}`);
      console.log(`   Created: ${mediaBucket.created_at}`);
    } else {
      console.log('📦 Creating media bucket...');
      
      const { data: newBucket, error: createError } = await supabase
        .storage
        .createBucket('media', {
          public: true,
          allowedMimeTypes: [
            'image/jpeg',
            'image/png', 
            'image/gif',
            'image/webp',
            'video/mp4',
            'video/webm',
            'video/quicktime'
          ],
          fileSizeLimit: 10485760 // 10MB
        });

      if (createError) {
        console.error('❌ Error creating bucket:', createError.message);
        console.log('\n💡 Manual setup required:');
        console.log('1. Go to your Supabase dashboard');
        console.log('2. Navigate to Storage');
        console.log('3. Create a new bucket named "media"');
        console.log('4. Make it public');
        console.log('5. Set appropriate policies for authenticated uploads');
        return;
      }

      console.log('✅ Media bucket created successfully');
      console.log(`   Name: ${newBucket?.name}`);
    }

    // Test upload (small test file)
    console.log('\n🧪 Testing upload functionality...');
    
    const testContent = 'test file content';
    const testBuffer = Buffer.from(testContent);
    
    const { data: uploadData, error: uploadError } = await supabase
      .storage
      .from('media')
      .upload('test/test.txt', testBuffer, {
        contentType: 'text/plain',
        cacheControl: '3600',
        upsert: true
      });

    if (uploadError) {
      console.log('⚠️  Upload test failed:', uploadError.message);
      console.log('\n💡 This might be due to missing policies. To fix:');
      console.log('1. Go to Storage > Policies in Supabase dashboard');
      console.log('2. Create policy for INSERT operations');
      console.log('3. Allow authenticated users to upload to media bucket');
    } else {
      console.log('✅ Upload test successful');
      console.log(`   Path: ${uploadData.path}`);
      
      // Clean up test file
      await supabase.storage.from('media').remove(['test/test.txt']);
      console.log('🧹 Test file cleaned up');
    }

    // Get public URL test
    const { data: urlData } = supabase
      .storage
      .from('media')
      .getPublicUrl('test/example.jpg');
      
    console.log('\n🔗 Public URL format:');
    console.log(`   ${urlData.publicUrl}`);

    console.log('\n🎉 Storage setup completed!');
    console.log('📝 Next steps:');
    console.log('1. Ensure RLS policies allow authenticated uploads');
    console.log('2. Test media upload in the application');
    console.log('3. Monitor storage usage in dashboard');

  } catch (error) {
    console.error('💥 Storage setup failed:', error);
  }
}

setupStorage();