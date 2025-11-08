'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

interface SemanticSearchResult {
  categories: string[]
  designations: string[]
  intent: string
  location?: string
  confidence: number
}

// Category-based example searches
const categoryExamples = [
  { label: "Legal Services", category: "Legal Services", icon: "⚖️" },
  { label: "Restaurants", category: "Restaurant", icon: "🍽️" },
  { label: "Coffee Shops", category: "Coffee & Tea", icon: "☕" },
  { label: "Healthcare", category: "Healthcare", icon: "🏥" },
  { label: "Auto Services", category: "Automotive", icon: "🚗" },
  { label: "Real Estate", category: "Real Estate", icon: "🏘️" },
  { label: "Financial Services", category: "Financial Services", icon: "💰" },
  { label: "Home Services", category: "Home Services", icon: "🔧" }
]

export default function Landing() {
  const [query, setQuery] = useState('')
  const [isSearching, setIsSearching] = useState(false)
  const router = useRouter()

  const handleSearch = async (searchQuery: string) => {
    if (!searchQuery.trim()) return

    setIsSearching(true)

    try {
      const response = await fetch('/api/semantic-search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ query: searchQuery })
      })

      if (!response.ok) {
        throw new Error('Search failed')
      }

      const result: SemanticSearchResult = await response.json()
      console.log('Semantic search result:', result)

      // Build URL params for map view
      const params = new URLSearchParams()

      if (result.categories.length > 0) {
        params.set('categories', result.categories.join(','))
      }

      if (result.designations.length > 0) {
        params.set('designations', result.designations.join(','))
      }

      if (searchQuery) {
        params.set('q', searchQuery)
      }

      // Navigate to main page with filters applied
      const url = params.toString() ? `/?${params.toString()}` : '/'
      router.push(url)
    } catch (error) {
      console.error('Search error:', error)
      alert('Search failed. Please try again.')
    } finally {
      setIsSearching(false)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    handleSearch(query)
  }

  // Direct category navigation - no API call needed
  const handleCategoryClick = (category: string) => {
    const params = new URLSearchParams()
    params.set('categories', category)
    router.push(`/?${params.toString()}`)
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-gradient-to-b from-gray-50 via-white to-gray-50">
      <div className="w-full max-w-3xl mx-auto text-center space-y-8">
        {/* Header */}
        <div className="space-y-4">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-100 mb-4">
            <svg 
              className="w-8 h-8 text-blue-600" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" 
              />
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" 
              />
            </svg>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-gray-900">
            Discover Central New York
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Find local businesses and nonprofits using natural language. Just ask what you need.
          </p>
        </div>

        {/* Search Form */}
        <form onSubmit={handleSubmit} className="w-full">
          <div className="relative group">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 via-purple-500/20 to-blue-500/20 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

            <div className="relative bg-white border-2 border-gray-200 rounded-2xl shadow-lg overflow-hidden transition-all duration-300 hover:shadow-xl hover:border-blue-300">
              <div className="flex items-center gap-3 p-4">
                <svg 
                  className="w-6 h-6 text-blue-600 shrink-0" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2} 
                    d="M13 10V3L4 14h7v7l9-11h-7z" 
                  />
                </svg>
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="I need a lawyer, veteran owned restaurant, woman owned boutique..."
                  className="flex-1 bg-transparent text-lg outline-none placeholder-gray-400 text-gray-900"
                  disabled={isSearching}
                  data-testid="input-search-query"
                />
                <button
                  type="submit"
                  disabled={!query.trim() || isSearching}
                  className="px-6 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
                  data-testid="button-search"
                >
                  {isSearching ? (
                    <>
                      <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      Searching...
                    </>
                  ) : (
                    <>
                      Search
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                      </svg>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </form>

        {/* Category Quick Links */}
        <div className="space-y-4">
          <p className="text-sm text-gray-600 font-medium">
            Browse by category:
          </p>
          <div className="flex flex-wrap gap-2 justify-center">
            {categoryExamples.map((example) => (
              <button
                key={example.category}
                onClick={() => handleCategoryClick(example.category)}
                className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 hover:border-blue-400 hover:shadow-md transition-all flex items-center gap-2 group"
                data-testid={`button-category-${example.category.toLowerCase().replace(/\s+/g, '-')}`}
              >
                <span className="text-lg group-hover:scale-110 transition-transform">{example.icon}</span>
                {example.label}
              </button>
            ))}
          </div>
        </div>

        {/* Features */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-8">
          <div className="p-6 rounded-lg bg-white border border-gray-200 text-left space-y-2 hover:shadow-lg transition-shadow">
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
              <h3 className="font-semibold text-gray-900">Local Businesses</h3>
            </div>
            <p className="text-sm text-gray-600">
              Discover 552+ businesses across Central New York, including veteran, woman, and minority owned establishments.
            </p>
          </div>

          <div className="p-6 rounded-lg bg-white border border-gray-200 text-left space-y-2 hover:shadow-lg transition-shadow">
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
              <h3 className="font-semibold text-gray-900">Nonprofits</h3>
            </div>
            <p className="text-sm text-gray-600">
              Connect with 45+ nonprofits serving our community in healthcare, education, animal welfare, and more.
            </p>
          </div>
        </div>

        {/* Footer Note */}
        <p className="text-xs text-gray-500 pt-4">
          Powered by AI • Utica • Rome • Central New York
        </p>
      </div>
    </div>
  )
}
