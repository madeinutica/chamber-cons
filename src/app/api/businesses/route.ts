import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

// Force dynamic rendering for this route
export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    console.log('Fetching businesses from Supabase...')
    
    const searchParams = request.nextUrl.searchParams
    const category = searchParams.get('category')
    const search = searchParams.get('search')
    const featured = searchParams.get('featured')

    // First, check if the businesses table exists
    let query = supabase
      .from('businesses')
      .select('*')

    if (category) {
      query = query.eq('category', category)
    }

    if (search) {
      query = query.or(`name.ilike.%${search}%,description.ilike.%${search}%,category.ilike.%${search}%`)
    }

    if (featured === 'true') {
      query = query.eq('featured', true)
    }

    query = query.order('featured', { ascending: false })
      .order('rating', { ascending: false })

    const { data, error } = await query

    if (error) {
      console.error('Supabase error:', error)
      
      // If table doesn't exist, return sample data
      if (error.code === 'PGRST116' || error.message.includes('does not exist')) {
        console.log('Table does not exist, returning sample data')
        return NextResponse.json({ 
          businesses: getSampleBusinesses(),
          message: 'Using sample data - database not set up yet'
        })
      }
      
      return NextResponse.json(
        { error: 'Failed to fetch businesses', details: error },
        { status: 500 }
      )
    }

    // Transform data to match frontend Business type and filter out invalid coordinates
    const businesses = data?.map(business => ({
      id: business.id,
      name: business.name,
      category: business.category,
      description: business.description,
      address: business.address,
      phone: business.phone,
      website: business.website,
      rating: business.rating,
      featured: business.featured,
      sponsored: business.sponsored,
      veteranOwned: business.veteran_owned,
      isNonprofit: business.is_nonprofit,
      coordinates: {
        lng: business.longitude,
        lat: business.latitude
      }
    })).filter(business => 
      // Filter out businesses with invalid coordinates (0,0) or missing addresses
      business.coordinates.lat !== 0 && 
      business.coordinates.lng !== 0 && 
      !business.address?.includes('[INVALID]')
    ) || []

    console.log(`Successfully fetched ${businesses.length} businesses`)
    return NextResponse.json({ businesses })
  } catch (error) {
    console.error('API error:', error)
    
    // Return sample data as fallback
    console.log('Returning sample data as fallback')
    return NextResponse.json({ 
      businesses: getSampleBusinesses(),
      message: 'Using sample data due to connection error'
    })
  }
}

function getSampleBusinesses() {
  return [
    {
      id: '1',
      name: 'New York Sash',
      category: 'Home Services',
      description: 'Central New York\'s premier window and door installation company. Expert installation, energy-efficient solutions, and exceptional customer service.',
      address: '1662 Sunset Ave, Utica, NY',
      phone: '(315) 624-3420',
      website: 'newyorksash.com',
      rating: 4.8,
      featured: true,
      sponsored: true,
      veteranOwned: true,
      coordinates: { lng: -75.2321, lat: 43.1009 }
    },
    {
      id: '2',
      name: 'Utica Coffee Roasting Co',
      category: 'Coffee & Tea',
      description: 'Locally roasted coffee beans and specialty drinks in the heart of Utica.',
      address: '123 Coffee St, Utica, NY',
      phone: '(315) 624-2970',
      website: 'uticacoffee.com',
      rating: 4.5,
      featured: false,
      sponsored: true,
      veteranOwned: false,
      coordinates: { lng: -75.2321, lat: 43.1009 }
    },
    {
      id: '3',
      name: 'The Tailor and the Cook',
      category: 'Restaurant',
      description: 'Fine dining restaurant featuring locally sourced ingredients and creative cuisine.',
      address: '456 Main St, Utica, NY',
      phone: '(315) 507-8797',
      website: 'tailorandcook.com',
      rating: 4.7,
      featured: false,
      sponsored: true,
      veteranOwned: false,
      coordinates: { lng: -75.2321, lat: 43.1009 }
    },
    {
      id: '4',
      name: 'Aqua Vino',
      category: 'Restaurant',
      description: 'Italian-inspired restaurant with fresh pasta and extensive wine selection.',
      address: '789 Italian Way, Utica, NY',
      phone: '(315) 732-9284',
      website: 'aquavino.com',
      rating: 4.6,
      featured: false,
      sponsored: true,
      veteranOwned: false,
      coordinates: { lng: -75.2321, lat: 43.1009 }
    },
    {
      id: '5',
      name: 'Caruso\'s Pastry Shoppe',
      category: 'Bakery',
      description: 'Traditional Italian bakery serving fresh pastries, cakes, and desserts since 1948.',
      address: '321 Pastry Lane, Utica, NY',
      phone: '(315) 732-9641',
      website: 'carusospastry.com',
      rating: 4.9,
      featured: false,
      sponsored: true,
      veteranOwned: false,
      coordinates: { lng: -75.2321, lat: 43.1009 }
    }
  ]
}