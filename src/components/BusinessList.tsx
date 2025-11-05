'use client'

import React from 'react'
import { Business } from '@/types/business'

interface BusinessListProps {
  businesses: Business[]
  selectedBusiness: Business | null
  onBusinessSelect: (business: Business) => void
}

export default function BusinessList({ 
  businesses, 
  selectedBusiness, 
  onBusinessSelect 
}: BusinessListProps) {
  console.log('BusinessList received:', businesses?.length || 0, 'businesses')
  console.log('First business:', businesses?.[0])
  
  if (!businesses || businesses.length === 0) {
    return (
      <div className="flex-1 overflow-y-auto p-4">
        <div className="text-center text-gray-500 mt-8">
          <p>No businesses available.</p>
          <p className="text-xs mt-2">Check console for debugging info.</p>
        </div>
      </div>
    )
  }
  
  const featuredBusinesses = businesses.filter(b => b.featured)
  const regularBusinesses = businesses.filter(b => !b.featured)

  const BusinessCard = ({ business }: { business: Business }) => (
    <div
      className={`group cursor-pointer mb-4 transform transition-all duration-300 hover:scale-[1.02] ${
        selectedBusiness?.id === business.id 
          ? 'ring-2 ring-indigo-400 shadow-xl bg-gradient-to-br from-indigo-50 to-blue-50' 
          : 'hover:shadow-xl bg-white/80 backdrop-blur-sm border border-gray-100/50'
      }`}
      onClick={() => onBusinessSelect(business)}
    >
      <div className="relative overflow-hidden rounded-xl">
        {/* Gradient overlay for featured businesses */}
        {business.featured && (
          <div className="absolute top-0 right-0 w-0 h-0 border-l-[60px] border-l-transparent border-t-[60px] border-t-yellow-400">
            <div className="absolute -top-12 -right-1 text-white text-xs font-bold transform rotate-45">
              ⭐
            </div>
          </div>
        )}
        
        <div className="p-5">
          {/* Business Header */}
          <div className="flex justify-between items-start mb-2">
            <div className="flex-1">
              {/* Status badges */}
              <div className="flex flex-wrap gap-1 mb-2">
                {business.sponsored && (
                  <span className="bg-gradient-to-r from-indigo-500 to-blue-500 text-white text-xs px-2 py-1 rounded-full font-medium shadow-sm">
                    💎 Sponsored
                  </span>
                )}
                {business.veteranOwned && (
                  <span className="bg-gradient-to-r from-red-500 to-red-600 text-white text-xs px-2 py-1 rounded-full font-medium shadow-sm">
                    🇺🇸 Veteran
                  </span>
                )}
                {business.isNonprofit && (
                  <span className="bg-gradient-to-r from-green-500 to-emerald-500 text-white text-xs px-2 py-1 rounded-full font-medium shadow-sm">
                    🤝 Non-Profit
                  </span>
                )}
              </div>
              
              <h3 className="font-bold text-lg text-gray-900 group-hover:text-indigo-600 transition-colors leading-tight">
                {business.name}
              </h3>
              <p className="text-indigo-600 text-sm font-medium bg-indigo-50 inline-block px-2 py-1 rounded-lg leading-tight">
                {business.category}
              </p>
            </div>
            <div className="flex items-center bg-yellow-50 rounded-lg px-2 py-1">
              <span className="text-yellow-500 mr-1">⭐</span>
              <span className="font-bold text-gray-900">{business.rating || 'N/A'}</span>
            </div>
          </div>

          {/* Business Description */}
          <p className="text-gray-700 text-sm mb-3 leading-snug overflow-hidden" style={{
            display: '-webkit-box',
            WebkitLineClamp: 3,
            WebkitBoxOrient: 'vertical'
          }}>
            {business.description || 'No description available'}
          </p>

          {/* Contact Info */}
          <div className="space-y-1.5 text-sm">
            <div className="flex items-center bg-gray-50 rounded-lg p-2">
              <span className="mr-2 text-base">📍</span>
              <span className="text-gray-700 flex-1 leading-tight">{business.address || 'Address not available'}</span>
            </div>
            {business.phone && (
              <div className="flex items-center bg-blue-50 rounded-lg p-2">
                <span className="mr-2 text-base">📞</span>
                <span className="text-blue-700 font-medium leading-tight">{business.phone}</span>
              </div>
            )}
            {business.website && (
              <div className="flex items-center bg-blue-50 rounded-lg p-2">
                <span className="mr-2 text-base">🌐</span>
                <span className="text-blue-700 font-medium truncate leading-tight">{business.website}</span>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 mt-4">
            {business.website && (
              <button
                className="flex-1 bg-gradient-to-r from-indigo-500 to-blue-600 text-white py-2 px-4 rounded-lg hover:from-indigo-600 hover:to-blue-700 transition-all font-medium shadow-md hover:shadow-lg transform hover:scale-105"
                onClick={(e) => {
                  e.stopPropagation()
                  window.open(`https://${business.website.replace(/^https?:\/\//, '')}`, '_blank')
                }}
              >
                🌐 Visit Website
              </button>
            )}
            <button className="bg-gray-100 hover:bg-gray-200 text-gray-700 py-2 px-4 rounded-lg transition-all font-medium border border-gray-200 hover:border-gray-300">
              📍 View on Map
            </button>
          </div>
        </div>
      </div>
    </div>
  )

  return (
    <div className="flex-1 overflow-y-auto bg-gradient-to-b from-gray-50 to-white">
      <div className="p-4">
        {/* Featured Businesses */}
        {featuredBusinesses.length > 0 && (
          <div className="mb-8">
            <div className="flex items-center mb-4">
              <div className="bg-gradient-to-r from-yellow-400 to-orange-500 rounded-lg p-2 mr-3">
                <span className="text-white text-lg">⭐</span>
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900">Featured Businesses</h3>
                <p className="text-sm text-gray-600">Premium members & sponsored listings</p>
              </div>
            </div>
            <div className="space-y-4">
              {featuredBusinesses.map((business) => (
                <BusinessCard key={business.id} business={business} />
              ))}
            </div>
          </div>
        )}

        {/* Regular Businesses */}
        {regularBusinesses.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                <div className="bg-gradient-to-r from-indigo-500 to-blue-600 rounded-lg p-2 mr-3">
                  <span className="text-white text-lg">🏢</span>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900">
                    {featuredBusinesses.length > 0 ? 'All Businesses' : `Local Businesses`}
                  </h3>
                  <p className="text-sm text-gray-600">{businesses.length} businesses found</p>
                </div>
              </div>
              {/* Sort/Filter indicators */}
              <div className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                📍 Nearby first
              </div>
            </div>
            <div className="space-y-4">
              {regularBusinesses.map((business) => (
                <BusinessCard key={business.id} business={business} />
              ))}
            </div>
          </div>
        )}

        {/* Empty State */}
        {businesses.length === 0 && (
          <div className="text-center py-12">
            <div className="bg-gradient-to-br from-gray-100 to-gray-200 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4">
              <span className="text-3xl">🔍</span>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No businesses found</h3>
            <p className="text-gray-600 mb-4">Try adjusting your search or category filter.</p>
            <div className="text-xs text-gray-500 bg-gray-100 px-3 py-2 rounded-lg inline-block">
              💡 Check console for debugging info
            </div>
          </div>
        )}
      </div>
    </div>
  )
}