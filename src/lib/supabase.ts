import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

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