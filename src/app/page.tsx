'use client'

import { useState, useEffect, useCallback } from 'react'
import BusinessMap from '@/components/BusinessMap'
import BusinessList from '@/components/BusinessList'
import ChatBot from '@/components/ChatBot'
import Header from '@/components/Header'
import CommunityFeed from '@/components/CommunityFeed'
import { AuthProvider } from '@/contexts/AuthContext'
import { Business } from '@/types/business'

type ViewMode = 'directory' | 'community'

export default function Home() {
  const [businesses, setBusinesses] = useState<Business[]>([])
  const [selectedBusiness, setSelectedBusiness] = useState<Business | null>(null)
  const [filteredBusinesses, setFilteredBusinesses] = useState<Business[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('')
  const [mapFocus, setMapFocus] = useState<{ business: Business; action: string } | null>(null)
  const [viewMode, setViewMode] = useState<ViewMode>('directory')

  // Function for chatbot to focus on a business
  const focusOnBusiness = useCallback((business: Business, action: string = 'show') => {
    setSelectedBusiness(business)
    setMapFocus({ business, action })
    // Clear the focus after a short delay to allow map to update
    setTimeout(() => setMapFocus(null), 100)
  }, [])

  const loadSampleBusinesses = useCallback(() => {
    const sampleBusinesses: Business[] = [
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
        address: 'Utica, NY',
        phone: '(315) 624-2970',
        website: 'uticacoffee.com',
        rating: 4.5,
        featured: false,
        sponsored: true,
        coordinates: { lng: -75.2321, lat: 43.1009 }
      },
      {
        id: '3',
        name: 'The Tailor and the Cook',
        category: 'Restaurant',
        description: 'Fine dining restaurant featuring locally sourced ingredients and creative cuisine.',
        address: 'Utica, NY',
        phone: '(315) 507-8797',
        website: 'tailorandcook.com',
        rating: 4.7,
        featured: false,
        sponsored: true,
        coordinates: { lng: -75.2321, lat: 43.1009 }
      },
      {
        id: '4',
        name: 'Aqua Vino',
        category: 'Restaurant',
        description: 'Italian-inspired restaurant with fresh pasta and extensive wine selection.',
        address: 'Utica, NY',
        phone: '(315) 732-9284',
        website: 'aquavino.com',
        rating: 4.6,
        featured: false,
        sponsored: true,
        coordinates: { lng: -75.2321, lat: 43.1009 }
      },
      {
        id: '5',
        name: 'Caruso\'s Pastry Shoppe',
        category: 'Bakery',
        description: 'Traditional Italian bakery serving fresh pastries, cakes, and desserts since 1948.',
        address: 'Utica, NY',
        phone: '(315) 732-9641',
        website: 'carusospastry.com',
        rating: 4.9,
        featured: false,
        sponsored: true,
        coordinates: { lng: -75.2321, lat: 43.1009 }
      }
    ]
    setBusinesses(sampleBusinesses)
  }, [])

  const loadBusinessesFromDatabase = useCallback(async () => {
    try {
      console.log('Loading businesses from database...')
      const response = await fetch('/api/businesses')
      if (response.ok) {
        const data = await response.json()
        console.log('Businesses loaded:', data.businesses?.length || 0, 'businesses')
        console.log('Sample business:', data.businesses?.[0])
        setBusinesses(data.businesses || [])
      } else {
        console.error('Failed to fetch businesses:', response.statusText)
        // Fallback to sample data if API fails
        loadSampleBusinesses()
      }
    } catch (error) {
      console.error('Error fetching businesses:', error)
      // Fallback to sample data if API fails
      loadSampleBusinesses()
    }
  }, [loadSampleBusinesses])

  useEffect(() => {
    // Load businesses from Supabase
    loadBusinessesFromDatabase()
  }, [loadBusinessesFromDatabase])

  useEffect(() => {
    // Filter businesses based on search and category
    let filtered = businesses
    
    console.log('Filtering businesses:', businesses.length, 'total')
    console.log('Search term:', searchTerm)
    console.log('Selected category:', selectedCategory)
    
    if (searchTerm) {
      filtered = filtered.filter(business =>
        business.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        business.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
        business.description.toLowerCase().includes(searchTerm.toLowerCase())
      )
      console.log('After search filter:', filtered.length)
    }
    
    if (selectedCategory) {
      filtered = filtered.filter(business => business.category === selectedCategory)
      console.log('After category filter:', filtered.length)
    }
    
    console.log('Final filtered businesses:', filtered.length)
    setFilteredBusinesses(filtered)
  }, [businesses, searchTerm, selectedCategory])

  return (
    <AuthProvider>
      <main className="flex h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
        {/* Left Sidebar */}
        <div className="w-1/3 bg-white/90 backdrop-blur-sm shadow-2xl overflow-hidden flex flex-col border-r border-slate-200/50">
          <Header 
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            selectedCategory={selectedCategory}
            onCategoryChange={setSelectedCategory}
          />
          
          {/* View Mode Tabs */}
          <div className="flex border-b border-gray-200 bg-white">
            <button
              onClick={() => setViewMode('directory')}
              className={`flex-1 py-3 px-4 text-sm font-medium transition-colors ${
                viewMode === 'directory'
                  ? 'text-indigo-600 border-b-2 border-indigo-600 bg-indigo-50'
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
              }`}
            >
              🏢 Business Directory
            </button>
            <button
              onClick={() => setViewMode('community')}
              className={`flex-1 py-3 px-4 text-sm font-medium transition-colors ${
                viewMode === 'community'
                  ? 'text-indigo-600 border-b-2 border-indigo-600 bg-indigo-50'
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
              }`}
            >
              👥 Community Feed
            </button>
          </div>

          {/* Content based on view mode */}
          <div className="flex-1 overflow-hidden">
            {viewMode === 'directory' ? (
              <BusinessList
                businesses={filteredBusinesses}
                selectedBusiness={selectedBusiness}
                onBusinessSelect={setSelectedBusiness}
              />
            ) : (
              <div className="h-full overflow-y-auto p-4">
                <CommunityFeed />
              </div>
            )}
          </div>
        </div>

        {/* Right Map Area */}
        <div className="flex-1 relative overflow-hidden">
          <BusinessMap
            businesses={filteredBusinesses}
            selectedBusiness={selectedBusiness}
            onBusinessSelect={setSelectedBusiness}
            mapFocus={mapFocus}
          />
          <ChatBot 
            businesses={businesses}
            onShowOnMap={focusOnBusiness}
          />
        </div>
      </main>
    </AuthProvider>
  )
}