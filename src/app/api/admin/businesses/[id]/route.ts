import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

// GET - Fetch single business
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { data, error } = await supabase
      .from('businesses')
      .select('*')
      .eq('id', params.id)
      .single()

    if (error) {
      console.error('Supabase error:', error)
      return NextResponse.json({ error: 'Business not found' }, { status: 404 })
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

    return NextResponse.json({ business })
  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// PUT - Update business
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    
    const { data, error } = await supabase
      .from('businesses')
      .update({
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
        longitude: body.coordinates?.lng || -75.2321,
        updated_at: new Date().toISOString()
      })
      .eq('id', params.id)
      .select()
      .single()

    if (error) {
      console.error('Supabase error:', error)
      return NextResponse.json({ error: 'Failed to update business' }, { status: 500 })
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

    return NextResponse.json({ business })
  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// DELETE - Delete business
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { error } = await supabase
      .from('businesses')
      .delete()
      .eq('id', params.id)

    if (error) {
      console.error('Supabase error:', error)
      return NextResponse.json({ error: 'Failed to delete business' }, { status: 500 })
    }

    return NextResponse.json({ message: 'Business deleted successfully' })
  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}