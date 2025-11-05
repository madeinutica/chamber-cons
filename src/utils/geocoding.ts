import mapboxgl from 'mapbox-gl'

export interface GeocodeResult {
  latitude: number
  longitude: number
  place_name: string
}

export async function geocodeAddress(address: string): Promise<GeocodeResult | null> {
  if (!process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN) {
    console.error('Mapbox token not found')
    return null
  }

  try {
    // Clean and enhance the address for better geocoding
    let enhancedAddress = address.trim()
    
    // Add "New York" if not present
    if (!enhancedAddress.toLowerCase().includes('new york') && !enhancedAddress.toLowerCase().includes(' ny')) {
      // Check if it already has a state abbreviation
      if (!enhancedAddress.match(/,\s*[A-Z]{2}\s*\d{5}/)) {
        enhancedAddress += ', NY'
      }
    }
    
    // Add "United States" for better disambiguation
    if (!enhancedAddress.toLowerCase().includes('united states') && !enhancedAddress.toLowerCase().includes('usa')) {
      enhancedAddress += ', United States'
    }

    const encodedAddress = encodeURIComponent(enhancedAddress)
    
    // Use proximity bias towards Central NY (Utica coordinates) and more specific geocoding
    const response = await fetch(
      `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodedAddress}.json?` +
      `access_token=${process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN}&` +
      `limit=1&` +
      `country=us&` +
      `proximity=-75.2321,43.1009&` + // Bias towards Utica, NY area
      `types=address,poi&` + // Prefer specific addresses and points of interest
      `language=en`
    )

    if (!response.ok) {
      throw new Error(`Geocoding failed: ${response.statusText}`)
    }

    const data = await response.json()
    console.log(`Geocoding "${address}" -> Enhanced: "${enhancedAddress}"`)
    console.log(`Results:`, data.features?.length || 0, 'features found')

    if (data.features && data.features.length > 0) {
      const feature = data.features[0]
      const [longitude, latitude] = feature.center

      // Validate that we got a reasonably specific result
      const accuracy = feature.properties?.accuracy
      const confidence = feature.relevance
      
      console.log(`Best match: ${feature.place_name} (confidence: ${confidence}, accuracy: ${accuracy})`)
      
      // Reject results that are too general (e.g., just city-level)
      if (confidence < 0.8 && feature.place_name.split(',').length < 3) {
        console.warn(`Low confidence result for "${address}": ${feature.place_name}`)
        return null
      }

      return {
        latitude,
        longitude,
        place_name: feature.place_name
      }
    }

    console.warn(`No geocoding results for: "${address}"`)
    return null
  } catch (error) {
    console.error('Error geocoding address:', error)
    return null
  }
}

export async function geocodeBusinesses(businesses: any[]): Promise<any[]> {
  const geocodedBusinesses = []

  for (const business of businesses) {
    // If coordinates already exist, use them
    if (business.latitude && business.longitude) {
      geocodedBusinesses.push({
        ...business,
        coordinates: {
          lat: business.latitude,
          lng: business.longitude
        }
      })
      continue
    }

    // Try to geocode the address
    if (business.address) {
      console.log(`Geocoding: ${business.name} - ${business.address}`)
      const result = await geocodeAddress(business.address)
      
      if (result) {
        geocodedBusinesses.push({
          ...business,
          latitude: result.latitude,
          longitude: result.longitude,
          coordinates: {
            lat: result.latitude,
            lng: result.longitude
          }
        })
        console.log(`✓ Geocoded: ${business.name} -> ${result.latitude}, ${result.longitude}`)
        
        // Add a small delay to respect rate limits
        await new Promise(resolve => setTimeout(resolve, 100))
      } else {
        console.warn(`Failed to geocode: ${business.name} - ${business.address}`)
        // Use a default location in Utica as fallback
        geocodedBusinesses.push({
          ...business,
          latitude: 43.1009,
          longitude: -75.2321,
          coordinates: {
            lat: 43.1009,
            lng: -75.2321
          }
        })
      }
    } else {
      // No address, use default location
      geocodedBusinesses.push({
        ...business,
        latitude: 43.1009,
        longitude: -75.2321,
        coordinates: {
          lat: 43.1009,
          lng: -75.2321
        }
      })
    }
  }

  return geocodedBusinesses
}