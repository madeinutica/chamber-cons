'use client'

import React, { useEffect, useRef } from 'react'

export default function MapTest() {
  const mapContainer = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // Check if we're in the browser
    if (typeof window === 'undefined') return

    // Dynamic import to ensure we're in the browser
    import('mapbox-gl').then((mapboxgl) => {
      if (!mapContainer.current) return

      // Set the access token
      mapboxgl.default.accessToken = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN || ''

      // Create map
      const map = new mapboxgl.default.Map({
        container: mapContainer.current,
        style: 'mapbox://styles/mapbox/streets-v12',
        center: [-75.2321, 43.1009], // Utica, NY
        zoom: 13
      })

      // Add navigation control
      map.addControl(new mapboxgl.default.NavigationControl(), 'top-right')

      // Cleanup function
      return () => {
        map.remove()
      }
    }).catch((error) => {
      console.error('Error loading Mapbox:', error)
    })
  }, [])

  if (!process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN) {
    return (
      <div className="flex items-center justify-center h-full bg-gray-100">
        <div className="text-center">
          <h3 className="text-lg font-semibold mb-2">Map Configuration Required</h3>
          <p className="text-gray-600">Mapbox token: {process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN ? 'Present' : 'Missing'}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full h-full">
      <div ref={mapContainer} className="w-full h-full" />
    </div>
  )
}