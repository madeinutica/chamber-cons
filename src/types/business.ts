export interface Business {
  id: string
  name: string
  category: string
  description: string
  address: string
  phone: string
  website: string
  email?: string
  rating: number
  featured: boolean
  sponsored?: boolean
  veteranOwned?: boolean
  womanOwned?: boolean
  minorityOwned?: boolean
  isNonprofit?: boolean
  metaDescription?: string
  categories?: string[] // Additional categories
  
  // Enhanced Schema.org fields
  intelligent_summary?: string // AI-generated concise summary
  enhanced_schema?: Record<string, any> // Full Schema.org JSON-LD
  keywords?: string[] // SEO and search keywords
  service_type?: string[] // Types of services offered
  amenities?: string[] // Features and amenities
  payment_accepted?: string[] // Accepted payment methods
  price_range?: string // $, $$, $$$, $$$$
  area_served?: string // Geographic area served
  founding_date?: string // Date business was founded
  number_of_employees?: string // Employee count range
  slogan?: string // Business slogan or tagline
  alternate_name?: string // DBA or alternative name
  
  socialMedia?: {
    tiktok?: string
    youtube?: string
    spotify?: string
    facebook?: string
    instagram?: string
    twitter?: string
  }
  coordinates: {
    lng: number
    lat: number
  }
}

export interface Category {
  id: string
  name: string
  icon: string
}

export interface Review {
  id: string
  business_id: string
  rating: number
  comment: string
  created_at: string
  author?: string
}