import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { geocodeAddress } from '@/utils/geocoding'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co',
  process.env.SUPABASE_SERVICE_ROLE_KEY || 'placeholder-service-role-key'
)

export async function POST(request: NextRequest) {
  try {
    console.log('Starting geocoding process...')

    // Fetch all businesses from database
    const { data: businesses, error } = await supabase
      .from('businesses')
      .select('*')

    if (error) {
      console.error('Error fetching businesses:', error)
      return NextResponse.json({ error: 'Failed to fetch businesses' }, { status: 500 })
    }

    if (!businesses || businesses.length === 0) {
      return NextResponse.json({ message: 'No businesses found' })
    }

    console.log(`Found ${businesses.length} businesses to geocode`)

    let updated = 0
    let skipped = 0
    let failed = 0

    for (const business of businesses) {
      // Skip if already has coordinates
      if (business.latitude && business.longitude && 
          business.latitude !== 43.1009 && business.longitude !== -75.2321) {
        console.log(`Skipping ${business.name} - already has coordinates`)
        skipped++
        continue
      }

      if (!business.address) {
        console.log(`Skipping ${business.name} - no address`)
        skipped++
        continue
      }

      console.log(`Geocoding: ${business.name} - ${business.address}`)

      const result = await geocodeAddress(business.address)

      if (result) {
        // Update the business with new coordinates
        const { error: updateError } = await supabase
          .from('businesses')
          .update({
            latitude: result.latitude,
            longitude: result.longitude
          })
          .eq('id', business.id)

        if (updateError) {
          console.error(`Failed to update ${business.name}:`, updateError)
          failed++
        } else {
          console.log(`✓ Updated ${business.name}: ${result.latitude}, ${result.longitude}`)
          updated++
        }
      } else {
        console.warn(`Failed to geocode: ${business.name} - ${business.address}`)
        failed++
      }

      // Rate limiting - wait 200ms between requests
      await new Promise(resolve => setTimeout(resolve, 200))
    }

    return NextResponse.json({
      message: 'Geocoding completed',
      results: {
        total: businesses.length,
        updated,
        skipped,
        failed
      }
    })

  } catch (error) {
    console.error('Geocoding error:', error)
    return NextResponse.json({ error: 'Geocoding failed' }, { status: 500 })
  }
}

export async function GET() {
  return NextResponse.json({ 
    message: 'Geocoding API - Use POST to start geocoding process' 
  })
}