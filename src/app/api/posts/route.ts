import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

export async function POST(request: NextRequest) {
  try {
    const cookieStore = cookies()
    const supabase = createRouteHandlerClient({ cookies })
    
    // Get the authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { content, post_type, business_id, rating, title } = body

    // Validate required fields
    if (!content || !post_type) {
      return NextResponse.json({ error: 'Content and post type are required' }, { status: 400 })
    }

    // Get user profile to check if they exist in our users table
    const { data: userProfile, error: userError } = await supabase
      .from('users')
      .select('id')
      .eq('id', user.id)
      .single()

    if (userError || !userProfile) {
      return NextResponse.json({ error: 'User profile not found' }, { status: 404 })
    }

    // Create the post
    const postData = {
      author_id: user.id,
      content,
      post_type,
      business_id: business_id || null,
      rating: rating || null,
      title: title || null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }

    const { data: post, error: postError } = await supabase
      .from('posts')
      .insert(postData)
      .select(`
        *,
        author:users!posts_author_id_fkey(id, username, display_name, avatar_url),
        business:businesses(id, name, category)
      `)
      .single()

    if (postError) {
      console.error('Error creating post:', postError)
      return NextResponse.json({ error: 'Failed to create post' }, { status: 500 })
    }

    return NextResponse.json({ post }, { status: 201 })

  } catch (error) {
    console.error('Error in POST /api/posts:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const business_id = searchParams.get('business_id')
    const limit = parseInt(searchParams.get('limit') || '20')
    const offset = parseInt(searchParams.get('offset') || '0')
    
    const cookieStore = cookies()
    const supabase = createRouteHandlerClient({ cookies })

    let query = supabase
      .from('posts')
      .select(`
        *,
        author:users!posts_author_id_fkey(id, username, display_name, avatar_url),
        business:businesses(id, name, category),
        votes:votes(vote_type),
        comments:comments(id)
      `)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (business_id) {
      query = query.eq('business_id', business_id)
    }

    const { data: posts, error } = await query

    if (error) {
      console.error('Error fetching posts:', error)
      return NextResponse.json({ error: 'Failed to fetch posts' }, { status: 500 })
    }

    // Calculate vote scores and engagement
    const postsWithEngagement = posts.map((post: any) => ({
      ...post,
      vote_score: post.votes.reduce((score: number, vote: any) => 
        score + (vote.vote_type === 'upvote' ? 1 : -1), 0),
      comment_count: post.comments.length
    }))

    return NextResponse.json({ 
      posts: postsWithEngagement,
      has_more: posts.length === limit
    })

  } catch (error) {
    console.error('Error in GET /api/posts:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}