import { NextRequest, NextResponse } from 'next/server'
import { supabase, DatabaseBusiness } from '@/lib/supabase'

// GET - Fetch all businesses (same as public API but with more admin details)
export async function GET() {
  try {
    const { data, error } = await supabase
      .from('businesses')
      .select('*')
      .order('name')

    if (error || !data) {
      console.error('Supabase error:', error)
      return NextResponse.json({ error: 'Failed to fetch businesses' }, { status: 500 })
    }

    const businesses = (data as DatabaseBusiness[]).map(business => ({
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
      metaDescription: business.meta_description,
      coordinates: {
        lng: business.longitude,
        lat: business.latitude
      }
    })) || []

    return NextResponse.json({ businesses })
  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST - Create new business
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    const newBusiness = {
      name: body.name,
      category: body.category,
      description: body.description,
      address: body.address,
      phone: body.phone,
      website: body.website,
      rating: body.rating || 0,
      featured: body.featured || false,
      sponsored: body.sponsored || false,
      veteran_owned: body.veteranOwned || false,
      is_nonprofit: body.isNonprofit || false,
      meta_description: body.metaDescription,
      latitude: body.coordinates?.lat || 43.1009,
      longitude: body.coordinates?.lng || -75.2321
    }
    
    const { data, error } = await supabase
      .from('businesses')
      .insert([newBusiness])
      .select()
      .single<DatabaseBusiness>()

    if (error || !data) {
      console.error('Supabase error:', error)
      return NextResponse.json({ error: 'Failed to create business' }, { status: 500 })
    }

    const business = {
      id: data.id,
      name: data.name,
      category: data.category,
      description: data.description,
      address: data.address,
      phone: data.phone,
      website: data.website,
      rating: data.rating,
      featured: data.featured,
      sponsored: data.sponsored,
      veteranOwned: data.veteran_owned,
      isNonprofit: data.is_nonprofit,
      metaDescription: data.meta_description,
      coordinates: {
        lng: data.longitude,
        lat: data.latitude
      }
    }

    return NextResponse.json({ business }, { status: 201 })
  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}