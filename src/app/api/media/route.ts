import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB
const ALLOWED_TYPES = [
  'image/jpeg',
  'image/png', 
  'image/gif',
  'image/webp',
  'video/mp4',
  'video/webm',
  'video/quicktime'
]

export async function POST(request: NextRequest) {
  try {
    const cookieStore = cookies()
    const supabase = createRouteHandlerClient({ cookies })
    
    // Get the authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const formData = await request.formData()
    const files = formData.getAll('files') as File[]
    
    if (!files || files.length === 0) {
      return NextResponse.json({ error: 'No files provided' }, { status: 400 })
    }

    // Validate files
    for (const file of files) {
      if (file.size > MAX_FILE_SIZE) {
        return NextResponse.json({ 
          error: `File ${file.name} is too large. Maximum size is 10MB.` 
        }, { status: 400 })
      }
      
      if (!ALLOWED_TYPES.includes(file.type)) {
        return NextResponse.json({ 
          error: `File type ${file.type} is not allowed.` 
        }, { status: 400 })
      }
    }

    const uploadedFiles = []

    // Upload each file to Supabase Storage
    for (const file of files) {
      try {
        // Generate unique filename
        const timestamp = Date.now()
        const randomStr = Math.random().toString(36).substring(2, 15)
        const extension = file.name.split('.').pop()
        const fileName = `${user.id}/${timestamp}-${randomStr}.${extension}`
        
        // Convert File to ArrayBuffer
        const arrayBuffer = await file.arrayBuffer()
        const buffer = new Uint8Array(arrayBuffer)

        // Upload to Supabase Storage
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('media')
          .upload(fileName, buffer, {
            contentType: file.type,
            cacheControl: '3600',
            upsert: false
          })

        if (uploadError) {
          console.error('Upload error:', uploadError)
          return NextResponse.json({ 
            error: `Failed to upload ${file.name}: ${uploadError.message}` 
          }, { status: 500 })
        }

        // Get public URL
        const { data: urlData } = supabase.storage
          .from('media')
          .getPublicUrl(fileName)

        // Create media file record in database
        const mediaRecord = {
          uploader_id: user.id,
          filename: fileName,
          original_filename: file.name,
          file_type: file.type,
          file_size: file.size,
          storage_path: uploadData.path,
          width: null, // Will be populated by client-side processing
          height: null,
          duration: null,
          created_at: new Date().toISOString()
        }

        let recordId = `temp-${timestamp}`

        // If tables are available, save to database
        try {
          const { data: dbData, error: dbError } = await supabase
            .from('media_files')
            .insert(mediaRecord)
            .select()
            .single()

          if (dbError) {
            console.warn('Could not save to database:', dbError.message)
            // Continue anyway, file is uploaded to storage
          } else if (dbData) {
            recordId = dbData.id
          }
        } catch (dbErr) {
          console.warn('Database not ready, file uploaded to storage only')
        }

        uploadedFiles.push({
          id: recordId,
          url: urlData.publicUrl,
          filename: fileName,
          original_filename: file.name,
          file_type: file.type,
          file_size: file.size,
          storage_path: uploadData.path
        })

      } catch (fileError) {
        console.error('Error processing file:', fileError)
        return NextResponse.json({ 
          error: `Failed to process ${file.name}` 
        }, { status: 500 })
      }
    }

    return NextResponse.json({ 
      files: uploadedFiles,
      message: `Successfully uploaded ${uploadedFiles.length} file(s)`
    }, { status: 201 })

  } catch (error) {
    console.error('Error in media upload:', error)
    return NextResponse.json({ 
      error: 'Internal server error' 
    }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const cookieStore = cookies()
    const supabase = createRouteHandlerClient({ cookies })
    
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('user_id')
    const postId = searchParams.get('post_id')
    const limit = parseInt(searchParams.get('limit') || '20')

    let query = supabase
      .from('media_files')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit)

    if (userId) {
      query = query.eq('uploader_id', userId)
    }
    
    if (postId) {
      query = query.eq('post_id', postId)
    }

    const { data: files, error } = await query

    if (error) {
      if (error.code === 'PGRST106') {
        return NextResponse.json({ 
          files: [],
          message: 'Media files table not yet created'
        })
      }
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Get public URLs for each file
    const filesWithUrls = files.map(file => {
      const { data: urlData } = supabase.storage
        .from('media')
        .getPublicUrl(file.filename)
      
      return {
        ...file,
        url: urlData.publicUrl
      }
    })

    return NextResponse.json({ files: filesWithUrls })

  } catch (error) {
    console.error('Error fetching media files:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}