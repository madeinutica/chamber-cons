import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET() {
  try {
    console.log('Testing Supabase connection...')
    console.log('Supabase URL:', process.env.NEXT_PUBLIC_SUPABASE_URL)
    console.log('Has Anon Key:', !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)
    
    // Simple test query
    const { data, error } = await supabase
      .from('businesses')
      .select('count', { count: 'exact', head: true })

    if (error) {
      console.error('Supabase connection error:', error)
      return NextResponse.json({
        success: false,
        error: error.message,
        details: error
      })
    }

    return NextResponse.json({
      success: true,
      message: 'Supabase connection successful',
      count: data
    })
  } catch (error) {
    console.error('Test API error:', error)
    return NextResponse.json({
      success: false,
      error: 'Connection test failed',
      details: error
    })
  }
}