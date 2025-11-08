'use client'

import React, { useState, useMemo, useEffect } from 'react'
import { Business } from '@/types/business'

interface BusinessListProps {
  businesses: Business[]
  selectedBusiness: Business | null
  onBusinessSelect: (business: Business) => void
  searchTerm?: string
  selectedCategory?: string
}

// Helper function for category icons
function getCategoryIcon(category: string): string {
  const icons: { [key: string]: string } = {
    'Legal Services': '',
    'Financial Services': '',
    'Healthcare': '',
    'Restaurant': '',
    'Coffee & Tea': '',
    'Bakery': '',
    'Home Services': '',
    'Professional Services': '',
    'Real Estate': '',
    'Insurance': '',
    'Technology': '',
    'Engineering': '',
    'Manufacturing': '',
    'Automotive': '',
    'Retail': '',
    'Lodging': '',
    'Non-Profit': '',
    'Entertainment': '',
    'Arts & Culture': '',
    'Education': ''
  }
  return icons[category] || ''
}

export default function BusinessList({ 
  businesses, 
  selectedBusiness, 
  onBusinessSelect,
  searchTerm: externalSearchTerm = '',
  selectedCategory = ''
}: BusinessListProps) {
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set())
  const [internalSearchTerm, setInternalSearchTerm] = useState('')
  
  // Use internal search term if available, otherwise use external
  const searchTerm = internalSearchTerm || externalSearchTerm

  // Smart keyword mapping for intelligent search
  const getRelevantCategories = (query: string): string[] => {
    const lowerQuery = query.toLowerCase()
    const keywordMap: { [key: string]: string[] } = {
      // Automotive
      'car': ['Automotive', 'Auto Repair', 'Auto Services'],
      'auto': ['Automotive', 'Auto Repair', 'Auto Services'],
      'mechanic': ['Automotive', 'Auto Repair', 'Auto Services'],
      'repair car': ['Automotive', 'Auto Repair'],
      'fix car': ['Automotive', 'Auto Repair'],
      'vehicle': ['Automotive', 'Auto Repair', 'Auto Services'],
      'oil change': ['Automotive', 'Auto Services'],
      'tire': ['Automotive', 'Auto Services'],
      'brake': ['Automotive', 'Auto Repair'],
      
      // Legal
      'lawyer': ['Legal Services', 'Legal', 'Professional Services'],
      'attorney': ['Legal Services', 'Legal', 'Professional Services'],
      'legal': ['Legal Services', 'Legal'],
      'law': ['Legal Services', 'Legal'],
      
      // Medical/Health
      'doctor': ['Healthcare', 'Health & Wellness', 'Medical'],
      'dentist': ['Healthcare', 'Health & Wellness', 'Dental'],
      'medical': ['Healthcare', 'Health & Wellness'],
      'health': ['Healthcare', 'Health & Wellness'],
      'clinic': ['Healthcare', 'Health & Wellness'],
      
      // Food
      'restaurant': ['Restaurant', 'Food & Dining'],
      'food': ['Restaurant', 'Food & Dining', 'Bakery'],
      'eat': ['Restaurant', 'Food & Dining'],
      'dining': ['Restaurant', 'Food & Dining'],
      'coffee': ['Coffee & Tea', 'Restaurant'],
      'cafe': ['Coffee & Tea', 'Restaurant'],
      'bakery': ['Bakery', 'Restaurant'],
      'pizza': ['Restaurant', 'Food & Dining'],
      'bar': ['Restaurant', 'Entertainment'],
      
      // Home
      'plumber': ['Home Services', 'Professional Services'],
      'electrician': ['Home Services', 'Professional Services'],
      'contractor': ['Home Services', 'Professional Services'],
      'hvac': ['Home Services', 'Professional Services'],
      'roofing': ['Home Services', 'Professional Services'],
      'painting': ['Home Services', 'Professional Services'],
      'landscaping': ['Home Services', 'Professional Services'],
      
      // Financial
      'bank': ['Financial Services', 'Banking'],
      'insurance': ['Insurance', 'Financial Services'],
      'accounting': ['Professional Services', 'Financial Services'],
      'accountant': ['Professional Services', 'Financial Services'],
      'financial': ['Financial Services', 'Professional Services'],
      
      // Real Estate
      'real estate': ['Real Estate', 'Professional Services'],
      'realtor': ['Real Estate', 'Professional Services'],
      'property': ['Real Estate', 'Professional Services'],
      'housing': ['Real Estate', 'Professional Services'],
      
      // Retail
      'shop': ['Retail', 'Shopping'],
      'store': ['Retail', 'Shopping'],
      'buy': ['Retail', 'Shopping'],
      'clothing': ['Retail', 'Shopping'],
      'boutique': ['Retail', 'Shopping'],
    }
    
    const matchedCategories = new Set<string>()
    for (const [keyword, categories] of Object.entries(keywordMap)) {
      if (lowerQuery.includes(keyword)) {
        categories.forEach(cat => matchedCategories.add(cat))
      }
    }
    
    return Array.from(matchedCategories)
  }

  // Enhanced smart filtering with keyword mapping
  const filteredBusinesses = useMemo(() => {
    if (!searchTerm) return businesses
    
    const lowerSearch = searchTerm.toLowerCase()
    const relevantCategories = getRelevantCategories(searchTerm)
    
    return businesses.filter(business => {
      // Direct matches (highest priority)
      if (business.name.toLowerCase().includes(lowerSearch)) return true
      if (business.description?.toLowerCase().includes(lowerSearch)) return true
      if (business.category?.toLowerCase().includes(lowerSearch)) return true
      
      // Keyword-based category matching
      if (relevantCategories.length > 0) {
        if (relevantCategories.some(cat => 
          business.category?.toLowerCase().includes(cat.toLowerCase())
        )) return true
      }
      
      // Address matching
      if (business.address?.toLowerCase().includes(lowerSearch)) return true
      
      // Additional fields
      if (business.keywords?.some(k => k.toLowerCase().includes(lowerSearch))) return true
      if (business.service_type?.some(s => s.toLowerCase().includes(lowerSearch))) return true
      
      return false
    })
  }, [businesses, searchTerm])

  // Smart sorting: featured first, then by rating
  const sortedBusinesses = useMemo(() => {
    return [...filteredBusinesses].sort((a, b) => {
      if (a.featured && !b.featured) return -1
      if (!a.featured && b.featured) return 1
      if (b.rating !== a.rating) return b.rating - a.rating
      return a.name.localeCompare(b.name)
    })
  }, [filteredBusinesses])

  // Group businesses by category
  const groupedBusinesses = useMemo(() => {
    const groups: { [key: string]: Business[] } = {}
    sortedBusinesses.forEach(business => {
      const category = business.category || 'Other'
      if (!groups[category]) {
        groups[category] = []
      }
      groups[category].push(business)
    })
    return groups
  }, [sortedBusinesses])

  const categories = Object.keys(groupedBusinesses).sort()

  // Auto-expand categories when filtering
  useEffect(() => {
    if (selectedCategory && selectedCategory !== 'All Categories') {
      setExpandedCategories(new Set([selectedCategory]))
    } else if (categories.length <= 3) {
      setExpandedCategories(new Set(categories))
    } else {
      setExpandedCategories(new Set(categories.slice(0, 2)))
    }
  }, [categories, selectedCategory])

  const toggleCategory = (category: string) => {
    setExpandedCategories(prev => {
      const newSet = new Set(prev)
      if (newSet.has(category)) {
        newSet.delete(category)
      } else {
        newSet.add(category)
      }
      return newSet
    })
  }

  if (!businesses || businesses.length === 0) {
    return (
      <div className="flex-1 overflow-y-auto bg-gradient-to-b from-gray-50 to-white p-6">
        <div className="flex flex-col items-center justify-center h-full">
          <div className="bg-gradient-to-br from-blue-100 to-indigo-100 rounded-2xl w-24 h-24 flex items-center justify-center mb-6 shadow-lg">
            <span className="text-5xl">🔍</span>
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">No Results Found</h3>
          <p className="text-gray-600 text-center max-w-sm">
            {searchTerm 
              ? `No businesses match "${searchTerm}". Try a different search term.`
              : selectedCategory 
                ? `No businesses in ${selectedCategory}. Try another category.`
                : 'Try searching for businesses or selecting a category.'
            }
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 flex flex-col bg-gradient-to-b from-gray-50 to-white">
      {/* Smart Search Bar */}
      <div className="sticky top-0 z-10 bg-white border-b border-gray-200 p-4 shadow-sm">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <input
            type="text"
            placeholder="Search businesses, categories, or keywords..."
            value={internalSearchTerm}
            onChange={(e) => setInternalSearchTerm(e.target.value)}
            className="w-full pl-10 pr-10 py-2.5 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all text-sm"
          />
          {internalSearchTerm && (
            <button
              onClick={() => setInternalSearchTerm('')}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
        {internalSearchTerm && (
          <div className="mt-2 text-xs text-gray-600">
            Found <span className="font-semibold text-indigo-600">{sortedBusinesses.length}</span> result{sortedBusinesses.length !== 1 ? 's' : ''}
          </div>
        )}
      </div>

      {/* Kanban-Style Business Cards Grid */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="space-y-3">

        {sortedBusinesses.map((business) => (
          <div
            key={business.id}
            onClick={() => onBusinessSelect(business)}
            className={`group cursor-pointer bg-white rounded-xl p-4 transition-all duration-300 border-2 ${
              selectedBusiness?.id === business.id
                ? 'border-indigo-500 shadow-xl scale-[1.02]'
                : 'border-gray-200 hover:border-indigo-300 hover:shadow-lg'
            }`}
          >
            {/* Card Header */}
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-2xl flex-shrink-0">{getCategoryIcon(business.category || 'Other')}</span>
                  <h3 className="font-bold text-gray-900 text-sm truncate group-hover:text-indigo-600 transition-colors">
                    {business.name}
                  </h3>
                </div>
                <span className="inline-block px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded-full font-medium">
                  {business.category || 'Other'}
                </span>
              </div>
              
              {/* Rating Badge */}
              <div className="flex-shrink-0 ml-2">
                <div className="flex items-center gap-1 bg-yellow-50 px-2 py-1 rounded-lg border border-yellow-200">
                  <span className="text-yellow-500">⭐</span>
                  <span className="text-sm font-bold text-gray-900">{business.rating}</span>
                </div>
              </div>
            </div>

            {/* Badges Row */}
            <div className="flex flex-wrap gap-1.5 mb-3">
              {business.featured && (
                <span className="flex items-center gap-1 bg-gradient-to-r from-yellow-400 to-orange-400 text-white text-xs px-2 py-0.5 rounded-full font-bold">
                  <span>✨</span>
                  <span>Featured</span>
                </span>
              )}
              {business.veteranOwned && (
                <span className="flex items-center gap-1 bg-red-100 text-red-700 text-xs px-2 py-0.5 rounded-full font-medium border border-red-200">
                  <span>🇺🇸</span>
                  <span>Veteran</span>
                </span>
              )}
              {business.isNonprofit && (
                <span className="flex items-center gap-1 bg-green-100 text-green-700 text-xs px-2 py-0.5 rounded-full font-medium border border-green-200">
                  <span>🤝</span>
                  <span>Non-Profit</span>
                </span>
              )}
            </div>

            {/* Description */}
            {business.description && (
              <p className="text-xs text-gray-600 line-clamp-2 mb-3 leading-relaxed">
                {business.description}
              </p>
            )}

            {/* Contact Info Grid */}
            <div className="space-y-2">
              {business.phone && (
                <div className="flex items-center gap-2 text-xs">
                  <div className="flex-shrink-0 w-6 h-6 bg-blue-50 rounded-lg flex items-center justify-center">
                    <span>📞</span>
                  </div>
                  <span className="font-medium text-gray-700">{business.phone}</span>
                </div>
              )}
              {business.address && (
                <div className="flex items-center gap-2 text-xs">
                  <div className="flex-shrink-0 w-6 h-6 bg-green-50 rounded-lg flex items-center justify-center">
                    <span>📍</span>
                  </div>
                  <span className="text-gray-600 truncate">{business.address}</span>
                </div>
              )}
              {business.website && (
                <div className="flex items-center gap-2 text-xs">
                  <div className="flex-shrink-0 w-6 h-6 bg-purple-50 rounded-lg flex items-center justify-center">
                    <span>🌐</span>
                  </div>
                  <a
                    href={`https://${business.website.replace(/^https?:\/\//, '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-indigo-600 hover:text-indigo-800 hover:underline truncate"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {business.website}
                  </a>
                </div>
              )}
            </div>

            {/* Hover Indicator */}
            <div className="mt-3 pt-3 border-t border-gray-100 flex items-center justify-between opacity-0 group-hover:opacity-100 transition-opacity">
              <span className="text-xs text-gray-500">Click to view on map</span>
              <svg className="w-4 h-4 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </div>
        ))}
        </div>

        {/* Stats Footer */}
        <div className="mt-4 bg-white rounded-xl p-4 border border-gray-200 mx-4">
          <div className="grid grid-cols-3 gap-3 text-center">
            <div>
              <div className="text-2xl font-bold text-indigo-600">{businesses.length}</div>
              <div className="text-xs text-gray-600">Total</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-orange-600">{businesses.filter(b => b.featured).length}</div>
              <div className="text-xs text-gray-600">Featured</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-red-600">{businesses.filter(b => b.veteranOwned).length}</div>
              <div className="text-xs text-gray-600">Veteran</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
