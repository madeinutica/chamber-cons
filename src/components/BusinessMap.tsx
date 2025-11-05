'use client'

import React, { useEffect, useRef, useState, useCallback } from 'react'
import mapboxgl from 'mapbox-gl'
import { Business } from '@/types/business'

interface BusinessMapProps {
  businesses: Business[]
  selectedBusiness: Business | null
  onBusinessSelect: (business: Business) => void
  mapFocus?: { business: Business; action: string } | null
}

// Set Mapbox access token
mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN || ''

export default function BusinessMap({ 
  businesses, 
  selectedBusiness, 
  onBusinessSelect,
  mapFocus
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
    if (!isClient) return
    if (map.current) return
    if (!mapContainer.current) return

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/streets-v12',
      center: [-75.2321, 43.1009],
      zoom: 13
    })

    map.current.on('load', () => {
      setMapLoaded(true)
    })

    map.current.addControl(new mapboxgl.NavigationControl(), 'top-right')

    return () => {
      map.current?.remove()
    }
  }, [isClient])

  const getMarkerStyle = useCallback((business: Business) => {
    const isNonprofit = business.isNonprofit
    const category = business.category
    
    let backgroundColor = '#3b82f6'
    let borderColor = '#ffffff'
    let size = business.featured ? '28px' : '22px'
    let icon = '🏢'
    
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
    
    if (business.featured) {
      borderColor = '#fbbf24'
    }
    
    if (business.veteranOwned) {
      borderColor = '#dc2626'
    }
    
    return { backgroundColor, borderColor, size, icon, isNonprofit }
  }, [])

  useEffect(() => {
    if (!map.current || !mapLoaded) return

    markers.current.forEach(marker => marker.remove())
    markers.current = []

    businesses.forEach((business) => {
      const style = getMarkerStyle(business)
      
      const el = document.createElement('div')
      el.className = 'business-marker'
      
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

      const popup = new mapboxgl.Popup({
        offset: 25,
        closeButton: false,
        closeOnClick: false
      }).setHTML(`
        <div class="p-4 max-w-sm bg-gradient-to-br from-white to-indigo-50 rounded-xl border border-indigo-200 shadow-lg">
          <div class="flex justify-between items-start mb-3">
            <h3 class="font-bold text-lg text-gray-900">${business.name}</h3>
            <div class="flex items-center ml-2">
              <span class="text-yellow-500 text-lg">⭐</span>
              <span class="text-lg font-bold text-gray-800">${business.rating}</span>
            </div>
          </div>
          <div class="flex items-center gap-2 mb-3 flex-wrap">
            <span class="text-sm text-indigo-600 font-medium">${business.category}</span>
            ${business.isNonprofit ? '<span class="bg-gradient-to-r from-green-500 to-green-600 text-white text-xs px-2 py-1 rounded-full">💚 Non-Profit</span>' : ''}
            ${business.veteranOwned ? '<span class="bg-gradient-to-r from-red-500 to-red-600 text-white text-xs px-2 py-1 rounded-full">🇺🇸 Veteran</span>' : ''}
            ${business.featured ? '<span class="bg-gradient-to-r from-yellow-400 to-orange-500 text-white text-xs px-2 py-1 rounded-full">✨ Featured</span>' : ''}
          </div>
          <p class="text-sm text-gray-700 mb-3 leading-relaxed">${business.description.substring(0, 100)}...</p>
          <div class="text-sm text-gray-600 space-y-2">
            <div class="flex items-center text-green-600"><span class="mr-2">📍</span> ${business.address}</div>
            <div class="flex items-center text-blue-600"><span class="mr-2">📞</span> ${business.phone}</div>
          </div>
        </div>
      `)

      const marker = new mapboxgl.Marker(el)
        .setLngLat([business.coordinates.lng, business.coordinates.lat])
        .setPopup(popup)
        .addTo(map.current!)

      el.addEventListener('click', () => {
        onBusinessSelect(business)
      })

      el.addEventListener('mouseenter', () => {
        popup.addTo(map.current!)
      })

      el.addEventListener('mouseleave', () => {
        popup.remove()
      })

      markers.current.push(marker)
    })
  }, [businesses, selectedBusiness, mapLoaded, onBusinessSelect, getMarkerStyle])

  useEffect(() => {
    if (!map.current || !selectedBusiness) return

    map.current.flyTo({
      center: [selectedBusiness.coordinates.lng, selectedBusiness.coordinates.lat],
      zoom: 15,
      essential: true
    })
  }, [selectedBusiness])

  // Handle map focus from chatbot
  useEffect(() => {
    if (!map.current || !mapFocus) return

    const { business } = mapFocus
    map.current.flyTo({
      center: [business.coordinates.lng, business.coordinates.lat],
      zoom: 16,
      essential: true
    })
  }, [mapFocus])

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
      
      <div className="absolute top-4 left-4 bg-gradient-to-br from-white to-indigo-50 rounded-2xl shadow-2xl border border-white/20 backdrop-blur-xl p-4 text-sm max-h-96 overflow-y-auto">
        <h4 className="font-bold mb-3 text-gray-900 text-base tracking-wide">Map Legend</h4>
        <div className="space-y-3">
          <div className="text-sm font-semibold text-indigo-700 uppercase tracking-wide">Business Types</div>
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full border-2 border-white shadow-lg flex items-center justify-center text-xs">🏢</div>
            <span className="text-sm text-gray-700 font-medium">For-Profit</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 bg-gradient-to-br from-gray-500 to-gray-600 rounded-full border-2 border-white shadow-lg flex items-center justify-center text-xs">🤝</div>
            <span className="text-sm text-gray-700 font-medium">Non-Profit</span>
          </div>
          
          <div className="text-sm font-semibold text-indigo-700 uppercase tracking-wide mt-4">Special Markers</div>
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 bg-gradient-to-br from-amber-400 to-yellow-500 rounded-full border-2 border-yellow-300 shadow-lg flex items-center justify-center text-xs">⭐</div>
            <span className="text-sm text-gray-700 font-medium">Featured</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full border-2 border-red-500 shadow-lg flex items-center justify-center text-xs relative">
              🏢
              <div className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-gradient-to-br from-red-600 to-red-700 rounded-full shadow-md flex items-center justify-center text-xs">🇺🇸</div>
            </div>
            <span className="text-sm text-gray-700 font-medium">Veteran Owned</span>
          </div>
          
          <div className="text-sm font-semibold text-indigo-700 uppercase tracking-wide mt-4">Categories</div>
          <div className="grid grid-cols-2 gap-2 text-sm text-gray-700">
            <div className="flex items-center gap-2 bg-white/50 rounded-lg p-2"><span>🍽️</span><span>Restaurant</span></div>
            <div className="flex items-center gap-2 bg-white/50 rounded-lg p-2"><span>☕</span><span>Coffee</span></div>
            <div className="flex items-center gap-2 bg-white/50 rounded-lg p-2"><span>🏠</span><span>Home Services</span></div>
            <div className="flex items-center gap-1"><span>🎓</span><span>Education</span></div>
            <div className="flex items-center gap-1"><span>🏥</span><span>Health</span></div>
            <div className="flex items-center gap-1"><span>🎨</span><span>Arts</span></div>
          </div>
        </div>
      </div>

      <div className="absolute bottom-4 left-4 bg-gradient-to-r from-indigo-600 to-blue-700 rounded-xl shadow-2xl px-4 py-3 text-sm border border-white/20 backdrop-blur-sm">
        <span className="text-white font-bold">
          📍 <span className="font-bold">{businesses.length}</span> business{businesses.length !== 1 ? 'es' : ''} shown
        </span>
      </div>
    </div>
  )
}