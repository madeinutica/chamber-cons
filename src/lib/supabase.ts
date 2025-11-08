import { createClient } from '@supabase/supabase-js'

// Check if environment variables are available
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-key'

// Always create client for type safety - will fail gracefully if misconfigured
// Using placeholders during build time when env vars might not be available
const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Database types
export interface DatabaseBusiness {
  id: string
  name: string
  category: string
  description: string
  address: string
  phone: string
  website: string
  rating: number
  featured: boolean
  sponsored?: boolean
  veteran_owned?: boolean
  is_nonprofit?: boolean
  latitude: number
  longitude: number
  meta_description?: string
  schema_json?: any
  created_at: string
  updated_at: string
}

export interface DatabaseCategory {
  id: string
  name: string
  icon: string
  created_at: string
}

export interface DatabaseReview {
  id: string
  business_id: string
  rating: number
  comment: string
  author?: string
  created_at: string
}

export { supabase }