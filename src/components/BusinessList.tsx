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
  const featuredBusinesses = businesses.filter(b => b.featured)
  const regularBusinesses = businesses.filter(b => !b.featured)

  const BusinessCard = ({ business }: { business: Business }) => (
    <div
      className={`business-card cursor-pointer mb-3 ${
        selectedBusiness?.id === business.id ? 'ring-2 ring-primary-500' : ''
      }`}
      onClick={() => onBusinessSelect(business)}
    >
      {/* Business Header */}
      <div className="flex justify-between items-start mb-2">
        <div className="flex-1">
          {business.sponsored && (
            <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded mb-1 inline-block">
              Sponsored
            </span>
          )}
          {business.veteranOwned && (
            <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded mb-1 ml-1 inline-block">
              Veteran Owned
            </span>
          )}
          {business.isNonprofit && (
            <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded mb-1 ml-1 inline-block">
              Non-Profit
            </span>
          )}
          <h3 className="font-bold text-lg text-gray-800">{business.name}</h3>
          <p className="text-gray-600 text-sm">{business.category}</p>
        </div>
        <div className="flex items-center">
          <span className="text-yellow-500 mr-1">⭐</span>
          <span className="font-semibold">{business.rating}</span>
        </div>
      </div>

      {/* Business Description */}
      <p className="text-gray-700 text-sm mb-3 line-clamp-3">{business.description}</p>

      {/* Contact Info */}
      <div className="space-y-1 text-sm text-gray-600">
        <div className="flex items-center">
          <span className="mr-2">📍</span>
          <span>{business.address}</span>
        </div>
        <div className="flex items-center">
          <span className="mr-2">📞</span>
          <span>{business.phone}</span>
        </div>
        <div className="flex items-center">
          <span className="mr-2">🌐</span>
          <span className="text-blue-600">{business.website}</span>
        </div>
      </div>

      {/* Visit Website Button */}
      <button className="w-full mt-3 bg-primary-600 text-white py-2 rounded hover:bg-primary-700 transition-colors">
        Visit Website
      </button>
    </div>
  )

  return (
    <div className="flex-1 overflow-y-auto p-4">
      {/* Featured Businesses */}
      {featuredBusinesses.length > 0 && (
        <div className="mb-6">
          {featuredBusinesses.map((business) => (
            <BusinessCard key={business.id} business={business} />
          ))}
        </div>
      )}

      {/* Regular Businesses */}
      {regularBusinesses.length > 0 && (
        <div>
          {!featuredBusinesses.length && (
            <h3 className="text-lg font-semibold mb-3 text-gray-800">
              All Businesses ({businesses.length})
            </h3>
          )}
          {regularBusinesses.map((business) => (
            <BusinessCard key={business.id} business={business} />
          ))}
        </div>
      )}

      {businesses.length === 0 && (
        <div className="text-center text-gray-500 mt-8">
          <p>No businesses found matching your criteria.</p>
        </div>
      )}
    </div>
  )
}