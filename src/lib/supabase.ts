import { createClient } from '@supabase/supabase-js'

// Check if environment variables are available
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

// Only create client if environment variables are present
let supabase: ReturnType<typeof createClient> | null = null

if (supabaseUrl && supabaseAnonKey) {
  supabase = createClient(supabaseUrl, supabaseAnonKey)
} else {
  console.warn('Supabase environment variables not found. Supabase client not initialized.')
}

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