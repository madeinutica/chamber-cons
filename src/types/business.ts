export interface Business {
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
  veteranOwned?: boolean
  isNonprofit?: boolean
  metaDescription?: string
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