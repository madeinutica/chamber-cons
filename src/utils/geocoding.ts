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
    const encodedAddress = encodeURIComponent(address)
    const response = await fetch(
      `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodedAddress}.json?access_token=${process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN}&limit=1&country=us`
    )

    if (!response.ok) {
      throw new Error(`Geocoding failed: ${response.statusText}`)
    }

    const data = await response.json()

    if (data.features && data.features.length > 0) {
      const feature = data.features[0]
      const [longitude, latitude] = feature.center

      return {
        latitude,
        longitude,
        place_name: feature.place_name
      }
    }

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