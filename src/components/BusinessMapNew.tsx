'use client'

import React, { useEffect, useRef, useState, useCallback } from 'react'
import mapboxgl from 'mapbox-gl'
import { Business } from '@/types/business'

interface BusinessMapProps {
  businesses: Business[]
  selectedBusiness: Business | null
  onBusinessSelect: (business: Business) => void
}

// Set Mapbox access token
mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN || ''

export default function BusinessMap({ 
  businesses, 
  selectedBusiness, 
  onBusinessSelect 
}: BusinessMapProps) {
  const mapContainer = useRef<HTMLDivElement>(null)
  const map = useRef<mapboxgl.Map | null>(null)
  const markers = useRef<mapboxgl.Marker[]>([])
  const [mapLoaded, setMapLoaded] = useState(false)
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
  }, [])

  useEffect(() => {
    if (!isClient) return // Don't initialize until we're on the client
    if (map.current) return // Initialize map only once

    if (!mapContainer.current) return

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/streets-v12',
      center: [-75.2321, 43.1009], // Utica, NY
      zoom: 13
    })

    map.current.on('load', () => {
      setMapLoaded(true)
    })

    // Add navigation control
    map.current.addControl(new mapboxgl.NavigationControl(), 'top-right')

    return () => {
      map.current?.remove()
    }
  }, [isClient])

  // Function to get marker style based on business category and type
  const getMarkerStyle = useCallback((business: Business) => {
    const isNonprofit = business.isNonprofit
    const category = business.category
    
    // Base styles
    let backgroundColor = '#3b82f6' // Default blue
    let borderColor = '#ffffff'
    let size = business.featured ? '28px' : '22px'
    let icon = '🏢' // Default business icon
    
    // Category-specific colors and icons
    switch (category) {
      case 'Restaurant':
        backgroundColor = isNonprofit ? '#dc2626' : '#f59e0b'
        icon = '🍽️'
        break
      case 'Coffee & Tea':
        backgroundColor = isNonprofit ? '#7c2d12' : '#92400e'
        icon = '☕'
        break
      case 'Bakery':
        backgroundColor = isNonprofit ? '#a16207' : '#d97706'
        icon = '🥖'
        break
      case 'Home Services':
        backgroundColor = isNonprofit ? '#059669' : '#10b981'
        icon = '🏠'
        break
      case 'Professional Services':
        backgroundColor = isNonprofit ? '#1e40af' : '#3b82f6'
        icon = '💼'
        break
      case 'Health & Wellness':
        backgroundColor = isNonprofit ? '#dc2626' : '#ef4444'
        icon = '🏥'
        break
      case 'Education':
        backgroundColor = isNonprofit ? '#7c3aed' : '#8b5cf6'
        icon = '🎓'
        break
      case 'Arts & Culture':
        backgroundColor = isNonprofit ? '#be185d' : '#ec4899'
        icon = '🎨'
        break
      case 'Community Services':
        backgroundColor = isNonprofit ? '#0891b2' : '#06b6d4'
        icon = '🏛️'
        break
      case 'Animal Welfare':
        backgroundColor = isNonprofit ? '#059669' : '#10b981'
        icon = '🐾'
        break
      case 'Youth Services':
        backgroundColor = isNonprofit ? '#7c3aed' : '#8b5cf6'
        icon = '👶'
        break
      case 'Entertainment':
        backgroundColor = isNonprofit ? '#be185d' : '#ec4899'
        icon = '🎭'
        break
      case 'Automotive':
        backgroundColor = isNonprofit ? '#374151' : '#6b7280'
        icon = '🚗'
        break
      case 'Retail':
        backgroundColor = isNonprofit ? '#059669' : '#10b981'
        icon = '🛍️'
        break
      case 'Beauty & Spa':
        backgroundColor = isNonprofit ? '#be185d' : '#ec4899'
        icon = '💅'
        break
      default:
        backgroundColor = isNonprofit ? '#6b7280' : '#9ca3af'
        icon = isNonprofit ? '🤝' : '🏢'
    }
    
    // Special styling for featured businesses
    if (business.featured) {
      borderColor = '#fbbf24'
    }
    
    // Special styling for veteran-owned
    if (business.veteranOwned) {
      borderColor = '#dc2626'
    }
    
    return {
      backgroundColor,
      borderColor,
      size,
      icon,
      isNonprofit
    }
  }, [])

  // Update markers when businesses change
  useEffect(() => {
    if (!map.current || !mapLoaded) return

    // Clear existing markers
    markers.current.forEach(marker => marker.remove())
    markers.current = []

    // Add new markers
    businesses.forEach((business) => {
      const style = getMarkerStyle(business)
      
      const el = document.createElement('div')
      el.className = 'business-marker'
      
      // Create a container for icon and background
      el.innerHTML = `
        <div style="
          position: relative;
          width: ${style.size};
          height: ${style.size};
          background-color: ${style.backgroundColor};
          border: 3px solid ${style.borderColor};
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 2px 8px rgba(0,0,0,0.3);
          cursor: pointer;
          font-size: ${business.featured ? '14px' : '12px'};
          transition: transform 0.2s ease;
        ">
          ${style.icon}
          ${style.isNonprofit ? '<div style="position: absolute; top: -4px; right: -4px; background: #059669; color: white; border-radius: 50%; width: 16px; height: 16px; display: flex; align-items: center; justify-content: center; font-size: 10px; border: 2px solid white;">🤝</div>' : ''}
          ${business.veteranOwned ? '<div style="position: absolute; bottom: -4px; right: -4px; background: #dc2626; color: white; border-radius: 50%; width: 16px; height: 16px; display: flex; align-items: center; justify-content: center; font-size: 8px; border: 2px solid white;">🇺🇸</div>' : ''}
        </div>
      `

      if (selectedBusiness?.id === business.id) {
        el.style.transform = 'scale(1.2)'
        const markerEl = el.querySelector('div') as HTMLElement
        if (markerEl) {
          markerEl.style.borderColor = '#ef4444'
        }
      }

      // Create popup
      const popup = new mapboxgl.Popup({
        offset: 25,
        closeButton: false,
        closeOnClick: false
      }).setHTML(`
        <div class="p-3 max-w-xs">
          <div class="flex justify-between items-start mb-2">
            <h3 class="font-bold text-sm">${business.name}</h3>
            <div class="flex items-center ml-2">
              <span class="text-yellow-500 text-sm">⭐</span>
              <span class="text-sm font-semibold">${business.rating}</span>
            </div>
          </div>
          <div class="flex items-center gap-2 mb-2 flex-wrap">
            <span class="text-xs text-gray-600">${business.category}</span>
            ${business.isNonprofit ? '<span class="bg-green-100 text-green-800 text-xs px-2 py-1 rounded">Non-Profit</span>' : ''}
            ${business.veteranOwned ? '<span class="bg-red-100 text-red-800 text-xs px-2 py-1 rounded">Veteran Owned</span>' : ''}
            ${business.featured ? '<span class="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded">Featured</span>' : ''}
          </div>
          <p class="text-xs text-gray-700 mb-2">${business.description.substring(0, 100)}...</p>
          <div class="text-xs text-gray-600 space-y-1">
            <div>📍 ${business.address}</div>
            <div>📞 ${business.phone}</div>
          </div>
        </div>
      `)

      const marker = new mapboxgl.Marker(el)
        .setLngLat([business.coordinates.lng, business.coordinates.lat])
        .setPopup(popup)
        .addTo(map.current!)

      // Handle marker click
      el.addEventListener('click', () => {
        onBusinessSelect(business)
      })

      // Show popup on hover
      el.addEventListener('mouseenter', () => {
        popup.addTo(map.current!)
      })

      el.addEventListener('mouseleave', () => {
        popup.remove()
      })

      markers.current.push(marker)
    })
  }, [businesses, selectedBusiness, mapLoaded, onBusinessSelect, getMarkerStyle])

  // Fly to selected business
  useEffect(() => {
    if (!map.current || !selectedBusiness) return

    map.current.flyTo({
      center: [selectedBusiness.coordinates.lng, selectedBusiness.coordinates.lat],
      zoom: 15,
      essential: true
    })
  }, [selectedBusiness])

  if (!isClient) {
    return (
      <div className="w-full h-full bg-gray-200 animate-pulse">
        <div className="flex items-center justify-center h-full">
          <div className="text-gray-600">Loading map...</div>
        </div>
      </div>
    )
  }

  if (!process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN) {
    return (
      <div className="flex items-center justify-center h-full bg-gray-100">
        <div className="text-center">
          <h3 className="text-lg font-semibold mb-2">Map Configuration Required</h3>
          <p className="text-gray-600">Please set your Mapbox access token in environment variables.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full h-full relative">
      <div ref={mapContainer} className="w-full h-full" />
      
      {/* Enhanced Map Legend */}
      <div className="absolute top-4 left-4 bg-white rounded-lg shadow-lg p-3 text-sm max-h-96 overflow-y-auto">
        <h4 className="font-semibold mb-2">Legend</h4>
        <div className="space-y-2">
          <div className="text-xs font-medium text-gray-700">Business Types:</div>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-blue-500 rounded-full border-2 border-white flex items-center justify-center text-xs">🏢</div>
            <span className="text-xs">For-Profit</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-gray-500 rounded-full border-2 border-white flex items-center justify-center text-xs">🤝</div>
            <span className="text-xs">Non-Profit</span>
          </div>
          
          <div className="text-xs font-medium text-gray-700 mt-3">Special Markers:</div>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-amber-500 rounded-full border-2 border-yellow-400 flex items-center justify-center text-xs">⭐</div>
            <span className="text-xs">Featured</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-blue-500 rounded-full border-2 border-red-600 flex items-center justify-center text-xs relative">
              🏢
              <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-red-600 rounded-full flex items-center justify-center text-xs">🇺🇸</div>
            </div>
            <span className="text-xs">Veteran Owned</span>
          </div>
          
          <div className="text-xs font-medium text-gray-700 mt-3">Categories:</div>
          <div className="grid grid-cols-2 gap-1 text-xs">
            <div className="flex items-center gap-1">
              <span>🍽️</span><span>Restaurant</span>
            </div>
            <div className="flex items-center gap-1">
              <span>☕</span><span>Coffee</span>
            </div>
            <div className="flex items-center gap-1">
              <span>🏠</span><span>Home Services</span>
            </div>
            <div className="flex items-center gap-1">
              <span>🎓</span><span>Education</span>
            </div>
            <div className="flex items-center gap-1">
              <span>🏥</span><span>Health</span>
            </div>
            <div className="flex items-center gap-1">
              <span>🎨</span><span>Arts</span>
            </div>
          </div>
        </div>
      </div>

      {/* Business Count */}
      <div className="absolute bottom-4 left-4 bg-white rounded-lg shadow-lg px-3 py-2 text-sm">
        <span className="font-semibold">{businesses.length}</span> businesses shown
      </div>
    </div>
  )
}