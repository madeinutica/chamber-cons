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

  // Smart sorting: featured/sponsored first, then by rating
  const sortedBusinesses = useMemo(() => {
    return [...filteredBusinesses].sort((a, b) => {
      // Prioritize featured and sponsored businesses
      const aFeatured = a.featured || a.sponsored || false
      const bFeatured = b.featured || b.sponsored || false
      
      if (aFeatured && !bFeatured) return -1
      if (!aFeatured && bFeatured) return 1
      if (b.rating !== a.rating) return b.rating - a.rating
      return a.name.localeCompare(b.name)
    })
  }, [filteredBusinesses])

  // Get the top featured business to display as hero card
  const featuredBusiness = useMemo(() => {
    return sortedBusinesses.find(b => b.featured || b.sponsored) || null
  }, [sortedBusinesses])

  // Get remaining businesses (excluding the featured one)
  const regularBusinesses = useMemo(() => {
    if (!featuredBusiness) return sortedBusinesses
    return sortedBusinesses.filter(b => b.id !== featuredBusiness.id)
  }, [sortedBusinesses, featuredBusiness])

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
      <div className="flex-1 overflow-y-auto bg-gradient-to-b from-gray-50 to-white p-4">
        <div className="flex flex-col items-center justify-center h-full">
          <div className="bg-gradient-to-br from-blue-100 to-indigo-100 rounded-xl w-16 h-16 flex items-center justify-center mb-4 shadow-md">
            <span className="text-3xl">🔍</span>
          </div>
          <h3 className="text-sm font-bold text-gray-900 mb-1">No Results Found</h3>
          <p className="text-xs text-gray-600 text-center max-w-xs px-4">
            {searchTerm 
              ? `No businesses match "${searchTerm}". Try a different search.`
              : selectedCategory 
                ? `No businesses in ${selectedCategory}. Try another category.`
                : 'Try searching or selecting a category.'
            }
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 flex flex-col bg-gradient-to-b from-gray-50 to-white">
      {/* Compact Search Bar */}
      <div className="sticky top-0 z-10 bg-white border-b border-gray-200 p-3 shadow-sm">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none">
            <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <input
            type="text"
            placeholder="Quick search..."
            value={internalSearchTerm}
            onChange={(e) => setInternalSearchTerm(e.target.value)}
            className="w-full pl-8 pr-8 py-2 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all text-xs"
          />
          {internalSearchTerm && (
            <button
              onClick={() => setInternalSearchTerm('')}
              className="absolute inset-y-0 right-0 pr-2.5 flex items-center text-gray-400 hover:text-gray-600"
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
        {internalSearchTerm && (
          <div className="mt-1.5 text-[10px] text-gray-600 flex items-center justify-between">
            <span>
              <span className="font-semibold text-indigo-600">{sortedBusinesses.length}</span> result{sortedBusinesses.length !== 1 ? 's' : ''}
            </span>
            <span className="text-gray-400">Type to refine</span>
          </div>
        )}
      </div>

      {/* Business Cards with Featured Hero */}
      <div className="flex-1 overflow-y-auto p-3">
        <div className="space-y-2">

        {/* Featured Business Hero Card */}
        {featuredBusiness && (
          <div
            key={`featured-${featuredBusiness.id}`}
            onClick={() => onBusinessSelect(featuredBusiness)}
            className={`group cursor-pointer bg-gradient-to-br from-indigo-500 to-blue-600 rounded-lg p-4 transition-all duration-200 border-2 shadow-xl ${
              selectedBusiness?.id === featuredBusiness.id
                ? 'border-yellow-400 ring-4 ring-yellow-200'
                : 'border-indigo-600 hover:border-yellow-300 hover:shadow-2xl'
            }`}
          >
            {/* Featured Badge */}
            <div className="absolute top-2 right-2 bg-yellow-400 text-yellow-900 text-[10px] font-bold px-2 py-1 rounded-full flex items-center gap-1">
              <span>⭐</span>
              <span>FEATURED</span>
            </div>

            {/* Hero Header */}
            <div className="flex items-start gap-2 mb-3">
              <span className="text-2xl flex-shrink-0">{getCategoryIcon(featuredBusiness.category || 'Other')}</span>
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-white text-sm leading-tight mb-1.5 group-hover:text-yellow-200 transition-colors">
                  {featuredBusiness.name}
                </h3>
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-[10px] px-2 py-0.5 bg-white/20 backdrop-blur-sm text-white rounded-full font-medium border border-white/30">
                    {featuredBusiness.category || 'Other'}
                  </span>
                  <div className="flex items-center gap-0.5 text-[10px] px-2 py-0.5 bg-yellow-400 text-yellow-900 rounded-full font-bold">
                    <span>⭐</span>
                    <span>{featuredBusiness.rating}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Description for featured */}
            {featuredBusiness.description && (
              <p className="text-xs text-white/90 line-clamp-2 mb-3 leading-relaxed">
                {featuredBusiness.description}
              </p>
            )}

            {/* Badges */}
            {(featuredBusiness.veteranOwned || featuredBusiness.isNonprofit) && (
              <div className="flex flex-wrap gap-1 mb-3">
                {featuredBusiness.veteranOwned && (
                  <span className="text-[10px] px-2 py-0.5 bg-red-500 text-white rounded-full font-bold border border-red-400">
                    🇺🇸 Veteran Owned
                  </span>
                )}
                {featuredBusiness.isNonprofit && (
                  <span className="text-[10px] px-2 py-0.5 bg-green-500 text-white rounded-full font-bold border border-green-400">
                    🤝 Non-Profit
                  </span>
                )}
              </div>
            )}

            {/* Contact Info - White themed */}
            <div className="space-y-1.5">
              {featuredBusiness.phone && (
                <div className="flex items-center gap-1.5 text-xs">
                  <span className="w-5 h-5 bg-white/20 backdrop-blur-sm rounded flex items-center justify-center">📞</span>
                  <span className="font-semibold text-white">{featuredBusiness.phone}</span>
                </div>
              )}
              {featuredBusiness.address && (
                <div className="flex items-center gap-1.5 text-xs">
                  <span className="w-5 h-5 bg-white/20 backdrop-blur-sm rounded flex items-center justify-center">📍</span>
                  <span className="text-white/90">{featuredBusiness.address.split(',')[0]}</span>
                </div>
              )}
              {featuredBusiness.website && (
                <div className="flex items-center gap-1.5 text-xs">
                  <span className="w-5 h-5 bg-white/20 backdrop-blur-sm rounded flex items-center justify-center">🌐</span>
                  <span className="text-white/90 font-medium">Visit Website</span>
                </div>
              )}
            </div>

            {/* Call to Action */}
            <div className="mt-3 pt-3 border-t border-white/20 flex items-center justify-center">
              <span className="text-xs text-white font-bold flex items-center gap-1 group-hover:text-yellow-200 transition-colors">
                Click to view on map
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </span>
            </div>
          </div>
        )}

        {/* Regular Business Cards */}
        {regularBusinesses.map((business) => (
          <div
            key={business.id}
            onClick={() => onBusinessSelect(business)}
            className={`group cursor-pointer bg-white rounded-lg p-3 transition-all duration-200 border ${
              selectedBusiness?.id === business.id
                ? 'border-indigo-500 shadow-lg ring-2 ring-indigo-100'
                : 'border-gray-200 hover:border-indigo-300 hover:shadow-md'
            }`}
          >
            {/* Compact Header */}
            <div className="flex items-start gap-2 mb-2">
              {/* Icon & Name */}
              <span className="text-lg flex-shrink-0 mt-0.5">{getCategoryIcon(business.category || 'Other')}</span>
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-gray-900 text-xs leading-tight mb-1 line-clamp-2 group-hover:text-indigo-600 transition-colors">
                  {business.name}
                </h3>
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-[10px] px-1.5 py-0.5 bg-gray-100 text-gray-600 rounded font-medium">
                    {business.category || 'Other'}
                  </span>
                  {/* Rating */}
                  <div className="flex items-center gap-0.5 text-[10px] px-1.5 py-0.5 bg-yellow-50 text-yellow-700 rounded font-bold">
                    <span>⭐</span>
                    <span>{business.rating}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Compact Badges */}
            {(business.featured || business.veteranOwned || business.isNonprofit) && (
              <div className="flex flex-wrap gap-1 mb-2">
                {business.featured && (
                  <span className="text-[10px] px-1.5 py-0.5 bg-gradient-to-r from-yellow-400 to-orange-400 text-white rounded-full font-bold">
                    ✨ Featured
                  </span>
                )}
                {business.veteranOwned && (
                  <span className="text-[10px] px-1.5 py-0.5 bg-red-50 text-red-700 rounded-full font-medium border border-red-200">
                    🇺🇸 Veteran
                  </span>
                )}
                {business.isNonprofit && (
                  <span className="text-[10px] px-1.5 py-0.5 bg-green-50 text-green-700 rounded-full font-medium border border-green-200">
                    🤝 Non-Profit
                  </span>
                )}
              </div>
            )}

            {/* Compact Contact Info - Only show 2 most important */}
            <div className="space-y-1">
              {business.phone && (
                <div className="flex items-center gap-1.5 text-[10px]">
                  <span className="w-4 h-4 bg-blue-50 rounded flex items-center justify-center text-xs">📞</span>
                  <span className="font-medium text-gray-700 truncate">{business.phone}</span>
                </div>
              )}
              {business.address && (
                <div className="flex items-center gap-1.5 text-[10px]">
                  <span className="w-4 h-4 bg-green-50 rounded flex items-center justify-center text-xs">📍</span>
                  <span className="text-gray-600 truncate">{business.address.split(',')[0]}</span>
                </div>
              )}
            </div>

            {/* Hover Indicator - More subtle */}
            <div className="mt-2 pt-2 border-t border-gray-100 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              <span className="text-[10px] text-indigo-600 font-medium flex items-center gap-1">
                View on map
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </span>
            </div>
          </div>
        ))}
        </div>

        {/* Compact Stats Footer */}
        <div className="mt-3 bg-gradient-to-r from-indigo-50 to-blue-50 rounded-lg p-2.5 border border-indigo-100 mx-3 mb-3">
          <div className="grid grid-cols-3 gap-2 text-center">
            <div>
              <div className="text-lg font-bold text-indigo-600">{businesses.length}</div>
              <div className="text-[10px] text-gray-600">Total</div>
            </div>
            <div>
              <div className="text-lg font-bold text-orange-600">{businesses.filter(b => b.featured).length}</div>
              <div className="text-[10px] text-gray-600">Featured</div>
            </div>
            <div>
              <div className="text-lg font-bold text-red-600">{businesses.filter(b => b.veteranOwned).length}</div>
              <div className="text-[10px] text-gray-600">Veteran</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
