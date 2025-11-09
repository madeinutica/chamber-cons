'use client'

import { useState, useEffect, useCallback } from 'react'
import { useSearchParams } from 'next/navigation'
import BusinessMap from '@/components/BusinessMap'
import BusinessList from '@/components/BusinessList'
import ChatBot from '@/components/ChatBot'
import Header from '@/components/Header'
import CommunityFeed from '@/components/CommunityFeed'
import Landing from '@/app/landing/page'
import { AuthProvider } from '@/contexts/AuthContext'
import { Business } from '@/types/business'

type ViewMode = 'directory' | 'community'

export default function Home() {
  const searchParams = useSearchParams()
  const [businesses, setBusinesses] = useState<Business[]>([])
  const [selectedBusiness, setSelectedBusiness] = useState<Business | null>(null)
  const [filteredBusinesses, setFilteredBusinesses] = useState<Business[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('All Categories')
  const [selectedDesignations, setSelectedDesignations] = useState<string[]>([])
  const [selectedFilters, setSelectedFilters] = useState<string[]>([])
  const [mapFocus, setMapFocus] = useState<{ business: Business; action: string } | null>(null)
  const [viewMode, setViewMode] = useState<ViewMode>('directory')
  const [showLanding, setShowLanding] = useState(true)
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false)
  const [isChatOpen, setIsChatOpen] = useState(false)
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(true) // Mobile drawer open by default

  // Handle URL parameters from semantic search
  useEffect(() => {
    const categories = searchParams.get('categories')
    const designations = searchParams.get('designations')
    const query = searchParams.get('q')

    // Show landing page only if no params
    const shouldShowLanding = !categories && !designations && !query
    setShowLanding(shouldShowLanding)

    // Only process filters if we're not showing landing
    if (!shouldShowLanding) {
      if (categories) {
        const categoryList = categories.split(',')
        // Set the first category as selected
        if (categoryList.length > 0) {
          const category = categoryList[0]
          console.log('Setting category from URL:', category)
          setSelectedCategory(category)
        }
      } else {
        // Reset to All Categories if no category param
        setSelectedCategory('All Categories')
      }

      if (designations) {
        setSelectedDesignations(designations.split(','))
      }

      if (query) {
        setSearchTerm(query)
      }
    }
  }, [searchParams])

  // Function for chatbot to focus on a business
  const focusOnBusiness = useCallback((business: Business, action: string = 'show') => {
    setSelectedBusiness(business)
    setMapFocus({ business, action })
    // On mobile, close drawer to show map
    setIsMobileDrawerOpen(false)
    // Clear the focus after a short delay to allow map to update
    setTimeout(() => setMapFocus(null), 100)
  }, [])

  // Handle business selection with mobile drawer close
  const handleBusinessSelect = useCallback((business: Business | null) => {
    setSelectedBusiness(business)
    if (business) {
      // Close mobile drawer when a business is selected
      setIsMobileDrawerOpen(false)
    }
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
    // Filter businesses based on search, category, and designations
    let filtered = businesses
    
    console.log('Filtering businesses:', businesses.length, 'total')
    console.log('Search term:', searchTerm)
    console.log('Selected category:', selectedCategory)
    console.log('Selected designations:', selectedDesignations)
    
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase()
      
      // Enhanced keyword mapping for smart search
      const keywordToCategoryMap: { [key: string]: string[] } = {
        // Automotive - CRITICAL FIX
        'car': ['Automotive', 'Auto Repair', 'Auto Services'],
        'auto': ['Automotive', 'Auto Repair', 'Auto Services'],
        'mechanic': ['Automotive', 'Auto Repair', 'Auto Services'],
        'repair car': ['Automotive', 'Auto Repair'],
        'fix car': ['Automotive', 'Auto Repair'],
        'fix my car': ['Automotive', 'Auto Repair'],
        'vehicle': ['Automotive', 'Auto Repair', 'Auto Services'],
        'oil change': ['Automotive', 'Auto Services'],
        'tire': ['Automotive', 'Auto Services'],
        'brake': ['Automotive', 'Auto Repair'],
        
        // Legal
        'lawyer': ['Legal Services', 'Legal', 'Professional Services'],
        'attorney': ['Legal Services', 'Legal', 'Professional Services'],
        'legal': ['Legal Services', 'Legal'],
        'law': ['Legal Services', 'Legal'],
        
        // Financial
        'bank': ['Financial Services', 'Banking'],
        'finance': ['Financial Services'],
        'mortgage': ['Financial Services'],
        'accounting': ['Financial Services', 'Professional Services'],
        'accountant': ['Financial Services', 'Professional Services'],
        
        // Medical/Health
        'doctor': ['Healthcare', 'Health & Wellness', 'Medical'],
        'medical': ['Healthcare', 'Health & Wellness'],
        'hospital': ['Healthcare', 'Health & Wellness'],
        'clinic': ['Healthcare', 'Health & Wellness'],
        'dentist': ['Healthcare', 'Health & Wellness', 'Dental'],
        
        // Food
        'restaurant': ['Restaurant', 'Food & Dining'],
        'food': ['Restaurant', 'Bakery', 'Coffee & Tea'],
        'coffee': ['Coffee & Tea', 'Restaurant'],
        'bakery': ['Bakery', 'Restaurant'],
        'pizza': ['Restaurant', 'Food & Dining'],
        'bar': ['Restaurant', 'Entertainment'],
        
        // Real Estate
        'real estate': ['Real Estate', 'Professional Services'],
        'realtor': ['Real Estate', 'Professional Services'],
        'property': ['Real Estate', 'Professional Services'],
        
        // Insurance
        'insurance': ['Insurance', 'Financial Services'],
        
        // Technology
        'tech': ['Technology', 'Professional Services'],
        'software': ['Technology'],
        'it': ['Technology', 'Professional Services'],
        
        // Home Services
        'plumber': ['Home Services', 'Professional Services'],
        'electrician': ['Home Services', 'Professional Services'],
        'contractor': ['Home Services', 'Professional Services'],
        'hvac': ['Home Services', 'Professional Services'],
        'roofing': ['Home Services', 'Professional Services']
      }
      
      // Find all matching categories from keyword map
      let matchedCategories: string[] = []
      for (const [keyword, categories] of Object.entries(keywordToCategoryMap)) {
        if (searchLower.includes(keyword)) {
          matchedCategories = [...matchedCategories, ...categories]
        }
      }
      
      // Remove duplicates
      matchedCategories = Array.from(new Set(matchedCategories))
      
      filtered = filtered.filter(business => {
        // Direct text matches (highest priority)
        const nameMatch = business.name.toLowerCase().includes(searchLower)
        const categoryMatch = business.category.toLowerCase().includes(searchLower)
        const descriptionMatch = business.description.toLowerCase().includes(searchLower)
        
        // Smart keyword category matching
        const categoryKeywordMatch = matchedCategories.length > 0 && matchedCategories.some(cat => 
          business.category.toLowerCase().includes(cat.toLowerCase())
        )
        
        // Address matching
        const addressMatch = business.address?.toLowerCase().includes(searchLower)
        
        return nameMatch || categoryMatch || descriptionMatch || categoryKeywordMatch || addressMatch
      })
      console.log('After search filter:', filtered.length, 'matches')
      if (matchedCategories.length > 0) {
        console.log('Smart matched categories:', matchedCategories)
      }
    }
    
    if (selectedCategory && selectedCategory !== 'All Categories') {
      filtered = filtered.filter(business => business.category === selectedCategory)
      console.log('After category filter:', filtered.length)
    }

    // Apply designation filters
    if (selectedDesignations.length > 0) {
      filtered = filtered.filter(business => {
        return selectedDesignations.some(designation => {
          if (designation === 'veteran_owned') return business.veteranOwned
          if (designation === 'is_nonprofit') return business.isNonprofit
          // Add support for woman_owned and minority_owned when added to schema
          return false
        })
      })
      console.log('After designation filter:', filtered.length)
    }

    // Apply new filter system
    if (selectedFilters.length > 0) {
      filtered = filtered.filter(business => {
        return selectedFilters.every(filterId => {
          if (filterId === 'for-profit') return !business.isNonprofit
          if (filterId === 'nonprofit') return business.isNonprofit
          if (filterId === 'veteran') return business.veteranOwned
          if (filterId === 'women') return business.womanOwned || false
          if (filterId === 'minority') return business.minorityOwned || false
          return true
        })
      })
      console.log('After filter system:', filtered.length)
    }
    
    console.log('Final filtered businesses:', filtered.length)
    setFilteredBusinesses(filtered)
  }, [businesses, searchTerm, selectedCategory, selectedDesignations, selectedFilters])

  // Show landing page if no search params
  if (showLanding) {
    return <Landing />
  }

  // Check for required environment variables only when showing main app
  const hasSupabase = !!(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)
  const hasMapbox = !!process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN
  
  if (!hasSupabase || !hasMapbox) {
    console.warn('Missing required environment variables:')
    console.warn('Supabase URL:', !!process.env.NEXT_PUBLIC_SUPABASE_URL)
    console.warn('Supabase Anon Key:', !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)
    console.warn('Mapbox Token:', !!process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN)
    
    return (
      <div className="flex items-center justify-center h-screen bg-gray-100">
        <div className="text-center max-w-md p-8 bg-white rounded-lg shadow-lg">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">Configuration Required</h1>
          <p className="text-gray-600 mb-6">
            This application requires environment variables to be set up properly. 
            Please check your <code className="bg-gray-100 px-2 py-1 rounded">.env.local</code> file.
          </p>
          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-yellow-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-yellow-700">
                  Required environment variables:
                  <ul className="list-disc list-inside mt-2">
                    <li>NEXT_PUBLIC_SUPABASE_URL</li>
                    <li>NEXT_PUBLIC_SUPABASE_ANON_KEY</li>
                    <li>NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN</li>
                  </ul>
                </p>
              </div>
            </div>
          </div>
          <button 
            onClick={() => window.location.href = '/'}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Back to Home
          </button>
        </div>
      </div>
    )
  }

  const handleFilterToggle = (filterId: string) => {
    setSelectedFilters(prev => 
      prev.includes(filterId) 
        ? prev.filter(id => id !== filterId)
        : [...prev, filterId]
    )
  }

  const handleClearSearch = () => {
    setSearchTerm('')
    setSelectedCategory('All Categories')
    setSelectedFilters([])
    setSelectedDesignations([])
    setSelectedBusiness(null)
    // Navigate to home to show featured businesses
    window.history.pushState({}, '', '/')
  }

  // Show featured businesses when no filters are active
  const displayBusinesses = filteredBusinesses.length === 0 && !searchTerm && selectedCategory === 'All Categories' && selectedFilters.length === 0
    ? businesses.filter(b => b.featured || b.sponsored)
    : filteredBusinesses

  return (
    <AuthProvider>
      <main className="flex flex-col h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
        {/* Header spans full width */}
        <div className="fixed top-0 left-0 right-0 z-50">
          <Header 
            selectedCategory={selectedCategory}
            onCategoryChange={setSelectedCategory}
            selectedFilters={selectedFilters}
            onFilterToggle={handleFilterToggle}
            onClearSearch={handleClearSearch}
          />
        </div>

        {/* Main Content Area - Split Layout */}
        <div className="flex-1 mt-16 overflow-hidden flex relative">
          {/* Map Background - Always present */}
          <div className="absolute inset-0 w-full h-full">
            <BusinessMap
              businesses={displayBusinesses}
              selectedBusiness={selectedBusiness}
              onBusinessSelect={handleBusinessSelect}
              mapFocus={mapFocus}
            />
          </div>

          {/* Desktop Sidebar - Hidden on mobile, fixed width on desktop */}
          <div 
            className={`hidden lg:flex flex-col bg-white border-r border-gray-200 transition-all duration-300 relative z-20 ${
              isSidebarCollapsed ? 'w-0' : 'w-80'
            } ${isSidebarCollapsed ? 'overflow-hidden' : ''}`}
          >
            {/* Compact View Mode Tabs */}
            <div className="flex border-b border-gray-200 bg-gray-50">
              <button
                onClick={() => setViewMode('directory')}
                className={`flex-1 py-2.5 px-3 text-xs font-semibold transition-all ${
                  viewMode === 'directory'
                    ? 'text-indigo-600 border-b-2 border-indigo-600 bg-white'
                    : 'text-gray-500 hover:text-gray-700 hover:bg-white'
                }`}
              >
                <span className="mr-1">🏢</span>
                Directory
              </button>
              <button
                onClick={() => setViewMode('community')}
                className={`flex-1 py-2.5 px-3 text-xs font-semibold transition-all ${
                  viewMode === 'community'
                    ? 'text-indigo-600 border-b-2 border-indigo-600 bg-white'
                    : 'text-gray-500 hover:text-gray-700 hover:bg-white'
                }`}
              >
                <span className="mr-1">👥</span>
                Community
              </button>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto">
              {viewMode === 'directory' ? (
                <BusinessList
                  businesses={displayBusinesses}
                  selectedBusiness={selectedBusiness}
                  onBusinessSelect={handleBusinessSelect}
                  searchTerm={searchTerm}
                  selectedCategory={selectedCategory}
                />
              ) : (
                <div className="p-4">
                  <CommunityFeed />
                </div>
              )}
            </div>
          </div>

          {/* Desktop Toggle Button - Only visible on desktop */}
          <button
            onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
            className="hidden lg:block absolute left-0 top-1/2 -translate-y-1/2 z-30 bg-white border border-gray-300 rounded-r-lg px-2 py-6 shadow-lg hover:bg-gray-50 transition-all"
            style={{ left: isSidebarCollapsed ? '0' : 'calc(320px - 1px)' }}
          >
            <svg 
              className={`w-4 h-4 text-gray-600 transition-transform ${isSidebarCollapsed ? '' : 'rotate-180'}`} 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>

          {/* Mobile Drawer - Full screen, slides up from bottom */}
          <div 
            className={`lg:hidden fixed inset-0 z-40 transition-transform duration-300 ease-in-out ${
              isMobileDrawerOpen ? 'translate-y-0' : 'translate-y-full'
            }`}
            style={{ top: '64px' }} // Below header
          >
            <div className="h-full flex flex-col bg-white">
              {/* Mobile Drawer Handle */}
              <div className="flex-shrink-0 bg-gradient-to-r from-indigo-600 to-blue-600 px-4 py-3 flex items-center justify-between shadow-lg">
                <h2 className="text-white font-bold text-lg flex items-center gap-2">
                  <span>🏢</span>
                  <span>Business Directory</span>
                </h2>
                <button
                  onClick={() => setIsMobileDrawerOpen(false)}
                  className="text-white hover:bg-white/20 rounded-lg p-2 transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
              </div>

              {/* Mobile View Mode Tabs */}
              <div className="flex border-b border-gray-200 bg-gray-50 flex-shrink-0">
                <button
                  onClick={() => setViewMode('directory')}
                  className={`flex-1 py-3 px-4 text-sm font-semibold transition-all ${
                    viewMode === 'directory'
                      ? 'text-indigo-600 border-b-2 border-indigo-600 bg-white'
                      : 'text-gray-500 hover:text-gray-700 hover:bg-white'
                  }`}
                >
                  <span className="mr-2">🏢</span>
                  Directory
                </button>
                <button
                  onClick={() => setViewMode('community')}
                  className={`flex-1 py-3 px-4 text-sm font-semibold transition-all ${
                    viewMode === 'community'
                      ? 'text-indigo-600 border-b-2 border-indigo-600 bg-white'
                      : 'text-gray-500 hover:text-gray-700 hover:bg-white'
                  }`}
                >
                  <span className="mr-2">👥</span>
                  Community
                </button>
              </div>

              {/* Mobile Scrollable Content */}
              <div className="flex-1 overflow-y-auto">
                {viewMode === 'directory' ? (
                  <BusinessList
                    businesses={displayBusinesses}
                    selectedBusiness={selectedBusiness}
                    onBusinessSelect={handleBusinessSelect}
                    searchTerm={searchTerm}
                    selectedCategory={selectedCategory}
                  />
                ) : (
                  <div className="p-4">
                    <CommunityFeed />
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Mobile Floating Action Button - Show Map */}
          {!isMobileDrawerOpen && (
            <button
              onClick={() => setIsMobileDrawerOpen(true)}
              className="lg:hidden fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-gradient-to-r from-indigo-600 to-blue-600 text-white rounded-full px-6 py-4 shadow-2xl hover:shadow-3xl transition-all hover:scale-105 flex items-center gap-2 font-bold"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
              <span>View Businesses</span>
            </button>
          )}

          {/* AI Concierge Floating Button - Positioned for both desktop and mobile */}
          {!isChatOpen && (
            <button
              onClick={() => setIsChatOpen(true)}
              className="fixed bottom-6 right-6 z-50 bg-gradient-to-r from-indigo-600 to-blue-600 text-white rounded-full p-4 shadow-2xl hover:shadow-3xl transition-all hover:scale-110 group"
            >
              <div className="flex items-center gap-2">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                </svg>
                <span className="hidden group-hover:inline-block font-semibold text-sm whitespace-nowrap">AI Concierge</span>
              </div>
            </button>
          )}

          {/* AI Concierge Drawer Overlay - Responsive Design */}
          {isChatOpen && (
            <div className="fixed inset-0 z-50 flex justify-end" style={{ top: '64px' }}>
              {/* Minimal backdrop - just for click-to-close */}
              <div 
                className="absolute inset-0 bg-black/20 lg:bg-transparent"
                onClick={() => setIsChatOpen(false)}
              />
              
              {/* Drawer Panel - Full width on mobile, 2/3 on desktop */}
              <div className="relative w-full lg:w-2/3 h-full bg-white border-l border-gray-200 flex flex-col shadow-2xl">
                {/* Clean Header with Close Button */}
                <div className="bg-white border-b border-gray-200 px-4 lg:px-6 py-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-indigo-600 to-blue-600 rounded-xl flex items-center justify-center shadow-sm">
                      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                      </svg>
                    </div>
                    <div>
                      <h2 className="text-base font-bold text-gray-900">AI Business Concierge</h2>
                      <p className="text-xs text-gray-500">Ask me anything about local businesses</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setIsChatOpen(false)}
                    className="w-8 h-8 hover:bg-gray-100 rounded-lg flex items-center justify-center transition-colors text-gray-600 hover:text-gray-900"
                    aria-label="Close chat"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                {/* ChatBot Content - Centered with max width for readability */}
                <div className="flex-1 overflow-hidden bg-white">
                  <div className="h-full max-w-4xl mx-auto">
                    <ChatBot 
                      businesses={businesses}
                      onShowOnMap={focusOnBusiness}
                    />
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </AuthProvider>
  )
}